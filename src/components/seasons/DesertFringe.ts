import type { ForestTheme, LayerCfg, Sprite } from './ForestScene';

/* ───────────────────────── Desert ─────────────────────────
   Where the savanna gives out onto the sand: flat, wide acacia crowns
   (LayerCfg.crownWide) on grey acacia logs, a sand floor with cacti, dead
   bushes and sandstone, a camel and a desert rabbit. The far view is an
   oasis (lake or river) or banded badlands mesas. Hot sun, few fireflies. */

const SPR: Record<string, Sprite> = {
  cactus: {
    rows: ['.GgG.', '.GgGs', 'sGgG.', '.GgG.', '.GgGs', '.GgG.', 'sGgG.', '.GgG.', '.GgG.', '.GgGs', '.GgG.', '.GgG.'],
    pal: { G: '#3E7A26', g: '#2A5A1A', s: '#E8E0B0' },
  },
  cactusSmall: {
    rows: ['.GgG.', 'sGgG.', '.GgGs', '.GgG.', '.GgG.', '.GgG.'],
    pal: { G: '#3E7A26', g: '#2A5A1A', s: '#E8E0B0' },
  },
  deadBush: {
    rows: ['b...b..b', '.b.b..b.', '..b.bb..', 'b..bb..b', '.b.bb.b.', '...bb...'],
    pal: { b: '#8A6430' },
  },
  sandstone: {
    rows: ['.SSSSSS.', 'SsSSSSsS', 'dddddddd', 'SSSsSSSS', 'SsSSSSsS'],
    pal: { S: '#E0CC94', s: '#EEDCA8', d: '#C8B07A' },
  },
  bones: {
    rows: ['W.....W.', '.WWWWW..', 'W.....W.'],
    pal: { W: '#F0EAD8' },
  },
  savannaGrass: {
    rows: ['.y...y..', '.y..y..y', 'y.y.y.y.', '.yYyYy.y', '..YyYyY.'],
    pal: { y: '#C8B850', Y: '#A09838' },
  },
  // Facing right
  camel: {
    rows: [
      '..................oo..',
      '.................oCCo.',
      '.................oCko.',
      '......oooo.......oCCCo',
      '.....oCCCCo......oCCo.',
      '..ooooCCCCCooooooCCo..',
      '.oCCCCCCCCCCCCCCCCCo..',
      'oCCCcCCCCCCCCCcCCCo...',
      'oCCCCCCCcCCCCCCCCCo...',
      '.oCCCCCCCCCCCCCCCo....',
      '..oooooooooooooooo....',
      '...ll..ll...ll..ll....',
      '...ll..ll...ll..ll....',
      '...ll..ll...ll..ll....',
      '...LL..LL...LL..LL....',
    ],
    pal: { o: '#8A6A3A', C: '#D8AE6A', c: '#C49A58', k: '#222222', l: '#C49A58', L: '#6A4E2A' },
  },
  rabbit: {
    rows: ['......bb..', '......bB..', '......bbb.', '.bbbbbbbkb', 'bBBBBBBbbp', 'WBBBBBBBb.', '.bBBBBBb..', '..b.b..b..'],
    pal: { b: '#B08A4A', B: '#DCB878', k: '#111111', p: '#E8A0A0', W: '#F4EEDC' },
  },
};

const PAL_FAR: string[][] = [
  ['#9AA27A', '#A8AE84', '#B6BA8E', '#C4C69A', '#D2D2A6'],
];
const PAL_MID: string[][] = [
  ['#4A5E1A', '#5A7020', '#6C8426', '#80982E', '#96AC3A'],
  ['#56601C', '#687422', '#7C8828', '#929C32', '#A8B03E'],
];
const PAL_FRONT: string[][] = [
  ['#3E5216', '#4E641C', '#607822', '#748C2A', '#8AA036'],
  ['#4A5618', '#5C6A1E', '#707E24', '#86922C', '#9CA838'],
];
const SAND_LIT = ['#E8D3A0', '#DCC48C', '#F0DEB0', '#D4BA80'];

