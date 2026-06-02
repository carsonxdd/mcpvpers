import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
// Module-level snapshot must survive across requests in the long-lived process,
// so the route can't be statically optimized.
export const dynamic = 'force-dynamic';

// Warm snapshot of every leaderboard tab, held in process memory and refreshed
// lazily with stale-while-revalidate semantics. Visitors always read the cached
// snapshot instantly; the upstream PiStatsAPI is only ever hit by a background
// refresh. This exists because `blocks_mined` is computed live upstream and
// takes ~21s every call (everything else is sub-second) — far too slow to sit on
// a visitor's critical path. Here it's fetched off to the side with a long
// timeout and merged into the snapshot when it lands, while the fast tabs answer
// immediately. The whole snapshot is also edge-cached (s-maxage) so most hits
// never even reach this process.

const UPSTREAM = process.env.PISTATS_URL ?? 'http://stained.dathost.net:17249';
const TTL_MS = 3 * 60 * 1000; // refresh in the background once the snapshot is older than this
const FAST_TIMEOUT_MS = 8000;
const SLOW_TIMEOUT_MS = 28000;

type Entry = {
  rank: number;
  uuid: string | null;
  name: string;
  value: number;
  tier?: string;
  commendations?: number;
};

// Fetch the full roster per board so the page can paginate client-side. The
// regular stat boards honor `limit` (returns up to the whole roster); the
// reputation boards (peaceful/violence/lawmen) are hard-capped at 10 upstream —
// `limit` is ignored there — so those tabs max out at 10 until the plugin lifts
// the cap.
const ROSTER_LIMIT = 1000;

// key = the tab key the leaderboards page selects on.
const FAST_BOARDS: { key: string; path: string }[] = [
  { key: 'playtime:all', path: `leaderboard?stat=playtime&window=all&limit=${ROSTER_LIMIT}` },
  { key: 'playtime:month', path: `leaderboard?stat=playtime&window=month&limit=${ROSTER_LIMIT}` },
  { key: 'playtime:week', path: `leaderboard?stat=playtime&window=week&limit=${ROSTER_LIMIT}` },
  { key: 'deaths', path: `leaderboard?stat=deaths&limit=${ROSTER_LIMIT}` },
  { key: 'mob_kills', path: `leaderboard?stat=mob_kills&limit=${ROSTER_LIMIT}` },
  { key: 'ores_mined', path: `leaderboard?stat=ores_mined&limit=${ROSTER_LIMIT}` },
  { key: 'distance', path: `leaderboard?stat=distance&limit=${ROSTER_LIMIT}` },
  { key: 'advancements', path: `leaderboard?stat=advancements&limit=${ROSTER_LIMIT}` },
  { key: 'xp_levels', path: `leaderboard?stat=xp_levels&limit=${ROSTER_LIMIT}` },
  { key: 'peaceful_rep', path: 'reputation/leaderboard/peaceful' },
  { key: 'violence_rep', path: 'reputation/leaderboard/violence' },
  { key: 'lawmen', path: 'reputation/leaderboard/lawmen' },
];

const SLOW_BOARD = { key: 'blocks_mined', path: `leaderboard?stat=blocks_mined&limit=${ROSTER_LIMIT}` };

type Snapshot = { boards: Record<string, Entry[]>; updatedAt: number };

let cache: Snapshot | null = null;
let refreshing = false;
let blocksRefreshing = false;

async function getJson<T>(path: string, timeoutMs: number): Promise<T | null> {
  try {
    const res = await fetch(`${UPSTREAM}/api/${path}`, {
      signal: AbortSignal.timeout(timeoutMs),
      cache: 'no-store', // the in-memory snapshot is the cache; always fetch fresh upstream
    });
    if (!res.ok) return null;
    const text = await res.text();
    if (!text.trim()) return null; // empty body == not computed / no data
    const json = JSON.parse(text) as T & { error?: string };
    if (json && typeof json === 'object' && 'error' in json && json.error) return null;
    return json;
  } catch {
    return null;
  }
}

async function fetchBoard(path: string, timeoutMs: number): Promise<Entry[]> {
  const json = await getJson<{ players?: Entry[] }>(path, timeoutMs);
  return Array.isArray(json?.players) ? json.players : [];
}

// The outlaw-rep tab has no global leaderboard endpoint; it's derived from the
// wanted board (already ranked by outlaw_rep descending), mirroring the page's
// original mapping.
async function fetchOutlaw(timeoutMs: number): Promise<Entry[]> {
  const json = await getJson<{
    wanted?: { uuid: string | null; name: string; outlaw_rep: number; tier: string }[];
  }>('reputation/wanted', timeoutMs);
  const wanted = json?.wanted;
  if (!Array.isArray(wanted)) return [];
  return wanted.slice(0, 100).map((o, i) => ({
    rank: i + 1,
    uuid: o.uuid ?? null,
    name: o.name,
    value: o.outlaw_rep,
    tier: o.tier,
  }));
}

// Slow track: refresh blocks_mined off the critical path. Only overwrites the
// cached board when it actually returns data, so a timeout never blanks it.
async function refreshBlocks(): Promise<void> {
  if (blocksRefreshing) return;
  blocksRefreshing = true;
  try {
    const rows = await fetchBoard(SLOW_BOARD.path, SLOW_TIMEOUT_MS);
    if (rows.length && cache) cache.boards[SLOW_BOARD.key] = rows;
  } finally {
    blocksRefreshing = false;
  }
}

async function refresh(): Promise<void> {
  if (refreshing) return;
  refreshing = true;
  try {
    const [fast, outlaw] = await Promise.all([
      Promise.all(
        FAST_BOARDS.map((b) =>
          fetchBoard(b.path, FAST_TIMEOUT_MS).then((rows): [string, Entry[]] => [b.key, rows]),
        ),
      ),
      fetchOutlaw(FAST_TIMEOUT_MS),
    ]);
    const boards: Record<string, Entry[]> = { ...(cache?.boards ?? {}) };
    for (const [key, rows] of fast) boards[key] = rows;
    boards.outlaw_rep = outlaw;
    cache = { boards, updatedAt: Date.now() };
  } finally {
    refreshing = false;
  }
  // Kick the slow board after the fast snapshot is live (fire-and-forget).
  void refreshBlocks();
}

export async function GET() {
  if (!cache) {
    // Cold (e.g. just after a restart): wait on the fast boards only (~0.5s).
    await refresh();
  } else if (Date.now() - cache.updatedAt > TTL_MS && !refreshing) {
    // Stale: serve the existing snapshot now, refresh in the background.
    void refresh();
  }

  return NextResponse.json(
    { updatedAt: cache?.updatedAt ?? 0, boards: cache?.boards ?? {} },
    {
      headers: {
        'cache-control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    },
  );
}
