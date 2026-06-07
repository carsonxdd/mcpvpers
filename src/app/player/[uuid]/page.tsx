'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import CloudTitle from '@/components/CloudTitle';
import { bossByRaidKey, lootTier } from '@/lib/bossDisplay';

type Advancement = {
  key: string;
  title: string;
  description: string;
  frame: 'task' | 'goal' | 'challenge';
  icon: string;
  done: boolean;
};

type Category = {
  key: string;
  label: string;
  completed: number;
  total: number;
  advancements: Advancement[];
};

type AdvancementsResponse = {
  uuid: string;
  name: string;
  completed: number;
  total: number;
  categories: Category[];
};

type SkillEntry = {
  skill: string; // mcMMO enum name, e.g. "MINING"
  level: number;
  xp: number;
  xp_to_next: number;
  child: boolean;
};

type SkillsResponse = {
  uuid: string;
  name: string;
  power_level: number;
  skills: SkillEntry[];
};

type StatEntry = {
  key: string;
  label: string;
  value: number;
  rank: number | null;
  total: number;
};

type Reputation = {
  name: string;
  state: string;
  outlaw_rep: number;
  peaceful_rep: number;
  violence_rep: number;
  unique_commenders_90d: number;
  play_seconds: number;
  last_seen_ts: number;
  outlaw_tier: string;
};

type EventRecentRun = {
  id: number;
  raid: string | null;
  cleared: boolean;
  wave: number;
  difficulty: number;
  duration_ms: number;
  score: number;
  damage: number;
  money: number;
  ended_at: number;
};

type EventPlayer = {
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
  best_pit: number;
  pit_clears: number;
  recent_payouts?: { money: number; reason: string; at: number }[];
  recent_runs?: EventRecentRun[];
  recent_loot?: { item: string; tier: string; at: number }[];
};

type PvpPlayer = {
  uuid: string;
  name: string;
  matches: number;
  wins: number;
  kills: number;
  deaths: number;
  kd: number;
  total_money: number;
  best_killstreak: number;
  mvps: number;
  recent_matches?: {
    id: number;
    mode: string;
    decided: boolean;
    winner: string | null;
    mvp: string | null;
    team: string | null;
    kills: number;
    deaths: number;
    money: number;
    duration_ms: number;
    ended_at: number;
  }[];
};

type ProfileResponse = {
  uuid: string | null;
  name: string | null;
  online: boolean;
  found: boolean;
  stats: StatEntry[];
  reputation: Reputation | null;
  // skill enum (e.g. "MINING") or "POWER_LEVEL" -> server rank within the roster
  skillRanks: Record<string, { rank: number; total: number }>;
  // Boss Rush (PiEvents) — null when PiEvents isn't live or the player never joined a run
  events: EventPlayer | null;
  // role board key (score|damage|boss_damage|tank|support|adds|clears) -> server rank
  eventRanks: Record<string, { rank: number; total: number }>;
  // PvP (TDM/FFA) — null until PvP ships / the player has fought a match
  pvp: PvpPlayer | null;
};

function formatPlaytime(seconds: number): string {
  const totalMinutes = Math.floor(seconds / 60);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes - days * 60 * 24) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  const minutes = totalMinutes - hours * 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatDistance(cm: number): string {
  if (cm <= 0) return '0 m';
  const km = cm / 100000;
  if (km >= 1) return `${km.toFixed(1)} km`;
  return `${Math.round(cm / 100).toLocaleString()} m`;
}

function formatStat(key: string, value: number): string {
  if (key === 'playtime') return formatPlaytime(value);
  if (key === 'distance') return formatDistance(value);
  return value.toLocaleString();
}