const LAYERS: LayerCfg[] = [
  { // far — hazy acacia line over the dunes
    px: 4, crownTopVh: 0.6, heightVh: 1.4, bandVh: 0.3, groundVh: 1.02, speed: 0.6667,
    r: [8, 12], cell: 3, crownPals: PAL_FAR, trunkGap: [24, 46], trunkW: [5, 7], frameW: 0, birchChance: 0,
    hazyTrunks: true, interior: true, clusters: 0, crownWide: 1.6,
    litter: ['#E8D6AC', '#DECA9C', '#F0E0BA'], litterDepth: 3, floor: ['#E2CEA0', '#D8C494', '#E8D6AA'], soil: ['#C8AE7A', '#BCA06E'],
    clutter: null, seed: 3,
  },
  { // mid
    px: 6, crownTopVh: 0.75, heightVh: 1.5, bandVh: 0.34, groundVh: 1.2, speed: 0.8333,
    r: [10, 15], cell: 4, crownPals: PAL_MID, trunkGap: [34, 64], trunkW: [7, 9], frameW: 0, birchChance: 0,
    hazyTrunks: false, interior: false, clusters: 0.3, crownWide: 1.6,
    litter: SAND_LIT, litterDepth: 3, floor: ['#E2CA92', '#D8BE86', '#E8D29E', '#DCC48E'], soil: ['#C8A46A', '#B89060', '#C87A4A'],
    clutter: { gap: [14, 34], kinds: ['cactus', 'deadBush', 'savannaGrass', 'sandstone', 'cactusSmall', 'deadBush', 'savannaGrass'] },
    fauna: ['rabbit', 'camel'], seed: 27,
  },
  { // front
    px: 9, crownTopVh: 0.9, heightVh: 1.68, bandVh: 0.38, groundVh: 1.48, speed: 1.0,
    r: [13, 19], cell: 5, crownPals: PAL_FRONT, trunkGap: [44, 80], trunkW: [9, 11], frameW: 14, birchChance: 0,
    hazyTrunks: false, interior: false, clusters: 0.4, crownWide: 1.6,
    litter: SAND_LIT, litterDepth: 3, floor: ['#DEC48A', '#D4B87E', '#E6CE96', '#D8BE84'], soil: ['#C09C62', '#B08A54', '#C07446'],
    clutter: { gap: [10, 26], kinds: ['cactus', 'deadBush', 'sandstone', 'savannaGrass', 'cactusSmall', 'bones', 'deadBush', 'cactus'] },
    fauna: ['camel', 'rabbit'], seed: 83,
  },
];

export const DESERT: ForestTheme = {
  travel: 1.42,
  layers: LAYERS,
  sprites: SPR,
  interior: ['#F0E2C0', '#E8D6B0', '#E0CCA2', '#D8C296', '#D0B88A', '#C8AE80'],
  lake: { // an oasis
    sky: ['#9CCCEC', '#B4D6EA', '#D0E0E2', '#ECE4CC'],
    shore: ['#C8B080', '#BCA474', '#D4BC8C', '#E4CC9C'], // dunes
    reflection: '#B8B49A',
    water: ['#7CC0D8', '#6CB4D0', '#5EA8C8', '#529CC0'],
  },
  vista: { mesa: ['#C8643A', '#D88A4A', '#E8B070', '#B8502E', '#E0C090', '#A84A2E'] },
  bark: {
    main: ['#8A8278', '#6A645C', '#4A4640'], // acacia
    hazy: ['#B8AC98', '#A89C88', '#988C7A'],
    birch: ['#ECECE4', '#D8D8CE', '#B0B0A4'],
    birchMark: '#2E2E2A',
  },
  logGrain: true,
  light: {
    sun: '255, 236, 180',
    moon: '200, 215, 255',
    glint: { day: '255, 250, 225', night: '215, 228, 255' },
    fly: { core: '#FFF4B0', glow: '255, 230, 120', perLayer: [3, 5, 3] },
    sunGain: 1.1,
  },
  shade: ['rgba(60, 40, 10, 0.04)', 'rgba(60, 40, 10, 0.24)'],
  veil: 'rgba(252, 246, 232, 0.24)',
};
