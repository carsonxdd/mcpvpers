'use client';

import { useEffect, useState } from 'react';
import { formatMaterial, formatPrice, formatAgo } from '@/lib/shopDisplay';

// Live player-market listings, fed by /api/shop/market (PiStatsAPI 1.10.0) —
// "what's for sale right now", newest first. 503s until PiShop is on prod and
// hides on an empty market, so it's safe to ship ahead of the DatHost restart.

type Listing = {
  seller: string;
  material: string;
  amount: number;
  custom_name: string | null;
  enchanted: boolean;
  price: number;
  listed_ms: number;
  expires_ms: number;
};

type MarketResponse = {
  fee: number;
  listing_count: number;
  listings: Listing[];
};

const SHOWN = 10;

export default function MarketListings() {
  const [data, setData] = useState<MarketResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/stats/shop/market')
      .then((r) => (r.ok ? (r.json() as Promise<MarketResponse>) : null))
      .then((json) => {
        if (!cancelled && json && Array.isArray(json.listings) && json.listings.length > 0) {
          setData(json);
        }
      })
      .catch(() => {
        /* pre-ship / offline — panel stays hidden */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!data) return null;

  return (
    <div className="mt-6">
      <h3 className="font-pixel text-gold text-xs glow-gold uppercase tracking-widest mb-4 text-center">
        For sale right now
      </h3>
      <div className="mc-panel overflow-hidden">
        {data.listings.slice(0, SHOWN).map((l, i) => (
          <div
            key={`${l.seller}-${l.listed_ms}-${i}`}
            className="flex items-center gap-3 px-4 py-2.5 t-border-20 border-b last:border-b-0 text-sm"
          >
            <span className="t-text-dim min-w-0 truncate">
              {l.custom_name ? (
                <span className="italic">{l.custom_name}</span>
              ) : (
                formatMaterial(l.material)
              )}
              {l.enchanted && <span aria-hidden> ✨</span>}
              <span className="t-text-muted"> ×{l.amount}</span>
            </span>
            <span className="text-gold whitespace-nowrap shrink-0">{formatPrice(l.price)}</span>
            <span className="t-text-muted text-xs whitespace-nowrap shrink-0 ml-auto">
              {l.seller}
              <span className="max-md:hidden"> · {formatAgo(l.listed_ms)}</span>
            </span>
          </div>
        ))}
      </div>
      {data.listing_count > SHOWN && (
        <p className="t-text-muted text-[11px] text-center mt-3">
          +{data.listing_count - SHOWN} more in the in-game browser (<code className="text-gold">/market</code>).
        </p>
      )}
    </div>
  );
}
