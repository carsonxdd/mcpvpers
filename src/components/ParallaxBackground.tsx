'use client';

import { useEffect, useState } from 'react';
import { useTheme } from './ThemeProvider';
import { useWeather } from './WeatherProvider';

/* Minecraft-style connected cloud — flat rectangular block shapes */
function Cloud({ x, y, width, dark }: { x: number; y: number; width: number; dark?: boolean }) {
  const h = 12;
  const bumpW = Math.floor(width * 0.3);
  const bump2W = Math.floor(width * 0.25);
  const fill = dark ? '#3B3F47' : 'white';
  const opacity = dark ? 0.95 : 0.9;
  const bottomOpacity = dark ? 0.8 : 0.55;
  const t = 'fill 1.5s ease-in-out, fill-opacity 1.5s ease-in-out';
  return (
    <g>
      <rect x={x} y={y} width={width} height={h} style={{ fill, fillOpacity: opacity, transition: t }} />
      <rect x={x + Math.floor(width * 0.1)} y={y - h} width={bumpW} height={h} style={{ fill, fillOpacity: opacity, transition: t }} />
      <rect x={x + Math.floor(width * 0.5)} y={y - h} width={bump2W} height={h} style={{ fill, fillOpacity: opacity, transition: t }} />
      <rect x={x} y={y + h} width={width} height={4} style={{ fill, fillOpacity: bottomOpacity, transition: t }} />
    </g>
  );
}

