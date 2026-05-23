import GrassDivider from '@/components/GrassDivider';
import CloudTitle from '@/components/CloudTitle';
import CloudText from '@/components/CloudText';
import Expander from '@/components/Expander';

const roleCards = [
  {
    name: 'Pacifist',
    color: 'text-xp',
    glow: 'glow-xp',
    accent: 'border-xp/40',
    blurb:
      "The default. In the wilderness you can't be killed in PvP — attackers knock you out and can lift one stack from your hotbar. Donate, report, commend, and shape the server without ever swinging a sword.",
  },
  {
    name: 'Outlaw',
    color: 'text-redstone',
    glow: '',
    accent: 'border-redstone/40',
    blurb:
      "Earn it through your actions, not a class pick. Crimes in the wilderness raise your outlaw rep; cross thresholds and you appear on /wanted with a bounty multiplier on your head. There's a road back if you want it.",
  },
  {
    name: 'Lawman',
    color: 'text-gold',
    glow: 'glow-gold',
    accent: 'border-gold/40',
    blurb:
      "Take the Citizen badge after your first outlaw kill. Climb Citizen → Marshal by stacking peaceful rep, violence rep, and unique commendations. Senior Sheriffs and Marshals draw bounties from the Sheriff's Office treasury; deputies adjudicate reports.",
  },
];

const claimRows = [
  { where: 'Your claim', meaning: 'Safest area. PvP and theft locked down by Lands. Reputation system stays out of it entirely.' },
  { where: 'Allied claim', meaning: 'Depends on the trust level the owner gave you.' },
  { where: 'PvP-deny region', meaning: "If a claim or region cancels PvP damage, the rep system never sees the hit. No knockout, no rep, no combat-log timer." },
  { where: 'Wilderness', meaning: 'The frontier. PvP on. Pacifist knockout, theft GUI, rep awards, and combat-log all fire here.' },
];

const knockoutSteps: [string, string][] = [
  ['1', 'First lethal hit is cancelled. Pacifist drops to 1 HP, debuffed, smoke particles — and is fully invulnerable to all damage for the next 30 seconds.'],
  ['2', 'Attacker can right-click within those 30 seconds to open a theft GUI showing the pacifist’s hotbar (slots 0–8).'],
  ['3', 'One stack max. Taking anything = +1 outlaw rep base, plus more if the stack is valuable — a diamond stack costs the attacker more rep than dirt. Logged as an unprovoked-pacifist crime.'],
  ['4', 'On wake-up the pacifist regenerates to full (Regen II) and enters a 5-minute vulnerable cooldown. The knockout will not re-arm during that window — a lethal hit kills outright. That’s +50 outlaw rep, the heaviest single crime in the system.'],
  ['5', 'Inside any PvP-deny claim or region, knockout never fires. Pacifists at home are fully safe.'],
];

const bountySteps: [string, string][] = [
  ['1', "Someone wrongs you. You /report them, or ask a Sheriff directly. Anyone can /donate to grow the Sheriff's Office treasury — the same pool that funds bounty payouts."],
  ['2', 'A Senior Sheriff or Marshal runs /bounty place <target> <amount> to draw that value from the treasury and put it on the target’s head.'],
  ['3', 'The target appears on /wanted with the pool size visible. Anyone non-outlaw can hunt them. Anyone can run /bounty treasury to see what’s available.'],
  ['4', "A non-outlaw kills the target. Anti-collusion check runs (alt-shared IPs void the payout); if clean, the payout goes to the killer."],
  ['5', 'If the target is pardoned or goes inactive, the bounty releases back to the treasury for someone else to draw on.'],
];

