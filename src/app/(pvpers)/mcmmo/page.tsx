import GrassDivider from '@/components/GrassDivider';
import CloudTitle from '@/components/CloudTitle';
import CloudText from '@/components/CloudText';
import Expander from '@/components/Expander';

const skillGroups = [
  {
    name: 'Gathering',
    color: 'text-xp',
    glow: 'glow-xp',
    accent: 'border-xp/40',
    blurb: "The bread and butter. Mine, chop, dig, farm, fish. Your numbers go up just for playing.",
    skills: ['Mining', 'Woodcutting', 'Excavation', 'Herbalism', 'Fishing'],
  },
  {
    name: 'Combat',
    color: 'text-redstone',
    glow: '',
    accent: 'border-redstone/40',
    blurb: "Pick your weapon and it gets better at killing things. PvP awards rep, so choose your fights.",
    skills: ['Swords', 'Axes', 'Unarmed', 'Archery', 'Crossbows', 'Maces', 'Tridents', 'Spears', 'Taming'],
  },
  {
    name: 'Crafting & utility',
    color: 'text-gold',
    glow: 'glow-gold',
    accent: 'border-gold/40',
    blurb: "Quietly multiply your output. More potions per brew, more durability per repair, less damage per fall.",
    skills: ['Acrobatics', 'Alchemy', 'Repair', 'Smelting', 'Salvage'],
  },
];

const simpleRules: [string, string][] = [
  ['Every action you take levels something.', 'Swing a pick, level Mining. Brew a potion, level Alchemy. The numbers just go up.'],
  ['Passive bonuses kick in immediately.', 'Even at low levels you get small chances at double drops, extra durability, faster XP. Compounds fast.'],
  ['Active abilities unlock at higher levels.', 'Right-click with the right tool to trigger them: Super Breaker, Tree Feller, Serrated Strikes, Berserk, and the rest. Short cooldowns.'],
  ['Power Level is the sum of every skill.', 'It’s the bragging-rights number. /mctop power shows the leaderboard.'],
  ['Parties pool XP and grant teleports.', '/party create, then /ptp to a partymate. Useful for friend groups grinding together.'],
  ['mcMMO XP is separate from vanilla XP.', "Killing a zombie levels both Swords (mcMMO) and your vanilla XP bar. They don't compete."],
];

const skillDetails = [
  {
    name: 'Mining',
    passive: 'Double drops on stone, ore, and netherrack chance scales with level.',
    active: 'Super Breaker: right-click with a pickaxe to break stone at maximum speed and triple drop rate for a short window.',
  },
  {
    name: 'Woodcutting',
    passive: 'Double drops on logs. Higher chance for sapling drops.',
    active: 'Tree Feller: right-click with an axe and chop the entire tree in one swing. Watch your axe durability.',
  },
  {
    name: 'Excavation',
    passive: 'Dirt, gravel, sand, etc. roll for bonus drops including buried treasure (string, gunpowder, gold, the works).',
    active: 'Giga Drill Breaker: right-click with a shovel to dig at max speed with triple drops.',
  },
  {
    name: 'Herbalism',
    passive: 'Double drops on crops, mushrooms, melon/pumpkin. Auto-replant on right-click. Chance for hylian-luck drops from tall grass.',
    active: 'Green Terra: right-click a hoe on a crop to trigger area-of-effect triple drops.',
  },
  {
    name: 'Fishing',
    passive: 'Better loot tables. Magic hunter pulls enchanted gear, junk converts to materials, treasure pulls scale with level.',
    active: 'Shake: left-click a fish you’ve hooked to shake items off of certain mobs.',
  },
  {
    name: 'Swords',
    passive: 'Bleed on hit (DoT), counter-attack reflects melee damage, deeper wound at higher levels.',
    active: 'Serrated Strikes: right-click with a sword to cleave nearby enemies with guaranteed bleed.',
  },
  {
    name: 'Axes',
    passive: 'Critical strike chance, armor impact (durability damage on hit), skull splitter scales the cleave damage.',
    active: 'Skull Splitter: right-click with an axe to cleave a 1-block AoE around your target.',
  },
  {
    name: 'Unarmed',
    passive: 'Iron Arm (bonus melee damage), Disarm (chance to knock a weapon out of an opponent’s hand), Arrow Deflect.',
    active: 'Berserk: right-click with an empty hand to enter a damage-boost / instant-break-dirt window.',
  },
  {
    name: 'Archery',
    passive: 'Skill shot (damage bonus), daze (chance to confuse on hit), arrow retrieval from corpses.',
    active: 'No active. Pure passive scaling.',
  },
  {
    name: 'Taming',
    passive: 'Wolves hit harder and survive longer, gain Fast Foot Work (dodge), Holy Hound (regen from food). Use Beast Lore on a tamed mob to inspect its stats.',
    active: 'Call of the Wild: summon a wolf or ocelot by holding the right item.',
  },
  {
    name: 'Acrobatics',
    passive: 'Reduced fall damage, dodge melee attacks. Roll on impact (sneak while falling) to convert big falls into nothing.',
    active: 'No active. Staying alive longer is the active.',
  },
  {
    name: 'Alchemy',
    passive: 'Faster brewing, access to special tier potions (Decay, Cleansing, etc.) the higher you go.',
    active: 'No active. Passive only.',
  },
  {
    name: 'Repair',
    passive: 'Anvil repairs gain Arcane Forging, so enchantments survive at higher rates as you level. Reduced material cost on iron/diamond repairs.',
    active: 'No active. Passive only.',
  },
  {
    name: 'Salvage',
    passive: 'Recover materials from gear at an anvil instead of just disenchanting. Higher levels recover more.',
    active: 'No active. Passive only.',
  },
  {
    name: 'Smelting',
    passive: '2x vanilla XP from smelting, chance for double ore output, faster furnace burn at high levels.',
    active: 'No active. Passive only.',
  },
];

