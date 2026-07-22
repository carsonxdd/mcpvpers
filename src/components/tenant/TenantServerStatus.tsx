'use client';

import { useEffect, useState } from 'react';

type ServerStatus = {
  tps: number;
  online: number;
  max: number;
};

const POLL_MS = 30_000;

// LiveServerStatus with the endpoint + launch instant as props instead of the
// pvpers constants. Renders nothing pre-launch; flips live without a refresh.
export default function TenantServerStatus({
  endpoint,
  launchAt,
}: {
  endpoint: string;
  launchAt: number | null;
}) {
  const [status, setStatus] = useState<ServerStatus | null>(null);
  const [unreachable, setUnreachable] = useState(false);
  const [launched, setLaunched] = useState(false);

  useEffect(() => {
    if (launchAt !== null && Date.now() < launchAt) {
      const id = setTimeout(() => setLaunched(true), launchAt - Date.now());
      return () => clearTimeout(id);
    }
    setLaunched(true);
  }, [launchAt]);

  useEffect(() => {
    if (!launched) return;
    let cancelled = false;

    const tick = async () => {
      try {
        const r = await fetch(endpoint, { cache: 'no-store' });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const json = (await r.json()) as ServerStatus;
        if (cancelled) return;
        setStatus(json);
        setUnreachable(false);
      } catch {
        if (cancelled) return;
        setUnreachable(true);
      }
    };

    tick();
    const id = setInterval(tick, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [launched, endpoint]);

  if (!launched) return null;
  if (!status && !unreachable) return null;

  if (unreachable) {
    return (
      <div className="font-pixel text-[10px] uppercase tracking-widest t-text-muted mb-6">
        <span className="inline-block w-2 h-2 rounded-full bg-redstone mr-2 align-middle" />
        offline
      </div>
    );
  }

  return (
    <div className="font-pixel text-[10px] uppercase tracking-widest text-xp mb-6 glow-xp">
      <span className="inline-block w-2 h-2 rounded-full bg-xp mr-2 align-middle animate-pulse" />
      online · {status!.online} / {status!.max} players
    </div>
  );
}
