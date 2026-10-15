// Pure + client-safe. Seasons only apply to the original pvpers routes; tenant
// sites (/s/*) and the platform pages keep the legacy look (no data-season).

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type SeasonOverride = 'auto' | 'off' | Season;

// Seasons that have CSS tokens + scenery shipped. Any left out fall back to
// the default look and are skipped by calendar + toggle.
export const ENABLED_SEASONS: Season[] = ['spring', 'summer', 'autumn', 'winter'];

export const SEASON_STORAGE_KEY = 'mc-season';

export const SEASON_META: Record<Season, { label: string; accent: string; particles: string[] }> = {
  spring: { label: 'Spring', accent: '#F49AC1', particles: ['#F7B6D2', '#F49AC1', '#FFD6E7'] },
  summer: { label: 'Summer', accent: '#FFD23F', particles: ['#FFE566', '#FFD23F', '#FFF3B0'] },
  autumn: { label: 'Autumn', accent: '#D2691E', particles: ['#D2691E', '#B5451B', '#E8A317', '#8B3A12'] },
  winter: { label: 'Winter', accent: '#8FD3FF', particles: ['#FFFFFF', '#DCEBFA', '#B8D8F2'] },
};

const AZ_OFFSET_MS = -7 * 60 * 60 * 1000; // Arizona is UTC-7 year-round

export function seasonForDate(d: Date): Season {
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

export function parseOverride(raw: string | null): SeasonOverride {
  if (raw === 'off' || raw === 'auto') return raw;
  if (raw === 'spring' || raw === 'summer' || raw === 'autumn' || raw === 'winter') return raw;
  return 'auto';
}

// Toggle order: auto → each enabled season → off → auto.
export const OVERRIDE_CYCLE: SeasonOverride[] = ['auto', ...ENABLED_SEASONS, 'off'];
