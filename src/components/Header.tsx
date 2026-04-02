'use client';

import Link from 'next/link';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';
import WeatherToggle from './WeatherToggle';
import { useWeather } from './WeatherProvider';
import { useTheme } from './ThemeProvider';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About & Rules' },
  { href: '/modpacks', label: 'Modpacks' },
  { href: '/bedrock', label: 'Bedrock' },
  { href: '/version-catchup', label: 'Version Catch-Up' },
  { href: '/map', label: 'BlueMap' },
  { href: '/leaderboards', label: 'Leaderboards' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/news', label: 'News' },
];

function ServerStatus({ light }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-2 h-2 rounded-full bg-xp shadow-[0_0_6px_rgba(126,252,32,0.5)] animate-pulse" />
      <span className={`font-pixel text-[10px] transition-colors duration-[1500ms] ${light ? 'text-gray-300' : 't-text-dim'}`}>Online</span>
    </div>
  );
}

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { weather } = useWeather();
  const { theme } = useTheme();
  const isRaining = (weather === 'rain' || weather === 'thunderstorm') && theme === 'light';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 backdrop-blur-md border-b transition-all duration-[1500ms] ${
        isRaining ? '' : 't-bg-90 t-border-50'
      }`}
      style={isRaining ? {
        backgroundColor: 'rgba(110, 120, 130, 0.92)',
        borderColor: 'rgba(90, 100, 110, 0.5)',
      } : undefined}
    >
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-pixel text-gold text-base hover:text-gold/80 transition-colors glow-gold">
          mc.pvpers.us
        </Link>

        <nav className="hidden lg:flex items-center gap-0.5">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 text-[13px] hover-surface rounded-md transition-all duration-[1500ms] ${
                isRaining ? 'text-gray-200 hover:text-white' : 't-text-dim hover:t-text'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ServerStatus light={isRaining} />
          <WeatherToggle />
          <ThemeToggle />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`lg:hidden p-1 cursor-pointer transition-colors duration-[1500ms] ${isRaining ? 'text-gray-200' : 't-text-dim'}`}
            aria-label="Toggle menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              {isOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {isOpen && (
        <nav
          className={`lg:hidden backdrop-blur-md border-t transition-all duration-[1500ms] ${isRaining ? '' : 't-bg-95 t-border-30'}`}
          style={isRaining ? { backgroundColor: 'rgba(110, 120, 130, 0.95)', borderColor: 'rgba(90, 100, 110, 0.3)' } : undefined}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-3 text-sm hover-surface border-b transition-all duration-[1500ms] ${
                isRaining ? 'text-gray-200 hover:text-white border-gray-500/20' : 't-text-dim hover:text-gold t-border-20'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
