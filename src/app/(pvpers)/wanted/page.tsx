'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import GrassDivider from '@/components/GrassDivider';
import CloudTitle from '@/components/CloudTitle';
import CloudText from '@/components/CloudText';
import TopLawmen from '@/components/TopLawmen';

type Crime = { kind: string; count: number };
type LastSeen = { world: string; x: number; z: number };
type Outlaw = {
  name: string;
  uuid?: string | null;
  outlawRep: number;
  tier: string;
  lastSeen?: LastSeen | null;
  bountyTotal: number;
  crimes: Crime[];
};

type UpstreamOutlaw = {
  name: string;
  uuid?: string | null;
  outlaw_rep: number;
  tier: string;
  top_crimes?: { type: string; count: number }[];
  // FrontierStatsAPI 1.19.0+: sum of every cash bounty posted on this outlaw, in dollars.
  bounty_total?: number | null;
  last_seen_world?: string | null;
  last_seen_x?: number | null;
  last_seen_y?: number | null;
  last_seen_z?: number | null;
};

const tierClass: Record<string, string> = {
  Drifter: 'tier-drifter',
  Bandit: 'tier-bandit',
  Outlaw: 'tier-outlaw',
  Notorious: 'tier-notorious',
  Legend: 'tier-legend tier-legend-glow',
};

// Keys match FrontierReputation's CrimeType. Unknown types fall through to title case.
const crimeLabels: Record<string, string> = {
  UNPROVOKED_KILL_PACIFIST: 'Pacifist kills',
  UNPROVOKED_KILL_NEWCOMER: 'Newcomer kills',
  UNPROVOKED_KILL_LAWMAN: 'Lawman kills',
  UNPROVOKED_KILL_OUTLAW: 'Outlaw kills',
  ROBBERY: 'Robberies',
  VILLAGER_KILL: 'Villager kills',
  PET_KILL: 'Pet kills',
  FARM_MOB_KILL: 'Farm animal kills',
  VILLAGE_STRUCTURE_BREAK: 'Village vandalism',
  DONATION_CHEST_THEFT: 'Donation chest thefts',
  SPAWN_REGION_KILL: 'Spawn-region PvP',
  REPORT_APPROVED: 'Upheld reports',
  // Older keys, harmless if one turns up.
  KNOCKOUT_THEFT: 'Knockout thefts',
  PVP_KILL: 'PvP kills',
  LAWMAN_KILL: 'Lawman kills',
};

// The game rounds last-seen spots to 100 blocks on posters and broadcasts; match it.
function roundCoord(n: number): number {
  return Math.round(n / 100) * 100 || 0;
}

