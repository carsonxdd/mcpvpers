'use client';

import { useEffect, useRef } from 'react';

/* ───────────────────────── Forest descent engine ─────────────────────────
   Shared by the autumn forest and the vanilla oak woods. At the top of the
   page you see sky + clouds with the tops of the trees along the bottom.
   Scrolling carries you down through the canopy, past the trunks and onto the
   forest floor. Three parallax layers (far / mid / front) are painted once
   onto small canvases (seeded, so it's the same forest every time), then only
   CSS-translated on scroll — no per-scroll React renders.

   World units: "vh" = viewport heights. A layer's translateY at scroll
   progress p (0..1) is -p * theme.travel * vh * speed.                        */

type Rnd = () => number;
function mulberry32(seed: number): Rnd {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = <T,>(r: Rnd, a: T[]): T => a[Math.floor(r() * a.length)];
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

function dot(ctx: CanvasRenderingContext2D, x: number, y: number, c: string, w = 1, h = 1) {
  ctx.fillStyle = c;
  ctx.fillRect(Math.round(x), Math.round(y), w, h);
}

/* ── Sprites (char grids; '.' transparent) ── */
export type Sprite = { rows: string[]; pal: Record<string, string> };

function drawSprite(ctx: CanvasRenderingContext2D, s: Sprite, x: number, bottom: number) {
  const top = bottom - s.rows.length;
  s.rows.forEach((row, ry) => {
    for (let rx = 0; rx < row.length; rx++) {
      const c = row[rx];
      if (c !== '.') dot(ctx, x + rx, top + ry, s.pal[c]);
    }
  });
}

/* ── Theme ── */
export interface LayerCfg {
  px: number;            // screen px per painted pixel
  crownTopVh: number;    // where the highest crowns sit at scroll 0 (screen fraction)
  heightVh: number;      // canvas height
  bandVh: number;        // vertical extent of the crown rows
  groundVh: number;      // ground line, measured from canvas top
  speed: number;         // × theme.travel. Keep crownTopVh / speed equal across layers so every
                         // canopy top leaves the screen at the same moment — otherwise a nearer
                         // layer overtakes the far treetops and sky shows above its crowns.
  r: [number, number];   // crown radius (painted px)
  cell: number;          // >0: crowns + ground built from leaf/grass "blocks" this many px wide
  crownPals: string[][];
  trunkGap: [number, number];
  trunkW: [number, number];
  frameW: number;        // big framing trunks at the edges (0 = none)
  birchChance: number;
  hazyTrunks: boolean;
  interior: boolean;     // paint the dim forest interior behind the trunks
  clusters: number;      // average branch + leaf clusters per trunk (fractions allowed)
  litter: string[];
  litterDepth: number;   // px of bright litter/grass along the edge
  floor: string[];       // the floor surface below the edge, receding
  soil: string[];        // sparse specks in the floor
  clutter: { gap: [number, number]; kinds: string[] } | null;
  fauna?: string[];      // placed once each on the floor
  seed: number;
}

export interface ForestTheme {
  travel: number;
  layers: LayerCfg[];
  sprites: Record<string, Sprite>;
  interior: string[];    // top → floor (hazy distant woods; unused when `lake` is set)
  // Optional: the far layer opens onto a lake instead — sky, a hazy far shore, water.
  lake?: { sky: string[]; shore: string[]; reflection: string; water: string[]; glint: string };
  bark: { main: string[]; hazy: string[]; birch: string[]; birchMark: string };
  logGrain: boolean;     // vertical log grain + straight trunks (vanilla) vs. gnarled bark with a flared base
  ray: { light: string; dark: string; tail: string };
  shade: [string, string];
  veil: string;          // light-mode wash so text stays readable
}

/* ── Painting primitives ── */
// Pixel-art crown: lit from the top-left, speckled, ragged edge. With `cell`
// set, the crown is assembled from square leaf blocks instead (each block
// textured per pixel, with the odd see-through gap like vanilla leaves).
function drawCrown(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, pal: string[], rnd: Rnd, darkBias: number, cell: number) {
  const rx = r * 1.25;
  if (cell > 0) {
    const cols = Math.ceil(rx / cell);
    const rows = Math.ceil(r / cell);
    const ox = Math.round(cx) - Math.floor(cell / 2);
    const oy = Math.round(cy) - Math.floor(cell / 2);
    for (let j = -rows; j <= rows; j++) {
      for (let i = -cols; i <= cols; i++) {
        const mx = i * cell;
        const my = j * cell;
        const d = (mx / rx) ** 2 + (my / r) ** 2;
        if (d > 0.9 + (rnd() - 0.5) * 0.4) continue;
        const base = 2 - (mx / rx) * 0.9 - (my / r) * 1.6 - darkBias + (rnd() - 0.5) * 0.9;
        for (let y = 0; y < cell; y++) {
          for (let x = 0; x < cell; x++) {
            const hole = rnd() < 0.06;
            let s = hole ? 0 : base + (rnd() - 0.5) * 1.5;
            if (!hole && y === cell - 1 && cell >= 4) s -= 0.5;
            dot(ctx, ox + mx + x, oy + my + y, pal[clamp(Math.round(s), 0, pal.length - 1)]);
          }
        }
      }
    }
    return;
  }
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -Math.ceil(rx); dx <= Math.ceil(rx); dx++) {
      const d = (dx / rx) ** 2 + (dy / r) ** 2;
      if (d > 0.92 + (rnd() - 0.5) * 0.3) continue;
      let s = 2 + (-(dx / rx) * 0.9 - (dy / r) * 1.7) - darkBias + (rnd() - 0.5) * 1.4;
      s += Math.sin((dx + cx) * 0.9) * Math.cos((dy + cy) * 0.8) * 0.45;
      dot(ctx, cx + dx, cy + dy, pal[clamp(Math.round(s), 0, pal.length - 1)]);
    }
  }
  const sparkles = Math.floor(r * r * 0.18);
  for (let k = 0; k < sparkles; k++) {
    const a = rnd() * Math.PI * 2;
    const rad = Math.sqrt(rnd()) * r * 0.85;
    const x = cx + Math.cos(a) * rad * 1.2;
    const y = cy + Math.sin(a) * rad;
    dot(ctx, x, y, rnd() < 0.6 ? pal[pal.length - 1] : pal[0]);
  }
}

