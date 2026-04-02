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

      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <CloudTitle><h2 className="font-pixel text-gold text-lg mb-8 glow-gold">Server Rules</h2></CloudTitle>
        <div className="mc-panel p-6 sm:p-8">
          <div className="space-y-5">
            {rules.map((rule, i) => (
              <div key={i} className="flex gap-4">
                <span className="font-pixel text-gold text-xs shrink-0 w-6">{i + 1}.</span>
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
