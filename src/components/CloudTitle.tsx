'use client';

import { useTheme } from './ThemeProvider';
import { useWeather } from './WeatherProvider';

interface CloudTitleProps {
  children: React.ReactNode;
  className?: string;
  size?: 'normal' | 'large';
}

/*
  Thick Minecraft-style blocky cloud — 5-6 block rows tall, solid white rectangles.
  Matches the parallax background cloud aesthetic but scaled up.
*/
function BlockyCloud({ isDark, isRaining, size = 'normal' }: { isDark: boolean; isRaining: boolean; size?: 'normal' | 'large' }) {
  const fill = isDark ? '#3a3a5c' : '#ffffff';
  const op = isDark ? 0.7 : 0.95;
  const opEdge = isDark ? 0.5 : 0.75;
  const b = 20;
  const w = size === 'large' ? '185%' : '160%';
  const h = size === 'large' ? '550%' : '480%';

  return (
    <svg
      className="absolute pointer-events-none"
      style={{
        zIndex: 0,
        top: '50%',
        left: '50%',
        width: w,
        height: h,
        transform: 'translate(-50%, -54%)',
        animation: 'cloud-bob 7s ease-in-out infinite',
        filter: isRaining ? 'saturate(0.2) brightness(0.55)' : 'none',
        transition: 'filter 1.5s ease-in-out',
      }}
      viewBox="0 0 520 160"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Row 0 (top) — small bumps */}
      {[7, 8, 13, 14, 15, 19, 20].map(col => (
        <rect key={`r0-${col}`} x={col * b} y={0} width={b} height={b} fill={fill} fillOpacity={opEdge} />
      ))}

      {/* Row 1 — wider bumps */}
      {[5, 6, 7, 8, 9, 12, 13, 14, 15, 16, 18, 19, 20, 21].map(col => (
        <rect key={`r1-${col}`} x={col * b} y={b} width={b} height={b} fill={fill} fillOpacity={op} />
      ))}

      {/* Row 2 — main body starts */}
      {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22].map(col => (
        <rect key={`r2-${col}`} x={col * b} y={b * 2} width={b} height={b} fill={fill} fillOpacity={op} />
      ))}

      {/* Row 3 — full body */}
      {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].map(col => (
        <rect key={`r3-${col}`} x={col * b} y={b * 3} width={b} height={b} fill={fill} fillOpacity={op} />
      ))}

      {/* Row 4 — full body */}
      {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].map(col => (
        <rect key={`r4-${col}`} x={col * b} y={b * 4} width={b} height={b} fill={fill} fillOpacity={op} />
      ))}

      {/* Row 5 — bottom, slightly narrower */}
      {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22].map(col => (
        <rect key={`r5-${col}`} x={col * b} y={b * 5} width={b} height={b} fill={fill} fillOpacity={op} />
      ))}

      {/* Row 6 — bottom shadow/edge */}
      {[4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21].map(col => (
        <rect key={`r6-${col}`} x={col * b} y={b * 6} width={b} height={b * 0.5} fill={fill} fillOpacity={opEdge} />
      ))}
    </svg>
  );
}

export default function CloudTitle({ children, className = '', size = 'normal' }: CloudTitleProps) {
  const { theme } = useTheme();
  const { weather } = useWeather();
  const isDark = theme === 'dark';
  const isRaining = weather === 'rain' || weather === 'thunderstorm';

  return (
    <div className={`relative inline-flex flex-col items-center justify-center ${className}`}>
      <BlockyCloud isDark={isDark} isRaining={isRaining} size={size} />

      {/* Content */}
      <span className="relative" style={{ zIndex: 1 }}>
        {children}
      </span>
    </div>
  );
}
