import GrassDivider from '@/components/GrassDivider';
import CloudTitle from '@/components/CloudTitle';
import CloudText from '@/components/CloudText';

const roleCards = [
  {
    name: 'Pacifist',
    color: 'text-xp',
    glow: 'glow-xp',
    accent: 'border-xp/40',
    blurb:
      'Build, trade, donate, and shape the server without living for PvP. The default. Safer in claims, can fund bounties, can report and commend.',
  },
  {
    name: 'Outlaw',
    color: 'text-redstone',
    glow: '',
    accent: 'border-redstone/40',
    blurb:
      "Rob, raid, and pick fights — the frontier remembers. Outlaws appear on wanted lists, can be hunted, and earn infamy. There's a road back if you want it.",
  },
  {
    name: 'Lawman',
    color: 'text-gold',
    glow: 'glow-gold',
    accent: 'border-gold/40',
    blurb:
      'Hunt outlaws, collect bounties, and earn the badge. Earned through community commendations — not handed out by staff.',
  },
];

const claimRows = [
  { where: 'Your claim', meaning: 'Safest area. PvP and theft locked down by your permissions.' },
  { where: 'Allied claim', meaning: 'Depends on the trust level the owner gave you.' },
  { where: 'Wilderness', meaning: 'The frontier. PvP on. Reputation actions count fully here.' },
  { where: 'Outlaw hideout', meaning: 'Safer if you stay passive, riskier the moment you fight.' },
];

const commands = [
  { cmd: '/reputation', desc: 'Check your own rep, infamy, and active flags.' },
  { cmd: '/wanted', desc: 'See the current wanted list and active bounties.' },
  { cmd: '/whois <player>', desc: "Look up another player's role, rep, and history." },
  { cmd: '/bounty', desc: 'Place or fund a bounty on a wanted player.' },
  { cmd: '/report', desc: 'Report a crime witnessed in the wilderness.' },
  { cmd: '/commend', desc: 'Commend a player whose conduct earned it.' },
  { cmd: '/restitution', desc: "Pay off your debts as an outlaw to start clearing your name." },
];

const faqs = [
  {
    q: 'Can I be killed in my claim?',
    a: 'No — claims protect against PvP unless you explicitly allow it. The whole point is that your home is your home.',
  },
  {
    q: 'What happens if I rob someone?',
    a: 'In the wilderness, robbery raises your outlaw rep. In a claim where you have build trust, it depends on what the owner allowed — but if you abuse trust, expect consequences.',
  },
  {
    q: 'What happens if I kill a pacifist?',
    a: 'Heavier outlaw rep hit than killing another outlaw. Pacifists can also fund bigger bounties on the player who killed them.',
  },
  {
    q: 'Can outlaws become peaceful again?',
    a: "Yes. Pay restitution to people you wronged, take the rep decay over time, and either earn a community pardon or just wait it out. Nobody's stuck.",
  },
  {
    q: 'Can outlaws claim bounties?',
    a: 'No. Bounties are society paying for justice — not outlaws cashing in on each other. Outlaws hunting outlaws is fine, just unpaid.',
  },
  {
    q: 'How do I become a lawman?',
    a: 'Hunt wanted outlaws and collect commendations from other players. Lawmen are confirmed by community trust, not appointed.',
  },
  {
    q: 'What does commending do?',
    a: "It's how the community signals who's trustworthy. Commendations from established players carry more weight, so it can't be farmed by alts.",
  },
  {
    q: 'Are bounties server-generated?',
    a: 'No. Every bounty is funded by a player escrowing real items. The server takes no cut.',
  },
  {
    q: 'What happens if someone combat logs?',
    a: 'They take the death anyway, items drop, and combat-logging on a wanted offender adds to their outlaw rep on top.',
  },
];

