'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import CloudTitle from '@/components/CloudTitle';

type Advancement = {
  key: string;
  title: string;
  description: string;
  frame: 'task' | 'goal' | 'challenge';
  icon: string;
  done: boolean;
};

type Category = {
  key: string;
  label: string;
  completed: number;
  total: number;
  advancements: Advancement[];
};

type AdvancementsResponse = {
  uuid: string;
  name: string;
  completed: number;
  total: number;
  categories: Category[];
};

type PlayerSummary = {
  uuid: string;
  name: string;
  playtime_seconds: number;
  deaths: number;
  online: boolean;
};

function formatPlaytime(seconds: number): string {
  const totalMinutes = Math.floor(seconds / 60);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes - days * 60 * 24) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  const minutes = totalMinutes - hours * 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

// Frame → accent styling for earned tiles. Mirrors the in-game frame colors.
const frameDone: Record<Advancement['frame'], string> = {
  task: 'border-emerald-500/60 bg-emerald-500/10',
  goal: 'border-emerald-400/60 bg-emerald-400/10',
  challenge: 'border-fuchsia-500/60 bg-fuchsia-500/10',
};

export default function PlayerPage() {
  const params = useParams<{ uuid: string }>();
  const uuid = params.uuid;

  const [adv, setAdv] = useState<AdvancementsResponse | null>(null);
  const [summary, setSummary] = useState<PlayerSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // No synchronous setLoading/setError reset here: the page is only ever
    // mounted fresh from a leaderboard row (no player→player navigation), so
    // the initial state (loading: true, error: null) already covers the one
    // fetch this mount performs. Resetting in-effect trips react-hooks/set-state-in-effect.
    let cancelled = false;

    Promise.all([
      fetch(`/api/stats/players/${uuid}/advancements`).then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return (await r.json()) as AdvancementsResponse;
      }),
      // Summary is best-effort (404 for players with no PiTab record yet).
      fetch(`/api/stats/players/${uuid}`)
        .then((r) => (r.ok ? (r.json() as Promise<PlayerSummary>) : null))
        .catch(() => null),
    ])
      .then(([advData, summaryData]) => {
        if (cancelled) return;
        setAdv(advData);
        setSummary(summaryData);
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
  }, [uuid]);

  const name = adv?.name ?? summary?.name ?? 'Player';
  const pct = adv && adv.total > 0 ? Math.round((adv.completed / adv.total) * 100) : 0;

  return (
    <div>
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="mb-6">
          <Link href="/leaderboards" className="text-sm t-text-muted hover:underline">
            ← Leaderboards
          </Link>
        </div>

        {/* Header */}
        <div className="mc-panel p-6 mb-8 flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://mc-heads.net/avatar/${uuid}/64`}
            alt=""
            width={64}
            height={64}
            className="w-16 h-16 rounded t-surface-light shrink-0"
          />
          <div className="min-w-0">
            <CloudTitle className="ml-10 w-fit" cloudOffsetX={10} cloudOffsetY={12}>
              <h1 className="font-pixel text-gold text-xl sm:text-2xl glow-gold whitespace-nowrap">{name}</h1>
            </CloudTitle>
            {adv && (
              <p className="t-text-dim text-sm mt-1">
                {adv.completed} / {adv.total} advancements · {pct}%
                {summary && (
                  <>
                    {' '}· {formatPlaytime(summary.playtime_seconds)} played · {summary.deaths} deaths
                    {summary.online && <span className="text-emerald-400"> · online</span>}
                  </>
                )}
              </p>
            )}
          </div>
        </div>

        {loading && <div className="px-4 py-8 text-center t-text-muted text-sm">Loading…</div>}
        {!loading && error && (
          <div className="px-4 py-8 text-center t-text-muted text-sm">
            Couldn&apos;t load this player. The server may be restarting — try again later.
          </div>
        )}

        {!loading && !error && adv && adv.categories.map((cat) => (
          <div key={cat.key} className="mb-8">
            <div className="flex items-baseline justify-between mb-3 px-1">
              <h2 className="font-pixel t-text text-sm">{cat.label}</h2>
              <span className="font-pixel t-text-muted text-[10px]">
                {cat.completed}/{cat.total}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {cat.advancements.map((a) => (
                <div
                  key={a.key}
                  title={a.description}
                  className={`rounded border p-2.5 transition-colors ${
                    a.done
                      ? frameDone[a.frame]
                      : 't-border-20 opacity-45 hover:opacity-70'
                  }`}
                >
                  <div className="flex items-start gap-1.5">
                    <span className={`text-xs leading-tight ${a.done ? 't-text' : 't-text-muted'}`}>
                      {a.done ? '✓ ' : ''}{a.title}
                    </span>
                    {a.frame === 'challenge' && (
                      <span className="text-[9px] text-fuchsia-400 font-pixel shrink-0 ml-auto">★</span>
                    )}
                  </div>
                  <p className="t-text-muted text-[10px] mt-1 leading-snug line-clamp-2">
                    {a.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
