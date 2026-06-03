'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import CloudTitle from '@/components/CloudTitle';

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

type ProfileResponse = {
  uuid: string | null;
  name: string | null;
  online: boolean;
  found: boolean;
  stats: StatEntry[];
  reputation: Reputation | null;
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
  task: 'border-emerald-500/60 bg-emerald-500/10',
  goal: 'border-emerald-400/60 bg-emerald-400/10',
  challenge: 'border-fuchsia-500/60 bg-fuchsia-500/10',
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
            <CloudTitle className="ml-10 w-fit" cloudOffsetX={10} cloudOffsetY={12}>
              <h1 className="font-pixel text-gold text-xl sm:text-2xl glow-gold whitespace-nowrap">
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
            {skills && skills.skills.length > 0 && <SkillsPanel data={skills} />}

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
                            a.done ? frameDone[a.frame] : 't-border-20 opacity-45 hover:opacity-70'
                          }`}
                        >
                          <div className="flex items-start gap-1.5">
                            <span
                              className={`text-xs leading-tight ${a.done ? 't-text' : 't-text-muted'}`}
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

function SkillsPanel({ data }: { data: SkillsResponse }) {
  const byName = new Map(data.skills.map((s) => [s.skill, s]));
  return (
    <div className="mb-8">
      <div className="flex items-baseline justify-between mb-3 px-1">
        <h2 className="font-pixel t-text text-sm">mcMMO Skills</h2>
        <span className="font-pixel text-gold glow-gold text-sm">
          Power {data.power_level.toLocaleString()}
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
                <SkillTile key={s.skill} skill={s} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SkillTile({ skill }: { skill: SkillEntry }) {
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
