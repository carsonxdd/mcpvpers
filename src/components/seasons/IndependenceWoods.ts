import type { ForestTheme, LayerCfg, Sprite } from './ForestScene';
import { SUMMER, SUMMER_LAYERS, SUMMER_SPRITES } from './SummerWoods';
import { rocket } from './NewYearTaiga';

/* ───────────────────────── Fourth of July woods ─────────────────────────
   High summer for the Fourth: red, white and blue baubles strung through the
   near crowns, flags and firework rockets in the grass, a picnic blanket
   with watermelon, the farm animals out, and a full set of summer fireflies. */

const SPR: Record<string, Sprite> = {
  ...SUMMER_SPRITES,
  flag: {
    rows: [
      'Y.........',
      'pNWNRRRRRR',
      'pWNWWWWWWW',
      'pNWNRRRRRR',
      'pWWWWWWWWW',
      'pRRRRRRRRR',
      'p.........',
      'p.........',
      'p.........',
      'p.........',
    ],
    pal: { Y: '#F4C430', p: '#C8C8C8', N: '#2A3A8A', W: '#F8F8F8', R: '#C8262A' },
  },
  rocketRed: rocket('#D8303A', '#F4F4F4'),
  rocketBlue: rocket('#3A5AD8', '#F4F4F4'),
  rocketWhite: rocket('#F4F4F4', '#D8303A'),
  picnic: {
    rows: ['..GrrrrG..', '...GrrG...', 'RWRWRWRWRW', 'WRWRWRWRWR'],
    pal: { G: '#4A9A2A', r: '#E8384A', R: '#D02A34', W: '#F8F4EE' },
  },
};

const [far, mid, front] = SUMMER_LAYERS;
const LAYERS: LayerCfg[] = [
  far,
  {
    ...mid,
    clutter: { gap: [8, 24], kinds: ['tallGrass', 'flag', 'sunflower', 'fern', 'rocketRed', 'berryBush', 'poppy', 'cornflower', 'bush', 'oxeye'] },
    fauna: ['cow', 'fox'],
  },
  {
    ...front,
    clutter: { gap: [5, 16], kinds: ['tallGrass', 'flag', 'rocketRed', 'tallGrass', 'picnic', 'cornflower', 'rocketBlue', 'oxeye', 'melon', 'poppy', 'rocketWhite', 'sunflower', 'bush', 'flag', 'tallGrass'] },
    fauna: ['pig', 'fox', 'chicken'],
  },
];

export const JULY_4: ForestTheme = {
  ...SUMMER,
  layers: LAYERS,
  sprites: SPR,
  ornaments: ['#D8303A', '#F4F4F4', '#3A5AD8', '#D8303A', '#F4F4F4', '#3A5AD8'],
};
