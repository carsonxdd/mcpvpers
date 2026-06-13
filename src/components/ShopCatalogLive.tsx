'use client';

import { useEffect, useState } from 'react';
import { formatMaterial, formatPrice } from '@/lib/shopDisplay';

// Live /shop price table, fed by /api/shop/catalog (PiStatsAPI 1.14.0).
// Daily-ticker pricing: every item carries a price index that re-prices ONCE a
// day at midnight Phoenix from yesterday's net trade flow. buy_now/sell_now are
// the live index-adjusted prices; index_pct (100 = base) is clamped to
// index_min–index_max (default 60–140); change_pct is today's move vs yesterday
// (drives the ▲/▼ badge). buy_base 0 = the server doesn't sell that item;
// sell_base 0 = it doesn't buy it. The route 503s until PiShop is live on prod —
// the component self-hides, leaving the page's static category cards as fallback.

type CatalogItem = {
  material: string;
  buy_base: number;
  sell_base: number;
  appetite: number;
  index_pct: number;
  change_pct: number;
  buy_now: number;
  sell_now: number;
  sold_today: number;
  bought_today: number;
  warehouse_cap: number;
  warehouse_left: number;
};

type CatalogCategory = {
  key: string;
  name: string;
  icon: string;
  items: CatalogItem[];
};

type CatalogResponse = {
  drift_max: number;
  drift_idle: number;
  index_min: number;
  index_max: number;
  warehouse_multiple: number;
  item_count: number;
  categories: CatalogCategory[];
};

export default function ShopCatalogLive() {
  const [data, setData] = useState<CatalogResponse | null>(null);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/stats/shop/catalog')
      .then((r) => (r.ok ? (r.json() as Promise<CatalogResponse>) : null))
      .then((json) => {
        if (!cancelled && json && Array.isArray(json.categories) && json.categories.length > 0) {
          setData(json);
        }
      })
      .catch(() => {
        /* pre-ship / offline — table stays hidden */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!data) return null;

  const active = data.categories.find((c) => c.key === activeKey) ?? data.categories[0];

  return (
    <div className="mt-8">
      <h3 className="font-pixel text-gold text-xs glow-gold uppercase tracking-widest mb-4 text-center">
        Live prices
      </h3>
      <div className="flex flex-wrap gap-1.5 mb-4 justify-center relative z-10">
        {data.categories.map((c) => (
          <button
            key={c.key}
            onClick={() => setActiveKey(c.key)}
            className={`mc-pill ${active.key === c.key ? 'mc-pill-active' : ''}`}
          >
            {c.name}
          </button>
        ))}
      </div>
      <div className="mc-panel overflow-hidden max-md:overflow-x-auto">
        <div className="max-md:min-w-[320px]">
          <div className="grid grid-cols-[1fr_5rem_5rem_6rem] gap-3 px-4 py-3 t-border-50 border-b max-md:grid-cols-[1fr_4rem_4rem_4.5rem]">
            <span className="font-pixel t-text-muted text-[10px]">Item</span>
            <span className="font-pixel t-text-muted text-[10px] text-right">Buy</span>
            <span className="font-pixel t-text-muted text-[10px] text-right">Sell</span>
            <span className="font-pixel t-text-muted text-[10px] text-right">Today</span>
          </div>
          {active.items.map((it) => {
            const change = Math.round(it.change_pct);
            return (
              <div
                key={it.material}
                className="grid grid-cols-[1fr_5rem_5rem_6rem] gap-3 px-4 py-2.5 t-border-20 border-b last:border-b-0 items-center max-md:grid-cols-[1fr_4rem_4rem_4.5rem]"
              >
                <span className="text-sm t-text-dim max-md:truncate">{formatMaterial(it.material)}</span>
                <span className="text-sm text-right whitespace-nowrap t-text-muted">
                  {it.buy_base > 0 ? formatPrice(it.buy_now) : '—'}
                </span>
                <span className="text-sm text-right whitespace-nowrap text-gold">
                  {it.sell_base > 0 ? formatPrice(it.sell_now) : '—'}
                </span>
                <span className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                  <span className="t-text-muted text-[11px]">{Math.round(it.index_pct)}%</span>
                  {change > 0 ? (
                    <span className="text-xp text-[11px]">▲{change}%</span>
                  ) : change < 0 ? (
                    <span className="text-redstone text-[11px]">▼{Math.abs(change)}%</span>
                  ) : (
                    <span className="t-text-muted text-[11px]">—</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <p className="t-text-muted text-[11px] text-center mt-3">
        {data.item_count} items. Prices re-price once a day at midnight — the index stays between{' '}
        {Math.round(data.index_min)}% and {Math.round(data.index_max)}% of base, and ▲/▼ shows
        today&apos;s move. &quot;—&quot; means the server doesn&apos;t buy or sell that side.
      </p>
    </div>
  );
}
