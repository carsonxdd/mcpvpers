'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import CloudTitle from '@/components/CloudTitle';

type StatKey =
  | 'playtime'
  | 'deaths'
  | 'mob_kills'
  | 'blocks_mined'
  | 'ores_mined'
  | 'distance'
  | 'advancements'
  | 'xp_levels'
  | 'peaceful_rep'
  | 'violence_rep'
  | 'outlaw_rep'
  | 'lawmen';

type PlaytimeWindow = 'all' | 'month' | 'week';

const categories: { label: string; key: StatKey }[] = [
  { label: 'Playtime', key: 'playtime' },
  { label: 'Deaths', key: 'deaths' },
  { label: 'Mob Kills', key: 'mob_kills' },
  { label: 'Blocks Mined', key: 'blocks_mined' },
  { label: 'Ores Mined', key: 'ores_mined' },
  { label: 'Distance Walked', key: 'distance' },
  { label: 'Advancements', key: 'advancements' },
  { label: 'XP Levels', key: 'xp_levels' },
  { label: 'Peaceful Rep', key: 'peaceful_rep' },
  { label: 'Outlaw Rep', key: 'outlaw_rep' },
  { label: 'Violence Rep', key: 'violence_rep' },
  { label: 'Lawmen', key: 'lawmen' },
];

const playtimeWindows: { label: string; key: PlaytimeWindow }[] = [
  { label: 'All-time', key: 'all' },
  { label: 'Month', key: 'month' },
  { label: 'Week', key: 'week' },
];

const headerByKey: Record<StatKey, string> = {
  playtime: 'Playtime',
  deaths: 'Deaths',
  mob_kills: 'Mob Kills',
  blocks_mined: 'Blocks',
  ores_mined: 'Ores',
  distance: 'Distance',
  advancements: 'Advancements',
  xp_levels: 'Levels',
  peaceful_rep: 'Peaceful',
  violence_rep: 'Violence',
  outlaw_rep: 'Outlaw',
  lawmen: 'Tier',
};

type LeaderboardEntry = {
  rank: number;
  uuid: string | null;
  name: string;
  value: number;
  tier?: string;
  commendations?: number;
};

type Snapshot = {
  updatedAt: number;
  boards: Record<string, LeaderboardEntry[]>;
};

const medalStyles = ['text-gold glow-gold', 'text-silver glow-silver', 'text-bronze glow-bronze'];

function formatPlaytime(seconds: number): string {
  const totalMinutes = Math.floor(seconds / 60);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes - days * 60 * 24) / 60);
  const minutes = totalMinutes - days * 60 * 24 - hours * 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatDistance(cm: number): string {
  if (cm <= 0) return '0 m';
  const km = cm / 100000;
  if (km >= 1) return `${km.toFixed(1)} km`;
  const m = Math.round(cm / 100);
  return `${m.toLocaleString()} m`;
}

function formatValue(stat: StatKey, entry: LeaderboardEntry): string {
  if (stat === 'playtime') return formatPlaytime(entry.value);
  if (stat === 'distance') return formatDistance(entry.value);
  if (stat === 'lawmen') return entry.tier ?? '—';
  if (stat === 'peaceful_rep' || stat === 'violence_rep' || stat === 'outlaw_rep')
    return entry.value.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  return entry.value.toLocaleString();
}

function formatAgo(ts: number): string {
  if (!ts) return '';
  const secs = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (secs < 60) return 'just now';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  return `${hours}h ago`;
}

// Maps the active tab + playtime window to the snapshot board key.
function boardKeyFor(activeKey: StatKey, window: PlaytimeWindow): string {
  return activeKey === 'playtime' ? `playtime:${window}` : activeKey;
}

// A page holds up to 100 ranks; within a page we reveal 50 first, then the rest
// on "Load more". Beyond 100 ranks, pagination kicks in.
const PAGE_SIZE = 100;
const INITIAL_VISIBLE = 50;

