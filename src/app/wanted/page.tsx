'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import GrassDivider from '@/components/GrassDivider';
import CloudTitle from '@/components/CloudTitle';
import CloudText from '@/components/CloudText';
import TopLawmen from '@/components/TopLawmen';

type Crime = { kind: string; count: number };
type Outlaw = {
  name: string;
  uuid: string | null;
  outlawRep: number;
  tier: string;
  bountyMultiplier: number;
  bountyDiamonds: number;
  postedBy: string;
  lastSeenMinutes: number;
  crimes: Crime[];
};

const tierClass: Record<string, string> = {
  Drifter: 'tier-drifter',
  Bandit: 'tier-bandit',
  Outlaw: 'tier-outlaw',
  Notorious: 'tier-notorious',
  Legend: 'tier-legend tier-legend-glow',
};

const EXAMPLE_OUTLAW: Outlaw = {
  name: 'BanditExample',
  uuid: null,
  outlawRep: 124,
  tier: 'Outlaw',
  bountyMultiplier: 2.0,
  bountyDiamonds: 16,
  postedBy: "Sheriff's Office",
  lastSeenMinutes: 47,
  crimes: [
    { kind: 'Knockout thefts', count: 4 },
    { kind: 'Pacifist kills', count: 2 },
    { kind: 'Pet kills', count: 1 },
  ],
};

function formatLastSeen(minutes: number) {
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 60 * 24) return `${Math.floor(minutes / 60)}h ago`;
  return `${Math.floor(minutes / (60 * 24))}d ago`;
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
        return (await r.json()) as { outlaws: Outlaw[] };
      })
      .then((json) => {
        if (cancelled) return;
        const sorted = [...(json.outlaws ?? [])].sort(
          (a, b) => b.bountyDiamonds - a.bountyDiamonds,
        );
        setOutlaws(sorted);
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

  const totalBounty = outlaws.reduce((s, o) => s + o.bountyDiamonds, 0);
  const showExample = !loading && (error || outlaws.length === 0);

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
            These outlaws crossed the line in the wilderness. A Marshal put up real items.
            Bring them down and the bounty&apos;s yours.
          </p>
        </CloudText>

        {/* Quick stats strip */}
        <div className="mt-8 grid grid-cols-3 gap-3 max-w-md mx-auto">
          <Stat label="Wanted" value={outlaws.length.toString()} />
          <Stat label="Total bounty" value={`${totalBounty}◆`} />
          <Stat label="Highest tier" value={outlaws[0]?.tier ?? 'none'} />
        </div>

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

        {showExample && (
          <div className="max-w-md mx-auto">
            <Poster outlaw={EXAMPLE_OUTLAW} tilt={-1.0} isExample />
            <p className="text-center t-text-muted text-xs italic mt-8">
              No outlaws on the board right now. The poster above is an example —
              real ones appear here as players actually cross the line.
            </p>
          </div>
        )}

        {!loading && !showExample && (
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
              and outlaw-on-outlaw kills don&apos;t feed the list either.
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
            Crimes in the wilderness raise outlaw rep. Cross 25 and you&apos;re on the board.
            Pacifist kills, knockout-thefts, spawn-region PvP, combat-logging: every offense has a
            number behind it. The reputation page lays out the full ladder, the redemption paths,
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
  isExample = false,
}: {
  outlaw: Outlaw;
  tilt: number;
  isExample?: boolean;
}) {
  const tier = tierClass[outlaw.tier] ?? 'tier-drifter';

  return (
    <div className="wanted-frame relative" style={{ transform: `rotate(${tilt}deg)` }}>
      {isExample && (
        <span
          className="absolute top-3 right-3 z-20 font-pixel text-[9px] tracking-[0.2em] px-2 py-1 rounded"
          style={{ background: '#3b1f0c', color: '#f4e3c8' }}
        >
          EXAMPLE
        </span>
      )}
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
            className="font-pixel text-base sm:text-lg"
            style={{ color: '#2c160a' }}
          >
            {outlaw.name}
          </p>
          <p className={`font-pixel text-[10px] uppercase tracking-widest mt-1.5 ${tier}`}>
            {outlaw.tier} <span style={{ color: '#6b3a1a' }}>· ×{outlaw.bountyMultiplier.toFixed(1)}</span>
          </p>
        </div>

        {/* Reward */}
        <div className="wanted-divider mt-5 pt-3 text-center relative z-10">
          <p
            className="font-pixel text-[9px] tracking-[0.25em]"
            style={{ color: '#5a2f15' }}
          >
            REWARD
          </p>
          <p
            className="font-pixel text-2xl sm:text-3xl mt-1.5"
            style={{ color: '#2c160a' }}
          >
            {outlaw.bountyDiamonds}
            <span style={{ color: '#1a8a8f', marginLeft: '0.25rem' }}>◆</span>
          </p>
          <p
            className="font-pixel text-[8px] mt-1"
            style={{ color: '#6b3a1a' }}
          >
            posted by {outlaw.postedBy}
          </p>
        </div>

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
        <p
          className="font-pixel text-[8px] italic text-center mt-4 relative z-10"
          style={{ color: '#6b3a1a' }}
        >
          last seen {formatLastSeen(outlaw.lastSeenMinutes)}
        </p>
      </div>
    </div>
  );
}