function drawTrunk(ctx: CanvasRenderingContext2D, theme: ForestTheme, x: number, y0: number, y1: number, w: number, birch: boolean, hazy: boolean, rnd: Rnd) {
  const bark = birch ? theme.bark.birch : hazy ? theme.bark.hazy : theme.bark.main;
  const mark = birch ? theme.bark.birchMark : bark[2];

  if (theme.logGrain && !birch) {
    // Vanilla log: straight, lit left edge, shaded right, vertical bark grain.
    const cols = Array.from({ length: w }, (_, i) => (i === 0 ? 0 : i === w - 1 ? 2 : rnd() < 0.3 ? 2 : 1));
    for (let y = y0; y < y1; y++) {
      for (let i = 0; i < w; i++) {
        let c = bark[cols[i]];
        if (rnd() < 0.08) c = bark[clamp(cols[i] + (rnd() < 0.5 ? -1 : 1), 0, 2)];
        dot(ctx, x + i, y, c);
      }
    }
    // Long dark grooves
    for (let k = 0; k < Math.max(1, w / 2); k++) {
      const gx = x + 1 + Math.floor(rnd() * Math.max(1, w - 2));
      for (let y = y0 + Math.floor(rnd() * 8); y < y1; y += 6 + Math.floor(rnd() * 10)) {
        dot(ctx, gx, y, bark[2], 1, 3 + Math.floor(rnd() * 6));
      }
    }
    return;
  }

  const flareFrom = theme.logGrain ? y1 : y1 - 9;
  for (let y = y0; y < y1; y++) {
    const flare = y > flareFrom ? Math.floor((y - flareFrom) / 3) : 0;
    for (let i = -flare; i < w + flare; i++) {
      let c = i <= 0 ? bark[0] : i >= w - 1 ? bark[2] : bark[1];
      if (i > 0 && i < w - 1 && rnd() < 0.09) c = bark[2];
      if (i > 0 && i < w - 2 && rnd() < 0.05) c = bark[0];
      dot(ctx, x + i, y, c);
    }
  }
  // Birch bands / bark gashes
  for (let y = y0 + 4; y < y1 - 6; y += 4 + Math.floor(rnd() * 6)) {
    const len = Math.max(1, Math.min(w - 1, 1 + Math.floor(rnd() * Math.max(2, w * 0.7))));
    dot(ctx, x + Math.floor(rnd() * (w - len)), y, mark, len, 1);
  }
  // A knot
  if (w >= 4) {
    const ky = y0 + Math.floor((y1 - y0) * (0.3 + rnd() * 0.4));
    dot(ctx, x + 1, ky, mark, 2, 2);
  }
}

