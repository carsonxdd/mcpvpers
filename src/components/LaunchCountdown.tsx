'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { LAUNCH_AT } from '@/lib/launch';

const subscribeNoop = () => () => {};

type Remaining = { days: number; hours: number; minutes: number; seconds: number; done: boolean };

function computeRemaining(now: number): Remaining {
  const diff = LAUNCH_AT - now;
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

export default function LaunchCountdown() {
  const isLoaded = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const [remaining, setRemaining] = useState<Remaining>(() => computeRemaining(Date.now()));

  useEffect(() => {
    const id = setInterval(() => setRemaining(computeRemaining(Date.now())), 1000);
    return () => clearInterval(id);
  }, []);

  if (!isLoaded) return null;

  if (remaining.done) {
    return (
      <div className="mc-panel p-5 max-w-lg w-full mb-6 text-center">
        <div className="font-pixel text-[10px] uppercase tracking-widest t-text-muted mb-2">
          Server Launched
        </div>
        <div className="font-pixel text-xp text-lg glow-xp">We&apos;re live</div>
      </div>
    );
  }

  return (
    <div className="mc-panel p-5 max-w-lg w-full mb-6 text-center">
      <div className="font-pixel text-[10px] uppercase tracking-widest t-text-muted mb-3">
        Launch · Saturday May 23 · 5* PM Arizona
      </div>
      <div className="grid grid-cols-4 gap-2">
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
    </div>
  );
}
