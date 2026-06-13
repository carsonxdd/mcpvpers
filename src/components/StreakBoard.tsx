'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

// "Longest Login Streaks" board, fed by /api/reputation/leaderboard/streaks
// (PiStatsAPI 1.8.0+). The route 503s until PiReputation 1.7.0 + PiStatsAPI
// 1.8.0 are live on prod — this component self-hides on any error or empty
// board, so it's safe to ship ahead of the DatHost restart.
//
// Gotcha from the API contract: `daily_reward_streak` is the STORED number and
// only resets on the player's next claim — `streak_active` is the field to
// trust for "is this streak alive right now". Lapsed streaks render muted.

type StreakRow = {
  rank: number;
  name: string;
  daily_reward_streak: number;
  best_daily_reward_streak: number;
  last_daily_reward_day: number;
  streak_active: boolean;
  claimed_today: boolean;
};

type StreaksResponse = {
  players: StreakRow[];
  server_epoch_day: number;
};

const medalStyles = ['text-gold glow-gold', 'text-silver glow-silver', 'text-bronze glow-bronze'];

export default function StreakBoard() {
  const [data, setData] = useState<StreaksResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/stats/reputation/leaderboard/streaks')
      .then((r) => (r.ok ? (r.json() as Promise<StreaksResponse>) : null))
      .then((json) => {
        if (!cancelled && json && Array.isArray(json.players) && json.players.length > 0) {
          setData(json);
        }
      })
      .catch(() => {
        /* pre-ship 503 / offline — board stays hidden */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!data) return null;

  return (
    <div className="mt-6">
      <h3 className="font-pixel text-gold text-xs glow-gold uppercase tracking-widest mb-4 text-center">
        Longest login streaks
      </h3>
      <div className="mc-panel overflow-hidden">
        <div className="grid grid-cols-[2.5rem_1fr_auto_auto] gap-3 px-4 py-3 t-border-50 border-b">
          <span className="font-pixel t-text-muted text-[10px]">#</span>
          <span className="font-pixel t-text-muted text-[10px]">Player</span>
          <span className="font-pixel t-text-muted text-[10px] text-right">Current</span>
          <span className="font-pixel t-text-muted text-[10px] text-right w-16">Best</span>
        </div>
        {data.players.map((p, i) => (
          <div
            key={p.name}
            className="grid grid-cols-[2.5rem_1fr_auto_auto] gap-3 px-4 py-3 t-border-20 border-b last:border-b-0 transition-colors hover-surface items-center"
            style={i < 3 ? { background: 'color-mix(in srgb, var(--c-surface) 30%, transparent)' } : undefined}
          >
            <span className={`font-pixel text-xs ${i < 3 ? medalStyles[i] : 't-text-muted'}`}>
              {i + 1}
            </span>
            <Link
              href={`/player/${encodeURIComponent(p.name)}`}
              className="flex items-center gap-2.5 min-w-0 hover:underline"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://mc-heads.net/avatar/${p.name}/24`}
                alt=""
                width={24}
                height={24}
                loading="lazy"
                className="w-6 h-6 rounded shrink-0 t-surface-light"
              />
              <span className={`text-sm max-md:truncate ${i < 3 ? 't-text font-medium' : 't-text-dim'}`}>
                {p.name}
              </span>
            </Link>
            <span className="text-sm text-right whitespace-nowrap">
              {p.streak_active ? (
                <span className="text-gold">🔥 {p.daily_reward_streak}d</span>
              ) : (
                <span className="t-text-muted">—</span>
              )}
            </span>
            <span className="text-sm text-right whitespace-nowrap t-text-dim w-16">
              {p.best_daily_reward_streak}d
            </span>
          </div>
        ))}
      </div>
      <p className="t-text-muted text-[11px] text-center mt-3">
        Ranked by best streak. 🔥 means the streak is alive — one more daily login keeps it going.
      </p>
    </div>
  );
}
