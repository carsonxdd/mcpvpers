import type { ForestTheme, LayerCfg, Sprite } from './ForestScene';
import { DESERT, DESERT_LAYERS, DESERT_SPRITES } from './DesertFringe';

/* ───────────────────────── Cinco de Mayo fiesta ─────────────────────────
   The desert fringe in bloom for the fiesta: papel picado baubles strung
   through the acacia, flowering cacti and marigolds, a piñata on a post,
   sombreros, maracas and a guitar on the sand, a decorated llama with the
   camel, and warm sparks at night.                                         */

const SPR: Record<string, Sprite> = {
  ...DESERT_SPRITES,
  cactusBloom: {
    rows: ['.PFP.', '.GgG.', '.GgGs', 'sGgG.', '.GgGF', '.GgG.', 'FGgG.', '.GgG.', '.GgG.', '.GgGs', '.GgG.'],
    pal: { G: '#3E7A26', g: '#2A5A1A', s: '#E8E0B0', P: '#E8407A', F: '#F4A8C8' },
  },
  marigold: {
    rows: ['.OO.', 'OoOO', '.OO.', '..g.', 'g.g.', '..g.'],
    pal: { O: '#F49A1A', o: '#D86A0A', g: '#3B7A2A' },
  },
  pinata: {
    rows: ['....p....', '....p....', '..PPPP...', '.PYYYYPk.', 'PPPPPPPPO', '.GGGGGGG.', '.BBBBBBB.', '.P.P.P.P.', '....p....', '....p....', '....p....', '....p....'],
    pal: { p: '#6A4A2A', P: '#E8407A', Y: '#F4C430', G: '#2EA84A', B: '#3A8AE8', k: '#1A1A1A', O: '#F49A1A' },
  },
  sombrero: {
    rows: ['...SSS...', '..SsSsS..', '..RGRGR..', 'SSSSSSSSS', '.sSsSsSs.'],
    pal: { S: '#E8C878', s: '#C8A458', R: '#D8303A', G: '#2EA84A' },
  },
  maracas: {
    rows: ['RR..YY.', 'RYR.YGY', 'RR..YY.', '.b...b.', '.b...b.'],
    pal: { R: '#D8303A', Y: '#F4C430', G: '#2EA84A', b: '#8A5A2A' },
  },
  guitar: {
    rows: ['..k..', '..b..', '..b..', '..b..', '.OOO.', 'OOkOO', 'OOOOO', '.OOO.'],
    pal: { k: '#2A1A0A', b: '#6A4422', O: '#C8803A' },
  },
  // Facing right
  llama: {
    rows: [
      '...............ww.',
      '..............wwww',
      '..............wwkw',
      '..............wwww',
      '..............www.',
      '..............RGB.',
      '.wwwwwwwwwwwwwwww.',
      'wwRRGGBBYYRRwwwww.',
      'wwwwwwwwwwwwwwwww.',
      '.wwwwwwwwwwwwwww..',
      '..ww.ww....ww.ww..',
      '..ww.ww....ww.ww..',
      '..WW.WW....WW.WW..',
    ],
    pal: { w: '#EEE4D0', W: '#A89880', k: '#1A1A1A', R: '#D8303A', G: '#2EA84A', B: '#3A8AE8', Y: '#F4C430' },
  },
};

const PAL_BLOOM_MID = ['#7A2A5A', '#9A3A72', '#BA4E8A', '#D46AA2', '#EA92BE'];
const PAL_BLOOM_FRONT = ['#6A2250', '#8A3266', '#AA447E', '#C86096', '#E286B2'];

const [far, mid, front] = DESERT_LAYERS;
const LAYERS: LayerCfg[] = [
  far,
  {
    ...mid,
    crownPals: [...mid.crownPals, PAL_BLOOM_MID],
    clutter: { gap: [12, 30], kinds: ['cactusBloom', 'marigold', 'savannaGrass', 'pinata', 'sandstone', 'cactusSmall', 'marigold', 'deadBush'] },
    fauna: ['rabbit', 'llama'],
  },
  {
    ...front,
    crownPals: [...front.crownPals, PAL_BLOOM_FRONT],
    clutter: { gap: [8, 22], kinds: ['cactusBloom', 'marigold', 'sombrero', 'pinata', 'savannaGrass', 'maracas', 'cactus', 'marigold', 'guitar', 'sandstone', 'cactusBloom', 'marigold'] },
    fauna: ['llama', 'camel', 'rabbit'],
  },
];

export const CINCO_DE_MAYO: ForestTheme = {
  ...DESERT,
  layers: LAYERS,
  sprites: SPR,
  // Papel picado colours
  ornaments: ['#E8407A', '#F4C430', '#2EA84A', '#3A8AE8', '#F49A1A', '#C060D8'],
  light: {
    ...DESERT.light,
    fly: { core: '#FFE8B0', glow: '255, 170, 90', perLayer: [5, 8, 5] },
  },
};
