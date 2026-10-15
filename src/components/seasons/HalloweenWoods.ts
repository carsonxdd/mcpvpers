import type { ForestTheme, LayerCfg, Sprite } from './ForestScene';

/* ───────────────────────── Haunted dark-oak woods ─────────────────────────
   Autumn's gnarled trees gone sinister: near-black dark oak and purple crowns
   with the odd burnt-orange tree, ghostly pale birches, a dusk lake under an
   orange-to-violet sky, a mycelium-flecked floor with jack o'lanterns,
   gravestones, dead bushes and a bubbling cauldron, and a zombie, skeleton,
   witch, spider and black cat. Orange will-o'-wisps replace the fireflies.   */

const SPR: Record<string, Sprite> = {
  jackOLantern: {
    rows: [
      '....gg...',
      '.OOoOoOO.',
      'OYYoOoYYO',
      'OOYoOoYOO',
      'OoOoOoOoO',
      'OYYYYYYYO',
      'OoYOYOYoO',
      '.OOOOOOO.',
    ],
    pal: { O: '#E8741C', o: '#B85410', Y: '#FFE060', g: '#3A5A1A' },
  },
  pumpkin: {
    rows: ['...g....', '.OOOOOO.', 'OOoOOoOO', 'OOoOOoOO', 'OOoOOoOO', '.OOOOOO.'],
    pal: { O: '#D8661A', o: '#A84A10', g: '#3A5A1A' },
  },
  gravestone: {
    rows: ['..SSS..', '.SSSSS.', 'SSSdSSS', 'SSdddSS', 'SSSdSSS', 'SSSdSSS', 'SsSSSSS', 'SSSSSsS', 'mmmmmmm'],
    pal: { S: '#7A7E86', s: '#9A9EA6', d: '#4A4E56', m: '#3A3424' },
  },
  graveCross: {
    rows: ['..S..', '..S..', 'SSSSS', '..S..', '..S..', '..s..', '..S..', '.mmm.'],
    pal: { S: '#8A8E96', s: '#6A6E76', m: '#3A3424' },
  },
  deadBush: {
    rows: ['b...b..b', '.b.b..b.', '..bb.b..', '...bb...', '...b....'],
    pal: { b: '#7A5A30' },
  },
  bones: {
    rows: ['W.....W.', '.WWWWW..', 'W.....W.', '...WW...', '..WkkW..', '..WWWW..'],
    pal: { W: '#E4E0D4', k: '#2A2620' },
  },
  cauldron: {
    rows: ['..g...G..', '.GgGGGgG.', 'KKKKKKKKK', '.KkKKKKK.', '.KKKKKkK.', '..KKKKK..', '.K.....K.'],
    pal: { G: '#7CE04A', g: '#4AB02A', K: '#2A2A30', k: '#44444C' },
  },
  mushroom: {
    rows: ['..PPP..', '.PWPPP.', 'PPPPWPP', '.ccccc.', '...c...', '...c...'],
    pal: { P: '#7A2E9A', W: '#C8F07A', c: '#D8CCB8' },
  },
  // Facing right
  zombie: {
    rows: [
      '..GGGG....',
      '..GGGk....',
      '..GGGG....',
      '..gGGG....',
      '..BBBBBBGG',
      '..BBBBBBGG',
      '..BBBB....',
      '..BBBB....',
      '..PPPP....',
      '..PPPP....',
      '..PPPP....',
      '.PP..PP...',
      '.PP..PP...',
      '.ss..ss...',
    ],
    pal: { G: '#5A9A4A', g: '#467A3A', k: '#1A1A1A', B: '#2E9AA2', P: '#3A3A9A', s: '#5A5A5A' },
  },
  skeleton: {
    rows: [
      '..WWWW...',
      '..WWWk...',
      '..WWWW...',
      '..WdWW...',
      '...WW...b',
      '..WWWWWWb',
      '..WdWd..b',
      '..WWWW..b',
      '...W....b',
      '..WWWW...',
      '..W..W...',
      '..W..W...',
      '.W....W..',
      '.W....W..',
    ],
    pal: { W: '#D8D8D0', d: '#8A8A84', k: '#2A2A2A', b: '#7A5A30' },
  },
  witch: {
    rows: [
      '.....P...',
      '....PP...',
      '...PPP...',
      '..PPPPP..',
      'pPPPPPPPp',
      '..FFFF...',
      '..FFkFN..',
      '..FFFF...',
      '..RRRR...',
      '.RRRRRRFV',
      '.RRRRRR..',
      '.RRRRRR..',
      '.RRRRRR..',
      '..RR.RR..',
      '..bb.bb..',
    ],
    pal: { P: '#3A2050', p: '#2A1838', F: '#8AB070', k: '#1A1A1A', N: '#7A9A60', R: '#5A2E7A', b: '#2A1A10', V: '#E040C0' },
  },
  spider: {
    rows: ['.l..l..l..l.', 'l.l.SSSS.l.l', '..lSSSSSSlr.', '.lSSSSSSSSrl', 'l.SSSSSSSS.l', 'l.l.l..l.l.l'],
    pal: { S: '#2A2226', l: '#3A3034', r: '#E02020' },
  },
  blackCat: {
    rows: [
      '..........k.k',
      'k.........kkk',
      '.k.kkkkkkkkYk',
      '..kkkkkkkkkkk',
      '...kkkkkkkk..',
      '...k.k..k.k..',
      '...k.k..k.k..',
    ],
    pal: { k: '#141018', Y: '#E8E040' },
  },
};

