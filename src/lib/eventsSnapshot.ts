// Warm snapshot of the PiEvents (Boss Rush) surface, held in process memory and
// refreshed lazily with stale-while-revalidate semantics. Mirrors
// leaderboardSnapshot.ts: the /events page and the per-player profile route both
// read out of the same in-memory boards instead of re-fetching from upstream on
// each view.
//
// PiEvents data is exposed by PiStatsAPI 1.3.0+. When PiEvents isn't shipped (or
// PiStatsAPI is still 1.2.0 on prod), every /api/events/* route returns 503/404
// — getJson maps that to null and the snapshot is marked `available: false`, so
// the page and the profile section hide themselves.

const UPSTREAM = process.env.PISTATS_URL ?? 'http://stained.dathost.net:17249';
const TTL_MS = 60 * 1000; // runs are infrequent; keep the raid log reasonably fresh
const TIMEOUT_MS = 8000;
const CATEGORY_LIMIT = 25; // max the upstream /categories accepts
const RECENT_LIMIT = 25;

// The full per-player stat line — returned by every board row and the player
// endpoint, so one fetch renders a profile regardless of sort.
export type EventEntry = {
  rank: number;
  uuid: string | null;
  name: string;
  events: number;
  clears: number;
  total_damage: number;
  total_boss_damage: number;
  total_damage_taken: number;
  total_healing: number;
  total_adds: number;
  total_score: number;
  best_score: number;
  total_lives_lost: number;
  survivals: number;
  total_money: number;
  best_pit: number; // highest Pit level cleared (1.5.0+; 0 on old data)
  pit_clears: number; // count of Pit-level clears
};

export type EventRun = {
  id: number; // run detail key (/events/run/{id})
  mode: string; // BOSS_RUSH | TDM | FFA
  cleared: boolean;
  players: number;
  wave: number; // 0 for TDM/FFA rows
  difficulty: number; // Pit keystone level; 0 = base / pre-Pit / PvP rows
  raid: string | null; // raid key (Boss Rush rows; null for PvP / pre-tracking)
  duration_ms: number; // 0 on pre-tracking rows
  winner: string | null; // PvP only (team color / FFA name; null on draw / BR)
  mvp: string | null; // BR top scorer / PvP top killer; null on pre-tracking
  ended_at: number; // epoch millis
};

export type EventSummary = {
  total_runs: number;
  total_clears: number;
  clear_rate: number;
  total_paid_out: number;
  unique_participants: number;
  last_run_ts: number;
  // 1.5.0+: total_runs/total_clears now count ALL modes (incl. PvP). Use the
  // boss_* fields for the Boss Rush banner. Absent on older upstreams.
  boss_runs?: number;
  boss_clears?: number;
  pvp_matches?: number;
  pitforged_drops?: number;
};

export type EventsSnapshot = {
  available: boolean; // false when upstream is unreachable / PiEvents not shipped
  categories: Record<string, EventEntry[]>; // score|damage|boss_damage|tank|support|adds|clears
  summary: EventSummary | null;
  recent: EventRun[];
  updatedAt: number;
};

const EMPTY: EventsSnapshot = {
  available: false,
  categories: {},
  summary: null,
  recent: [],
  updatedAt: 0,
};

let cache: EventsSnapshot | null = null;
let refreshing = false;

async function getJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${UPSTREAM}/api/${path}`, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: 'no-store', // the in-memory snapshot is the cache; always fetch fresh
    });
    if (!res.ok) return null; // 503 (no PiEvents data) / 404 (old PiStatsAPI) / etc.
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
    const [cats, summary, recent] = await Promise.all([
      getJson<{ categories: Record<string, EventEntry[]> }>(
        `events/categories?limit=${CATEGORY_LIMIT}`,
      ),
      getJson<EventSummary>('events/summary'),
      getJson<{ runs: EventRun[] }>(`events/recent?limit=${RECENT_LIMIT}`),
    ]);
    // Reachable if any endpoint answered with valid JSON. An available-but-empty
    // server (0 runs at launch) still counts as available → the page shows its
    // "no runs yet" state rather than the "not live yet" state.
    const available = cats != null || summary != null || recent != null;
    cache = {
      available,
      categories: cats?.categories ?? {},
      summary: summary ?? null,
      recent: Array.isArray(recent?.runs) ? recent.runs : [],
      updatedAt: Date.now(),
    };
  } finally {
    refreshing = false;
  }
}

// Returns the warm snapshot, refreshing on a cold start (awaited) or in the
// background when stale (serves the existing snapshot immediately).
export async function getEventsSnapshot(): Promise<EventsSnapshot> {
  if (!cache) {
    await refresh();
  } else if (Date.now() - cache.updatedAt > TTL_MS && !refreshing) {
    void refresh();
  }
  return cache ?? EMPTY;
}

// Find a player's row (with rank) within a named role board.
export function eventRowFor(
  snapshot: EventsSnapshot,
  boardKey: string,
  uuid: string,
): EventEntry | undefined {
  return snapshot.categories[boardKey]?.find((e) => e.uuid === uuid);
}
