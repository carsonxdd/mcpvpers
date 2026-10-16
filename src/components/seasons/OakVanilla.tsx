'use client';

import ForestScene, { type ForestTheme, type LayerCfg, type Sprite } from './ForestScene';

/* ───────────────────────── Vanilla oak woods ─────────────────────────
   The default (no-season) backdrop: the same descent as the autumn forest,
   in plains-biome greens. Crowns and the grass line are built from square
   leaf/grass "blocks" so it reads as Minecraft, while keeping autumn's
   lighting, haze, sun shafts and deepening shade. Oak + birch logs, a
   grass-block floor with tall grass, ferns, flowers, mushrooms and a few
   farm animals; green-gold fireflies and a cool moon glade at night.       */

// Shared with the seasonal themes (flowers, grass, farm animals).
export const OAK_SPRITES: Record<string, Sprite> = {
  tallGrass: {
    rows: ['.g...g..', '.g..g..g', 'g.g.g.g.', '.gGgGg.g', '..GgGgG.', '...GgG..'],
    pal: { g: '#6CB43C', G: '#3F7A22' },
  },
  fern: {
    rows: ['g.....g', '.g...g.', 'g.g.g.g', '.gGgGg.', 'g.GGG.g', '..GgG..', '...G...'],
    pal: { g: '#5A9A34', G: '#3A6E22' },
  },
  bush: {
    rows: ['..LLLL..', '.LlLLLL.', 'LLLLlLLL', 'LlLLLLlL', 'LLLdLLLL', '.dLLLdL.'],
    pal: { L: '#3E7A28', l: '#5CA63A', d: '#2A5A1C' },
  },
  poppy: {
    rows: ['.RR.', 'RkRR', '.RR.', '..g.', '.gg.', '..g.'],
    pal: { R: '#D0262E', k: '#3A0A0A', g: '#3B7A2A' },
  },
  dandelion: {
    rows: ['.YY.', 'YyYY', '.YY.', '..g.', 'g.g.', '..g.'],
    pal: { Y: '#F6D624', y: '#D8A814', g: '#3B7A2A' },
  },
  cornflower: {
    rows: ['B.B.', '.BB.', 'B.B.', '..g.', '.gg.', '..g.'],
    pal: { B: '#4A6BD6', g: '#3B7A2A' },
  },
  oxeye: {
    rows: ['.WW.', 'WYYW', '.WW.', '..g.', 'g.g.', '..g.'],
    pal: { W: '#F4F4F0', Y: '#E8B820', g: '#3B7A2A' },
  },
  allium: {
    rows: ['.MM.', 'MmMM', 'MMmM', '.MM.', '..g.', '..g.', '..g.'],
    pal: { M: '#B866D8', m: '#8E44B4', g: '#3B7A2A' },
  },
  mushroomRed: {
    rows: ['.RRR.', 'RRWRR', 'RWRRR', '..c..', '..c..'],
    pal: { R: '#C8262A', W: '#F4F0E8', c: '#E8DCC8' },
  },
  mushroomBrown: {
    rows: ['.OOO.', 'OoOOO', '..c..', '..c..'],
    pal: { O: '#9A6A4A', o: '#B88460', c: '#E8DCC8' },
  },
  rock: {
    rows: ['..SSSS..', '.SsSdSS.', 'SSdSSsSS', 'SsSSdSSS', 'dddddddd'],
    pal: { S: '#8A8A88', s: '#A8A8A4', d: '#5E5E5A' },
  },
  // Animals, facing right
  // Outlined body box, head cube at the front, two pairs of legs.
  sheep: {
    rows: [
      '.............ooooo.',
      '..ooooooooooowwwwwo',
      '.owwwwWwwwwwwowwwwo',
      'owwwwwwwwwWwwoffkfo',
      'owwWwwwwwwwwwofffFo',
      'owwwwwwwWwwwwoFFFFo',
      'owwwwwwwwwwwwwooooo',
      '.owwwWwwwwwwwo.....',
      '..ooooooooooo......',
      '..ll.ll...ll.ll....',
      '..ll.ll...ll.ll....',
      '..LL.LL...LL.LL....',
    ],
    pal: { o: '#8E8E88', w: '#F4F4F0', W: '#D6D6D0', f: '#D9B89A', F: '#B8967A', k: '#222222', l: '#D9B89A', L: '#7A6656' },
  },
  pig: {
    rows: [
      '.............ooooo..',
      '.ooooooooooooPpppo..',
      'oppppppppppppPpwko..',
      'opPppppppppppPppSSSo',
      'oppppPpppppppPppnSno',
      'opppppppPppppPppppo.',
      '.ooooooooooooooooo..',
      '..dd.dd....dd.dd....',
      '..dd.dd....dd.dd....',
      '..DD.DD....DD.DD....',
    ],
    pal: { o: '#B86A70', p: '#F2A6A6', P: '#DE8C8E', S: '#E88A94', n: '#8A3A44', w: '#FFFFFF', k: '#222222', d: '#E59A9A', D: '#B86A70' },
  },
  cow: {
    rows: [
      '..............h..h.',
      '.oooooooooooooooooo',
      'obbbwwwbbbbbbobbkbo',
      'obbwwwwbbbbwwobwwwo',
      'obbbwwbbbbwwwobMMMo',
      'obbbbbbbbbbbboMnMno',
      'obbwwbbbbbbbboooooo',
      '.ooooooooooooo.....',
      '..bb.bb....bb.bb...',
      '..bb.bb....bb.bb...',
      '..kk.kk....kk.kk...',
    ],
    pal: { o: '#1A120C', b: '#3E2E22', w: '#ECE8E0', k: '#111111', h: '#D8D0C0', M: '#B89488', n: '#5A3A30' },
  },
  chicken: {
    rows: ['...ooo..', '..oWWWo.', '..oWkWOO', '..oWWWR.', 'ooWWWWo.', 'oWWWWWo.', 'oWwWWWo.', '.ooooo..', '..y.y...', '.yy.yy..'],
    pal: { o: '#9A9A94', W: '#F4F4F0', w: '#D6D6D0', k: '#111111', O: '#E8A020', R: '#D0262E', y: '#E8A020' },
  },
};

