import CopyButton from '@/components/CopyButton';
import GrassDivider from '@/components/GrassDivider';
import CloudTitle from '@/components/CloudTitle';
import CloudText from '@/components/CloudText';
import LiveServerStatus from '@/components/LiveServerStatus';
import LaunchCountdown from '@/components/LaunchCountdown';

type Feature = { title: string; description: string; href?: string };

const features: Feature[] = [
  {
    title: 'Your land, your rules',
    description:
      'Lands claims give you full permission control. Decide who builds, who opens chests, and whether anyone can swing a sword inside your border.',
  },
  {
    title: 'Outside is outside',
    description:
      'No safety in the wilderness for anyone in the fight. PvP is always on for outlaws and lawmen, opt-in for pacifists. Your stuff is yours to defend either way.',
  },
  {
    title: 'Frontier reputation',
    description:
      "PvP is a choice you make, not a class you're stuck with. Pacifists can opt in to hunt outlaws but keep one-hit-kill protection. Cross lines and your name lands on wanted posters with a bounty. Take outlaws down and you earn the lawman badge.",
    href: '/reputation',
  },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="min-h-[90vh] flex flex-col items-center justify-center text-center px-4 py-20">
        <CloudTitle>
          <h1 className="font-pixel text-gold text-4xl sm:text-5xl md:text-6xl max-md:text-2xl mb-4 glow-gold whitespace-nowrap">
            mc.pvpers.us
          </h1>
          <p className="t-text-dim text-sm sm:text-base max-w-md mx-auto text-center font-pixel">
            A world with one rule and a lot of room.
          </p>
        </CloudTitle>
        <div className="mb-8" />

        <LaunchCountdown />

        <div className="mb-6" />

        <CopyButton text="mc.pvpers.us" label="mc.pvpers.us" className="text-lg max-md:text-sm mb-4" />
        <LiveServerStatus />

        {/* Server Stats */}
        <div className="mc-panel p-6 max-w-lg w-full">
          <h2 className="font-pixel t-text-dim text-[10px] mb-4 uppercase tracking-widest">Server Info</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="t-text-muted text-xs">Version</span>
              <p className="text-xp font-pixel text-sm glow-xp">26.1.2</p>
            </div>
            <div>
              <span className="t-text-muted text-xs">Gameplay</span>
              <p className="text-xp font-pixel text-sm glow-xp">Vanilla+ Survival</p>
            </div>
            <div>
              <span className="t-text-muted text-xs">Features</span>
              <p className="t-text font-pixel text-sm">Reputation, mcMMO, Lands</p>
            </div>
            <div>
              <span className="t-text-muted text-xs">Platform</span>
              <p className="t-text font-pixel text-sm">Java</p>
            </div>
          </div>
        </div>
      </section>

      <GrassDivider />

      {/* Feature Cards */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {features.map((feature) =>
            feature.href ? (
              <a
                key={feature.title}
                href={feature.href}
                className="mc-panel p-6 gradient-border hover-surface block transition-all"
              >
                <h3 className="font-pixel text-gold text-xs mb-2">{feature.title}</h3>
                <p className="t-text-dim text-sm">{feature.description}</p>
                <p className="text-enchant text-xs mt-3 font-pixel">Read the rules &rarr;</p>
              </a>
            ) : (
              <div key={feature.title} className="mc-panel p-6 gradient-border">
                <h3 className="font-pixel text-gold text-xs mb-2">{feature.title}</h3>
                <p className="t-text-dim text-sm">{feature.description}</p>
              </div>
            )
          )}
        </div>
      </section>

      <GrassDivider />

      {/* About blurb */}
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <CloudTitle>
          <h2 className="font-pixel text-gold text-lg mb-6 glow-gold">What is mc.pvpers.us?</h2>
        </CloudTitle>
        <CloudText>
          <p className="t-text-dim leading-relaxed mb-4">
            mc.pvpers.us is a Wild West-themed hard survival server. Lands claims, a cowboy
            reputation system, mcMMO, and a slow-growing world border. No pay-to-win, no required
            mods, no curated experience.
          </p>
          <p className="t-text-dim leading-relaxed mb-4">
            Inside your claim, you set the rules. Lock down your base, invite the people you trust,
            and decide what they can and can&apos;t do. Outside the claim border, the wilderness is
            the frontier. PvP on, mob griefing on, reputation rep awards firing every kill.
          </p>
          <p className="t-text-dim leading-relaxed">
            Pacifists keep one-hit-kill protection but can opt into PvP to hunt outlaws. Cross lines
            in the wilderness and you land on /wanted with a bounty. Lawmen earn the badge by taking
            outlaws down. The community votes on every system change.{' '}
            <a href="/about#whats-live" className="text-enchant hover:text-enchant/70 transition-colors underline underline-offset-2">
              See what&apos;s live at launch &rarr;
            </a>
          </p>
        </CloudText>
      </section>

      <GrassDivider />

      {/* Platform cross-promo */}
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <CloudTitle>
          <h2 className="font-pixel text-gold text-lg mb-6 glow-gold">Run a server of your own?</h2>
        </CloudTitle>
        <CloudText>
          <p className="t-text-dim leading-relaxed mb-6">
            This site runs on a platform we built for server owners: a branded home page, rules,
            news, and live stats, all editable from a dashboard — no files, no redeploys. Free for
            up to two sites.
          </p>
        </CloudText>
        <a
          href="/get-started"
          className="inline-block mc-panel px-6 py-3 font-pixel text-gold text-xs glow-gold hover-surface"
        >
          Get your own site &rarr;
        </a>
      </section>
    </div>
  );
}
