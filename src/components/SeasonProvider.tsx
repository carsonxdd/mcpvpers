'use client';

import { createContext, useCallback, useContext, useEffect, useState, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import {
  OVERRIDE_CYCLE,
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

const SeasonContext = createContext<{
  season: Season | null;
  // The default look on the pvpers routes (no season) gets the oak forest.
  // False on tenant/platform routes, which keep the plain legacy backdrop.
  forest: boolean;
  override: SeasonOverride;
  cycle: () => void;
}>({ season: null, forest: false, override: 'auto', cycle: () => {} });

export function useSeason() {
  return useContext(SeasonContext);
}

// Unlike ThemeProvider this never hides children: the pre-paint script in
// layout.tsx already set data-season, and ThemeProvider owns the hydration gate.
export default function SeasonProvider({ children }: { children: React.ReactNode }) {
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const [override, setOverride] = useState<SeasonOverride>(readOverride);
  const pathname = usePathname();

  // null on tenant/platform routes → no data-season → legacy look.
  const seasonal = mounted && isSeasonalPath(pathname);
  const season = seasonal ? resolveSeason(override) : null;
  const forest = seasonal && season === null;

  useEffect(() => {
    if (!mounted) return; // keep the pre-paint attribute until we know better
    const root = document.documentElement;
    if (season) root.setAttribute('data-season', season);
    else root.removeAttribute('data-season');
  }, [season, mounted]);

  const cycle = useCallback(() => {
    setOverride((prev) => {
      const next = OVERRIDE_CYCLE[(OVERRIDE_CYCLE.indexOf(prev) + 1) % OVERRIDE_CYCLE.length];
      try {
        localStorage.setItem(SEASON_STORAGE_KEY, next);
      } catch {}
      return next;
    });
  }, []);

  return <SeasonContext.Provider value={{ season, forest, override, cycle }}>{children}</SeasonContext.Provider>;
}
