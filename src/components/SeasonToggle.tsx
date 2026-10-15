'use client';

import { useSeason } from './SeasonProvider';
import { SEASON_META, seasonForDate, type SeasonOverride } from '@/lib/seasons';

function label(override: SeasonOverride): string {
  if (override === 'auto') return 'Season: Auto';
  if (override === 'off') return 'Season: Off';
  return `Season: ${SEASON_META[override].label}`;
}

// Pixel-art leaf drawn from rects, matching the other pixel sprites.
function LeafIcon({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 8 8" shapeRendering="crispEdges" aria-hidden="true">
      <rect x="4" y="1" width="2" height="1" fill={color} />
      <rect x="3" y="2" width="4" height="1" fill={color} />
      <rect x="2" y="3" width="5" height="1" fill={color} />
      <rect x="2" y="4" width="4" height="1" fill={color} />
      <rect x="2" y="5" width="3" height="1" fill={color} />
      <rect x="1" y="6" width="1" height="1" fill="#8B5A2B" />
      <rect x="2" y="5" width="1" height="1" fill="#8B5A2B" />
    </svg>
  );
}

export default function SeasonToggle() {
  const { override, cycle } = useSeason();
  const text = label(override);
  const color = override === 'off' ? 'currentColor' : SEASON_META[override === 'auto' ? seasonForDate(new Date()) : override].accent;

  return (
    <button
      onClick={cycle}
      className={`w-8 h-8 max-md:w-11 max-md:h-11 flex items-center justify-center rounded-md hover-surface focus-visible:outline-2 focus-visible:outline-gold/60 active:bg-[color-mix(in_srgb,var(--c-surface)_50%,transparent)] transition-colors cursor-pointer ${override === 'off' ? 't-text-muted opacity-60' : ''}`}
      title={text}
      aria-label={text}
    >
      <LeafIcon color={color} />
    </button>
  );
}