// Seen between the far trunks: pale sky down to a blocky, hazy far shore,
// then water (shore reflection, sky-lit bands, glints) down to our floor.
function paintLake(ctx: CanvasRenderingContext2D, lake: NonNullable<ForestTheme['lake']>, W: number, top: number, bottom: number, rnd: Rnd) {
  const waterTop = bottom - Math.round((bottom - top) * 0.26);
  const band = (pal: string[], t: number) => pal[clamp(Math.floor(t * (pal.length - 1) + (rnd() - 0.5) * 0.9), 0, pal.length - 1)];

  for (let y = top; y < waterTop; y++) {
    const t = (y - top) / Math.max(1, waterTop - top);
    for (let x = 0; x < W; x++) dot(ctx, x, y, band(lake.sky, t));
  }

  // Far shore treeline: heights step every 2px, like distant blocks.
  const shoreH: number[] = [];
  let h = 5;
  for (let x = 0; x < W; x += 2) {
    h = clamp(h + Math.round((rnd() - 0.5) * 3), 2, 10);
    for (let y = waterTop - h; y < waterTop; y++) {
      const c = y === waterTop - h ? lake.shore[lake.shore.length - 1] : pick(rnd, lake.shore.slice(0, -1));
      dot(ctx, x, y, c, 2, 1);
    }
    shoreH.push(h);
  }

  for (let y = waterTop; y < bottom; y++) {
    const d = y - waterTop;
    const t = d / Math.max(1, bottom - waterTop);
    for (let x = 0; x < W; x++) {
      // Treeline reflection, shorter and broken up by ripples.
      const refl = shoreH[x >> 1] * 0.5;
      dot(ctx, x, y, d < refl && rnd() < 0.8 ? lake.reflection : band(lake.water, t));
    }
  }
  const glints = Math.floor((W * (bottom - waterTop)) / 50);
  for (let k = 0; k < glints; k++) {
    const y = waterTop + 2 + Math.floor(rnd() * (bottom - waterTop - 2));
    dot(ctx, Math.floor(rnd() * W), y, lake.glint, 2 + Math.floor(rnd() * 5), 1);
  }
}