function formatLastSeen(ts: number, online: boolean): string {
  if (online) return 'Online now';
  const mins = Math.max(0, Math.floor((Date.now() - ts) / 60000));
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// Frame → accent styling for earned tiles. Mirrors the in-game frame colors.
const frameDone: Record<Advancement['frame'], string> = {
  task: 'border-emerald-500/60 bg-emerald-500/15',
  goal: 'border-emerald-400/60 bg-emerald-400/15',
  challenge: 'border-fuchsia-500/60 bg-fuchsia-500/15',
};

// mcMMO skill display. Order within a group = display order. Includes the newer
// combat skills (Crossbows/Maces/Tridents/Spears) the /mcmmo guide doesn't list yet.
const SKILL_LABELS: Record<string, string> = {
  MINING: 'Mining', WOODCUTTING: 'Woodcutting', EXCAVATION: 'Excavation',
  HERBALISM: 'Herbalism', FISHING: 'Fishing',
  SWORDS: 'Swords', AXES: 'Axes', UNARMED: 'Unarmed', ARCHERY: 'Archery',
  CROSSBOWS: 'Crossbows', MACES: 'Maces', TRIDENTS: 'Tridents', SPEARS: 'Spears',
  TAMING: 'Taming',
  ACROBATICS: 'Acrobatics', ALCHEMY: 'Alchemy', REPAIR: 'Repair',
  SMELTING: 'Smelting', SALVAGE: 'Salvage',
};

const SKILL_GROUPS: { name: string; skills: string[] }[] = [
  { name: 'Gathering', skills: ['MINING', 'WOODCUTTING', 'EXCAVATION', 'HERBALISM', 'FISHING'] },
  { name: 'Combat', skills: ['SWORDS', 'AXES', 'UNARMED', 'ARCHERY', 'CROSSBOWS', 'MACES', 'TRIDENTS', 'SPEARS', 'TAMING'] },
  { name: 'Crafting & Utility', skills: ['ACROBATICS', 'ALCHEMY', 'REPAIR', 'SMELTING', 'SALVAGE'] },
];

const tierClass: Record<string, string> = {
  Drifter: 'tier-drifter',
  Bandit: 'tier-bandit',
  Outlaw: 'tier-outlaw',
  Notorious: 'tier-notorious',
  Legend: 'tier-legend tier-legend-glow',
};

// State → headline badge. Outlaws carry their tier color; pacifists read calm
// green; anyone wearing the badge (lawman ladder) reads gold.
function stateBadge(rep: Reputation): { label: string; className: string } {
  const state = rep.state?.toUpperCase() ?? '';
  if (state === 'OUTLAW') {
    return {
      label: rep.outlaw_tier && rep.outlaw_tier !== 'None' ? rep.outlaw_tier : 'Outlaw',
      className: tierClass[rep.outlaw_tier] ?? 'tier-outlaw',
    };
  }
  if (state === 'PACIFIST') return { label: 'Pacifist', className: 'text-xp glow-xp' };
  if (!state) return { label: 'Unknown', className: 't-text-muted' };
  // Lawman ladder (Citizen / Deputy / Sheriff / Senior Sheriff / Marshal).
  const label = state
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return { label, className: 'text-gold glow-gold' };
}

export default function PlayerPage() {
  const params = useParams<{ uuid: string }>();
  const uuid = params.uuid;

  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [adv, setAdv] = useState<AdvancementsResponse | null>(null);
  const [skills, setSkills] = useState<SkillsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // No synchronous setLoading/setError reset here: the page is only ever
    // mounted fresh from a leaderboard row (no player→player navigation), so the
    // initial state (loading: true, error: null) already covers this mount's
    // fetches. Resetting in-effect trips react-hooks/set-state-in-effect.
    let cancelled = false;

    fetch(`/api/player-profile/${uuid}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return (await r.json()) as ProfileResponse;
      })
      .then((profileData) => {
        if (cancelled) return;
        setProfile(profileData);
        // Advancements are keyed off the CANONICAL uuid — the route param may be
        // a username, and the upstream advancements endpoint is uuid-only (a name
        // returns empty data). Best-effort: the stats profile renders without it.
        const canonical = profileData.uuid;
        if (canonical) {
          fetch(`/api/stats/players/${canonical}/advancements`)
            .then((r) => (r.ok ? (r.json() as Promise<AdvancementsResponse>) : null))
            .then((advData) => {
              if (!cancelled) setAdv(advData);
            })
            .catch(() => {});
          fetch(`/api/stats/players/${canonical}/skills`)
            .then((r) => (r.ok ? (r.json() as Promise<SkillsResponse>) : null))
            .then((skillData) => {
              if (!cancelled) setSkills(skillData);
            })
            .catch(() => {});
        }
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
  }, [uuid]);

  const name = profile?.name ?? adv?.name ?? 'Player';
  const rep = profile?.reputation ?? null;
  const badge = rep ? stateBadge(rep) : null;
  const advPct = adv && adv.total > 0 ? Math.round((adv.completed / adv.total) * 100) : 0;
  // Prefer the canonical uuid (route param may be a username); mc-heads accepts
  // either, but the resolved uuid is the stable identifier.
  const headId = profile?.uuid ?? uuid;
  const notFound = !loading && !error && profile != null && !profile.found;

  return (
    <div>
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="mb-6">
          <Link href="/leaderboards" className="text-sm t-text-muted hover:underline">
            ← Leaderboards
          </Link>
        </div>

        {/* Header */}
        <div className="mc-panel p-6 mb-8 flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://mc-heads.net/avatar/${headId}/64`}
            alt=""
            width={64}
            height={64}
            className="w-16 h-16 rounded t-surface-light shrink-0"
          />
          <div className="min-w-0">
            <CloudTitle className="ml-10 w-fit max-md:ml-0 max-md:max-w-[60vw]" cloudOffsetX={10} cloudOffsetY={12}>
              <h1 className="font-pixel text-gold text-xl sm:text-2xl max-md:text-base glow-gold whitespace-nowrap max-md:whitespace-normal max-md:break-all">
                {name}
              </h1>
            </CloudTitle>
            {/* relative z-10 lifts this line above the CloudTitle's cloud SVG,
                which is offset downward and would otherwise paint over it. */}
            <div className="relative z-10 flex flex-wrap items-center gap-x-2 gap-y-1 mt-2 text-sm">
              {badge && (
                <span className={`font-pixel text-[10px] ${badge.className}`}>{badge.label}</span>
              )}
              {profile?.online ? (
                <>
                  {badge && <span className="t-text-muted text-xs">·</span>}
                  <span className="text-emerald-400 text-xs flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online
                  </span>
                </>
              ) : (
                rep && (
                  <>
                    {badge && <span className="t-text-muted text-xs">·</span>}
                    <span className="t-text-muted text-xs">
                      Seen {formatLastSeen(rep.last_seen_ts, false)}
                    </span>
                  </>
                )
              )}
            </div>
          </div>
        </div>

        {loading && <ProfileSkeleton />}
        {!loading && error && (
          <div className="px-4 py-8 text-center t-text-muted text-sm">
            Couldn&apos;t load this player. The server may be restarting — try again later.
          </div>
        )}
        {notFound && (
          <div className="px-4 py-8 text-center t-text-muted text-sm">
            No player by that name yet — check the spelling, or find them on the{' '}
            <Link href="/leaderboards" className="hover:underline t-text-dim">leaderboards</Link>.
          </div>
        )}

        {!loading && !error && profile && profile.found && (
          <>
            {/* Stats grid */}
            <div className="mb-8">
              <h2 className="font-pixel t-text text-sm mb-3 px-1">Stats</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {profile.stats.map((s) => (
                  <StatCard key={s.key} stat={s} />
                ))}
              </div>
            </div>

            {/* Reputation */}
            {rep && (
              <div className="mb-8">
                <h2 className="font-pixel t-text text-sm mb-3 px-1">Reputation</h2>
                <div className="mc-panel p-5">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <RepPool label="Peaceful" value={rep.peaceful_rep} className="text-xp" />
                    <RepPool label="Violence" value={rep.violence_rep} className="text-gold" />
                    <RepPool label="Outlaw" value={rep.outlaw_rep} className="text-redstone" />
                  </div>
                  {badge && (
                    <div className="mt-4 pt-4 t-border-20 border-t flex flex-wrap justify-center gap-x-5 gap-y-1.5 text-xs t-text-muted">
                      <span>
                        State: <span className={badge.className}>{badge.label}</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* mcMMO Skills */}
            {skills && skills.skills.length > 0 && (
              <SkillsPanel data={skills} ranks={profile?.skillRanks ?? {}} />
            )}

            {/* Boss Rush (PiEvents) — only for players who've actually joined a run */}
            {profile.events && profile.events.events > 0 && (
              <BossRushPanel data={profile.events} ranks={profile.eventRanks ?? {}} />
            )}

            {/* PvP Arena (PiEvents) — only for players who've fought a match */}
            {profile.pvp && profile.pvp.matches > 0 && (
              <PvpPanel data={profile.pvp} />
            )}

            {/* Advancements */}
            {adv && (
              <div>
                <div className="flex items-baseline justify-between mb-3 px-1">
                  <h2 className="font-pixel t-text text-sm">Advancements</h2>
                  <span className="font-pixel t-text-muted text-[10px]">
                    {adv.completed}/{adv.total} · {advPct}%
                  </span>
                </div>
                {adv.categories.map((cat) => (
                  <div key={cat.key} className="mb-8">
                    <div className="flex items-baseline justify-between mb-3 px-1">
                      <h3 className="font-pixel t-text-dim text-xs">{cat.label}</h3>
                      <span className="font-pixel t-text-muted text-[10px]">
                        {cat.completed}/{cat.total}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {cat.advancements.map((a) => (
                        <div
                          key={a.key}
                          title={a.description}
                          className={`rounded border p-2.5 transition-colors ${
                            a.done
                              ? frameDone[a.frame]
                              : 't-surface-light t-border-30 opacity-80 hover:opacity-100'
                          }`}
                        >
                          <div className="flex items-start gap-1.5">
                            <span
                              className={`text-xs leading-tight ${a.done ? 't-text' : 't-text-dim'}`}
                            >
                              {a.done ? '✓ ' : ''}
                              {a.title}
                            </span>
                            {a.frame === 'challenge' && (
                              <span className="text-[9px] text-fuchsia-400 font-pixel shrink-0 ml-auto">
                                ★
                              </span>
                            )}
                          </div>
                          <p className="t-text-muted text-[10px] mt-1 leading-snug line-clamp-2">
                            {a.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

// Loading placeholder — mirrors the real stats grid + reputation layout so the
// page doesn't jump when data lands.
function ProfileSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-8">
        <div className="h-3 w-16 rounded t-surface-light mb-3 ml-1" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="mc-panel p-4">
              <div className="h-2.5 w-16 rounded t-surface-light mb-3" />
              <div className="h-5 w-20 rounded t-surface-light" />
              <div className="h-2.5 w-12 rounded t-surface-light mt-3" />
            </div>
          ))}
        </div>
      </div>
      <div className="mb-8">
        <div className="h-3 w-24 rounded t-surface-light mb-3 ml-1" />
        <div className="mc-panel p-5 grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="h-5 w-12 rounded t-surface-light" />
              <div className="h-2.5 w-14 rounded t-surface-light" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ stat }: { stat: StatEntry }) {
  return (
    <div className="mc-panel p-4">
      <p className="font-pixel t-text-muted text-[10px] mb-1.5">{stat.label}</p>
      <p className="t-text text-lg font-medium leading-none">{formatStat(stat.key, stat.value)}</p>
      {stat.rank != null && stat.total > 0 && (
        <p
          className={`text-xs mt-2 ${
            stat.rank === 1 ? 'text-gold glow-gold font-pixel' : 't-text-muted'
          }`}
        >
          {stat.rank === 1 ? '★ #1' : `#${stat.rank}`}
          <span className="t-text-muted"> of {stat.total}</span>
        </p>
      )}
    </div>
  );
}

// Shared "#3 of 32" rank label — gold ★ #1 styling matches StatCard.
function RankLabel({ rank, total, className = '' }: { rank: number; total: number; className?: string }) {
  return (
    <span className={`${rank === 1 ? 'text-gold glow-gold font-pixel' : 't-text-muted'} ${className}`}>
      {rank === 1 ? '★ #1' : `#${rank}`}
      <span className="t-text-muted"> of {total}</span>
    </span>
  );
}

function SkillsPanel({
  data,
  ranks,
}: {
  data: SkillsResponse;
  ranks: Record<string, { rank: number; total: number }>;
}) {
  const byName = new Map(data.skills.map((s) => [s.skill, s]));
  const power = ranks.POWER_LEVEL;
  return (
    <div className="mb-8">
      <div className="flex items-baseline justify-between mb-3 px-1">
        <h2 className="font-pixel t-text text-sm">mcMMO Skills</h2>
        <span className="flex items-baseline gap-2">
          {power && data.power_level > 0 && (
            <RankLabel rank={power.rank} total={power.total} className="text-[10px]" />
          )}
          <span className="font-pixel text-gold glow-gold text-sm">
            Power {data.power_level.toLocaleString()}
          </span>
        </span>
      </div>
      {SKILL_GROUPS.map((group) => {
        const entries = group.skills
          .map((key) => byName.get(key))
          .filter((s): s is SkillEntry => s != null && SKILL_LABELS[s.skill] != null);
        if (entries.length === 0) return null;
        return (
          <div key={group.name} className="mb-6">
            <h3 className="font-pixel t-text-dim text-xs mb-3 px-1">{group.name}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {entries.map((s) => (
                <SkillTile key={s.skill} skill={s} rank={ranks[s.skill]} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SkillTile({ skill, rank }: { skill: SkillEntry; rank?: { rank: number; total: number } }) {
  const pct = skill.xp_to_next > 0 ? Math.min(100, Math.round((skill.xp / skill.xp_to_next) * 100)) : 0;
  return (
    <div className="mc-panel p-3">
      <div className="flex items-baseline justify-between">
        <span className="t-text text-sm">
          {SKILL_LABELS[skill.skill]}
          {skill.child && <span className="t-text-muted text-[10px] ml-1">(child)</span>}
        </span>
        <span className="font-pixel text-xs t-text-dim">{skill.level}</span>
      </div>
      {/* Rank only on skills the player has actually trained (level > 0) */}
      {rank && skill.level > 0 && (
        <p className="text-[10px] mt-1.5">
          <RankLabel rank={rank.rank} total={rank.total} />
        </p>
      )}
      {/* XP-to-next bar; child skills have no XP track of their own */}
      {!skill.child && (
        <div className="mt-2 h-1.5 rounded-full t-border-20 border overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{ width: `${pct}%`, background: 'var(--color-xp)' }}
          />
        </div>
      )}
    </div>
  );
}

// Boss Rush role stats. `board` is the events role board the rank comes from.
const EVENT_FIELDS: { field: keyof EventPlayer; label: string; board: string }[] = [
  { field: 'total_score', label: 'Score', board: 'score' },
  { field: 'total_damage', label: 'Damage', board: 'damage' },
  { field: 'total_boss_damage', label: 'Boss Damage', board: 'boss_damage' },
  { field: 'total_damage_taken', label: 'Damage Taken', board: 'tank' },
  { field: 'total_healing', label: 'Healing', board: 'support' },
  { field: 'total_adds', label: 'Adds', board: 'adds' },
];

function eventTimeAgo(ts: number): string {
  if (!ts) return '';
  const secs = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (secs < 60) return 'just now';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function BossRushPanel({
  data,
  ranks,
}: {
  data: EventPlayer;
  ranks: Record<string, { rank: number; total: number }>;
}) {
  return (
    <div className="mb-8">
      <div className="flex items-baseline justify-between mb-3 px-1 gap-2 flex-wrap">
        <h2 className="font-pixel t-text text-sm">Boss Rush</h2>
        <span className="font-pixel t-text-muted text-[10px] flex items-center gap-2">
          {data.best_pit >= 1 && (
            <span className="px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-300">Pit {data.best_pit}</span>
          )}
          <span>
            {data.events} {data.events === 1 ? 'run' : 'runs'} · {data.clears} cleared
            {data.best_score > 0 && (
              <span className="text-gold"> · best {Math.round(data.best_score).toLocaleString()}</span>
            )}
          </span>
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {EVENT_FIELDS.map((f) => {
          const value = data[f.field] as number;
          const rank = ranks[f.board];
          return (
            <div key={f.field} className="mc-panel p-4">
              <p className="font-pixel t-text-muted text-[10px] mb-1.5">{f.label}</p>
              <p className="t-text text-lg font-medium leading-none">
                {Math.round(value).toLocaleString()}
              </p>
              {rank && (
                <p className="text-xs mt-2">
                  <RankLabel rank={rank.rank} total={rank.total} />
                </p>
              )}
            </div>
          );
        })}
      </div>
      {/* Survival + earnings footer */}
      <div className="mc-panel p-4 mt-3 flex flex-wrap justify-center gap-x-6 gap-y-1.5 text-xs t-text-muted">
        <span>Survivals: <span className="t-text-dim">{data.survivals}</span></span>
        <span>Lives lost: <span className="t-text-dim">{data.total_lives_lost}</span></span>
        {data.pit_clears > 0 && (
          <span>Pit clears: <span className="text-violet-300">{data.pit_clears}</span></span>
        )}
        <span>Earned: <span className="text-gold">${Math.round(data.total_money).toLocaleString()}</span></span>
      </div>

      {/* Recent runs (1.5.0+; empty on older data) */}
      {data.recent_runs && data.recent_runs.length > 0 && (
        <div className="mc-panel mt-3 overflow-hidden">
          <p className="font-pixel t-text-muted text-[10px] px-4 pt-3 pb-1">Recent runs</p>
          {data.recent_runs.map((r) => {
            const boss = bossByRaidKey(r.raid);
            return (
              <div key={r.id} className="flex items-center gap-2.5 px-4 py-2 text-xs t-border-20 border-t">
                <span className={r.cleared ? 'text-xp' : 'text-redstone'}>{r.cleared ? '✓' : '✗'}</span>
                <span className="t-text-dim min-w-0 truncate">
                  {boss ? (
                    <>
                      <span aria-hidden>{boss.icon}</span> {boss.raid}
                    </>
                  ) : (
                    'Boss Rush'
                  )}
                  {r.difficulty >= 1 && <span className="text-violet-300"> · Pit {r.difficulty}</span>}
                </span>
                <span className="t-text-muted ml-auto shrink-0">{Math.round(r.score).toLocaleString()}</span>
                <span className="text-gold shrink-0 whitespace-nowrap">${Math.round(r.money).toLocaleString()}</span>
                <span className="t-text-muted shrink-0 whitespace-nowrap max-md:hidden">{eventTimeAgo(r.ended_at)}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Recent loot (tier-colored) */}
      {data.recent_loot && data.recent_loot.length > 0 && (
        <div className="mc-panel mt-3 p-4">
          <p className="font-pixel t-text-muted text-[10px] mb-2">Recent loot</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
            {data.recent_loot.map((d, i) => (
              <span key={i} style={{ color: lootTier[d.tier]?.color }} className="whitespace-nowrap">
                {d.item}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PvpPanel({ data }: { data: PvpPlayer }) {
  const losses = Math.max(0, data.matches - data.wins);
  return (
    <div className="mb-8">
      <div className="flex items-baseline justify-between mb-3 px-1">
        <h2 className="font-pixel t-text text-sm">PvP Arena</h2>
        <span className="font-pixel t-text-muted text-[10px]">
          {data.matches} {data.matches === 1 ? 'match' : 'matches'} · {data.wins}W-{losses}L
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <PvpTile label="Kills" value={data.kills.toLocaleString()} />
        <PvpTile label="K/D" value={data.kd.toFixed(2)} />
        <PvpTile label="Best Streak" value={data.best_killstreak.toLocaleString()} />
        <PvpTile label="MVPs" value={data.mvps.toLocaleString()} accent />
      </div>
      <div className="mc-panel p-4 mt-3 flex flex-wrap justify-center gap-x-6 gap-y-1.5 text-xs t-text-muted">
        <span>Deaths: <span className="t-text-dim">{data.deaths}</span></span>
        <span>Earned: <span className="text-gold">${Math.round(data.total_money).toLocaleString()}</span></span>
      </div>

      {data.recent_matches && data.recent_matches.length > 0 && (
        <div className="mc-panel mt-3 overflow-hidden">
          <p className="font-pixel t-text-muted text-[10px] px-4 pt-3 pb-1">Recent matches</p>
          {data.recent_matches.map((m) => {
            const result = !m.decided
              ? 'draw'
              : m.winner && (m.winner === m.team || m.winner === data.name)
                ? 'win'
                : 'loss';
            return (
              <div key={m.id} className="flex items-center gap-2.5 px-4 py-2 text-xs t-border-20 border-t">
                <span className={result === 'win' ? 'text-xp' : result === 'loss' ? 'text-redstone' : 't-text-muted'}>
                  {result === 'win' ? 'W' : result === 'loss' ? 'L' : 'D'}
                </span>
                <span className="t-text-dim">{m.mode}</span>
                <span className="t-text-muted">{m.kills}/{m.deaths}</span>
                <span className="text-gold ml-auto shrink-0 whitespace-nowrap">${Math.round(m.money).toLocaleString()}</span>
                <span className="t-text-muted shrink-0 whitespace-nowrap max-md:hidden">{eventTimeAgo(m.ended_at)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PvpTile({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="mc-panel p-4">
      <p className="font-pixel t-text-muted text-[10px] mb-1.5">{label}</p>
      <p className={`text-lg font-medium leading-none ${accent ? 'text-gold' : 't-text'}`}>{value}</p>
    </div>
  );
}

function RepPool({ label, value, className }: { label: string; value: number; className: string }) {
  return (
    <div>
      <p className={`font-pixel text-lg ${className}`}>
        {value.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
      </p>
      <p className="font-pixel t-text-muted text-[10px] mt-1.5">{label}</p>
    </div>
  );
}
