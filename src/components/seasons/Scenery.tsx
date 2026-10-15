'use client';

import type { Season } from '@/lib/seasons';
import ForestScene, { type ForestTheme, type LayerCfg, type Sprite } from './ForestScene';
import OakVanilla from './OakVanilla';

/* ───────────────────────── Autumn forest descent ─────────────────────────
   Painted by ForestScene (shared with the vanilla oak woods); this file is
   just autumn's palettes, sprites and layer layout.                          */

const SPR: Record<string, Sprite> = {
  mushroom: {
    rows: ['..RRR..', '.RWRRR.', 'RRRRWRR', '.ccccc.', '...c...', '...c...', '...c...'],
    pal: { R: '#C0302A', W: '#F4EEDD', c: '#E8DCC0' },
  },
  mushroomBrown: {
    rows: ['.OOOO.', 'OOoOOO', 'OOOOoO', '.cccc.', '..cc..', '..cc..'],
    pal: { O: '#B5651D', o: '#8A4A14', c: '#E8DCC0' },
  },
  bracken: {
    rows: ['G...G...G', '.G..G..G.', '..G.G.G..', '.g.GGG.g.', '..g.G.g..', '....g....', '....g....', '....g....'],
    pal: { G: '#B5651D', g: '#8A6A1E' },
  },
  rock: {
    rows: ['..SSSS..', '.SsSSSS.', 'SSSSSsSS', 'SsSSSSSS', 'dddddddd'],
    pal: { S: '#8A8478', s: '#A8A294', d: '#5E5A52' },
  },
  log: {
    rows: ['.bbbbbbbbbbbbbb.', 'bBBBBBBBbBBBBBBb', 'oOOoBBBBBBBBBBBb', 'oOoOBBBbBBBBBBBb', 'oOOoBBBBBBBBBBBb', '.bbbbbbbbbbbbbb.'],
    pal: { b: '#3E2814', B: '#5E3C1E', o: '#D9B27A', O: '#B8884C' },
  },
  stump: {
    rows: ['.ooooooo.', 'oOoOOoOoo', '.bBBBBBb.', '.bBbBBBb.', '.bBBBBbb.', 'bbBBBBBbb', 'bbbbbbbbb'],
    pal: { b: '#3E2814', B: '#5E3C1E', o: '#D9B27A', O: '#B8884C' },
  },
  mound: {
    rows: ['......OO......', '....OOROOO....', '..OOROYOOROO..', '.OROOOYOROOYO.', 'OOYOROOOOORROO'],
    pal: { O: '#D2691E', R: '#B5451B', Y: '#E8A317' },
  },
  pumpkin: {
    rows: ['...g....', '.OOOOOO.', 'OOoOOoOO', 'OOoOOoOO', 'OOoOOoOO', '.OOOOOO.'],
    pal: { O: '#E8741C', o: '#C45A10', g: '#4A6B1E' },
  },
  hay: {
    rows: ['..YYYYYY..', '.YyYYYYyY.', 'YYYYYYYYYY', 'YyYYYYYYyY', 'YYYYYYYYYY', 'bYYYbYYYbY', 'YYYYYYYYYY'],
    pal: { Y: '#D9A93A', y: '#B88A24', b: '#7A5A1E' },
  },
};

const PAL_FAR: string[][] = [
  ['#9A6A4A', '#B77F52', '#C98F55', '#D9A96A', '#E3BE7E'],
  ['#8F5A44', '#AA6A4A', '#C07C52', '#D29A66', '#E0B47A'],
  ['#A07A4A', '#B98C52', '#CBA05A', '#DDB872', '#EACC8C'],
];
const PAL_MID: string[][] = [
  ['#7A2E14', '#A8451C', '#C9651E', '#DE9A1E', '#EDB93A'],
  ['#6A2410', '#8F3216', '#B5451B', '#D2691E', '#E8913A'],
  ['#7A4A14', '#A8701C', '#C9921E', '#E0B02A', '#F2CC4A'],
];
const PAL_FRONT: string[][] = [
  ['#6E2410', '#9C3A16', '#C45A1A', '#E08A1C', '#F4C03A'],
  ['#5E1C0C', '#8B2E12', '#B5451B', '#D2691E', '#E8913A'],
  ['#7A4A12', '#B07A1A', '#D49A22', '#EDBA32', '#FAD85A'],
  ['#6E2410', '#9C3A16', '#C45A1A', '#E08A1C', '#F4C03A'],
];

