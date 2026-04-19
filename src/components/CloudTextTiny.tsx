'use client';

import { useTheme } from './ThemeProvider';
import { useWeather } from './WeatherProvider';

interface CloudTextTinyProps {
  children: React.ReactNode;
  className?: string;
}

/*
  Minimal cloud layer for single-line text blocks.
  Just 2 clouds, light coverage, same blocky style.
*/
function CloudLayerTiny({ isDark, isRaining }: { isDark: boolean; isRaining: boolean }) {
  const fill = isDark ? '#3a3a5c' : '#ffffff';
  const op = isDark ? 0.7 : 0.95;
  const opEdge = isDark ? 0.5 : 0.75;
  const opFaint = isDark ? 0.35 : 0.55;
  const b = 8;

  function drawCloud(ox: number, oy: number, w: number, id: string) {
    const inset = Math.floor(w * 0.1);

    return (
      <g key={id}>
        {/* Top bump */}
        <rect x={ox + Math.floor(w * 0.15)} y={oy} width={Math.floor(w * 0.3)} height={b} fill={fill} fillOpacity={opEdge} />
        <rect x={ox + Math.floor(w * 0.6)} y={oy} width={Math.floor(w * 0.2)} height={b} fill={fill} fillOpacity={opEdge} />
        {/* Row 1 — inset */}
        <rect x={ox + inset} y={oy + b} width={w - inset * 2} height={b} fill={fill} fillOpacity={op} />
        {/* Row 2 — full */}
        <rect x={ox} y={oy + b * 2} width={w} height={b} fill={fill} fillOpacity={op} />
        {/* Row 3 — full */}
        <rect x={ox} y={oy + b * 3} width={w} height={b} fill={fill} fillOpacity={op} />
        {/* Row 4 — inset */}
        <rect x={ox + inset} y={oy + b * 4} width={w - inset * 2} height={b} fill={fill} fillOpacity={opEdge} />
        {/* Bottom bump */}
        <rect x={ox + Math.floor(w * 0.2)} y={oy + b * 5} width={Math.floor(w * 0.25)} height={b} fill={fill} fillOpacity={opFaint} />
        <rect x={ox + Math.floor(w * 0.55)} y={oy + b * 5} width={Math.floor(w * 0.18)} height={b * 0.7} fill={fill} fillOpacity={opFaint} />
      </g>
    );
  }

  return (
    <svg
      className="absolute pointer-events-none cloud-fade"
      style={{
        zIndex: 0,
        animation: 'cloud-breathe 7s ease-in-out infinite',
        inset: '-10% -2% -15% -2%',
        width: '104%',
        height: '125%',
        filter: isRaining ? 'saturate(0.2) brightness(0.55)' : 'none',
        transition: 'filter 1.5s ease-in-out',
      }}
      viewBox="0 0 200 55"
      preserveAspectRatio="none"
      shapeRendering="crispEdges"
    >
      {drawCloud(10, 3, 110, 'c1')}
      {drawCloud(80, 6, 115, 'c2')}
    </svg>
  );
}

export default function CloudTextTiny({ children, className = '' }: CloudTextTinyProps) {
  const { theme } = useTheme();
  const { weather } = useWeather();
  const isDark = theme === 'dark';
  const isRaining = weather === 'rain' || weather === 'thunderstorm';

  return (
    <div className={`relative ${className}`}>
      <CloudLayerTiny isDark={isDark} isRaining={isRaining} />
      <span className="relative" style={{ zIndex: 1 }}>
        {children}
      </span>
    </div>
  );
}
