import CopyButton from '@/components/CopyButton';
import GrassDivider from '@/components/GrassDivider';
import CloudTitle from '@/components/CloudTitle';
import CloudText from '@/components/CloudText';
import LiveServerStatus from '@/components/LiveServerStatus';

const features = [
  {
    title: 'Your land, your rules',
    description:
      'Claims give you full permission control. Decide who builds, who opens chests, and whether anyone can swing a sword inside your border.',
  },
  {
    title: 'Outside is outside',
    description:
      'No rules in the wilderness. PvP is on, your stuff is yours to defend, and the world is honest about that.',
  },
  {
    title: 'Nations & war',
    description:
      "Form a nation with the people you trust. Declare war if the other side accepts. Make peace when you've had enough.",
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
              <p className="t-text font-pixel text-sm">Claims, Nations, War</p>
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
            <div key={feature.title} className="mc-panel p-6 gradient-border">
              <h3 className="font-pixel text-gold text-xs mb-2">{feature.title}</h3>
              <p className="t-text-dim text-sm">{feature.description}</p>
            </div>
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
            mc.pvpers.us is a vanilla+ Minecraft server with claims, nations, and PvP turned on.
            No pay-to-win, no required mods, no curated experience. Just a world and the people in it.
          </p>
          <p className="t-text-dim leading-relaxed mb-4">
            Inside your claim, you set the rules. Lock down your base, invite the people you trust,
            and decide what they can and can&apos;t do. Outside the claim border, the world is what
            you and everyone else make of it. Travel light, travel armed, or travel with friends.
          </p>
          <p className="t-text-dim leading-relaxed">
            Nations can form. Wars can be declared, but only if both sides agree. KOTH events and
            game nights happen sometimes when the group&apos;s around. The rest is up to you.{' '}
            <a href="/about#world-border" className="text-enchant hover:text-enchant/70 transition-colors underline underline-offset-2">
              Learn how the world grows &rarr;
            </a>
          </p>
        </CloudText>
      </section>
    </div>
  );
}