export default function ReputationPage() {
  return (
    <div>
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <CloudTitle>
          <h1 className="font-pixel text-gold text-2xl sm:text-3xl mb-6 glow-gold">
            The Frontier Reputation System
          </h1>
        </CloudTitle>
        <CloudText>
          <p className="t-text-dim leading-relaxed mb-4">
            Choose your path: stay peaceful, become wanted, or earn the badge. Your actions in the
            wilderness build a story the server actually remembers.
          </p>
          <p className="t-text-dim leading-relaxed">
            This is a <strong className="t-text">proposal</strong>, not a feature — we want to know
            if there&apos;s appetite for it before we build it. There&apos;s a poll on{' '}
            <a
              href="/polls#reputation"
              className="text-enchant hover:text-enchant/70 transition-colors underline underline-offset-2"
            >
              the polls page
            </a>{' '}
            asking exactly that. Read the rest of this page, then go vote.
          </p>
        </CloudText>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
          {roleCards.map((role) => (
            <div
              key={role.name}
              className={`mc-panel p-6 gradient-border border-2 ${role.accent}`}
            >
              <h3 className={`font-pixel ${role.color} ${role.glow} text-sm mb-3`}>{role.name}</h3>
              <p className="t-text-dim text-sm leading-relaxed text-left">{role.blurb}</p>
            </div>
          ))}
        </div>
      </section>

      <GrassDivider />

      {/* The simple version */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center">
          <CloudTitle>
            <h2 className="font-pixel text-gold text-lg mb-8 glow-gold">The simple version</h2>
          </CloudTitle>
        </div>
        <div className="mc-panel p-6 sm:p-8">
          <div className="space-y-3 text-sm t-text-dim">
            {[
              ['Your claim is your home.', 'Locked down. Safe. Your rules.'],
              ['The wilderness is risky.', 'PvP on, reputation matters here.'],
              ['Crimes make you wanted.', 'Killing, robbing, raiding — it leaves a trail.'],
              ['Wanted players can be hunted.', 'Anyone can come collect.'],
              ['Bounties are funded by players.', 'Society pays for justice. Not the server.'],
              ['Lawmen are chosen by the community.', 'Earned through commendations, not handed out.'],
            ].map(([head, sub]) => (
              <div key={head} className="flex gap-3 items-start">
                <span className="text-xp shrink-0 font-pixel text-[10px] mt-1">&#9656;</span>
                <span>
                  <strong className="t-text">{head}</strong> {sub}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <GrassDivider />

      {/* Claims vs wilderness */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center">
          <CloudTitle>
            <h2 className="font-pixel text-gold text-lg mb-6 glow-gold">Claims vs wilderness</h2>
          </CloudTitle>
        </div>
        <CloudText>
          <p className="t-text-dim leading-relaxed text-center">
            Claims are protected by Lands. The wilderness is the frontier. Where something happens
            matters as much as what happened.
          </p>
        </CloudText>

        <div className="mc-panel p-6 sm:p-8 max-md:p-3 mt-8">
          <div className="overflow-x-auto">
            <table className="w-full text-sm max-md:text-xs">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--c-border)' }}>
                  <th className="font-pixel text-gold text-[10px] text-left py-2 pr-4">Where</th>
                  <th className="font-pixel text-gold text-[10px] text-left py-2">What it means</th>
                </tr>
              </thead>
              <tbody className="t-text-dim">
                {claimRows.map((row) => (
                  <tr key={row.where} className="border-b last:border-b-0" style={{ borderColor: 'var(--c-border)' }}>
                    <td className="py-3 pr-4 font-pixel text-[10px] t-text whitespace-nowrap">{row.where}</td>
                    <td className="py-3 leading-relaxed">{row.meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <GrassDivider />

      {/* Roles deep-dive */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center">
          <CloudTitle>
            <h2 className="font-pixel text-gold text-lg mb-8 glow-gold">The three roles</h2>
          </CloudTitle>
        </div>

        <div className="space-y-6">
          <RoleSection
            title="Pacifists"
            color="text-xp"
            glow="glow-xp"
            border="border-xp/40"
            tagline="The default. Most players stay here, most of the time."
            points={[
              'Starts as the role for every new player.',
              'Stronger PvP protections in claims and around spawn.',
              'Can fund bounties and place them on wanted players.',
              'Can /report crimes they witness in the wilderness.',
              'Can /commend other players whose conduct earned it.',
              'Can still be involved in the system — economy, justice, rebuilding — without ever swinging a sword.',
            ]}
          />

          <RoleSection
            title="Outlaws"
            color="text-redstone"
            glow=""
            border="border-redstone/40"
            tagline="A path you walk into through your actions, not a class you pick at signup."
            points={[
              'Outlaw rep climbs from killing pacifists, robbing, raiding, and griefing in the wilderness.',
              'High enough rep and you appear on the wanted list with a bounty cap.',
              'Anyone can hunt you — pacifists who funded the bounty get a cut, lawmen claim the rest.',
              'Infamy stacks on top of rep. High infamy makes you a marked target but also a legend.',
              'Pay restitution to people you wronged, take the rep decay, or earn a community pardon to come back.',
              'Outlaws cannot claim official bounties on other outlaws.',
            ]}
          />

          <RoleSection
            title="Lawmen"
            color="text-gold"
            glow="glow-gold"
            border="border-gold/40"
            tagline="Earned, not assigned. Staff doesn't appoint lawmen — the community does."
            points={[
              'Promotion gated by commendations from established players, not raw bounty count.',
              'Higher rank unlocks stronger tracking tools and a larger share of bounty payouts.',
              'Helps resolve /report cases when staff aren’t around.',
              'Loses standing fast for killing pacifists or going rogue — the badge is harder to keep than to earn.',
              'Can coordinate posses for high-infamy targets.',
            ]}
          />
        </div>
      </section>

      <GrassDivider />

      {/* Bounties */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center">
          <CloudTitle>
            <h2 className="font-pixel text-gold text-lg mb-6 glow-gold">Bounties</h2>
          </CloudTitle>
        </div>
        <CloudText>
          <p className="t-text-dim leading-relaxed mb-4">
            Bounties are how the server&apos;s economy buys justice. Every bounty is funded by a real
            player escrowing real items — diamonds, netherite, whatever the wronged party thinks the
            grudge is worth.
          </p>
          <p className="t-text-dim leading-relaxed">
            The server takes <strong className="t-text">no cut</strong>. Outlaws can&apos;t claim
            bounties. The pool is what someone else paid in, and it goes to whoever brings the
            outlaw down.
          </p>
        </CloudText>

        <div className="mc-panel p-6 sm:p-8 mt-8">
          <h3 className="font-pixel text-enchant text-xs mb-4 glow-enchant text-center uppercase tracking-wider">
            How a bounty works
          </h3>
          <div className="space-y-3 text-sm t-text-dim">
            {[
              ['1', 'Someone wrongs you. You /bounty <player> with the items you want to escrow.'],
              ['2', 'The bounty is locked in escrow. The target appears on the wanted list with the pool size visible.'],
              ['3', 'A non-outlaw kills the target in legitimate PvP.'],
              ['4', 'Pool pays out: a share to the funder for funding, the rest to the killer.'],
              ['5', 'If the bounty expires unclaimed, items return to the funder minus a small frontier tax (burned, not pocketed).'],
            ].map(([n, body]) => (
              <div key={n} className="flex gap-3 items-start">
                <span className="font-pixel text-gold text-[10px] shrink-0 mt-1 w-4">{n}.</span>
                <span>{body}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <GrassDivider />

      {/* Commands */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center">
          <CloudTitle>
            <h2 className="font-pixel text-gold text-lg mb-8 glow-gold">Commands</h2>
          </CloudTitle>
        </div>
        <div className="mc-panel p-6 sm:p-8">
          <div className="space-y-3">
            {commands.map((c) => (
              <div key={c.cmd} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
                <code className="font-pixel text-enchant text-xs glow-enchant whitespace-nowrap">{c.cmd}</code>
                <span className="t-text-dim text-sm">{c.desc}</span>
              </div>
            ))}
          </div>
          <p className="t-text-muted text-xs mt-6 text-center italic">
            Command names aren&apos;t final — these are placeholders for what the system would expose.
          </p>
        </div>
      </section>

      <GrassDivider />

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center">
          <CloudTitle>
            <h2 className="font-pixel text-gold text-lg mb-8 glow-gold">FAQ</h2>
          </CloudTitle>
        </div>
        <div className="space-y-3">
          {faqs.map((f) => (
            <details
              key={f.q}
              className="mc-panel p-5 group cursor-pointer"
            >
              <summary className="font-pixel text-enchant text-xs glow-enchant flex items-center justify-between gap-4 list-none">
                <span>{f.q}</span>
                <span className="text-gold text-sm transition-transform group-open:rotate-45 shrink-0">+</span>
              </summary>
              <p className="t-text-dim text-sm leading-relaxed mt-3">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <GrassDivider />

      {/* Vote CTA */}
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <CloudTitle>
          <h2 className="font-pixel text-gold text-lg mb-6 glow-gold">Want this?</h2>
        </CloudTitle>
        <CloudText>
          <p className="t-text-dim leading-relaxed mb-6">
            None of this exists yet. If the group wants it, we&apos;ll build it. If the group
            doesn&apos;t, we won&apos;t. The vote is the whole reason this page is here.
          </p>
        </CloudText>
        <a
          href="/polls#reputation"
          className="inline-block mc-panel px-6 py-3 font-pixel text-gold text-xs glow-gold hover-surface"
        >
          Vote on the cowboy poll &rarr;
        </a>
      </section>
    </div>
  );
}

function RoleSection({
  title,
  color,
  glow,
  border,
  tagline,
  points,
}: {
  title: string;
  color: string;
  glow: string;
  border: string;
  tagline: string;
  points: string[];
}) {
  return (
    <div className={`mc-panel p-6 sm:p-8 border-2 ${border}`}>
      <h3 className={`font-pixel ${color} ${glow} text-sm mb-2`}>{title}</h3>
      <p className="t-text-muted text-xs italic mb-5">{tagline}</p>
      <ul className="space-y-2 text-sm t-text-dim">
        {points.map((p) => (
          <li key={p} className="flex gap-2.5 items-start">
            <span className={`${color} shrink-0 mt-1`}>&bull;</span>
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
