import { NextRequest, NextResponse } from 'next/server';
import { getSnapshot, rowFor } from '@/lib/leaderboardSnapshot';

export const runtime = 'nodejs';

// Per-player profile aggregator. The upstream PiStatsAPI has no rich single-
// player endpoint, and every stat (mob kills, ores, distance, xp, advancements,
// blocks mined) lives only on the leaderboards. Rather than re-fetch all of
// those from upstream on every profile view (slow, and prone to timing out under
// load), we read the player's value+rank straight out of the shared warm
// snapshot (full roster, refreshed in the background, blocks_mined included).
// That leaves just two quick upstream calls: the roster (for online status +
// username→uuid resolution) and reputation (keyed by name).

const UPSTREAM = process.env.PISTATS_URL ?? 'http://stained.dathost.net:17249';
const TIMEOUT_MS = 5000;
const REVALIDATE = 30;

const UUID_RE = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

// Each profile stat → the snapshot board it's resolved from.
const PROFILE_STATS: { key: string; label: string; board: string }[] = [
  { key: 'playtime', label: 'Playtime', board: 'playtime:all' },
  { key: 'blocks_mined', label: 'Blocks Mined', board: 'blocks_mined' },
  { key: 'mob_kills', label: 'Mob Kills', board: 'mob_kills' },
  { key: 'ores_mined', label: 'Ores Mined', board: 'ores_mined' },
  { key: 'distance', label: 'Distance', board: 'distance' },
  { key: 'xp_levels', label: 'XP Levels', board: 'xp_levels' },
  { key: 'advancements', label: 'Advancements', board: 'advancements' },
  { key: 'deaths', label: 'Deaths', board: 'deaths' },
];

type PlayerRow = {
  uuid: string;
  name: string;
  online: boolean;
  playtime_seconds: number;
  deaths: number;
};

type Reputation = {
  name: string;
  state: string;
  outlaw_rep: number;
  peaceful_rep: number;
  violence_rep: number;
  unique_commenders_90d: number;
  play_seconds: number;
  last_seen_ts: number;
  outlaw_tier: string;
};

async function getJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${UPSTREAM}/api/${path}`, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) return null;
    const text = await res.text();
    if (!text.trim()) return null;
    const json = JSON.parse(text) as T & { error?: string };
    if (json && typeof json === 'object' && 'error' in json && json.error) return null;
    return json;
  } catch {
    return null;
  }
}

const emptyStats = () =>
  PROFILE_STATS.map((s) => ({ key: s.key, label: s.label, value: 0, rank: null, total: 0 }));

const headers = {
  'cache-control': `public, s-maxage=${REVALIDATE}, stale-while-revalidate=60`,
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ uuid: string }> },
) {
  const { uuid: idOrName } = await params;

  // Roster (online + name↔uuid) and the warm snapshot in parallel.
  const [roster, snapshot] = await Promise.all([
    getJson<PlayerRow[]>('players'),
    getSnapshot(),
  ]);

  const players = Array.isArray(roster) ? roster : [];
  const lower = idOrName.toLowerCase();
  const player = UUID_RE.test(idOrName)
    ? players.find((p) => p.uuid?.toLowerCase() === lower)
    : players.find((p) => p.name?.toLowerCase() === lower);

  if (!player) {
    return NextResponse.json(
      { uuid: null, name: null, online: false, found: false, stats: emptyStats(), reputation: null, skillRanks: {} },
      { headers },
    );
  }

  const uuid = player.uuid;

  // Stat value + server rank pulled from the shared snapshot — no per-view
  // leaderboard fetches.
  const stats = PROFILE_STATS.map((s) => {
    const board = snapshot.boards[s.board] ?? [];
    const row = rowFor(snapshot, s.board, uuid);
    return {
      key: s.key,
      label: s.label,
      value: row?.value ?? 0,
      rank: row?.rank ?? null,
      total: board.length,
    };
  });

  // Per-skill server rank, plus the aggregated power level, pulled from the
  // website-built skill boards in the snapshot (upstream has no per-skill
  // leaderboard). Map: skill enum (e.g. "MINING") or "POWER_LEVEL" -> rank/total.
  const skillRanks: Record<string, { rank: number; total: number }> = {};
  for (const [key, rows] of Object.entries(snapshot.boards)) {
    if (!key.startsWith('skill:')) continue;
    const row = rows.find((e) => e.uuid === uuid);
    if (row) skillRanks[key.slice('skill:'.length)] = { rank: row.rank, total: rows.length };
  }
  const powerBoard = snapshot.boards.power_level ?? [];
  const powerRow = rowFor(snapshot, 'power_level', uuid);
  if (powerRow) skillRanks.POWER_LEVEL = { rank: powerRow.rank, total: powerBoard.length };

  const reputation = await getJson<Reputation>(
    `reputation/player/${encodeURIComponent(player.name)}`,
  );

  // Commendations: value comes from the player's own reputation (authoritative),
  // rank from the website-built commendations board in the snapshot.
  const commBoard = snapshot.boards.commendations ?? [];
  const commRow = rowFor(snapshot, 'commendations', uuid);
  stats.push({
    key: 'commendations',
    label: 'Commendations',
    value: reputation?.unique_commenders_90d ?? commRow?.value ?? 0,
    rank: commRow?.rank ?? null,
    total: commBoard.length,
  });

  return NextResponse.json(
    {
      uuid,
      name: player.name,
      online: player.online,
      found: true,
      stats,
      reputation,
      skillRanks,
    },
    { headers },
  );
}
