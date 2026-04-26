'use client';

import { useEffect, useRef } from 'react';
import { useWeather } from './WeatherProvider';
import { useTheme } from './ThemeProvider';

interface RainDrop {
  x: number;
  y: number;
  speed: number;
  vx: number;
  length: number;
  opacity: number;
}

export default function RainCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dropsRef = useRef<RainDrop[]>([]);
  const animFrameRef = useRef<number>(0);
  const { weather } = useWeather();
  const { theme } = useTheme();
  const weatherRef = useRef(weather);
  const themeRef = useRef(theme);
  const targetCountRef = useRef(0);
  const spawnBatchRef = useRef(0);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    weatherRef.current = weather;
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      targetCountRef.current = 0;
      spawnBatchRef.current = 0;
      return;
    }
    if (weather === 'rain') {
      targetCountRef.current = isMobile ? 180 : 450;
      spawnBatchRef.current = isMobile ? 12 : 30;
    } else if (weather === 'thunderstorm') {
      targetCountRef.current = isMobile ? 280 : 800;
      spawnBatchRef.current = isMobile ? 20 : 50;
    } else {
      targetCountRef.current = 0;
      spawnBatchRef.current = 0;
    }
  }, [weather]);

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
