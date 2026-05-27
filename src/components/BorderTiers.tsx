'use client';

import { useEffect, useMemo, useState } from 'react';

type BorderStatus = {
  active_players: number;
  scaling?: { enabled: boolean; exponent: number };
};

const BASE_TIERS = [
  { tier: 1, hours: 0.5, blocks: 100, color: 'text-xp', chunks: '~5,600' },
  { tier: 2, hours: 1.5, blocks: 200, color: 'text-xp', chunks: '~11,500' },
  { tier: 3, hours: 3,   blocks: 300, color: 'text-enchant', chunks: '~17,800' },
  { tier: 4, hours: 5,   blocks: 400, color: 'text-gold', chunks: '~24,300' },
  { tier: 5, hours: 8,   blocks: 500, color: 'text-redstone', chunks: '~31,200' },
];

const PREVIEW_SIZES = [1, 2, 3, 5, 10];

function multiplier(active: number, enabled: boolean, exponent: number): number {
  if (!enabled || active <= 1) return 1;
  return Math.pow(active, exponent);
}

export default function BorderTiers() {
  const [status, setStatus] = useState<BorderStatus | null>(null);
  const [preview, setPreview] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/stats/border')
      .then((r) => (r.ok ? r.json() : null))
      .then((json: BorderStatus | null) => {
        if (!cancelled && json) setStatus(json);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const liveActive = status?.active_players ?? 0;
  const enabled = status?.scaling?.enabled ?? true;
  const exponent = status?.scaling?.exponent ?? 1.3;
  const effectiveActive = preview ?? Math.max(liveActive, 1);
  const mult = useMemo(
    () => multiplier(effectiveActive, enabled, exponent),
    [effectiveActive, enabled, exponent]
  );

  return (
    <div className="mc-panel p-6 sm:p-8 max-md:p-3 mt-8">
      <h3 className="font-pixel text-enchant text-xs mb-2 glow-enchant text-center uppercase tracking-wider">
        Expansion Tiers
      </h3>

      {enabled && (
        <p className="t-text-muted text-[11px] text-center mb-4">
          Thresholds scale with active players today.
          {status && liveActive > 1 && (
            <>
              {' '}
              Currently{' '}
              <span className="t-text">
                {liveActive} active
              </span>{' '}
              — ×{mult.toFixed(2)}.
            </>
          )}
        </p>
      )}

      {enabled && (
        <div className="flex justify-center gap-2 mb-4 flex-wrap">
          <span className="t-text-muted text-[10px] uppercase tracking-wider self-center mr-1">
            Preview:
          </span>
          {PREVIEW_SIZES.map((n) => {
            const isActive = (preview ?? Math.max(liveActive, 1)) === n;
            return (
              <button
                key={n}
                onClick={() => setPreview(n)}
                className={`font-pixel text-[10px] px-2 py-1 border ${
                  isActive ? 'text-xp border-current' : 't-text-muted'
                }`}
                style={{ borderColor: isActive ? undefined : 'var(--c-border)' }}
              >
                {n}p
              </button>
            );
          })}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm max-md:text-xs">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--c-border)' }}>
              <th className="font-pixel text-gold text-[10px] max-md:text-[9px] text-left py-2 pr-4 max-md:pr-1.5">Tier</th>
              <th className="font-pixel text-gold text-[10px] max-md:text-[9px] text-left py-2 pr-4 max-md:pr-1.5">
                <span className="md:hidden">Playtime</span>
                <span className="max-md:hidden">Today's Playtime</span>
              </th>
              <th className="font-pixel text-gold text-[10px] max-md:text-[9px] text-left py-2 pr-4 max-md:pr-1.5">
                <span className="md:hidden">Expansion</span>
                <span className="max-md:hidden">Border Expansion</span>
              </th>
              <th className="font-pixel text-gold text-[10px] max-md:text-[9px] text-left py-2">
                <span className="md:hidden">Chunks*</span>
                <span className="max-md:hidden">New Chunks*</span>
              </th>
            </tr>
          </thead>
          <tbody className="t-text-dim">
            {BASE_TIERS.map((row, i) => {
              const required = Math.ceil(row.hours * mult);
              return (
                <tr
                  key={row.tier}
                  className={i < BASE_TIERS.length - 1 ? 'border-b' : ''}
                  style={{ borderColor: 'var(--c-border)' }}
                >
                  <td className="py-2.5 pr-4 max-md:pr-1.5">
                    <span className={`${row.color} font-pixel text-[10px] max-md:text-[9px]`}>
                      Tier {row.tier}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 max-md:pr-1.5">{required}+ hrs</td>
                  <td className="py-2.5 pr-4 max-md:pr-1.5">+{row.blocks} blocks</td>
                  <td className="py-2.5 t-text-muted">{row.chunks}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="t-text-muted text-[11px] mt-3">
        *Approximate new chunks at starting border (1,750 radius). Larger borders reveal more chunks per expansion.
      </p>
    </div>
  );
}
