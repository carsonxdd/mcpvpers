import Image from 'next/image';
import rules from '@/data/rules.json';
import plugins from '@/data/plugins.json';
import GrassDivider from '@/components/GrassDivider';
import CloudTitle from '@/components/CloudTitle';
import CloudText from '@/components/CloudText';
import LiveBorderStatus from '@/components/LiveBorderStatus';

const staff = [
  { name: 'carsonxd', role: 'Owner', image: '/staff/carsonxd.jpg' },
];

export default function AboutPage() {
  return (
    <div>
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <CloudTitle><h1 className="font-pixel text-gold text-2xl sm:text-3xl mb-6 glow-gold">About</h1></CloudTitle>
        <CloudText>
          <p className="t-text-dim leading-relaxed mb-4">
            mc.pvpers.us runs on a simple idea: the fewer rules a server has, the more interesting it
            gets. We don&apos;t curate playstyles. We give you the tools — claims, nations, a war system —
            and let the world fill in around them.
          </p>
          <p className="t-text-dim leading-relaxed mb-4">
            If you want to build, claim your land and build. If you want to fight, the wilderness is
            right there. If you want to start a nation and pick a fight with the next one over, do
            that. If you want to sit in a base and farm pumpkins for six months, also fine. The point
            is that none of those are the &ldquo;right&rdquo; way to play here.
          </p>
          <p className="t-text-dim leading-relaxed">
            The only thing we ask is that you don&apos;t cheat. Everything else, the world will sort out.
          </p>
        </CloudText>
      </section>

      <GrassDivider />

      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <CloudTitle><h2 className="font-pixel text-gold text-lg mb-6 glow-gold">Why one rule</h2></CloudTitle>
        <CloudText>
          <p className="t-text-dim leading-relaxed mb-4">
            Most servers stack rules because the players don&apos;t know each other. We do. That changes
            what the rules need to do.
          </p>
          <p className="t-text-dim leading-relaxed mb-4">
            Claims keep your stuff safe. The wilderness keeps things interesting. The war system keeps
            conflict consensual at the nation level. Past that, we trust people to figure it out — and
            when they don&apos;t, the world&apos;s consequences usually handle it better than a rulebook
            would.
          </p>
          <p className="t-text-dim leading-relaxed">
            If something&apos;s off, ping carsonxd on Discord. I&apos;m around.
          </p>
        </CloudText>
      </section>

      <GrassDivider />

      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center"><CloudTitle><h2 className="font-pixel text-gold text-lg mb-8 glow-gold">The one rule</h2></CloudTitle></div>
        <div className="mc-panel p-6 sm:p-8">
          {rules.map((rule) => (
            <div key={rule.title}>
              <h3 className="font-pixel text-enchant text-sm mb-2 glow-enchant">{rule.title}</h3>
              <p className="t-text-dim text-sm leading-relaxed">{rule.body}</p>
            </div>
          ))}
        </div>
      </section>

      <GrassDivider />

      <section id="world-border" className="max-w-3xl mx-auto px-4 py-16 scroll-mt-24">
        <div className="text-center">
          <CloudTitle><h2 className="font-pixel text-gold text-lg mb-6 glow-gold">World Border</h2></CloudTitle>
        </div>
        <CloudText>
          <p className="t-text-dim leading-relaxed mb-4 text-center">
            The world doesn&apos;t start infinite. It opens at a <strong className="t-text">1,750-block radius</strong> from
            spawn and grows every week based on how much the community plays.
          </p>
          <p className="t-text-dim leading-relaxed text-center">
            Every Sunday, the border plugin tallies total player-hours from the past week and expands the
            border based on which tier the server hit. The more people play, the more world everyone
            gets to explore.
          </p>
        </CloudText>

        <LiveBorderStatus />

        <div className="mc-panel p-6 sm:p-8 max-md:p-3 mt-8">
          <h3 className="font-pixel text-enchant text-xs mb-4 glow-enchant text-center uppercase tracking-wider">Expansion Tiers</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm max-md:text-xs">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--c-border)' }}>
                  <th className="font-pixel text-gold text-[10px] max-md:text-[9px] text-left py-2 pr-4 max-md:pr-1.5">Tier</th>
                  <th className="font-pixel text-gold text-[10px] max-md:text-[9px] text-left py-2 pr-4 max-md:pr-1.5"><span className="md:hidden">Playtime</span><span className="max-md:hidden">Weekly Playtime</span></th>
                  <th className="font-pixel text-gold text-[10px] max-md:text-[9px] text-left py-2 pr-4 max-md:pr-1.5"><span className="md:hidden">Expansion</span><span className="max-md:hidden">Border Expansion</span></th>
                  <th className="font-pixel text-gold text-[10px] max-md:text-[9px] text-left py-2"><span className="md:hidden">Chunks*</span><span className="max-md:hidden">New Chunks*</span></th>
                </tr>
              </thead>
              <tbody className="t-text-dim">
                <tr className="border-b" style={{ borderColor: 'var(--c-border)' }}>
                  <td className="py-2.5 pr-4 max-md:pr-1.5"><span className="text-xp font-pixel text-[10px] max-md:text-[9px]">Tier 1</span></td>
                  <td className="py-2.5 pr-4 max-md:pr-1.5">5+ hrs</td>
                  <td className="py-2.5 pr-4 max-md:pr-1.5">+100 blocks</td>
                  <td className="py-2.5 t-text-muted">~5,600</td>
                </tr>
                <tr className="border-b" style={{ borderColor: 'var(--c-border)' }}>
                  <td className="py-2.5 pr-4 max-md:pr-1.5"><span className="text-xp font-pixel text-[10px] max-md:text-[9px]">Tier 2</span></td>
                  <td className="py-2.5 pr-4 max-md:pr-1.5">10+ hrs</td>
                  <td className="py-2.5 pr-4 max-md:pr-1.5">+200 blocks</td>
                  <td className="py-2.5 t-text-muted">~11,500</td>
                </tr>
                <tr className="border-b" style={{ borderColor: 'var(--c-border)' }}>
                  <td className="py-2.5 pr-4 max-md:pr-1.5"><span className="text-enchant font-pixel text-[10px] max-md:text-[9px]">Tier 3</span></td>
                  <td className="py-2.5 pr-4 max-md:pr-1.5">20+ hrs</td>
                  <td className="py-2.5 pr-4 max-md:pr-1.5">+300 blocks</td>
                  <td className="py-2.5 t-text-muted">~17,800</td>
                </tr>
                <tr className="border-b" style={{ borderColor: 'var(--c-border)' }}>
                  <td className="py-2.5 pr-4 max-md:pr-1.5"><span className="text-gold font-pixel text-[10px] max-md:text-[9px]">Tier 4</span></td>
                  <td className="py-2.5 pr-4 max-md:pr-1.5">30+ hrs</td>
                  <td className="py-2.5 pr-4 max-md:pr-1.5">+400 blocks</td>
                  <td className="py-2.5 t-text-muted">~24,300</td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 max-md:pr-1.5"><span className="text-redstone font-pixel text-[10px] max-md:text-[9px]">Tier 5</span></td>
                  <td className="py-2.5 pr-4 max-md:pr-1.5">40+ hrs</td>
                  <td className="py-2.5 pr-4 max-md:pr-1.5">+500 blocks</td>
                  <td className="py-2.5 t-text-muted">~31,200</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="t-text-muted text-[11px] mt-3">*Approximate new chunks at starting border (1,750 radius). The larger the border gets, the more chunks each expansion reveals.</p>
        </div>

        <div className="mc-panel p-5 mt-4">
          <div className="space-y-3 text-sm t-text-dim">
            <div className="flex gap-2.5">
              <span className="text-xp shrink-0">+</span>
              <span>Playtime is <strong className="t-text">combined</strong> across all players. Everyone contributes.</span>
            </div>
            <div className="flex gap-2.5">
              <span className="text-xp shrink-0">+</span>
              <span>The border expands in all directions equally from spawn.</span>
            </div>
            <div className="flex gap-2.5">
              <span className="text-xp shrink-0">+</span>
              <span>If nobody plays during a week, the border stays put. It never shrinks.</span>
            </div>
            <div className="flex gap-2.5">
              <span className="text-xp shrink-0">+</span>
              <span>Expansion happens automatically every Sunday. Check the <a href="/map" className="text-enchant hover:text-enchant/70 transition-colors underline underline-offset-2">BlueMap</a> to see the current border.</span>
            </div>
          </div>
        </div>
      </section>

      <GrassDivider />

      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <CloudTitle><h2 className="font-pixel text-gold text-lg mb-6 glow-gold">What&apos;s next</h2></CloudTitle>
        <CloudText>
          <p className="t-text-dim leading-relaxed">
            The server&apos;s lean on purpose. If the group wants player shops, bounties, an economy,
            more events — ping carsonxd on Discord. We add features when there&apos;s actually demand
            for them, not because the plugin list looked thin.
          </p>
        </CloudText>
      </section>

      <GrassDivider />

      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center"><CloudTitle><h2 className="font-pixel text-gold text-lg mb-8 glow-gold">Plugins</h2></CloudTitle></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {plugins.map((plugin) => (
            <div key={plugin.name} className="inventory-slot p-3">
              <p className="font-pixel t-text text-[10px] mb-1">{plugin.name}</p>
              <p className="t-text-muted text-xs leading-snug">{plugin.description}</p>
            </div>
          ))}
        </div>
      </section>

      <GrassDivider />

      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <CloudTitle><h2 className="font-pixel text-gold text-lg mb-8 glow-gold">Staff</h2></CloudTitle>
        <div className="flex flex-wrap justify-center gap-6">
          {staff.map((member) => (
            <div key={member.name} className="mc-panel p-4 w-36 text-center">
              <div className="w-16 h-16 mx-auto mb-2 rounded-md overflow-hidden">
                <Image
                  src={member.image}
                  alt={member.name}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="font-pixel t-text text-[10px]">{member.name}</p>
              <p className="text-gold text-xs">{member.role}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
