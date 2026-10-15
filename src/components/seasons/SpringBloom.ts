import type { ForestTheme, LayerCfg, Sprite } from './ForestScene';
import { OAK_SPRITES } from './OakVanilla';

/* ───────────────────────── Spring cherry grove ─────────────────────────
   The vanilla woods in bloom: cherry crowns mixed in with fresh oak, dark
   cherry logs, pink petals scattered through new grass, tulips and lilacs,
   rabbits and a lamb. Soft pink-white light and only a few early fireflies. */

const tulip = (petal: string, shade: string): Sprite => ({
  rows: ['P.P.', 'PPP.', 'PpP.', '.g..', 'gg..', '.g..', '.gg.'],
  pal: { P: petal, p: shade, g: '#3B7A2A' },
});

const SPR: Record<string, Sprite> = {
  ...OAK_SPRITES,
  petals: {
    rows: ['..P...p..', '.pPp.PPp.', 'PpgPpPgpP'],
    pal: { P: '#F4AFCB', p: '#E88DB4', g: '#5A9A34' },
  },
  tulipRed: tulip('#D8303A', '#A01E28'),
  tulipOrange: tulip('#F08A24', '#C8641A'),
  tulipPink: tulip('#F4A6C8', '#D87AA4'),
  tulipWhite: tulip('#F4F2EE', '#C8C4BE'),
  lilac: {
    rows: ['.MM.', 'MmMM', 'MMmM', '.MM.', 'MmM.', '.M..', '.g..', 'gg..', '.gg.', '.g..'],
    pal: { M: '#C88AD8', m: '#9A60B0', g: '#3B7A2A' },
  },
  bluet: {
    rows: ['W.W.', '.Y..', 'W.W.', '.g..', '.g..'],
    pal: { W: '#EEF2FA', Y: '#E8C830', g: '#3B7A2A' },
  },
  sapling: {
    rows: ['.PpP.', 'PPgPP', '.PgP.', '..b..', '..b..'],
    pal: { P: '#F4AFCB', p: '#FBD0E0', g: '#5A9A34', b: '#4A2C32' },
  },
  // Facing right
  rabbit: {
    rows: [
      '......bb..',
      '......bB..',
      '......bbb.',
      '.bbbbbbbkb',
      'bBBBBBBbbp',
      'WBBBBBBBb.',
      '.bBBBBBb..',
      '..b.b..b..',
    ],
    pal: { b: '#7A5634', B: '#B08A60', k: '#111111', p: '#E8A0A0', W: '#F4F0E8' },
  },
  lamb: {
    rows: [
      '.........ooo.',
      '.oooooooowwwo',
      'owwwWwwwwofko',
      'owwwwwwWwoffo',
      '.owwwwwwwoooo',
      '..ooooooo....',
      '..l.l..l.l...',
      '..L.L..L.L...',
    ],
    pal: { o: '#A8A8A2', w: '#FAFAF6', W: '#DCDCD6', f: '#E8C8AE', k: '#222222', l: '#E8C8AE', L: '#8A7666' },
  },
};

const PAL_FAR: string[][] = [
  ['#B48AA2', '#C49CB2', '#D2AEC2', '#E0C2D2', '#ECD6E2'],
  ['#82A688', '#94B696', '#A6C6A6', '#B8D4B6', '#CAE2C8'],
  ['#BC92AA', '#CCA4BA', '#DAB6C8', '#E6C8D6', '#F0DAE4'],
];
const PAL_MID: string[][] = [
  ['#A8487A', '#C8609A', '#E07EB2', '#F0A2CA', '#FAC6DE'],
  ['#B45286', '#D06CA4', '#E68CBC', '#F4AECF', '#FCD0E2'],
  ['#346E22', '#448A2C', '#5AA438', '#78BC48', '#98D060'],
];
const PAL_FRONT: string[][] = [
  ['#9C3E70', '#BE5890', '#DA78AC', '#EE9EC6', '#FAC4DC'],
  ['#AA4A7E', '#C8649C', '#E286B8', '#F2AACC', '#FCCEE2'],
  ['#2E6620', '#3E8028', '#549C34', '#70B644', '#90CC5A'],
  ['#9C3E70', '#BE5890', '#DA78AC', '#EE9EC6', '#FAC4DC'],
];