const LAYERS: LayerCfg[] = [
  { // far — hazy treetops, dim interior, thin distant trunks
    px: 4, crownTopVh: 0.6, heightVh: 1.4, bandVh: 0.3, groundVh: 1.02, speed: 0.6667,
    r: [9, 14], cell: 0, crownPals: PAL_FAR, trunkGap: [18, 34], trunkW: [6, 9], frameW: 0, birchChance: 0.15,
    hazyTrunks: true, interior: true, clusters: 0,
    litter: ['#8A5A2C', '#A8702E', '#B98238', '#9A6A30'], litterDepth: 5, floor: ['#8E6236', '#9A6C3A', '#86603A'], soil: ['#5A3A22', '#4A2E1C'],
    clutter: null, seed: 7,
  },
  { // mid
    px: 6, crownTopVh: 0.75, heightVh: 1.5, bandVh: 0.34, groundVh: 1.2, speed: 0.8333,
    r: [11, 17], cell: 0, crownPals: PAL_MID, trunkGap: [28, 52], trunkW: [8, 11], frameW: 0, birchChance: 0.25,
    hazyTrunks: false, interior: false, clusters: 0.4,
    litter: ['#7A3A14', '#A8501C', '#C9701E', '#D9962A', '#8A5A24'], litterDepth: 5, floor: ['#8A421A', '#9A5220', '#7E4A20', '#A8601E'], soil: ['#3A2210', '#2A180C'],
    clutter: { gap: [26, 50], kinds: ['mushroom', 'rock', 'pumpkin', 'mound', 'mushroomBrown', 'bracken'] }, seed: 21,
  },
  { // front — big, saturated, with the floor in the foreground
    px: 9, crownTopVh: 0.9, heightVh: 1.68, bandVh: 0.38, groundVh: 1.48, speed: 1.0,
    r: [14, 22], cell: 0, crownPals: PAL_FRONT, trunkGap: [36, 64], trunkW: [8, 13], frameW: 18, birchChance: 0.2,
    hazyTrunks: false, interior: false, clusters: 0.6,
    litter: ['#7A3A14', '#B5451B', '#D2691E', '#E8A317', '#8A5A24', '#5E3C1E'], litterDepth: 5, floor: ['#7A3616', '#8C421A', '#6E3214', '#9A5420'], soil: ['#2E1C0E', '#24150A', '#3A2412'],
    clutter: { gap: [14, 30], kinds: ['mushroom', 'bracken', 'rock', 'log', 'stump', 'mound', 'pumpkin', 'hay', 'mushroomBrown', 'bracken', 'mound'] }, seed: 42,
  },
];

const AUTUMN: ForestTheme = {
  travel: 1.42,
  layers: LAYERS,
  sprites: SPR,
  interior: ['#C4976A', '#B8895C', '#AC7E54', '#A0744C', '#966C46', '#8E6642'],
  lake: {
    sky: ['#BCD8EC', '#CADFEA', '#D8E4E2', '#E6E6D6'],
    shore: ['#C4946A', '#B8885E', '#CEA274', '#DDB88A'],
    reflection: '#B8A08A',
    water: ['#AACADA', '#9ABED2', '#8CB2CA', '#80A8C2'],
  },
  bark: {
    main: ['#8A5A30', '#5E3C1E', '#3E2814'],
    hazy: ['#8A6240', '#6E4A2C', '#563820'],
    birch: ['#F2ECDC', '#E0D8C4', '#B8AF98'],
    birchMark: '#3A342A',
  },
  logGrain: false,
  light: {
    sun: '255, 222, 160',
    moon: '255, 214, 165', // harvest moon
    glint: { day: '255, 240, 210', night: '255, 226, 186' },
    fly: { core: '#FFF2B8', glow: '255, 214, 120', perLayer: [8, 11, 6] },
  },
  shade: ['rgba(40, 20, 8, 0.1)', 'rgba(40, 20, 8, 0.4)'],
  veil: 'rgba(247, 238, 223, 0.26)',
};

// `season` is null on the default look, which gets the vanilla oak woods.
export default function Scenery({ season, dark, raining }: { season: Season | null; dark: boolean; raining: boolean }) {
  if (season === null) return <OakVanilla key="oak" dark={dark} raining={raining} />;
  if (season !== 'autumn') return null;
  return <ForestScene key="autumn" theme={AUTUMN} dark={dark} raining={raining} />;
}
