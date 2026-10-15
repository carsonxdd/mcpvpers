import type { ForestTheme, LayerCfg, Sprite } from './ForestScene';
import { SPRING, SPRING_LAYERS, SPRING_SPRITES } from './SpringBloom';

/* ───────────────────────── Easter meadow ─────────────────────────
   The spring grove in pastels: lavender blossom joins the cherry and fresh
   oak, and the floor is hidden with painted eggs, baskets, daffodils and
   chicks, with a white rabbit and a brown one out hunting.                 */

const egg = (base: string, band: string, spot: string): Sprite => ({
  rows: ['.BBB.', 'BBBBB', 'SSSSS', 'BDBDB', 'BBBBB', '.BBB.'],
  pal: { B: base, S: band, D: spot },
});

const SPR: Record<string, Sprite> = {
  ...SPRING_SPRITES,
  eggPink: egg('#F7B6D2', '#FFE48A', '#FFFFFF'),
  eggBlue: egg('#9ED0F4', '#FFFFFF', '#F49AC1'),
  eggMint: egg('#A8E6BC', '#F49AC1', '#FFFFFF'),
  eggLilac: egg('#CBB0F0', '#FFE48A', '#8FC8F0'),
  eggYellow: egg('#FFE48A', '#9ED0F4', '#F49AC1'),
  basket: {
    rows: ['..hhhhh..', '.h.....h.', '.hPPBBYh.', 'wWwWwWwWw', 'WwWwWwWwW', '.wWwWwWw.'],
    pal: { P: '#F49AC1', B: '#8FC8F0', Y: '#FFE07A', h: '#A87A40', w: '#C89A5A', W: '#A87A40' },
  },
  daffodil: {
    rows: ['Y.Y.', '.O..', 'Y.Y.', '.g..', 'gg..', '.g..', '.gg.'],
    pal: { Y: '#FFE04A', O: '#F4A020', g: '#3B7A2A' },
  },
  // Facing right
  chick: {
    rows: ['...YY.', '..YYkO', 'YYYYYY', '.YYYY.', '..o.o.'],
    pal: { Y: '#FFE04A', k: '#111111', O: '#F08A24', o: '#E08A24' },
  },
  whiteRabbit: {
    ...SPRING_SPRITES.rabbit,
    pal: { b: '#C8C4CC', B: '#FFFFFF', k: '#C03050', p: '#F4A6C8', W: '#FFFFFF' },
  },
};

const PAL_LAVENDER_MID = ['#7A5AA8', '#9474C0', '#AE90D6', '#C8AEE8', '#E0CCF4'];
const PAL_LAVENDER_FRONT = ['#6E4E9C', '#8868B6', '#A486CE', '#C0A6E2', '#DAC4F0'];
const PAL_LAVENDER_FAR = ['#A898C0', '#B8A8CE', '#C8BADA', '#D6CAE4', '#E4DCEE'];

const EGGS = ['eggPink', 'eggBlue', 'eggMint', 'eggLilac', 'eggYellow'];
const [far, mid, front] = SPRING_LAYERS;
const LAYERS: LayerCfg[] = [
  { ...far, crownPals: [...far.crownPals, PAL_LAVENDER_FAR] },
  {
    ...mid,
    crownPals: [...mid.crownPals, PAL_LAVENDER_MID],
    clutter: { gap: [10, 26], kinds: ['tallGrass', 'petals', ...EGGS, 'daffodil', 'tulipPink', 'bluet', 'fern', 'bush'] },
    fauna: ['whiteRabbit', 'chick'],
  },
  {
    ...front,
    crownPals: [...front.crownPals, PAL_LAVENDER_FRONT],
    clutter: { gap: [6, 16], kinds: ['tallGrass', 'petals', ...EGGS, 'basket', 'daffodil', 'tulipPink', 'tulipWhite', 'lilac', 'bluet', 'daffodil', 'sapling', 'fern', ...EGGS] },
    fauna: ['whiteRabbit', 'chick', 'rabbit', 'lamb', 'chicken'],
  },
];

export const EASTER: ForestTheme = {
  ...SPRING,
  layers: LAYERS,
  sprites: SPR,
  light: {
    ...SPRING.light,
    sun: '255, 244, 220',
  },
  veil: 'rgba(250, 244, 255, 0.24)',
};
