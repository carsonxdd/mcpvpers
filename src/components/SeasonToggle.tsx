'use client';

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { useSeason } from './SeasonProvider';
import {
  HOLIDAYS,
  SEASON_GROUPS,
  SEASON_META,
  resolveSeason,
  seasonSchedule,
  type Season,
  type SeasonOverride,
} from '@/lib/seasons';

const subscribeNoop = () => () => {};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmt = (md: { m: number; d: number }) => `${MONTHS[md.m]} ${md.d}`;

// The plain look (override 'off') is the vanilla oak woods.
const OAK_LABEL = 'Oak Woods';
const OAK_ACCENT = '#5A9A3A';

function label(override: SeasonOverride, shown: Season | null): string {
  const name = shown ? SEASON_META[shown].label : OAK_LABEL;
  return override === 'auto' ? `Theme: ${name} (auto)` : `Theme: ${name}`;
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
  newyear: [ // firework burst
    'R..A..P.',
    '.R.A.P..',
    '..RWP...',
    'AAWWWAA.',
    '..PWR...',
    '.P.A.R..',
    'P..A..R.',
    '........',
  ],
  lunarnewyear: [ // paper lantern
    '...Y....',
    '..KKK...',
    '.AAAAA..',
    'AAYAYAA.',
    'AAYAYAA.',
    '.AAAAA..',
    '..KKK...',
    '...Y....',
  ],
  cincodemayo: [ // sombrero
    '........',
    '...YY...',
    '..YYYY..',
    '..AAAA..',
    'YYYYYYYY',
    '.YYYYYY.',
    '........',
    '........',
  ],
  mcbirthday: [ // creeper
    'AAAAAAAA',
    'AKKAAKKA',
    'AKKAAKKA',
    'AAAKKAAA',
    'AAKKKKAA',
    'AAKKKKAA',
    'AAKAAKAA',
    'AAAAAAAA',
  ],
  valentines: [ // heart
    '........',
    '.AA.AA..',
    'AWAAAAA.',
    'AAAAAAA.',
    '.AAAAA..',
    '..AAA...',
    '...A....',
    '........',
  ],
  stpatricks: [ // four-leaf clover
    '.AA.AA..',
    'AAAGAAA.',
    'AAAGAAA.',
    '.GGGGG..',
    'AAAGAAA.',
    'AAAGAAA.',
    '.AA.AAG.',
    '.......G',
  ],
  july4: [ // flag
    'NWNWAAAA',
    'WNWNWWWW',
    'NWNWAAAA',
    'WWWWWWWW',
    'AAAAAAAA',
    'WWWWWWWW',
    'AAAAAAAA',
    '........',
  ],
  thanksgiving: [ // turkey
    '.AOA....',
    'AOYOA...',
    'OYAYO.BB',
    'AOYOA.BK',
    '.ABBBBBR',
    '..BBBBB.',
    '...Y.Y..',
    '..YY.YY.',
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
  birch: [ // birch sapling: leaves over a marked white log
    '..AAAA..',
    '.AAAAAA.',
    '.AAAAAA.',
    '..AAAA..',
    '...WW...',
    '...KW...',
    '...WK...',
    '...WW...',
  ],
  darkforest: [ // red mushroom
    '..RRRR..',
    '.RWRRRR.',
    'RRRRRWRR',
    'RWRRRRRR',
    '...WW...',
    '...WW...',
    '..AWWA..',
    '.AAAAAA.',
  ],
  jungle: [ // cocoa pod hanging off a leaf
    'AAAA....',
    '.AAAA...',
    '..AAAB..',
    '....B...',
    '...OOO..',
    '..OoOOO.',
    '..OOOoO.',
    '...OOO..',
  ],
  desert: [ // cactus on sand
    '...GG...',
    '...GG..G',
    'G..GG..G',
    'G..GGGGG',
    'GGGGG...',
    '...GG...',
    '...GG...',
    'AAAAAAAA',
  ],
};
const OAK_ICON = [
  '..AAAA..',
  '.AAAAAA.',
  'AAAAAAAA',
  'AAAAAAAA',
  '.AAAAAA.',
  '...BB...',
  '...BB...',
  '..GGGG..',
];
const FIXED: Record<string, string> = {
  Y: '#FFE066', B: '#8B5A2B', G: '#4A8A2A', K: '#2A1408', P: '#F49AC1',
  W: '#ECECE4', R: '#C8262A', O: '#B8641E', o: '#8A4414', N: '#2A3A8A',
};

// season null = the plain oak woods.
function SeasonIcon({ season, size = 16 }: { season: Season | null; size?: number }) {
  const rows = season ? ICONS[season] : OAK_ICON;
  const accent = season ? SEASON_META[season].accent : OAK_ACCENT;
  return (
    <svg width={size} height={size} viewBox="0 0 8 8" shapeRendering="crispEdges" aria-hidden="true">
      {rows.flatMap((row, y) =>
        [...row].map((c, x) => (c === '.' ? null : <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={c === 'A' ? accent : FIXED[c]} />)),
      )}
    </svg>
  );
}

function Switch({ on, onChange, label, hint, disabled }: {
  on: boolean; onChange: (on: boolean) => void; label: string; hint: string; disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={() => onChange(!on)}
      className={`w-full flex items-start gap-3 text-left rounded-md px-2 py-2 hover-surface cursor-pointer focus-visible:outline-2 focus-visible:outline-gold/60 disabled:opacity-40 disabled:cursor-not-allowed ${disabled ? 'pointer-events-none' : ''}`}
    >
      <span className={`mt-0.5 shrink-0 w-8 h-[18px] rounded-sm p-[2px] transition-colors ${on ? 'bg-gold' : 'bg-[color-mix(in_srgb,var(--c-text-muted)_45%,transparent)]'}`}>
        <span className={`block w-[14px] h-[14px] rounded-[2px] bg-white shadow transition-transform ${on ? 'translate-x-[14px]' : ''}`} />
      </span>
      <span>
        <span className="block text-[13px] t-text">{label}</span>
        <span className="block text-[11px] t-text-muted leading-snug">{hint}</span>
      </span>
    </button>
  );
}

function Tile({ season, selected, badge, onClick }: {
  season: Season | null; selected: boolean; badge?: string; onClick: () => void;
}) {
  const name = season ? SEASON_META[season].label : OAK_LABEL;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`relative flex flex-col items-center gap-1 rounded-md border px-1 pt-2 pb-1.5 hover-surface cursor-pointer focus-visible:outline-2 focus-visible:outline-gold/60 transition-colors ${
        selected ? 'border-gold bg-[color-mix(in_srgb,var(--color-gold)_12%,transparent)]' : 't-border-30'
      }`}
    >
      <SeasonIcon season={season} size={24} />
      <span className={`text-[11px] leading-tight text-center ${selected ? 't-text' : 't-text-dim'}`}>{name}</span>
      {badge && (
        <span className="absolute -top-1.5 -right-1 font-pixel text-[7px] px-1 py-0.5 rounded-sm bg-gold text-black">{badge}</span>
      )}
    </button>
  );
}

