import type { ForestTheme, LayerCfg, Sprite } from './ForestScene';
import { WINTER, WINTER_LAYERS, WINTER_SPRITES } from './WinterTaiga';

/* ───────────────────────── Lunar New Year taiga ─────────────────────────
   The winter woods lit for the new year: red and gold baubles hung like
   lanterns through the near spruce, plum blossom crowns among them, paper
   lanterns on posts, firecracker strings, mandarin trees, red envelopes in
   the snow, a lion-dance head, and warm gold sparks at night.               */

const SPR: Record<string, Sprite> = {
  ...WINTER_SPRITES,
  paperLantern: {
    rows: ['...Y...', '..kkk..', '.RRRRR.', 'RRrRrRR', 'RRrRrRR', 'RRrRrRR', '.RRRRR.', '..kkk..', '...Y...', '...Y...', '...p...', '...p...', '...p...', '...p...'],
    pal: { Y: '#F4C430', k: '#3A2A1A', R: '#D8202A', r: '#F05A40', p: '#6A4A2A' },
  },
  firecrackers: {
    rows: ['..s..', '..s..', '.RsR.', '.RYR.', 'RYsRY', '.RsR.', 'RYsYR', '.RsR.', '..s..'],
    pal: { s: '#8A6A3A', R: '#D8202A', Y: '#F4C430' },
  },
  mandarinTree: {
    rows: ['..GGGG..', '.GOGGOG.', 'GGGGOGGG', 'GOGGGGOG', '.GGOGGG.', '..GGGG..', '...bb...', '.RRRRRR.', '.RYYYYR.', '..RRRR..'],
    pal: { G: '#2E6A2A', O: '#F08A1A', b: '#5A3A22', R: '#B81E24', Y: '#F4C430' },
  },
  envelope: {
    rows: ['RRRRRR', 'RRYYRR', 'RRYYRR', 'RRRRRR'],
    pal: { R: '#D8202A', Y: '#F4C430' },
  },
  // Facing right
  lionHead: {
    rows: ['..YYYYYY..', '.YRRRRRRY.', 'YRWkRRWkRY', 'YRRRRRRRRY', 'YRRGGGGRRY', 'YRWWWWWWRY', '.YRRRRRRY.', '..YYYYYY..'],
    pal: { Y: '#F4C430', R: '#D8202A', W: '#F8F4EA', k: '#1A1A1A', G: '#2EA84A' },
  },
};

const PAL_PLUM_MID = ['#7A1A2A', '#9A2438', '#BA3A4E', '#D45A6A', '#EC8A94'];
const PAL_PLUM_FRONT = ['#6A1424', '#8A2032', '#AA3246', '#C84E60', '#E27C88'];

const [far, mid, front] = WINTER_LAYERS;
const LAYERS: LayerCfg[] = [
  far,
  {
    ...mid,
    crownPals: [...mid.crownPals, PAL_PLUM_MID],
    clutter: { gap: [14, 34], kinds: ['paperLantern', 'sapling', 'drift', 'firecrackers', 'snowRock', 'mandarinTree', 'frostBush', 'paperLantern', 'stump'] },
    fauna: ['rabbit', 'fox'],
  },
  {
    ...front,
    crownPals: [...front.crownPals, PAL_PLUM_FRONT],
    clutter: { gap: [10, 26], kinds: ['paperLantern', 'envelope', 'firecrackers', 'drift', 'mandarinTree', 'sapling', 'paperLantern', 'snowRock', 'envelope', 'lionHead', 'frostBush', 'firecrackers', 'stump'] },
    fauna: ['wolf', 'campfire', 'fox'],
  },
];

export const LUNAR_NEW_YEAR: ForestTheme = {
  ...WINTER,
  layers: LAYERS,
  sprites: SPR,
  ornaments: ['#D8202A', '#F4C430', '#D8202A', '#F05A40', '#D8202A', '#FFE48A'],
  light: {
    ...WINTER.light,
    sun: '255, 236, 214',
    moon: '255, 226, 200',
    // Warm lantern sparks drifting between the trees at night
    fly: { core: '#FFE0A0', glow: '255, 120, 70', perLayer: [5, 8, 5] },
  },
  veil: 'rgba(250, 240, 236, 0.22)',
};
