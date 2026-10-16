'use client';

import { useEffect, useRef } from 'react';
import { useSeason } from './SeasonProvider';
import { SEASON_META, type Season } from '@/lib/seasons';
import { canopyLine } from './seasons/ForestLight';

interface Flake {
  x: number;
  y: number;
  shape: number[][];
  cell: number; // px per bitmap pixel
  speed: number;
  drift: number;
  phase: number;
  swayAmp: number;
  swayRate: number;
  color: string;
  opacity: number;
}

type Range = [number, number];

// Per-season look. Bitmaps: 1 = body, 2 = vein (`vein` colour).
interface Kind {
  shapes: number[][][];
  vein?: string;
  stem?: string;          // one pixel off the bottom-left (leaf stalk)
  count: [number, number]; // mobile, desktop
  cells: [Range, Range];  // mobile, desktop
  speed: Range;
  drift: Range;
  sway: Range;
  opacity: Range;
  canopy: boolean;        // fall out of the canopy (hidden above it) vs. from the sky
  fly?: boolean;          // enter from the left edge across the upper sky instead of falling
  flap?: number;          // cycle through `shapes` every this many frames (wing beats)
}

const SNOW: Kind = {
  shapes: [[[1]], [[1, 1], [1, 1]], [[0, 1, 0], [1, 1, 1], [0, 1, 0]]],
  count: [28, 70], cells: [[2, 3], [2, 3]],
  speed: [0.45, 1.1], drift: [0.05, 0.25], sway: [0.2, 0.6], opacity: [0.55, 0.95], canopy: false,
};

const PETALS: Kind = {
  shapes: [[[0, 1, 1], [1, 1, 0]], [[1, 1], [1, 0]]],
  count: [10, 26], cells: [[2, 3], [3, 4]],
  speed: [0.25, 0.5], drift: [0.25, 0.5], sway: [0.4, 0.9], opacity: [0.65, 0.95], canopy: true,
};

const LEAVES: Kind = {
  shapes: [[[0, 1, 1, 0], [1, 1, 2, 1], [1, 2, 1, 1], [0, 1, 1, 0]]],
  vein: 'rgba(60, 25, 8, 0.55)', stem: '#5A3A1E',
  count: [9, 22], cells: [[3, 4], [4, 5]],
  speed: [0.3, 0.7], drift: [0.12, 0.32], sway: [0.3, 0.8], opacity: [0.6, 0.95], canopy: true,
};

// Paper strips and squares tumbling down from the sky
const CONFETTI: Kind = {
  shapes: [[[1, 1]], [[1], [1]], [[1]]],
  count: [14, 34], cells: [[2, 3], [3, 4]],
  speed: [0.35, 0.8], drift: [-0.15, 0.15], sway: [0.3, 0.9], opacity: [0.7, 1], canopy: false,
};

const KINDS: Record<Season, Kind> = {
  spring: PETALS, // blossom petals on the breeze
  summer: { // pollen and seed fluff hanging in the warm air
    shapes: [[[1]], [[0, 1, 0], [1, 1, 1], [0, 1, 0]]],
    count: [8, 18], cells: [[2, 2], [2, 3]],
    speed: [0.05, 0.16], drift: [0.04, 0.14], sway: [0.3, 0.7], opacity: [0.45, 0.8], canopy: true,
  },
  autumn: LEAVES, // falling leaves
  winter: SNOW, // snow, from the sky down through the trees
  halloween: { // bats flapping across the sky
    shapes: [
      [[1, 0, 0, 0, 0, 0, 1], [1, 1, 0, 1, 0, 1, 1], [1, 1, 1, 1, 1, 1, 1], [0, 0, 1, 2, 1, 0, 0]],
      [[0, 0, 0, 1, 0, 0, 0], [0, 1, 1, 1, 1, 1, 0], [1, 1, 1, 2, 1, 1, 1], [1, 0, 0, 0, 0, 0, 1]],
    ],
    vein: '#FF5A2A', // eyes
    count: [4, 9], cells: [[2, 3], [3, 4]],
    speed: [-0.12, 0.12], drift: [0.7, 1.5], sway: [0.4, 1.1], opacity: [0.85, 1], canopy: false,
    fly: true, flap: 9,
  },
  christmas: SNOW,
  easter: PETALS,
  newyear: CONFETTI,
  valentines: { // hearts drifting out of the canopy
    shapes: [[[1, 1, 0, 1, 1], [1, 2, 1, 1, 1], [0, 1, 1, 1, 0], [0, 0, 1, 0, 0]]],
    vein: 'rgba(255, 255, 255, 0.6)', // highlight
    count: [8, 18], cells: [[2, 3], [2, 3]],
    speed: [0.25, 0.55], drift: [0.05, 0.25], sway: [0.3, 0.8], opacity: [0.6, 0.95], canopy: true,
  },
  stpatricks: { // four-leaf clovers out of the canopy
    shapes: [[[1, 1, 0, 1, 1], [1, 1, 2, 1, 1], [0, 2, 2, 2, 0], [1, 1, 2, 1, 1], [1, 1, 0, 1, 1]]],
    vein: 'rgba(10, 50, 20, 0.45)', stem: '#2A6A22',
    count: [7, 16], cells: [[2, 3], [2, 3]],
    speed: [0.25, 0.55], drift: [0.08, 0.26], sway: [0.3, 0.8], opacity: [0.6, 0.95], canopy: true,
  },
  july4: CONFETTI,
  thanksgiving: LEAVES,
  birch: { // pale pollen drifting between the trunks
    shapes: [[[1]], [[1, 1]]],
    count: [8, 18], cells: [[2, 2], [2, 3]],
    speed: [0.06, 0.18], drift: [0.05, 0.16], sway: [0.3, 0.7], opacity: [0.45, 0.8], canopy: true,
  },
  darkforest: { // spore-blossom motes, barely sinking
    shapes: [[[1]], [[0, 1, 0], [1, 1, 1], [0, 1, 0]]],
    count: [8, 20], cells: [[2, 2], [2, 3]],
    speed: [0.02, 0.1], drift: [-0.06, 0.06], sway: [0.2, 0.5], opacity: [0.4, 0.85], canopy: true,
  },
  jungle: { // green leaves out of the canopy
    shapes: [[[0, 1, 1, 0], [1, 1, 2, 1], [1, 2, 1, 1], [0, 1, 1, 0]]],
    vein: 'rgba(20, 50, 10, 0.5)', stem: '#3A5A1E',
    count: [7, 16], cells: [[3, 4], [4, 5]],
    speed: [0.3, 0.6], drift: [0.05, 0.2], sway: [0.3, 0.8], opacity: [0.6, 0.95], canopy: true,
  },
  desert: { // sand blown in from the left
    shapes: [[[1]], [[1, 1]]],
    count: [10, 26], cells: [[2, 2], [2, 3]],
    speed: [-0.05, 0.12], drift: [1.2, 2.6], sway: [0.1, 0.4], opacity: [0.35, 0.7], canopy: false, fly: true,
  },
};

