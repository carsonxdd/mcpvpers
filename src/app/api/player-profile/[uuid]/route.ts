import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Aggregator for the per-player profile page. The upstream PiStatsAPI has no
// rich single-player endpoint — `/api/players/<uuid>` only carries
// playtime/deaths/online, and every other stat (mob kills, ores, distance, xp
// levels, advancements, blocks mined) lives ONLY on the per-stat leaderboards.
// So we fan out: one summary fetch + one leaderboard fetch per stat (each gives
// the player's value AND rank), plus reputation keyed by NAME (not uuid). The
// roster is tiny (~32 players) so each leaderboard is small.
//
// Two speed tiers. Most leaderboards answer in well under a second, but
// `blocks_mined` is computed live upstream and consistently takes ~23s with no
// server-side caching. We can't let that block the whole profile, so it's split
// into a SLOW tier the page requests separately (`?part=slow`) and lazy-renders.
// Next's `revalidate` keeps the slow result warm after the first cold fetch, so
// in practice only the first visitor after a cache miss waits on it — and only
// for that one card, never the rest of the page.

const UPSTREAM = process.env.PISTATS_URL ?? 'http://stained.dathost.net:17249';

type StatDef = { key: string; label: string; stat: string };

const FAST_STATS: StatDef[] = [
  { key: 'playtime', label: 'Playtime', stat: 'playtime' },
  { key: 'mob_kills', label: 'Mob Kills', stat: 'mob_kills' },
  { key: 'ores_mined', label: 'Ores Mined', stat: 'ores_mined' },
  { key: 'distance', label: 'Distance', stat: 'distance' },
  { key: 'xp_levels', label: 'XP Levels', stat: 'xp_levels' },
  { key: 'advancements', label: 'Advancements', stat: 'advancements' },
  { key: 'deaths', label: 'Deaths', stat: 'deaths' },
];

// `blocks_mined` is real but ~23s upstream — fetched on its own slow track.
const SLOW_STATS: StatDef[] = [{ key: 'blocks_mined', label: 'Blocks Mined', stat: 'blocks_mined' }];

const FAST_TIMEOUT_MS = 5000;
const FAST_REVALIDATE = 30;
const SLOW_TIMEOUT_MS = 28000;
const SLOW_REVALIDATE = 120;

type Summary = {
  uuid: string;
  name: string;
  playtime_seconds: number;
  deaths: number;
  online: boolean;
};

type LeaderboardRow = { rank: number; uuid: string | null; name: string; value: number };

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

async function getJson<T>(path: string, timeoutMs: number, revalidate: number): Promise<T | null> {
  try {
    const res = await fetch(`${UPSTREAM}/api/${path}`, {
      signal: AbortSignal.timeout(timeoutMs),
      next: { revalidate },
    });
    if (!res.ok) return null;
    const text = await res.text();
    if (!text.trim()) return null; // empty body == no data / not computed
    const json = JSON.parse(text) as T & { error?: string };
    // The reputation context returns 200 with an { error } body for misses.
    if (json && typeof json === 'object' && 'error' in json && json.error) return null;
    return json;
  } catch {
    return null;
  }
}

// Resolve a player's value + server rank for each stat from its leaderboard.
async function resolveStats(
  uuid: string,
  defs: StatDef[],
  timeoutMs: number,
  revalidate: number,
) {
  const boards = await Promise.all(
    defs.map((s) =>
      getJson<{ players: LeaderboardRow[] }>(
        `leaderboard?stat=${encodeURIComponent(s.stat)}&limit=1000`,
        timeoutMs,
        revalidate,
      ),
    ),
  );
  return defs.map((s, i) => {
    const players = boards[i]?.players ?? [];
    const row = players.find((p) => p.uuid === uuid);
    return {
      key: s.key,
      label: s.label,
      value: row?.value ?? 0,
      rank: row?.rank ?? null,
      total: players.length,
    };
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ uuid: string }> },
) {
  const { uuid } = await params;
  const id = encodeURIComponent(uuid);
  const part = req.nextUrl.searchParams.get('part');

  // Slow track: just the heavy leaderboards (blocks_mined), requested on its own.
  if (part === 'slow') {
    const stats = await resolveStats(uuid, SLOW_STATS, SLOW_TIMEOUT_MS, SLOW_REVALIDATE);
    return NextResponse.json(
      { stats },
      {
        headers: {
          'cache-control': `public, s-maxage=${SLOW_REVALIDATE}, stale-while-revalidate=300`,
        },
      },
    );
  }

  // Fast track: summary + the quick leaderboards in parallel.
  const [summary, stats] = await Promise.all([
    getJson<Summary>(`players/${id}`, FAST_TIMEOUT_MS, FAST_REVALIDATE),
    resolveStats(uuid, FAST_STATS, FAST_TIMEOUT_MS, FAST_REVALIDATE),
  ]);

  // Reputation is keyed by name, so it waits on the resolved summary name.
  const name = summary?.name ?? null;
  const reputation = name
    ? await getJson<Reputation>(
        `reputation/player/${encodeURIComponent(name)}`,
        FAST_TIMEOUT_MS,
        FAST_REVALIDATE,
      )
    : null;

  return NextResponse.json(
    {
      uuid,
      name,
      online: summary?.online ?? false,
      found: summary != null,
      stats,
      reputation,
    },
    {
      headers: {
        'cache-control': `public, s-maxage=${FAST_REVALIDATE}, stale-while-revalidate=60`,
      },
    },
  );
}