const PAL_FAR: string[][] = [
  ['#6E9A7E', '#7FAA88', '#92BA94', '#A6C8A2', '#BAD6B2'],
  ['#64907A', '#769F84', '#89B08E', '#9CC09A', '#B0D0A8'],
];
const PAL_MID: string[][] = [
  ['#2C5A1E', '#3A7026', '#4C8A30', '#62A23C', '#7CB84A'],
  ['#2A5420', '#386A28', '#4A8232', '#5E9A3C', '#76B04A'],
  ['#3A6420', '#4E7E28', '#64962E', '#7EAE3A', '#98C44C'],
];
const PAL_FRONT: string[][] = [
  ['#1E4614', '#2C5E1C', '#3E7826', '#549432', '#70AE40'],
  ['#24501A', '#346822', '#48822C', '#5E9C38', '#7AB646'],
  ['#345E1C', '#487824', '#5E922C', '#78AC38', '#94C44A'],
];

export const OAK_LAYERS: LayerCfg[] = [
  { // far — hazy blue-green treetops, airy interior, distant oak trunks
    px: 4, crownTopVh: 0.6, heightVh: 1.4, bandVh: 0.3, groundVh: 1.02, speed: 0.6667,
    r: [9, 14], cell: 3, crownPals: PAL_FAR, trunkGap: [20, 38], trunkW: [7, 10], frameW: 0, birchChance: 0.2,
    hazyTrunks: true, interior: true, clusters: 0,
    litter: ['#7FAE6A', '#8CBA74', '#76A462'], litterDepth: 3, floor: ['#7AA46A', '#6E9A62', '#80A870'], soil: ['#6E6A58', '#5E5A4C'],
    clutter: null, seed: 7,
  },
  { // mid
    px: 6, crownTopVh: 0.75, heightVh: 1.5, bandVh: 0.34, groundVh: 1.2, speed: 0.8333,
    r: [11, 17], cell: 4, crownPals: PAL_MID, trunkGap: [30, 56], trunkW: [9, 12], frameW: 0, birchChance: 0.3,
    hazyTrunks: false, interior: false, clusters: 0.4,
    litter: ['#4E8C2A', '#5C9E32', '#6AAE3A', '#589832'], litterDepth: 3, floor: ['#4A8428', '#438026', '#52902E', '#4E7E2C'], soil: ['#6B4A32', '#5C402B', '#79553A'],
    clutter: { gap: [10, 28], kinds: ['tallGrass', 'tallGrass', 'fern', 'poppy', 'dandelion', 'mushroomRed', 'rock', 'bush'] },
    fauna: ['sheep', 'cow'], seed: 21,
  },
  { // front — big, saturated, with the floor in the foreground
    px: 9, crownTopVh: 0.9, heightVh: 1.68, bandVh: 0.38, groundVh: 1.48, speed: 1.0,
    r: [14, 22], cell: 5, crownPals: PAL_FRONT, trunkGap: [40, 70], trunkW: [11, 14], frameW: 18, birchChance: 0.25,
    hazyTrunks: false, interior: false, clusters: 0.6,
    litter: ['#4A8A28', '#5AA032', '#6CB43C', '#7CBD42', '#529430'], litterDepth: 3, floor: ['#3F7A22', '#468626', '#3A7020', '#4C8A2A'], soil: ['#5C402B', '#4E3624', '#6B4A32'],
    clutter: { gap: [6, 18], kinds: ['tallGrass', 'tallGrass', 'fern', 'poppy', 'dandelion', 'cornflower', 'oxeye', 'allium', 'bush', 'mushroomRed', 'mushroomBrown', 'rock', 'tallGrass'] },
    fauna: ['pig', 'sheep', 'chicken'], seed: 42,
  },
];

