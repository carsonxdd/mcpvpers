import type { ForestTheme, LayerCfg, Sprite } from './ForestScene';
import { AUTUMN, AUTUMN_LAYERS, AUTUMN_SPRITES } from './AutumnWoods';
import { OAK_SPRITES } from './OakVanilla';

/* ───────────────────────── Thanksgiving harvest ─────────────────────────
   The autumn woods at harvest time: turkeys strutting the leaf litter with a
   chicken and a cow, cornucopias and pies set out among the pumpkins and hay,
   dried corn stalks, and the harvest moon over the lake.                    */

const SPR: Record<string, Sprite> = {
  ...AUTUMN_SPRITES,
  chicken: OAK_SPRITES.chicken,
  cow: OAK_SPRITES.cow,
  // Facing right: tail fan behind, wattle at the front
  turkey: {
    rows: [
      '..TOT........',
      '.TOYOT.......',
      'TOYTYOT...hh.',
      'TOYTYOT..hhkh',
      '.TOYOT...hhhY',
      '..TBBBBBBBhR.',
      '...BbBBbBBB..',
      '....BBBBBB...',
      '.....l..l....',
      '....ll.ll....',
    ],
    pal: { T: '#7A4A24', O: '#C8762A', Y: '#E8B84A', B: '#5A3A20', b: '#3A2414', h: '#A88A7A', k: '#111111', R: '#D8202A', l: '#E8A020' },
  },
  cornucopia: {
    rows: ['h..........', 'Hh.....RR..', '.HhHHhROYG.', '..HhHHhGORY', '...hhhhYROG'],
    pal: { h: '#A87A40', H: '#D8A860', R: '#C8262A', O: '#E8741C', Y: '#F4C430', G: '#6A9A2A' },
  },
  pie: {
    rows: ['..ccccc..', '.cOOoOOc.', 'cOOooOOOc', 'ttttttttt'],
    pal: { c: '#D8A860', O: '#D8822A', o: '#F4E8D8', t: '#A8A8A8' },
  },
  corn: {
    rows: ['..g..', '.gg.g', 'g.gg.', '.Ygg.', '.Yg.g', 'gYg..', '..g..', '..gg.', '..g..'],
    pal: { g: '#C8A84A', Y: '#E8B830' },
  },
};

const [far, mid, front] = AUTUMN_LAYERS;
const LAYERS: LayerCfg[] = [
  far,
  {
    ...mid,
    clutter: { gap: [22, 44], kinds: ['corn', 'pumpkin', 'hay', 'mushroom', 'mound', 'corn', 'rock', 'pumpkin'] },
    fauna: ['turkey', 'chicken'],
  },
  {
    ...front,
    clutter: { gap: [12, 28], kinds: ['pumpkin', 'cornucopia', 'hay', 'corn', 'pie', 'mound', 'stump', 'pumpkin', 'bracken', 'corn', 'hay', 'cornucopia', 'log'] },
    fauna: ['turkey', 'cow', 'turkey'],
  },
];

export const THANKSGIVING: ForestTheme = {
  ...AUTUMN,
  layers: LAYERS,
  sprites: SPR,
};
