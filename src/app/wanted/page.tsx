import Link from 'next/link';
import GrassDivider from '@/components/GrassDivider';
import CloudTitle from '@/components/CloudTitle';
import CloudText from '@/components/CloudText';
import wantedData from '@/data/wanted.json';
import repData from '@/data/reputation-leaderboards.json';

type Lawman = {
  rank: number;
  uuid: string | null;
  name: string;
  tier: string;
  commendations: number;
  outlawKills: number;
  donatedDiamonds: number;
};
const topLawmen = (repData.lawmen as Lawman[]).slice(0, 3);
const repIsPreview = (repData as { preview?: boolean }).preview === true;

const lawmenTierColor: Record<string, string> = {
  Marshal: 'text-gold glow-gold',
  'Senior Sheriff': 'text-gold',
  Sheriff: 'text-enchant glow-enchant',
  Deputy: 'text-enchant',
  Citizen: 't-text-dim',
};

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

const tiltByIndex = [-1.5, 1.2, -0.8, 1.6, -1.2];

function formatLastSeen(minutes: number) {
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 60 * 24) return `${Math.floor(minutes / 60)}h ago`;
  return `${Math.floor(minutes / (60 * 24))}d ago`;
}

export default function WantedPage() {
  const outlaws = [...(wantedData.outlaws as Outlaw[])].sort(
    (a, b) => b.bountyDiamonds - a.bountyDiamonds,
  );
  const isPreview = wantedData.preview === true;
  const totalBounty = outlaws.reduce((s, o) => s + o.bountyDiamonds, 0);

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
          <p className="t-text-dim leading-relaxed mb-3">
            These outlaws crossed the line in the wilderness. A Marshal put up real items.
            Bring them down and the bounty&apos;s yours.
          </p>
          <p className="t-text-muted text-sm">
            <span className="font-pixel text-[10px] text-redstone mr-2">SAMPLE</span>
            {isPreview
              ? 'Posters below are illustrative. The reputation system is live at launch; the board fills with real outlaws as players actually commit crimes.'
              : null}
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
            The other side of the badge.{' '}
            {repIsPreview && (
              <>
                <span className="font-pixel text-[9px] text-redstone uppercase tracking-widest mx-1">SAMPLE</span>
                {' '}
              </>
            )}
            Full ladder on{' '}
            <Link
              href="/leaderboards#lawmen"
              className="text-enchant hover:text-enchant/70 transition-colors underline underline-offset-2"
            >
              the leaderboards
            </Link>
            .
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {topLawmen.map((lawman, i) => (
            <div
              key={lawman.name}
              className="mc-panel p-6 flex flex-col items-center text-center gap-3"
              style={i === 0 ? { background: 'color-mix(in srgb, var(--c-surface) 30%, transparent)' } : undefined}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://mc-heads.net/avatar/${lawman.uuid ?? lawman.name}/80`}
                alt={`${lawman.name} player head`}
                width={80}
                height={80}
                loading="lazy"
                className="w-20 h-20 rounded shrink-0 t-surface-light"
              />
              <div className="min-w-0 w-full">
                <p className="font-pixel text-sm t-text truncate">{lawman.name}</p>
                <p className={`font-pixel text-[10px] uppercase tracking-widest mt-1.5 ${lawmenTierColor[lawman.tier] ?? 't-text-dim'}`}>
                  {lawman.tier}
                </p>
              </div>
              <div className="w-full pt-3 mt-1 border-t" style={{ borderColor: 'var(--c-border)' }}>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="font-pixel text-gold text-sm glow-gold">{lawman.outlawKills}</p>
                    <p className="t-text-muted text-[9px] uppercase tracking-wider mt-1">Kills</p>
                  </div>
                  <div>
                    <p className="font-pixel text-gold text-sm glow-gold">{lawman.commendations}</p>
                    <p className="t-text-muted text-[9px] uppercase tracking-wider mt-1">Commends</p>
                  </div>
                  <div>
                    <p className="font-pixel text-gold text-sm glow-gold">
                      {lawman.donatedDiamonds}
                      <span className="text-enchant ml-0.5">◆</span>
                    </p>
                    <p className="t-text-muted text-[9px] uppercase tracking-wider mt-1">Donated</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Poster board */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <CloudTitle>
            <h2 className="font-pixel text-gold text-lg glow-gold">The Board</h2>
          </CloudTitle>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-md:gap-6">
          {outlaws.map((o, i) => (
            <Poster key={o.name} outlaw={o} tilt={tiltByIndex[i % tiltByIndex.length]} />
          ))}
        </div>

        <p className="text-center t-text-muted text-xs italic mt-12 max-w-xl mx-auto">
          Outlaws below the Drifter threshold (25 rep) don&apos;t make the board. Self-defense kills
          and outlaw-on-outlaw kills don&apos;t feed the list either.
        </p>
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

function Poster({ outlaw, tilt }: { outlaw: Outlaw; tilt: number }) {
  const tier = tierClass[outlaw.tier] ?? 'tier-drifter';

  return (
    <div className="wanted-frame" style={{ transform: `rotate(${tilt}deg)` }}>
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
            src={`https://mc-heads.net/avatar/${outlaw.name}/96`}
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
