'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from './ThemeProvider';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  life: number;
  maxLife: number;
  type: 'xp' | 'enchant' | 'firefly';
}

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);
  const { theme } = useTheme();
  const themeRef = useRef(theme);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 10 : 25;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    particlesRef.current = [];

    function spawnParticle(): Particle {
      const isDark = themeRef.current === 'dark';
      const rand = Math.random();
      const type = rand < 0.4 ? 'xp' : rand < 0.75 ? 'firefly' : 'enchant';
      const darkColors: Record<string, string> = {
        xp: '#7EFC20',
        enchant: '#A78BFA',
        firefly: '#FFAA00',
      };
      const lightColors: Record<string, string> = {
        xp: '#5B8731',
        enchant: '#7E6BBF',
        firefly: '#CC8800',
      };
      const colors = isDark ? darkColors : lightColors;
      return {
        x: Math.random() * canvas!.width,
        y: Math.random() * canvas!.height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: type === 'xp' ? -Math.random() * 0.4 - 0.1 : (Math.random() - 0.5) * 0.15,
        size: type === 'enchant' ? 1.5 : Math.random() * 2 + 0.5,
        alpha: 0,
        color: colors[type],
        life: 0,
        maxLife: 300 + Math.random() * 400,
        type,
      };
    }

    for (let i = 0; i < particleCount; i++) {
      const p = spawnParticle();
      p.life = Math.random() * p.maxLife;
      particlesRef.current.push(p);
    }

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const isDark = themeRef.current === 'dark';
      const particles = particlesRef.current;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;

        const progress = p.life / p.maxLife;
        if (progress < 0.15) {
          p.alpha = progress / 0.15;
        } else if (progress > 0.75) {
          p.alpha = (1 - progress) / 0.25;
        } else {
          p.alpha = 1;
        }

        if (p.type === 'firefly') {
          p.alpha *= 0.4 + 0.6 * Math.sin(p.life * 0.03);
        }

        const baseAlpha = isDark ? 0.35 : 0.2;
        ctx.globalAlpha = p.alpha * baseAlpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = isDark ? p.size * 3 : p.size * 1.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        if (p.life >= p.maxLife) {
          particles[i] = spawnParticle();
        }
      }

      ctx.globalAlpha = 1;
      animFrameRef.current = requestAnimationFrame(animate);
    }

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10"
    />
  );
}
