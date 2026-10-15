'use client';

import { useEffect, useRef } from 'react';
import type { Season } from '@/lib/seasons';

/* ───────────────────────── Autumn forest descent ─────────────────────────
   At the top of the page you see sky + clouds with the tops of the trees along
   the bottom. Scrolling carries you down through the canopy, past the trunks
   and onto the forest floor. Three parallax layers (far / mid / front) are
   painted once onto small canvases (seeded, so it's the same forest every
   time), then only CSS-translated on scroll — no per-scroll React renders.

   World units: "vh" = viewport heights. A layer's translateY at scroll
   progress p (0..1) is -p * TRAVEL_VH * speed.                                */

const TRAVEL_VH = 1.6;

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
type Sprite = { rows: string[]; pal: Record<string, string> };
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

function drawSprite(ctx: CanvasRenderingContext2D, s: Sprite, x: number, bottom: number) {
  const top = bottom - s.rows.length;
  s.rows.forEach((row, ry) => {
    for (let rx = 0; rx < row.length; rx++) {
      const c = row[rx];
      if (c !== '.') dot(ctx, x + rx, top + ry, s.pal[c]);
    }
  });
}

/* ── Painting primitives ── */
// Pixel-art crown: lit from the top-left, speckled, ragged edge.
function drawCrown(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, pal: string[], rnd: Rnd, darkBias: number) {
  const rx = r * 1.25;
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

function drawTrunk(ctx: CanvasRenderingContext2D, x: number, y0: number, y1: number, w: number, birch: boolean, hazy: boolean, rnd: Rnd) {
  const bark = birch
    ? ['#F2ECDC', '#E0D8C4', '#B8AF98']
    : hazy
      ? ['#8A6240', '#6E4A2C', '#563820']
      : ['#8A5A30', '#5E3C1E', '#3E2814'];
  const mark = birch ? '#3A342A' : bark[2];
  const flareFrom = y1 - 9;
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

function drawGround(ctx: CanvasRenderingContext2D, W: number, H: number, groundTop: number, litter: string[], soil: string[], rnd: Rnd): number[] {
  const edges: number[] = [];
  let edge = groundTop;
  for (let x = 0; x < W; x++) {
    edge = clamp(edge + Math.round((rnd() - 0.5) * 1.3), groundTop - 3, groundTop + 3);
    edges.push(edge);
    for (let y = edge; y < H; y++) {
      const depth = y - edge;
      const c = depth < 5 ? pick(rnd, litter) : depth < 9 ? pick(rnd, rnd() < 0.5 ? soil : litter) : pick(rnd, soil);
      dot(ctx, x, y, c);
    }
  }
  return edges;
}

/* ── Layer configuration ── */
interface LayerCfg {
  px: number;            // screen px per painted pixel
  crownTopVh: number;    // where the highest crowns sit at scroll 0 (screen fraction)
  heightVh: number;      // canvas height
  bandVh: number;        // vertical extent of the crown rows
  groundVh: number;      // ground line, measured from canvas top
  speed: number;         // × TRAVEL_VH
  r: [number, number];   // crown radius (painted px)
  crownPals: string[][];
  trunkGap: [number, number];
  trunkW: [number, number];
  birchChance: number;
  hazyTrunks: boolean;
  interior: boolean;     // paint the dim forest interior behind the trunks
  clusters: number;      // foliage clusters per trunk
  litter: string[];
  soil: string[];
  clutter: { gap: [number, number]; kinds: string[] } | null;
  seed: number;
}

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
    px: 4, crownTopVh: 0.6, heightVh: 1.35, bandVh: 0.3, groundVh: 0.92, speed: 0.5,
    r: [9, 14], crownPals: PAL_FAR, trunkGap: [10, 20], trunkW: [1, 3], birchChance: 0.15,
    hazyTrunks: true, interior: true, clusters: 0,
    litter: ['#8A5A2C', '#A8702E', '#B98238', '#9A6A30'], soil: ['#5A3A22', '#4A2E1C'],
    clutter: null, seed: 7,
  },
  { // mid
    px: 6, crownTopVh: 0.75, heightVh: 1.65, bandVh: 0.34, groundVh: 1.35, speed: 0.8,
    r: [11, 17], crownPals: PAL_MID, trunkGap: [24, 46], trunkW: [4, 7], birchChance: 0.25,
    hazyTrunks: false, interior: false, clusters: 2,
    litter: ['#7A3A14', '#A8501C', '#C9701E', '#D9962A', '#8A5A24'], soil: ['#3A2210', '#2A180C'],
    clutter: { gap: [26, 50], kinds: ['mushroom', 'rock', 'pumpkin', 'mound', 'mushroomBrown', 'bracken'] }, seed: 21,
  },
  { // front — big, saturated, with the floor in the foreground
    px: 9, crownTopVh: 0.9, heightVh: 1.85, bandVh: 0.38, groundVh: 1.66, speed: 1.0,
    r: [14, 22], crownPals: PAL_FRONT, trunkGap: [36, 64], trunkW: [8, 13], birchChance: 0.2,
    hazyTrunks: false, interior: false, clusters: 3,
    litter: ['#7A3A14', '#B5451B', '#D2691E', '#E8A317', '#8A5A24', '#5E3C1E'], soil: ['#2E1C0E', '#24150A', '#3A2412'],
    clutter: { gap: [14, 30], kinds: ['mushroom', 'bracken', 'rock', 'log', 'stump', 'mound', 'pumpkin', 'hay', 'mushroomBrown', 'bracken', 'mound'] }, seed: 42,
  },
];

