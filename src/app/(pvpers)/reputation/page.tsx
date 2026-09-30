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
      "The default. Until you type /pvp on, no other player can hurt, knock out or rob you anywhere but the colosseum ring. Opt in and the wilderness gets real: attackers can knock you out and take up to 3 grabs of 16 items each. Donate, report, commend, and shape the server without ever swinging a sword.",
  },
  {
    name: 'Outlaw',
    color: 'text-redstone',
    glow: '',
    accent: 'border-redstone/40',
    blurb:
      "Earn it through your actions, not a class pick. Crimes in the wilderness raise your outlaw rep; hit 25 and you're on /wanted, fair game for any non-outlaw, even inside a claim. There's a road back if you want it.",
  },
  {
    name: 'Lawman',
    color: 'text-gold',
    glow: 'glow-gold',
    accent: 'border-gold/40',
    blurb:
      "Kill a wanted outlaw and take the badge. You start as a Civilian and climb Citizen → Marshal by stacking peaceful rep, violence rep, and unique commendations. Sheriffs and up hand out pardons; deputies handle minor reports.",
  },
];

const claimRows = [
  { where: 'Your claim', meaning: "Safest area. PvP and theft locked down by Lands, unless you're an Outlaw: any player with PvP on can hit an Outlaw inside any claim, their own included." },
  { where: 'Allied claim', meaning: 'Depends on the trust level the owner gave you.' },
  { where: 'PvP-deny region', meaning: "If a claim or region cancels PvP damage, the rep system never sees the hit. No knockout, no rep, no combat tag. The exception is an Outlaw victim: those hits go through." },
  { where: 'Wilderness', meaning: "The frontier, for everyone who has PvP on (opted-in Pacifists, Outlaws, Lawmen). Knockout, theft GUI, rep awards, and the combat tag all fire here. A Pacifist who never typed /pvp on can't be hit by other players, even out here." },
  { where: 'Colosseum ring', meaning: "Always a PvP zone outside events: anyone in the ring has PvP on, whether or not they typed /pvp on. Walking in asks you to confirm. Kills in the ring never affect rep. Die there and your items drop on the ring floor, no grave. Colosseum Night (8 PM Arizona) is different: everyone fights in the same Knight kit, gets their own gear back after, and the winner takes a fixed chest of $500, 4 diamonds, 8 XP bottles and one jackpot roll (team modes split the cash). During any event, the event's own rules apply." },
];

const knockoutSteps: [string, string][] = [
  ['1', 'First lethal hit is cancelled. Pacifist drops to 1 HP, debuffed, smoke particles — and is fully invulnerable to all damage for the next 30 seconds.'],
  ['2', 'The attacker who knocked them out (and only them) can right-click within those 30 seconds to open a theft GUI showing the pacifist’s hotbar and main inventory. Armor, offhand and shulker boxes can’t be taken.'],
  ['3', 'Up to 3 grabs, each capped at 16 items. Any robbery is logged as ROBBERY and makes you Wanted: it bills 1 + 0.25 outlaw rep per diamond-equivalent taken (rounded up), and if you were under 25 it tops you up to Drifter. Sixteen dirt still puts you on the board. The same victim can’t be robbed again for 60 minutes, and accounts that have shared an IP can’t rob each other.'],
  ['4', 'On wake-up the pacifist gets Regen II for 5 seconds (about 2 hearts) and enters a 5-minute vulnerable cooldown. The knockout will not re-arm during that window — a lethal hit kills outright and counts as murder, whoever lands it: +50 outlaw rep, or +75 if the victim is a newcomer. Self-defense doesn’t cover that finisher. The one exception is an honest duel: nothing was stolen and the victim hit their killer after waking.'],
  ['5', 'Log out while knocked out and you leave a logout body (see the combat-log FAQ).'],
  ['6', 'Inside any PvP-deny claim or region, knockout never fires. Pacifists at home are fully safe, and so is any Pacifist who hasn’t typed /pvp on.'],
];