// A branch from the trunk edge (x0, y0) up to (x1, y1). Vanilla grows logs
// sideways then up (blocky L); autumn gets a tapering diagonal bough.
function drawLimb(ctx: CanvasRenderingContext2D, theme: ForestTheme, x0: number, y0: number, x1: number, y1: number, t: number, bark: string[]) {
  x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
  if (theme.logGrain) {
    const lo = Math.min(x0, x1);
    const hi = Math.max(x0, x1);
    for (let x = lo; x <= hi; x++) {
      for (let i = 0; i < t; i++) dot(ctx, x, y0 - i, i === 0 ? bark[2] : i === t - 1 ? bark[0] : bark[1]);
    }
    const vx = x1 - Math.floor(t / 2);
    for (let y = y1; y <= y0; y++) {
      for (let i = 0; i < t; i++) dot(ctx, vx + i, y, i === 0 ? bark[0] : i === t - 1 ? bark[2] : bark[1]);
    }
    return;
  }
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
  for (let s = 0; s <= steps; s++) {
    const f = s / Math.max(1, steps);
    const x = x0 + (x1 - x0) * f;
    const y = y0 + (y1 - y0) * f;
    const th = Math.max(1, Math.round(t * (1 - f * 0.6)));
    for (let i = 0; i < th; i++) dot(ctx, x, y - i, i === 0 ? bark[2] : i === th - 1 ? bark[0] : bark[1]);
  }
}

function drawGround(ctx: CanvasRenderingContext2D, cfg: LayerCfg, W: number, H: number, groundTop: number, rnd: Rnd): number[] {
  const edges: number[] = [];
  let edge = groundTop;
  for (let x = 0; x < W; x++) {
    if (cfg.cell > 0) {
      // Block terraces: the grass line only steps at block boundaries.
      if (x % cfg.cell === 0 && rnd() < 0.18) edge = clamp(edge + (rnd() < 0.5 ? -1 : 1) * Math.max(2, cfg.cell >> 1), groundTop - cfg.cell, groundTop + cfg.cell);
    } else {
      edge = clamp(edge + Math.round((rnd() - 0.5) * 1.3), groundTop - 3, groundTop + 3);
    }
    edges.push(edge);
    // Below the bright edge is the floor's surface receding towards the viewer
    // (`floor` tones speckled with litter and the odd bit of soil), not a dirt
    // cross-section — so each layer reads as more forest floor, not a shelf.
    const lip = cfg.cell > 0 ? Math.floor(rnd() * 2) : 0;
    for (let y = edge; y < H; y++) {
      const depth = y - edge;
      const v = rnd();
      const c = depth < cfg.litterDepth + lip ? pick(rnd, cfg.litter) : v < 0.06 ? pick(rnd, cfg.soil) : v < 0.3 ? pick(rnd, cfg.litter) : pick(rnd, cfg.floor);
      dot(ctx, x, y, c);
    }
  }
  return edges;
}

