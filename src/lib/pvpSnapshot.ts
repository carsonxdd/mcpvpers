// Warm snapshot of the PiEvents PvP surface (TDM/FFA), held in process memory and
// refreshed lazily with stale-while-revalidate semantics. Mirrors
// eventsSnapshot.ts: the /events/pvp page reads out of the same in-memory boards
// instead of re-fetching from upstream on each view.
//
// PvP data is exposed by PiStatsAPI 1.4.0+. Every /api/events/pvp/* route returns
// 503 ("PvP data not available") until the PiEvents build that creates the
// pvp_totals table has booted once on that server — getJson maps that (and any
// other non-2xx) to null, and the snapshot is marked `available: false`, so the
// page hides its live boards.

const UPSTREAM = process.env.PISTATS_URL ?? 'http://stained.dathost.net:17249';
const TTL_MS = 60 * 1000; // matches run infrequently; keep the boards reasonably fresh
const TIMEOUT_MS = 8000;
const BOARD_LIMIT = 25;
const RECENT_LIMIT = 25;

// The boards we surface, in display order. `field` is the column rendered for each.
export const PVP_BOARDS = ['wins', 'kills', 'kd', 'streak', 'mvps', 'matches', 'earnings'] as const;
export type PvpStat = (typeof PVP_BOARDS)[number];

// One full leaderboard row — every board returns this same shape, so a single
// row renders any board regardless of which stat it was sorted by.
export type PvpEntry = {
  rank: number;
  uuid: string | null;
  name: string;
  matches: number;
  wins: number;
  kills: number;
  deaths: number;
  kd: number;
  total_money: number;
  best_killstreak: number; // 1.5.0+
  mvps: number; // 1.5.0+
};

export type PvpMatch = {
  id: number; // run detail key (/events/run/{id})
  mode: string; // TDM | FFA
  decided: boolean; // false = draw
  players: number;
  duration_ms: number; // 0 on pre-tracking rows
  winner: string | null; // team color (TDM) / player name (FFA); null on draw
  mvp: string | null; // top killer; null on pre-tracking
  ended_at: number; // epoch millis
};

export type PvpSnapshot = {
  available: boolean; // false when upstream is unreachable / PvP not shipped (503)
  boards: Record<string, PvpEntry[]>; // keyed by PvpStat
  recent: PvpMatch[];
  updatedAt: number;
};

const EMPTY: PvpSnapshot = {
  available: false,
  boards: {},
  recent: [],
  updatedAt: 0,
};

let cache: PvpSnapshot | null = null;
let refreshing = false;

async function getJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${UPSTREAM}/api/${path}`, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: 'no-store', // the in-memory snapshot is the cache; always fetch fresh
    });
    if (!res.ok) return null; // 503 (no PvP data) / 404 (old PiStatsAPI) / etc.
    const text = await res.text();
    if (!text.trim()) return null;
    const json = JSON.parse(text) as T & { error?: string };
    if (json && typeof json === 'object' && 'error' in json && json.error) return null;
    return json;
  } catch {
    return null;
  }
}

async function refresh(): Promise<void> {
  if (refreshing) return;
  refreshing = true;
  try {
    const [boardResults, recent] = await Promise.all([
      Promise.all(
        PVP_BOARDS.map((stat) =>
          getJson<{ stat: string; players: PvpEntry[] }>(
            `events/pvp/leaderboard?stat=${stat}&limit=${BOARD_LIMIT}`,
          ),
        ),
      ),
      getJson<{ matches: PvpMatch[] }>(`events/pvp/recent?limit=${RECENT_LIMIT}`),
    ]);

    const boards: Record<string, PvpEntry[]> = {};
    PVP_BOARDS.forEach((stat, i) => {
      const players = boardResults[i]?.players;
      if (Array.isArray(players)) boards[stat] = players;
    });

    // Reachable if any board or the recent feed answered with valid JSON. An
    // available-but-empty server (PvP shipped, no matches yet) still counts as
    // available → the page shows its "no matches yet" state, not "not live yet".
    const available = boardResults.some((b) => b != null) || recent != null;
    cache = {
      available,
      boards,
      recent: Array.isArray(recent?.matches) ? recent.matches : [],
      updatedAt: Date.now(),
    };
  } finally {
    refreshing = false;
  }
}

// Returns the warm snapshot, refreshing on a cold start (awaited) or in the
// background when stale (serves the existing snapshot immediately).
export async function getPvpSnapshot(): Promise<PvpSnapshot> {
  if (!cache) {
    await refresh();
  } else if (Date.now() - cache.updatedAt > TTL_MS && !refreshing) {
    void refresh();
  }
  return cache ?? EMPTY;
}
