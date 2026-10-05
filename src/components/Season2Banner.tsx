'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { SEASON2_AT } from '@/lib/launch';

const subscribeNoop = () => () => {};

type Remaining = { days: number; hours: number; minutes: number; seconds: number; done: boolean };

function computeRemaining(now: number): Remaining {
  const diff = SEASON2_AT - now;
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  const seconds = Math.floor(diff / 1000) % 60;
  const minutes = Math.floor(diff / 60_000) % 60;
  const hours = Math.floor(diff / 3_600_000) % 24;
  const days = Math.floor(diff / 86_400_000);
  return { days, hours, minutes, seconds, done: false };
}

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

// Fixed positions so every render matches — no Math.random in render.
const LEAVES = [
  { left: '6%', delay: '0s', duration: '7s', color: '#D2691E' },
  { left: '18%', delay: '2.4s', duration: '8.5s', color: '#FFAA00' },
  { left: '31%', delay: '4.1s', duration: '6.5s', color: '#B5451B' },
  { left: '47%', delay: '1.2s', duration: '9s', color: '#CD7F32' },
  { left: '62%', delay: '3.3s', duration: '7.5s', color: '#D2691E' },
  { left: '76%', delay: '0.6s', duration: '8s', color: '#FFAA00' },
  { left: '89%', delay: '5s', duration: '6.8s', color: '#B5451B' },
];

const HIGHLIGHTS = [
  'Fresh world',
  '5,000-block border',
  'Shop open day one',
  'Land upkeep',
  'Colosseum Night',
  'PvP is opt-in',
];

export default function Season2Banner() {
  const isLoaded = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const [remaining, setRemaining] = useState<Remaining>(() => computeRemaining(Date.now()));

  useEffect(() => {
    const id = setInterval(() => setRemaining(computeRemaining(Date.now())), 1000);
    return () => clearInterval(id);
  }, []);

  if (!isLoaded) return null;

  return (
    <div className="mc-panel relative overflow-hidden max-w-lg w-full mb-6 text-center">
      <div className="season-stripe h-1.5 w-full" aria-hidden />
      <div aria-hidden>
        {LEAVES.map((leaf, i) => (
          <span
            key={i}
            className="season-leaf"
            style={{
              left: leaf.left,
              background: leaf.color,
              animationDelay: leaf.delay,
              animationDuration: leaf.duration,
            }}
          />
        ))}
      </div>

      <div className="relative p-5 max-md:p-4">
        <div className="font-pixel text-[10px] max-md:text-[8px] uppercase tracking-widest t-text-muted mb-3">
          New world · 26.3 Wilderness Bound
        </div>
        <div className="font-pixel text-gold text-3xl max-md:text-2xl glow-gold mb-2">Season 2</div>
        <div className="font-pixel text-bronze text-xs max-md:text-[10px] mb-4">Homestead</div>

        {remaining.done ? (
          <div className="font-pixel text-xp text-lg glow-xp mb-4">Season 2 is live</div>
        ) : (
          <>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {[
                { label: 'Days', value: remaining.days },
                { label: 'Hours', value: remaining.hours },
                { label: 'Min', value: remaining.minutes },
                { label: 'Sec', value: remaining.seconds },
              ].map(({ label, value }) => (
                <div key={label} className="inventory-slot py-3">
                  <div className="font-pixel text-gold text-xl max-md:text-base glow-gold tabular-nums">
                    {pad(value)}
                  </div>
                  <div className="font-pixel text-[8px] uppercase tracking-widest t-text-muted mt-1">
                    {label}
                  </div>
                </div>
              ))}
            </div>
            <div className="font-pixel text-[10px] max-md:text-[8px] uppercase tracking-widest t-text-muted mb-4">
              Monday Oct 5 · 12 PM Arizona
            </div>
          </>
        )}

        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {HIGHLIGHTS.map((h) => (
            <span
              key={h}
              className="font-pixel text-[9px] px-2 py-1 rounded bg-bronze/10 text-bronze"
            >
              {h}
            </span>
          ))}
        </div>

        <a
          href="/news"
          className="font-pixel text-enchant text-[10px] hover:text-enchant/70 focus-visible:text-enchant/70 active:text-enchant/50 transition-colors"
        >
          What&apos;s changing &rarr;
        </a>
      </div>
    </div>
  );
}
