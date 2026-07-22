'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import CloudTitle from '@/components/CloudTitle';
import { bossByRaidKey, lootTier } from '@/lib/bossDisplay';
import { formatMaterial, formatPrice } from '@/lib/shopDisplay';
import GearChip from '@/components/GearChip';

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
  // Daily login streak (PiStatsAPI 1.8.0+) — ABSENT on older prod builds, so
  // every read is guarded. The stored streak only resets on the next claim:
  // trust streak_active for "is this streak alive right now".
  daily_reward_streak?: number;
  best_daily_reward_streak?: number;
  streak_active?: boolean;
  claimed_today?: boolean;
};

type EventRecentRun = {
  id: number;
  raid: string | null;
  cleared: boolean;
  wave: number;
  difficulty: number;
  duration_ms: number;
  gear_mode?: string | null;
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
    gear_mode?: string | null;
    kills: number;
    deaths: number;
    money: number;
    duration_ms: number;
    ended_at: number;
  }[];
};

type MarketListing = {
  seller: string;
  material: string;
  amount: number;
  custom_name: string | null;
  enchanted: boolean;
  price: number;
  listed_ms: number;
  expires_ms: number;
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
  // snapshot-derived skill levels (no XP data) — used when the live /skills
  // call fails (the upstream rate-limits bursts)
  skillsFallback: { power_level: number; skills: { skill: string; level: number }[] } | null;
  // Boss Rush (PiEvents) — null when PiEvents isn't live or the player never joined a run
  events: EventPlayer | null;
  // role board key (score|damage|boss_damage|tank|support|adds|clears) -> server rank
  eventRanks: Record<string, { rank: number; total: number }>;
  // true when the events surface is live upstream — lets the page show a zeroed
  // Boss Rush section for players who haven't joined a run yet
  eventsAvailable: boolean;
  // PvP (TDM/FFA) — null until PvP ships / the player has fought a match
  pvp: PvpPlayer | null;
  // PvP board key (wins|kills|kd|streak|mvps|matches|earnings) -> server rank
  pvpRanks: Record<string, { rank: number; total: number }>;
  // same as eventsAvailable, for the PvP surface
  pvpAvailable: boolean;
  // this player's active /market listings (PiShop) — empty pre-ship / none up
  marketListings: MarketListing[];
};

// GET + parse with one delayed retry. The upstream rate-limits bursts, and a
// profile view fires several calls at once — a failed first attempt is usually
// a transient 429, so wait a beat and try once more before giving up.
function fetchJsonRetry<T>(url: string, retryDelayMs = 4000): Promise<T | null> {
  const attempt = () =>
    fetch(url)
      .then((r) => (r.ok ? (r.json() as Promise<T>) : null))
      .catch(() => null);
  return attempt().then(
    (first) =>
      first ??
      new Promise<T | null>((resolve) => {
        setTimeout(() => attempt().then(resolve), retryDelayMs);
      }),
  );
}

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
  if (key === 'balance') return `$${Math.round(value).toLocaleString()}`;
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