const commandsByTier = [
  {
    tier: 'Everyone',
    items: [
      { cmd: '/rep', desc: 'Public rules summary — states, redemption paths, key commands. Auto-shown on first join.' },
      { cmd: '/whois [player]', desc: "Full reputation lookup: state, all three rep pools, tier, recent crimes. Running it on yourself as an outlaw also lists your redemption paths back to peaceful." },
      { cmd: '/wanted', desc: 'Current outlaws ranked by tier with bounty pool visible.' },
      { cmd: '/badge yes|no', desc: 'Accept or decline the Citizen badge after your first outlaw kill.' },
      { cmd: '/commend <player>', desc: 'Award peaceful rep. Limited charges, 7-day cooldown per recipient.' },
      { cmd: '/donate', desc: "Open the donation chest. Items fund the Sheriff's Office treasury; donors earn capped peaceful rep." },
      { cmd: '/report <player> <reason>', desc: 'File a complaint. Requires 2h playtime. 24h cooldown per target.' },
      { cmd: '/bounty list|track <player>', desc: 'View active bounties or get a tracking compass (Lawman+ for tracking).' },
      { cmd: '/bounty treasury', desc: "See the current value sitting in the Sheriff's Office treasury — the shared pool that funds every bounty." },
    ],
  },
  {
    tier: 'Outlaw',
    items: [
      { cmd: '/restitution <victim>', desc: "Open a 27-slot UI to return stolen items. Earns peaceful rep scaled by what's actually valuable (dirt prints ~0, diamonds count), capped at 20 rep/day. Gated on a logged crime against that victim." },
    ],
  },
  {
    tier: 'Sheriff+',
    items: [
      { cmd: '/pardon <player>', desc: "Reduce target's outlaw rep. Sheriff −25%, Senior Sheriff −50%, Marshal −100%. Pacifist-kill rep has a 50% floor — even a Marshal can't fully wipe murder." },
    ],
  },
  {
    tier: 'Deputy+',
    items: [
      { cmd: '/report list|view|approve|deny|reverse', desc: 'Adjudicate filed reports. False reports cost the reporter peaceful rep.' },
    ],
  },
  {
    tier: 'Senior Sheriff+',
    items: [
      { cmd: '/bounty place <player> <amount>', desc: "Place a bounty on a wanted player, drawing the value from the Sheriff's Office treasury. (The legacy item-escrow UI is gone — bounties no longer come out of personal inventory.)" },
    ],
  },
];

const faqs = [
  {
    q: 'Can I be killed in my claim?',
    a: 'No — claims protect against PvP unless you explicitly allow it. The whole point is that your home is your home.',
  },
  {
    q: "What if I'm a pacifist in the wilderness — can I be killed there?",
    a: 'No, not the first hit. Pacifists drop to 1 HP with Slowness, Mining Fatigue, Weakness, and Blindness for 30 seconds, and are fully invulnerable to all damage for that whole window. The attacker can right-click you to open a theft GUI and lift one stack from your hotbar. When you wake up you regenerate to full and enter a 5-minute vulnerable cooldown — a lethal hit during that window kills outright, and that pays the attacker +50 outlaw rep.',
  },
  {
    q: 'What happens if I rob someone?',
    a: 'Robbery only happens via the knockout GUI on a downed pacifist, and only one stack from their hotbar. Taking anything earns +1 outlaw rep. Pacifists in claims are not knocked out and not robbable.',
  },
  {
    q: 'What happens if I kill a pacifist?',
    a: 'Unprovoked kill of a pacifist is +50 outlaw rep — the heaviest crime in the system. Self-defense (you hit the attacker within the last 30 seconds before the kill) is rep-neutral.',
  },
  {
    q: 'Can outlaws become peaceful again?',
    a: "Yes. Pay restitution to people you wronged, take the offline rep decay (~2%/week while logged off), or get a Sheriff+ pardon. Sheriffs can shave 25%, Senior Sheriffs 50%, Marshals 100% — but pacifist-kill rep has a 50% floor that can't be pardoned away. Murder fades, it doesn't get wiped.",
  },
  {
    q: 'Can outlaws claim bounties?',
    a: 'No. Bounties are society paying for justice — not outlaws cashing in on each other. Outlaws hunting outlaws is fine, just unpaid (and rep-neutral on both sides).',
  },
  {
    q: 'How do I become a lawman?',
    a: 'Kill a wanted outlaw — that triggers a one-time prompt. Run /badge yes and you become a Citizen. Climb Citizen → Deputy → Sheriff → Senior Sheriff → Marshal by stacking peaceful rep (clean playtime, donations, restitution), violence rep (more outlaw kills), and commendations from distinct players. Pure builders cap at Citizen; pure murderers cap at Citizen.',
  },
  {
    q: 'What does commending do?',
    a: "Awards the recipient peaceful rep on a 7-day cooldown per pair. Counts toward the unique-commender threshold for the lawman ladder, so it's how the community signals who deserves the badge. Limited charges per commender so it can't be spammed.",
  },
  {
    q: 'Where do bounty items come from?',
    a: "From the Sheriff's Office treasury — a shared pool that anyone can grow by running /donate. Senior Sheriffs and Marshals draw from that pool to place bounties via /bounty place <player> <amount>. The donation pool and the bounty pool are the same pool; the server takes no cut. Run /bounty treasury to see what's in it.",
  },
  {
    q: "Won't outlaws just hide in their claim forever?",
    a: "They can — but they also can't kill, rob, or claim bounties from inside, so they drop out of the game economy entirely. The punishment is boredom. (A v1.1 Lands integration will let lawmen bypass claim PvP-deny on outlaw targets.)",
  },
  {
    q: 'What happens if someone combat logs?',
    a: "If you disconnect within ~10 seconds of taking PvP damage, the system flags a combat-log. Outlaw rep is awarded for the offense, and you die on next login as the penalty. While combat-tagged, /home, /tpa, /spawn, /back, and /warp are all blocked — you fight, flee on foot, or eat the death.",
  },
];

