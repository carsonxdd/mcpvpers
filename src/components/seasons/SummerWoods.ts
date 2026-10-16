import type { ForestTheme, LayerCfg, Sprite } from './ForestScene';
import { OAK_SPRITES } from './OakVanilla';

/* ───────────────────────── High summer ─────────────────────────
   Dense dark-oak woods at their greenest: deep emerald crowns, golden
   afternoon shafts, a deep blue lake, sunflowers and berry bushes on the
   floor, a fox and the farm animals out in the heat, and the most fireflies
   of any season once it gets dark.                                          */

// Exported for St. Patrick's and the Fourth of July, which build on these woods.
export const SUMMER_SPRITES: Record<string, Sprite> = {
  ...OAK_SPRITES,
  sunflower: {
    rows: [
      '..YYYY..',
      '.YYbbYY.',
      'YYbBBbYY',
      'YbBBBBbY',
      'YYbBBbYY',
      '.YYbbYY.',
      '..YYYY..',
      '...g....',
      '...gL...',
      '.LLg....',
      '...g.L..',
      '...gLL..',
      '...g....',
    ],
    pal: { Y: '#F6C81E', b: '#7A4A14', B: '#4A2A0C', g: '#3B7A2A', L: '#5A9A34' },
  },
  berryBush: {
    rows: ['..LLLL..', '.LRLLRL.', 'LLLLRLLL', 'LRLLLLRL', 'LLLRLLLL', '.dLLLdL.'],
    pal: { L: '#2E6A28', R: '#C8262A', d: '#1E4A1A' },
  },
  melon: {
    rows: ['GgGgGgGg', 'gGgGgGgG', 'GgGgGgGg', 'gGgGgGgG', 'GgGgGgGg'],
    pal: { G: '#6E9A1E', g: '#9CC03A' },
  },
  wheat: {
    rows: ['Y.Y.Y', 'YyYyY', 'yYyYy', '.g.g.', 'g.g.g', '.g.g.'],
    pal: { Y: '#E8C04A', y: '#C89A2A', g: '#8AA03A' },
  },
  // Facing right
  fox: {
    rows: [
      '..............O..O',
      '.............OOOOO',
      '..OOOOOOOOOOOOOkOO',
      'WOOOOOOOOOOOOOOWWW',
      'WOOOOOOOOOOOOOWWWk',
      '.OOOWWWWWWWWOO....',
      '...kk.kk..kk.kk...',
      '...kk.kk..kk.kk...',
    ],
    pal: { O: '#E07A28', W: '#F4EEE4', k: '#2A1E18' },
  },
};

const PAL_FAR: string[][] = [
  ['#6A9268', '#7AA276', '#8CB286', '#A0C298', '#B4D2AA'],
  ['#7A9A62', '#8AAA70', '#9CBA80', '#B0CA92', '#C4D8A6'],
];
const PAL_MID: string[][] = [
  ['#16461A', '#1E5E22', '#2A782A', '#3C9234', '#56AC40'],
  ['#1A4C1C', '#246626', '#32822E', '#469C38', '#62B646'],
  ['#2C6416', '#3E7E1C', '#569A22', '#74B42C', '#96CC38'],
];
const PAL_FRONT: string[][] = [
  ['#103C14', '#18541C', '#226E24', '#34882E', '#4EA23A'],
  ['#14441A', '#1E5C20', '#2A7828', '#3E9232', '#58AC40'],
  ['#265C12', '#387618', '#50921E', '#6EAE28', '#90C834'],
];

export const SUMMER_LAYERS: LayerCfg[] = [
  { // far — warm haze over the lake
    px: 4, crownTopVh: 0.6, heightVh: 1.4, bandVh: 0.3, groundVh: 1.02, speed: 0.6667,
    r: [9, 14], cell: 3, crownPals: PAL_FAR, trunkGap: [18, 34], trunkW: [7, 10], frameW: 0, birchChance: 0.1,
    hazyTrunks: true, interior: true, clusters: 0,
    litter: ['#8EBA62', '#9AC46C', '#84B05A'], litterDepth: 3, floor: ['#80AC5E', '#76A256', '#8AB466'], soil: ['#7A6A50', '#6A5C44'],
    clutter: null, seed: 13,
  },
  { // mid
    px: 6, crownTopVh: 0.75, heightVh: 1.5, bandVh: 0.34, groundVh: 1.2, speed: 0.8333,
    r: [11, 17], cell: 4, crownPals: PAL_MID, trunkGap: [26, 50], trunkW: [9, 13], frameW: 0, birchChance: 0.12,
    hazyTrunks: false, interior: false, clusters: 0.5,
    litter: ['#4E9A26', '#5CAC2E', '#6ABC36', '#58A42C'], litterDepth: 3, floor: ['#42862A', '#3C7E26', '#4A902E', '#46822A'], soil: ['#6B4A32', '#5C402B'],
    clutter: { gap: [8, 24], kinds: ['tallGrass', 'tallGrass', 'sunflower', 'fern', 'berryBush', 'poppy', 'wheat', 'bush', 'dandelion'] },
    fauna: ['cow', 'fox'], seed: 29,
  },
  { // front
    px: 9, crownTopVh: 0.9, heightVh: 1.68, bandVh: 0.38, groundVh: 1.48, speed: 1.0,
    r: [14, 22], cell: 5, crownPals: PAL_FRONT, trunkGap: [36, 64], trunkW: [12, 15], frameW: 18, birchChance: 0.12,
    hazyTrunks: false, interior: false, clusters: 0.7,
    litter: ['#4A9A24', '#5AAE2E', '#6CC036', '#7CC83E', '#52A02A'], litterDepth: 3, floor: ['#3A7C22', '#428826', '#367220', '#468C2A'], soil: ['#5C402B', '#4E3624', '#6B4A32'],
    clutter: { gap: [5, 16], kinds: ['tallGrass', 'sunflower', 'tallGrass', 'berryBush', 'melon', 'wheat', 'fern', 'poppy', 'cornflower', 'oxeye', 'sunflower', 'bush', 'mushroomRed', 'tallGrass'] },
    fauna: ['pig', 'fox', 'chicken'], seed: 53,
  },
];

export const SUMMER: ForestTheme = {
  travel: 1.42,
  layers: SUMMER_LAYERS,
  sprites: SUMMER_SPRITES,
  interior: ['#A4C894', '#8EB880', '#78A66C', '#64925A', '#527E4A', '#446C3E'],
  lake: {
    sky: ['#88C6F2', '#9CD0F2', '#B0DAF2', '#C6E4F0'],
    shore: ['#5E8E5A', '#527E4E', '#6A9C64', '#86B47A'],
    reflection: '#5E8E80',
    water: ['#5EAEDE', '#4EA2D6', '#4296CE', '#368AC4'],
  },
  bark: {
    main: ['#5A4028', '#3E2C1C', '#281C10'], // dark oak
    hazy: ['#8A7C6A', '#74685A', '#60564A'],
    birch: ['#ECECE4', '#D8D8CE', '#B0B0A4'],
    birchMark: '#2E2E2A',
  },
  logGrain: true,
  light: {
    sun: '255, 226, 140',
    moon: '200, 220, 255',
    glint: { day: '255, 246, 210', night: '220, 232, 255' },
    fly: { core: '#FFF6A8', glow: '255, 236, 110', perLayer: [18, 22, 14] },
  },
  shade: ['rgba(6, 30, 10, 0.1)', 'rgba(6, 30, 10, 0.42)'],
  veil: 'rgba(246, 250, 232, 0.22)',
};