export default function SeasonToggle() {
  const { override: storedOverride, holidays: storedHolidays, setOverride, setHolidays } = useSeason();
  // Settings come from localStorage; render as Auto until hydrated so SSR matches.
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const override = mounted ? storedOverride : 'auto';
  const holidays = mounted && storedHolidays;
  const auto = override === 'auto';
  // What's on screen right now (the header only renders on seasonal routes).
  const shown = resolveSeason(override, holidays);
  const calendarNow = resolveSeason('auto');
  const text = label(override, shown);

  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  // Recomputed on open so a page left up past midnight shows the right "now".
  const schedule = useMemo(() => (open ? seasonSchedule().slice(0, 12) : []), [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); buttonRef.current?.focus(); }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Turning auto off keeps whatever is showing, so nothing jumps.
  const toggleAuto = (on: boolean) => setOverride(on ? 'auto' : (calendarNow ?? 'off'));
  const pick = (s: Season | null) => setOverride(s ?? 'off');
  const isSelected = (s: Season | null) => (auto ? s === calendarNow : (override === 'off' ? s === null : s === override));

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen((o) => !o)}
        className="w-8 h-8 max-md:w-11 max-md:h-11 flex items-center justify-center rounded-md hover-surface focus-visible:outline-2 focus-visible:outline-gold/60 active:bg-[color-mix(in_srgb,var(--c-surface)_50%,transparent)] transition-colors cursor-pointer"
        title={text}
        aria-label={text}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <SeasonIcon season={shown} />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Choose a theme"
          className="absolute right-0 top-full mt-2 w-[340px] max-md:fixed max-md:top-16 max-md:left-4 max-md:right-4 max-md:w-auto max-h-[calc(100vh-5rem)] overflow-y-auto rounded-md border backdrop-blur-md shadow-lg z-50 t-bg-95 t-border-30 p-3"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="font-pixel text-[10px] uppercase tracking-wider text-gold">Theme</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="w-7 h-7 max-md:w-10 max-md:h-10 flex items-center justify-center rounded-md hover-surface t-text-dim cursor-pointer focus-visible:outline-2 focus-visible:outline-gold/60"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>

          <Switch
            on={auto}
            onChange={toggleAuto}
            label="Change with the calendar"
            hint="Follows the seasons and switches for holidays, from New Year's to Christmas."
          />
          <Switch
            on={auto || holidays}
            onChange={setHolidays}
            disabled={auto}
            label="Holidays still take over"
            hint="Keep your pick most of the year, but show holiday themes during their windows."
          />

          {SEASON_GROUPS.map((g) => (
            <div key={g.label} className="mt-3">
              <p className="px-1 mb-1.5 font-pixel text-[8px] uppercase tracking-wider t-text-muted">{g.label}</p>
              <div className="grid grid-cols-4 gap-1.5">
                {g.seasons.map((s) => (
                  <Tile key={s} season={s} selected={isSelected(s)} badge={auto && s === calendarNow ? 'AUTO' : undefined} onClick={() => pick(s)} />
                ))}
              </div>
            </div>
          ))}
          <div className="mt-3">
            <p className="px-1 mb-1.5 font-pixel text-[8px] uppercase tracking-wider t-text-muted">Classic</p>
            <div className="grid grid-cols-4 gap-1.5">
              <Tile season={null} selected={isSelected(null)} onClick={() => pick(null)} />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t t-border-30">
            <p className="px-1 font-pixel text-[8px] uppercase tracking-wider t-text-muted">Calendar</p>
            <p className="px-1 mt-1 mb-2 text-[11px] t-text-muted leading-snug">
              {auto
                ? 'What the site switches to on its own (Arizona time).'
                : holidays
                  ? 'Auto-change is off. Only the holidays below will still show.'
                  : 'Auto-change is off, so these only show if you turn it back on.'}
            </p>
            <ul className="space-y-0.5">
              {schedule.map((r) => {
                const isHoliday = HOLIDAYS.includes(r.season);
                const live = auto || (holidays && isHoliday);
                return (
                  <li
                    key={`${r.season}-${r.start.m}-${r.start.d}`}
                    className={`flex items-center gap-2 px-1 py-1 rounded-sm text-[12px] ${r.current && live ? 'bg-[color-mix(in_srgb,var(--color-gold)_10%,transparent)]' : ''} ${live ? '' : 'opacity-50'}`}
                  >
                    <SeasonIcon season={r.season} size={14} />
                    <span className={`flex-1 ${isHoliday ? 't-text' : 't-text-dim'}`}>{SEASON_META[r.season].label}</span>
                    <span className="t-text-muted tabular-nums">
                      {r.current ? 'Now' : fmt(r.start)} – {fmt(r.end)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