const bountySteps: [string, string][] = [
  ['1', 'Someone on /wanted wronged you, or just needs bringing in.'],
  ['2', 'Anyone who isn’t an Outlaw runs /bounty place <player> <amount> (2500, 2,500 and 2.5k all work; $250 minimum, no maximum). The money leaves your balance right away and sits on the target’s head. It’s announced server-wide and written up in the Gazette.'],
  ['3', 'Other players can stack their own bounties on the same outlaw. /bounty list shows one line per outlaw with the total and how many people posted.'],
  ['4', "A non-outlaw kills the target and every bounty on them pays out to the killer in cash. If the killer and a poster shared an IP in the last 14 days, that poster's bounty goes back to them instead. Kill someone you posted on yourself and you just get your own money back."],
  ['5', 'If a pardon frees the target (drops them below Drifter), or the target goes 30 days inactive, the money goes back to the posters, straight to their balance even if they’re offline.'],
];

const lawmanRanks: [string, number, number, number][] = [
  ['Citizen', 30, 5, 0],
  ['Deputy', 60, 10, 1],
  ['Sheriff', 170, 15, 3],
  ['Senior Sheriff', 300, 70, 4],
  ['Marshal', 450, 100, 5],
];

const violenceByTier: [string, number][] = [
  ['Drifter', 10],
  ['Bandit', 20],
  ['Outlaw', 40],
  ['Notorious', 75],
  ['Legend', 150],
];

const commandsByTier = [
  {
    tier: 'Everyone',
    items: [
      { cmd: '/rep', desc: 'Public rules summary — states, redemption paths, key commands. Your first join shows a short welcome pointing you at /rep help.' },
      { cmd: '/whois <player>', desc: "Full reputation lookup: state, all three rep pools, tier, recent crimes. Running it on yourself as an outlaw also lists your redemption paths back to peaceful." },
      { cmd: '/wanted [player]', desc: 'The top 5 outlaws by outlaw rep. Add a name to see that outlaw’s poster.' },
      { cmd: '/pvp on|off|status', desc: 'Opt in or out of PvP. /pvp on unlocks after 5 hours of playtime, toggles have a 30-minute cooldown, and you can’t toggle while combat-tagged. Outlaws and Lawmen are locked on.' },
      { cmd: '/badge yes|no', desc: 'Accept or decline the badge within 60 seconds of your first outlaw kill. Yes makes you a Lawman at rank Civilian until you hit Citizen’s thresholds.' },
      { cmd: '/commend <player> <reason>', desc: 'Give someone +5 peaceful rep. The reason is required. You earn 1 charge per 10 active hours (max 8 stored), with a 6-hour cooldown per recipient. Outlaws can’t commend.' },
      { cmd: '/commend list [player]', desc: 'See commendations.' },
      { cmd: '/denounce <player> <reason>', desc: 'The flip side of a commend, and it spends a commend charge. Needs 5 hours of play; max 3 a day, once per target per week. Two or more denouncers on different connections within 7 days puts it in the staff queue, where staff can confirm a minor (−10) or serious (−25) peaceful rep hit (outlaw rep instead, for Outlaws).' },
      { cmd: '/donate', desc: "Open the donation chest. Items go into the Sheriff's Office reward pool, which pays Lawmen's automatic reward drops. Donors earn up to 10 peaceful rep a week; Outlaws earn none." },
      { cmd: '/daily', desc: "Show your daily login reward streak — current streak, best streak, and what tomorrow pays. The reward pays out once you've played 10 minutes (not AFK) that day, for up to 2 accounts per connection." },
      { cmd: '/rep title hide', desc: 'Hide your lawman/outlaw title in chat, Tab and above your head. (The ⚔ for an opted-in Pacifist still shows while PvP is on.)' },
      { cmd: '/report <player> <reason>', desc: 'File a complaint. Requires 2h playtime. 24h cooldown per target.' },
      { cmd: '/bounty place <player> <amount>', desc: "Put your own cash on an Outlaw's head. Anyone but Outlaws can post; $250 minimum, no maximum. Pacifists and Retired can post once every 48 hours, Lawmen as often as they like. Refunded if a pardon frees the target or they go 30 days inactive." },
      { cmd: '/bounty list|track <player>', desc: 'See every outlaw with a bounty and its total, or get a tracking compass on an Outlaw. Anyone can track; it’s accurate to ±100 blocks with a 10-minute cooldown.' },
      { cmd: '/bounty treasury', desc: "See what's in the Sheriff's Office reward pool — the donated items that pay Lawmen's reward drops. Separate from posted bounties." },
    ],
  },
  {
    tier: 'Outlaw',
    items: [
      { cmd: '/restitution <victim>', desc: "Open a 27-slot UI to give back to someone you wronged. It pays down the outlaw rep you owe that victim, robbery first, at 0.25 per diamond-equivalent. Only raw diamonds, emeralds, netherite and their blocks earn credit; gear still gets delivered but credits nothing. No peaceful rep, no daily cap. Gated on a logged crime against that victim." },
    ],
  },
  {
    tier: 'Sheriff+',
    items: [
      { cmd: '/pardon <player>', desc: "Reduce target's outlaw rep. Sheriff −25% (targets up to Bandit), Senior Sheriff −50% (up to Outlaw tier), Marshal −100%. One pardon per target per 7 days, across all pardoners. Floor: 30% of pacifist and newcomer murder rep, plus all robbery rep not yet repaid with /restitution. Even a Marshal can't wipe that." },
    ],
  },
  {
    tier: 'Deputy+',
    items: [
      { cmd: '/report list|view|approve|deny|reverse', desc: 'Adjudicate filed reports. Deputies can approve minor reports only; denying a report as false and reversing are Sheriff+ (a Marshal can reverse anytime, others within 24h). One approved report per target per 7 days. False reports cost the reporter 10 peaceful rep.' },
    ],
  },
];