function paintLayer(canvas: HTMLCanvasElement, theme: ForestTheme, cfg: LayerCfg, vw: number, vh: number, scale: number) {
  const px = Math.max(2, Math.round(cfg.px * scale));
  const W = Math.ceil(vw / px) + 2;
  const H = Math.ceil((cfg.heightVh * vh) / px);
  canvas.width = W;
  canvas.height = H;
  canvas.style.width = `${W * px}px`;
  canvas.style.height = `${H * px}px`;
  const ctx = canvas.getContext('2d');
  if (!ctx) return 0;
  const rnd = mulberry32(cfg.seed);

  const topPad = cfg.r[1] + 2;
  const bandH = (cfg.bandVh * vh) / px;
  const bandStep = bandH / 3;
  const groundTop = Math.round((cfg.groundVh * vh) / px);
  const interiorTop = topPad + cfg.r[1] + bandH * 0.55;

  // Dim interior behind the trunks (far layer only): hazy light at the top,
  // deeper towards the floor, dithered.
  if (cfg.interior && theme.lake) {
    paintLake(ctx, theme.lake, W, Math.floor(interiorTop), groundTop + 2, rnd);
  } else if (cfg.interior) {
    const steps = theme.interior;
    for (let y = Math.floor(interiorTop); y < H; y++) {
      const t = (y - interiorTop) / (groundTop - interiorTop);
      for (let x = 0; x < W; x++) {
        const i = clamp(Math.floor(t * (steps.length - 1) + (rnd() - 0.5) * 1.1), 0, steps.length - 1);
        dot(ctx, x, y, steps[i]);
      }
    }
  }

  // Solid foliage behind the canopy band, so holes between crowns never show
  // sky once the nearer layers scroll up past the far layer. It stops at the
  // lowest crown row's centre, whose lower halves hide the straight edge.
  {
    const deep = cfg.crownPals[0];
    const y0 = Math.floor(topPad + cfg.r[1]);
    const y1 = Math.floor(topPad + cfg.r[1] + 2 * bandStep);
    for (let y = y0; y < y1; y++) {
      for (let x = 0; x < W; x++) dot(ctx, x, y, rnd() < 0.3 ? deep[1] : deep[0]);
    }
  }

  // Trunks (under the crowns), then limbs and branch clusters hanging off them.
  const trunks: { x: number; w: number; bark: string[] }[] = [];
  const barkFor = (birch: boolean, hazy: boolean) => (birch ? theme.bark.birch : hazy ? theme.bark.hazy : theme.bark.main);
  const trunkTop = Math.floor(topPad + cfg.r[1] + bandH * 0.3);
  let tx = Math.floor(rnd() * cfg.trunkGap[1]);
  while (tx < W) {
    const w = cfg.trunkW[0] + Math.floor(rnd() * (cfg.trunkW[1] - cfg.trunkW[0] + 1));
    const birch = rnd() < cfg.birchChance;
    drawTrunk(ctx, theme, tx, trunkTop, groundTop + 6, w, birch, cfg.hazyTrunks, rnd);
    trunks.push({ x: tx, w, bark: barkFor(birch, cfg.hazyTrunks) });
    tx += w + cfg.trunkGap[0] + Math.floor(rnd() * (cfg.trunkGap[1] - cfg.trunkGap[0]));
  }
  // Frame the layer with a couple of huge trunks at the edges.
  if (cfg.frameW > 0) {
    const fw = cfg.frameW;
    drawTrunk(ctx, theme, 1, Math.floor(topPad + bandH * 0.5), groundTop + 6, fw, false, false, rnd);
    drawTrunk(ctx, theme, W - fw - 2, Math.floor(topPad + bandH * 0.5), groundTop + 6, fw, false, false, rnd);
    trunks.push({ x: 1, w: fw, bark: theme.bark.main }, { x: W - fw - 2, w: fw, bark: theme.bark.main });
  }

  // Limbs forking up out of each trunk into the underside of the canopy.
  const canopyBottom = topPad + cfg.r[1] + 2 * bandStep + cfg.r[0] * 0.6;
  for (const t of trunks) {
    if (t.w < 3) continue;
    // At most one limb per trunk, and only on some trunks.
    if (rnd() < 0.55) continue;
    {
      const side = rnd() < 0.5 ? -1 : 1;
      const fromY = canopyBottom + bandH * (0.1 + rnd() * 0.25);
      const fromX = side < 0 ? t.x : t.x + t.w - 1;
      const reach = t.w * 0.8 + cfg.r[0] * (0.6 + rnd() * 0.6);
      drawLimb(ctx, theme, fromX, fromY, fromX + side * reach, canopyBottom - cfg.r[0], Math.max(2, Math.round(t.w / 3)), t.bark);
    }
  }

  // Lower branches: a limb out of the trunk ending in a leaf cluster.
  const clusterTop = canopyBottom + bandH * 0.35;
  for (const t of trunks) {
    if (t.w < 3) continue;
    // `clusters` is an average: 0.4 → roughly two trunks in five get a branch.
    const n = Math.floor(cfg.clusters) + (rnd() < cfg.clusters % 1 ? 1 : 0);
    for (let k = 0; k < n; k++) {
      const r = Math.max(cfg.cell > 0 ? cfg.cell * 2 : 4, Math.round(cfg.r[0] * (0.35 + rnd() * 0.25)));
      const cy = clusterTop + rnd() * Math.max(1, groundTop - clusterTop - r * 3 - 20);
      const side = rnd() < 0.5 ? -1 : 1;
      const cx = Math.round(t.x + t.w / 2 + side * (t.w / 2 + r * 2.2));
      const fromX = side < 0 ? t.x : t.x + t.w - 1;
      drawLimb(ctx, theme, fromX, cy + r * 1.8, cx, cy, Math.max(2, Math.round(t.w / 3)), t.bark);
      drawCrown(ctx, cx, Math.round(cy), r, pick(rnd, cfg.crownPals), rnd, 0.6, cfg.cell);
    }
  }

  // Canopy: three rows of overlapping crowns, back (lowest) row first so the
  // top row forms the silhouette. Lower rows are shaded a little darker.
  for (let k = 2; k >= 0; k--) {
    const cyBase = topPad + cfg.r[1] + k * bandStep;
    let x = -rnd() * cfg.r[1];
    while (x < W + cfg.r[1]) {
      const r = cfg.r[0] + Math.floor(rnd() * (cfg.r[1] - cfg.r[0] + 1));
      drawCrown(ctx, Math.round(x + r), Math.round(cyBase + (rnd() - 0.5) * r * 0.6), r, pick(rnd, cfg.crownPals), rnd, k * 0.5, cfg.cell);
      x += r * 1.3 + rnd() * r * 0.35;
    }
  }

  // Forest floor + clutter + the odd animal
  const edges = drawGround(ctx, cfg, W, H, groundTop, rnd);
  const sink = cfg.cell > 0 ? 1 : 2;
  if (cfg.clutter) {
    let x = 4 + Math.floor(rnd() * 12);
    while (x < W - 16) {
      const s = theme.sprites[pick(rnd, cfg.clutter.kinds)];
      drawSprite(ctx, s, x, edges[clamp(x, 0, W - 1)] + sink);
      x += s.rows[0].length + cfg.clutter.gap[0] + Math.floor(rnd() * (cfg.clutter.gap[1] - cfg.clutter.gap[0]));
    }
  }
  if (cfg.fauna) {
    cfg.fauna.forEach((name, i) => {
      const s = theme.sprites[name];
      const slot = W / cfg.fauna!.length;
      const x = Math.floor(slot * i + slot * (0.2 + rnd() * 0.5));
      // Stand on the highest grass under the body so feet never float.
      let floor = H;
      for (let i = 0; i < s.rows[0].length; i++) floor = Math.min(floor, edges[clamp(x + i, 0, W - 1)]);
      drawSprite(ctx, s, x, floor + 1);
    });
  }

  // Where the canvas top should sit so the highest crowns land on crownTopVh.
  return cfg.crownTopVh * vh - topPad * px;
}

