'use client';

import { useId } from 'react';
import { useTheme } from './ThemeProvider';
import { useWeather } from './WeatherProvider';

interface CloudTextProps {
  children: React.ReactNode;
  className?: string;
}

/*
  Single SVG covering the full container with overlapping blocky clouds.
  Fill is a vertical linearGradient that animates stop-color (1.5s via
  `.cloud-fade stop` in globals.css) — solid white in clear weather,
  dark blue → grey during rain.
*/
function CloudLayer({ isDark, isRaining }: { isDark: boolean; isRaining: boolean }) {
  const gradId = useId();
  const topColor = isDark
    ? (isRaining ? '#1F1F3A' : '#3a3a5c')
    : (isRaining ? '#2F3A52' : '#ffffff');
  const botColor = isDark
    ? (isRaining ? '#3F3F5C' : '#3a3a5c')
    : (isRaining ? '#7A7F88' : '#ffffff');
  const op = isDark ? 0.7 : 0.95;
  const opEdge = isDark ? 0.5 : 0.75;
  const opFaint = isDark ? 0.35 : 0.55;
  const b = 12;
  const fillRef = `url(#${gradId})`;

  function drawCloud(ox: number, oy: number, w: number, id: string) {
    const inset = Math.floor(w * 0.08);

    // Top bumps — irregular
    const topBumps = [
      { x: ox + Math.floor(w * 0.08), w: Math.floor(w * 0.22) },
      { x: ox + Math.floor(w * 0.42), w: Math.floor(w * 0.18) },
      { x: ox + Math.floor(w * 0.7), w: Math.floor(w * 0.2) },
    ];

    // Bottom bumps — irregular, different positions than top
    const botBumps = [
      { x: ox + Math.floor(w * 0.05), w: Math.floor(w * 0.2), rows: 2 },
      { x: ox + Math.floor(w * 0.3), w: Math.floor(w * 0.25), rows: 3 },
      { x: ox + Math.floor(w * 0.62), w: Math.floor(w * 0.15), rows: 2 },
      { x: ox + Math.floor(w * 0.8), w: Math.floor(w * 0.12), rows: 1 },
    ];

    return (
      <g key={id}>
        {/* Top bump row */}
        {topBumps.map((bump, i) => (
          <rect key={`${id}-t${i}`} x={bump.x} y={oy} width={bump.w} height={b} fill={fillRef} fillOpacity={opEdge} />
        ))}
        {/* Row 1 — slightly inset */}
        <rect x={ox + inset} y={oy + b} width={w - inset * 2} height={b} fill={fillRef} fillOpacity={op} />
        {/* Row 2 — full width */}
        <rect x={ox} y={oy + b * 2} width={w} height={b} fill={fillRef} fillOpacity={op} />
        {/* Row 3 — full width */}
        <rect x={ox} y={oy + b * 3} width={w} height={b} fill={fillRef} fillOpacity={op} />
        {/* Row 4 — slightly inset */}
        <rect x={ox + inset} y={oy + b * 4} width={w - inset * 2} height={b} fill={fillRef} fillOpacity={op} />
        {/* Bottom bumps — varying depths for irregular edge */}
        {botBumps.map((bump, i) => (
          <g key={`${id}-b${i}`}>
            <rect x={bump.x} y={oy + b * 5} width={bump.w} height={b} fill={fillRef} fillOpacity={opEdge} />
            {bump.rows >= 2 && (
              <rect x={bump.x + Math.floor(bump.w * 0.15)} y={oy + b * 6} width={Math.floor(bump.w * 0.7)} height={b} fill={fillRef} fillOpacity={opFaint} />
            )}
            {bump.rows >= 3 && (
              <rect x={bump.x + Math.floor(bump.w * 0.25)} y={oy + b * 7} width={Math.floor(bump.w * 0.5)} height={b * 0.7} fill={fillRef} fillOpacity={opFaint} />
            )}
          </g>
        ))}
      </g>
    );
  }

  return (
    <svg
      className="absolute pointer-events-none cloud-fade"
      style={{
        zIndex: 0,
        animation: 'cloud-breathe 7s ease-in-out infinite',
        inset: '-17% -7% -26% -7%',
        width: '114%',
        height: '143%',
      }}
      viewBox="0 0 200 130"
      preserveAspectRatio="none"
      shapeRendering="crispEdges"
    >
      <defs>
        <linearGradient id={gradId} gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={0} y2={130}>
          <stop offset="0%" stopColor={topColor} />
          <stop offset="100%" stopColor={botColor} />
        </linearGradient>
      </defs>
      {drawCloud(0, 2, 110, 'c1')}
      {drawCloud(80, 6, 120, 'c2')}
      {drawCloud(10, 30, 155, 'c3')}
      {drawCloud(-5, 58, 125, 'c4')}
      {drawCloud(75, 55, 130, 'c5')}
    </svg>
  );
}

export default function CloudText({ children, className = '' }: CloudTextProps) {
  const { theme } = useTheme();
  const { weather } = useWeather();
  const isDark = theme === 'dark';
  const isRaining = weather === 'rain' || weather === 'thunderstorm';
  const textColor = !isDark && isRaining ? '#F5F1E8' : undefined;

  return (
    <div className={`relative ${className}`}>
      <CloudLayer isDark={isDark} isRaining={isRaining} />
      <span
        className="relative"
        style={{
          zIndex: 1,
          color: textColor,
          transition: 'color 1.5s ease-in-out',
        }}
      >
        {children}
      </span>
    </div>
  );
}
