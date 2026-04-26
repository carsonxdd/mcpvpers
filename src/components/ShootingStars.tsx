'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTheme } from './ThemeProvider';
import { useWeather } from './WeatherProvider';

interface Star {
  id: number;
  x: number;
  y: number;
  duration: number;
  angle: number;
}

let nextId = 0;

export default function ShootingStars() {
  const { theme } = useTheme();
  const { weather } = useWeather();
  const [stars, setStars] = useState<Star[]>([]);

  const spawnStar = useCallback(() => {
    const angle = 25 + Math.random() * 20; // 25-45 degrees downward
    const star: Star = {
      id: nextId++,
      x: 5 + Math.random() * 60,
      y: 2 + Math.random() * 25,
      duration: 0.6 + Math.random() * 0.5,
      angle,
    };
    setStars(prev => [...prev, star]);
    setTimeout(() => {
      setStars(prev => prev.filter(s => s.id !== star.id));
    }, star.duration * 1000 + 100);
  }, []);

  useEffect(() => {
    if (theme !== 'dark' || weather !== 'clear') return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const intervalMs = isMobile ? 16000 + Math.random() * 20000 : 8000 + Math.random() * 12000;
    const spawnChance = isMobile ? 0.3 : 0.6;

    const initial = setTimeout(spawnStar, 2000 + Math.random() * 3000);

    const interval = setInterval(() => {
      if (Math.random() < spawnChance) spawnStar();
    }, intervalMs);

    return () => {
      clearTimeout(initial);
      clearInterval(interval);
    };
  }, [theme, weather, spawnStar]);

  if (theme !== 'dark') return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
      {stars.map(star => (
        <div
          key={star.id}
          className="absolute"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            transform: `rotate(${star.angle}deg)`,
            transformOrigin: '0 50%',
          }}
        >
          <div
            style={{
              animation: `shooting-star-move ${star.duration}s linear forwards`,
            }}
          >
            <svg
              width="48"
              height="6"
              viewBox="0 0 48 6"
              shapeRendering="crispEdges"
            >
              {/* Tail — straight horizontal, fading from left to right */}
              <rect x="0"  y="2" width="3" height="2" fill="#FFFFFF" opacity="0.1" />
              <rect x="4"  y="2" width="3" height="2" fill="#FFFFFF" opacity="0.2" />
              <rect x="8"  y="2" width="3" height="2" fill="#FFFFFF" opacity="0.3" />
              <rect x="12" y="2" width="3" height="2" fill="#FFFFFF" opacity="0.45" />
              <rect x="16" y="2" width="3" height="2" fill="#FFFFFF" opacity="0.6" />
              <rect x="20" y="2" width="4" height="2" fill="#FFFFFF" opacity="0.75" />
              <rect x="25" y="2" width="4" height="2" fill="#FFFDE0" opacity="0.85" />
              <rect x="30" y="1" width="4" height="3" fill="#FFFDE0" opacity="0.9" />
              <rect x="35" y="1" width="4" height="3" fill="#FFFEF5" opacity="0.95" />
              {/* Head — bright white pixel */}
              <rect x="40" y="0" width="4" height="4" fill="#FFFFFF" opacity="1" />
              <rect x="44" y="1" width="4" height="4" fill="#FFFFFF" opacity="0.8" />
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
}
