import type { ForestTheme, LayerCfg, Sprite } from './ForestScene';
import { SPRING, SPRING_LAYERS, SPRING_SPRITES } from './SpringBloom';

/* ───────────────────────── Valentine's rose grove ─────────────────────────
   The spring grove gone romantic: rose-red crowns among the cherry, red and
   pink baubles like blossom, roses and rose bushes, heart topiaries and the
   odd love letter on the floor, pink sheep, and pink fireflies at night.    */

const SPR: Record<string, Sprite> = {
  ...SPRING_SPRITES,
  rose: {
    rows: ['.RR.', 'RrRR', '.RR.', '.g..', 'gg..', '.g..', '.gg.'],
    pal: { R: '#D8203A', r: '#9A1428', g: '#3B7A2A' },
  },
  roseBush: {
    rows: ['.R.RR.', 'RRgRRR', 'gRRgRg', '.gRRg.', 'RRgggR', 'gRggRg', '.gggg.', '..gg..'],
    pal: { R: '#C8203A', g: '#2E6A28' },
  },
  heartBush: {
    rows: ['.HH.HH.', 'HhHHHHH', 'HHHHHhH', '.HHHHH.', '..HhH..', '...H...', '...b...', '...b...'],
    pal: { H: '#E84A6A', h: '#FF8AA4', b: '#6A4A2A' },
  },
  letter: {
    rows: ['WWWWWWW', 'WwWWWwW', 'WWwRwWW', 'WWWWWWW'],
    pal: { W: '#F8F2EA', w: '#D8CCC0', R: '#D8203A' },
  },
  pinkSheep: {
    ...SPRING_SPRITES.sheep,
    pal: { ...SPRING_SPRITES.sheep.pal, o: '#B8788E', w: '#F6B8CE', W: '#E49AB4' },
  },
};

const PAL_ROSE_FAR = ['#B07888', '#BE8898', '#CC9AA8', '#D8ACB8', '#E4C0CA'];
const PAL_ROSE_MID = ['#7A1E30', '#9C2A40', '#BE3C52', '#DA5A6E', '#F08494'];
const PAL_ROSE_FRONT = ['#6A1828', '#8C2438', '#AE344A', '#CC5064', '#E6788C'];

const [far, mid, front] = SPRING_LAYERS;
const LAYERS: LayerCfg[] = [
  { ...far, crownPals: [...far.crownPals, PAL_ROSE_FAR] },
  {
    ...mid,
    crownPals: [...mid.crownPals, PAL_ROSE_MID],
    clutter: { gap: [10, 26], kinds: ['tallGrass', 'petals', 'rose', 'heartBush', 'tulipPink', 'tulipRed', 'roseBush', 'fern', 'bush'] },
    fauna: ['pinkSheep', 'rabbit'],
  },
  {
    ...front,
    crownPals: [...front.crownPals, PAL_ROSE_FRONT],
    clutter: { gap: [6, 16], kinds: ['tallGrass', 'petals', 'rose', 'roseBush', 'heartBush', 'letter', 'tulipPink', 'tulipRed', 'rose', 'lilac', 'petals', 'heartBush', 'fern', 'rose'] },
    fauna: ['pinkSheep', 'lamb', 'rabbit', 'chicken'],
  },
];

export const VALENTINES: ForestTheme = {
  ...SPRING,
  layers: LAYERS,
  sprites: SPR,
  ornaments: ['#E8304A', '#F49AC1', '#FFFFFF', '#E8304A', '#FF6A8A'],
  light: {
    ...SPRING.light,
    sun: '255, 228, 232',
    moon: '255, 214, 230',
    fly: { core: '#FFD6E4', glow: '255, 140, 180', perLayer: [5, 8, 5] },
  },
  veil: 'rgba(252, 238, 244, 0.24)',
};
