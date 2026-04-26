import Link from 'next/link';
import CopyButton from '@/components/CopyButton';
import GrassDivider from '@/components/GrassDivider';
import CloudTitle from '@/components/CloudTitle';
import CloudText from '@/components/CloudText';

const features = [
  {
    title: 'Explore',
    description: 'Catch up on everything new in Minecraft since you last played.',
    href: '/version-catchup',
    icon: '🗺',
  },
  {
    title: 'Connect',
    description: 'Get set up and join the server in minutes. Java Edition for now.',
    href: '/bedrock',
    icon: '🔗',
  },
  {
    title: 'Compete',
    description: 'Track your stats and climb the leaderboards.',
    href: '/leaderboards',
    icon: '⚔',
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
            Explore. Claim. Conquer.
          </p>
        </CloudTitle>
        <div className="mb-8" />

        <CopyButton text="mc.pvpers.us" label="mc.pvpers.us" className="text-lg max-md:text-sm mb-12" />

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
              <p className="text-xp font-pixel text-sm glow-xp">Vanilla+ PvP</p>
            </div>
            <div>
              <span className="t-text-muted text-xs">Features</span>
              <p className="t-text font-pixel text-sm">Claims & Nations</p>
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
          {features.map((feature) => (
            <Link
              key={feature.title}
              href={feature.href}
              className="mc-panel p-6 transition-all group gradient-border"
            >
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="font-pixel text-gold text-xs mb-2 transition-all">
                {feature.title}
              </h3>
              <p className="t-text-dim text-sm">{feature.description}</p>
            </Link>
          ))}
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
            We&apos;re a dedicated Vanilla+ Minecraft server. No pay-to-win, no mods, no BS.
            Just classic Minecraft with a few quality-of-life tweaks to keep things smooth.
          </p>
          <p className="t-text-dim leading-relaxed mb-4">
            Claim your land, lock down your base, and invite the neighbors you trust. Inside your
            claim you decide who can build, open chests, or even swing a sword. Everything beyond
            the claim border is the wild, so travel light or travel with friends.
          </p>
          <p className="t-text-dim leading-relaxed">
            Our world grows with you. The more we play, the bigger it gets. The world border
            expands every week based on how much time the community spends online.{' '}
            <a href="/about#world-border" className="text-enchant hover:text-enchant/70 transition-colors underline underline-offset-2">
              Learn how it works &rarr;
            </a>
          </p>
        </CloudText>
      </section>
    </div>
  );
}