function titleCaseFromSnake(s: string): string {
  return s
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function crimeLabel(type: string): string {
  return crimeLabels[type] ?? titleCaseFromSnake(type);
}

const worldLabels: Record<string, string> = {
  world: 'Overworld',
  world_nether: 'the Nether',
  world_the_end: 'the End',
};

function worldLabel(world: string): string {
  return worldLabels[world] ?? titleCaseFromSnake(world);
}

function fromUpstream(u: UpstreamOutlaw): Outlaw {
  const lastSeen: LastSeen | null =
    u.last_seen_world != null && u.last_seen_x != null && u.last_seen_z != null
      ? {
          world: u.last_seen_world,
          x: roundCoord(u.last_seen_x),
          z: roundCoord(u.last_seen_z),
        }
      : null;
  return {
    name: u.name,
    uuid: u.uuid ?? null,
    outlawRep: u.outlaw_rep,
    tier: u.tier,
    bountyTotal: u.bounty_total ?? 0,
    lastSeen,
    crimes: (u.top_crimes ?? []).map((c) => ({
      kind: crimeLabel(c.type),
      count: c.count,
    })),
  };
}

export default function WantedPage() {
  const [outlaws, setOutlaws] = useState<Outlaw[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/stats/reputation/wanted')
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return (await r.json()) as { wanted: UpstreamOutlaw[] };
      })
      .then((json) => {
        if (cancelled) return;
        // Upstream already orders by outlaw rep, highest first.
        setOutlaws((json.wanted ?? []).map(fromUpstream));
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const withBounty = outlaws.filter((o) => o.bountyTotal > 0).length;
  const hasOutlaws = outlaws.length > 0;

  return (
    <div>
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <CloudTitle>
          <h1 className="font-pixel text-gold text-2xl sm:text-3xl mb-6 glow-gold">
            Wanted
          </h1>
        </CloudTitle>
        <CloudText>
          <p className="t-text-dim leading-relaxed">
            These outlaws crossed the line in the wilderness. Any non-outlaw can bring them down.
            Some carry a cash bounty other players put up, and the killer takes all of it. Post
            your own with /bounty place &lt;player&gt; &lt;amount&gt;. The rest still pay a Lawman
            in violence rep and a reward drop.
          </p>
        </CloudText>

        {/* Quick stats strip — hidden when the board is empty so we don't render "Highest tier: none" */}
        {hasOutlaws && (
          <div className="mt-8 grid grid-cols-3 gap-3 max-w-md mx-auto">
            <Stat label="Wanted" value={outlaws.length.toString()} />
            <Stat label="With bounty" value={withBounty.toString()} />
            <Stat label="Highest tier" value={outlaws[0].tier} />
          </div>
        )}

        {/* How does this work callout */}
        <div className="mt-8 inline-flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mc-panel px-5 py-3">
          <span className="t-text-dim text-sm">New here? Read how the rep system works.</span>
          <Link
            href="/reputation"
            className="font-pixel text-gold text-[10px] glow-gold hover-surface px-3 py-1.5 rounded"
          >
            Reputation system &rarr;
          </Link>
        </div>
      </section>

      <GrassDivider />

      {/* Top Lawmen callout */}
      <section className="max-w-5xl mx-auto px-4 pt-48 pb-8">
        <div className="text-center mb-10">
          <CloudTitle>
            <h2 className="font-pixel text-gold text-lg glow-gold mb-3">Top Lawmen</h2>
          </CloudTitle>
          <p className="t-text-muted text-sm mt-2">
            The other side of the badge. Full ladder on{' '}
            <Link
              href="/leaderboards#lawmen"
              className="text-enchant hover:text-enchant/70 transition-colors underline underline-offset-2"
            >
              the leaderboards
            </Link>
            .
          </p>
        </div>

        <TopLawmen />
      </section>

      {/* Poster board */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <CloudTitle>
            <h2 className="font-pixel text-gold text-lg glow-gold">The Board</h2>
          </CloudTitle>
        </div>

        {loading && (
          <p className="text-center t-text-muted text-sm">Loading…</p>
        )}

        {!loading && error && (
          <p className="text-center t-text-muted text-sm italic">
            Couldn&apos;t load the wanted board. Try again later.
          </p>
        )}

        {!loading && !error && !hasOutlaws && (
          <p className="text-center t-text-muted text-sm italic">
            No outlaws on the board yet — the wilderness is quiet.
          </p>
        )}

        {!loading && !error && hasOutlaws && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-md:gap-6">
              {outlaws.map((o, i) => (
                <Poster
                  key={o.uuid ?? o.name}
                  outlaw={o}
                  tilt={[-1.5, 1.2, -0.8, 1.6, -1.2][i % 5]}
                />
              ))}
            </div>

            <p className="text-center t-text-muted text-xs italic mt-12 max-w-xl mx-auto">
              Outlaws below the Drifter threshold (25 rep) don&apos;t make the board. Self-defense kills
              and outlaw-on-outlaw kills don&apos;t feed the list either. Last-seen spots are rounded
              to the nearest 100 blocks, same as in game.
            </p>
          </>
        )}
      </section>

      <GrassDivider />

      {/* Bottom CTA — back to deep-dive */}
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <CloudTitle>
          <h2 className="font-pixel text-gold text-lg mb-6 glow-gold">How does a name end up here?</h2>
        </CloudTitle>
        <CloudText>
          <p className="t-text-dim leading-relaxed mb-6">
            Crimes in the wilderness raise outlaw rep. Hit 25 and you&apos;re on the board, and any
            robbery gets you there in one go. Newcomer kills (+75), pacifist kills (+50), lawman
            kills (+15), robbery, pet and villager kills: every offense has a number behind it. The reputation page lays out the full ladder, the redemption paths,
            and every command.
          </p>
        </CloudText>
        <Link
          href="/reputation"
          className="inline-block mc-panel px-6 py-3 font-pixel text-gold text-xs glow-gold hover-surface"
        >
          Read the reputation system &rarr;
        </Link>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="mc-panel px-3 py-3">
      <div className="font-pixel text-gold text-sm glow-gold">{value}</div>
      <div className="t-text-muted text-[10px] uppercase tracking-wider mt-1">{label}</div>
    </div>
  );
}

function Poster({
  outlaw,
  tilt,
}: {
  outlaw: Outlaw;
  tilt: number;
}) {
  const tier = tierClass[outlaw.tier] ?? 'tier-drifter';

  return (
    <div className="wanted-frame relative" style={{ transform: `rotate(${tilt}deg)` }}>
      <div className="wanted-paper">
        {/* Header */}
        <div className="text-center relative z-10">
          <h3
            className="font-pixel text-[28px] sm:text-[32px] leading-none tracking-[0.2em]"
            style={{ color: '#3b1f0c' }}
          >
            WANTED
          </h3>
          <p
            className="font-pixel text-[9px] tracking-[0.25em] mt-2"
            style={{ color: '#5a2f15' }}
          >
            DEAD OR ALIVE
          </p>
        </div>

        {/* Player head */}
        <div className="flex justify-center my-5 relative z-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://mc-heads.net/avatar/${outlaw.uuid ?? outlaw.name}/96`}
            alt={`${outlaw.name} player head`}
            width={96}
            height={96}
            loading="lazy"
            className="wanted-head"
          />
        </div>

        {/* Name + tier */}
        <div className="text-center relative z-10">
          <p
            className="font-pixel text-base sm:text-lg break-all leading-tight"
            style={{ color: '#2c160a' }}
          >
            {outlaw.name}
          </p>
          <p className={`font-pixel text-[10px] uppercase tracking-widest mt-1.5 ${tier}`}>
            {outlaw.tier}
          </p>
        </div>

        {/* Reward: total cash bounty, only shown when someone has posted one */}
        {outlaw.bountyTotal > 0 && (
          <div className="wanted-divider mt-5 pt-3 text-center relative z-10">
            <p
              className="font-pixel text-[9px] tracking-[0.25em]"
              style={{ color: '#5a2f15' }}
            >
              REWARD
            </p>
            <p className="font-pixel text-lg mt-2" style={{ color: '#2c160a' }}>
              ${outlaw.bountyTotal.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </p>
          </div>
        )}

        {/* Crimes */}
        <div className="wanted-divider mt-4 pt-3 relative z-10">
          <p
            className="font-pixel text-[9px] tracking-[0.25em] text-center mb-2"
            style={{ color: '#5a2f15' }}
          >
            CRIMES
          </p>
          <ul className="space-y-1.5 text-xs">
            {outlaw.crimes.map((c) => (
              <li
                key={c.kind}
                className="flex justify-between items-baseline"
                style={{ color: '#3b1f0c' }}
              >
                <span>{c.kind}</span>
                <span className="font-pixel text-[10px]" style={{ color: '#2c160a' }}>
                  {c.count}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        {outlaw.lastSeen && (
          <p
            className="font-pixel text-[8px] italic text-center mt-4 relative z-10"
            style={{ color: '#6b3a1a' }}
          >
            last seen in {worldLabel(outlaw.lastSeen.world)} near {outlaw.lastSeen.x}, {outlaw.lastSeen.z}
          </p>
        )}
      </div>
    </div>
  );
}
