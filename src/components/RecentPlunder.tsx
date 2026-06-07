'use client';

import { useEffect, useState } from 'react';
import { lootTier } from '@/lib/bossDisplay';

// Cross-run notable-drops feed (/api/events/loot/recent). Renders nothing until
// it has at least one drop, so it self-hides on 503 (pre-tracking DB) or an empty
// post-ship server. `tier` filters to a single rarity (e.g. a Pitforged showcase).

type Drop = {
  event_id: number;
  uuid: string | null;
  name: string;
  item: string;
  tier: string;
  at: number;
};

function timeAgo(ts: number): string {
  if (!ts) return '';
  const secs = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (secs < 60) return 'just now';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function RecentPlunder({
  title = 'Recent Plunder',
  limit = 10,
  tier,
  className = 'mb-16',
}: {
  title?: string;
  limit?: number;
  tier?: 'rare' | 'epic' | 'pitforged';
  className?: string;
}) {
  const [drops, setDrops] = useState<Drop[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    const q = new URLSearchParams({ limit: String(limit) });
    if (tier) q.set('tier', tier);
    fetch(`/api/stats/events/loot/recent?${q.toString()}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return (await r.json()) as { drops?: Drop[] };
      })
      .then((json) => {
        if (!cancelled) setDrops(Array.isArray(json.drops) ? json.drops : []);
      })
      .catch(() => {
        if (!cancelled) setDrops([]);
      });
    return () => {
      cancelled = true;
    };
  }, [limit, tier]);

  if (!drops || drops.length === 0) return null;

  return (
    <div className={className}>
      <h2 className="font-pixel t-text text-sm mb-4 px-1">{title}</h2>
      <div className="mc-panel overflow-hidden">
        {drops.map((d, i) => {
          const t = lootTier[d.tier];
          return (
            <div key={i} className="flex items-center gap-3 px-4 py-3 text-sm t-border-20 border-b last:border-b-0">
              <span
                className="font-pixel text-[9px] px-1.5 py-0.5 rounded shrink-0"
                style={{ color: t?.color, backgroundColor: `color-mix(in srgb, ${t?.color ?? '#888'} 16%, transparent)` }}
              >
                {t?.badge ?? d.tier.toUpperCase()}
              </span>
              <span className="min-w-0">
                <span className="font-medium" style={{ color: t?.color }}>{d.item}</span>
                <span className="t-text-muted"> · {d.name}</span>
              </span>
              <span className="t-text-muted text-xs ml-auto whitespace-nowrap">{timeAgo(d.at)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
