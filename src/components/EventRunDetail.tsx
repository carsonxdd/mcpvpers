'use client';

import { useEffect, useState } from 'react';
import { lootTier } from '@/lib/bossDisplay';
import GearChip from '@/components/GearChip';

// Inline expansion for a single run/match. Fetches /api/events/run/{id} once when
// mounted (i.e. when its row is expanded) and renders the score/kill-sorted roster
// plus that run's notable loot. 503 (pre-tracking DB) / 404 → a quiet fallback.

type RosterRow = {
  uuid: string | null;
  name: string;
  team: string | null;
  kit: string | null;
  score: number;
  damage: number;
  boss_damage: number;
  damage_taken: number;
  adds: number;
  healing: number;
  lives_lost: number;
  survived: boolean;
  kills: number;
  deaths: number;
  money: number;
};

type RunDetail = {
  id: number;
  mode: string;
  cleared: boolean;
  difficulty: number;
  gear_mode?: string | null; // KIT|BYOG|HARDCORE (1.7.0+); null on pre-feature rows
  roster: RosterRow[];
  loot: { name: string; item: string; tier: string }[];
};

const num = (v: number) => Math.round(v).toLocaleString();

export default function EventRunDetail({ runId }: { runId: number }) {
  const [run, setRun] = useState<RunDetail | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/stats/events/run/${runId}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return (await r.json()) as RunDetail;
      })
      .then((json) => {
        if (cancelled) return;
        if (!json || !Array.isArray(json.roster)) throw new Error('no roster');
        setRun(json);
        setState('ready');
      })
      .catch(() => {
        if (!cancelled) setState('error');
      });
    return () => {
      cancelled = true;
    };
  }, [runId]);

  if (state === 'loading') {
    return <div className="px-4 py-4 t-text-muted text-xs">Loading run…</div>;
  }
  if (state === 'error' || !run) {
    return <div className="px-4 py-4 t-text-muted text-xs">Run details aren&apos;t available for this one.</div>;
  }

  const isPvp = run.mode === 'TDM' || run.mode === 'FFA';

  return (
    <div className="px-4 py-4 t-surface-light/40">
      {/* Run-detail header shows the gear mode incl. the default KIT — the
          parent row only flags BYOG/HARDCORE. */}
      {run.gear_mode && (
        <div className="flex items-center gap-2 mb-2">
          <GearChip mode={run.gear_mode} showKit />
          <span className="t-text-muted text-[10px]">
            {run.gear_mode === 'KIT' && 'Gear provided - nothing at stake'}
            {run.gear_mode === 'BYOG' && 'Own gear, no drops on death'}
            {run.gear_mode === 'HARDCORE' && 'Own gear - deaths dropped inventories where players fell'}
          </span>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse min-w-[34rem]">
          <thead>
            <tr className="t-text-muted">
              <th className="font-pixel text-[9px] text-left py-1.5 pr-3">Player</th>
              {isPvp ? (
                <>
                  <th className="font-pixel text-[9px] text-right py-1.5 px-2">K</th>
                  <th className="font-pixel text-[9px] text-right py-1.5 px-2">D</th>
                </>
              ) : (
                <>
                  <th className="font-pixel text-[9px] text-right py-1.5 px-2">Score</th>
                  <th className="font-pixel text-[9px] text-right py-1.5 px-2">Dmg</th>
                  <th className="font-pixel text-[9px] text-right py-1.5 px-2 max-md:hidden">Boss</th>
                  <th className="font-pixel text-[9px] text-right py-1.5 px-2 max-md:hidden">Taken</th>
                  <th className="font-pixel text-[9px] text-right py-1.5 px-2 max-md:hidden">Adds</th>
                  <th className="font-pixel text-[9px] text-center py-1.5 px-2">Surv</th>
                </>
              )}
              <th className="font-pixel text-[9px] text-right py-1.5 pl-2">$</th>
            </tr>
          </thead>
          <tbody>
            {run.roster.map((p) => (
              <tr key={p.uuid ?? p.name} className="t-border-20 border-t">
                <td className="py-1.5 pr-3 t-text-dim whitespace-nowrap">
                  {p.name}
                  {p.team && <span className="t-text-muted"> · {p.team}</span>}
                  {p.kit && <span className="t-text-muted"> · {p.kit}</span>}
                </td>
                {isPvp ? (
                  <>
                    <td className="py-1.5 px-2 text-right t-text-muted">{num(p.kills)}</td>
                    <td className="py-1.5 px-2 text-right t-text-muted">{num(p.deaths)}</td>
                  </>
                ) : (
                  <>
                    <td className="py-1.5 px-2 text-right t-text-dim">{num(p.score)}</td>
                    <td className="py-1.5 px-2 text-right t-text-muted">{num(p.damage)}</td>
                    <td className="py-1.5 px-2 text-right t-text-muted max-md:hidden">{num(p.boss_damage)}</td>
                    <td className="py-1.5 px-2 text-right t-text-muted max-md:hidden">{num(p.damage_taken)}</td>
                    <td className="py-1.5 px-2 text-right t-text-muted max-md:hidden">{num(p.adds)}</td>
                    <td className="py-1.5 px-2 text-center">{p.survived ? <span className="text-xp">✓</span> : <span className="text-redstone">✗</span>}</td>
                  </>
                )}
                <td className="py-1.5 pl-2 text-right text-gold whitespace-nowrap">${num(p.money)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {run.loot.length > 0 && (
        <div className="mt-3 pt-3 t-border-20 border-t">
          <p className="font-pixel t-text-muted text-[9px] mb-2">Drops</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
            {run.loot.map((d, i) => {
              const t = lootTier[d.tier];
              return (
                <span key={i} className="whitespace-nowrap">
                  <span className="t-text-muted">{d.name}: </span>
                  <span style={{ color: t?.color }}>{d.item}</span>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