// Zeroed skill line for players mcMMO hasn't tracked yet (or while the skills
// fetch is in flight) — keeps the section present on every profile.
const EMPTY_SKILLS: SkillsResponse = {
  uuid: '',
  name: '',
  power_level: 0,
  skills: Object.keys(SKILL_LABELS).map((skill) => ({
    skill, level: 0, xp: 0, xp_to_next: 0, child: false,
  })),
};

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
  const [advFailed, setAdvFailed] = useState(false);
  const [skills, setSkills] = useState<SkillsResponse | null>(null);
  const [skillsFailed, setSkillsFailed] = useState(false);
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
          // Failures are recorded (not swallowed) so the sections can render a
          // visible "couldn't load" state instead of silently disappearing —
          // the profile layout must be identical on every visit.
          fetchJsonRetry<AdvancementsResponse>(
            `/api/stats/players/${canonical}/advancements`,
          ).then((advData) => {
            if (cancelled) return;
            if (advData) setAdv(advData);
            else setAdvFailed(true);
          });
          fetchJsonRetry<SkillsResponse>(`/api/stats/players/${canonical}/skills`).then(
            (skillData) => {
              if (cancelled) return;
              if (skillData) setSkills(skillData);
              else setSkillsFailed(true);
            },
          );
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
  // Balance lives on the header card (opposite the head), not in the stats
  // grid — keeps the grid at its 9-card layout.
  const balance = profile?.stats.find((s) => s.key === 'balance') ?? null;
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
          {balance && (
            <div className="ml-auto shrink-0 relative z-10 text-right">
              <p className="font-pixel t-text-muted text-[10px] mb-1.5">Bal</p>
              <p className="t-text font-medium whitespace-nowrap max-md:text-sm">
                {formatStat('balance', balance.value)}
              </p>
            </div>
          )}
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
                {profile.stats.filter((s) => s.key !== 'balance').map((s) => (
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
                      {/* Login streak (1.8.0+; fields absent on older prod). A lapsed
                          streak is about to reset — show the best instead. */}
                      {rep.streak_active && (rep.daily_reward_streak ?? 0) >= 1 ? (
                        <span>
                          🔥 <span className="text-gold">{rep.daily_reward_streak}-day</span> login
                          streak{rep.claimed_today ? ' · ✓ claimed today' : ''}
                        </span>
                      ) : (rep.best_daily_reward_streak ?? 0) >= 1 ? (
                        <span>
                          Best login streak:{' '}
                          <span className="t-text-dim">{rep.best_daily_reward_streak} days</span>
                        </span>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* mcMMO Skills — always present. Live data when the /skills call
                lands; snapshot-derived levels (no XP bars) when it fails; zeros
                while loading / for untracked players. The error note only shows
                when the live call failed AND the snapshot has nothing — zeros
                there would misread as a real level-0 player. */}
            {(() => {
              const liveSkills = skills && skills.skills.length > 0 ? skills : null;
              const fb = profile.skillsFallback;
              const fallback: SkillsResponse | null = fb
                ? {
                    uuid: profile.uuid ?? '',
                    name: profile.name ?? '',
                    power_level: fb.power_level,
                    skills: fb.skills.map((s) => ({ ...s, xp: 0, xp_to_next: 0, child: false })),
                  }
                : null;
              if (skillsFailed && !liveSkills && !fallback) {
                return (
                  <div className="mb-8">
                    <h2 className="font-pixel t-text text-sm mb-3 px-1">mcMMO Skills</h2>
                    <div className="mc-panel p-4 text-center t-text-muted text-xs">
                      Couldn&apos;t load skills — refresh to try again.
                    </div>
                  </div>
                );
              }
              return (
                <SkillsPanel
                  data={liveSkills ?? fallback ?? EMPTY_SKILLS}
                  ranks={profile.skillRanks ?? {}}
                />
              );
            })()}

            {/* Boss Rush (PiEvents) — always visible; zeroed for players with
                no runs yet (or while the events surface isn't live upstream) */}
            <BossRushPanel
              data={profile.events ?? EMPTY_EVENTS}
              ranks={profile.eventRanks ?? {}}
            />

            {/* PvP Arena (PiEvents) — same: zeroed until their first match */}
            <PvpPanel data={profile.pvp ?? EMPTY_PVP} ranks={profile.pvpRanks ?? {}} />

            {/* Recent earnings (event payouts) — hidden until the player has any */}
            {profile.events?.recent_payouts && profile.events.recent_payouts.length > 0 && (
              <EarningsPanel payouts={profile.events.recent_payouts} />
            )}

            {/* Active /market listings — hidden when they have nothing up for sale */}
            {profile.marketListings && profile.marketListings.length > 0 && (
              <MarketPanel listings={profile.marketListings} />
            )}

            {/* Advancements — always present; the grid needs upstream data, so
                pre-load and on failure it's a note rather than a missing section */}
            <div>
              <div className="flex items-baseline justify-between mb-3 px-1">
                <h2 className="font-pixel t-text text-sm">Advancements</h2>
                {adv && (
                  <span className="font-pixel t-text-muted text-[10px]">
                    {adv.completed}/{adv.total} · {advPct}%
                  </span>
                )}
              </div>
              {!adv && (
                <div className="mc-panel p-4 text-center t-text-muted text-xs">
                  {advFailed
                    ? "Couldn't load advancements — refresh to try again."
                    : 'Loading advancements…'}
                </div>
              )}
              {adv &&
                adv.categories.map((cat) => (
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

// Zeroed stat lines for players with no event history yet — the upstream
// player endpoints 404 for them, but we still want the sections visible (with
// zeros) whenever the surface itself is live.
const EMPTY_EVENTS: EventPlayer = {
  uuid: null, name: '', events: 0, clears: 0, total_damage: 0, total_boss_damage: 0,
  total_damage_taken: 0, total_healing: 0, total_adds: 0, total_score: 0, best_score: 0,
  total_lives_lost: 0, survivals: 0, total_money: 0, best_pit: 0, pit_clears: 0,
};

const EMPTY_PVP: PvpPlayer = {
  uuid: '', name: '', matches: 0, wins: 0, kills: 0, deaths: 0, kd: 0,
  total_money: 0, best_killstreak: 0, mvps: 0,
};

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
                <GearChip mode={r.gear_mode} />
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

function PvpPanel({
  data,
  ranks,
}: {
  data: PvpPlayer;
  ranks: Record<string, { rank: number; total: number }>;
}) {
  const losses = Math.max(0, data.matches - data.wins);
  return (
    <div className="mb-8">
      <div className="flex items-baseline justify-between mb-3 px-1 gap-2 flex-wrap">
        <h2 className="font-pixel t-text text-sm">PvP Arena</h2>
        <span className="font-pixel t-text-muted text-[10px] flex items-baseline gap-2">
          {ranks.wins && <RankLabel rank={ranks.wins.rank} total={ranks.wins.total} />}
          <span>
            {data.matches} {data.matches === 1 ? 'match' : 'matches'} · {data.wins}W-{losses}L
          </span>
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <PvpTile label="Kills" value={data.kills.toLocaleString()} rank={ranks.kills} />
        <PvpTile label="K/D" value={data.kd.toFixed(2)} rank={ranks.kd} />
        <PvpTile label="Best Streak" value={data.best_killstreak.toLocaleString()} rank={ranks.streak} />
        <PvpTile label="MVPs" value={data.mvps.toLocaleString()} rank={ranks.mvps} accent />
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
                <GearChip mode={m.gear_mode} />
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

function PvpTile({
  label,
  value,
  rank,
  accent,
}: {
  label: string;
  value: string;
  rank?: { rank: number; total: number };
  accent?: boolean;
}) {
  return (
    <div className="mc-panel p-4">
      <p className="font-pixel t-text-muted text-[10px] mb-1.5">{label}</p>
      <p className={`text-lg font-medium leading-none ${accent ? 'text-gold' : 't-text'}`}>{value}</p>
      {rank && (
        <p className="text-xs mt-2">
          <RankLabel rank={rank.rank} total={rank.total} />
        </p>
      )}
    </div>
  );
}

// Event payout feed — "where their money came from lately". Reasons are the
// plugin's own strings (e.g. "Boss Rush clear", "PvP win"), passed through as-is.
function EarningsPanel({
  payouts,
}: {
  payouts: { money: number; reason: string; at: number }[];
}) {
  return (
    <div className="mb-8">
      <h2 className="font-pixel t-text text-sm mb-3 px-1">Recent earnings</h2>
      <div className="mc-panel overflow-hidden">
        {payouts.map((p, i) => (
          <div
            key={`${p.at}-${i}`}
            className="flex items-center gap-3 px-4 py-2 text-xs t-border-20 border-b last:border-b-0"
          >
            <span className="text-gold shrink-0 whitespace-nowrap">
              +${Math.round(p.money).toLocaleString()}
            </span>
            <span className="t-text-dim min-w-0 truncate">{p.reason}</span>
            <span className="t-text-muted ml-auto shrink-0 whitespace-nowrap">
              {eventTimeAgo(p.at)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// The player's active /market listings — same row shape as the /economy
// market panel, minus the seller column (it's them).
function MarketPanel({ listings }: { listings: MarketListing[] }) {
  return (
    <div className="mb-8">
      <h2 className="font-pixel t-text text-sm mb-3 px-1">Selling on the market</h2>
      <div className="mc-panel overflow-hidden">
        {listings.map((l, i) => (
          <div
            key={`${l.listed_ms}-${i}`}
            className="flex items-center gap-3 px-4 py-2.5 text-sm t-border-20 border-b last:border-b-0"
          >
            <span className="t-text-dim min-w-0 truncate">
              {l.custom_name ? (
                <span className="italic">{l.custom_name}</span>
              ) : (
                formatMaterial(l.material)
              )}
              {l.enchanted && <span aria-hidden> ✨</span>}
              <span className="t-text-muted"> ×{l.amount}</span>
            </span>
            <span className="text-gold whitespace-nowrap shrink-0">{formatPrice(l.price)}</span>
            <span className="t-text-muted text-xs ml-auto shrink-0 whitespace-nowrap max-md:hidden">
              {eventTimeAgo(l.listed_ms)}
            </span>
          </div>
        ))}
      </div>
      <p className="t-text-muted text-[11px] mt-2 px-1">
        Buy in-game with <code className="text-gold">/market</code>.
      </p>
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
