import type { ForestTheme, LayerCfg, Sprite } from './ForestScene';
import { SUMMER, SUMMER_LAYERS, SUMMER_SPRITES } from './SummerWoods';

/* ───────────────────────── St. Patrick's clover glen ─────────────────────────
   The summer woods in their brightest emerald: clover patches all over the
   floor, a cauldron of gold, emerald ore poking out of the rocks, a dropped
   green hat, frogs and a dyed-green sheep, and green-gold fireflies.          */

const SPR: Record<string, Sprite> = {
  ...SUMMER_SPRITES,
  clover: {
    rows: ['.G.G...G.G.', 'GgGgG.GgGgG', '.GgG...GgG.', '..s.....s..'],
    pal: { G: '#3CB44A', g: '#2A8A36', s: '#2A6A22' },
  },
  potOfGold: {
    rows: ['.YyYYyY.', 'YYYyYYYY', 'kKKKKKKk', 'kKkkkkKk', 'kKkkkkKk', 'kKkkkkKk', '.kKkkKk.', '.k....k.'],
    pal: { Y: '#F4C430', y: '#FFE48A', K: '#4A4A52', k: '#2A2A30' },
  },
  emeraldRock: {
    rows: ['..SSSS..', '.SeSSsS.', 'SSSSeSSS', 'SeSsSSeS', 'dddddddd'],
    pal: { S: '#8A8A88', s: '#A8A8A4', d: '#5E5E5A', e: '#2ED870' },
  },
  hat: {
    rows: ['..GGGG..', '..GgGG..', '..kYkk..', 'GGGGGGGG'],
    pal: { G: '#1E8A3A', g: '#2EA84A', k: '#1A1A1A', Y: '#F4C430' },
  },
  // Facing right
  frog: {
    rows: ['.......kW.kW', '......GGGGGG', '.GGGGGGGGGGG', 'GgGGgGGGGmmm', 'GGGGGGGGGGG.', '.ll.....ll..'],
    pal: { G: '#5A9A3A', g: '#46802C', k: '#111111', W: '#F4E8C8', m: '#C88A5A', l: '#46802C' },
  },
  greenSheep: {
    ...SUMMER_SPRITES.sheep,
    pal: { ...SUMMER_SPRITES.sheep.pal, o: '#2E6A20', w: '#5AAE3A', W: '#4A962E' },
  },
};

const PAL_EMERALD_MID = ['#145A24', '#1E7230', '#2A8C3C', '#3CA84E', '#56C462'];
const PAL_EMERALD_FRONT = ['#105020', '#18682C', '#228238', '#349E48', '#4CBA5C'];

const [far, mid, front] = SUMMER_LAYERS;
const LAYERS: LayerCfg[] = [
  far,
  {
    ...mid,
    crownPals: [...mid.crownPals, PAL_EMERALD_MID],
    clutter: { gap: [8, 24], kinds: ['tallGrass', 'clover', 'fern', 'emeraldRock', 'clover', 'bush', 'dandelion', 'clover'] },
    fauna: ['frog', 'cow'],
  },
  {
    ...front,
    crownPals: [...front.crownPals, PAL_EMERALD_FRONT],
    clutter: { gap: [5, 16], kinds: ['tallGrass', 'clover', 'potOfGold', 'clover', 'fern', 'emeraldRock', 'tallGrass', 'clover', 'hat', 'bush', 'mushroomRed', 'clover', 'oxeye'] },
    fauna: ['greenSheep', 'frog', 'fox', 'chicken'],
  },
];

export const ST_PATRICKS: ForestTheme = {
  ...SUMMER,
  layers: LAYERS,
  sprites: SPR,
  light: {
    ...SUMMER.light,
    sun: '240, 255, 200',
    fly: { core: '#E8FFB0', glow: '150, 240, 110', perLayer: [10, 14, 8] },
  },
  shade: ['rgba(6, 34, 14, 0.1)', 'rgba(6, 34, 14, 0.4)'],
  veil: 'rgba(240, 250, 238, 0.22)',
};
