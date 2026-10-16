// Pure + client-safe. Seasons only apply to the original pvpers routes; tenant
// sites (/s/*) and the platform pages keep the legacy look (no data-season).

// The four calendar seasons, eleven holidays that take over for a short
// window around the day itself (see `holidayForDate`), and four biomes that
// never come from the calendar — they're only picked from the toggle.
export type Season =
  | 'spring' | 'summer' | 'autumn' | 'winter'
  | 'newyear' | 'lunarnewyear' | 'valentines' | 'stpatricks' | 'easter' | 'cincodemayo' | 'mcbirthday'
  | 'july4' | 'halloween' | 'thanksgiving' | 'christmas'
  | 'birch' | 'darkforest' | 'jungle' | 'desert';
export type SeasonOverride = 'auto' | 'off' | Season;

// Seasons that have CSS tokens + scenery shipped. Any left out fall back to
// the default look and are skipped by calendar + toggle.
export const ENABLED_SEASONS: Season[] = [
  'spring', 'summer', 'autumn', 'winter',
  'newyear', 'lunarnewyear', 'valentines', 'stpatricks', 'easter', 'cincodemayo', 'mcbirthday', 'july4', 'halloween', 'thanksgiving', 'christmas',
  'birch', 'darkforest', 'jungle', 'desert',
];

export const SEASON_STORAGE_KEY = 'mc-season';

