import rules from '@/data/rules.json';
import plugins from '@/data/plugins.json';
import GrassDivider from '@/components/GrassDivider';
import CloudTitle from '@/components/CloudTitle';
import CloudText from '@/components/CloudText';

const staff = [
  { name: 'Owner', role: 'Owner', skinName: 'Steve' },
];

export default function AboutPage() {
  return (
    <div>
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <CloudTitle><h1 className="font-pixel text-gold text-2xl sm:text-3xl mb-6 glow-gold">About & Rules</h1></CloudTitle>
        <CloudText>
          <p className="t-text-dim leading-relaxed mb-4">
            mc.pvpers.us is built on a simple idea: Minecraft is best when played with good people and
            minimal interference. We keep the plugin list lean, the rules fair, and the community tight.
          </p>
          <p className="t-text-dim leading-relaxed">
            This is a survival server first. PvP is on, but griefing is not tolerated. Claim your land,
            build your base, and respect your neighbors.
          </p>
        </CloudText>
      </section>

      <GrassDivider />

      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center"><CloudTitle><h2 className="font-pixel text-gold text-lg mb-8 glow-gold">Server Rules</h2></CloudTitle></div>
        <div className="mc-panel p-6 sm:p-8">
          <div className="space-y-5">
            {rules.map((rule, i) => (
              <div key={i} className="flex gap-4 text-left">
                <span className="font-pixel text-gold text-xs shrink-0 w-6 pt-0.5">{i + 1}.</span>
                <div>
                  <h3 className="font-pixel text-enchant text-xs mb-1 glow-enchant">{rule.title}</h3>
                  <p className="t-text-dim text-sm leading-relaxed">{rule.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <GrassDivider />

      <section id="world-border" className="max-w-3xl mx-auto px-4 py-16 scroll-mt-24">
        <div className="text-center">
          <CloudTitle><h2 className="font-pixel text-gold text-lg mb-6 glow-gold">World Border</h2></CloudTitle>
        </div>
        <CloudText>
          <p className="t-text-dim leading-relaxed mb-4 text-center">
            The world doesn&apos;t start infinite. It starts at a <strong className="t-text">1,750-block radius</strong> from
            spawn and grows every week based on how much the community plays together.
          </p>
          <p className="t-text-dim leading-relaxed text-center">
            Every Sunday, our border plugin tallies the total player-hours from the past week and expands the
            border based on which tier the server hit. The more people play, the more world everyone
            gets to explore.
          </p>
        </CloudText>

        <div className="mc-panel p-6 sm:p-8 mt-8">
          <h3 className="font-pixel text-enchant text-xs mb-4 glow-enchant text-center uppercase tracking-wider">Expansion Tiers</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--c-border)' }}>
                  <th className="font-pixel text-gold text-[10px] text-left py-2 pr-4">Tier</th>
                  <th className="font-pixel text-gold text-[10px] text-left py-2 pr-4">Weekly Playtime</th>
                  <th className="font-pixel text-gold text-[10px] text-left py-2 pr-4">Border Expansion</th>
                  <th className="font-pixel text-gold text-[10px] text-left py-2">New Chunks*</th>
                </tr>
              </thead>
              <tbody className="t-text-dim">
                <tr className="border-b" style={{ borderColor: 'var(--c-border)' }}>
                  <td className="py-2.5 pr-4"><span className="text-xp font-pixel text-[10px]">Tier 1</span></td>
                  <td className="py-2.5 pr-4">5+ hours</td>
                  <td className="py-2.5 pr-4">+100 blocks</td>
                  <td className="py-2.5 t-text-muted">~5,600</td>
                </tr>
                <tr className="border-b" style={{ borderColor: 'var(--c-border)' }}>
                  <td className="py-2.5 pr-4"><span className="text-xp font-pixel text-[10px]">Tier 2</span></td>
                  <td className="py-2.5 pr-4">10+ hours</td>
                  <td className="py-2.5 pr-4">+200 blocks</td>
                  <td className="py-2.5 t-text-muted">~11,500</td>
                </tr>
                <tr className="border-b" style={{ borderColor: 'var(--c-border)' }}>
                  <td className="py-2.5 pr-4"><span className="text-enchant font-pixel text-[10px]">Tier 3</span></td>
                  <td className="py-2.5 pr-4">20+ hours</td>
                  <td className="py-2.5 pr-4">+350 blocks</td>
                  <td className="py-2.5 t-text-muted">~21,000</td>
                </tr>
                <tr className="border-b" style={{ borderColor: 'var(--c-border)' }}>
                  <td className="py-2.5 pr-4"><span className="text-gold font-pixel text-[10px]">Tier 4</span></td>
                  <td className="py-2.5 pr-4">40+ hours</td>
                  <td className="py-2.5 pr-4">+500 blocks</td>
                  <td className="py-2.5 t-text-muted">~31,200</td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4"><span className="text-redstone font-pixel text-[10px]">Tier 5</span></td>
                  <td className="py-2.5 pr-4">80+ hours</td>
                  <td className="py-2.5 pr-4">+750 blocks</td>
                  <td className="py-2.5 t-text-muted">~49,800</td>
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
              <span>Playtime is <strong className="t-text">combined</strong> across all players &mdash; everyone contributes.</span>
            </div>
            <div className="flex gap-2.5">
              <span className="text-xp shrink-0">+</span>
              <span>The border expands in all directions equally from spawn.</span>
            </div>
            <div className="flex gap-2.5">
              <span className="text-xp shrink-0">+</span>
              <span>If nobody plays during a week, the border stays where it is &mdash; it never shrinks.</span>
            </div>
            <div className="flex gap-2.5">
              <span className="text-xp shrink-0">+</span>
              <span>Expansion happens automatically every Sunday. Check the <a href="/map" className="text-enchant hover:text-enchant/70 transition-colors underline underline-offset-2">BlueMap</a> to see the current border.</span>
            </div>
          </div>
        </div>
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
              <div className="w-16 h-16 mx-auto mb-2 t-surface-light rounded-md" />
              <p className="font-pixel t-text text-[10px]">{member.name}</p>
              <p className="text-gold text-xs">{member.role}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