const faqs = [
  {
    q: 'Can I be killed in my claim?',
    a: "Not unless you're an Outlaw. Claims protect against PvP unless you explicitly allow it — the whole point is that your home is your home. Outlaws give that up: any player with PvP on can hit an Outlaw inside any claim, their own included.",
  },
  {
    q: "What if I'm a pacifist in the wilderness — can I be killed there?",
    a: 'Not if you leave PvP off: until you type /pvp on, other players can\'t hurt you anywhere outside the colosseum ring. If you opt in, still not on the first hit. Pacifists drop to 1 HP with Slowness, Mining Fatigue, Weakness, and Blindness for 30 seconds, and are fully invulnerable to all damage for that whole window. The attacker can right-click you to open a theft GUI and take up to 3 grabs of 16 items each from your hotbar or main inventory (never armor, offhand or shulker boxes). When you wake up you get Regen II for 5 seconds and enter a 5-minute vulnerable cooldown — a lethal hit during that window kills outright, and that costs the attacker +50 outlaw rep (+75 if you\'re a newcomer).',
  },
  {
    q: 'What happens if I rob someone?',
    a: "Robbery only happens via the knockout GUI on a downed pacifist who has PvP turned on: up to 3 grabs of 16 items each from their hotbar or main inventory. Armor, offhand and shulker boxes are off-limits. Any robbery makes you Wanted. It's logged as ROBBERY, bills 1 + 0.25 outlaw rep per diamond-equivalent taken (rounded up), and tops you up to Drifter (25) if you were below that. The same victim can't be robbed again for 60 minutes, and accounts that have shared an IP can't rob each other. Pacifists in claims are not knocked out and not robbable.",
  },
  {
    q: 'What happens if I kill a pacifist?',
    a: "Unprovoked kill of a pacifist is +50 outlaw rep, and +75 if they're a newcomer (under 5 hours played) — the heaviest crime in the system. Self-defense (they hit you within the 30 seconds before the kill) is rep-neutral, except for a finisher during their post-knockout cooldown. One more carve-out: a Pacifist with PvP on who kills another opted-in Pacifist gets 0 rep, since both signed up for it. The +50 applies when the killer is a Lawman or an Outlaw.",
  },
  {
    q: 'Can outlaws become peaceful again?',
    a: "Yes. /restitution pays down what you owe a victim. Offline decay takes ~2%/week while you're logged off, and after 7 crime-free days you also lose 1 outlaw rep per active hour online. Dying to a Lawman knocks off 2% (naked) to 15% (a full kit of 30+ diamond-equivalent), but never below 66% of your unrepaid murder and robbery rep. Or get a Sheriff+ pardon: Sheriffs shave 25%, Senior Sheriffs 50%, Marshals 100%, floored at 30% of murder rep plus all unrepaid robbery. Drop below 25 and you're a Pacifist again. Murder fades, it doesn't get wiped.",
  },
  {
    q: 'Can outlaws claim bounties?',
    a: 'No. Bounties are society paying for justice — not outlaws cashing in on each other. Outlaws hunting outlaws is fine, just unpaid (and rep-neutral on both sides).',
  },
  {
    q: 'How do I become a lawman?',
    a: "Kill a wanted outlaw — that triggers a one-time prompt, and you have 60 seconds to answer. Run /badge yes and you're a Lawman at rank Civilian. Hit 30 peaceful and 5 violence rep to make Citizen, then climb Deputy → Sheriff → Senior Sheriff → Marshal by stacking peaceful rep (clean playtime, donations, being commended), violence rep (more outlaw kills), and commendations from distinct players in the last 90 days. The thresholds are in the Lawman ranks section above. A pure builder never gets the badge at all, since it takes an outlaw kill.",
  },
  {
    q: 'What does commending do?',
    a: "Gives the recipient +5 peaceful rep, with a 6-hour cooldown per recipient. It counts toward the unique-commender threshold for the lawman ladder, so it's how the community signals who deserves the badge. You earn 1 charge per 10 active hours, max 8 stored, so it can't be spammed. Trading commends back and forth gets flagged to staff.",
  },
  {
    q: 'Where does bounty money come from?',
    a: "From other players. Anyone who isn't an Outlaw can /bounty place <player> <amount> out of their own balance ($250 minimum), and the killer gets the total in cash. It's money moving between players, so no new money gets made. If a pardon frees the target or they go 30 days inactive, the posters get their money back. The /donate reward pool is a separate thing: donated items pay the automatic reward drops Lawmen get for killing outlaws (bigger for higher tiers), capped server-wide at 50 diamonds and 20 netherite a week. Run /bounty treasury to see what's in it.",
  },
  {
    q: "Won't outlaws just hide in their claim forever?",
    a: "They can't. Outlaws lose claim protection: any player with PvP on can hit an Outlaw inside any claim, the Outlaw's own included.",
  },
  {
    q: 'What happens if someone combat logs?',
    a: "Quit within 10 seconds of taking PvP damage, or while knocked out, and you leave a logout body: a mannequin holding your whole inventory, armor and offhand included, for 5 minutes. Anyone can loot it, and looting it is never a crime. Whatever's left comes back when you log in. No outlaw rep, no death on return, just whatever the other guy walked off with. While combat-tagged, /home, /tpa, /tpaccept, /back, /warp, /spawn, /rtp, /wild and /event join|spectate|key are blocked, and you can't toggle /pvp. You fight, flee on foot, or eat the loss.",
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
              ['Your claim is your home.', 'Locked down. Safe. Unless you’re an Outlaw: Outlaws can be hit inside any claim, their own included.'],
              ['The wilderness is risky, if you have PvP on.', 'Rep awards apply, knockout and theft fire here. Leave PvP off and other players can’t touch you, even out here.'],
              ['Opted-in Pacifists get knocked out, not killed.', 'First hit drops you to 1 HP with debuffs and 30 seconds of full invulnerability. Attackers can take up to 3 grabs of 16 items each (never armor, offhand or shulker boxes). After you wake up there’s a 5-minute window where a lethal hit kills outright.'],
              ['Crimes raise your outlaw rep.', 'Kill a pacifist, rob, kill pets or villagers — it all leaves a trail. Any robbery at all puts you on /wanted.'],
              ['Logging out mid-fight leaves a body.', 'Quit within 10 seconds of PvP damage, or while knocked out, and your inventory stays behind in a lootable body for 5 minutes.'],
              ['Wanted players can be hunted.', 'Anyone non-outlaw can collect. Rep and reward drops only pay on the first kill of a given outlaw each 24 hours; posted bounties pay whoever gets the kill. Outlaws hunting outlaws is allowed but unpaid.'],
              ['Bounties are cash.', 'Anyone but an Outlaw can put their own money on an outlaw’s head, and the killer takes the total. Separately, the /donate reward pool pays Lawmen an automatic item drop for outlaw kills.'],
              ['Lawmen earn the badge.', 'First outlaw kill prompts the badge. You start as a Civilian and climb with peaceful rep, violence rep, and commendations from distinct players.'],
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
              A Pacifist who never typed <code className="text-gold">/pvp on</code> can&apos;t be hit
              by other players outside the colosseum ring, so none of this applies to them. Once a Pacifist opts in,
              they&apos;re protected by social cost, not invincibility. In the wilderness, the first
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
                  Clean playtime (2.0/hr of genuinely active play on a crime-free day, capped at
                  12/day), donations (up to 10/week), being commended (+5). Never decays. Required
                  for the Lawman ladder.
                </p>
              </div>
              <div className="border-2 border-gold/40 rounded-md p-4">
                <h4 className="font-pixel text-gold glow-gold text-xs mb-3">Violence rep</h4>
                <p className="t-text-dim text-sm leading-relaxed">
                  Killing wanted outlaws: Drifter 10, Bandit 20, Outlaw 40, Notorious 75, Legend
                  150. Only the first kill of a given outlaw per 24 hours (server-wide) counts. A
                  Lawman killed by an Outlaw loses 5. The other half of the Lawman ladder.
                </p>
              </div>
              <div className="border-2 border-redstone/40 rounded-md p-4">
                <h4 className="font-pixel text-redstone text-xs mb-3">Outlaw rep</h4>
                <p className="t-text-dim text-sm leading-relaxed">
                  Newcomer kills (+75), pacifist kills (+50), lawman kills (+15), robbery (1 + 0.25
                  per diamond-equivalent, and never less than Drifter), pet and villager kills,
                  upheld reports. Puts you on /wanted at 25. Decays offline (~2%/week) and online
                  after 7 crime-free days; paid down with restitution, dying to a Lawman, or a
                  Sheriff+ pardon.
                </p>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--c-border)' }}>
              <p className="t-text-dim text-sm leading-relaxed text-center">
                Lawman promotion is the only place all three matter at once. Every rank gates on
                peaceful rep <strong className="t-text">and</strong> violence rep, and from Deputy up
                on commendations from distinct players too. Nobody climbs on one pool alone.
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
                  "PvP is off until you type /pvp on, which unlocks after 5 hours of playtime: until then no other player can hurt, knock out or rob you. The one exception is the colosseum ring, where everyone has PvP on outside events.",
                  "Opted in, you still can't die on the first hit in wilderness PvP — knocked out at 1 HP and looted for up to 3 grabs of 16 items instead.",
                  'Two opted-in Pacifists fighting each other is consensual: a kill between them costs 0 rep.',
                  'Earns peaceful rep from clean, active playtime (2.0/hr, up to 12 a day). Peaceful rep never decays.',
                  "Can /donate items to the Sheriff's Office treasury — donations earn up to 10 peaceful rep a week.",
                  'Can /report crimes, /commend or /denounce players, and pay /restitution if they slip up.',
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
                  'Outlaw rep climbs from wilderness crimes. The big ones: newcomer kill +75 (victim under 5 hours played), pacifist kill +50, lawman kill +15. Robbery bills 1 + 0.25 per diamond-equivalent taken and always lands you at Drifter or higher. Pet and villager kills count too, but on their own they can’t take you past 24.',
                  'Spawn-region PvP is +30 on the books, but PvP is blocked within 100 blocks of spawn, so in practice it almost never comes up.',
                  'Tiers: Drifter (25) → Bandit (75) → Outlaw (175) → Notorious (350) → Legend (600). The higher your tier, the bigger the reward drop for the Lawman who takes you down.',
                  'At 25 outlaw rep you appear on /wanted with your tier. Any non-outlaw can hunt you — Lawmen earn violence rep and a reward drop for the kill, and if anyone has put a bounty on you, the killer collects that cash too.',
                  'You lose claim protection: any player with PvP on can hit you inside any claim, your own included.',
                  "Self-defense is free — if your victim hit you within 30s of the kill, the kill earns 0 outlaw rep.",
                  'Outlaw-on-outlaw kills are rep-neutral on both sides — private rivalry, not crime. No bounty payout, no /wanted update.',
                  'Roads back: /restitution (pays down what you owe a victim, robbery first), offline decay (~2%/week), online decay after 7 crime-free days (−1 per active hour), dying to a Lawman (2%–15% off, scaled by the gear you carried, floored at 66% of unrepaid murder and robbery rep), or a Sheriff+ pardon (floored at 30% of murder rep plus all unrepaid robbery). Drop below 25 and you’re a Pacifist again. Murder fades, it doesn’t wipe.',
                  'Die to a Lawman and you get 30 seconds of respawn invulnerability.',
                ]}
              />
              <RoleSection
                title="Lawmen"
                color="text-gold"
                glow="glow-gold"
                border="border-gold/40"
                tagline="Earned, not assigned. Killing your first outlaw triggers a one-time badge prompt (60 seconds to answer)."
                points={[
                  '/badge yes starts you at Civilian. From there it’s Citizen → Deputy → Sheriff → Senior Sheriff → Marshal, each gated on peaceful rep, violence rep and unique commenders (see Lawman ranks below).',
                  'Deputies can approve minor /report cases. Sheriff+ handle the rest, plus denying false reports and reversing (Marshals anytime, others within 24h). False reports cost the reporter 10 peaceful rep.',
                  'Sheriff+ can /pardon outlaws — Sheriff −25% (up to Bandit), Senior Sheriff −50% (up to Outlaw tier), Marshal −100%. One pardon per target per 7 days. Floor: 30% of murder rep plus all unrepaid robbery.',
                  "Lawmen can post cash bounties with /bounty place <player> <amount> as often as they like (Pacifists and Retired wait 48 hours between posts).",
                  'Killing an outlaw also pays an automatic item reward drop from the /donate reward pool, scaled to the outlaw’s tier and capped server-wide at 50 diamonds and 20 netherite a week. Rep and reward drops only pay on the first kill of a given outlaw per 24 hours (server-wide).',
                  'Killing a pacifist as a Lawman is +50 outlaw rep — the badge is much harder to keep than to earn. Die to an Outlaw and you lose 5 violence rep.',
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
              tier. A bounty is a separate, optional step: somebody has to put up their own money.
              Most wanted players have no bounty at all. They can still be
              hunted, and Lawmen still earn violence rep and an automatic reward drop for the kill.
            </p>
            <p className="t-text-dim leading-relaxed mb-4">
              Bounties are cash.{' '}
              <code className="font-pixel text-gold text-xs glow-gold">/bounty place &lt;player&gt; &lt;amount&gt;</code>{' '}
              takes the money off your balance and puts it on the target&apos;s head. Anyone but an
              Outlaw can post ($250 minimum, no maximum). Pacifists and Retired players can post
              once every 48 hours; Lawmen have no cooldown. Bounties stack, and whoever brings the
              target down gets the total. Outlaws can&apos;t post or claim bounties.
            </p>
            <p className="t-text-dim leading-relaxed mb-6">
              The Sheriff&apos;s Office reward pool is separate, grown by anyone through{' '}
              <code className="font-pixel text-gold text-xs glow-gold">/donate</code>. It pays the
              automatic reward drops Lawmen get for outlaw kills (bigger drops for higher tiers),
              capped server-wide at 50 diamonds and 20 netherite a week. Those drops only pay on the
              first kill of a given outlaw each 24 hours. Run{' '}
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

          <Expander title="Lawman ranks">
            <p className="t-text-dim leading-relaxed mb-6">
              <code className="font-pixel text-gold text-xs glow-gold">/badge yes</code> makes you a
              Lawman at rank Civilian. Each rank above that needs all three numbers at once. Unique
              commenders count distinct players who commended you in the last 90 days.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm max-md:text-xs">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--c-border)' }}>
                    <th className="font-pixel text-gold text-[10px] text-left py-2 pr-4">Rank</th>
                    <th className="font-pixel text-gold text-[10px] text-right py-2 pr-4">Peaceful</th>
                    <th className="font-pixel text-gold text-[10px] text-right py-2 pr-4">Violence</th>
                    <th className="font-pixel text-gold text-[10px] text-right py-2">Commenders</th>
                  </tr>
                </thead>
                <tbody className="t-text-dim">
                  {lawmanRanks.map(([rank, peaceful, violence, commenders]) => (
                    <tr key={rank} className="border-b last:border-b-0" style={{ borderColor: 'var(--c-border)' }}>
                      <td className="py-2.5 pr-4 font-pixel text-[10px] t-text whitespace-nowrap">{rank}</td>
                      <td className="py-2.5 pr-4 text-right">{peaceful}</td>
                      <td className="py-2.5 pr-4 text-right">{violence}</td>
                      <td className="py-2.5 text-right">{commenders}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h4 className="font-pixel text-enchant text-xs mt-8 mb-4 glow-enchant uppercase tracking-wider">
              Violence rep per outlaw kill
            </h4>
            <div className="grid grid-cols-5 max-md:grid-cols-3 gap-2 text-center">
              {violenceByTier.map(([tier, amount]) => (
                <div key={tier} className="mc-panel px-2 py-3">
                  <div className="font-pixel text-gold text-sm glow-gold">+{amount}</div>
                  <div className="t-text-muted text-[10px] uppercase tracking-wider mt-1">{tier}</div>
                </div>
              ))}
            </div>
            <p className="t-text-muted text-xs italic mt-4 text-center">
              Only the first kill of a given outlaw per 24 hours (server-wide) pays. A Lawman killed
              by an Outlaw loses 5.
            </p>
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