const within = ([a, b]: Range) => a + Math.random() * (b - a);

// Seasonal particles. Structure mirrors RainCanvas: pooled particles recycled
// off-screen, pixelated rects, mobile cap + reduced-motion read once when the
// season turns on.
export default function SeasonParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { season } = useSeason();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !season) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const kind = KINDS[season];
    const isMobile = window.innerWidth < 768;
    const count = kind.count[isMobile ? 0 : 1];
    const cells = kind.cells[isMobile ? 0 : 1];
    const palette = SEASON_META[season].particles;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Canopy kinds drop out of the canopy when it's on screen, else from above the top edge.
    const spawnY = (anywhere: boolean) => {
      const line = kind.canopy ? canopyLine.y : -Infinity;
      if (anywhere) return Math.max(0, line) + Math.random() * (canvas.height - Math.max(0, line));
      return line > -30 ? line - 10 - Math.random() * 50 : -(Math.random() * 160) - 30;
    };

    // Flyers cross the upper sky from the left edge.
    const make = (anywhere: boolean): Flake => ({
      x: kind.fly && !anywhere ? -40 - Math.random() * 400 : Math.random() * canvas.width,
      y: kind.fly ? Math.random() * canvas.height * 0.55 : spawnY(anywhere),
      shape: kind.shapes[Math.floor(Math.random() * kind.shapes.length)],
      cell: Math.round(within(cells)),
      speed: within(kind.speed),
      drift: within(kind.drift),
      phase: Math.random() * Math.PI * 2,
      swayAmp: within(kind.sway),
      swayRate: 0.012 + Math.random() * 0.01,
      color: palette[Math.floor(Math.random() * palette.length)],
      opacity: within(kind.opacity),
    });

    const flakes: Flake[] = Array.from({ length: count }, () => make(true));
    let frame = 0;
    let raf = 0;

    const animate = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < flakes.length; i++) {
        const f = flakes[i];
        f.y += f.speed;
        f.x += f.drift + Math.sin(frame * f.swayRate + f.phase) * f.swayAmp;
        const size = f.shape.length * f.cell;
        if (f.y > canvas.height + size || f.x > canvas.width + size) {
          flakes[i] = make(false);
          continue;
        }
        // Canopy kinds are hidden above the canopy line and fade in as they fall out of it.
        const emerge = kind.canopy ? Math.min(1, (f.y - canopyLine.y) / 80) : 1;
        if (emerge <= 0) continue;
        const ox = Math.floor(f.x);
        const oy = Math.floor(f.y);
        ctx.globalAlpha = f.opacity * emerge;
        const shape = kind.flap ? kind.shapes[Math.floor((frame + f.phase * 10) / kind.flap) % kind.shapes.length] : f.shape;
        shape.forEach((row, r) => {
          row.forEach((v, c) => {
            if (!v) return;
            ctx.fillStyle = v === 2 && kind.vein ? kind.vein : f.color;
            ctx.fillRect(ox + c * f.cell, oy + r * f.cell, f.cell, f.cell);
          });
        });
        if (kind.stem) {
          ctx.fillStyle = kind.stem;
          ctx.fillRect(ox - f.cell, oy + (f.shape.length - 1) * f.cell, f.cell, f.cell);
        }
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [season]);

  if (!season) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 6, imageRendering: 'pixelated' }}
      aria-hidden="true"
    />
  );
}
