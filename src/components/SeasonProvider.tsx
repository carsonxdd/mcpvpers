'use client';

import { createContext, useCallback, useContext, useEffect, useState, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import {
  SEASON_HOLIDAYS_KEY,
  SEASON_STORAGE_KEY,
  isSeasonalPath,
  parseOverride,
  resolveSeason,
  type Season,
  type SeasonOverride,
} from '@/lib/seasons';

const subscribeNoop = () => () => {};

function readOverride(): SeasonOverride {
  if (typeof window === 'undefined') return 'auto';
  try {
    return parseOverride(localStorage.getItem(SEASON_STORAGE_KEY));
  } catch {
    return 'auto';
  }
}

function readHolidays(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(SEASON_HOLIDAYS_KEY) === '1';
  } catch {
    return false;
  }
}

const SeasonContext = createContext<{
  season: Season | null;
  // The default look on the pvpers routes (no season) gets the oak forest.
  // False on tenant/platform routes, which keep the plain legacy backdrop.
  forest: boolean;
  // 'auto' = change with the calendar; anything else is a manual pick.
  override: SeasonOverride;
  // With a manual pick, holiday windows still take over.
  holidays: boolean;
  setOverride: (o: SeasonOverride) => void;
  setHolidays: (on: boolean) => void;
}>({ season: null, forest: false, override: 'auto', holidays: false, setOverride: () => {}, setHolidays: () => {} });

export function useSeason() {
  return useContext(SeasonContext);
}

// Unlike ThemeProvider this never hides children: the pre-paint script in
// layout.tsx already set data-season, and ThemeProvider owns the hydration gate.
export default function SeasonProvider({ children }: { children: React.ReactNode }) {
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const [override, setOverrideState] = useState<SeasonOverride>(readOverride);
  const [holidays, setHolidaysState] = useState<boolean>(readHolidays);
  const pathname = usePathname();

  // null on tenant/platform routes → no data-season → legacy look.
  const seasonal = mounted && isSeasonalPath(pathname);
  const season = seasonal ? resolveSeason(override, holidays) : null;
  const forest = seasonal && season === null;

  useEffect(() => {
    if (!mounted) return; // keep the pre-paint attribute until we know better
    const root = document.documentElement;
    if (season) root.setAttribute('data-season', season);
    else root.removeAttribute('data-season');
  }, [season, mounted]);

  const setOverride = useCallback((o: SeasonOverride) => {
    setOverrideState(o);
    try {
      localStorage.setItem(SEASON_STORAGE_KEY, o);
    } catch {}
  }, []);

  const setHolidays = useCallback((on: boolean) => {
    setHolidaysState(on);
    try {
      localStorage.setItem(SEASON_HOLIDAYS_KEY, on ? '1' : '0');
    } catch {}
  }, []);

  return (
    <SeasonContext.Provider value={{ season, forest, override, holidays, setOverride, setHolidays }}>
      {children}
    </SeasonContext.Provider>
  );
}
