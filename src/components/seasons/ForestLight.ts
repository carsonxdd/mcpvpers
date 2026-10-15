/* ───────────────────────── Forest lighting ─────────────────────────
   The animated light that sits on top of the painted forest layers
   (ForestScene paints the layers once; this redraws every frame):

   - Sun shafts: soft beams falling out of the mid canopy onto the mid floor.
     Each one fades in and out on its own slow noise, sways with a shared
     wind, and a passing-cloud term dims them all together. Dust motes drift
     through and only catch the light inside a beam. At night they turn into
     faint moonbeams.
   - Floor flecks: dappled pixel spots where the shafts land, plus a few on
     the front floor.
   - Lake: a glitter path on the water under the sun (a narrower moon glade
     at night), twinkling glints, drifting ripple highlights and a bright
     horizon line, masked to the painted water pixels so trunks and floor in
     front of the lake stay dark.
   - Fireflies at night, at all three depths: they wander, flash on their own
     rhythm (now and then a wave of flashes sweeps across the woods), light
     the trees around them in stepped Minecraft-style light levels, throw a
     pool of light onto the floor below and, over the lake, a reflection.

   Per-layer light canvases live inside each layer's wrapper, so they ride
   the same parallax transform for free and are covered by nearer layers.
   They draw in 3 css-px pixels; the lake canvas uses the far layer's own
   pixel grid so its glints match the painted ones.                           */

import type { ForestTheme } from './ForestScene';