export default function ReputationPage() {
  return (
    <div>
      {/* Hero — visible */}
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
            <strong className="t-text">Live as of launch.</strong> Voted in by the community on{' '}
            <a
              href="/polls#reputation"
              className="text-enchant hover:text-enchant/70 transition-colors underline underline-offset-2"
            >
              the polls page
            </a>
            . Skim the basics below, open any topic for the full mechanics, then go play.
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

      {/* The simple version — visible */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center">
          <CloudTitle>
            <h2 className="font-pixel text-gold text-lg mb-8 glow-gold">The simple version</h2>
          </CloudTitle>
        </div>
        <div className="mc-panel p-6 sm:p-8">
          <div className="space-y-3 text-sm t-text-dim">
            {[
              ['Your claim is your home.', 'Locked down. Safe. The rep system stays out of it.'],
              ['The wilderness is risky.', 'PvP on, rep awards apply, knockout and theft fire here.'],
              ['Pacifists get knocked out, not killed.', 'First hit drops you to 1 HP with debuffs and 30 seconds of full invulnerability. Attackers can lift one stack from your hotbar. After you wake up there’s a 5-minute window where a lethal hit kills outright.'],
              ['Crimes raise your outlaw rep.', 'Kill a pacifist, steal, kill pets or villagers, combat-log — it all leaves a trail.'],
              ['Wanted players can be hunted.', 'Anyone non-outlaw can collect. Outlaws hunting outlaws is allowed but unpaid.'],
              ['Bounties come from the treasury.', 'A shared Sheriff’s Office pool that anyone can grow with /donate. Senior Sheriffs and Marshals draw from it to put bounties on outlaws. The server takes no cut.'],
              ['Lawmen earn the badge.', 'First outlaw kill prompts the badge. Climb the ladder with peaceful rep, violence rep, and commendations from distinct players.'],
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

      {/* Claims vs wilderness — visible */}
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

      {/* Dig deeper — collapsible deep content */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <CloudTitle>
            <h2 className="font-pixel text-gold text-lg mb-4 glow-gold">Dig deeper</h2>
          </CloudTitle>
          <p className="t-text-dim text-sm">Tap any topic for the full mechanics.</p>
        </div>

        <div className="space-y-3">
          <Expander title="Pacifist knockout">
            <p className="t-text-dim leading-relaxed mb-6">
              Pacifists are protected by social cost, not invincibility. In the wilderness, the first
              killing blow is cancelled — the pacifist drops to 1 HP, gets Slowness V / Mining Fatigue
              III / Weakness II / Blindness I for 30 seconds, and the attacker can right-click them to
              open a theft GUI.
            </p>
            <div className="space-y-3 text-sm t-text-dim">
              {knockoutSteps.map(([n, body]) => (
                <div key={n} className="flex gap-3 items-start">
                  <span className="font-pixel text-gold text-[10px] shrink-0 mt-1 w-4">{n}.</span>
                  <span>{body}</span>
                </div>
              ))}
            </div>
          </Expander>

          <Expander title="How rep works">
            <p className="t-text-dim leading-relaxed mb-6">
              Every player carries three rep pools at the same time. Different actions feed
              different pools, and your role is mostly a read-out of which one is winning.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border-2 border-xp/40 rounded-md p-4">
                <h4 className="font-pixel text-xp glow-xp text-xs mb-3">Peaceful rep</h4>
                <p className="t-text-dim text-sm leading-relaxed">
                  Clean playtime (~0.5/hr passive), donations, commending, restitution. Decays slowly.
                  Required for the Lawman ladder.
                </p>
              </div>
              <div className="border-2 border-gold/40 rounded-md p-4">
                <h4 className="font-pixel text-gold glow-gold text-xs mb-3">Violence rep</h4>
                <p className="t-text-dim text-sm leading-relaxed">
                  Killing wanted outlaws. The other half of the Lawman ladder — pure builders never
                  get above Citizen without it.
                </p>
              </div>
              <div className="border-2 border-redstone/40 rounded-md p-4">
                <h4 className="font-pixel text-redstone text-xs mb-3">Outlaw rep</h4>
                <p className="t-text-dim text-sm leading-relaxed">
                  Pacifist kills (+50), spawn-region PvP (+30), lawman kills (+15), knockout-theft,
                  pet and villager kills, combat-logging. Puts you on /wanted. Decays offline
                  (~2%/week), paid down with restitution or a Sheriff+ pardon.
                </p>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--c-border)' }}>
              <p className="t-text-dim text-sm leading-relaxed text-center">
                Lawman promotion is the only place all three matter at once. The ladder gates on
                peaceful rep <strong className="t-text">and</strong> violence rep
                <strong className="t-text"> and</strong> commendations from distinct players — pure
                builders and pure killers both cap at Citizen.
              </p>
            </div>
          </Expander>

          <Expander title="The three roles in detail">
            <div className="space-y-4">
              <RoleSection
                title="Pacifists"
                color="text-xp"
                glow="glow-xp"
                border="border-xp/40"
                tagline="The default. Most players stay here, most of the time."
                points={[
                  'Default state for every new player. New players also get 5 hours of newcomer protection.',
                  "Can't die in wilderness PvP — knocked out at 1 HP and looted for one stack instead.",
                  'Earns peaceful rep passively from clean playtime (~0.5/hr).',
                  'Can /donate items to the rewards pool — donations earn capped peaceful rep weekly.',
                  'Can /report crimes, /commend trustworthy players, and pay /restitution if they slip up.',
                  "Can't be promoted to Lawman without first killing an outlaw and accepting the badge.",
                ]}
              />
              <RoleSection
                title="Outlaws"
                color="text-redstone"
                glow=""
                border="border-redstone/40"
                tagline="A path you walk into through your actions, not a class you pick at signup."
                points={[
                  'Outlaw rep climbs from wilderness crimes. The big ones: pacifist kill +50, spawn-region PvP +30 (unprovoked kills within 100 blocks of spawn — self-defense still counts as provoked here, same as anywhere else), lawman kill +15. Plus knockout-theft (rep scales with the value of what was taken), pet kills, villager kills, and combat-logging.',
                  'Tiers: Drifter (25) → Bandit (75) → Outlaw (175) → Notorious (350) → Legend (600). Bounty multiplier scales 1.0× to 3.0× across them.',
                  'Once over 25 outlaw rep, you appear on /wanted with your tier. Any non-outlaw can hunt you — Lawmen earn violence rep for the kill, and if a Senior Sheriff or Marshal has placed a bounty on you, the killer collects the payout too.',
                  "Self-defense is free — if your victim hit you within 30s of the kill, the kill earns 0 outlaw rep.",
                  'Outlaw-on-outlaw kills are rep-neutral on both sides — private rivalry, not crime. No bounty payout, no /wanted update.',
                  'Three roads back: /restitution (return stolen items for peaceful rep), offline decay (~2%/week), or a Sheriff+ pardon. Pacifist-kill rep is floored at 50% — it fades, it doesn’t wipe.',
                ]}
              />
              <RoleSection
                title="Lawmen"
                color="text-gold"
                glow="glow-gold"
                border="border-gold/40"
                tagline="Earned, not assigned. Killing your first outlaw triggers a one-time badge prompt."
                points={[
                  'Citizen → Deputy → Sheriff → Senior Sheriff → Marshal. The ladder requires both peaceful rep AND violence rep AND commendations from distinct players — pure builders and pure killers both cap at Citizen.',
                  "Deputy+ can adjudicate /report cases (approve, deny, reverse). False reports cost the reporter peaceful rep.",
                  'Sheriff+ can /pardon outlaws — Sheriff −25%, Senior Sheriff −50%, Marshal −100% (with a 50% floor on pacifist-kill rep).',
                  "Senior Sheriffs and Marshals can /bounty place <player> <amount> — drawing the bounty value from the Sheriff's Office treasury (funded by community donations). Anyone can run /bounty treasury to see what's available.",
                  'Killing a pacifist as a Lawman is +50 outlaw rep — the badge is much harder to keep than to earn.',
                  'Lawmen who go inactive 30 days enter Retired (rep frozen until they fight again).',
                ]}
              />
            </div>
          </Expander>

          <Expander title="Bounties">
            <p className="t-text-dim leading-relaxed mb-4">
              <strong className="t-text">Wanted vs. bounty.</strong> Wanted is automatic — once your
              outlaw rep crosses 25 you show up on{' '}
              <code className="font-pixel text-gold text-xs glow-gold">/wanted</code> with your
              tier. A bounty is a separate, optional step: a Senior Sheriff or Marshal has to place
              one from the treasury. A wanted player with no bounty can still be hunted (and Lawmen
              still earn violence rep for the kill), but there&apos;s no payout until someone draws
              from the pool.
            </p>
            <p className="t-text-dim leading-relaxed mb-4">
              Bounties are how the server&apos;s economy buys justice. They&apos;re paid out of the
              Sheriff&apos;s Office treasury — a shared pool that anyone can grow by donating items
              through <code className="font-pixel text-gold text-xs glow-gold">/donate</code>. Senior
              Sheriffs and Marshals draw from that pool to put a price on a wanted player&apos;s head.
            </p>
            <p className="t-text-dim leading-relaxed mb-6">
              The donation pool and the bounty pool are the same pool. The server takes{' '}
              <strong className="t-text">no cut</strong>. Outlaws can&apos;t claim bounties. Run{' '}
              <code className="font-pixel text-gold text-xs glow-gold">/bounty treasury</code>{' '}
              anytime to see what&apos;s in it.
            </p>
            <h4 className="font-pixel text-enchant text-xs mb-4 glow-enchant uppercase tracking-wider">
              How a bounty works
            </h4>
            <div className="space-y-3 text-sm t-text-dim">
              {bountySteps.map(([n, body]) => (
                <div key={n} className="flex gap-3 items-start">
                  <span className="font-pixel text-gold text-[10px] shrink-0 mt-1 w-4">{n}.</span>
                  <span>{body}</span>
                </div>
              ))}
            </div>
          </Expander>

          <Expander title="Commands">
            <div className="space-y-5">
              {commandsByTier.map((group) => (
                <div key={group.tier}>
                  <h4 className="font-pixel text-enchant text-xs mb-3 glow-enchant uppercase tracking-wider">
                    {group.tier}
                  </h4>
                  <div className="space-y-3">
                    {group.items.map((c) => (
                      <div key={c.cmd} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
                        <code className="font-pixel text-gold text-xs glow-gold whitespace-nowrap shrink-0">{c.cmd}</code>
                        <span className="t-text-dim text-sm">{c.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Expander>

          <Expander title="FAQ">
            <div>
              {faqs.map((f) => (
                <Expander key={f.q} title={f.q} variant="faq">
                  {f.a}
                </Expander>
              ))}
            </div>
          </Expander>
        </div>
      </section>

      <GrassDivider />

      {/* Live confirmation + result link — visible */}
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <CloudTitle>
          <h2 className="font-pixel text-gold text-lg mb-6 glow-gold">It&apos;s on.</h2>
        </CloudTitle>
        <CloudText>
          <p className="t-text-dim leading-relaxed mb-6">
            The reputation system is live at launch. The community voted it in on the polls page.
            Wanted posters, bounties, pacifist knockout, the whole frontier.
          </p>
        </CloudText>
        <a
          href="/polls#reputation"
          className="inline-block mc-panel px-6 py-3 font-pixel text-gold text-xs glow-gold hover-surface"
        >
          See the poll result &rarr;
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