const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

const RAYS = [
  { left: 6, w: 110, rot: 16, delay: 0 },
  { left: 24, w: 70, rot: 20, delay: 1.2 },
  { left: 43, w: 150, rot: 14, delay: 2.4 },
  { left: 63, w: 90, rot: 19, delay: 0.6 },
  { left: 82, w: 120, rot: 15, delay: 1.8 },
];

export default function ForestScene({ theme, dark, children }: { theme: ForestTheme; dark: boolean; children?: React.ReactNode }) {
  const wraps = useRef<(HTMLDivElement | null)[]>([]);
  const canvases = useRef<(HTMLCanvasElement | null)[]>([]);
  const raysRef = useRef<HTMLDivElement>(null);
  const raysWrap = useRef<HTMLDivElement>(null);
  const shadeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { layers, travel } = theme;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let vw = window.innerWidth;
    let vh = window.innerHeight;
    let maxScroll = 1;
    let p = 0;
    let raf = 0;
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;

    const apply = () => {
      raf = 0;
      layers.forEach((cfg, i) => {
        const el = wraps.current[i];
        if (el) el.style.transform = `translate3d(0, ${-p * travel * vh * cfg.speed}px, 0)`;
      });
      // Shafts live under the canopy: travel with the mid layer, and only fade in
      // once the descent starts so they never show over open sky.
      if (raysWrap.current) raysWrap.current.style.transform = `translate3d(0, ${-p * travel * vh * layers[1].speed}px, 0)`;
      if (raysRef.current) raysRef.current.style.opacity = String(smooth(0.12, 0.38, p) * (1 - smooth(0.85, 1, p) * 0.4));
      if (shadeRef.current) shadeRef.current.style.opacity = String(smooth(0.2, 1, p));
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(apply); };

    const measure = () => {
      maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      p = reduceMotion ? 0 : clamp(window.scrollY / maxScroll, 0, 1);
    };

    const paintAll = () => {
      vw = window.innerWidth;
      vh = window.innerHeight;
      const scale = vw < 768 ? 0.67 : 1;
      layers.forEach((cfg, i) => {
        const canvas = canvases.current[i];
        const wrap = wraps.current[i];
        if (!canvas || !wrap) return;
        wrap.style.top = `${paintLayer(canvas, theme, cfg, vw, vh, scale)}px`;
      });
      // Rays start halfway down the mid canopy band.
      if (raysWrap.current) {
        raysWrap.current.style.top = `${(layers[1].crownTopVh + layers[1].bandVh * 0.5) * vh}px`;
        raysWrap.current.style.height = `${1.4 * vh}px`;
      }
      measure();
      schedule();
    };

    paintAll();

    const onScroll = () => { measure(); schedule(); };
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(paintAll, 150);
    };
    if (!reduceMotion) window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    // Page height changes as content loads; keep progress honest.
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(onScroll) : null;
    ro?.observe(document.body);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      ro?.disconnect();
      clearTimeout(resizeTimer);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [theme]);

  const layerEl = (i: number) => (
    <div
      key={i}
      ref={(el) => { wraps.current[i] = el; }}
      className="absolute left-0 will-change-transform"
      style={{ top: 0 }}
    >
      <canvas ref={(el) => { canvases.current[i] = el; }} style={{ display: 'block', imageRendering: 'pixelated' }} />
    </div>
  );

  return (
    <>
      <div
        className="absolute inset-0 pointer-events-none season-fade-in"
        style={{
          filter: dark ? 'brightness(0.42) saturate(0.8)' : 'none',
          transition: 'filter 1.5s ease-in-out',
        }}
        aria-hidden="true"
      >
        {layerEl(0)}
        {layerEl(1)}

        {/* Sun shafts between the mid and front layers */}
        <div ref={raysWrap} className="absolute inset-x-0 overflow-hidden will-change-transform">
          <div ref={raysRef} className="absolute inset-0" style={{ opacity: 0, mixBlendMode: 'screen' }}>
          {RAYS.map((r, i) => (
            <div
              key={i}
              className="forest-ray absolute"
              style={{
                left: `${r.left}%`,
                top: '-10%',
                width: `${r.w}px`,
                height: '150%',
                transform: `rotate(${r.rot}deg)`,
                transformOrigin: 'top center',
                background: `linear-gradient(180deg, transparent 0%, ${dark ? theme.ray.dark : theme.ray.light} 14%, ${theme.ray.tail} 60%, transparent 100%)`,
                filter: 'blur(8px)',
                animationDelay: `${r.delay}s`,
              }}
            />
          ))}
          </div>
        </div>

        {layerEl(2)}

        {/* Deeper = darker */}
        <div
          ref={shadeRef}
          className="absolute inset-0"
          style={{ background: `linear-gradient(180deg, ${theme.shade[0]}, ${theme.shade[1]})`, opacity: 0 }}
        />
        {/* Veil in light mode so text over the forest stays readable */}
        {!dark && <div className="absolute inset-0" style={{ background: theme.veil }} />}
      </div>
      {children}
    </>
  );
}
