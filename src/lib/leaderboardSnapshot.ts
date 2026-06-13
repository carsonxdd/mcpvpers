// Warm snapshot of every leaderboard tab, held in process memory and refreshed
// lazily with stale-while-revalidate semantics. Shared by the leaderboards
// snapshot route AND the per-player profile route, so a profile reads a player's
// value+rank out of the same in-memory boards instead of re-fetching every
// leaderboard from the upstream on each view.
//
// `blocks_mined` is computed live upstream and takes ~21s every call (everything
// else is sub-second), so it's fetched off the critical path on a slow track and
// merged into the snapshot when it lands.

const UPSTREAM = process.env.PISTATS_URL ?? 'http://stained.dathost.net:17249';
const TTL_MS = 3 * 60 * 1000; // refresh in the background once older than this
const FAST_TIMEOUT_MS = 8000;
// blocks_mined is computed live and grows with the world (~22s and climbing on
// DatHost); keep headroom over it so a slightly slow call doesn't blank the board.
const SLOW_TIMEOUT_MS = 40000;
const ROSTER_LIMIT = 1000; // pull the full roster so callers can rank/paginate

export type Entry = {
  rank: number;
  uuid: string | null;
  name: string;
  value: number;
  tier?: string;
  commendations?: number;
};

export type Snapshot = { boards: Record<string, Entry[]>; updatedAt: number };

// key = the tab key the leaderboards page selects on, also reused by profiles.
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
  { key: 'power_level', path: `leaderboard?stat=power_level&limit=${ROSTER_LIMIT}` },
  // EssentialsX baltop (PiStatsAPI 1.12.0+) — 404 until it ships to DatHost,
  // which getJson maps to an empty board.
  { key: 'balance', path: `economy/baltop?limit=${ROSTER_LIMIT}` },
  { key: 'peaceful_rep', path: 'reputation/leaderboard/peaceful' },
  { key: 'violence_rep', path: 'reputation/leaderboard/violence' },
  { key: 'lawmen', path: 'reputation/leaderboard/lawmen' },
];

const SLOW_BOARD = { key: 'blocks_mined', path: `leaderboard?stat=blocks_mined&limit=${ROSTER_LIMIT}` };

let cache: Snapshot | null = null;
let refreshing = false;
let blocksRefreshing = false;
let rosterBoardsRefreshing = false;

// The upstream rate-limits bursts (429s), so roster-sized fan-outs must
// trickle through a few at a time instead of firing the whole roster at once.
const FANOUT_CONCURRENCY = 4;

async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  });
  await Promise.all(workers);
  return results;
}