const commandGroups = [
  {
    tier: 'Look at your stats',
    items: [
      { cmd: '/mcmmo help', desc: 'Top-level menu with links to every other command.' },
      { cmd: '/mcstats', desc: 'Your full skill levels in one screen.' },
      { cmd: '/mining', desc: 'Detailed breakdown for a single skill (works for every skill name).' },
      { cmd: '/mctop <skill>', desc: 'Server leaderboard for the given skill. Omit the skill name for Power Level.' },
      { cmd: '/inspect <player>', desc: "Look at another player's stats." },
    ],
  },
  {
    tier: 'Parties',
    items: [
      { cmd: '/party create <name>', desc: 'Start a new party.' },
      { cmd: '/party invite <player>', desc: 'Invite someone. They accept with /party accept.' },
      { cmd: '/ptp <player>', desc: 'Teleport to a partymate. Cooldown applies.' },
      { cmd: '/p <message>', desc: 'Party chat.' },
      { cmd: '/party leave', desc: 'Leave the party.' },
    ],
  },
  {
    tier: 'Abilities',
    items: [
      { cmd: '/mcability', desc: "Toggle ability activation on/off if you don't want right-click triggering Super Breaker mid-mining." },
      { cmd: '/mcnotify', desc: 'Toggle the chat notifications when abilities activate or refresh.' },
    ],
  },
];

const tips: [string, string][] = [
  ['Mining and Woodcutting level fastest.', "If you want to feel progress quickly, swing a pickaxe at stone or an axe at oak. Numbers go up in minutes."],
  ['Activate abilities by right-clicking with the matching tool.', "Pickaxe to Super Breaker, axe to Tree Feller or Skull Splitter (which one fires depends on what you're looking at), shovel to Giga Drill Breaker, fist to Berserk, sword to Serrated Strikes."],
  ['Watch your tool durability during active abilities.', "Super Breaker and Tree Feller burn through pickaxes and axes fast. Bring backups."],
  ['Salvage before disenchanting.', "Once Salvage is high enough, you get materials AND enchants back. Strictly better than vanilla anvil work."],
  ['Acrobatics levels itself.', "Take fall damage, level Acrobatics. Eventually you stop taking fall damage. Just play."],
  ['Disable abilities if you’re mining for shape, not speed.', "Run /mcability off so right-click doesn't accidentally Super Breaker a block you wanted left intact."],
];

