'use client';

import { useEffect, useRef } from 'react';
import { useSeason } from './SeasonProvider';
import { SEASON_META } from '@/lib/seasons';
import { canopyLine } from './seasons/ForestLight';

interface Leaf {
  x: number;
  y: number;
  cell: number; // px per leaf-pixel (4–5 → 16–20px leaves; 3–4 on mobile)
  speed: number;
  drift: number;
  phase: number;
  swayAmp: number;
  swayRate: number;
  color: string;
  opacity: number;
}

// 4×4 leaf bitmap: 1 = body, 2 = vein (darker). Drawn at `cell` px per pixel.
const LEAF: number[][] = [
  [0, 1, 1, 0],
  [1, 1, 2, 1],
  [1, 2, 1, 1],
  [0, 1, 1, 0],
];

// Falling autumn leaves. Structure mirrors RainCanvas: pooled particles
// recycled off-screen, pixelated rects, mobile cap + reduced-motion read once
// when the season turns on.
export default function SeasonParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { season } = useSeason();
  const active = season === 'autumn';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !active) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 9 : 22;
    const cells = isMobile ? [3, 4] : [4, 5];
    const palette = SEASON_META.autumn.particles;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // New leaves drop out of the canopy when it's on screen, else from above the top edge.
    const spawnY = (anywhere: boolean) => {
      const line = canopyLine.y;
      if (anywhere) return Math.max(0, line) + Math.random() * (canvas.height - Math.max(0, line));
      return line > -30 ? line - 10 - Math.random() * 50 : -(Math.random() * 160) - 30;
    };

    const make = (anywhere: boolean): Leaf => ({
      x: Math.random() * canvas.width,
      y: spawnY(anywhere),
      cell: cells[Math.random() < 0.5 ? 0 : 1],
      speed: 0.3 + Math.random() * 0.4,
      drift: 0.12 + Math.random() * 0.2,
      phase: Math.random() * Math.PI * 2,
      swayAmp: 0.3 + Math.random() * 0.5,
      swayRate: 0.012 + Math.random() * 0.01,
      color: palette[Math.floor(Math.random() * palette.length)],
      opacity: 0.6 + Math.random() * 0.35,
    });

    const leaves: Leaf[] = Array.from({ length: count }, () => make(true));
    let frame = 0;
    let raf = 0;

    const animate = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < leaves.length; i++) {
        const l = leaves[i];
        l.y += l.speed;
        l.x += l.drift + Math.sin(frame * l.swayRate + l.phase) * l.swayAmp;
        const size = 4 * l.cell;
        if (l.y > canvas.height + size || l.x > canvas.width + size) {
          leaves[i] = make(false);
          continue;
        }
        // Hidden above the canopy line, fading in as they fall out of it.
        const emerge = Math.min(1, (l.y - canopyLine.y) / 80);
        if (emerge <= 0) continue;
        const ox = Math.floor(l.x);
        const oy = Math.floor(l.y);
        ctx.globalAlpha = l.opacity * emerge;
        for (let r = 0; r < 4; r++) {
          for (let c = 0; c < 4; c++) {
            const v = LEAF[r][c];
            if (!v) continue;
            ctx.fillStyle = v === 2 ? 'rgba(60, 25, 8, 0.55)' : l.color;
            ctx.fillRect(ox + c * l.cell, oy + r * l.cell, l.cell, l.cell);
          }
        }
        // stem
        ctx.fillStyle = '#5A3A1E';
        ctx.fillRect(ox - l.cell, oy + 3 * l.cell, l.cell, l.cell);
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
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 6, imageRendering: 'pixelated' }}
      aria-hidden="true"
    />
  );
}
