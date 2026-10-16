import type { ForestTheme, LayerCfg, Sprite } from './ForestScene';
import { OAK_LAYERS, OAK_SPRITES, VANILLA } from './OakVanilla';

/* ───────────────────────── Minecraft's birthday ─────────────────────────
   The classic oak woods (Minecraft went public May 17, 2009) throwing a
   party: party-colour baubles in the near crowns, the cake, presents, TNT,
   a diamond block, a crafting table and a chest on the grass, a jukebox,
   creepers in party hats, and the usual farm animals. Confetti falls.     */

const SPR: Record<string, Sprite> = {
  ...OAK_SPRITES,
  mcCake: {
    rows: ['WWRWWWRWWW', 'WWWWWWWWWW', 'WwWWwWWWwW', 'bbbbbbbbbb', 'bBbbbbbBbb', 'bbbbBbbbbb'],
    pal: { W: '#F4F0EA', w: '#DCD2C8', R: '#D8303A', b: '#B8743A', B: '#8A5228' },
  },
  present: {
    rows: ['..YY.YY..', '...YYY...', 'PPPPYPPPP', 'PPPPYPPPP', 'YYYYYYYYY', 'PPPPYPPPP', 'PPPPYPPPP'],
    pal: { P: '#3A8AE8', Y: '#F4C430' },
  },
  presentRed: {
    rows: ['..W.W..', '...W...', 'RRRWRRR', 'WWWWWWW', 'RRRWRRR', 'RRRWRRR'],
    pal: { R: '#D8303A', W: '#F8F4EA' },
  },
  tnt: {
    rows: ['..s....', 'RrRrRrR', 'RrRrRrR', 'WWWWWWW', 'WkWkWkW', 'WWWWWWW', 'RrRrRrR', 'RrRrRrR'],
    pal: { s: '#3A3A3A', R: '#D8303A', r: '#A8202A', W: '#F4F0EA', k: '#1A1A1A' },
  },
  diamondBlock: {
    rows: ['DDDDDDD', 'DdDDDdD', 'DDdDdDD', 'DDDdDDD', 'DDdDdDD', 'DdDDDdD', 'DDDDDDD'],
    pal: { D: '#5AE8E0', d: '#2AB8B0' },
  },
  craftingTable: {
    rows: ['bBbBbBb', 'BkBBBkB', 'ppppppp', 'pPpppPp', 'pPpppPp', 'pPpppPp'],
    pal: { b: '#B8864A', B: '#8A5A2A', k: '#5A3A1A', p: '#9A6A3A', P: '#6A4422' },
  },
  chest: {
    rows: ['oooooooo', 'oCCCCCCo', 'oCCCCCCo', 'oooGGooo', 'oCCGGCCo', 'oCCCCCCo', 'oooooooo'],
    pal: { o: '#5A3A1A', C: '#A8742A', G: '#C8C8C8' },
  },
  jukebox: {
    rows: ['oooooo', 'oKKKKo', 'oJJJJo', 'oJjjJo', 'oJJJJo', 'oooooo'],
    pal: { o: '#5A3A22', K: '#1A1A1A', J: '#8A5A3A', j: '#A87048' },
  },
  // Facing right
  creeper: {
    rows: ['..P...', '.PYP..', 'PPPPP.', 'GgGGgG', 'GkkGkk', 'GgGkGg', 'GkkkkG', 'GkGGkG', '.GgGG.', '.GGgG.', '.GgGG.', '.GGgG.', 'GgGGgG', 'GG..GG'],
    pal: { P: '#C060D8', Y: '#F4C430', G: '#5AB84A', g: '#3A8A2A', k: '#1A1A1A' },
  },
};

const PAL_PARTY_MID = ['#2A6A8A', '#3A82A2', '#4E9ABA', '#66B2D0', '#84C8E2'];
const PAL_PARTY_FRONT = ['#22607E', '#327896', '#4490AE', '#5CA8C6', '#7ABEDA'];

const [far, mid, front] = OAK_LAYERS;
const LAYERS: LayerCfg[] = [
  far,
  {
    ...mid,
    crownPals: [...mid.crownPals, PAL_PARTY_MID],
    clutter: { gap: [10, 28], kinds: ['tallGrass', 'present', 'poppy', 'tnt', 'dandelion', 'craftingTable', 'bush', 'presentRed', 'tallGrass'] },
    fauna: ['creeper', 'sheep', 'cow'],
  },
  {
    ...front,
    crownPals: [...front.crownPals, PAL_PARTY_FRONT],
    clutter: { gap: [6, 18], kinds: ['tallGrass', 'present', 'mcCake', 'poppy', 'tnt', 'dandelion', 'diamondBlock', 'presentRed', 'chest', 'jukebox', 'allium', 'tallGrass', 'present', 'cornflower'] },
    fauna: ['creeper', 'pig', 'sheep', 'chicken'],
  },
];

export const MC_BIRTHDAY: ForestTheme = {
  ...VANILLA,
  layers: LAYERS,
  sprites: SPR,
  ornaments: ['#E8304A', '#F4C430', '#3A8AE8', '#2EA84A', '#C060D8', '#5AE8E0'],
  light: {
    ...VANILLA.light,
    fly: { core: '#FFF4C0', glow: '255, 214, 110', perLayer: [8, 12, 7] },
  },
};
