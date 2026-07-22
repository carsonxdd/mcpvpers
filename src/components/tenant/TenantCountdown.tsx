'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';

const subscribeNoop = () => () => {};

type Remaining = { days: number; hours: number; minutes: number; seconds: number; done: boolean };

function computeRemaining(launchAt: number, now: number): Remaining {
  const diff = launchAt - now;
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

// LaunchCountdown with the launch instant as a prop instead of the pvpers
// LAUNCH_AT constant. Renders nothing once the moment passes.
export default function TenantCountdown({ launchAt }: { launchAt: number }) {
  const isLoaded = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const [remaining, setRemaining] = useState<Remaining>(() =>
    computeRemaining(launchAt, Date.now()),
  );

  useEffect(() => {
    const id = setInterval(() => setRemaining(computeRemaining(launchAt, Date.now())), 1000);
    return () => clearInterval(id);
  }, [launchAt]);

  if (!isLoaded || remaining.done) return null;

  return (
    <div className="mc-panel p-5 max-w-lg w-full mb-6 text-center">
      <div className="font-pixel text-[10px] uppercase tracking-widest t-text-muted mb-3">
        Launching soon
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