export default function LeaderboardsPage() {
  const [activeKey, setActiveKey] = useState<StatKey>('playtime');
  const [playtimeWindow, setPlaytimeWindow] = useState<PlaytimeWindow>('all');
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [page, setPage] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // One fetch on mount — the snapshot holds every tab, so switching tabs is
  // instant and the slow Blocks Mined board arrives pre-warmed (or fills in on a
  // later refresh). No per-tab requests.
  useEffect(() => {
    let cancelled = false;

    fetch('/api/leaderboards-snapshot')
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return (await r.json()) as Snapshot;
      })
      .then((json) => {
        if (cancelled) return;
        setSnapshot(json);
      })
      .catch((e) => {
        if (!cancelled) setError(String(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const boardKey = boardKeyFor(activeKey, playtimeWindow);
  const board = snapshot?.boards[boardKey];
  const data: LeaderboardEntry[] = board ?? [];
  // Blocks Mined can lag the rest of the snapshot right after a restart.
  const warming = !loading && !error && activeKey === 'blocks_mined' && board === undefined;

  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageStart = safePage * PAGE_SIZE;
  const pageRows = data.slice(pageStart, pageStart + PAGE_SIZE);
  const visibleRows = expanded ? pageRows : pageRows.slice(0, INITIAL_VISIBLE);
  const showLoadMore = !expanded && pageRows.length > INITIAL_VISIBLE;
  const showPagination = data.length > PAGE_SIZE;

  // Switching tab/window or page resets the reveal back to the first 50.
  const selectCategory = (key: StatKey) => {
    setActiveKey(key);
    setPage(0);
    setExpanded(false);
  };
  const selectWindow = (key: PlaytimeWindow) => {
    setPlaytimeWindow(key);
    setPage(0);
    setExpanded(false);
  };
  const goToPage = (p: number) => {
    setPage(p);
    setExpanded(false);
  };

  return (
    <div>
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center"><CloudTitle><h1 className="font-pixel text-gold text-2xl sm:text-3xl mb-8 glow-gold">Leaderboards</h1></CloudTitle></div>

        <div className="flex flex-wrap gap-1.5 mb-4 justify-center relative z-10">
          {categories.map((cat) => (
            <button key={cat.key} onClick={() => selectCategory(cat.key)}
              className={`mc-pill ${activeKey === cat.key ? 'mc-pill-active' : ''}`}>
              {cat.label}
            </button>
          ))}
        </div>

        {activeKey === 'playtime' && (
          <div className="flex flex-wrap gap-1.5 mb-4 justify-center relative z-10">
            {playtimeWindows.map((w) => (
              <button key={w.key} onClick={() => selectWindow(w.key)}
                className={`mc-pill ${playtimeWindow === w.key ? 'mc-pill-active' : ''}`}>
                {w.label}
              </button>
            ))}
          </div>
        )}

        {/* Freshness line — the snapshot refreshes in the background every few minutes. */}
        <div className="text-center mb-8 h-4">
          {snapshot && snapshot.updatedAt > 0 && (
            <span className="t-text-muted text-[10px] font-pixel">
              Updated {formatAgo(snapshot.updatedAt)}
            </span>
          )}
        </div>

        <div className="mc-panel overflow-hidden max-md:overflow-x-auto">
          <div className="max-md:min-w-[320px]">
            <div className="grid grid-cols-[3rem_1fr_auto] gap-4 px-4 py-3 t-border-50 border-b max-md:grid-cols-[2.5rem_1fr_auto] max-md:gap-3 max-md:px-3">
              <span className="font-pixel t-text-muted text-[10px]">#</span>
              <span className="font-pixel t-text-muted text-[10px]">Player</span>
              <span className="font-pixel t-text-muted text-[10px] text-right">{headerByKey[activeKey]}</span>
            </div>

            {loading && (
              <div className="px-4 py-8 text-center t-text-muted text-sm">Loading…</div>
            )}
            {!loading && error && (
              <div className="px-4 py-8 text-center t-text-muted text-sm">
                Couldn&apos;t load leaderboard. Try again later.
              </div>
            )}
            {warming && (
              <div className="px-4 py-8 text-center t-text-muted text-sm">
                Still warming up — the Blocks Mined board refreshes in the background. Check back in a moment.
              </div>
            )}
            {!loading && !error && !warming && data.length === 0 && (
              <div className="px-4 py-8 text-center t-text-muted text-sm">No players yet.</div>
            )}
            {!loading && !error && visibleRows.map((player, j) => {
              const i = pageStart + j; // absolute rank index across pages
              return (
              <div key={player.uuid ?? player.name}
                className="grid grid-cols-[3rem_1fr_auto] gap-4 px-4 py-3 t-border-20 border-b transition-colors hover-surface max-md:grid-cols-[2.5rem_1fr_auto] max-md:gap-3 max-md:px-3"
                style={i < 3 ? { background: 'color-mix(in srgb, var(--c-surface) 30%, transparent)' } : undefined}
              >
                <span className={`font-pixel text-xs ${i < 3 ? medalStyles[i] : 't-text-muted'}`}>
                  {i + 1}
                </span>
                {player.uuid ? (
                  <Link
                    href={`/player/${encodeURIComponent(player.name)}`}
                    className="flex items-center gap-2.5 min-w-0 hover:underline"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://mc-heads.net/avatar/${player.uuid}/24`}
                      alt=""
                      width={24}
                      height={24}
                      loading="lazy"
                      className="w-6 h-6 rounded shrink-0 t-surface-light"
                    />
                    <span className={`text-sm max-md:truncate ${i < 3 ? 't-text font-medium' : 't-text-dim'}`}>
                      {player.name}
                    </span>
                  </Link>
                ) : (
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://mc-heads.net/avatar/${player.uuid ?? player.name}/24`}
                      alt=""
                      width={24}
                      height={24}
                      loading="lazy"
                      className="w-6 h-6 rounded shrink-0 t-surface-light"
                    />
                    <span className={`text-sm max-md:truncate ${i < 3 ? 't-text font-medium' : 't-text-dim'}`}>
                      {player.name}
                    </span>
                  </div>
                )}
                <span className={`text-sm text-right whitespace-nowrap ${i === 0 ? 'text-gold font-pixel text-xs' : 't-text-muted'}`}>
                  {formatValue(activeKey, player)}
                  {activeKey === 'lawmen' && player.commendations != null && (
                    <span className="t-text-muted text-xs ml-2">· {player.commendations} commendations</span>
                  )}
                </span>
              </div>
              );
            })}

            {showLoadMore && (
              <div className="px-4 py-4 text-center">
                <button onClick={() => setExpanded(true)} className="mc-pill">
                  Load more ({pageRows.length - INITIAL_VISIBLE} more)
                </button>
              </div>
            )}
          </div>
        </div>

        {showPagination && (
          <div className="flex items-center justify-center gap-3 mt-6 relative z-10">
            <button
              onClick={() => goToPage(safePage - 1)}
              disabled={safePage === 0}
              className={`mc-pill ${safePage === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              ← Prev
            </button>
            <span className="font-pixel t-text-muted text-[10px]">
              {pageStart + 1}–{Math.min(pageStart + PAGE_SIZE, data.length)} of {data.length}
            </span>
            <button
              onClick={() => goToPage(safePage + 1)}
              disabled={safePage >= totalPages - 1}
              className={`mc-pill ${safePage >= totalPages - 1 ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              Next →
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
