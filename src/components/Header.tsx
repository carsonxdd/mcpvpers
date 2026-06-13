'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import ThemeToggle from './ThemeToggle';
import WeatherToggle from './WeatherToggle';
import { useWeather } from './WeatherProvider';
import { useTheme } from './ThemeProvider';

type NavLeaf = { href: string; label: string };
type NavItem = NavLeaf | { label: string; children: NavLeaf[] };

const navItems: NavItem[] = [
  { href: '/', label: 'Home' },
  {
    label: 'Server',
    children: [
      { href: '/about', label: 'About' },
      { href: '/reputation', label: 'Reputation' },
      { href: '/mcmmo', label: 'mcMMO' },
      { href: '/wanted', label: 'Wanted' },
    ],
  },
  {
    label: 'Play',
    children: [
      { href: '/events', label: 'Events' },
      { href: '/economy', label: 'Economy' },
      { href: '/leaderboards', label: 'Leaderboards' },
    ],
  },
  {
    label: 'Join',
    children: [
      { href: '/modpacks', label: 'Modpacks' },
      { href: '/bedrock', label: 'Bedrock' },
      { href: '/version-catchup', label: 'Versions' },
    ],
  },
  { href: '/map', label: 'Map' },
  {
    label: 'Community',
    children: [
      { href: '/gallery', label: 'Gallery' },
      { href: '/polls', label: 'Polls' },
      { href: '/news', label: 'News' },
    ],
  },
];

function ServerStatus({ light }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2 text-xs" aria-label="Server online">
      <span className="w-2 h-2 rounded-full bg-xp shadow-[0_0_6px_rgba(126,252,32,0.5)] animate-pulse" />
      <span className={`font-pixel text-[10px] max-md:hidden transition-colors duration-[1500ms] ${light ? 'text-gray-300' : 't-text-dim'}`}>Online</span>
    </div>
  );
}

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const { weather } = useWeather();
  const { theme } = useTheme();
  const isRaining = (weather === 'rain' || weather === 'thunderstorm') && theme === 'light';

  useEffect(() => {
    if (!isOpen && !openMenu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setIsOpen(false); setOpenMenu(null); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, openMenu]);

  const triggerClass = (active: boolean) =>
    `flex items-center gap-1 px-3 py-1.5 text-[13px] hover-surface rounded-md transition-all duration-[1500ms] cursor-pointer ${
      isRaining ? 'text-gray-200 hover:text-white' : `t-text-dim hover:t-text ${active ? 't-text' : ''}`
    }`;

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
        <Link href="/" className="font-pixel text-gold text-base max-md:text-xs hover:text-gold/80 transition-colors glow-gold whitespace-nowrap">
          mc.pvpers.us
        </Link>

        <nav className="hidden lg:flex items-center gap-0.5">
          {navItems.map((item) =>
            'children' in item ? (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => setOpenMenu(item.label)}
                onMouseLeave={() => setOpenMenu(null)}
              >
                <button
                  type="button"
                  className={triggerClass(openMenu === item.label)}
                  aria-haspopup="true"
                  aria-expanded={openMenu === item.label}
                  onClick={() => setOpenMenu(openMenu === item.label ? null : item.label)}
                >
                  {item.label}
                  <svg
                    width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
                    className={`transition-transform duration-200 ${openMenu === item.label ? 'rotate-180' : ''}`}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {openMenu === item.label && (
                  <div
                    className={`absolute left-0 top-full min-w-[170px] rounded-md border backdrop-blur-md py-1 z-50 shadow-lg ${
                      isRaining ? '' : 't-bg-95 t-border-30'
                    }`}
                    style={isRaining ? { backgroundColor: 'rgba(110, 120, 130, 0.96)', borderColor: 'rgba(90, 100, 110, 0.3)' } : undefined}
                  >
                    {item.children.map((c) => (
                      <Link
                        key={c.href}
                        href={c.href}
                        onClick={() => setOpenMenu(null)}
                        className={`block px-4 py-2 text-[13px] hover-surface transition-all duration-[1500ms] ${
                          isRaining ? 'text-gray-200 hover:text-white' : 't-text-dim hover:text-gold'
                        }`}
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 text-[13px] hover-surface rounded-md transition-all duration-[1500ms] ${
                  isRaining ? 'text-gray-200 hover:text-white' : 't-text-dim hover:t-text'
                }`}
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        <div className="flex items-center gap-2 max-md:gap-1">
          <ServerStatus light={isRaining} />
          <WeatherToggle />
          <ThemeToggle />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`lg:hidden p-1 max-md:w-11 max-md:h-11 max-md:flex max-md:items-center max-md:justify-center cursor-pointer transition-colors duration-[1500ms] ${isRaining ? 'text-gray-200' : 't-text-dim'}`}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
          className={`lg:hidden backdrop-blur-md border-t transition-all duration-[1500ms] max-h-[calc(100vh-3.5rem)] overflow-y-auto ${isRaining ? '' : 't-bg-95 t-border-30'}`}
          style={isRaining ? { backgroundColor: 'rgba(110, 120, 130, 0.95)', borderColor: 'rgba(90, 100, 110, 0.3)' } : undefined}
        >
          {navItems.map((item) =>
            'children' in item ? (
              <div key={item.label}>
                <p className={`px-4 pt-3 pb-1 font-pixel text-[10px] uppercase tracking-wider ${isRaining ? 'text-gray-300' : 't-text-muted'}`}>
                  {item.label}
                </p>
                {item.children.map((c) => (
                  <Link
                    key={c.href}
                    href={c.href}
                    onClick={() => setIsOpen(false)}
                    className={`block px-6 py-2.5 text-sm hover-surface border-b transition-all duration-[1500ms] ${
                      isRaining ? 'text-gray-200 hover:text-white border-gray-500/20' : 't-text-dim hover:text-gold t-border-20'
                    }`}
                  >
                    {c.label}
                  </Link>
                ))}
              </div>
            ) : (
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
            )
          )}
        </nav>
      )}
    </header>
  );
}