const LAYERS: LayerCfg[] = [
  { // far — hazy pink and green treetops over the lake
    px: 4, crownTopVh: 0.6, heightVh: 1.4, bandVh: 0.3, groundVh: 1.02, speed: 0.6667,
    r: [9, 14], cell: 3, crownPals: PAL_FAR, trunkGap: [20, 38], trunkW: [7, 10], frameW: 0, birchChance: 0.15,
    hazyTrunks: true, interior: true, clusters: 0,
    litter: ['#9CC888', '#E2BCCE', '#90BE7E'], litterDepth: 3, floor: ['#88B47A', '#7EAA70', '#94BC84'], soil: ['#7A6A60', '#D8B0C4'],
    clutter: null, seed: 11,
  },
  { // mid
    px: 6, crownTopVh: 0.75, heightVh: 1.5, bandVh: 0.34, groundVh: 1.2, speed: 0.8333,
    r: [11, 17], cell: 4, crownPals: PAL_MID, trunkGap: [30, 56], trunkW: [9, 12], frameW: 0, birchChance: 0.2,
    hazyTrunks: false, interior: false, clusters: 0.4,
    litter: ['#5CA634', '#6CB83C', '#F4AFCB', '#64AE38'], litterDepth: 3, floor: ['#4E9028', '#56982C', '#5E9E32', '#F0B4CE'], soil: ['#6B4A32', '#E88DB4'],
    clutter: { gap: [10, 26], kinds: ['tallGrass', 'petals', 'tulipPink', 'dandelion', 'bluet', 'petals', 'fern', 'tulipRed', 'bush'] },
    fauna: ['rabbit', 'sheep'], seed: 23,
  },
  { // front
    px: 9, crownTopVh: 0.9, heightVh: 1.68, bandVh: 0.38, groundVh: 1.48, speed: 1.0,
    r: [14, 22], cell: 5, crownPals: PAL_FRONT, trunkGap: [40, 70], trunkW: [11, 14], frameW: 18, birchChance: 0.2,
    hazyTrunks: false, interior: false, clusters: 0.6,
    litter: ['#58A432', '#68B83C', '#7CC646', '#F4AFCB', '#E88DB4'], litterDepth: 3, floor: ['#46862A', '#4E922E', '#428028', '#F4AFCB'], soil: ['#5C402B', '#E88DB4', '#F7C6DA'],
    clutter: { gap: [6, 16], kinds: ['tallGrass', 'petals', 'tulipRed', 'tulipOrange', 'tulipPink', 'tulipWhite', 'lilac', 'bluet', 'dandelion', 'oxeye', 'petals', 'sapling', 'fern', 'bush'] },
    fauna: ['lamb', 'rabbit', 'sheep', 'chicken'], seed: 47,
  },
];

export const SPRING: ForestTheme = {
  travel: 1.42,
  layers: LAYERS,
  sprites: SPR,
  interior: ['#C8D8C4', '#B4CAB2', '#A0BAA0', '#8CA88E', '#7A967C', '#6A866C'],
  lake: {
    sky: ['#B0D6F2', '#BEDDF2', '#CCE2F0', '#E2E2EE'],
    shore: ['#C49AB4', '#9EB494', '#B48CA6', '#E2C0D2'],
    reflection: '#AAB2C8',
    water: ['#9CCCE8', '#8EC2E2', '#80B6DA', '#74ACD2'],
  },
  bark: {
    main: ['#6A4248', '#4A2C32', '#301C20'], // cherry
    hazy: ['#9A8088', '#836A72', '#6E5860'],
    birch: ['#ECECE4', '#D8D8CE', '#B0B0A4'],
    birchMark: '#2E2E2A',
  },
  logGrain: true,
  light: {
    sun: '255, 236, 232',
    moon: '200, 210, 255',
    glint: { day: '255, 250, 246', night: '220, 228, 255' },
    fly: { core: '#F6FFC0', glow: '210, 255, 140', perLayer: [5, 7, 4] },
  },
  shade: ['rgba(40, 12, 30, 0.08)', 'rgba(40, 12, 30, 0.34)'],
  veil: 'rgba(252, 240, 246, 0.24)',
};