export default function ParallaxBackground() {
  const [scrollY, setScrollY] = useState(0);
  const { theme } = useTheme();
  const { weather } = useWeather();
  const isRaining = weather === 'rain' || weather === 'thunderstorm';

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (theme === 'light') {
    return (
      <div className={`fixed inset-0 z-0 overflow-hidden transition-all duration-500 weather-${weather}`}>
        {/* Sky gradient — blue dominates, tiny grass strip, thin dirt at very bottom */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, #3B8BE0 0%, #4A98E8 15%, #6BB5F5 35%, #8DC8FA 55%, #A8D8FF 75%, #4A7A28 93%, #3B6820 95%, #4A3018 97%, #3A2410 100%)',
          }}
        />

        {/* Sun */}
        <div
          className="absolute"
          style={{
            top: '8%',
            right: '15%',
            width: '60px',
            height: '60px',
            background: 'radial-gradient(circle, #FFFDE0 0%, #FFE566 40%, #FFAA00 70%, transparent 100%)',
            borderRadius: '50%',
            boxShadow: '0 0 60px rgba(255, 230, 100, 0.4), 0 0 120px rgba(255, 200, 50, 0.15)',
            transform: `translateY(${scrollY * 0.01}px)`,
            opacity: isRaining ? 0 : 1,
            transition: 'opacity 1.5s ease-in-out',
          }}
        />

        {/* Clouds — 4 rows spread across the sky */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          style={{
            transform: `translateX(${scrollY * -0.015}px) translateY(${scrollY * 0.01}px)`,
          }}
        >
          {/* Row 1 — high up */}
          <Cloud x={40}   y={120} width={200} dark={isRaining} />
          <Cloud x={350}  y={100} width={240} dark={isRaining} />
          <Cloud x={700}  y={130} width={180} dark={isRaining} />
          <Cloud x={1000} y={110} width={210} dark={isRaining} />
          <Cloud x={1280} y={125} width={160} dark={isRaining} />

          {/* Row 2 */}
          <Cloud x={150}  y={240} width={170} dark={isRaining} />
          <Cloud x={450}  y={220} width={200} dark={isRaining} />
          <Cloud x={780}  y={250} width={160} dark={isRaining} />
          <Cloud x={1100} y={230} width={190} dark={isRaining} />

          {/* Row 3 */}
          <Cloud x={60}   y={370} width={190} dark={isRaining} />
          <Cloud x={320}  y={350} width={220} dark={isRaining} />
          <Cloud x={600}  y={380} width={150} dark={isRaining} />
          <Cloud x={860}  y={360} width={180} dark={isRaining} />
          <Cloud x={1150} y={375} width={170} dark={isRaining} />

          {/* Row 4 — lower in the sky */}
          <Cloud x={200}  y={480} width={160} dark={isRaining} />
          <Cloud x={500}  y={470} width={190} dark={isRaining} />
          <Cloud x={800}  y={490} width={140} dark={isRaining} />
          <Cloud x={1050} y={475} width={180} dark={isRaining} />
          <Cloud x={1320} y={485} width={150} dark={isRaining} />
        </svg>

        {/* Terrain — small strip at very bottom */}
        <div
          className="absolute w-full bottom-0"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        >
          <svg viewBox="0 0 1440 100" className="w-full" preserveAspectRatio="none" style={{ height: '100px' }}>
            <path
              d="M0,100 L0,70 L30,70 L30,55 L40,55 L40,45 L50,45 L50,40 L60,40 L60,45 L70,45 L70,55 L80,55 L80,70
                 L140,70 L140,60 L150,60 L150,50 L160,50 L160,42 L170,42 L170,50 L180,50 L180,60 L190,60 L190,70
                 L280,70 L280,55 L290,55 L290,45 L300,45 L300,38 L310,38 L310,45 L320,45 L320,55 L330,55 L330,70
                 L450,70 L450,62 L460,62 L460,50 L470,50 L470,42 L480,42 L480,50 L490,50 L490,62 L500,62 L500,70
                 L580,70 L580,55 L590,55 L590,45 L600,45 L600,38 L610,38 L610,45 L620,45 L620,55 L630,55 L630,70
                 L720,70 L720,60 L730,60 L730,48 L740,48 L740,40 L750,40 L750,48 L760,48 L760,60 L770,60 L770,70
                 L880,70 L880,58 L890,58 L890,48 L900,48 L900,42 L910,42 L910,48 L920,48 L920,58 L930,58 L930,70
                 L1020,70 L1020,62 L1030,62 L1030,50 L1040,50 L1040,42 L1050,42 L1050,50 L1060,50 L1060,62 L1070,62 L1070,70
                 L1180,70 L1180,55 L1190,55 L1190,45 L1200,45 L1200,40 L1210,40 L1210,45 L1220,45 L1220,55 L1230,55 L1230,70
                 L1320,70 L1320,60 L1330,60 L1330,48 L1340,48 L1340,42 L1350,42 L1350,48 L1360,48 L1360,60 L1370,60 L1370,70
                 L1440,70 L1440,100 Z"
              fill="#3A6E1E"
            />
            <rect x="0" y="70" width="1440" height="5" fill="#4A7A28" />
            <rect x="0" y="75" width="1440" height="25" fill="#3E2A14" />
          </svg>
        </div>

        {/* Readability overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(232,244,236,0) 0%, rgba(232,244,236,0.15) 50%, rgba(232,244,236,0.7) 80%, rgba(232,244,236,0.95) 92%)',
          }}
        />
      </div>
    );
  }

  // Dark mode — night sky
  return (
    <div className={`fixed inset-0 z-0 overflow-hidden transition-all duration-500 weather-${weather}`}>
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #0f0f23 0%, #1a1a2e 30%, #1a1a2e 100%)',
        }}
      />

      <div
        className="absolute inset-0"
        style={{ transform: `translateY(${scrollY * 0.02}px)` }}
      >
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: `${1 + (i % 3)}px`,
              height: `${1 + (i % 3)}px`,
              left: `${(i * 17.3) % 100}%`,
              top: `${(i * 13.7) % 50}%`,
              opacity: 0.15 + (i % 5) * 0.08,
            }}
          />
        ))}
      </div>

      <div
        className="absolute w-full bottom-0"
        style={{ transform: `translateY(${scrollY * 0.08}px)` }}
      >
        <svg viewBox="0 0 1440 120" className="w-full" preserveAspectRatio="none" style={{ height: '120px' }}>
          <path
            d="M0,120 L0,80 L60,80 L60,70 L120,70 L120,60 L200,60 L200,50 L280,50 L280,60 L360,60 L360,70 L440,70 L440,50 L520,50 L520,40 L600,40 L600,50 L680,50 L680,70 L760,70 L760,55 L840,55 L840,45 L920,45 L920,55 L1000,55 L1000,70 L1080,70 L1080,60 L1160,60 L1160,70 L1240,70 L1240,55 L1320,55 L1320,70 L1440,70 L1440,120 Z"
            fill="#141428"
          />
        </svg>
      </div>

      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(78,167,255,0.03) 0%, transparent 60%)',
        }}
      />
    </div>
  );
}
