'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import ThemeToggle from '@/components/ThemeToggle';
import WeatherToggle from '@/components/WeatherToggle';
import { useWeather } from '@/components/WeatherProvider';
import { useTheme } from '@/components/ThemeProvider';

// Simplified sibling of the pvpers Header: flat nav built from props instead
// of the baked-in navItems tree. Keeps the light-mode rain restyle.
export default function TenantHeader({
  slug,
  name,
  showLeaderboards,
}: {
  slug: string;
  name: string;
  showLeaderboards: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { weather } = useWeather();
  const { theme } = useTheme();
  const isRaining = (weather === 'rain' || weather === 'thunderstorm') && theme === 'light';

  const base = `/s/${slug}`;
  const navItems = [
    { href: base, label: 'Home' },
    { href: `${base}/rules`, label: 'Rules' },
    { href: `${base}/news`, label: 'News' },
    ...(showLeaderboards ? [{ href: `${base}/leaderboards`, label: 'Leaderboards' }] : []),
  ];

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 backdrop-blur-md border-b transition-all duration-[1500ms] ${
        isRaining ? '' : 't-bg-90 t-border-50'
      }`}
      style={
        isRaining
          ? {
              backgroundColor: 'rgba(110, 120, 130, 0.92)',
              borderColor: 'rgba(90, 100, 110, 0.5)',
            }
          : undefined
      }
    >
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href={base}
          className="font-pixel text-gold text-base max-md:text-xs hover:text-gold/80 transition-colors glow-gold whitespace-nowrap truncate max-w-[50vw]"
        >
          {name}
        </Link>

        <nav className="hidden lg:flex items-center gap-0.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1.5 text-[13px] hover-surface rounded-md transition-all duration-[1500ms] ${
                isRaining ? 'text-gray-200 hover:text-white' : 't-text-dim hover:t-text'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 max-md:gap-1">
          <WeatherToggle />
          <ThemeToggle />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`lg:hidden p-1 max-md:w-11 max-md:h-11 max-md:flex max-md:items-center max-md:justify-center cursor-pointer transition-colors duration-[1500ms] ${isRaining ? 'text-gray-200' : 't-text-dim'}`}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {isOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
            </svg>
          </button>
        </div>
      </div>

      {isOpen && (
        <nav
          className={`lg:hidden backdrop-blur-md border-t transition-all duration-[1500ms] max-h-[calc(100vh-3.5rem)] overflow-y-auto ${isRaining ? '' : 't-bg-95 t-border-30'}`}
          style={
            isRaining
              ? { backgroundColor: 'rgba(110, 120, 130, 0.95)', borderColor: 'rgba(90, 100, 110, 0.3)' }
              : undefined
          }
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-3 text-sm font-medium hover-surface border-b transition-all duration-[1500ms] ${
                isRaining ? 'text-gray-200 hover:text-white border-gray-500/20' : 't-text-dim hover:text-gold t-border-20'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
