'use client';

import { useSyncExternalStore } from 'react';
import { useSeason } from './SeasonProvider';

const subscribeNoop = () => () => {};
import { SEASON_META, seasonForDate, type Season, type SeasonOverride } from '@/lib/seasons';

function label(override: SeasonOverride): string {
  if (override === 'auto') return 'Season: Auto';
  if (override === 'off') return 'Season: Off';
  return `Season: ${SEASON_META[override].label}`;
}

// 8×8 pixel icons, one per season. 'A' = accent colour; other letters are fixed.
const ICONS: Record<Season, string[]> = {
  spring: [ // blossom
    '...AA...',
    '..AAAA..',
    'AA.AA.AA',
    'AAAYYAAA',
    '.AAYYAA.',
    '..A..A..',
    '.AA..AA.',
    '........',
  ],
  summer: [ // sun
    'A..AA..A',
    '..AAAA..',
    '.AAAAAA.',
    'AAAAAAAA',
    'AAAAAAAA',
    '.AAAAAA.',
    '..AAAA..',
    'A..AA..A',
  ],
  autumn: [ // leaf
    '........',
    '....AA..',
    '...AAAA.',
    '..AAAAA.',
    '..AAAA..',
    '..BAA...',
    '.B......',
    '........',
  ],
  winter: [ // snowflake
    '...A....',
    '.A.A.A..',
    '..AAA...',
    'AAAAAAA.',
    '..AAA...',
    '.A.A.A..',
    '...A....',
    '........',
  ],
  halloween: [ // jack o'lantern
    '...GG...',
    '.AAAAAA.',
    'AAKAAKAA',
    'AKKAAKKA',
    'AAAAAAAA',
    'AKAKKAKA',
    '.AKKKKA.',
    '..AAAA..',
  ],
  christmas: [ // present
    '..Y..Y..',
    '...YY...',
    'AAAYYAAA',
    'AAAYYAAA',
    'YYYYYYYY',
    'AAAYYAAA',
    'AAAYYAAA',
    'AAAYYAAA',
  ],
  easter: [ // painted egg
    '...AA...',
    '..AAAA..',
    '.AAAAAA.',
    '.YYYYYY.',
    '.AAAAAA.',
    '.PAPAPA.',
    '..AAAA..',
    '...AA...',
  ],
};
const FIXED: Record<string, string> = { Y: '#FFE066', B: '#8B5A2B', G: '#4A8A2A', K: '#2A1408', P: '#F49AC1' };

function SeasonIcon({ season, color }: { season: Season; color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 8 8" shapeRendering="crispEdges" aria-hidden="true">
      {ICONS[season].flatMap((row, y) =>
        [...row].map((c, x) => (c === '.' ? null : <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={c === 'A' ? color : FIXED[c]} />)),
      )}
    </svg>
  );
}

export default function SeasonToggle() {
  const season = useSeason();
  // The override comes from localStorage; render as Auto until hydrated so SSR matches.
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const override = mounted ? season.override : 'auto';
  const { cycle } = season;
  const text = label(override);
  // Off shows the leaf in the text colour; Auto shows the current calendar season.
  const shown: Season = override === 'off' ? 'autumn' : override === 'auto' ? seasonForDate(new Date()) : override;
  const color = override === 'off' ? 'currentColor' : SEASON_META[shown].accent;

  return (
    <button
      onClick={cycle}
      className={`w-8 h-8 max-md:w-11 max-md:h-11 flex items-center justify-center rounded-md hover-surface focus-visible:outline-2 focus-visible:outline-gold/60 active:bg-[color-mix(in_srgb,var(--c-surface)_50%,transparent)] transition-colors cursor-pointer ${override === 'off' ? 't-text-muted opacity-60' : ''}`}
      title={text}
      aria-label={text}
    >
      <SeasonIcon season={shown} color={color} />
    </button>
  );
}
