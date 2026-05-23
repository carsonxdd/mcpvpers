'use client';

import { useId } from 'react';
import { useTheme } from './ThemeProvider';
import { useWeather } from './WeatherProvider';

interface CloudTitleProps {
  children: React.ReactNode;
  className?: string;
  size?: 'normal' | 'large';
}

/*
  Thick Minecraft-style blocky cloud — 5-6 block rows tall.
  Fill is a vertical linearGradient (top → bottom): solid white in clear weather,
  dark blue → grey during rain. Stop colors transition smoothly (1.5s) via
  `.cloud-fade stop` in globals.css so weather and theme swaps stay in sync.
*/
function BlockyCloud({ isDark, isRaining, size = 'normal' }: { isDark: boolean; isRaining: boolean; size?: 'normal' | 'large' }) {
  const gradId = useId();
  const topColor = isDark
    ? (isRaining ? '#1F1F3A' : '#3a3a5c')
    : (isRaining ? '#2F3A52' : '#ffffff');
  const botColor = isDark
    ? (isRaining ? '#3F3F5C' : '#3a3a5c')
    : (isRaining ? '#7A7F88' : '#ffffff');
  const op = isDark ? 0.7 : 0.95;
  const opEdge = isDark ? 0.5 : 0.75;
  const b = 20;
  const w = size === 'large' ? '185%' : '160%';
  const h = size === 'large' ? '550%' : '480%';
  const fillRef = `url(#${gradId})`;

  return (
    <svg
      className="absolute pointer-events-none cloud-fade"
      style={{
        zIndex: 0,
        top: '50%',
        left: '50%',
        width: w,
        height: h,
        transform: 'translate(-50%, -54%)',
        animation: 'cloud-bob 7s ease-in-out infinite',
      }}
      viewBox="0 0 520 160"
      preserveAspectRatio="xMidYMid meet"
      shapeRendering="crispEdges"
    >
      <defs>
        <linearGradient id={gradId} gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={0} y2={160}>
          <stop offset="0%" stopColor={topColor} />
          <stop offset="100%" stopColor={botColor} />
        </linearGradient>
      </defs>

      {/* Row 0 (top) — small bumps */}
      {[7, 8, 13, 14, 15, 19, 20].map(col => (
        <rect key={`r0-${col}`} x={col * b} y={0} width={b} height={b} fill={fillRef} fillOpacity={opEdge} />
      ))}

      {/* Row 1 — wider bumps */}
      {[5, 6, 7, 8, 9, 12, 13, 14, 15, 16, 18, 19, 20, 21].map(col => (
        <rect key={`r1-${col}`} x={col * b} y={b} width={b} height={b} fill={fillRef} fillOpacity={op} />
      ))}

      {/* Row 2 — main body starts */}
      {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22].map(col => (
        <rect key={`r2-${col}`} x={col * b} y={b * 2} width={b} height={b} fill={fillRef} fillOpacity={op} />
      ))}

      {/* Row 3 — full body */}
      {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].map(col => (
        <rect key={`r3-${col}`} x={col * b} y={b * 3} width={b} height={b} fill={fillRef} fillOpacity={op} />
      ))}

      {/* Row 4 — full body */}
      {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].map(col => (
        <rect key={`r4-${col}`} x={col * b} y={b * 4} width={b} height={b} fill={fillRef} fillOpacity={op} />
      ))}

      {/* Row 5 — bottom, slightly narrower */}
      {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22].map(col => (
        <rect key={`r5-${col}`} x={col * b} y={b * 5} width={b} height={b} fill={fillRef} fillOpacity={op} />
      ))}

      {/* Row 6 — bottom shadow/edge */}
      {[4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21].map(col => (
        <rect key={`r6-${col}`} x={col * b} y={b * 6} width={b} height={b * 0.5} fill={fillRef} fillOpacity={opEdge} />
      ))}
    </svg>
  );
}

export default function CloudTitle({ children, className = '', size = 'normal' }: CloudTitleProps) {
  const { theme } = useTheme();
  const { weather } = useWeather();
  const isDark = theme === 'dark';
  const isRaining = weather === 'rain' || weather === 'thunderstorm';
  // In light mode the cloud darkens dramatically during rain, so lift the text color.
  // Dark mode text is already light from --c-text — leave it alone.
  const textColor = !isDark && isRaining ? '#F5F1E8' : undefined;

  return (
    <div className={`relative inline-flex flex-col items-center justify-center ${className}`}>
      <BlockyCloud isDark={isDark} isRaining={isRaining} size={size} />

      {/* Content */}
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
