import type { ForestTheme, LayerCfg, Sprite } from './ForestScene';

/* ───────────────────────── Snowy taiga ─────────────────────────
   Spruce woods under fresh snow: tiered spruce crowns (the engine's
   `conifer`), snow settled on every exposed crown and branch (`snow`), a
   frozen lake with no ripples, a white floor with blue shadows, snowy
   saplings and stumps, a campfire, an arctic fox, a wolf and a snow golem.
   Cold pale light by day, moonbeams by night, no fireflies.                 */

export const SNOW = '#F8FBFF';
export const SNOW_SHADE = '#D4E0EC';

// Exported for the Christmas theme, which decorates this same taiga.
export const WINTER_SPRITES: Record<string, Sprite> = {
  snowRock: {
    rows: ['..WWWW..', '.WSWWSW.', 'SSSSSsSS', 'SsSSSSSS', 'dddddddd'],
    pal: { W: SNOW, S: '#8A8E96', s: '#A8ACB4', d: '#5E626A' },
  },
  sapling: {
    rows: ['...W...', '..WGW..', '..GGG..', '.WGGGW.', '.GgGGG.', 'WGGGgGW', 'GGGGGGG', '...b...', '...b...'],
    pal: { W: SNOW, G: '#204A34', g: '#2C5C40', b: '#4A3626' },
  },
  stump: {
    rows: ['.WWWWWWW.', 'WWwWWWWWW', '.bBBBBBb.', '.bBbBBBb.', 'bbBBBBBbb'],
    pal: { W: SNOW, w: SNOW_SHADE, b: '#2E2016', B: '#4A3626' },
  },
  frostBush: {
    rows: ['..WWWW..', '.WLWWLW.', 'LLRLLLRL', 'LRLLLLLL', '.dLLLdL.'],
    pal: { W: SNOW, L: '#2C5040', R: '#C8262A', d: '#1C3A2C' },
  },
  drift: {
    rows: ['...WWW...', '.WWWWWww.', 'WWwWWWWWw'],
    pal: { W: SNOW, w: '#C2D2E4' },
  },
  fern: {
    rows: ['W.....W', '.g...g.', 'W.g.g.W', '.gGgGg.', 'g.GGG.g', '..GgG..', '...G...'],
    pal: { W: SNOW, g: '#4A7A54', G: '#2E5A3A' },
  },
  campfire: {
    rows: ['....F....', '...FfF...', '..FfYfF..', '..fYYYf..', '.lLlLlLl.', 'LlLlLlLlL'],
    pal: { F: '#E8501C', f: '#F8A020', Y: '#FFE860', l: '#5A3A1E', L: '#3A2410' },
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
    pal: { O: '#DCE2EA', W: '#FFFFFF', k: '#4A4A56' },
  },
  wolf: {
    rows: [
      '..................O.O.',
      '.................OOOO.',
      '..OOOOOOOOOOOOOOOOkOO.',
      '.OOOOOOOOOOOOOOOOOOOWW',
      'OOWOOOOOOOOOOOOOOOWWWk',
      'O..OOOOWWWWWWWOOO.....',
      '...OO.OO....OO.OO.....',
      '...OO.OO....OO.OO.....',
      '...dd.dd....dd.dd.....',
    ],
    pal: { O: '#B8B4AE', W: '#E8E4DC', k: '#2A2622', d: '#6A6660' },
  },
  snowGolem: {
    rows: [
      '...OOOOOO...',
      '...OkOOkO...',
      '...OOOOOO...',
      '...OkkkkO...',
      '...oooooo...',
      'b..WWWWWW..b',
      '.b.WWWWWW.b.',
      '..bWWWwWWb..',
      '...WWWWWW...',
      '...WWwWWW...',
      '..WWWWWWWW..',
      '..WWWWWWwW..',
      '..WWWWWWWW..',
      '...WWWWWW...',
    ],
    pal: { O: '#E07A1C', k: '#3A1A08', o: '#B05A10', W: SNOW, w: SNOW_SHADE, b: '#6A4A2A' },
  },
  rabbit: {
    rows: [
      '......bb..',
      '......bW..',
      '......bbb.',
      '.bbbbbbbkb',
      'bWWWWWWbbp',
      'WWWWWWWWb.',
      '.bWWWWWb..',
      '..b.b..b..',
    ],
    pal: { b: '#B4BCC8', W: '#FFFFFF', k: '#111111', p: '#E8A0A0' },
  },
};

