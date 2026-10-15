import type { ForestTheme, LayerCfg, Sprite } from './ForestScene';
import { SNOW, SNOW_SHADE, WINTER, WINTER_LAYERS, WINTER_SPRITES } from './WinterTaiga';

/* ───────────────────────── Christmas taiga ─────────────────────────
   The winter taiga, decorated: baubles hung on every near spruce
   (`ornaments`), presents and candy canes in the snow, a snowman in a Santa
   hat, a reindeer, the campfire, and warm golden fairy lights at night.     */

const present = (box: string, shade: string, ribbon: string): Sprite => ({
  rows: ['.Y...Y.', '..YYY..', 'BBBYBBB', 'BBBYBBB', 'YYYYYYY', 'BBBYBBB', 'BsBYBsB'],
  pal: { B: box, s: shade, Y: ribbon },
});

const SPR: Record<string, Sprite> = {
  ...WINTER_SPRITES,
  presentRed: present('#C8202A', '#9A1820', '#F4C430'),
  presentGreen: present('#1E8A3A', '#166A2C', '#E8303A'),
  presentBlue: present('#2E5EC8', '#22479A', '#F4F4F4'),
  presentGold: present('#E8B830', '#B88A20', '#C8202A'),
  candyCane: {
    rows: ['.WR.', 'R..W', 'W..R', '...W', '...R', '...W', '...R', '...W'],
    pal: { W: '#FAFAFA', R: '#D8202A' },
  },
  // Facing right
  reindeer: {
    rows: [
      '...........a.a..',
      '..........a.a.a.',
      '...........aaa..',
      '............HHH.',
      '............HkHH',
      '............HHHN',
      '...........HH...',
      '.BBBBBBBBBBBB...',
      'tBBBBBBBBBBBB...',
      '.BBWWWWWWWWBB...',
      '..L.L.....L.L...',
      '..L.L.....L.L...',
      '..d.d.....d.d...',
    ],
    pal: { a: '#8A6A4A', H: '#7A5030', k: '#111111', N: '#E02020', B: '#8A5A34', t: '#F0E6D8', W: '#C8A880', L: '#5A3A20', d: '#2A1A10' },
  },
  snowman: {
    rows: [
      '......RW....',
      '....RRRR....',
      '...FFFFFF...',
      '...SSSSSS...',
      '...SkSSkS...',
      '...SSSSSOO..',
      '...SkkkkS...',
      '..rrrrrrrr..',
      'b..SSSSSS..b',
      '.b.SkSSSS.b.',
      '..bSSSSSSb..',
      '...SSkSSS...',
      '..SSSSSSSS..',
      '..SSSSSSsS..',
      '..SSSSSSSS..',
      '...SSSSSS...',
    ],
    pal: { R: '#C8202A', W: '#FFFFFF', F: '#EEEEEE', S: SNOW, s: SNOW_SHADE, k: '#2A2A2A', O: '#E8801C', r: '#1E8A3A', b: '#6A4A2A' },
  },
};

const [far, mid, front] = WINTER_LAYERS;
const LAYERS: LayerCfg[] = [
  far,
  {
    ...mid,
    clutter: { gap: [14, 34], kinds: ['sapling', 'presentRed', 'drift', 'candyCane', 'snowRock', 'presentGreen', 'frostBush', 'stump'] },
    fauna: ['rabbit', 'reindeer'],
  },
  {
    ...front,
    clutter: { gap: [10, 26], kinds: ['presentRed', 'sapling', 'candyCane', 'drift', 'presentGreen', 'snowRock', 'presentBlue', 'frostBush', 'presentGold', 'stump', 'candyCane'] },
    fauna: ['reindeer', 'snowman', 'campfire', 'fox'],
  },
];

export const CHRISTMAS: ForestTheme = {
  ...WINTER,
  layers: LAYERS,
  sprites: SPR,
  ornaments: ['#E0303A', '#F4C430', '#2E7AE0', '#F4F4F4', '#C040C0', '#E0303A', '#F4C430'],
  light: {
    ...WINTER.light,
    sun: '255, 238, 214',
    // Golden fairy lights drifting between the trees at night
    fly: { core: '#FFF0B0', glow: '255, 204, 110', perLayer: [4, 7, 4] },
  },
};
