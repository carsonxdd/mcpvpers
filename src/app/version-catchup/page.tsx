'use client';

import { useState, useEffect, useRef, useCallback, useSyncExternalStore } from 'react';
import versions from '@/data/versions.json';
import GrassDivider from '@/components/GrassDivider';
import CloudTitle from '@/components/CloudTitle';

const STORAGE_KEY = 'version-catchup-visited';
const years = Array.from(new Set(versions.map((v) => v.year))).sort((a, b) => a - b);
const subscribeNoop = () => () => {};

function readHasVisited(): boolean {
  if (typeof localStorage === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEY) === 'true';
}

export default function VersionCatchUpPage() {
  const isClient = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const [showTimeline, setShowTimeline] = useState<boolean>(readHasVisited);
  const [startYear, setStartYear] = useState<number | null>(() =>
    readHasVisited() ? years[years.length - 1] : null,
  );
  const [visibleNodes, setVisibleNodes] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const timelineRef = useRef<HTMLDivElement>(null);
  const yearRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Scroll to the chosen year once the timeline is rendered
  useEffect(() => {
    if (!showTimeline || startYear === null) return;

    // Small delay to let the DOM render
    const timer = setTimeout(() => {
      const el = yearRefs.current.get(startYear);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [showTimeline, startYear]);

  // Intersection observer for scroll animations
  useEffect(() => {
    if (!showTimeline) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleNodes((prev) => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.2 }
    );

    const nodes = timelineRef.current?.querySelectorAll('[data-timeline-node]');
    nodes?.forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  }, [showTimeline]);

  const handleYearSelect = useCallback((year: number) => {
    localStorage.setItem(STORAGE_KEY, 'true');

    if (!showTimeline) {
      // First visit — reveal the timeline then scroll
      setStartYear(year);
      setShowTimeline(true);
    } else {
      // Already showing — just scroll to that year
      const el = yearRefs.current.get(year);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [showTimeline]);

  const toggleExpand = (version: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(version)) next.delete(version);
      else next.add(version);
      return next;
    });
  };

  // Group versions by year for year header markers
  const versionsByYear = new Map<number, typeof versions>();
  for (const v of versions) {
    if (!versionsByYear.has(v.year)) versionsByYear.set(v.year, []);
    versionsByYear.get(v.year)!.push(v);
  }
  const sortedYears = Array.from(versionsByYear.keys()).sort((a, b) => b - a);

  // Don't render until hydration completes (avoids SSR/client mismatch on localStorage read)
  if (!isClient) return null;

  return (
    <div>
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <CloudTitle><h1 className="font-pixel text-gold text-2xl sm:text-3xl mb-4 glow-gold">Version Catch-Up</h1></CloudTitle>

        {!showTimeline ? (
          /* First visit — prompt to pick a year */
          <div className="mt-4">
            <p className="t-text-dim mb-2 relative z-10 text-lg">When did you last play Minecraft?</p>
            <p className="t-text-muted mb-8 relative z-10 text-sm">Pick a year and we&apos;ll show you everything you&apos;ve missed.</p>

            <div className="mc-panel p-6 max-w-lg mx-auto">
              <div className="flex flex-wrap justify-center gap-2">
                {years.map((year) => (
                  <button
                    key={year}
                    onClick={() => handleYearSelect(year)}
                    className="mc-pill hover:scale-105 transition-transform"
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Return visit or year selected — show jump-to-year bar */
          <div>
            <p className="t-text-dim mb-8 relative z-10">Click a year to jump to it</p>

            <div className="mc-panel p-5 max-w-lg mx-auto mb-4">
              <div className="flex flex-wrap justify-center gap-2">
                {years.map((year) => (
                  <button
                    key={year}
                    onClick={() => handleYearSelect(year)}
                    className="mc-pill hover:scale-105 transition-transform"
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {showTimeline && (
        <>
          <GrassDivider />

          <section className="max-w-3xl mx-auto px-4 py-16" ref={timelineRef}>
            <div className="relative">
              <div
                className="absolute left-6 sm:left-8 top-0 bottom-0 w-px"
                style={{ background: 'linear-gradient(to bottom, var(--color-xp), var(--color-enchant), var(--c-border))' }}
              />

              <div className="space-y-8">
                {sortedYears.map((year) => (
                  <div key={year}>
                    {/* Year divider */}
                    <div
                      ref={(el) => { if (el) yearRefs.current.set(year, el); }}
                      className="relative pl-16 sm:pl-20 mb-6 scroll-mt-24"
                    >
                      <div className="absolute left-[14px] sm:left-[22px] w-5 h-5 rounded-full bg-gold shadow-[0_0_12px_rgba(255,170,0,0.5)] flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-yellow-200" />
                      </div>
                      <h2 className="font-pixel text-gold text-xl glow-gold pt-0.5">{year}</h2>
                    </div>

                    {/* Versions in this year */}
                    <div className="space-y-8">
                      {versionsByYear.get(year)!.map((version) => {
                        const isExpanded = expanded.has(version.version);
                        const hasName = version.name && version.name.length > 0;

                        return (
                          <div
                            key={version.version}
                            id={`version-${version.version}`}
                            data-timeline-node
                            className={`relative pl-16 sm:pl-20 transition-all duration-700 ${
                              visibleNodes.has(`version-${version.version}`)
                                ? 'opacity-100 translate-x-0'
                                : 'opacity-0 translate-x-8'
                            }`}
                          >
                            <div className="absolute left-[18px] sm:left-[26px] w-3 h-3 rounded-full bg-xp shadow-[0_0_8px_rgba(126,252,32,0.4)]" />

                            <div
                              className="mc-panel p-5 cursor-pointer transition-all hover:scale-[1.01]"
                              onClick={() => toggleExpand(version.version)}
                              style={{ borderColor: isExpanded ? 'var(--color-xp)' : undefined }}
                            >
                              {/* Header */}
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <div className="flex items-center gap-3 flex-wrap">
                                  <span className="inline-block font-pixel text-xp text-[11px] px-2.5 py-1 bg-xp/10 rounded">
                                    {version.version}
                                  </span>
                                  {hasName && (
                                    <h3 className="font-pixel text-xl sm:text-2xl t-text" style={{ lineHeight: '1.3' }}>
                                      {version.name}
                                    </h3>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="t-text-muted text-xs font-pixel">{version.month}</span>
                                  <svg
                                    width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                    className={`t-text-muted transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                  >
                                    <path d="M6 9l6 6 6-6" />
                                  </svg>
                                </div>
                              </div>

                              {/* Summary — always visible */}
                              <p className="t-text-dim text-sm leading-relaxed mb-3">{version.summary}</p>

                              {/* Expanded details */}
                              {isExpanded && version.details && (
                                <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--c-border)' }}>
                                  <h4 className="font-pixel text-gold text-[10px] uppercase tracking-wider mb-3 glow-gold">
                                    What&apos;s New
                                  </h4>
                                  <ul className="space-y-2">
                                    {version.details.map((detail, i) => {
                                      const dashIndex = detail.indexOf(' — ');
                                      const hasLabel = dashIndex > 0 && dashIndex < 40;
                                      return (
                                        <li key={i} className="flex gap-2.5 text-sm">
                                          <span className="text-xp shrink-0 mt-0.5">+</span>
                                          {hasLabel ? (
                                            <span className="t-text-dim leading-relaxed">
                                              <strong className="t-text">{detail.substring(0, dashIndex)}</strong>
                                              {detail.substring(dashIndex)}
                                            </span>
                                          ) : (
                                            <span className="t-text-dim leading-relaxed">{detail}</span>
                                          )}
                                        </li>
                                      );
                                    })}
                                  </ul>
                                </div>
                              )}

                              {/* Links */}
                              <div className="flex items-center gap-3 mt-3">
                                {version.trailer && (
                                  <a href={version.trailer} target="_blank" rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-xs text-redstone hover:text-redstone/70 transition-colors flex items-center gap-1">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                      <path d="M10 8.64L15.27 12 10 15.36V8.64M8 5v14l11-7L8 5z" />
                                    </svg>
                                    Trailer
                                  </a>
                                )}
                                <a href={version.wiki} target="_blank" rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-xs text-enchant hover:text-enchant/70 transition-colors flex items-center gap-1">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
                                  </svg>
                                  Wiki
                                </a>
                                <span className="t-text-muted text-[10px] ml-auto">
                                  {isExpanded ? 'click to collapse' : 'click for details'}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* End marker */}
              <div className="relative pl-16 sm:pl-20 mt-10">
                <div className="absolute left-[18px] sm:left-[26px] w-3 h-3 rounded-full bg-gold shadow-[0_0_8px_rgba(255,170,0,0.4)]" />
                <div className="mc-panel p-5 text-center">
                  <p className="font-pixel text-gold text-xs glow-gold">You&apos;re all caught up!</p>
                  <p className="t-text-muted text-xs mt-1">Welcome back to Minecraft.</p>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
