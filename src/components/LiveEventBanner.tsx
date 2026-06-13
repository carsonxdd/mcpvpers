'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { bossByRaidKey } from '@/lib/bossDisplay';
import GearChip from '@/components/GearChip';

// Polls the always-200 /api/events/live endpoint and renders a pulsing banner
// while an event is happening. `active:false` (idle / not shipped) → renders
// nothing, so the hub is unchanged when there's nothing live.

type LiveEvent =
  | { active: false }
  | {
      active: true;
      name: string | null;
      mode: string; // BOSS_RUSH | TDM | FFA
      raid: string | null;
      difficulty: number;
      state: string; // LOBBY | COUNTDOWN | ACTIVE | …
      gear_mode?: string | null; // KIT|BYOG|HARDCORE (1.7.0+); absent pre-feature
      players: number;
      spectators: number;
      wave: number;
      max_wave: number;
      updated_at: number;
    };

const POLL_MS = 45_000;

export default function LiveEventBanner() {
  const [live, setLive] = useState<LiveEvent | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const r = await fetch('/api/stats/events/live');
        if (!r.ok) return;
        const json = (await r.json()) as LiveEvent;
        if (!cancelled) setLive(json);
      } catch {
        /* ignore — idle/offline just leaves the banner hidden */
      }
    };
    load();
    const t = setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  if (!live || !live.active) return null;

  const forming = live.state === 'LOBBY' || live.state === 'COUNTDOWN';
  const isBoss = live.mode === 'BOSS_RUSH';
  const boss = bossByRaidKey(live.raid);
  const href = isBoss ? '/events/boss-rush' : '/events/pvp';
  // Player-started key runs are only identifiable by the live snapshot's name
  // ("<raid>-key-p<pit>"). Joining one is always free — stronger hook than an
  // admin event, so the copy swaps to the player-hype version.
  const keyRun = /-key-p\d+$/.test(live.name ?? '');
  const raidLabel = boss ? `${boss.icon} ${boss.raid}` : 'raid';
  const pit = live.difficulty >= 1 ? ` · Pit ${live.difficulty}` : '';

  let message: string;
  if (forming && keyRun) {
    message = `⚷ Player key run forming: ${raidLabel}${pit} — anyone can join free!`;
  } else if (forming) {
    message = `⚔ ${live.name ?? 'An event'} is forming — get on the server to join!`;
  } else if (isBoss) {
    message = `🔴 LIVE${keyRun ? ' ⚷ key run' : ''}: ${raidLabel}${pit} — wave ${live.wave}/${live.max_wave}, ${live.players} fighting`;
  } else {
    message = `🔴 LIVE: ${live.mode} — ${live.players} fighting, ${live.spectators} watching`;
  }

  return (
    <Link
      href={href}
      className="block mb-8 mc-panel p-4 border-l-2 border-redstone/70 hover-surface transition-colors relative z-10"
      style={{ background: 'color-mix(in srgb, var(--c-redstone, #ff5555) 10%, transparent)' }}
    >
      <div className="flex items-center gap-3">
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="absolute inline-flex h-full w-full rounded-full bg-redstone opacity-75 animate-ping" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-redstone" />
        </span>
        <span className="t-text-dim text-sm leading-snug">{message}</span>
        <GearChip mode={live.gear_mode} showKit />
        <span className="ml-auto text-[11px] t-text-muted shrink-0 max-md:hidden">
          {forming ? 'Join →' : 'Watch →'}
        </span>
      </div>
    </Link>
  );
}
