import type { ForestTheme, LayerCfg, Sprite } from './ForestScene';
import { OAK_SPRITES } from './OakVanilla';

/* ───────────────────────── Jungle ─────────────────────────
   Giant 2×2 jungle logs, dense saturated crowns with vines hanging off every
   underside (LayerCfg.vines), bamboo, large ferns and melons on the floor, a
   parrot, an ocelot and a panda. Prefers a river out the back. Humid green
   light and lots of fireflies.                                            */

const SPR: Record<string, Sprite> = {
  ...OAK_SPRITES,
  bamboo: {
    rows: ['l...l', '.lgl.', '.gGg.', '.gGgl', '.ddd.', 'lgGg.', '.gGg.', '.gGg.', '.ddd.', '.gGg.', '.gGg.', '.gGg.', '.gGg.'],
    pal: { g: '#5A9A2A', G: '#7CB83A', d: '#3E6A1A', l: '#4E8A26' },
  },
  largeFern: {
    rows: ['g.......g', '.g..g..g.', 'g.g.g.g.g', '.gGgGgGg.', 'g.GgGgG.g', '.gGGGGGg.', '..GgGgG..', '...GgG...', '....G....'],
    pal: { g: '#3E8A22', G: '#2A6A18' },
  },
  melon: {
    rows: ['GgGgGgGg', 'gGgGgGgG', 'GgGgGgGg', 'gGgGgGgG', 'GgGgGgGg'],
    pal: { G: '#6E9A1E', g: '#9CC03A' },
  },
  jungleBush: {
    rows: ['...LLLL...', '.LLlLLLLL.', 'LLLLLlLLLL', 'LlLLLLLLlL', 'LLLLdLLLLL', '.dLLLLLdL.'],
    pal: { L: '#2A7A1E', l: '#48A032', d: '#1A5414' },
  },
  // Facing right
  parrot: {
    rows: ['..RRR...', '.RRWkY..', '.RRRRYY.', '.RRRR...', '.RBRR...', '.BBRR...', '.BBRR...', '..BRR...', '...R....', '..yy....'],
    pal: { R: '#D0262E', W: '#F4F4F0', k: '#111111', Y: '#F0C020', B: '#2A6ACC', y: '#555555' },
  },
  ocelot: {
    rows: [
      '.............o.o',
      '............oYYo',
      'Y...........YkYk',
      '.Y.YYYYYYYYYYYYY',
      '..YYsYYYsYYYYYn.',
      '..YYYYsYYYYsYY..',
      '...YY.YY..YY.YY.',
      '...YY.YY..YY.YY.',
    ],
    pal: { o: '#C89A30', Y: '#E8C04A', s: '#8A5A1E', k: '#2A3A10', n: '#E89A8A' },
  },
  panda: {
    rows: [
      '..............kk..kk',
      '.............kWWWWWk',
      '..kkkkkkkkkkkWkWWkWk',
      '.kWWWWWWWWWWkWkWWkWk',
      'kKKKKKKKKKKKKWWWkWWk',
      'kKKKKKKKKKKKKkWWWWk.',
      'kWWWWWWWWWWWWkkkkk..',
      'kWWWWWWWWWWWWk......',
      '.kkkkkkkkkkkk.......',
      '.KK.KK...KK.KK......',
      '.KK.KK...KK.KK......',
    ],
    pal: { k: '#1A1A1A', K: '#2A2A2A', W: '#F0F0EA' },
  },
};

const PAL_FAR: string[][] = [
  ['#4E8A5A', '#5A9A62', '#68AA6C', '#78BA76', '#8ACA84'],
  ['#548E52', '#609E5C', '#6EAE66', '#7EBE72', '#90CC80'],
];
const PAL_MID: string[][] = [
  ['#145A14', '#1C7018', '#26861E', '#349C26', '#46B232'],
  ['#1A5E10', '#247416', '#308A1C', '#40A024', '#56B830'],
  ['#0E5418', '#166A1E', '#208026', '#2E9630', '#40AC3C'],
];
const PAL_FRONT: string[][] = [
  ['#0E4E10', '#166416', '#207A1C', '#2E9024', '#40A82E'],
  ['#145410', '#1E6A14', '#2A801A', '#3A9622', '#4EAE2C'],
  ['#0A4814', '#125E1A', '#1C7422', '#2A8A2C', '#3CA238'],
];
const VINES = ['#2E6A1A', '#3A7E22', '#24581A'];

