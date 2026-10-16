// Pure + client-safe. Seasons only apply to the original pvpers routes; tenant
// sites (/s/*) and the platform pages keep the legacy look (no data-season).

// The four calendar seasons, three holidays that take over for a short
// window around the day itself (see `holidayForDate`), and four biomes that
// never come from the calendar — they're only picked from the toggle.
export type Season =
  | 'spring' | 'summer' | 'autumn' | 'winter'
  | 'halloween' | 'christmas' | 'easter'
  | 'birch' | 'darkforest' | 'jungle' | 'desert';
export type SeasonOverride = 'auto' | 'off' | Season;

// Seasons that have CSS tokens + scenery shipped. Any left out fall back to
// the default look and are skipped by calendar + toggle.
export const ENABLED_SEASONS: Season[] = [
  'spring', 'summer', 'autumn', 'winter', 'halloween', 'christmas', 'easter',
  'birch', 'darkforest', 'jungle', 'desert',
];

export const SEASON_STORAGE_KEY = 'mc-season';

export const SEASON_META: Record<Season, { label: string; accent: string; particles: string[] }> = {
  spring: { label: 'Spring', accent: '#F49AC1', particles: ['#F7B6D2', '#F49AC1', '#FFD6E7'] },
  summer: { label: 'Summer', accent: '#FFD23F', particles: ['#FFE566', '#FFD23F', '#FFF3B0'] },
  autumn: { label: 'Autumn', accent: '#D2691E', particles: ['#D2691E', '#B5451B', '#E8A317', '#8B3A12'] },
  winter: { label: 'Winter', accent: '#8FD3FF', particles: ['#FFFFFF', '#DCEBFA', '#B8D8F2'] },
  halloween: { label: 'Halloween', accent: '#FF7A1A', particles: ['#1A1024', '#24162E', '#3A2648'] }, // bats
  christmas: { label: 'Christmas', accent: '#E0303A', particles: ['#FFFFFF', '#F4F8FF', '#DCEBFA'] },
  easter: { label: 'Easter', accent: '#B48AE8', particles: ['#D8C2F4', '#FFE48A', '#F7B6D2', '#B8EAC8'] },
  birch: { label: 'Birch Forest', accent: '#B8D85A', particles: ['#C8E070', '#E4F0A0', '#A8C84A'] },
  darkforest: { label: 'Dark Forest', accent: '#7AC86A', particles: ['#9AE07A', '#C8F0A0', '#6AB85A'] }, // spores
  jungle: { label: 'Jungle', accent: '#3CB44A', particles: ['#3C9A2A', '#56B436', '#2A7A22', '#74C442'] },
  desert: { label: 'Desert', accent: '#E8B860', particles: ['#E8D0A0', '#DCC08A', '#F0DEB8'] }, // blown sand
};

const AZ_OFFSET_MS = -7 * 60 * 60 * 1000; // Arizona is UTC-7 year-round
const DAY_MS = 24 * 60 * 60 * 1000;

// Easter Sunday (Anonymous Gregorian algorithm), as a UTC midnight timestamp.
export function easterSunday(year: number): number {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31); // 3 = March, 4 = April
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return Date.UTC(year, month - 1, day);
}

// Holiday windows (Arizona dates, inclusive):
//   Halloween  Oct 20 – Oct 31
//   Christmas  Dec 1 – Dec 26
//   Easter     Palm Sunday – Easter Monday
export function holidayForDate(d: Date): Season | null {
  const az = new Date(d.getTime() + AZ_OFFSET_MS);
  const y = az.getUTCFullYear();
  const month = az.getUTCMonth();
  const day = az.getUTCDate();
  if (month === 9 && day >= 20) return 'halloween';
  if (month === 11 && day <= 26) return 'christmas';
  const fromEaster = (Date.UTC(y, month, day) - easterSunday(y)) / DAY_MS;
  if (fromEaster >= -7 && fromEaster <= 1) return 'easter';
  return null;
}

export function seasonForDate(d: Date): Season {
  const holiday = holidayForDate(d);
  if (holiday && ENABLED_SEASONS.includes(holiday)) return holiday;
  const month = new Date(d.getTime() + AZ_OFFSET_MS).getUTCMonth(); // 0-11
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

// Only the pvpers route group gets seasons. Keep in sync with the inline
// pre-paint script in app/layout.tsx.
const NON_SEASONAL_PREFIXES = ['/s/', '/dashboard', '/login', '/get-started', '/legal', '/api'];

export function isSeasonalPath(pathname: string): boolean {
  return !NON_SEASONAL_PREFIXES.some((p) => pathname === p.replace(/\/$/, '') || pathname.startsWith(p));
}

export function resolveSeason(override: SeasonOverride, now: Date = new Date()): Season | null {
  if (override === 'off') return null;
  const s = override === 'auto' ? seasonForDate(now) : override;
  return ENABLED_SEASONS.includes(s) ? s : null;
}

const ALL_SEASONS: readonly string[] = [
  'spring', 'summer', 'autumn', 'winter', 'halloween', 'christmas', 'easter',
  'birch', 'darkforest', 'jungle', 'desert',
];

export function parseOverride(raw: string | null): SeasonOverride {
  if (raw === 'off' || raw === 'auto') return raw;
  if (raw && ALL_SEASONS.includes(raw)) return raw as Season;
  return 'auto';
}

// Toggle order: auto → each enabled season → off → auto.
export const OVERRIDE_CYCLE: SeasonOverride[] = ['auto', ...ENABLED_SEASONS, 'off'];
