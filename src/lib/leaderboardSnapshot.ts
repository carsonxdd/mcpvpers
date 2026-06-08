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
  { key: 'peaceful_rep', path: 'reputation/leaderboard/peaceful' },
  { key: 'violence_rep', path: 'reputation/leaderboard/violence' },
  { key: 'lawmen', path: 'reputation/leaderboard/lawmen' },
];

const SLOW_BOARD = { key: 'blocks_mined', path: `leaderboard?stat=blocks_mined&limit=${ROSTER_LIMIT}` };

let cache: Snapshot | null = null;
let refreshing = false;
let blocksRefreshing = false;

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
async function fetchCommendations(timeoutMs: number): Promise<Entry[]> {
  const roster = await getJson<{ uuid: string; name: string }[]>('players', timeoutMs);
  if (!Array.isArray(roster)) return [];
  const rows = await Promise.all(
    roster.map((p) =>
      getJson<{ unique_commenders_90d?: number }>(
        `reputation/player/${encodeURIComponent(p.name)}`,
        timeoutMs,
      ).then((rep) => ({ uuid: p.uuid, name: p.name, value: rep?.unique_commenders_90d ?? 0 })),
    ),
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
async function fetchSkillBoards(timeoutMs: number): Promise<Record<string, Entry[]>> {
  const roster = await getJson<{ uuid: string; name: string }[]>('players', timeoutMs);
  if (!Array.isArray(roster)) return {};
  const perPlayer = await Promise.all(
    roster.map((p) =>
      getJson<{ skills?: { skill: string; level: number }[] }>(
        `players/${encodeURIComponent(p.uuid)}/skills`,
        timeoutMs,
      ).then((s) => ({ uuid: p.uuid, name: p.name, skills: s?.skills ?? [] })),
    ),
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

async function refresh(): Promise<void> {
  if (refreshing) return;
  refreshing = true;
  try {
    const [fast, outlaw, commendations, skillBoards] = await Promise.all([
      Promise.all(
        FAST_BOARDS.map((b) =>
          fetchBoard(b.path, FAST_TIMEOUT_MS).then((rows): [string, Entry[]] => [b.key, rows]),
        ),
      ),
      fetchOutlaw(FAST_TIMEOUT_MS),
      fetchCommendations(FAST_TIMEOUT_MS),
      fetchSkillBoards(FAST_TIMEOUT_MS),
    ]);
    const boards: Record<string, Entry[]> = { ...(cache?.boards ?? {}) };
    for (const [key, rows] of fast) boards[key] = rows;
    boards.outlaw_rep = outlaw;
    boards.commendations = commendations;
    Object.assign(boards, skillBoards);
    cache = { boards, updatedAt: Date.now() };
  } finally {
    refreshing = false;
  }
  void refreshBlocks();
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
