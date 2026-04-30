'use client';

import { useEffect, useState } from 'react';
import CloudTitle from '@/components/CloudTitle';

type StatKey = 'playtime' | 'deaths';

const categories: { label: string; key: StatKey }[] = [
  { label: 'Playtime', key: 'playtime' },
  { label: 'Deaths', key: 'deaths' },
];

const labelByKey: Record<StatKey, string> = {
  playtime: 'Playtime',
  deaths: 'Deaths',
};

type LeaderboardEntry = {
  rank: number;
  uuid: string;
  name: string;
  playtime_seconds: number;
  deaths: number;
};

type LeaderboardResponse = {
  stat: string;
  players: LeaderboardEntry[];
};

const medalStyles = ['text-gold glow-gold', 't-text-dim', 'text-oak'];

function formatPlaytime(seconds: number): string {
  const totalMinutes = Math.floor(seconds / 60);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes - days * 60 * 24) / 60);
  const minutes = totalMinutes - days * 60 * 24 - hours * 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatValue(stat: StatKey, entry: LeaderboardEntry): string {
  if (stat === 'playtime') return formatPlaytime(entry.playtime_seconds);
  return entry.deaths.toLocaleString();
}

export default function LeaderboardsPage() {
  const [activeKey, setActiveKey] = useState<StatKey>('playtime');
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/stats/leaderboard?stat=${activeKey}&limit=10`)
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
  }, [activeKey]);

  const selectCategory = (key: StatKey) => {
    if (key === activeKey) return;
    setLoading(true);
    setError(null);
    setActiveKey(key);
  };

  return (
    <div>
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center"><CloudTitle><h1 className="font-pixel text-gold text-2xl sm:text-3xl mb-8 glow-gold">Leaderboards</h1></CloudTitle></div>

        <div className="flex flex-wrap gap-1.5 mb-8 justify-center relative z-10">
          {categories.map((cat) => (
            <button key={cat.key} onClick={() => selectCategory(cat.key)}
              className={`mc-pill ${activeKey === cat.key ? 'mc-pill-active' : ''}`}>
              {cat.label}
            </button>
          ))}
        </div>

        <div className="mc-panel overflow-hidden max-md:overflow-x-auto">
          <div className="max-md:min-w-[320px]">
            <div className="grid grid-cols-[3rem_1fr_auto] gap-4 px-4 py-3 t-border-50 border-b max-md:grid-cols-[2.5rem_1fr_auto] max-md:gap-3 max-md:px-3">
              <span className="font-pixel t-text-muted text-[10px]">#</span>
              <span className="font-pixel t-text-muted text-[10px]">Player</span>
              <span className="font-pixel t-text-muted text-[10px] text-right">{labelByKey[activeKey]}</span>
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
                  {formatValue(activeKey, player)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
