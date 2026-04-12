'use client';

import { useEffect, useState } from 'react';
import { useTheme } from './ThemeProvider';
import { useWeather } from './WeatherProvider';
import ShootingStars from './ShootingStars';

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

/* Pixel-art sun SVG */
function PixelSun() {
  return (
    <svg width="120" height="120" viewBox="0 0 24 24" shapeRendering="crispEdges">
      {/* Rays — top/bottom/left/right */}
      <rect x="11" y="0"  width="2" height="2" fill="#FFE566" />
      <rect x="11" y="22" width="2" height="2" fill="#FFE566" />
      <rect x="0"  y="11" width="2" height="2" fill="#FFE566" />
      <rect x="22" y="11" width="2" height="2" fill="#FFE566" />
      {/* Rays — diagonals */}
      <rect x="3"  y="3"  width="2" height="2" fill="#FFE566" />
      <rect x="19" y="3"  width="2" height="2" fill="#FFE566" />
      <rect x="3"  y="19" width="2" height="2" fill="#FFE566" />
      <rect x="19" y="19" width="2" height="2" fill="#FFE566" />
      {/* Rays — inner extensions */}
      <rect x="11" y="2"  width="2" height="2" fill="#FFAA00" />
      <rect x="11" y="20" width="2" height="2" fill="#FFAA00" />
      <rect x="2"  y="11" width="2" height="2" fill="#FFAA00" />
      <rect x="20" y="11" width="2" height="2" fill="#FFAA00" />
      <rect x="5"  y="5"  width="2" height="2" fill="#FFAA00" />
      <rect x="17" y="5"  width="2" height="2" fill="#FFAA00" />
      <rect x="5"  y="17" width="2" height="2" fill="#FFAA00" />
      <rect x="17" y="17" width="2" height="2" fill="#FFAA00" />
      {/* Core */}
      <rect x="8"  y="7"  width="8" height="1" fill="#FFDD44" />
      <rect x="7"  y="8"  width="10" height="1" fill="#FFDD44" />
      <rect x="7"  y="9"  width="10" height="1" fill="#FFFDE0" />
      <rect x="7"  y="10" width="10" height="1" fill="#FFFDE0" />
      <rect x="7"  y="11" width="10" height="1" fill="#FFFDE0" />
      <rect x="7"  y="12" width="10" height="1" fill="#FFFDE0" />
      <rect x="7"  y="13" width="10" height="1" fill="#FFDD44" />
      <rect x="7"  y="14" width="10" height="1" fill="#FFDD44" />
      <rect x="8"  y="15" width="8" height="1" fill="#FFDD44" />
      <rect x="8"  y="16" width="8" height="1" fill="#FFAA00" />
      {/* Face — eyes */}
      <rect x="9"  y="10" width="2" height="2" fill="#FF8800" />
      <rect x="13" y="10" width="2" height="2" fill="#FF8800" />
      {/* Face — smile */}
      <rect x="9"  y="13" width="1" height="1" fill="#FF8800" />
      <rect x="10" y="14" width="4" height="1" fill="#FF8800" />
      <rect x="14" y="13" width="1" height="1" fill="#FF8800" />
    </svg>
  );
}

/* Pixel-art moon SVG */
function PixelMoon() {
  return (
    <svg width="100" height="100" viewBox="0 0 20 20" shapeRendering="crispEdges">
      {/* Rays — cardinal */}
      <rect x="9"  y="0"  width="2" height="2" fill="#8899AA" />
      <rect x="9"  y="18" width="2" height="2" fill="#8899AA" />
      <rect x="0"  y="9"  width="2" height="2" fill="#8899AA" />
      <rect x="18" y="9"  width="2" height="2" fill="#8899AA" />
      {/* Rays — diagonal */}
      <rect x="2"  y="2"  width="2" height="2" fill="#8899AA" />
      <rect x="16" y="2"  width="2" height="2" fill="#8899AA" />
      <rect x="2"  y="16" width="2" height="2" fill="#8899AA" />
      <rect x="16" y="16" width="2" height="2" fill="#8899AA" />
      {/* Rays — inner extensions */}
      <rect x="9"  y="2"  width="2" height="2" fill="#AABBCC" />
      <rect x="9"  y="16" width="2" height="2" fill="#AABBCC" />
      <rect x="2"  y="9"  width="2" height="2" fill="#AABBCC" />
      <rect x="16" y="9"  width="2" height="2" fill="#AABBCC" />
      <rect x="4"  y="4"  width="2" height="2" fill="#AABBCC" />
      <rect x="14" y="4"  width="2" height="2" fill="#AABBCC" />
      <rect x="4"  y="14" width="2" height="2" fill="#AABBCC" />
      <rect x="14" y="14" width="2" height="2" fill="#AABBCC" />
      {/* Core — moon body */}
      <rect x="7"  y="6"  width="6" height="1" fill="#D8DDE3" />
      <rect x="6"  y="7"  width="8" height="1" fill="#E8ECF0" />
      <rect x="6"  y="8"  width="8" height="1" fill="#F0F3F6" />
      <rect x="6"  y="9"  width="8" height="1" fill="#F0F3F6" />
      <rect x="6"  y="10" width="8" height="1" fill="#E8ECF0" />
      <rect x="6"  y="11" width="8" height="1" fill="#E8ECF0" />
      <rect x="6"  y="12" width="8" height="1" fill="#D8DDE3" />
      <rect x="7"  y="13" width="6" height="1" fill="#C8CDD3" />
      {/* Craters */}
      <rect x="8"  y="8"  width="2" height="1" fill="#B8BDC3" />
      <rect x="12" y="10" width="1" height="1" fill="#B8BDC3" />
      <rect x="7"  y="11" width="1" height="1" fill="#B8BDC3" />
      <rect x="10" y="12" width="2" height="1" fill="#B8BDC3" />
    </svg>
  );
}

