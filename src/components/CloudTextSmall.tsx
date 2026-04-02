'use client';

import { useTheme } from './ThemeProvider';
import { useWeather } from './WeatherProvider';

interface CloudTextSmallProps {
  children: React.ReactNode;
  className?: string;
}

/*
  Lighter cloud layer for short 1-2 line text blocks.
  Only 2-3 clouds instead of 5, less overlap, less dense.
  Same blocky style with bumpy top/bottom edges.
*/
function CloudLayerSmall({ isDark, isRaining }: { isDark: boolean; isRaining: boolean }) {
  const fill = isDark ? '#3a3a5c' : '#ffffff';
  const op = isDark ? 0.7 : 0.95;
  const opEdge = isDark ? 0.5 : 0.75;
  const opFaint = isDark ? 0.35 : 0.55;
  const b = 10;

  function drawCloud(ox: number, oy: number, w: number, id: string) {
    const inset = Math.floor(w * 0.08);

    const topBumps = [
      { x: ox + Math.floor(w * 0.1), w: Math.floor(w * 0.25) },
      { x: ox + Math.floor(w * 0.55), w: Math.floor(w * 0.2) },
    ];

    const botBumps = [
      { x: ox + Math.floor(w * 0.12), w: Math.floor(w * 0.22), rows: 2 },
      { x: ox + Math.floor(w * 0.5), w: Math.floor(w * 0.18), rows: 1 },
      { x: ox + Math.floor(w * 0.75), w: Math.floor(w * 0.14), rows: 2 },
    ];

    return (
      <g key={id}>
        {topBumps.map((bump, i) => (
          <rect key={`${id}-t${i}`} x={bump.x} y={oy} width={bump.w} height={b} fill={fill} fillOpacity={opEdge} />
        ))}
        <rect x={ox + inset} y={oy + b} width={w - inset * 2} height={b} fill={fill} fillOpacity={op} />
        <rect x={ox} y={oy + b * 2} width={w} height={b} fill={fill} fillOpacity={op} />
        <rect x={ox} y={oy + b * 3} width={w} height={b} fill={fill} fillOpacity={op} />
        <rect x={ox + inset} y={oy + b * 4} width={w - inset * 2} height={b} fill={fill} fillOpacity={opEdge} />
        {botBumps.map((bump, i) => (
          <g key={`${id}-b${i}`}>
            <rect x={bump.x} y={oy + b * 5} width={bump.w} height={b} fill={fill} fillOpacity={opFaint} />
            {bump.rows >= 2 && (
              <rect x={bump.x + Math.floor(bump.w * 0.2)} y={oy + b * 6} width={Math.floor(bump.w * 0.6)} height={b * 0.7} fill={fill} fillOpacity={opFaint} />
            )}
          </g>
        ))}
      </g>
    );
  }

  return (
    <svg
      className="absolute pointer-events-none"
      style={{
        zIndex: 0,
        animation: 'cloud-breathe 7s ease-in-out infinite',
        inset: '-15% -2% -20% -2%',
        width: '104%',
        height: '135%',
        filter: isRaining ? 'saturate(0.2) brightness(0.55)' : 'none',
        transition: 'filter 1.5s ease-in-out',
      }}
      viewBox="0 0 200 80"
      preserveAspectRatio="none"
      shapeRendering="crispEdges"
    >
      {drawCloud(5, 4, 120, 'c1')}
      {drawCloud(70, 8, 130, 'c2')}
      {drawCloud(20, 30, 140, 'c3')}
    </svg>
  );
}

export default function CloudTextSmall({ children, className = '' }: CloudTextSmallProps) {
  const { theme } = useTheme();
  const { weather } = useWeather();
  const isDark = theme === 'dark';
  const isRaining = weather === 'rain' || weather === 'thunderstorm';

  return (
    <div className={`relative ${className}`}>
      <CloudLayerSmall isDark={isDark} isRaining={isRaining} />
      <span className="relative" style={{ zIndex: 1 }}>
        {children}
      </span>
    </div>
  );
}