export default function McmmoPage() {
  return (
    <div>
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <CloudTitle>
          <h1 className="font-pixel text-gold text-2xl sm:text-3xl mb-6 glow-gold">
            mcMMO
          </h1>
        </CloudTitle>
        <CloudText>
          <p className="t-text-dim leading-relaxed mb-4">
            Nineteen skills, passive bonuses on everything you do, active abilities at higher
            levels. Mine faster, chop trees in one swing, brew exotic potions, dodge fall damage.
            The longer you play, the more your numbers compound.
          </p>
          <p className="t-text-dim leading-relaxed">
            <strong className="t-text">Live as of launch.</strong> Voted in by the community on{' '}
            <a
              href="/polls#mcmmo"
              className="text-enchant hover:text-enchant/70 transition-colors underline underline-offset-2"
            >
              the polls page
            </a>
            . Specific XP rates and ability tuning may get adjusted post-launch based on how the
            curve feels. Pipe up in Discord if something&apos;s off.
          </p>
        </CloudText>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
          {skillGroups.map((group) => (
            <div
              key={group.name}
              className={`mc-panel p-6 gradient-border border-2 ${group.accent}`}
            >
              <h3 className={`font-pixel ${group.color} ${group.glow} text-sm mb-3`}>{group.name}</h3>
              <p className="t-text-dim text-sm leading-relaxed text-left mb-4">{group.blurb}</p>
              <ul className="space-y-1 text-left">
                {group.skills.map((s) => (
                  <li key={s} className="t-text-dim text-xs font-pixel">{s}</li>
                ))}
              </ul>
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
            {simpleRules.map(([head, sub]) => (
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

      {/* Dig deeper */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <CloudTitle>
            <h2 className="font-pixel text-gold text-lg mb-4 glow-gold">Dig deeper</h2>
          </CloudTitle>
          <p className="t-text-dim text-sm">Tap any topic for the full breakdown.</p>
        </div>

        <div className="space-y-3">
          <Expander title="Every skill, line by line">
            <p className="t-text-dim leading-relaxed mb-6">
              Each skill has passive bonuses that kick in immediately and (for most) an active
              ability you trigger by right-clicking the matching tool. Levels go up by doing the
              action. No XP grind menu, no points to allocate.
            </p>
            <div className="space-y-4">
              {skillDetails.map((s) => (
                <div key={s.name} className="border-l-2 border-gold/40 pl-4">
                  <h4 className="font-pixel text-gold text-xs glow-gold mb-2">{s.name}</h4>
                  <p className="t-text-dim text-sm mb-1.5">
                    <strong className="t-text">Passive:</strong> {s.passive}
                  </p>
                  <p className="t-text-dim text-sm">
                    <strong className="t-text">Active:</strong> {s.active}
                  </p>
                </div>
              ))}
            </div>
          </Expander>

          <Expander title="Commands">
            <div className="space-y-5">
              {commandGroups.map((group) => (
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

          <Expander title="Getting started: practical tips">
            <div className="space-y-3 text-sm t-text-dim">
              {tips.map(([head, body]) => (
                <div key={head} className="flex gap-3 items-start">
                  <span className="text-xp shrink-0 font-pixel text-[10px] mt-1">&#9656;</span>
                  <span>
                    <strong className="t-text">{head}</strong> {body}
                  </span>
                </div>
              ))}
            </div>
          </Expander>

          <Expander title="How mcMMO plays with reputation & PvP">
            <p className="t-text-dim leading-relaxed mb-3">
              Combat skills (Swords, Axes, Unarmed, Archery) level up from real fights, which means
              wilderness PvP. Wilderness PvP runs through the{' '}
              <a href="/reputation" className="text-enchant hover:text-enchant/70 transition-colors underline underline-offset-2">
                reputation system
              </a>
              , so grinding combat XP off pacifists will earn you outlaw rep fast. Mob kills are
              clean. Grind on zombies, skeletons, and animals if you don&apos;t want a bounty on
              your head.
            </p>
            <p className="t-text-dim leading-relaxed">
              Lawmen who fight outlaws get to grind combat skills <em>and</em> violence rep at the
              same time. That overlap is intentional; the badge has perks.
            </p>
          </Expander>
        </div>
      </section>

      <GrassDivider />

      {/* Live confirmation */}
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <CloudTitle>
          <h2 className="font-pixel text-gold text-lg mb-6 glow-gold">It&apos;s on.</h2>
        </CloudTitle>
        <CloudText>
          <p className="t-text-dim leading-relaxed mb-6">
            mcMMO is live at launch. The community voted in the full version: every skill,
            no lite mode.
          </p>
        </CloudText>
        <a
          href="/polls#mcmmo"
          className="inline-block mc-panel px-6 py-3 font-pixel text-gold text-xs glow-gold hover-surface"
        >
          See the poll result &rarr;
        </a>
      </section>
    </div>
  );
}