const PAL_FAR: string[][] = [
  ['#3A2E4A', '#4A3A5A', '#5A486A', '#6A587A', '#7C6A8A'],
  ['#4A3A40', '#5A4650', '#6A5460', '#7A6470', '#8C7680'],
];
const PAL_MID: string[][] = [
  ['#141A14', '#1E281C', '#2A3626', '#384630', '#46563A'], // dark oak
  ['#22142E', '#301C40', '#402652', '#523266', '#663E7A'], // haunted purple
  ['#141A14', '#1E281C', '#2A3626', '#384630', '#46563A'],
  ['#4A1A08', '#702A0C', '#9A3E12', '#C2581A', '#E0782A'], // last orange leaves
];
const PAL_FRONT: string[][] = [
  ['#10160F', '#1A2418', '#263222', '#34422C', '#425236'],
  ['#1E1028', '#2C183A', '#3C224C', '#4E2E60', '#623A74'],
  ['#10160F', '#1A2418', '#263222', '#34422C', '#425236'],
  ['#441606', '#68260A', '#923A10', '#BA5418', '#DA7428'],
];

const LAYERS: LayerCfg[] = [
  { // far — violet treetops over the dusk lake
    px: 4, crownTopVh: 0.6, heightVh: 1.4, bandVh: 0.3, groundVh: 1.02, speed: 0.6667,
    r: [9, 14], cell: 0, crownPals: PAL_FAR, trunkGap: [18, 34], trunkW: [6, 9], frameW: 0, birchChance: 0.15,
    hazyTrunks: true, interior: true, clusters: 0,
    litter: ['#4A3A4E', '#56445A', '#3E3242'], litterDepth: 4, floor: ['#3A2E3E', '#443646', '#342A38'], soil: ['#221A24', '#6A5A70'],
    clutter: null, seed: 13,
  },
  { // mid
    px: 6, crownTopVh: 0.75, heightVh: 1.5, bandVh: 0.34, groundVh: 1.2, speed: 0.8333,
    r: [11, 17], cell: 0, crownPals: PAL_MID, trunkGap: [28, 52], trunkW: [8, 11], frameW: 0, birchChance: 0.25,
    hazyTrunks: false, interior: false, clusters: 0.4,
    litter: ['#5E4A62', '#6E5872', '#4E3E52', '#8A4A1C'], litterDepth: 4, floor: ['#3A2C30', '#44343A', '#32262A', '#4A3A44'], soil: ['#1E1612', '#7A6A80'],
    clutter: { gap: [18, 40], kinds: ['gravestone', 'pumpkin', 'deadBush', 'mushroom', 'graveCross', 'jackOLantern', 'bones'] },
    fauna: ['blackCat', 'spider'], seed: 29,
  },
  { // front
    px: 9, crownTopVh: 0.9, heightVh: 1.68, bandVh: 0.38, groundVh: 1.48, speed: 1.0,
    r: [14, 22], cell: 0, crownPals: PAL_FRONT, trunkGap: [36, 64], trunkW: [8, 13], frameW: 18, birchChance: 0.2,
    hazyTrunks: false, interior: false, clusters: 0.6,
    litter: ['#5A4660', '#6A5470', '#4A3A50', '#8A4A1C', '#A85A20'], litterDepth: 4, floor: ['#34262A', '#3E2E34', '#2C2024', '#463640'], soil: ['#1A120E', '#7A6A80', '#5A4A60'],
    clutter: { gap: [12, 28], kinds: ['jackOLantern', 'gravestone', 'deadBush', 'pumpkin', 'graveCross', 'mushroom', 'cauldron', 'bones', 'deadBush', 'jackOLantern'] },
    fauna: ['zombie', 'witch', 'skeleton', 'blackCat'], seed: 66,
  },
];

export const HALLOWEEN: ForestTheme = {
  travel: 1.42,
  layers: LAYERS,
  sprites: SPR,
  interior: ['#5A4A6A', '#4E3E5E', '#423452', '#382A48', '#2E223E', '#261C34'],
  lake: {
    sky: ['#4A3270', '#7A3E78', '#B8566A', '#E8864E'],
    shore: ['#1A1420', '#221A2A', '#2A2032', '#3A2E44'],
    reflection: '#3A2A48',
    water: ['#5A4482', '#4C3A76', '#40306A', '#36285E'],
  },
  bark: {
    main: ['#4A3A2A', '#33261A', '#1E160E'], // dark oak
    hazy: ['#4A4250', '#3C3442', '#302A36'],
    birch: ['#D8D4D0', '#B8B4B0', '#8A8684'],
    birchMark: '#1A1A1A',
  },
  logGrain: false,
  light: {
    sun: '255, 150, 80', // low dusk sun
    moon: '214, 236, 204',
    glint: { day: '255, 190, 120', night: '204, 240, 190' },
    fly: { core: '#FFC060', glow: '255, 140, 40', perLayer: [10, 14, 8] }, // will-o'-wisps
  },
  shade: ['rgba(20, 8, 30, 0.15)', 'rgba(20, 8, 30, 0.5)'],
  veil: 'rgba(248, 236, 224, 0.22)',
};
