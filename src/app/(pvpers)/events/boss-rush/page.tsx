'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import CloudTitle from '@/components/CloudTitle';
import { bosses, accentFor, tierLabel, lootTier, tierChip, bossByRaidKey, SHARED_MECHANICS, type Boss } from '@/lib/bossDisplay';
import EventRunDetail from '@/components/EventRunDetail';
import GearChip from '@/components/GearChip';
import RecentPlunder from '@/components/RecentPlunder';

type EventEntry = {
  rank: number;
  uuid: string | null;
  name: string;
  events: number;
  clears: number;
  total_damage: number;
  total_boss_damage: number;
  total_damage_taken: number;
  total_healing: number;
  total_adds: number;
  total_score: number;
  best_score: number;
  total_lives_lost: number;
  survivals: number;
  total_money: number;
};

type EventRun = {
  id: number;
  mode: string;
  cleared: boolean;
  players: number;
  wave: number;
  difficulty: number;
  raid: string | null;
  duration_ms: number;
  winner: string | null;
  mvp: string | null;
  gear_mode?: string | null;
  ended_at: number;
};

type EventSummary = {
  total_runs: number;
  total_clears: number;
  clear_rate: number;
  total_paid_out: number;
  unique_participants: number;
  last_run_ts: number;
  boss_runs?: number;
  boss_clears?: number;
  pvp_matches?: number;
  pitforged_drops?: number;
};

type EventsSnapshot = {
  available: boolean;
  categories: Record<string, EventEntry[]>;
  summary: EventSummary | null;
  recent: EventRun[];
  updatedAt: number;
};

// The seven role boards returned by /categories, in display order. `field` is
// the stat the board sorts by - that's the column we show for it.
const ROLE_BOARDS: { key: string; label: string; field: keyof EventEntry; blurb: string }[] = [
  { key: 'score', label: 'Score', field: 'total_score', blurb: 'Weighted overall performance' },
  { key: 'damage', label: 'Damage', field: 'total_damage', blurb: 'Total damage to event mobs' },
  { key: 'boss_damage', label: 'Boss Damage', field: 'total_boss_damage', blurb: 'Damage to bosses only' },
  { key: 'tank', label: 'Tank', field: 'total_damage_taken', blurb: 'Damage absorbed' },
  { key: 'support', label: 'Support', field: 'total_healing', blurb: 'Ally heals landed' },
  { key: 'adds', label: 'Adds', field: 'total_adds', blurb: 'Add (non-boss) kills' },
  { key: 'clears', label: 'Clears', field: 'clears', blurb: 'Runs where the boss died' },
];

const medalStyles = ['text-gold glow-gold', 'text-silver glow-silver', 'text-bronze glow-bronze'];

// The Pit difficulty dial (1-5). Each level stacks a flat bump; the × columns are
// multipliers on the base, the +% columns are added rare/epic upgrade chance.
// Prod config: damage-per-level 0.00 (mob damage is never scaled), speed-per-level
// 0.10 (cap 1.75), money-per-level 0.75.
const PIT_SCALE = [
  { pit: 1, hp: '2.0×', speed: '1.1×', money: '1.75×', rare: '+10%', epic: '+5%' },
  { pit: 2, hp: '3.0×', speed: '1.2×', money: '2.5×', rare: '+20%', epic: '+10%' },
  { pit: 3, hp: '4.0×', speed: '1.3×', money: '3.25×', rare: '+30%', epic: '+15%' },
  { pit: 4, hp: '5.0×', speed: '1.4×', money: '4.0×', rare: '+40%', epic: '+20%' },
  { pit: 5, hp: '6.0×', speed: '1.5×', money: '4.75×', rare: '+50%', epic: '+25%' },
];

function formatNum(v: number): string {
  return Math.round(v).toLocaleString();
}

function formatMoney(v: number): string {
  return `$${Math.round(v).toLocaleString()}`;
}

