'use client';

import { useEffect, useState } from 'react';
import CloudTitle from '@/components/CloudTitle';

type StatKey =
  | 'playtime'
  | 'deaths'
  | 'mob_kills'
  | 'blocks_mined'
  | 'ores_mined'
  | 'distance'
  | 'advancements'
  | 'xp_levels';

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
};

type LeaderboardEntry = {
  rank: number;
  uuid: string;
  name: string;
  value: number;
};

type LeaderboardResponse = {
  stat: string;
  window?: string;
  players: LeaderboardEntry[];
};

const medalStyles = ['text-gold glow-gold', 't-text-dim', 't-text-dim'];

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

function formatValue(stat: StatKey, value: number): string {
  if (stat === 'playtime') return formatPlaytime(value);
  if (stat === 'distance') return formatDistance(value);
  return value.toLocaleString();
}

export default function LeaderboardsPage() {
  const [activeKey, setActiveKey] = useState<StatKey>('playtime');
  const [playtimeWindow, setPlaytimeWindow] = useState<PlaytimeWindow>('all');
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const params = new URLSearchParams({ stat: activeKey, limit: '10' });
    if (activeKey === 'playtime') params.set('window', playtimeWindow);

    fetch(`/api/stats/leaderboard?${params.toString()}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return (await r.json()) as LeaderboardResponse;
      })
      .then((json) => {
        if (cancelled) return;
        setData(json.players ?? []);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(String(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeKey, playtimeWindow]);

  const selectCategory = (key: StatKey) => {
    if (key === activeKey) return;
    setLoading(true);
    setError(null);
    setActiveKey(key);
  };

  const selectWindow = (key: PlaytimeWindow) => {
    if (key === playtimeWindow) return;
    setLoading(true);
    setError(null);
    setPlaytimeWindow(key);
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
          <div className="flex flex-wrap gap-1.5 mb-8 justify-center relative z-10">
            {playtimeWindows.map((w) => (
              <button key={w.key} onClick={() => selectWindow(w.key)}
                className={`mc-pill ${playtimeWindow === w.key ? 'mc-pill-active' : ''}`}>
                {w.label}
              </button>
            ))}
          </div>
        )}
        {activeKey !== 'playtime' && <div className="mb-8" />}

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
            {!loading && !error && data.length === 0 && (
              <div className="px-4 py-8 text-center t-text-muted text-sm">No players yet.</div>
            )}
            {!loading && !error && data.map((player, i) => (
              <div key={player.uuid}
                className="grid grid-cols-[3rem_1fr_auto] gap-4 px-4 py-3 t-border-20 border-b transition-colors hover-surface max-md:grid-cols-[2.5rem_1fr_auto] max-md:gap-3 max-md:px-3"
                style={i < 3 ? { background: 'color-mix(in srgb, var(--c-surface) 30%, transparent)' } : undefined}
              >
                <span className={`font-pixel text-xs ${i < 3 ? medalStyles[i] : 't-text-muted'}`}>
                  {i + 1}
                </span>
                <div className="flex items-center gap-2.5 min-w-0">
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
                </div>
                <span className={`text-sm text-right whitespace-nowrap ${i === 0 ? 'text-gold font-pixel text-xs' : 't-text-muted'}`}>
                  {formatValue(activeKey, player.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
