import { NextRequest, NextResponse } from 'next/server';
import { getSnapshot, rowFor } from '@/lib/leaderboardSnapshot';
import { getEventsSnapshot, eventRowFor, type EventEntry } from '@/lib/eventsSnapshot';
import { getPvpSnapshot, pvpRowFor, PVP_BOARDS } from '@/lib/pvpSnapshot';

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
  { key: 'balance', label: 'Balance', board: 'balance' },
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
  // Daily login streak (PiStatsAPI 1.8.0+) — absent on older builds. The object
  // is passed through to the client untouched, so these are type-parity only.
  daily_reward_streak?: number;
  best_daily_reward_streak?: number;
  streak_active?: boolean;
  claimed_today?: boolean;
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

  // Roster (online + name↔uuid) and all three warm snapshots in parallel.
  const [roster, snapshot, eventsSnapshot, pvpSnapshot] = await Promise.all([
    getJson<PlayerRow[]>('players'),
    getSnapshot(),
    getEventsSnapshot(),
    getPvpSnapshot(),
  ]);

  const players = Array.isArray(roster) ? roster : [];
  const lower = idOrName.toLowerCase();
  const byUuid = UUID_RE.test(idOrName);
  let player = byUuid
    ? players.find((p) => p.uuid?.toLowerCase() === lower)
    : players.find((p) => p.name?.toLowerCase() === lower);

  // Roster fallback: the /players call can flake (5s timeout) or lag behind the
  // boards. Every clickable leaderboard row comes from a snapshot board, so
  // resolve name↔uuid from those before declaring the player unknown — the
  // profile then renders identically no matter which board they were clicked
  // from. Online status is unknowable on this path; default to offline.
  if (!player) {
    for (const rows of Object.values(snapshot.boards)) {
      const row = byUuid
        ? rows.find((e) => e.uuid?.toLowerCase() === lower)
        : rows.find((e) => e.name?.toLowerCase() === lower);
      if (row?.uuid) {
        player = { uuid: row.uuid, name: row.name, online: false, playtime_seconds: 0, deaths: 0 };
        break;
      }
    }
  }

  if (!player) {
    return NextResponse.json(
      { uuid: null, name: null, online: false, found: false, stats: emptyStats(), reputation: null, skillRanks: {}, skillsFallback: null, events: null, eventRanks: {}, eventsAvailable: false, pvp: null, pvpRanks: {}, pvpAvailable: false, marketListings: [] },
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
  // Snapshot-derived skill levels, doubling as a fallback for the client's live
  // /skills call (which can 429 under the upstream rate limiter). XP progress
  // isn't in the boards, so the page only uses this when the live call fails.
  const fallbackSkills: { skill: string; level: number }[] = [];
  for (const [key, rows] of Object.entries(snapshot.boards)) {
    if (!key.startsWith('skill:')) continue;
    const row = rows.find((e) => e.uuid === uuid);
    if (row) {
      const skill = key.slice('skill:'.length);
      skillRanks[skill] = { rank: row.rank, total: rows.length };
      fallbackSkills.push({ skill, level: row.value });
    }
  }
  const powerBoard = snapshot.boards.power_level ?? [];
  const powerRow = rowFor(snapshot, 'power_level', uuid);
  if (powerRow) skillRanks.POWER_LEVEL = { rank: powerRow.rank, total: powerBoard.length };
  const skillsFallback =
    fallbackSkills.length > 0
      ? { power_level: powerRow?.value ?? 0, skills: fallbackSkills }
      : null;

  const reputation = await getJson<Reputation>(
    `reputation/player/${encodeURIComponent(player.name)}`,
  );

  // Boss Rush (PiEvents). The player endpoint returns the authoritative full
  // stat line + recent payouts even when the player is outside any board's
  // top-25; the per-role ranks come from the events snapshot's role boards (only
  // present when they rank top-25). Both degrade to null/empty when PiEvents
  // isn't live upstream, and the profile page hides the section.
  type EventPlayer = EventEntry & {
    recent_payouts?: { money: number; reason: string; at: number }[];
    // 1.5.0+: empty arrays on pre-tracking data — the profile guards on length.
    recent_runs?: {
      id: number;
      raid: string | null;
      cleared: boolean;
      wave: number;
      difficulty: number;
      duration_ms: number;
      gear_mode?: string | null; // 1.7.0+; null on pre-feature rows (kit-era)
      score: number;
      damage: number;
      money: number;
      ended_at: number;
    }[];
    recent_loot?: { item: string; tier: string; at: number }[];
  };
  // PvP profile (TDM/FFA). 503 until pvp_totals exists / 404 if the player never
  // fought a match — getJson maps both to null and the page hides the PvP section.
  type PvpPlayer = {
    uuid: string;
    name: string;
    matches: number;
    wins: number;
    kills: number;
    deaths: number;
    kd: number;
    total_money: number;
    best_killstreak: number;
    mvps: number;
    recent_matches?: {
      id: number;
      mode: string;
      decided: boolean;
      winner: string | null;
      mvp: string | null;
      team: string | null;
      gear_mode?: string | null; // 1.7.0+; null on pre-feature rows (kit-era)
      kills: number;
      deaths: number;
      money: number;
      duration_ms: number;
      ended_at: number;
    }[];
  };
  // Active player-market listings (PiShop). The upstream /shop/market endpoint
  // is global; we filter to this player's listings by seller name. 404/503
  // pre-ship → null → empty array, and the profile section hides itself.
  type MarketListing = {
    seller: string;
    material: string;
    amount: number;
    custom_name: string | null;
    enchanted: boolean;
    price: number;
    listed_ms: number;
    expires_ms: number;
  };
  // Each surface gates on its own snapshot — PvP can be live while Boss Rush
  // data is unreachable (and vice versa); one being down shouldn't hide the other.
  const [events, pvp, market] = await Promise.all([
    eventsSnapshot.available
      ? getJson<EventPlayer>(`events/player/${encodeURIComponent(player.name)}`)
      : null,
    pvpSnapshot.available
      ? getJson<PvpPlayer>(`events/pvp/player/${encodeURIComponent(player.name)}`)
      : null,
    getJson<{ listings: MarketListing[] }>('shop/market'),
  ]);
  const nameLower = player.name.toLowerCase();
  const marketListings = Array.isArray(market?.listings)
    ? market.listings.filter((l) => l.seller?.toLowerCase() === nameLower)
    : [];
  const ROLE_BOARDS = ['score', 'damage', 'boss_damage', 'tank', 'support', 'adds', 'clears'];
  const eventRanks: Record<string, { rank: number; total: number }> = {};
  for (const boardKey of ROLE_BOARDS) {
    const row = eventRowFor(eventsSnapshot, boardKey, uuid);
    const total = eventsSnapshot.categories[boardKey]?.length ?? 0;
    if (row && total > 0) eventRanks[boardKey] = { rank: row.rank, total };
  }

  // PvP server ranks, mirrored from the PvP snapshot's boards (wins | kills |
  // kd | streak | mvps | matches | earnings). Top-25 boards: a player outside
  // the cut simply has no rank entry, same as the events role boards.
  const pvpRanks: Record<string, { rank: number; total: number }> = {};
  for (const boardKey of PVP_BOARDS) {
    const row = pvpRowFor(pvpSnapshot, boardKey, uuid);
    const total = pvpSnapshot.boards[boardKey]?.length ?? 0;
    if (row && total > 0) pvpRanks[boardKey] = { rank: row.rank, total };
  }

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
      skillsFallback,
      events,
      eventRanks,
      // Surface-availability flags: true means the upstream is live, so the
      // profile can render a zeroed section for players with no data yet
      // (events/pvp are null when the player never joined a run/match).
      eventsAvailable: eventsSnapshot.available,
      pvp,
      pvpRanks,
      pvpAvailable: pvpSnapshot.available,
      marketListings,
    },
    { headers },
  );
}
