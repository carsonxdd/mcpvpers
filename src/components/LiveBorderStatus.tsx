'use client';

import { useEffect, useState } from 'react';

function formatPlaytime(seconds: number): string {
  const totalMinutes = Math.floor(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes - hours * 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

type BorderStatus = {
  current_radius: number;
  max_radius: number;
  diameter: number;
  weekly_playtime_seconds: number;
  total_expansions: number;
  last_expansion: string;
};

export default function LiveBorderStatus() {
  const [status, setStatus] = useState<BorderStatus | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/stats/border')
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return (await r.json()) as BorderStatus;
      })
      .then((json) => {
        if (!cancelled) setStatus(json);
      })
      .catch(() => {
        if (!cancelled) setHidden(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (hidden || !status) return null;

  const weeklyPlayed = formatPlaytime(status.weekly_playtime_seconds);

  return (
    <div className="mc-panel p-5 mt-8">
      <p className="font-pixel t-text-dim text-[10px] mb-4 uppercase tracking-widest text-center">Right Now</p>
      <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1 max-md:gap-3 text-center">
        <div>
          <p className="t-text-muted text-xs mb-1">Current Border</p>
          <p className="text-xp font-pixel text-sm glow-xp">±{status.current_radius.toLocaleString()}</p>
        </div>
        <div>
          <p className="t-text-muted text-xs mb-1">This Week</p>
          <p className="text-xp font-pixel text-sm glow-xp">{weeklyPlayed} played</p>
        </div>
        <div>
          <p className="t-text-muted text-xs mb-1">Expansions</p>
          <p className="text-xp font-pixel text-sm glow-xp">{status.total_expansions}</p>
        </div>
      </div>
    </div>
  );
}
