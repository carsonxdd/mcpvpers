import type { ForestTheme, LayerCfg, Sprite } from './ForestScene';
import { WINTER, WINTER_LAYERS, WINTER_SPRITES } from './WinterTaiga';

/* ───────────────────────── New Year's taiga ─────────────────────────
   The winter woods dressed for midnight: gold and silver baubles on the near
   spruce, firework rockets and lanterns stuck in the snow, a cake for the
   party, confetti on the drifts, and gold sparkles where fireflies would be. */

// Exported for the Fourth of July, which sets off the same rockets.
export const rocket = (tube: string, band: string): Sprite => ({
  rows: ['.W.', 'TTT', 'TBT', 'TTT', 'TBT', 'TTT', '.s.', '.s.', '.s.'],
  pal: { W: '#F4F4F4', T: tube, B: band, s: '#8A6A3A' },
});

const SPR: Record<string, Sprite> = {
  ...WINTER_SPRITES,
  rocketRed: rocket('#D8303A', '#F4C430'),
  rocketBlue: rocket('#3A5AD8', '#F4F4F4'),
  rocketGold: rocket('#E8B830', '#D8303A'),
  lantern: {
    rows: ['..k..', '.kkk.', 'kYYYk', 'kYWYk', 'kYYYk', 'kkkkk'],
    pal: { k: '#3A3A44', Y: '#FFC850', W: '#FFF4C0' },
  },
  cake: {
    rows: ['WWRWWWRWW', 'WWWWRWWWW', 'WdWWdWWdW', 'bbbbbbbbb', 'bBbbbbBbb', 'bbbbbbbbb'],
    pal: { W: '#F4F0EA', R: '#D8303A', d: '#E2D6CA', b: '#B8743A', B: '#8A5228' },
  },
  confetti: {
    rows: ['.R...Y..B.', 'Y..G..P..R'],
    pal: { R: '#E8304A', Y: '#F4C430', B: '#3A8AE8', G: '#3CB44A', P: '#C060D8' },
  },
};

const [far, mid, front] = WINTER_LAYERS;
const LAYERS: LayerCfg[] = [
  far,
  {
    ...mid,
    clutter: { gap: [14, 34], kinds: ['sapling', 'lantern', 'drift', 'rocketRed', 'confetti', 'snowRock', 'frostBush', 'rocketGold', 'stump'] },
    fauna: ['rabbit', 'fox'],
  },
  {
    ...front,
    clutter: { gap: [10, 26], kinds: ['lantern', 'sapling', 'rocketRed', 'confetti', 'drift', 'cake', 'rocketBlue', 'snowRock', 'lantern', 'rocketGold', 'confetti', 'frostBush', 'stump'] },
    fauna: ['wolf', 'snowGolem', 'campfire', 'fox'],
  },
];

export const NEW_YEAR: ForestTheme = {
  ...WINTER,
  layers: LAYERS,
  sprites: SPR,
  ornaments: ['#F4C430', '#E8E8F0', '#FFE48A', '#C8C8D8', '#F4C430', '#FFFFFF'],
  light: {
    ...WINTER.light,
    moon: '214, 220, 255',
    // Gold sparkles drifting between the trees at night
    fly: { core: '#FFF4C0', glow: '255, 214, 110', perLayer: [6, 9, 6] },
  },
};