function formatAgo(ts: number): string {
  if (!ts) return '';
  const secs = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (secs < 60) return 'just now';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatDuration(ms: number): string {
  if (!ms || ms <= 0) return '';
  const total = Math.round(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export default function BossRushPage() {
  const [snap, setSnap] = useState<EventsSnapshot | null>(null);
  const [activeBoard, setActiveBoard] = useState<string>('score');
  const [expandedRun, setExpandedRun] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/events-snapshot')
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return (await r.json()) as EventsSnapshot;
      })
      .then((json) => {
        if (!cancelled) setSnap(json);
      })
      .catch((e) => {
        if (!cancelled) setError(String(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const available = snap?.available ?? false;
  const summary = snap?.summary ?? null;
  // The recent feed is cross-mode now - keep only Boss Rush runs on this page.
  const recent = (snap?.recent ?? []).filter((r) => r.mode === 'BOSS_RUSH');
  const board = snap?.categories[activeBoard] ?? [];
  const activeMeta = ROLE_BOARDS.find((b) => b.key === activeBoard)!;
  const hasBoards = ROLE_BOARDS.some((b) => (snap?.categories[b.key]?.length ?? 0) > 0);
  // total_runs/total_clears count all modes now (incl. PvP) - prefer the boss_* fields.
  const bossRuns = summary ? summary.boss_runs ?? summary.total_runs : 0;
  const bossClears = summary ? summary.boss_clears ?? summary.total_clears : 0;
  const clearRate = bossRuns > 0 ? bossClears / bossRuns : summary?.clear_rate ?? 0;

  return (
    <div>
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="mb-6">
          <Link href="/events" className="text-sm t-text-muted hover:underline">
            ← Events
          </Link>
        </div>

        <div className="text-center">
          <CloudTitle>
            <h1 className="font-pixel text-gold text-2xl sm:text-3xl mb-3 glow-gold">Boss Rush</h1>
          </CloudTitle>
          <p className="relative z-10 t-text-muted text-sm max-w-xl mx-auto mb-10">
            Six boss raids: waves of adds, then the boss. Five form a difficulty ladder, the sixth is
            the Champion&apos;s duel - plus the Gauntlet, an endless seventh. Damage, tanking, and
            healing are all tracked - every role has a board.
          </p>
        </div>

        {/* Summary banner */}
        {!loading && !error && available && summary && bossRuns > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-12">
            <BannerStat label="Runs" value={bossRuns.toLocaleString()} />
            <BannerStat label="Clears" value={bossClears.toLocaleString()} />
            <BannerStat label="Clear Rate" value={`${Math.round(clearRate * 100)}%`} />
            <BannerStat label="Paid Out" value={formatMoney(summary.total_paid_out)} accent />
            <BannerStat label="Players" value={summary.unique_participants.toLocaleString()} />
            <BannerStat label="Last Run" value={formatAgo(summary.last_run_ts) || '-'} />
          </div>
        )}

        {/* States */}
        {loading && (
          <div className="px-4 py-10 text-center t-text-muted text-sm">Loading…</div>
        )}
        {!loading && error && (
          <div className="px-4 py-10 text-center t-text-muted text-sm">
            Couldn&apos;t reach the event stats. The server may be restarting - try again later.
          </div>
        )}
        {!loading && !error && !available && (
          <div className="mc-panel px-4 py-10 text-center t-text-muted text-sm mb-12">
            Boss Rush isn&apos;t live yet - the boards light up once the first runs land. Check
            back after launch.
          </div>
        )}

        {/* Role leaderboards */}
        {!loading && !error && available && (
          <div className="mb-16">
            <h2 className="font-pixel t-text text-sm mb-4 px-1">Role Boards</h2>

            <div className="flex flex-wrap gap-1.5 mb-2 justify-center relative z-10">
              {ROLE_BOARDS.map((b) => (
                <button
                  key={b.key}
                  onClick={() => setActiveBoard(b.key)}
                  className={`mc-pill ${activeBoard === b.key ? 'mc-pill-active' : ''}`}
                >
                  {b.label}
                </button>
              ))}
            </div>
            <p className="text-center t-text-muted text-[11px] mb-6">{activeMeta.blurb}</p>

            <div className="mc-panel overflow-hidden max-md:overflow-x-auto">
              <div className="max-md:min-w-[320px]">
                <div className="grid grid-cols-[3rem_1fr_auto] gap-4 px-4 py-3 t-border-50 border-b max-md:grid-cols-[2.5rem_1fr_auto] max-md:gap-3 max-md:px-3">
                  <span className="font-pixel t-text-muted text-[10px]">#</span>
                  <span className="font-pixel t-text-muted text-[10px]">Player</span>
                  <span className="font-pixel t-text-muted text-[10px] text-right">{activeMeta.label}</span>
                </div>

                {board.length === 0 ? (
                  <div className="px-4 py-8 text-center t-text-muted text-sm">
                    {hasBoards ? 'No one on this board yet.' : 'No Boss Rush runs yet.'}
                  </div>
                ) : (
                  board.map((p, i) => {
                    const value = p[activeMeta.field] as number;
                    return (
                      <div
                        key={p.uuid ?? p.name}
                        className="grid grid-cols-[3rem_1fr_auto] gap-4 px-4 py-3 t-border-20 border-b transition-colors hover-surface max-md:grid-cols-[2.5rem_1fr_auto] max-md:gap-3 max-md:px-3"
                        style={i < 3 ? { background: 'color-mix(in srgb, var(--c-surface) 30%, transparent)' } : undefined}
                      >
                        <span className={`font-pixel text-xs ${i < 3 ? medalStyles[i] : 't-text-muted'}`}>
                          {i + 1}
                        </span>
                        <Link
                          href={`/player/${encodeURIComponent(p.name)}`}
                          className="flex items-center gap-2.5 min-w-0 hover:underline"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`https://mc-heads.net/avatar/${p.uuid ?? p.name}/24`}
                            alt=""
                            width={24}
                            height={24}
                            loading="lazy"
                            className="w-6 h-6 rounded shrink-0 t-surface-light"
                          />
                          <span className={`text-sm max-md:truncate ${i < 3 ? 't-text font-medium' : 't-text-dim'}`}>
                            {p.name}
                          </span>
                        </Link>
                        <span className={`text-sm text-right whitespace-nowrap ${i === 0 ? 'text-gold font-pixel text-xs' : 't-text-muted'}`}>
                          {formatNum(value)}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* Raid log */}
        {!loading && !error && available && recent.length > 0 && (
          <div className="mb-16">
            <h2 className="font-pixel t-text text-sm mb-4 px-1">Raid Log</h2>
            <div className="mc-panel overflow-hidden">
              {recent.map((run, i) => {
                const boss = bossByRaidKey(run.raid);
                const canExpand = typeof run.id === 'number';
                const expanded = canExpand && expandedRun === run.id;
                const duration = formatDuration(run.duration_ms);
                // The Gauntlet (endless raid) always ends in a "wipe" by design —
                // render it as "reached wave N", never as a failure.
                const isGauntlet = run.raid === 'gauntlet';
                return (
                  <div key={run.id ?? i} className="t-border-20 border-b last:border-b-0">
                    <button
                      type="button"
                      onClick={canExpand ? () => setExpandedRun(expanded ? null : run.id) : undefined}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors ${canExpand ? 'hover-surface' : 'cursor-default'}`}
                      aria-expanded={canExpand ? expanded : undefined}
                    >
                      <span
                        className={`font-pixel text-[10px] px-2 py-1 rounded shrink-0 ${
                          isGauntlet
                            ? 'bg-gold/15 text-gold'
                            : run.cleared
                              ? 'bg-xp/15 text-xp'
                              : 'bg-redstone/15 text-redstone'
                        }`}
                      >
                        {isGauntlet ? `Wave ${run.wave}` : run.cleared ? 'Cleared' : 'Wiped'}
                      </span>
                      {run.difficulty >= 1 && (
                        <span className="font-pixel text-[10px] px-2 py-1 rounded shrink-0 bg-violet-500/15 text-violet-300">
                          Pit {run.difficulty}
                        </span>
                      )}
                      <GearChip mode={run.gear_mode} />
                      <span className="t-text-dim min-w-0 truncate">
                        {isGauntlet ? (
                          <>The Gauntlet</>
                        ) : boss ? (
                          <>
                            <span aria-hidden>{boss.icon}</span> {boss.raid}
                          </>
                        ) : (
                          <>
                            {run.players} {run.players === 1 ? 'player' : 'players'}
                          </>
                        )}
                        {!isGauntlet && <span className="t-text-muted"> · wave {run.wave}</span>}
                        {duration && <span className="t-text-muted max-md:hidden"> · {duration}</span>}
                      </span>
                      {run.mvp && (
                        <span className="t-text-muted text-xs shrink-0 max-md:hidden">★ {run.mvp}</span>
                      )}
                      <span className="t-text-muted text-xs ml-auto whitespace-nowrap shrink-0">
                        {formatAgo(run.ended_at)}
                      </span>
                      {canExpand && (
                        <span className={`t-text-muted text-[10px] shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`} aria-hidden>
                          ▶
                        </span>
                      )}
                    </button>
                    {expanded && <EventRunDetail runId={run.id} />}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent plunder - notable drops across runs (self-hides until data exists) */}
        {!loading && !error && available && <RecentPlunder limit={10} />}

        {/* The Raids */}
        <div>
          <h2 className="font-pixel text-gold text-lg mb-2 px-1 glow-gold">The Raids</h2>
          <p className="t-text-muted text-sm mb-6 px-1">
            Tiers 1–5 climb easiest to hardest; the Champion&apos;s duel is the sixth rung of the key
            ladder. Tap a raid for its boss, abilities, and full loot table.
          </p>

          {/* Raid tiles → detail pages */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-10">
            {bosses.map((boss) => (
              <RaidTile key={boss.id} boss={boss} />
            ))}
          </div>

          {/* Shared mechanics - every boss runs the same skeleton */}
          <div className="mc-panel p-5 mb-4">
            <h3 className="font-pixel t-text-dim text-xs mb-3">Every fight, same bones</h3>
            <p className="t-text-muted text-sm mb-4 leading-snug">
              Each boss has three HP phases - <span className="t-text-dim">100% → 60% → 30%</span>{' '}-
              and its kit escalates as it drops. On top of its signature moves, every boss shares:
            </p>
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5 text-xs">
              {SHARED_MECHANICS.map((m) => (
                <MechanicRow key={m.name} name={m.name} desc={m.desc} />
              ))}
            </div>
          </div>

          {/* The Pit - admin difficulty dial (1-5) */}
          <div className="mc-panel p-5 mb-4 border-l-2 border-violet-400/50">
            <div className="flex items-baseline justify-between gap-2 mb-1 flex-wrap">
              <h3 className="font-pixel text-violet-300 text-xs">The Pit</h3>
              <span className="font-pixel text-violet-400/80 text-[10px]">levels 1–5</span>
            </div>
            <p className="t-text-muted text-[11px] mb-4 leading-snug">
              Staff can crank a raid into the Pit, or pick it yourself with{' '}
              <code className="text-violet-300">/event key start &lt;raid&gt; [pit]</code>. Each level
              stacks the same bump - tougher, faster mobs, bigger pay, better loot. Runs log their Pit level; you&apos;ll see a purple{' '}
              <span className="text-violet-300">Pit N</span>{' '}chip on each one in the raid log.
            </p>
            <div className="overflow-x-auto mb-2">
              <table className="w-full text-[11px] border-collapse min-w-[20rem]">
                <thead>
                  <tr className="t-text-muted">
                    <th className="font-pixel text-[10px] text-left py-1.5 pr-3">Pit</th>
                    <th className="font-pixel text-[10px] text-right py-1.5 px-2">Mob HP</th>
                    <th className="font-pixel text-[10px] text-right py-1.5 px-2">Speed</th>
                    <th className="font-pixel text-[10px] text-right py-1.5 px-2">Money</th>
                    <th className="font-pixel text-[10px] text-right py-1.5 px-2">Rare</th>
                    <th className="font-pixel text-[10px] text-right py-1.5 pl-2">Epic</th>
                  </tr>
                </thead>
                <tbody>
                  {PIT_SCALE.map((r) => (
                    <tr key={r.pit} className="t-border-20 border-t">
                      <td className="py-1.5 pr-3 font-pixel text-[10px] text-violet-300">Pit {r.pit}</td>
                      <td className="py-1.5 px-2 text-right t-text-dim">{r.hp}</td>
                      <td className="py-1.5 px-2 text-right t-text-dim">{r.speed}</td>
                      <td className="py-1.5 px-2 text-right text-gold">{r.money}</td>
                      <td className="py-1.5 px-2 text-right t-text-muted">{r.rare}</td>
                      <td className="py-1.5 pl-2 text-right t-text-muted">{r.epic}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="t-text-muted text-[10px] mb-4">
              × columns multiply the base; +% columns add to the rare / epic upgrade chance. Mob
              damage isn&apos;t scaled - the Pit gets harder through HP and speed.
            </p>
            <p className="t-text-muted text-[11px] leading-snug pt-3 t-border-20 border-t">
              At <span className="text-fuchsia-300 font-medium">Pit 1+</span>, won epic rolls come back{' '}
              <span className="text-fuchsia-300">Pitforged</span>{' '}- above-vanilla-cap gear
              (Protection 5, Sharpness 6, Power 6…) you can&apos;t get anywhere else.
            </p>
          </div>

          {/* Raid Keys - player-started runs (server-side only; no keys API yet) */}
          <div className="mc-panel p-5 mb-4 border-l-2 border-gold/50">
            <div className="flex items-baseline justify-between gap-2 mb-1 flex-wrap">
              <h3 className="font-pixel text-gold text-xs">⚷ Raid Keys</h3>
              <span className="font-pixel text-gold/80 text-[10px]">start your own raids</span>
            </div>
            <p className="t-text-muted text-[11px] mb-3 leading-snug">
              Don&apos;t wait for an admin - every player carries a <span className="text-gold">Raid
              Key</span>. Type <code className="text-gold">/event key</code> in game to open your key
              board. Clear the six raids in order to climb; clear all six at a level and the next Pit
              unlocks, all the way to Pit 5.
            </p>
            <p className="t-text-muted text-[11px] mb-3 leading-snug">
              Starting a run costs money - <span className="t-text-dim">$150 × (Pit + 1)</span>, sunk
              win or lose, 3 starts a day, 15-minute cooldown between starts. Wipe a run you started at
              your key&apos;s level and your key <span className="text-redstone">depletes</span> one Pit
              until you win one back - only the starter&apos;s key is on the line. Joining someone
              else&apos;s run is always free, and everyone who fights in a clear gets credit at their
              own level.
            </p>
            <p className="t-text-muted text-[11px] mb-3 leading-snug">
              A key run needs <span className="t-text-dim">3 fighters</span> in the lobby to launch -
              spectators and disconnected slots don&apos;t count. If fewer than 3 contributors finish,
              the pool and category money scale down to fighters/3.
            </p>
            <p className="t-text-muted text-[11px] leading-snug">
              Key runs pay out less than admin events (money ×0.35, loot rolls unchanged), and only{' '}
              <span className="t-text-dim">2 key clears a day pay money</span> - counted per player
              and per connection; clears after that roll loot only. Money goes only to raiders who
              contributed (dealt or took damage, killed an add, or healed), and like any raid, a wipe
              pays nothing. Watch chat for the ⚷ broadcast when someone opens a run.
            </p>
          </div>

          {/* The Gauntlet - endless 7th raid (config: boss-rush.raids.gauntlet) */}
          <div className="mc-panel p-5 mb-4 border-l-2 border-gold/50">
            <div className="flex items-baseline justify-between gap-2 mb-1 flex-wrap">
              <h3 className="font-pixel text-gold text-xs">The Gauntlet</h3>
              <span className="font-pixel text-gold/80 text-[10px]">endless · raid 7</span>
            </div>
            <p className="t-text-muted text-[11px] mb-3 leading-snug">
              No boss at the end - it just keeps going. Every wave compounds on the last (mob HP{' '}
              <span className="t-text-dim">+6%</span>, damage <span className="t-text-dim">+3%</span>,
              mob count <span className="t-text-dim">+4%</span>, capped at 45), and a boss drops in
              every <span className="t-text-dim">5 waves</span>{' '}at 0.6× HP. Every 10 waves the whole
              server hears about it.
            </p>
            <p className="t-text-muted text-[11px] leading-snug">
              Money banks as you go: <span className="t-text-dim">$100</span>{' '}participation, plus{' '}
              <span className="t-text-dim">$75 + $25 × (wave − 1)</span>{' '}for each wave cleared,
              Pit-multiplied. The run always ends in a wipe, but a wipe doesn&apos;t zero what
              you&apos;ve banked - the raid log shows how far you got.
            </p>
          </div>

          {/* How loot drops */}
          <div className="mc-panel p-5 mb-4">
            <h3 className="font-pixel t-text-dim text-xs mb-1">How loot drops</h3>
            <p className="t-text-muted text-[11px] mb-4">
              It&apos;s clear or nothing: <span className="t-text-dim">a wiped raid pays no money and
              drops no loot</span> - no participation floor, no bonuses. Even on a clear nothing is
              guaranteed: it can drop zero epics or a fistful.
            </p>
            <div className="space-y-2.5 text-sm">
              <div className="flex gap-2.5">
                <span className="font-pixel text-[9px] px-1.5 py-0.5 rounded shrink-0 h-fit min-w-[7rem] text-center whitespace-nowrap" style={tierChip(lootTier.pitforged.color)}>PITFORGED</span>
                <span className="t-text-muted leading-snug">
                  At <span className="t-text-dim">Pit 1+</span>, won epic rolls come back Pitforged - above-cap gear instead of the normal epic.
                </span>
              </div>
              <div className="flex gap-2.5">
                <span className="font-pixel text-[9px] px-1.5 py-0.5 rounded shrink-0 h-fit min-w-[7rem] text-center whitespace-nowrap" style={tierChip(lootTier.epic.color)}>EPIC</span>
                <span className="t-text-muted leading-snug">
                  Every scorer <span className="t-text-dim">rolls</span>{' '}for one - top-3 at <span className="t-text-dim">35%</span>, everyone else at <span className="t-text-dim">15%</span>{' '}(+5%/Pit). No guarantees.
                </span>
              </div>
              <div className="flex gap-2.5">
                <span className="font-pixel text-[9px] px-1.5 py-0.5 rounded shrink-0 h-fit min-w-[7rem] text-center whitespace-nowrap" style={tierChip(lootTier.rare.color)}>RARE</span>
                <span className="t-text-muted leading-snug">
                  Every common roll has a <span className="t-text-dim">35% chance</span>{' '}(+10%/Pit) to upgrade to rare - announced to the lobby.
                </span>
              </div>
              <div className="flex gap-2.5">
                <span className="font-pixel text-[9px] px-1.5 py-0.5 rounded shrink-0 h-fit min-w-[7rem] text-center whitespace-nowrap" style={tierChip(lootTier.common.color)}>COMMON</span>
                <span className="t-text-muted leading-snug">
                  <span className="t-text-dim">Everyone</span> who clears rolls one (unless it upgraded).
                </span>
              </div>
            </div>
          </div>

          {/* Payouts & awards */}
          <div className="mc-panel p-5">
            <h3 className="font-pixel t-text-dim text-xs mb-1">Payouts &amp; awards</h3>
            <p className="t-text-muted text-[11px] mb-4">
              Flat across every raid - the Pit scales them up (+75%/level), and only the loot tables
              scale with difficulty otherwise. <span className="t-text-dim">All of it pays only on a
              clear - a wiped raid pays nothing.</span>
            </p>
            <div className="space-y-3 text-sm">
              <PayoutRow amount="$250 + 3 emeralds" label="Participation" who="everyone who joins and stays" />
              <PayoutRow amount="$5,000 pool" label="Performance" who="split by weighted score among everyone above the minimum" />
              <PayoutRow amount="$1,000" label="Clear bonus" who="everyone, if the boss dies" />
              <PayoutRow amount="$750 each" label="Category bonus" who="Top Damage · Best Tank · Best Support · Most Adds · Survivor" />
            </div>
            <div className="mt-4 pt-4 t-border-20 border-t">
              <p className="font-pixel t-text-muted text-[10px] mb-2">Score weights</p>
              <p className="t-text-muted text-xs leading-relaxed">
                Damage ×1.0 · Damage taken ×0.8 (tank) · Heals ×12 · Add kills ×6 ·
                <span className="text-xp"> +200 survival</span> ·
                <span className="text-redstone"> −120 per death</span>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function RaidTile({ boss }: { boss: Boss }) {
  const a = accentFor(boss.accent);
  return (
    <Link
      href={`/events/boss-rush/${boss.id}`}
      className={`mc-panel p-4 border-l-2 ${a.border} hover-surface transition-colors flex flex-col group`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className={`font-pixel text-[9px] px-1.5 py-0.5 rounded ${a.chip}`}>
          {tierLabel(boss)}
        </span>
        <span className="text-2xl leading-none shrink-0" aria-hidden>
          {boss.icon}
        </span>
      </div>
      <h3 className={`${a.text} text-sm font-semibold leading-snug mb-1`}>{boss.name}</h3>
      <p className="t-text-muted text-[11px] mb-4">
        {boss.raid} · {boss.mob}
      </p>
      <span className="text-[11px] t-text-muted group-hover:t-text-dim mt-auto">
        View abilities &amp; loot →
      </span>
    </Link>
  );
}

function MechanicRow({ name, desc }: { name: string; desc: string }) {
  return (
    <div className="flex gap-2">
      <span className="font-pixel text-[10px] px-1.5 py-0.5 rounded shrink-0 h-fit t-surface-light t-text-dim">
        {name}
      </span>
      <span className="t-text-muted leading-snug">{desc}</span>
    </div>
  );
}

function PayoutRow({ amount, label, who }: { amount: string; label: string; who: string }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
      <span className="text-gold font-pixel text-xs shrink-0 w-36 max-md:w-full">{amount}</span>
      <span className="t-text-dim">{label}</span>
      <span className="t-text-muted text-xs">- {who}</span>
    </div>
  );
}

function BannerStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="mc-panel p-4 text-center">
      <p className={`text-xl font-medium leading-none ${accent ? 'text-gold glow-gold font-pixel text-lg' : 't-text'}`}>
        {value}
      </p>
      <p className="font-pixel t-text-muted text-[10px] mt-2">{label}</p>
    </div>
  );
}