export const SEASON_META: Record<Season, { label: string; accent: string; particles: string[] }> = {
  spring: { label: 'Spring', accent: '#F49AC1', particles: ['#F7B6D2', '#F49AC1', '#FFD6E7'] },
  summer: { label: 'Summer', accent: '#FFD23F', particles: ['#FFE566', '#FFD23F', '#FFF3B0'] },
  autumn: { label: 'Autumn', accent: '#D2691E', particles: ['#D2691E', '#B5451B', '#E8A317', '#8B3A12'] },
  winter: { label: 'Winter', accent: '#8FD3FF', particles: ['#FFFFFF', '#DCEBFA', '#B8D8F2'] },
  newyear: { label: 'New Year', accent: '#E8B830', particles: ['#FFD24A', '#F4F4F4', '#FF6A8A', '#6AC8FF', '#B48AE8', '#7AE07A'] }, // confetti
  lunarnewyear: { label: 'Lunar New Year', accent: '#D8202A', particles: ['#D8202A', '#F4C430', '#F05A40', '#FFE48A'] }, // red and gold paper
  valentines: { label: "Valentine's", accent: '#E8406A', particles: ['#E8304A', '#F49AC1', '#FF6A8A', '#FFB6C8'] }, // hearts
  stpatricks: { label: "St. Patrick's", accent: '#2EB84A', particles: ['#2E9A3A', '#3CB44A', '#56C85A', '#1E7A2A'] }, // clovers
  cincodemayo: { label: 'Cinco de Mayo', accent: '#E8407A', particles: ['#E8407A', '#F4C430', '#2EA84A', '#3A8AE8', '#F49A1A', '#C060D8'] }, // confetti
  mcbirthday: { label: "Minecraft's Birthday", accent: '#5AB84A', particles: ['#E8304A', '#F4C430', '#3A8AE8', '#2EA84A', '#C060D8', '#5AE8E0'] }, // confetti
  july4: { label: 'Fourth of July', accent: '#D8303A', particles: ['#D8303A', '#F4F4F4', '#3A5AD8'] }, // confetti
  thanksgiving: { label: 'Thanksgiving', accent: '#C8762A', particles: ['#D2691E', '#B5451B', '#E8A317', '#8B3A12'] },
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

// US Thanksgiving (fourth Thursday of November), as a day of the month.
export function thanksgivingDay(year: number): number {
  const nov1 = new Date(Date.UTC(year, 10, 1)).getUTCDay();
  return 1 + ((4 - nov1 + 7) % 7) + 21;
}

// Lunar New Year's Day for 2026–2040, as days after Dec 31 (so 48 = Feb 17).
// Lunisolar, so a table instead of a formula: extend it before 2041 or the
// holiday quietly stops showing up.
const LUNAR_NEW_YEAR_FROM = 2026;
const LUNAR_NEW_YEAR_DAYS = [48, 37, 26, 44, 34, 23, 42, 31, 50, 39, 28, 46, 35, 24, 43];

// Lunar New Year's Day as a UTC midnight timestamp, or null outside the table.
export function lunarNewYear(year: number): number | null {
  const n = LUNAR_NEW_YEAR_DAYS[year - LUNAR_NEW_YEAR_FROM];
  return n === undefined ? null : Date.UTC(year, 0, n);
}

// Holiday windows (Arizona dates, inclusive):
//   New Year       Dec 30 – Jan 1
//   Lunar New Year the eve – three days after (late Jan / Feb; wins over Valentine's)
//   Valentine's    Feb 10 – Feb 14
//   St. Patrick's  Mar 14 – Mar 17 (wins over Easter in the rare years they overlap)
//   Easter         Palm Sunday – Easter Monday
//   Cinco de Mayo  May 1 – May 5
//   Minecraft      May 16 – May 18 (first public release May 17, 2009)
//   Fourth of July Jul 1 – Jul 5
//   Halloween      Oct 21 – Nov 2
//   Thanksgiving   the Monday – Sunday around the fourth Thursday of November
//   Christmas      Dec 1 – Dec 26
export const HOLIDAYS: Season[] = ['newyear', 'lunarnewyear', 'valentines', 'stpatricks', 'easter', 'cincodemayo', 'mcbirthday', 'july4', 'halloween', 'thanksgiving', 'christmas'];

export function holidayForDate(d: Date): Season | null {
  const az = new Date(d.getTime() + AZ_OFFSET_MS);
  const y = az.getUTCFullYear();
  const month = az.getUTCMonth();
  const day = az.getUTCDate();
  if ((month === 11 && day >= 30) || (month === 0 && day === 1)) return 'newyear';
  const lny = lunarNewYear(y);
  const fromLny = lny === null ? NaN : (Date.UTC(y, month, day) - lny) / DAY_MS;
  if (fromLny >= -1 && fromLny <= 3) return 'lunarnewyear';
  if (month === 1 && day >= 10 && day <= 14) return 'valentines';
  if (month === 2 && day >= 14 && day <= 17) return 'stpatricks';
  if (month === 4 && day >= 1 && day <= 5) return 'cincodemayo';
  if (month === 4 && day >= 16 && day <= 18) return 'mcbirthday';
  if (month === 6 && day >= 1 && day <= 5) return 'july4';
  if ((month === 9 && day >= 21) || (month === 10 && day <= 2)) return 'halloween';
  if (month === 10 && Math.abs(day - thanksgivingDay(y)) <= 3) return 'thanksgiving';
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

// `holidays`: with a manual pick (or Off), let holiday windows still take over.
export function resolveSeason(override: SeasonOverride, holidays = false, now: Date = new Date()): Season | null {
  if (override !== 'auto' && holidays) {
    const h = holidayForDate(now);
    if (h && ENABLED_SEASONS.includes(h)) return h;
  }
  if (override === 'off') return null;
  const s = override === 'auto' ? seasonForDate(now) : override;
  return ENABLED_SEASONS.includes(s) ? s : null;
}

export type ScheduleRun = { season: Season; start: { m: number; d: number }; end: { m: number; d: number }; current: boolean };

// What auto mode shows over the next `days` days, collapsed into runs of the
// same season. Walks Arizona calendar days so it always agrees with seasonForDate.
export function seasonSchedule(now: Date = new Date(), days = 366): ScheduleRun[] {
  const az = new Date(now.getTime() + AZ_OFFSET_MS);
  const day0 = Date.UTC(az.getUTCFullYear(), az.getUTCMonth(), az.getUTCDate());
  const runs: ScheduleRun[] = [];
  for (let i = 0; i < days; i++) {
    const t = day0 + i * DAY_MS;
    const s = seasonForDate(new Date(t - AZ_OFFSET_MS + DAY_MS / 2)); // Arizona noon
    const md = { m: new Date(t).getUTCMonth(), d: new Date(t).getUTCDate() };
    const last = runs[runs.length - 1];
    if (last && last.season === s) last.end = md;
    else runs.push({ season: s, start: md, end: md, current: i === 0 });
  }
  return runs;
}

export const SEASON_GROUPS: { label: string; seasons: Season[] }[] = [
  { label: 'Seasons', seasons: ['spring', 'summer', 'autumn', 'winter'] },
  { label: 'Holidays', seasons: ['newyear', 'lunarnewyear', 'valentines', 'stpatricks', 'easter', 'cincodemayo', 'mcbirthday', 'july4', 'halloween', 'thanksgiving', 'christmas'] },
  { label: 'Biomes', seasons: ['birch', 'darkforest', 'jungle', 'desert'] },
];

export const SEASON_HOLIDAYS_KEY = 'mc-season-holidays';

const ALL_SEASONS: readonly string[] = [
  'spring', 'summer', 'autumn', 'winter',
  'newyear', 'lunarnewyear', 'valentines', 'stpatricks', 'easter', 'cincodemayo', 'mcbirthday', 'july4', 'halloween', 'thanksgiving', 'christmas',
  'birch', 'darkforest', 'jungle', 'desert',
];

export function parseOverride(raw: string | null): SeasonOverride {
  if (raw === 'off' || raw === 'auto') return raw;
  if (raw && ALL_SEASONS.includes(raw)) return raw as Season;
  return 'auto';
}
