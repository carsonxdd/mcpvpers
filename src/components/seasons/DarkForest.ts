import type { ForestTheme, LayerCfg, Sprite } from './ForestScene';
import { SPRING_SPRITES } from './SpringBloom';

/* ───────────────────────── Dark forest ─────────────────────────
   Thick dark-oak logs packed close under a canopy that lets little light
   through (sunGain < 1). Giant red and brown mushrooms, mossy rocks and rose
   bushes on a podzol floor, and plenty of fireflies once it's dark.         */

const SPR: Record<string, Sprite> = {
  ...SPRING_SPRITES,
  hugeRed: {
    rows: [
      '...RRRRRRR...',
      '.RRRWRRRRWRR.',
      'RRRRRRRRRRRRR',
      'RWRRRRWRRRRWR',
      'RRRRRRRRRRRRR',
      '.....cCc.....',
      '.....cCc.....',
      '.....cCc.....',
      '.....cCc.....',
      '.....cCc.....',
      '.....cCc.....',
      '....ccCcc....',
    ],
    pal: { R: '#B8222A', W: '#EEE8DC', c: '#D8CCB4', C: '#C4B89E' },
  },
  hugeBrown: {
    rows: [
      '...OOOOOOOOOOO...',
      '.OOOoOOOOOOoOOOO.',
      'OOOOOOOOoOOOOOOOO',
      '.......cCc.......',
      '.......cCc.......',
      '.......cCc.......',
      '.......cCc.......',
      '.......cCc.......',
      '......ccCcc......',
    ],
    pal: { O: '#8A6040', o: '#A07450', c: '#D8CCB4', C: '#C4B89E' },
  },
  mossyRock: {
    rows: ['..SsSS..', '.SsSsSS.', 'SSdSSsSS', 'SsSSdSSS', 'dddddddd'],
    pal: { S: '#6E7A6A', s: '#5A8A3A', d: '#4A524A' },
  },
  roseBush: {
    rows: ['..LRLL..', '.LLLRLL.', 'LRLLLLRL', 'LLLRLLLL', '.LLLLRL.', '..dLLd..'],
    pal: { L: '#2E5A1E', R: '#B01E2A', d: '#1E3A14' },
  },
};

const PAL_FAR: string[][] = [
  ['#3E5A48', '#486650', '#54725A', '#628064', '#708E70'],
  ['#3A5444', '#44604C', '#506C56', '#5E7A60', '#6C886C'],
];
const PAL_MID: string[][] = [
  ['#0E2E10', '#143E16', '#1C501C', '#286424', '#367A2E'],
  ['#102A0E', '#163A14', '#1E4C1A', '#2A5E22', '#38722C'],
];
const PAL_FRONT: string[][] = [
  ['#0A240A', '#103210', '#184418', '#225620', '#2E6A2A'],
  ['#0C2A0C', '#123812', '#1A4A18', '#245C22', '#30702C'],
];

const LAYERS: LayerCfg[] = [
  { // far — murky green haze, close-set trunks
    px: 4, crownTopVh: 0.6, heightVh: 1.4, bandVh: 0.3, groundVh: 1.02, speed: 0.6667,
    r: [10, 15], cell: 3, crownPals: PAL_FAR, trunkGap: [14, 28], trunkW: [8, 11], frameW: 0, birchChance: 0,
    hazyTrunks: true, interior: true, clusters: 0,
    litter: ['#4E6A3E', '#567444', '#46623A'], litterDepth: 3, floor: ['#4A6040', '#42583A', '#506844'], soil: ['#4A3E30', '#3E3428'],
    clutter: null, seed: 19,
  },
  { // mid
    px: 6, crownTopVh: 0.75, heightVh: 1.5, bandVh: 0.34, groundVh: 1.2, speed: 0.8333,
    r: [12, 18], cell: 4, crownPals: PAL_MID, trunkGap: [20, 40], trunkW: [11, 14], frameW: 0, birchChance: 0,
    hazyTrunks: false, interior: false, clusters: 0.7,
    litter: ['#2E5A1E', '#386622', '#427228', '#6A4A2A'], litterDepth: 3, floor: ['#5A4026', '#4E3820', '#2E5A1E', '#644828'], soil: ['#2E2214', '#3A2A1A'],
    clutter: { gap: [12, 30], kinds: ['hugeBrown', 'fern', 'mossyRock', 'roseBush', 'mushroomRed', 'tallGrass', 'mushroomBrown', 'hugeRed'] },
    fauna: ['rabbit'], seed: 37,
  },
  { // front
    px: 9, crownTopVh: 0.9, heightVh: 1.68, bandVh: 0.38, groundVh: 1.48, speed: 1.0,
    r: [15, 23], cell: 5, crownPals: PAL_FRONT, trunkGap: [28, 52], trunkW: [14, 18], frameW: 20, birchChance: 0,
    hazyTrunks: false, interior: false, clusters: 0.9,
    litter: ['#2A541C', '#346020', '#3E6C26', '#5E4226', '#6E4E2C'], litterDepth: 3, floor: ['#523A22', '#46321C', '#5E4428', '#2A541C'], soil: ['#24180E', '#2E2014', '#3A2A1A'],
    clutter: { gap: [8, 22], kinds: ['hugeRed', 'fern', 'mossyRock', 'roseBush', 'mushroomBrown', 'tallGrass', 'hugeBrown', 'mushroomRed', 'fern'] },
    fauna: ['pig', 'rabbit'], seed: 61,
  },
];

export const DARK_FOREST: ForestTheme = {
  travel: 1.42,
  layers: LAYERS,
  sprites: SPR,
  interior: ['#6A8270', '#5A7262', '#4C6454', '#405648', '#36483C', '#2C3C32'],
  lake: {
    sky: ['#8EA8B4', '#9AB0B8', '#A6B8BA', '#B2BEBA'],
    shore: ['#4A6450', '#425A48', '#526C58', '#647E68'],
    reflection: '#5A7468',
    water: ['#6E92A0', '#628896', '#567E8C', '#4C7482'],
  },
  vista: { rock: ['#56626A', '#646E76', '#727C84', '#828C92'], peak: ['#B4BEC4', '#C8D0D4'] },
  bark: {
    main: ['#4E3822', '#36261A', '#22180E'], // dark oak
    hazy: ['#5A5A4E', '#4C4C42', '#3E3E36'],
    birch: ['#ECECE4', '#D8D8CE', '#B0B0A4'],
    birchMark: '#2E2E2A',
  },
  logGrain: true,
  light: {
    sun: '230, 245, 190',
    moon: '170, 200, 255',
    glint: { day: '235, 245, 230', night: '200, 220, 255' },
    fly: { core: '#E8FFB0', glow: '170, 255, 120', perLayer: [16, 22, 14] },
    sunGain: 0.45,
  },
  shade: ['rgba(4, 16, 6, 0.1)', 'rgba(4, 16, 6, 0.4)'],
  veil: 'rgba(236, 244, 232, 0.16)',
};
