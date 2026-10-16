import type { ForestTheme, LayerCfg, Sprite } from './ForestScene';
import { SPRING_SPRITES } from './SpringBloom';

/* ───────────────────────── Birch forest ─────────────────────────
   Almost every trunk a white birch log, under light lime-green crowns. A
   bright, open floor: lily of the valley, peonies, alliums and tall grass,
   rabbits, sheep and a chicken. Clean white sun and lime fireflies.        */

const SPR: Record<string, Sprite> = {
  ...SPRING_SPRITES,
  lilyOfValley: {
    rows: ['.W..', 'WgW.', '.gW.', '.g..', 'gg..', '.g..'],
    pal: { W: '#F4F4EE', g: '#3B7A2A' },
  },
  peony: {
    rows: ['.PpP..', 'PPPPp.', '.PpPP.', '..gLg.', '.LgLL.', '..gg..', '.Lg...', '..g...'],
    pal: { P: '#EBA6CC', p: '#C87AA8', g: '#3B7A2A', L: '#4E8A34' },
  },
};

const PAL_FAR: string[][] = [
  ['#8CA884', '#9CB890', '#AEC69C', '#C0D4AA', '#D2E2BA'],
  ['#94AC80', '#A4BC8C', '#B6CA98', '#C8D8A8', '#DAE6B8'],
];
const PAL_MID: string[][] = [
  ['#3E6A22', '#4E8228', '#649C30', '#7CB43A', '#98C84A'],
  ['#4A7222', '#5E8A2A', '#76A232', '#90BA3E', '#AACE52'],
  ['#567A20', '#6A9226', '#82AA2E', '#9CC03A', '#B6D44E'],
];
const PAL_FRONT: string[][] = [
  ['#305A1A', '#406E20', '#56882A', '#70A234', '#8EBC42'],
  ['#3C6420', '#507C26', '#68962E', '#84B038', '#A0C648'],
  ['#48701E', '#5C8824', '#76A22C', '#92BA36', '#AED046'],
];

const LAYERS: LayerCfg[] = [
  { // far — pale crowns, a white picket of distant birches
    px: 4, crownTopVh: 0.6, heightVh: 1.4, bandVh: 0.3, groundVh: 1.02, speed: 0.6667,
    r: [9, 14], cell: 3, crownPals: PAL_FAR, trunkGap: [14, 30], trunkW: [5, 8], frameW: 0, birchChance: 0.75,
    hazyTrunks: true, interior: true, clusters: 0,
    litter: ['#9CC47A', '#A8CC84', '#90BA70'], litterDepth: 3, floor: ['#94BC74', '#8AB46C', '#9EC47E'], soil: ['#7A7460', '#6A6452'],
    clutter: null, seed: 11,
  },
  { // mid
    px: 6, crownTopVh: 0.75, heightVh: 1.5, bandVh: 0.34, groundVh: 1.2, speed: 0.8333,
    r: [11, 17], cell: 4, crownPals: PAL_MID, trunkGap: [22, 44], trunkW: [7, 10], frameW: 0, birchChance: 0.92,
    hazyTrunks: false, interior: false, clusters: 0.35,
    litter: ['#5E9C30', '#6CAC38', '#7ABA42', '#64A234'], litterDepth: 3, floor: ['#56922C', '#4E8A2A', '#5E9A32', '#5A8E30'], soil: ['#6B4A32', '#5C402B'],
    clutter: { gap: [8, 24], kinds: ['tallGrass', 'tallGrass', 'lilyOfValley', 'fern', 'peony', 'allium', 'oxeye', 'bush', 'dandelion'] },
    fauna: ['sheep', 'rabbit'], seed: 23,
  },
  { // front
    px: 9, crownTopVh: 0.9, heightVh: 1.68, bandVh: 0.38, groundVh: 1.48, speed: 1.0,
    r: [14, 22], cell: 5, crownPals: PAL_FRONT, trunkGap: [30, 58], trunkW: [9, 12], frameW: 0, birchChance: 0.9,
    hazyTrunks: false, interior: false, clusters: 0.5,
    litter: ['#5A9C2E', '#6AAE36', '#7CBE40', '#88C648', '#62A232'], litterDepth: 3, floor: ['#4C8A28', '#54922C', '#468226', '#58962E'], soil: ['#5C402B', '#4E3624', '#6B4A32'],
    clutter: { gap: [5, 16], kinds: ['tallGrass', 'lilyOfValley', 'tallGrass', 'peony', 'fern', 'allium', 'lilyOfValley', 'oxeye', 'cornflower', 'bush', 'mushroomBrown', 'tallGrass'] },
    fauna: ['rabbit', 'chicken', 'sheep'], seed: 47,
  },
];

export const BIRCH: ForestTheme = {
  travel: 1.42,
  layers: LAYERS,
  sprites: SPR,
  interior: ['#B4D4AE', '#A0C69C', '#8CB68A', '#7AA478', '#6A9268', '#5C805A'],
  lake: {
    sky: ['#AED6F4', '#BCDDF4', '#CCE4F2', '#DCEAEE'],
    shore: ['#94B486', '#88AA7C', '#A2BE92', '#D8E2CC'],
    reflection: '#9CBCB4',
    water: ['#A6D2EC', '#96C6E4', '#88BADC', '#7CB0D4'],
  },
  bark: {
    main: ['#7A5A36', '#5E4428', '#3E2C1A'], // the odd oak
    hazy: ['#C8C8C0', '#B4B4AC', '#9C9C94'],
    birch: ['#F2F2EA', '#DEDED4', '#B4B4A8'],
    birchMark: '#2A2A26',
  },
  logGrain: true,
  light: {
    sun: '255, 252, 220',
    moon: '195, 215, 255',
    glint: { day: '255, 255, 240', night: '220, 232, 255' },
    fly: { core: '#F4FFB8', glow: '210, 255, 130', perLayer: [10, 14, 8] },
  },
  shade: ['rgba(14, 30, 10, 0.06)', 'rgba(14, 30, 10, 0.32)'],
  veil: 'rgba(244, 250, 236, 0.24)',
};
