'use client';

import type { Season } from '@/lib/seasons';
import ForestScene, { type ForestTheme } from './ForestScene';
import OakVanilla from './OakVanilla';
import { AUTUMN } from './AutumnWoods';
import { SPRING } from './SpringBloom';
import { SUMMER } from './SummerWoods';
import { WINTER } from './WinterTaiga';
import { HALLOWEEN } from './HalloweenWoods';
import { CHRISTMAS } from './ChristmasTaiga';
import { EASTER } from './EasterMeadow';
import { NEW_YEAR } from './NewYearTaiga';
import { VALENTINES } from './ValentineGrove';
import { ST_PATRICKS } from './CloverGlen';
import { JULY_4 } from './IndependenceWoods';
import { THANKSGIVING } from './HarvestWoods';
import { LUNAR_NEW_YEAR } from './LanternTaiga';
import { CINCO_DE_MAYO } from './FiestaFringe';
import { MC_BIRTHDAY } from './BirthdayWoods';
import { BIRCH } from './BirchForest';
import { DARK_FOREST } from './DarkForest';
import { JUNGLE } from './JungleWoods';
import { DESERT } from './DesertFringe';

// Every look is a ForestTheme painted by ForestScene; each lives in its own file.
const THEMES: Record<Season, ForestTheme> = {
  spring: SPRING, summer: SUMMER, autumn: AUTUMN, winter: WINTER,
  newyear: NEW_YEAR, lunarnewyear: LUNAR_NEW_YEAR, valentines: VALENTINES, stpatricks: ST_PATRICKS, easter: EASTER,
  cincodemayo: CINCO_DE_MAYO, mcbirthday: MC_BIRTHDAY, july4: JULY_4, halloween: HALLOWEEN, thanksgiving: THANKSGIVING, christmas: CHRISTMAS,
  birch: BIRCH, darkforest: DARK_FOREST, jungle: JUNGLE, desert: DESERT,
};

// `season` is null on the default look, which gets the vanilla oak woods.
export default function Scenery({ season, dark, raining }: { season: Season | null; dark: boolean; raining: boolean }) {
  if (season === null) return <OakVanilla key="oak" dark={dark} raining={raining} />;
  return <ForestScene key={season} theme={THEMES[season]} dark={dark} raining={raining} />;
}