const LAYERS: LayerCfg[] = [
  { // far — misty green, slim distant logs
    px: 4, crownTopVh: 0.6, heightVh: 1.4, bandVh: 0.3, groundVh: 1.02, speed: 0.6667,
    r: [10, 15], cell: 3, crownPals: PAL_FAR, trunkGap: [18, 34], trunkW: [7, 10], frameW: 0, birchChance: 0,
    hazyTrunks: true, interior: true, clusters: 0,
    litter: ['#6EAA5A', '#7AB464', '#64A052'], litterDepth: 3, floor: ['#68A058', '#5E9650', '#72AA60'], soil: ['#6A5A40', '#5A4C36'],
    clutter: null, seed: 5,
  },
  { // mid
    px: 6, crownTopVh: 0.75, heightVh: 1.5, bandVh: 0.34, groundVh: 1.2, speed: 0.8333,
    r: [12, 18], cell: 4, crownPals: PAL_MID, trunkGap: [26, 48], trunkW: [12, 15], frameW: 0, birchChance: 0,
    hazyTrunks: false, interior: false, clusters: 0.9, vines: VINES,
    litter: ['#3E9A26', '#4AAA2E', '#58B836', '#46A02C'], litterDepth: 3, floor: ['#3A8C24', '#348422', '#42942A', '#6A4A2A'], soil: ['#5A3E22', '#4A3220'],
    clutter: { gap: [6, 20], kinds: ['largeFern', 'jungleBush', 'bamboo', 'tallGrass', 'melon', 'fern', 'bamboo', 'jungleBush'] },
    fauna: ['parrot', 'ocelot'], seed: 33,
  },
  { // front — huge 2×2 logs
    px: 9, crownTopVh: 0.9, heightVh: 1.68, bandVh: 0.38, groundVh: 1.48, speed: 1.0,
    r: [15, 23], cell: 5, crownPals: PAL_FRONT, trunkGap: [34, 60], trunkW: [16, 22], frameW: 22, birchChance: 0,
    hazyTrunks: false, interior: false, clusters: 1.1, vines: VINES,
    litter: ['#3A9824', '#48A82C', '#56B834', '#62C03C', '#409E28'], litterDepth: 3, floor: ['#348A22', '#3C9226', '#2E7E20', '#5E4426'], soil: ['#4A3220', '#5A3E22', '#3A2818'],
    clutter: { gap: [4, 14], kinds: ['largeFern', 'jungleBush', 'bamboo', 'melon', 'tallGrass', 'fern', 'largeFern', 'bamboo', 'jungleBush', 'mushroomBrown'] },
    fauna: ['panda', 'parrot'], seed: 71,
  },
];

export const JUNGLE: ForestTheme = {
  travel: 1.42,
  layers: LAYERS,
  sprites: SPR,
  interior: ['#9CC8A0', '#86B88A', '#70A676', '#5E9464', '#4E8254', '#407046'],
  lake: {
    sky: ['#9ACCEE', '#ACD4EC', '#C0DCE6', '#D2E4DE'],
    shore: ['#4E8A52', '#46804A', '#58965A', '#72AE6E'],
    reflection: '#4E8A70',
    water: ['#4EA8B4', '#449CAA', '#3A90A0', '#328696'],
  },
  vista: { kinds: ['river', 'river', 'lake', 'mountains'], rock: ['#5E7A6E', '#6C887A', '#7C9888', '#8EA898'], peak: null },
  bark: {
    main: ['#8A6A3A', '#6A5028', '#4A361A'], // jungle log
    hazy: ['#8A8A70', '#76765E', '#62624E'],
    birch: ['#ECECE4', '#D8D8CE', '#B0B0A4'],
    birchMark: '#2E2E2A',
  },
  logGrain: true,
  light: {
    sun: '240, 255, 200',
    moon: '190, 230, 255',
    glint: { day: '245, 255, 235', night: '210, 235, 255' },
    fly: { core: '#F0FFA8', glow: '200, 255, 110', perLayer: [16, 20, 14] },
    sunGain: 0.8,
  },
  shade: ['rgba(4, 26, 8, 0.12)', 'rgba(4, 26, 8, 0.45)'],
  veil: 'rgba(238, 248, 236, 0.24)',
};