function paintLayer(canvas: HTMLCanvasElement, cfg: LayerCfg, vw: number, vh: number, scale: number) {
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
  // deeper brown towards the floor, dithered.
  if (cfg.interior) {
    const steps = ['#B8895C', '#A27348', '#8A5E3A', '#6E4A2E', '#563824', '#46301E'];
    for (let y = Math.floor(interiorTop); y < H; y++) {
      const t = (y - interiorTop) / (groundTop - interiorTop);
      for (let x = 0; x < W; x++) {
        const i = clamp(Math.floor(t * (steps.length - 1) + (rnd() - 0.5) * 1.1), 0, steps.length - 1);
        dot(ctx, x, y, steps[i]);
      }
    }
  }

  // Trunks (under the crowns), then foliage clusters hugging them.
  const trunks: { x: number; w: number }[] = [];
  let tx = Math.floor(rnd() * cfg.trunkGap[1]);
  while (tx < W) {
    const w = cfg.trunkW[0] + Math.floor(rnd() * (cfg.trunkW[1] - cfg.trunkW[0] + 1));
    const birch = rnd() < cfg.birchChance;
    const y0 = topPad + cfg.r[1] + bandH * 0.3;
    drawTrunk(ctx, tx, Math.floor(y0), groundTop + 6, w, birch, cfg.hazyTrunks, rnd);
    trunks.push({ x: tx, w });
    tx += w + cfg.trunkGap[0] + Math.floor(rnd() * (cfg.trunkGap[1] - cfg.trunkGap[0]));
  }
  // Frame the front layer with a couple of huge trunks at the edges.
  if (cfg.speed === 1.0) {
    drawTrunk(ctx, 1, Math.floor(topPad + bandH * 0.5), groundTop + 6, 18, false, false, rnd);
    drawTrunk(ctx, W - 20, Math.floor(topPad + bandH * 0.5), groundTop + 6, 18, false, false, rnd);
    trunks.push({ x: 1, w: 18 }, { x: W - 20, w: 18 });
  }
  const clusterTop = topPad + cfg.r[1] + bandH * 0.8;
  for (const t of trunks) {
    for (let k = 0; k < cfg.clusters; k++) {
      const r = Math.max(3, Math.round(cfg.r[0] * (0.3 + rnd() * 0.25)));
      const cy = clusterTop + rnd() * (groundTop - clusterTop - 20);
      const side = rnd() < 0.5 ? -1 : 1;
      drawCrown(ctx, Math.round(t.x + t.w / 2 + side * (t.w / 2 + r * 0.7)), Math.round(cy), r, pick(rnd, cfg.crownPals), rnd, 0.6);
    }
  }

  // Canopy: three rows of overlapping crowns, back (lowest) row first so the
  // top row forms the silhouette. Lower rows are shaded a little darker.
  for (let k = 2; k >= 0; k--) {
    const cyBase = topPad + cfg.r[1] + k * bandStep;
    let x = -rnd() * cfg.r[1];
    while (x < W + cfg.r[1]) {
      const r = cfg.r[0] + Math.floor(rnd() * (cfg.r[1] - cfg.r[0] + 1));
      drawCrown(ctx, Math.round(x + r), Math.round(cyBase + (rnd() - 0.5) * r * 0.6), r, pick(rnd, cfg.crownPals), rnd, k * 0.5);
      x += r * 1.3 + rnd() * r * 0.35;
    }
  }

  // Forest floor + clutter
  const edges = drawGround(ctx, W, H, groundTop, cfg.litter, cfg.soil, rnd);
  if (cfg.clutter) {
    let x = 4 + Math.floor(rnd() * 12);
    while (x < W - 16) {
      const s = SPR[pick(rnd, cfg.clutter.kinds)];
      drawSprite(ctx, s, x, edges[clamp(x, 0, W - 1)] + 2);
      x += s.rows[0].length + cfg.clutter.gap[0] + Math.floor(rnd() * (cfg.clutter.gap[1] - cfg.clutter.gap[0]));
    }
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

function AutumnForest({ dark }: { dark: boolean }) {
  const wraps = useRef<(HTMLDivElement | null)[]>([]);
  const canvases = useRef<(HTMLCanvasElement | null)[]>([]);
  const raysRef = useRef<HTMLDivElement>(null);
  const raysWrap = useRef<HTMLDivElement>(null);
  const shadeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let vw = window.innerWidth;
    let vh = window.innerHeight;
    let maxScroll = 1;
    let p = 0;
    let raf = 0;
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;

    const apply = () => {
      raf = 0;
      LAYERS.forEach((cfg, i) => {
        const el = wraps.current[i];
        if (el) el.style.transform = `translate3d(0, ${-p * TRAVEL_VH * vh * cfg.speed}px, 0)`;
      });
      // Shafts live under the canopy: travel with the mid layer, and only fade in
      // once the descent starts so they never show over open sky.
      if (raysWrap.current) raysWrap.current.style.transform = `translate3d(0, ${-p * TRAVEL_VH * vh * LAYERS[1].speed}px, 0)`;
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
      LAYERS.forEach((cfg, i) => {
        const canvas = canvases.current[i];
        const wrap = wraps.current[i];
        if (!canvas || !wrap) return;
        wrap.style.top = `${paintLayer(canvas, cfg, vw, vh, scale)}px`;
      });
      // Rays start halfway down the mid canopy band.
      if (raysWrap.current) {
        raysWrap.current.style.top = `${(LAYERS[1].crownTopVh + LAYERS[1].bandVh * 0.5) * vh}px`;
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
  }, []);

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
              background: `linear-gradient(180deg, transparent 0%, rgba(255, 226, 160, ${dark ? 0.3 : 0.5}) 14%, rgba(255, 210, 140, 0.18) 60%, transparent 100%)`,
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
        style={{ background: 'linear-gradient(180deg, rgba(40, 20, 8, 0.1), rgba(40, 20, 8, 0.4))', opacity: 0 }}
      />
      {/* Parchment veil in light mode so text over the forest stays readable */}
      {!dark && <div className="absolute inset-0" style={{ background: 'rgba(247, 238, 223, 0.26)' }} />}
    </div>
  );
}

export default function Scenery({ season, dark }: { season: Season; dark: boolean }) {
  if (season !== 'autumn') return null;
  return <AutumnForest dark={dark} />;
}
