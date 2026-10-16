'use client';

import { useEffect, useRef } from 'react';
import { useWeather } from './WeatherProvider';
import { useTheme } from './ThemeProvider';
import { useSeason } from './SeasonProvider';
import type { Season } from '@/lib/seasons';

// Seasons where "rain" falls as snow (a thunderstorm becomes a blizzard).
const SNOWY: Season[] = ['winter', 'christmas'];

interface RainDrop {
  x: number;
  y: number;
  speed: number;
  vx: number;
  length: number;
  opacity: number;
  snow: boolean;
  size: number;   // snowflake side (px)
  phase: number;  // snowflake sway
}

export default function RainCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dropsRef = useRef<RainDrop[]>([]);
  const animFrameRef = useRef<number>(0);
  const { weather } = useWeather();
  const { theme } = useTheme();
  const { season } = useSeason();
  const snowy = season !== null && SNOWY.includes(season);
  const snowRef = useRef(snowy);
  const weatherRef = useRef(weather);
  const themeRef = useRef(theme);
  const targetCountRef = useRef(0);
  const spawnBatchRef = useRef(0);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    snowRef.current = snowy;
  }, [snowy]);

  useEffect(() => {
    weatherRef.current = weather;
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      targetCountRef.current = 0;
      spawnBatchRef.current = 0;
      return;
    }
    // Snow falls slower, so fewer flakes fill the screen as densely.
    if (weather === 'rain') {
      targetCountRef.current = snowy ? (isMobile ? 110 : 280) : isMobile ? 180 : 450;
      spawnBatchRef.current = isMobile ? 12 : 30;
    } else if (weather === 'thunderstorm') {
      targetCountRef.current = snowy ? (isMobile ? 200 : 560) : isMobile ? 280 : 800;
      spawnBatchRef.current = isMobile ? 20 : 50;
    } else {
      targetCountRef.current = 0;
      spawnBatchRef.current = 0;
    }
  }, [weather, snowy]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    dropsRef.current = [];

    function createDrop(startAtTop = true): RainDrop {
      const isStorm = weatherRef.current === 'thunderstorm';
      if (snowRef.current) {
        // Pixel flakes: drift and sway; a storm is a sideways blizzard.
        const size = Math.random() < 0.25 ? 4 : Math.random() < 0.6 ? 3 : 2;
        return {
          x: Math.random() * (canvas!.width + 300) - 300,
          y: startAtTop ? -(Math.random() * 200) : Math.random() * canvas!.height,
          speed: (isStorm ? 2.2 + Math.random() * 2 : 0.8 + Math.random() * 1.2) * (size / 3 + 0.4),
          vx: isStorm ? 2.5 + Math.random() * 2.5 : 0.2 + Math.random() * 0.6,
          length: size,
          opacity: 0.55 + Math.random() * 0.4,
          snow: true, size, phase: Math.random() * Math.PI * 2,
        };
      }
      return {
        x: Math.random() * (canvas!.width + 200) - 100,
        y: startAtTop ? -(Math.random() * 200) : Math.random() * canvas!.height,
        speed: isStorm
          ? 8 + Math.random() * 6   // 8-14
          : 4 + Math.random() * 4,  // 4-8
        vx: isStorm
          ? 2 + Math.random() * 2   // 2-4
          : 1 + Math.random() * 1,  // 1-2
        length: 6 + Math.random() * 2, // 6-8px tall
        opacity: 0.3 + Math.random() * 0.4, // 0.3-0.7
        snow: false, size: 2, phase: 0,
      };
    }

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const drops = dropsRef.current;
      const target = targetCountRef.current;
      const isDark = themeRef.current === 'dark';

      // Spawn new drops gradually
      if (drops.length < target) {
        const batch = Math.min(spawnBatchRef.current, target - drops.length);
        for (let i = 0; i < batch; i++) {
          drops.push(createDrop(true));
        }
      }

      // Update and draw
      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i];

        // Update speed/wind if weather changed (storm upgrade/downgrade)
        const isStorm = weatherRef.current === 'thunderstorm';
        if (d.snow) {
          d.phase += 0.03;
          d.y += d.speed;
          d.x += d.vx + Math.sin(d.phase) * 0.5;
          if (d.y > canvas.height + 10 || d.x > canvas.width + 50) {
            if (target === 0) drops.splice(i, 1);
            else drops[i] = createDrop(true);
            continue;
          }
          ctx.fillStyle = isDark ? `rgba(225, 235, 250, ${d.opacity})` : `rgba(255, 255, 255, ${d.opacity})`;
          ctx.fillRect(Math.floor(d.x), Math.floor(d.y), d.size, d.size);
          continue;
        }
        if (isStorm && d.speed < 8) {
          d.speed = 8 + Math.random() * 6;
          d.vx = 2 + Math.random() * 2;
        }

        d.y += d.speed;
        d.x += d.vx;

        // Remove off-screen drops
        if (d.y > canvas.height + 10 || d.x > canvas.width + 50) {
          if (target === 0) {
            // Draining — remove, don't replace
            drops.splice(i, 1);
            continue;
          }
          // Recycle
          drops[i] = createDrop(true);
          continue;
        }

        // Draw pixelated rectangle
        if (isDark) {
          ctx.fillStyle = `rgba(150, 170, 220, ${d.opacity})`;
        } else {
          ctx.fillStyle = `rgba(180, 200, 255, ${d.opacity})`;
        }
        ctx.fillRect(Math.floor(d.x), Math.floor(d.y), 2, d.length);
      }

      animFrameRef.current = requestAnimationFrame(animate);
    }

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 5, imageRendering: 'pixelated' }}
    />
  );
}