export const VANILLA: ForestTheme = {
  travel: 1.42,
  layers: OAK_LAYERS,
  sprites: OAK_SPRITES,
  interior: ['#A9CDB0', '#94BE9C', '#7EAC88', '#6A9876', '#588464', '#4A7256'],
  lake: {
    sky: ['#B4DAF2', '#BEDFF3', '#C9E5F2', '#D4EAF0'],
    shore: ['#86AA94', '#7C9F8A', '#91B49D', '#A4C2AC'],
    reflection: '#8DB2B2',
    water: ['#A2CFE8', '#93C4E2', '#84B8DA', '#78ADD2'],
  },
  bark: {
    main: ['#7A5A36', '#5E4428', '#3E2C1A'],
    hazy: ['#958676', '#7D6F62', '#665A50'], // oak, faded by distance (not green)
    birch: ['#ECECE4', '#D8D8CE', '#B0B0A4'],
    birchMark: '#2E2E2A',
  },
  logGrain: true,
  light: {
    sun: '255, 244, 200',
    moon: '185, 210, 255',
    glint: { day: '255, 252, 232', night: '214, 228, 255' },
    fly: { core: '#F2FFB0', glow: '196, 255, 120', perLayer: [12, 16, 9] },
  },
  shade: ['rgba(8, 28, 12, 0.08)', 'rgba(8, 28, 12, 0.38)'],
  veil: 'rgba(240, 248, 240, 0.24)',
};

// Fireflies, sun shafts and lake glitter come from the engine (ForestLight) via `light`.
export default function OakVanilla({ dark, raining }: { dark: boolean; raining: boolean }) {
  return <ForestScene theme={VANILLA} dark={dark} raining={raining} />;
}