export default function ParallaxBackground() {
  const [scrollY, setScrollY] = useState(0);
  const { theme } = useTheme();
  const { weather } = useWeather();
  const isRaining = weather === 'rain' || weather === 'thunderstorm';
  const isLight = theme === 'light';

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const celestialTransform = `translateY(${scrollY * 0.01}px)`;
  const sunOpacity = isLight && !isRaining ? 1 : 0;
  const moonOpacity = !isLight && !isRaining ? 1 : 0;

  return (
    <div className={`fixed inset-0 z-0 overflow-hidden weather-${weather}`}>
      {/* Day sky gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #3B8BE0 0%, #4A98E8 15%, #6BB5F5 35%, #8DC8FA 55%, #A8D8FF 75%, #4A7A28 93%, #3B6820 95%, #4A3018 97%, #3A2410 100%)',
          opacity: isLight ? 1 : 0,
          transition: 'opacity 1.5s ease-in-out',
        }}
      />

      {/* Night sky gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #0f0f23 0%, #1a1a2e 30%, #1a1a2e 100%)',
          opacity: isLight ? 0 : 1,
          transition: 'opacity 1.5s ease-in-out',
        }}
      />

      {/* Stars — fade with theme */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translateY(${scrollY * 0.02}px)`,
          opacity: isLight ? 0 : 1,
          transition: 'opacity 1.5s ease-in-out',
        }}
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

      {/* Shooting stars — dark mode only */}
      <ShootingStars />

      {/* Sun — fades in for light mode */}
      <div
        className="absolute"
        style={{
          top: '5%',
          right: '12%',
          transform: celestialTransform,
          opacity: sunOpacity,
          transition: 'opacity 1.5s ease-in-out',
        }}
      >
        <PixelSun />
      </div>

      {/* Moon — fades in for dark mode */}
      <div
        className="absolute"
        style={{
          top: '6%',
          right: '14%',
          transform: celestialTransform,
          opacity: moonOpacity,
          transition: 'opacity 1.5s ease-in-out',
        }}
      >
        <PixelMoon />
      </div>

      {/* Clouds — light mode only */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        style={{
          transform: `translateX(${scrollY * -0.015}px) translateY(${scrollY * 0.01}px)`,
          opacity: isLight ? 1 : 0,
          transition: 'opacity 1.5s ease-in-out',
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

      {/* Day terrain */}
      <div
        className="absolute w-full bottom-0"
        style={{
          transform: `translateY(${scrollY * 0.1}px)`,
          opacity: isLight ? 1 : 0,
          transition: 'opacity 1.5s ease-in-out',
        }}
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

      {/* Night terrain */}
      <div
        className="absolute w-full bottom-0"
        style={{
          transform: `translateY(${scrollY * 0.08}px)`,
          opacity: isLight ? 0 : 1,
          transition: 'opacity 1.5s ease-in-out',
        }}
      >
        <svg viewBox="0 0 1440 120" className="w-full" preserveAspectRatio="none" style={{ height: '120px' }}>
          <path
            d="M0,120 L0,80 L60,80 L60,70 L120,70 L120,60 L200,60 L200,50 L280,50 L280,60 L360,60 L360,70 L440,70 L440,50 L520,50 L520,40 L600,40 L600,50 L680,50 L680,70 L760,70 L760,55 L840,55 L840,45 L920,45 L920,55 L1000,55 L1000,70 L1080,70 L1080,60 L1160,60 L1160,70 L1240,70 L1240,55 L1320,55 L1320,70 L1440,70 L1440,120 Z"
            fill="#141428"
          />
        </svg>
      </div>

      {/* Day readability overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: isLight
            ? 'linear-gradient(180deg, rgba(232,244,236,0) 0%, rgba(232,244,236,0.15) 50%, rgba(232,244,236,0.7) 80%, rgba(232,244,236,0.95) 92%)'
            : 'radial-gradient(ellipse at 50% 0%, rgba(78,167,255,0.03) 0%, transparent 60%)',
          transition: 'background 1.5s ease-in-out',
        }}
      />
    </div>
  );
}