const PAL_FAR: string[][] = [
  ['#6A8090', '#7A8E9C', '#8C9EAA', '#A0B0BA', '#B4C2CA'],
  ['#647A8A', '#748A98', '#8698A6', '#9AAAB6', '#AEBCC6'],
];
const PAL_MID: string[][] = [
  ['#0E2A20', '#163A2A', '#204A34', '#2C5C40', '#3A6E4C'],
  ['#122E24', '#1A402E', '#245038', '#306246', '#3E7452'],
];
const PAL_FRONT: string[][] = [
  ['#0A241A', '#123424', '#1C442E', '#28563A', '#366846'],
  ['#0E281E', '#163A28', '#204A32', '#2C5C3E', '#3A6E4A'],
];

export const WINTER_LAYERS: LayerCfg[] = [
  { // far — misty spruce over the frozen lake
    px: 4, crownTopVh: 0.6, heightVh: 1.4, bandVh: 0.3, groundVh: 1.02, speed: 0.6667,
    r: [9, 14], cell: 3, crownPals: PAL_FAR, trunkGap: [20, 38], trunkW: [6, 9], frameW: 0, birchChance: 0.15,
    hazyTrunks: true, interior: true, clusters: 0, conifer: 0.9,
    litter: ['#E6EEF6', '#DCE6F0'], litterDepth: 3, floor: ['#CCD8E4', '#C2D0DE', '#D2DEEA'], soil: ['#A8B8CA', '#8E8678'],
    clutter: null, seed: 17,
  },
  { // mid
    px: 6, crownTopVh: 0.75, heightVh: 1.5, bandVh: 0.34, groundVh: 1.2, speed: 0.8333,
    r: [11, 17], cell: 4, crownPals: PAL_MID, trunkGap: [28, 52], trunkW: [8, 11], frameW: 0, birchChance: 0.25,
    hazyTrunks: false, interior: false, clusters: 0.3, conifer: 0.85,
    litter: ['#FFFFFF', '#F4F8FC', '#EAF2FA'], litterDepth: 3, floor: ['#E2ECF6', '#D8E4F0', '#E8F0F8', '#DCE8F4'], soil: ['#B4C6D8', '#8E7E6E'],
    clutter: { gap: [14, 34], kinds: ['sapling', 'snowRock', 'drift', 'fern', 'stump', 'frostBush'] },
    fauna: ['rabbit', 'fox'], seed: 31,
  },
  { // front
    px: 9, crownTopVh: 0.9, heightVh: 1.68, bandVh: 0.38, groundVh: 1.48, speed: 1.0,
    r: [14, 22], cell: 5, crownPals: PAL_FRONT, trunkGap: [40, 70], trunkW: [10, 13], frameW: 18, birchChance: 0.2,
    hazyTrunks: false, interior: false, clusters: 0.4, conifer: 0.8,
    litter: ['#FFFFFF', '#F8FBFF', '#EEF4FA'], litterDepth: 3, floor: ['#E4EEF8', '#DAE6F2', '#EAF2FA', '#D2E0EE'], soil: ['#AEC2D6', '#C0D0E2', '#8E7E6E'],
    clutter: { gap: [10, 26], kinds: ['sapling', 'snowRock', 'drift', 'stump', 'fern', 'frostBush', 'sapling', 'drift'] },
    fauna: ['wolf', 'snowGolem', 'campfire', 'fox'], seed: 59,
  },
];

export const WINTER: ForestTheme = {
  travel: 1.42,
  layers: WINTER_LAYERS,
  sprites: WINTER_SPRITES,
  interior: ['#C8D4E0', '#B4C2D0', '#A0B0C0', '#8C9EB0', '#7A8CA0', '#6A7C90'],
  lake: {
    sky: ['#C0D4E8', '#CADBEC', '#D6E2F0', '#E2EAF4'],
    shore: ['#7E96A8', '#72899C', '#8CA2B2', '#EEF4FA'],
    reflection: '#A6BCD0',
    water: ['#C6DCEE', '#B8D2E8', '#AACAE2', '#9EC0DC'],
    frozen: true,
  },
  bark: {
    main: ['#5A4230', '#3E2C1E', '#281C12'], // spruce
    hazy: ['#7E7C80', '#6A686E', '#58565C'],
    birch: ['#ECECE4', '#D8D8CE', '#B0B0A4'],
    birchMark: '#2E2E2A',
  },
  logGrain: true,
  snow: ['#C4D6E8', '#DDE8F4', SNOW],
  light: {
    sun: '232, 242, 255',
    moon: '180, 205, 255',
    glint: { day: '255, 255, 255', night: '210, 225, 255' },
    fly: { core: '#FFFFFF', glow: '255, 255, 255', perLayer: [0, 0, 0] },
  },
  shade: ['rgba(10, 20, 44, 0.06)', 'rgba(10, 20, 44, 0.3)'],
  veil: 'rgba(238, 244, 250, 0.22)',
};