async function getJson<T>(path: string, timeoutMs: number): Promise<T | null> {
  try {
    const res = await fetch(`${UPSTREAM}/api/${path}`, {
      signal: AbortSignal.timeout(timeoutMs),
      cache: 'no-store', // the in-memory snapshot is the cache; always fetch fresh
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

async function fetchBoard(path: string, timeoutMs: number): Promise<Entry[]> {
  const json = await getJson<{ players?: Entry[] }>(path, timeoutMs);
  return Array.isArray(json?.players) ? json.players : [];
}

// Broad event boards for the main leaderboards page (the granular role boards
// stay on the /events/* tabs). These live under events/... and return a
// different JSON shape than a plain leaderboard?stat= call, so they're
// synthesized here like outlaw_rep / commendations rather than in FAST_BOARDS.
// 503/empty on a server without PiEvents (DatHost today) → []. The page just
// shows "No players yet." until PiEvents + PiStatsAPI 1.7.0 ship to DatHost.
//
// ⚠️ Field names verified against the events handoff, not yet against a live
// host (DatHost 404s on /api/events/* today). Boss Rush rows expose
// `total_score`, PvP rows expose `wins`. If the live shape differs, adjust the
// valueKey here — the rest of the snapshot is unaffected.
async function fetchEventBoard(path: string, valueKey: string, timeoutMs: number): Promise<Entry[]> {
  const json = await getJson<{ players?: Record<string, unknown>[] }>(path, timeoutMs);
  const rows = Array.isArray(json?.players) ? json.players : [];
  return rows.map((r, i) => ({
    rank: (r.rank as number) ?? i + 1,
    uuid: (r.uuid as string) ?? null,
    name: (r.name as string) ?? '',
    value: Number(r[valueKey] ?? 0),
  }));
}

// The outlaw-rep board has no global endpoint; derive it from the wanted board
// (already ranked by outlaw_rep descending).
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

// Commendations has no upstream leaderboard endpoint, so build one by fanning
// out per-player reputation across the roster and ranking by unique commenders
// in the last 90 days. One call per roster player — fine at this scale; a real
// plugin endpoint would be the move if the roster ever gets large.
async function fetchCommendations(
  roster: { uuid: string; name: string }[],
  timeoutMs: number,
): Promise<Entry[]> {
  const rows = await mapLimit(roster, FANOUT_CONCURRENCY, (p) =>
    getJson<{ unique_commenders_90d?: number }>(
      `reputation/player/${encodeURIComponent(p.name)}`,
      timeoutMs,
    ).then((rep) => ({ uuid: p.uuid, name: p.name, value: rep?.unique_commenders_90d ?? 0 })),
  );
  return rows
    .filter((r) => r.value > 0)
    .sort((a, b) => b.value - a.value)
    .map((r, i) => ({ rank: i + 1, uuid: r.uuid, name: r.name, value: r.value }));
}

// Per-skill leaderboards. The upstream has no per-skill board (only the
// aggregated power_level), so build one per mcMMO skill by fanning out the
// roster's /skills endpoint — same shape and scale as the commendations board
// (one call per roster player). Each board is keyed `skill:<SKILL_ENUM>` (e.g.
// `skill:MINING`) and ranks all roster players by that skill's level descending,
// so a profile can read its "#N of <roster size>" straight out of the snapshot.
async function fetchSkillBoards(
  roster: { uuid: string; name: string }[],
  timeoutMs: number,
): Promise<Record<string, Entry[]>> {
  const perPlayer = await mapLimit(roster, FANOUT_CONCURRENCY, (p) =>
    getJson<{ skills?: { skill: string; level: number }[] }>(
      `players/${encodeURIComponent(p.uuid)}/skills`,
      timeoutMs,
    ).then((s) => ({ uuid: p.uuid, name: p.name, skills: s?.skills ?? [] })),
  );
  const bySkill = new Map<string, { uuid: string; name: string; level: number }[]>();
  for (const player of perPlayer) {
    for (const sk of player.skills) {
      const rows = bySkill.get(sk.skill) ?? [];
      rows.push({ uuid: player.uuid, name: player.name, level: sk.level });
      bySkill.set(sk.skill, rows);
    }
  }
  const boards: Record<string, Entry[]> = {};
  for (const [skill, rows] of bySkill) {
    boards[`skill:${skill}`] = rows
      .sort((a, b) => b.level - a.level)
      .map((r, i) => ({ rank: i + 1, uuid: r.uuid, name: r.name, value: r.level }));
  }
  return boards;
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

// Background track for the roster-sized fan-outs (commendations + per-skill
// boards). They run sequentially with bounded concurrency — fired together with
// the old unbounded Promise.all they tripped the upstream's rate limiter
// (~80-call burst → 429s on everything, including profile views). Only
// overwrites the cached boards on real data, so a rate-limited pass never
// blanks them.
async function refreshRosterBoards(): Promise<void> {
  if (rosterBoardsRefreshing) return;
  rosterBoardsRefreshing = true;
  try {
    const roster = await getJson<{ uuid: string; name: string }[]>('players', FAST_TIMEOUT_MS);
    if (!Array.isArray(roster) || roster.length === 0) return;
    const commendations = await fetchCommendations(roster, FAST_TIMEOUT_MS);
    if (commendations.length && cache) cache.boards.commendations = commendations;
    const skillBoards = await fetchSkillBoards(roster, FAST_TIMEOUT_MS);
    if (Object.keys(skillBoards).length && cache) Object.assign(cache.boards, skillBoards);
  } finally {
    rosterBoardsRefreshing = false;
  }
}

async function refresh(): Promise<void> {
  if (refreshing) return;
  refreshing = true;
  try {
    const [fast, outlaw, eventScore, pvpWins] = await Promise.all([
      Promise.all(
        FAST_BOARDS.map((b) =>
          fetchBoard(b.path, FAST_TIMEOUT_MS).then((rows): [string, Entry[]] => [b.key, rows]),
        ),
      ),
      fetchOutlaw(FAST_TIMEOUT_MS),
      fetchEventBoard(`events/leaderboard?stat=score&limit=${ROSTER_LIMIT}`, 'total_score', FAST_TIMEOUT_MS),
      fetchEventBoard(`events/pvp/leaderboard?stat=wins&limit=${ROSTER_LIMIT}`, 'wins', FAST_TIMEOUT_MS),
    ]);
    const boards: Record<string, Entry[]> = { ...(cache?.boards ?? {}) };
    for (const [key, rows] of fast) boards[key] = rows;
    boards.outlaw_rep = outlaw;
    boards.event_score = eventScore;
    boards.pvp_wins = pvpWins;
    cache = { boards, updatedAt: Date.now() };
  } finally {
    refreshing = false;
  }
  void refreshBlocks();
  void refreshRosterBoards();
}

// Returns the warm snapshot, refreshing on a cold start (awaited, ~0.5s) or in
// the background when stale (serves the existing snapshot immediately).
export async function getSnapshot(): Promise<Snapshot> {
  if (!cache) {
    await refresh();
  } else if (Date.now() - cache.updatedAt > TTL_MS && !refreshing) {
    void refresh();
  }
  return cache ?? { boards: {}, updatedAt: 0 };
}

// Find a player's row (value + rank) within a named board.
export function rowFor(snapshot: Snapshot, boardKey: string, uuid: string): Entry | undefined {
  return snapshot.boards[boardKey]?.find((e) => e.uuid === uuid);
}
