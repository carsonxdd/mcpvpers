'use client';

import { useEffect, useState } from 'react';

type Lawman = {
  rank: number;
  uuid?: string | null;
  name: string;
  tier: string;
  commendations?: number;
};

const lawmenTierColor: Record<string, string> = {
  Marshal: 'text-gold glow-gold',
  'Senior Sheriff': 'text-gold',
  Sheriff: 'text-enchant glow-enchant',
  Deputy: 'text-enchant',
  Citizen: 't-text-dim',
};

export default function TopLawmen() {
  const [lawmen, setLawmen] = useState<Lawman[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/stats/reputation/leaderboard/lawmen')
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return (await r.json()) as { players: Lawman[] };
      })
      .then((json) => {
        if (cancelled) return;
        setLawmen((json.players ?? []).slice(0, 3));
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="mc-panel px-6 py-10 text-center t-text-muted text-sm max-w-md mx-auto">
        Loading…
      </div>
    );
  }
  if (error || lawmen.length === 0) {
    return (
      <div className="mc-panel px-6 py-10 text-center t-text-muted text-sm max-w-md mx-auto">
        No lawmen on the books yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
      {lawmen.map((lawman, i) => (
        <div
          key={lawman.uuid ?? lawman.name}
          className="mc-panel p-6 flex flex-col items-center text-center gap-3"
          style={i === 0 ? { background: 'color-mix(in srgb, var(--c-surface) 30%, transparent)' } : undefined}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://mc-heads.net/avatar/${lawman.uuid ?? lawman.name}/80`}
            alt={`${lawman.name} player head`}
            width={80}
            height={80}
            loading="lazy"
            className="w-20 h-20 rounded shrink-0 t-surface-light"
          />
          <div className="min-w-0 w-full">
            <p className="font-pixel text-sm t-text truncate">{lawman.name}</p>
            <p className={`font-pixel text-[10px] uppercase tracking-widest mt-1.5 ${lawmenTierColor[lawman.tier] ?? 't-text-dim'}`}>
              {lawman.tier}
            </p>
          </div>
          <div className="w-full pt-3 mt-1 border-t" style={{ borderColor: 'var(--c-border)' }}>
            <p className="font-pixel text-gold text-lg glow-gold">
              {lawman.commendations ?? '—'}
            </p>
            <p className="t-text-muted text-[9px] uppercase tracking-wider mt-1">Commendations</p>
          </div>
        </div>
      ))}
    </div>
  );
}