export type Rnd = () => number;
export function mulberry32(seed: number): Rnd {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
// Screen y (css px) of the bottom of the mid canopy band — updated by
// ForestScene on scroll (off-screen at the top of the page). Falling leaves
// only show below it.
// -Infinity when no forest is mounted (no clipping).
export const canopyLine = { y: -Infinity };

export const clamp =(v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
export const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

// Smooth 1D value noise in 0..1.
function hash(n: number) {
  const v = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
}
function noise(x: number) {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  return hash(i) * (1 - u) + hash(i + 1) * u;
}
const gauss = (r: Rnd) => (r() + r() + r() - 1.5) * 2;

type RGB = [number, number, number];
const rgb = (s: string) => s.split(',').map(Number) as RGB;
const mix = (a: RGB, b: RGB, t: number) => a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(', ');

export interface LightTheme {
  sun: string;                        // 'r, g, b' — shafts by day
  moon: string;                       // shafts by night
  glint: { day: string; night: string };
  fly: { core: string; glow: string; perLayer: [number, number, number] };
}

// What paintLayer reports back about a painted layer, in that layer's canvas pixels.
export interface LayerGeo {
  top: number;           // wrapper top (css px) before scrolling
  px: number;            // css px per painted pixel
  W: number;
  H: number;
  groundTop: number;
  edges: number[];       // grass line per column
  canopyBottom: number;
  lake: { waterTop: number; bottom: number; mask: HTMLCanvasElement } | null;
}

export interface LightCanvases {
  light: (HTMLCanvasElement | null)[];
  lake: HTMLCanvasElement | null;
  shafts: HTMLCanvasElement | null;       // mid set, inside the rays wrapper
  frontShafts: HTMLCanvasElement | null;  // front set, inside the front layer's wrapper
}

export interface LightFrame {
  t: number;             // seconds
  dt: number;
  night: number;         // 0 day → 1 night (eased with the theme crossfade)
  wet: number;           // 0 dry → 1 rain
  offsets: number[];     // each layer wrapper's current screen top (css px)
  raysFade: number;      // the shaft wrapper's scroll fade
}

const LP = 3;            // css px per light pixel
const SR = 2;            // css px per shaft-canvas pixel
const HALO = [7, 12, 17]; // firefly glow radius per layer (light px)
const POOL = [9, 15, 22];
const REACH = [60, 110, 170]; // how high (css px) a firefly can be and still light the floor
const CORE = [1, 1, 2];

// Stepped radial glow — four flat light levels, like block light.
function stamp(r: number, color: string, squash = 1) {
  const h = Math.max(1, Math.round(r * squash));
  const c = document.createElement('canvas');
  c.width = 2 * r + 1;
  c.height = 2 * h + 1;
  const g = c.getContext('2d');
  if (!g) return c;
  for (let y = -h; y <= h; y++) {
    for (let x = -r; x <= r; x++) {
      const d = Math.hypot(x / r, y / h);
      if (d >= 1) continue;
      const lvl = Math.ceil((1 - d) * 4) / 4;
      g.fillStyle = `rgba(${color}, ${(lvl ** 1.6 * 0.62).toFixed(3)})`;
      g.fillRect(x + r, y + h, 1, 1);
    }
  }
  return c;
}

function sizeCanvas(c: HTMLCanvasElement, cssW: number, cssH: number, unit: number) {
  c.width = Math.max(1, Math.ceil(cssW / unit));
  c.height = Math.max(1, Math.ceil(cssH / unit));
  c.style.width = `${c.width * unit}px`;
  c.style.height = `${c.height * unit}px`;
  return c.getContext('2d');
}

interface Fly {
  layer: number; bx: number; by: number; ax: number; ay: number;
  f1: number; f2: number; f3: number; ph: number;
  period: number; off: number; dur: number;
  surf: number;          // >0: hovering over the lake; the water row under it (css px)
  x: number; y: number; a: number;
}
interface Fleck { dx: number; dy: number; w: number; ph: number }
interface Shaft {
  x0: number; w0: number; base: number; seed: number; flecks: Fleck[];
  x: number; xb: number; w: number; L: number; I: number;
}
interface Mote { x: number; y: number; vx: number; vy: number; ph: number; big: boolean }
interface ShaftSet {
  ctx: CanvasRenderingContext2D | null;
  layer: number;         // which layer it travels with
  local: number;         // canvas top relative to that layer's wrapper (css px)
  L: number;             // shaft length: canvas top → that layer's floor
  h: number;
  gain: number;
  shafts: Shaft[];
  motes: Mote[];
  dirty?: boolean;
}
interface Glint { dx: number; y: number; len: number; w: number; ph: number; col: boolean }
interface Ripple { x: number; y: number; len: number; v: number }

export interface LightRig {
  draw: (f: LightFrame) => void;
}

export function createRig(
  theme: ForestTheme,
  geos: LayerGeo[],
  cvs: LightCanvases,
  opts: { vw: number; vh: number; mobile: boolean; raysTop: number; raysH: number },
): LightRig {
  const { vw, vh, mobile, raysTop, raysH } = opts;
  const L = theme.light;
  const r = mulberry32(99);

  const lctx = geos.map((g, i) => {
    const c = cvs.light[i];
    return c ? sizeCanvas(c, g.W * g.px, g.H * g.px, LP) : null;
  });
  const dirty = geos.map(() => true);

  const far = geos[0];
  const lake = far.lake;
  let lakeCtx: CanvasRenderingContext2D | null = null;
  if (cvs.lake) {
    if (lake) lakeCtx = sizeCanvas(cvs.lake, far.W * far.px, far.H * far.px, far.px);
    else sizeCanvas(cvs.lake, 1, 1, 1);
  }
  const sctx = cvs.shafts ? sizeCanvas(cvs.shafts, vw, raysH, SR) : null;

  const halos = HALO.map((h) => stamp(h, L.fly.glow));
  const pools = POOL.map((p) => stamp(p, L.fly.glow, 0.28));

  const edgeAt = (g: LayerGeo, cssX: number) => g.edges[clamp(Math.floor(cssX / g.px), 0, g.W - 1)] * g.px;

  // Fireflies
  const flies: Fly[][] = geos.map((g, i) => {
    const n = Math.round(L.fly.perLayer[i] * (mobile ? 0.5 : 1));
    const cssW = g.W * g.px;
    const gt = g.groundTop * g.px;
    const cb = g.canopyBottom * g.px;
    return Array.from({ length: n }, () => {
      const f: Fly = {
        layer: i, bx: r() * cssW, by: 0, ax: (12 + r() * 28) * (0.6 + i * 0.3), ay: 5 + r() * 14,
        f1: 0.06 + r() * 0.12, f2: 0.11 + r() * 0.2, f3: 0.08 + r() * 0.16, ph: r() * 100,
        period: 3.5 + r() * 4, off: r() * 10, dur: 0.16 + r() * 0.14, surf: 0, x: 0, y: 0, a: 0,
      };
      if (i === 0 && lake && r() < 0.6) {
        f.surf = (lake.waterTop + 2 + r() * (lake.bottom - lake.waterTop - 6)) * g.px;
        f.by = f.surf - 8 - r() * 30;
        f.ay *= 0.4;
      } else {
        f.by = gt - (0.05 + r() ** 1.6 * 0.6) * (gt - cb);
      }
      return f;
    });
  });

  // Two sets of shafts: behind the front trees (out of the mid canopy onto the
  // mid floor) and in front of them (out of the front canopy onto the front
  // floor). Spread across and a little past the right edge, since they lean left.
  const mid = geos[1];
  const front = geos[2];
  const makeSet = (layer: number, ctx: CanvasRenderingContext2D | null, local: number, L: number, h: number, n: number, wr: [number, number], gain: number, nMotes: number): ShaftSet => ({
    ctx, layer, local, L, h, gain,
    shafts: Array.from({ length: n }, (_, j) => {
      const w0 = (wr[0] + r() * (wr[1] - wr[0])) * (mobile ? 0.6 : 1);
      return {
        x0: ((j + 0.2 + r() * 0.6) / n) * vw * 1.12, w0, base: 0.55 + r() * 0.45, seed: r() * 1000,
        flecks: Array.from({ length: 4 + Math.floor(r() * 3) }, () => ({ dx: gauss(r) * w0 * 0.55, dy: r() * 9 * (layer - 0.5), w: 1 + Math.floor(r() * 3), ph: r() * 7 })),
        x: 0, xb: 0, w: 0, L: 0, I: 0,
      };
    }),
    motes: Array.from({ length: Math.round(nMotes * (mobile ? 0.4 : 1)) }, () => ({
      x: r() * vw, y: r() * L, vx: (r() - 0.5) * 6, vy: 1 + r() * 4, ph: r() * 7, big: r() < 0.15,
    })),
  });
  const sets: ShaftSet[] = [
    makeSet(1, sctx, raysTop - mid.top, mid.top + mid.groundTop * mid.px - raysTop, raysH, mobile ? 4 : 7, [40, 130], 1, 110),
  ];
  if (cvs.frontShafts) {
    const y0 = front.canopyBottom * front.px - 0.1 * vh;
    const L = front.groundTop * front.px - y0;
    const c = cvs.frontShafts;
    const ctx = sizeCanvas(c, vw, L + 60, SR);
    c.style.top = `${y0}px`;
    sets.push(makeSet(2, ctx, y0, L, L + 60, mobile ? 2 : 4, [80, 170], 0.85, 50));
  }

  // Front floor flecks (css px along the front layer)
  const frontFlecks: Fleck[] = Array.from({ length: mobile ? 12 : 26 }, () => ({
    dx: r() * front.W * front.px, dy: r() * 24, w: 2 + Math.floor(r() * 5), ph: r() * 50,
  }));

  // Lake (far layer pixels)
  const glints: Glint[] = [];
  const ripples: Ripple[] = [];
  if (lake) {
    const wh = lake.bottom - lake.waterTop;
    const n = Math.floor((far.W * wh) / (mobile ? 22 : 12));
    for (let k = 0; k < n; k++) {
      const col = r() < 0.6;
      glints.push({
        dx: col ? gauss(r) : r() * far.W, y: lake.waterTop + 1 + Math.floor(r() * (wh - 1)),
        len: col ? 1 + Math.floor(r() * 4) : 1 + Math.floor(r() * 2), w: 1.2 + r() * 2.8, ph: r() * 7, col,
      });
    }
    // Ripples drift sideways; nearer rows (lower) are longer and quicker.
    for (let k = 0; k < (mobile ? 24 : 42); k++) {
      const d = r();
      ripples.push({
        x: r() * far.W, y: lake.waterTop + 2 + Math.floor(d * (wh - 2)),
        len: 2 + Math.floor(r() * 4 + d * 8), v: (0.8 + r() * 1.5 + d * 1.5) * (r() < 0.5 ? -1 : 1),
      });
    }
  }

  const sunRgb = rgb(L.sun);
  const moonRgb = rgb(L.moon);
  const glintDay = rgb(L.glint.day);
  const glintNight = rgb(L.glint.night);
  const sunX = vw * 0.88 - 50;   // matches the PixelSun / PixelMoon placement in ParallaxBackground
  const moonX = vw * 0.86 - 50;

  function draw(fr: LightFrame) {
    const { t, dt, night, wet, offsets } = fr;
    const cloud = 0.62 + 0.38 * smooth(0.2, 0.8, noise(t * 0.045 + 17));
    const sunK = (1 - night) * (1 - wet * 0.85) * cloud;
    const moonK = night * (1 - wet * 0.8);
    const beamK = sunK + moonK * 0.42;
    const beam = mix(sunRgb, moonRgb, night);
    const wind = noise(t * 0.12 + 5) * 2 - 1;
    const flyK = night * (1 - wet * 0.75);
    const colX = sunX + (moonX - sunX) * night;

    // ── Shaft state (shared by the shaft canvases and the floor flecks)
    for (const set of sets) {
      for (const s of set.shafts) {
        s.x = s.x0 + Math.sin(t * 0.21 + s.seed) * 9 + wind * 12 * set.layer;
        const ang = 0.3 - ((s.x - colX) / vw) * 0.16;
        s.L = set.L;
        s.xb = s.x - Math.tan(ang) * s.L;
        s.w = s.w0 * (0.9 + 0.1 * Math.sin(t * 0.37 + s.seed));
        const breathe = 0.35 + 0.65 * smooth(0.25, 0.75, noise(t * 0.07 + s.seed));
        const leaves = 0.92 + 0.08 * Math.sin(t * 2.1 + s.seed) * Math.sin(t * 1.3 + s.seed * 2);
        s.I = s.base * beamK * breathe * leaves * set.gain;
      }
    }

    // ── Shafts + motes
    for (const set of sets) {
      const sctx = set.ctx;
      if (!sctx) continue;
      const shafts = set.shafts;
      const floorY = set.L;
      const top = offsets[set.layer] + set.local;
      const visible = top < vh && top + set.h > 0 && (set.layer !== 1 || fr.raysFade > 0.01);
      if (!visible && !set.dirty) continue;
      sctx.setTransform(1 / SR, 0, 0, 1 / SR, 0, 0);
      sctx.globalCompositeOperation = 'source-over';
      sctx.globalAlpha = 1;
      sctx.clearRect(0, 0, vw, set.h);
      set.dirty = false;
      if (visible && beamK > 0.01) {
        set.dirty = true;
        sctx.globalCompositeOperation = 'lighter';
        for (const s of shafts) {
          if (s.I < 0.01) continue;
          // Three nested passes feather the edges and keep a brighter core.
          for (const [wf, af] of [[1, 0.3], [0.62, 0.34], [0.3, 0.4]]) {
            const hw = (s.w * wf) / 2;
            const bw = hw * 1.6;
            const a = s.I * af;
            const g = sctx.createLinearGradient(s.x, 0, s.xb, s.L);
            g.addColorStop(0, `rgba(${beam}, 0)`);
            g.addColorStop(0.14, `rgba(${beam}, ${a})`);
            g.addColorStop(0.55, `rgba(${beam}, ${a * 0.72})`);
            g.addColorStop(0.9, `rgba(${beam}, ${a * 0.5})`);
            g.addColorStop(1, `rgba(${beam}, ${a * 0.35})`);
            sctx.fillStyle = g;
            sctx.beginPath();
            sctx.moveTo(s.x - hw, 0);
            sctx.lineTo(s.x + hw, 0);
            sctx.lineTo(s.xb + bw, s.L);
            sctx.lineTo(s.xb - bw, s.L);
            sctx.closePath();
            sctx.fill();
          }
          // Where it lands
          sctx.save();
          sctx.translate(s.xb, s.L);
          sctx.scale(1, 0.2);
          const pr = s.w * 1.3;
          const pg = sctx.createRadialGradient(0, 0, 0, 0, 0, pr);
          pg.addColorStop(0, `rgba(${beam}, ${s.I * 0.6})`);
          pg.addColorStop(1, `rgba(${beam}, 0)`);
          sctx.fillStyle = pg;
          sctx.fillRect(-pr, -pr, pr * 2, pr * 2);
          sctx.restore();
        }
        // Dust: invisible in the shade, glittering inside a beam.
        sctx.fillStyle = `rgb(${mix(sunRgb, moonRgb, night * 0.6)})`;
        for (const m of set.motes) {
          m.x += (m.vx + wind * 7) * dt;
          m.y += m.vy * dt;
          if (m.y > floorY) m.y -= floorY;
          if (m.x < -10) m.x += vw + 20;
          else if (m.x > vw + 10) m.x -= vw + 20;
          const y = m.y + Math.sin(t * 0.6 + m.ph) * 5;
          let lit = 0;
          for (const s of shafts) {
            const f = y / s.L;
            if (f < 0.06 || f > 1 || s.I < 0.01) continue;
            const cx = s.x + (s.xb - s.x) * f;
            const d = (m.x - cx) / ((s.w / 2) * (1 + 0.6 * f));
            if (d > -1 && d < 1) lit += s.I * (1 - d * d) * smooth(0.06, 0.22, f);
          }
          const a = Math.min(1, lit * 1.1) * (0.55 + 0.45 * Math.sin(t * 1.7 + m.ph * 3));
          if (a < 0.03) continue;
          sctx.globalAlpha = a;
          const sz = m.big ? 4 : 2;
          sctx.fillRect(Math.round(m.x / SR) * SR, Math.round(y / SR) * SR, sz, sz);
        }
        sctx.globalAlpha = 1;
      }
    }

    // ── Firefly positions + flash (shared by the light and lake canvases)
    const wave = ((t % 31) / 6) * 1.5 - 0.25; // a flash wave sweeps across every 31s
    for (const list of flies) {
      for (const f of list) {
        f.x = f.bx + Math.sin(t * f.f1 + f.ph) * f.ax + Math.sin(t * f.f2 + f.ph * 2.3) * f.ax * 0.5;
        f.y = f.by + Math.sin(t * f.f3 + f.ph * 1.7) * f.ay + Math.cos(t * f.f1 * 0.7 + f.ph) * f.ay * 0.4;
        if (f.surf) f.y = Math.min(f.y, f.surf - 4);
        const u = ((t + f.off) % f.period) / f.period;
        let a = 0.14 + 0.1 * Math.sin(t * 1.3 + f.ph);
        if (u < f.dur) a += Math.sin((Math.PI * u) / f.dur) ** 2;
        if (wave < 1.3) {
          const dx = f.x / vw - wave;
          a += Math.exp(-(dx * dx) / 0.004) * 0.9;
        }
        f.a = Math.min(1.2, a) * flyK;
      }
    }

    // ── Per-layer light
    geos.forEach((g, i) => {
      const ctx = lctx[i];
      if (!ctx) return;
      const off = offsets[i];
      const onScreen = (y: number, pad = 80) => off + y > -pad && off + y < vh + pad;
      const want = flyK > 0.01 || (sunK > 0.01 && i > 0) || (i === 0 && lake && sunK + moonK > 0.01);
      if (!want && !dirty[i]) return;
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      dirty[i] = false;
      ctx.globalCompositeOperation = 'lighter';

      // Bright water bounces light up onto the far shore and trunk bases.
      if (i === 0 && lake) {
        const wy = lake.waterTop * g.px;
        const k = (sunK + moonK * 0.4) * (0.85 + 0.15 * Math.sin(t * 0.8));
        if (k > 0.01 && onScreen(wy)) {
          const y0 = (wy - 44) / LP;
          const y1 = (wy + 6) / LP;
          const gr = ctx.createLinearGradient(0, y0, 0, y1);
          gr.addColorStop(0, `rgba(${mix(glintDay, glintNight, night)}, 0)`);
          gr.addColorStop(1, `rgba(${mix(glintDay, glintNight, night)}, ${0.16 * k})`);
          ctx.fillStyle = gr;
          ctx.fillRect(0, y0, ctx.canvas.width, y1 - y0);
          dirty[i] = true;
        }
      }

      // Dappled sun where the shafts land
      const set = sets.find((s) => s.layer === i);
      if (set && beamK > 0.01) {
        ctx.fillStyle = `rgb(${beam})`;
        for (const s of set.shafts) {
          for (const fl of s.flecks) {
            const x = s.xb + fl.dx;
            const y = edgeAt(g, x) + fl.dy;
            if (!onScreen(y)) continue;
            const a = s.I * 0.85 * (0.45 + 0.55 * Math.sin(t * 1.9 + fl.ph));
            if (a < 0.02) continue;
            ctx.globalAlpha = a;
            ctx.fillRect(Math.round(x / LP), Math.round(y / LP), fl.w, 1);
            dirty[i] = true;
          }
        }
      }
      if (i === 2 && sunK > 0.01) {
        ctx.fillStyle = `rgb(${beam})`;
        for (const fl of frontFlecks) {
          const y = edgeAt(g, fl.dx) + 10 + fl.dy;
          if (!onScreen(y)) continue;
          const a = sunK * 0.55 * smooth(0.35, 0.75, noise(t * 0.22 + fl.ph)) * (0.85 + 0.15 * Math.sin(t * 2.4 + fl.ph));
          if (a < 0.02) continue;
          ctx.globalAlpha = a;
          ctx.fillRect(Math.round(fl.dx / LP), Math.round(y / LP), fl.w, 1);
          ctx.globalAlpha = a * 0.5;
          ctx.fillRect(Math.round(fl.dx / LP) + 1, Math.round(y / LP) + 1, Math.max(1, fl.w - 2), 1);
          dirty[i] = true;
        }
      }

      // Fireflies + the light they throw
      if (flyK > 0.01) {
        const halo = halos[i];
        const pool = pools[i];
        const hr = HALO[i];
        ctx.fillStyle = L.fly.core;
        for (const f of flies[i]) {
          if (!onScreen(f.y) || f.a < 0.01) continue;
          const lx = Math.round(f.x / LP);
          const ly = Math.round(f.y / LP);
          ctx.globalAlpha = Math.min(1, f.a);
          ctx.drawImage(halo, lx - hr, ly - hr);
          const floor = f.surf || edgeAt(g, f.x);
          const h = floor - f.y;
          if (h >= 0 && h < REACH[i]) {
            ctx.globalAlpha = Math.min(1, f.a) * (1 - h / REACH[i]) * 0.9;
            ctx.drawImage(pool, lx - POOL[i], Math.round(floor / LP) - (pool.height >> 1));
          }
          ctx.globalAlpha = Math.min(1, 0.2 * flyK + f.a);
          ctx.fillRect(lx, ly, CORE[i], CORE[i]);
          dirty[i] = true;
        }
      }
    });

    // ── Lake
    if (lakeCtx && lake) {
      const ctx = lakeCtx;
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, far.W, far.H);
      const Kl = sunK + moonK * 0.55;
      const visible = offsets[0] + lake.bottom * far.px > 0 && offsets[0] + lake.waterTop * far.px < vh;
      if (visible) {
        ctx.globalCompositeOperation = 'lighter';
        const cx = colX / far.px;
        const sig = (y: number) => (6 + (y - lake.waterTop) * 1.3) * (1 - night * 0.45);
        ctx.fillStyle = `rgb(${mix(glintDay, glintNight, night)})`;

        if (Kl > 0.01) {
          // Glitter path: ripple bands that crawl towards the viewer
          for (let y = lake.waterTop; y < lake.bottom; y++) {
            const s = sig(y);
            const x0 = Math.max(0, Math.floor(cx - 2.5 * s));
            const x1 = Math.min(far.W, Math.ceil(cx + 2.5 * s));
            for (let x = x0; x < x1; x++) {
              const c = Math.exp(-((x - cx) ** 2) / (2 * s * s));
              const band = 0.5 + 0.5 * Math.sin(y * 1.9 - t * 1.4 + Math.sin(x * 0.35 + t * 0.6) * 1.6);
              const a = Math.floor(Kl * c * band * 0.7 * 6) / 6;
              if (a <= 0) continue;
              ctx.globalAlpha = a;
              ctx.fillRect(x, y, 1, 1);
            }
          }
          // Horizon line where the far shore meets the water
          const s0 = sig(lake.waterTop) * 3;
          ctx.globalAlpha = Kl * 0.6 * (0.8 + 0.2 * Math.sin(t * 1.1));
          ctx.fillRect(Math.round(cx - s0), lake.waterTop, Math.round(s0 * 2), 1);
          // Glints
          for (const gl of glints) {
            const b = Math.max(0, Math.sin(t * gl.w + gl.ph)) ** 6;
            const a = Kl * b * (gl.col ? 1 : 0.6);
            if (a < 0.02) continue;
            const x = gl.col ? cx + gl.dx * sig(gl.y) * 1.1 : gl.dx;
            ctx.globalAlpha = Math.min(1, a);
            ctx.fillRect(Math.round(x), gl.y, gl.len, 1);
          }
        }

        // Ripple highlights drifting across the whole lake, faintly there in any light
        ctx.globalAlpha = 0.06 + 0.16 * sunK + 0.08 * moonK;
        for (const rp of ripples) {
          const span = far.W + rp.len;
          const x = ((((rp.x + t * rp.v) % span) + span) % span) - rp.len;
          ctx.fillRect(Math.round(x), rp.y, rp.len, 1);
        }

        // Firefly reflections, wobbling with the water
        if (flyK > 0.01) {
          ctx.fillStyle = L.fly.core;
          for (const f of flies[0]) {
            if (!f.surf || f.a < 0.02) continue;
            const sy = f.surf / far.px;
            const ry = Math.round(sy + (sy - f.y / far.px) * 0.85);
            if (ry >= lake.bottom) continue;
            const rx = Math.round(f.x / far.px + Math.sin(t * 5 + ry) * 0.7);
            ctx.globalAlpha = Math.min(1, f.a) * 0.5;
            ctx.fillRect(rx, ry, 1, 1);
            ctx.globalAlpha = Math.min(1, f.a) * 0.2;
            ctx.fillRect(rx - 1, ry, 3, 1);
            ctx.fillRect(rx, ry + 1, 1, 1);
          }
        }

        // Keep it to the painted water: trunks and floor in front stay unlit.
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'destination-in';
        ctx.drawImage(lake.mask, 0, 0);
      }
    }
  }

  return { draw };
}
