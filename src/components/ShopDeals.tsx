'use client';

import { useEffect, useState } from 'react';
import { formatMaterial, formatPrice } from '@/lib/shopDisplay';

// "Today's Deals" strip + live black-market status, fed by /api/shop/deals
// (PiStatsAPI 1.11.0 / PiShop 1.3.0). Deals rotate daily at Phoenix midnight:
// buy deals are 25% off the static buy price, sell deals +50% on the sell-curve
// base. The black market opens on fixed windows (Tuesday & Friday 9 PM–midnight
// server time) with limited per-window stock. Pre-ship the route 503s or comes
// back empty/closed — the component self-hides in both cases.

type Deal = { material: string; side: 'BUY' | 'SELL'; pct: number };

type DealsResponse = {
  day: number;
  deals: Deal[];
  blackmarket: {
    open: boolean;
    open_until_ms: number;
    items: { material: string; price: number; stock: number; remaining: number }[];
  };
};

export default function ShopDeals() {
  const [data, setData] = useState<DealsResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/stats/shop/deals')
      .then((r) => (r.ok ? (r.json() as Promise<DealsResponse>) : null))
      .then((json) => {
        if (!cancelled && json) setData(json);
      })
      .catch(() => {
        /* pre-ship / offline — strip stays hidden */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const deals = data?.deals ?? [];
  const bm = data?.blackmarket;
  const bmOpen = bm?.open && (bm.items?.length ?? 0) > 0;
  if (deals.length === 0 && !bmOpen) return null;

  return (
    <div className="space-y-4 mb-6">
      {deals.length > 0 && (
        <div className="mc-panel p-5 border-l-2 border-gold/50">
          <h3 className="font-pixel text-gold text-xs mb-3">★ Today&apos;s deals</h3>
          <div className="flex flex-wrap gap-2">
            {deals.map((d) => (
              <span
                key={`${d.material}-${d.side}`}
                className="inventory-slot px-3 py-1.5 text-xs t-text-dim whitespace-nowrap"
              >
                <span className="t-text">{formatMaterial(d.material)}</span>{' '}
                {d.side === 'BUY' ? (
                  <span className="text-xp">{d.pct}% off to buy</span>
                ) : (
                  <span className="text-gold">+{d.pct}% to sell</span>
                )}
              </span>
            ))}
          </div>
          <p className="t-text-muted text-[11px] mt-3">
            Deals rotate every day at midnight server time — look for the ★ in <code className="text-gold">/shop</code>.
          </p>
        </div>
      )}

      {bmOpen && bm && (
        <div className="mc-panel p-5 border-l-2 border-redstone/50">
          <div className="flex items-center gap-2.5 mb-3">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="absolute inline-flex h-full w-full rounded-full bg-redstone opacity-75 animate-ping" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-redstone" />
            </span>
            <h3 className="font-pixel text-redstone text-xs">Black market — OPEN NOW</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {bm.items.map((it) => (
              <span
                key={it.material}
                className="inventory-slot px-3 py-1.5 text-xs t-text-dim whitespace-nowrap"
              >
                <span className="t-text">{formatMaterial(it.material)}</span>{' '}
                <span className="text-gold">{formatPrice(it.price)}</span>
                <span className="t-text-muted"> · {it.remaining}/{it.stock} left</span>
              </span>
            ))}
          </div>
          <p className="t-text-muted text-[11px] mt-3">
            Stock is per window — when it&apos;s gone, it&apos;s gone until the next market night.
          </p>
        </div>
      )}
    </div>
  );
}
