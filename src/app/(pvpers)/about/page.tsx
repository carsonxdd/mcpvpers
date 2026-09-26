import Image from 'next/image';
import Link from 'next/link';
import rules from '@/data/rules.json';
import plugins from '@/data/plugins.json';
import GrassDivider from '@/components/GrassDivider';
import CloudTitle from '@/components/CloudTitle';
import CloudText from '@/components/CloudText';
import LiveBorderStatus from '@/components/LiveBorderStatus';
import BorderTiers from '@/components/BorderTiers';
import Expander from '@/components/Expander';

const staff = [
  { name: 'carsonxd', role: 'Owner', image: '/staff/carsonxd.jpg' },
];

// Season 2 in-game guardrails. Every line here is something the Pi-side config must actually
// enforce. Verify before changing the copy.
// "Cover after a teleport" has no Outlaw exception because the Season 2 reputation build (PiReputation
// 1.9.0, merged into FrontierReputation, which prod ships as of 2026-09-25) makes the Outlaw override
// respect teleport/spawn/respawn protection. If prod ever rolls back to an older reputation jar,
// Outlaws can be hit during teleport protection again: restore the exception.
const guardrails = [
  {
    title: 'PvP is opt-in.',
    body: "Other players can't hit or shoot you unless you've typed /pvp on (the colosseum pit is the one exception). Toggling it has a 30-minute cooldown, so you can't flip it on just to ambush someone.",
  },
  {
    title: 'Cover after a teleport.',
    body: "For 5 seconds after any teleport you can't hit anyone and nobody can hit you, so /tpa can't be used to jump somebody.",
  },
  {
    title: 'Spawn is safe ground.',
    body: 'The Dappled Forest within 100 blocks of spawn is public land. No claiming, other players can’t attack you, and fire doesn’t spread or burn there.',
  },
  {
    title: 'You can always pass through.',
    body: "Walking into someone's land and flying over it with an elytra are always allowed. Owners can't turn those off. Building, chests and doors stay locked to trusted players.",
  },
  {
    title: 'Land needs upkeep.',
    body: 'Every land pays $1 per chunk per day from its land bank. If the bank can’t cover it, the land loses its newest chunks and whatever’s on them is unprotected. The owner’s own balance is never touched. That clears out abandoned claims without an admin.',
  },
  {
    title: 'Fighting has a home.',
    body: 'Step into the colosseum pit and PvP is on for you, whether or not you’ve typed /pvp on (during an event, the event’s own rules apply). Kills there never touch anyone’s rep. Every night at 8 PM Arizona the pit hosts Colosseum Night, a PvP event where you keep your gear. Any other time, a death in the pit is a normal death and you lose your gear.',
  },
];

export default function AboutPage() {
  return (
    <div>
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <CloudTitle><h1 className="font-pixel text-gold text-2xl sm:text-3xl mb-6 glow-gold">About</h1></CloudTitle>
        <CloudText>
          <p className="t-text-dim leading-relaxed mb-4">
            mc.pvpers.us runs on a simple idea: the fewer rules a server has, the more interesting it
            gets. We don&apos;t curate playstyles. We give you the tools (Lands claims, a cowboy-style
            reputation system, mcMMO, an arena events system, a player-driven economy, proximity
            voice chat) and let the world fill in around them.
          </p>
          <p className="t-text-dim leading-relaxed mb-4">
            If you want to build, claim your land and build. If you want to fight, the wilderness is
            right there. Just know your rep is on the line. If you want to sit in a base and farm
            pumpkins for six months, also fine. The point is that none of those are the
            &ldquo;right&rdquo; way to play here.
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
            Claims keep your stuff safe. The wilderness keeps things interesting. The{' '}
            <a href="/reputation" className="text-enchant hover:text-enchant/70 transition-colors underline underline-offset-2">
              reputation system
            </a>{' '}
            keeps violence consequential. Pacifists choose whether to fight (and keep one-hit-kill
            protection either way), outlaws end up on wanted posters, and lawmen earn the badge by
            taking outlaws down. Past that, we trust
            people to figure it out. When they don&apos;t, the world&apos;s consequences usually
            handle it better than a rulebook would.
          </p>
          <p className="t-text-dim leading-relaxed mb-4">
            Season 1 showed us where that falls short. Teleporting to someone and killing them point
            blank, or one geared player camping spawn, is technically inside the rules and still
            ruins someone&apos;s night. So instead of more rules, Season 2 adds guardrails: things
            the server itself won&apos;t let happen. See the list below.
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

        <div className="text-center mt-12">
          <CloudTitle><h2 className="font-pixel text-gold text-lg mb-8 glow-gold">The guardrails</h2></CloudTitle>
        </div>
        <div className="mc-panel p-6 sm:p-8">
          <p className="t-text-dim text-sm leading-relaxed mb-4">
            These aren&apos;t rules you have to remember. The server enforces them, so nobody has to
            argue about it on Discord.
          </p>
          <ul className="space-y-2.5 text-sm t-text-dim list-none">
            {guardrails.map((g) => (
              <li key={g.title} className="flex gap-2.5">
                <span className="text-xp shrink-0">+</span>
                <span><strong className="t-text">{g.title}</strong> {g.body}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <GrassDivider />

      <section id="play-a-part" className="max-w-3xl mx-auto px-4 py-16 scroll-mt-24">
        <div className="text-center">
          <CloudTitle><h2 className="font-pixel text-gold text-lg mb-6 glow-gold">Play a part</h2></CloudTitle>
        </div>
        <CloudText className="mb-8">
          <p className="t-text-dim leading-relaxed mb-4 text-center">
            Season 2 leans into roleplay. The pieces were already here: a sheriff&apos;s ladder, wanted
            posters, bounties, restitution, sign shops. What was missing was people talking to each
            other. So we&apos;re not adding a rule. We&apos;re adding reasons.
          </p>
          <p className="t-text-dim leading-relaxed text-center">
            Nobody gets punished for playing solo or staying quiet. These are bonuses, not chores.
          </p>
        </CloudText>
        <div className="mc-panel p-6 sm:p-8">
          <h3 className="font-pixel text-bronze text-[10px] uppercase tracking-widest mb-4">
            Live from day one
          </h3>
          <ul className="space-y-2.5 text-sm t-text-dim list-none">
            <li className="flex gap-2.5"><span className="text-xp shrink-0">+</span><span><strong className="t-text">Titles you can see.</strong> Your rank shows before your name in chat, in the Tab list and above your head: Deputy, Sheriff, Senior Sheriff, Marshal, or Drifter, Bandit, Outlaw, Notorious, Legend of the Frontier. Pacifists and new players show no title, but a Pacifist who typed <code className="text-gold">/pvp on</code> gets a small ⚔ so people know they&apos;ll fight. Rather not? <code className="text-gold">/rep title hide</code> hides yours (the ⚔ still shows while PvP is on).</span></li>
            <li className="flex gap-2.5"><span className="text-xp shrink-0">+</span><span><strong className="t-text">Voice bonus.</strong> Stay connected to Simple Voice Chat for 60 seconds straight on a day you log in and you get +50% of that day&apos;s login-reward money, once a day. <code className="text-gold">/daily</code> shows whether today&apos;s bonus is paid. The server only checks whether you&apos;re connected: nothing tracks who talks or for how long.</span></li>
            <li className="flex gap-2.5"><span className="text-xp shrink-0">+</span><span><strong className="t-text">Sunday shoutouts.</strong> <code className="text-gold">/commend &lt;player&gt; &lt;reason&gt;</code> the people who made your week. Every Sunday at 6 PM Arizona the top 3 of the past 7 days get posted in Discord and announced in-game, with a quote or two from their commendations. It counts how many different players commended you, so friends can&apos;t farm it, and you need at least 2. A quiet week posts nothing.</span></li>
            <li className="flex gap-2.5"><span className="text-xp shrink-0">+</span><span><strong className="t-text">Towns pay less upkeep.</strong> Lands with more active members get a discount: 2 active members 10% off, 3–4 get 20%, 5 or more get 30%. Active means trusted in the land and online in the last 7 days, and each player counts toward one land only (the one they own, otherwise the one they&apos;re trusted in with the most chunks). Nations get it too. <code className="text-gold">/upkeep</code> shows your cost, active members, discount and next charge. The discount only applies if your bank can cover the discounted amount.</span></li>
            <li className="flex gap-2.5"><span className="text-xp shrink-0">+</span><span><strong className="t-text">Market Day.</strong> Every Saturday 7:00–7:55 PM Arizona at the market next to spawn (<code className="text-gold">/warp market</code>). Anyone can put up a stall there, and fire, explosions and PvP are off. Staff clear the stalls weekly. At 7:55 it&apos;s off to the colosseum for Colosseum Night at 8. <code className="text-gold">/marketday</code> shows the next one.</span></li>
            <li className="flex gap-2.5"><span className="text-xp shrink-0">+</span><span><strong className="t-text">The Frontier Gazette.</strong> Short Wild West write-ups when someone makes Sheriff, Senior Sheriff or Marshal, becomes Notorious or a Legend of the Frontier, a bounty is posted or collected, the End is unsealed, the border grows, or Market Day opens. They post in Discord and on{' '}<a href="/news" className="text-enchant hover:text-enchant/70 transition-colors underline underline-offset-2">the news page</a>.</span></li>
          </ul>
        </div>
      </section>

      <GrassDivider />

      <section id="whats-live" className="max-w-3xl mx-auto px-4 py-16 scroll-mt-24">
        <div className="text-center">
          <CloudTitle>
            <h2 className="font-pixel text-gold text-lg mb-6 glow-gold">Plugins &amp; world rules</h2>
          </CloudTitle>
        </div>
        <CloudText className="mb-10">
          <p className="t-text-dim leading-relaxed text-center">
            Many of these systems were voted in by the community. Tap any topic for an
            explanation and use case. Full vote counts on{' '}
            <a href="/polls" className="text-enchant hover:text-enchant/70 transition-colors underline underline-offset-2">
              the polls page
            </a>
            .
          </p>
        </CloudText>

        <h3 className="font-pixel text-gold text-xs glow-gold uppercase tracking-widest mb-4">
          Plugins
        </h3>
        <div className="space-y-3 mb-10">
          <Expander title="Cowboy reputation system">
            <p className="t-text-dim leading-relaxed mb-3">
              The reputation plugin is on at launch. Wilderness PvP runs through three rep pools
              (peaceful, violence, outlaw) and decides whether you&apos;re a Pacifist (safe by
              default, can opt into PvP with <code className="text-gold">/pvp on</code> to hunt
              outlaws and climb the Lawman ladder), an Outlaw on the wanted list, or a Lawman
              wearing the badge.
            </p>
            <p className="t-text-dim leading-relaxed">
              Full mechanics, command list, and FAQ are on{' '}
              <a href="/reputation" className="text-enchant hover:text-enchant/70 transition-colors underline underline-offset-2">
                the reputation page
              </a>
              .
            </p>
          </Expander>

          <Expander title="mcMMO">
            <p className="t-text-dim leading-relaxed mb-3">
              Full mcMMO is on. Every skill, no lite version. Mining, woodcutting, swords,
              archery, alchemy, and the rest level up as you use them, unlocking special abilities
              like Super Breaker and Tree Feller.
            </p>
            <p className="t-text-dim leading-relaxed">
              Skill list, commands, and tips on{' '}
              <a href="/mcmmo" className="text-enchant hover:text-enchant/70 transition-colors underline underline-offset-2">
                the mcMMO page
              </a>
              . Specific XP rates may get tuned post-launch based on how the curve feels.
            </p>
          </Expander>

          <Expander title="Arena events: Boss Rush & PvP">
            <p className="t-text-dim leading-relaxed mb-3">
              A colosseum stands about 650 blocks from spawn and it&apos;s running events.{' '}
              <code className="text-gold">/event</code> opens the hub: co-op{' '}
              <strong className="t-text">Boss Rush</strong> raids against six bosses with Pit
              difficulty levels and above-vanilla-cap <strong className="t-text">Pitforged</strong>{' '}
              loot, plus <strong className="t-text">TDM/FFA arena PvP</strong> that pays out cash.
              Every player carries a Raid Key (<code className="text-gold">/event key</code>) to
              start their own raids.
            </p>
            <p className="t-text-dim leading-relaxed mb-3">
              <strong className="t-text">New in Season 2: Colosseum Night.</strong> Every night at
              8 PM Arizona the colosseum runs a PvP event, with the mode rotating from night to
              night. Rewards come from the raid loot tables, scaled by how many players take part.
              During Colosseum Night you keep your gear, and there&apos;s no grave to run back to.
            </p>
            <p className="t-text-dim leading-relaxed mb-3">
              <strong className="t-text">The pit is always a PvP zone.</strong> Whenever
              there&apos;s no event running, anyone in the colosseum pit has PvP on, whether or not
              they&apos;ve typed <code className="text-gold">/pvp on</code>. Walking in asks you to
              confirm first. Kills in the pit never affect anyone&apos;s rep.{' '}
              <strong className="t-text">Outside events you don&apos;t keep your gear:</strong> a
              death in the pit is a normal death. During an event, the event&apos;s own rules apply.
            </p>
            <p className="t-text-dim leading-relaxed">
              Full raids, payouts, loot tables, and live boards on{' '}
              <a href="/events" className="text-enchant hover:text-enchant/70 transition-colors underline underline-offset-2">
                the events hub
              </a>
              .
            </p>
          </Expander>

          <Expander title="Economy: shop & market">
            <p className="t-text-dim leading-relaxed mb-3">
              The Frontier runs on real money. Everyone starts with{' '}
              <strong className="t-text">$300</strong>; you earn from events and selling to the{' '}
              <code className="text-gold">/shop</code> (daily-ticker pricing), and trade with other
              players on the <code className="text-gold">/market</code>.{' '}
              <code className="text-gold">/bal</code>, <code className="text-gold">/baltop</code>,
              and <code className="text-gold">/pay</code> for everyone.
            </p>
            <p className="t-text-dim leading-relaxed">
              How money works, the price ticker, and the market are all on{' '}
              <a href="/economy" className="text-enchant hover:text-enchant/70 transition-colors underline underline-offset-2">
                the economy page
              </a>
              .
            </p>
          </Expander>

          <Expander title="Lands: claims & safe zones">
            <p className="t-text-dim leading-relaxed mb-3">
              Use <code className="text-gold">/lands</code> to claim chunks you want to protect.
              Defaults already shut down basically everything: TNT, creepers, lava griefing, chest
              stealing, PvP, the works. Your home is your home.
            </p>
            <p className="t-text-dim leading-relaxed mb-3">
              <strong className="t-text">The one tweak worth making after you claim:</strong>{' '}
              open <code className="text-gold">/lands</code> → Flags → turn off{' '}
              <code className="text-gold">MONSTER_SPAWN</code>. It&apos;s on by default so the
              world feels alive, but most people don&apos;t want zombies popping into their base.
            </p>
            <p className="t-text-dim leading-relaxed mb-3">
              <strong className="t-text">New in Season 2: upkeep.</strong> Every land pays{' '}
              <strong className="t-text">$1 per chunk per day</strong>, collected at 9 PM Arizona
              from its land bank. A 9-chunk base is $63 a week, 16 chunks $112, 100 chunks $700
              (before any town discount). Fund it with{' '}
              <code className="text-gold">/lands bank deposit &lt;amount&gt;</code>. New lands get 2
              days before the first payment, and owners get a warning 20 hours before a collection
              the bank can&apos;t cover. If the bank can&apos;t pay, the land loses its{' '}
              <strong className="t-text">newest chunks</strong>, as many as it can&apos;t afford, and
              anything on them is unprotected. The land isn&apos;t wiped in one go, and your own
              balance is never touched. Top up before you take a break.
            </p>
            <p className="t-text-dim leading-relaxed mb-3">
              Towns with more active members pay less: 10% off with 2, 20% with 3–4, 30% with 5 or
              more. <code className="text-gold">/upkeep</code> shows your cost, discount and next
              charge. Details under{' '}
              <a href="#play-a-part" className="text-enchant hover:text-enchant/70 transition-colors underline underline-offset-2">
                Play a part
              </a>
              .
            </p>
            <p className="t-text-dim leading-relaxed mb-3">
              Visitors can always walk into your land and fly over it with an elytra. Those two
              flags are locked on. Everything else (building, chests, doors, redstone) stays yours
              to hand out.
            </p>
            <p className="t-text-dim leading-relaxed">
              Trust friends in with <code className="text-gold">/lands trust &lt;player&gt;</code>.
              Nations (federated claims with shared trust) are supported. Land wars are disabled
              this season. Your claims are safe from capture.
            </p>
          </Expander>

          <Expander title="Graves & death">
            <p className="t-text-dim leading-relaxed mb-3">
              Keep-inventory is <strong className="t-text">off</strong>. Vanilla rules. But the
              graves plugin catches your stuff: dying drops your inventory into a grave at the
              spot, marked by an armor stand. Walk back, right-click, take your loot.
            </p>
            <p className="t-text-dim leading-relaxed">
              Graves <strong className="t-text">despawn the moment you empty them</strong>, so the
              world doesn&apos;t fill up with abandoned markers. Move fast. Other players can see
              the marker too.
            </p>
          </Expander>

          <Expander title="Proximity voice chat">
            <p className="t-text-dim leading-relaxed mb-3">
              Simple Voice Chat is set up server-side. Once you&apos;ve got the matching client mod,
              you hear other players based on distance — close-up conversation in the same room,
              fades out at range, gone over the horizon. Walkie-talkies and group channels are
              supported for staying in voice with people who aren&apos;t standing next to you.
            </p>
            <p className="t-text-dim leading-relaxed mb-3">
              <strong className="t-text">New in Season 2, a voice bonus:</strong> stay connected to
              voice chat for 60 seconds on a day you log in and you get +50% of that day&apos;s
              login-reward money. The server only checks whether you&apos;re connected. Nothing
              logs who talks or for how long. We&apos;d love more roleplay this season, but you
              never have to.{' '}
              <a href="#play-a-part" className="text-enchant hover:text-enchant/70 transition-colors underline underline-offset-2">
                Everything else we&apos;re doing
              </a>
              .
            </p>
            <p className="t-text-dim leading-relaxed">
              Both of our <a href="/modpacks" className="text-enchant hover:text-enchant/70 transition-colors underline underline-offset-2">modpacks</a>{' '}
              ship with the client mod pre-installed. If you&apos;re running vanilla, grab Simple
              Voice Chat from Modrinth or CurseForge — it&apos;s optional, but it&apos;s easily the
              biggest social upgrade you can install.
            </p>
          </Expander>

          <Expander title="Quality of life: mail, trade, announcements">
            <p className="t-text-dim leading-relaxed mb-3">
              Three small in-house plugins fill the gaps:
            </p>
            <ul className="space-y-2.5 text-sm t-text-dim list-none">
              <li className="flex gap-2.5"><span className="text-xp shrink-0">+</span><span><strong className="t-text">Mail.</strong> Send messages or items to offline players. Both arrive the next time they log in.</span></li>
              <li className="flex gap-2.5"><span className="text-xp shrink-0">+</span><span><strong className="t-text">Trade.</strong> Two-window trade GUI between players. Both sides confirm before items swap, so nothing gets fumbled into the dirt.</span></li>
              <li className="flex gap-2.5"><span className="text-xp shrink-0">+</span><span><strong className="t-text">Announcements.</strong> Rotating chat tips and reminders on a timer.</span></li>
            </ul>
          </Expander>

          <Expander title="Commands you&apos;ll actually use">
            <p className="t-text-dim leading-relaxed mb-3">
              Cheat sheet for everyday play. All of these work day one:
            </p>
            <ul className="space-y-2.5 text-sm t-text-dim list-none">
              <li className="flex gap-2.5"><span className="text-xp shrink-0">+</span><span><code className="text-gold">/sethome</code> and <code className="text-gold">/home</code> &mdash; save and teleport back to a spot. You can keep multiple (3 to start).</span></li>
              <li className="flex gap-2.5"><span className="text-xp shrink-0">+</span><span><code className="text-gold">/tpa &lt;player&gt;</code> &mdash; request a teleport to someone. They reply with <code className="text-gold">/tpaccept</code> or <code className="text-gold">/tpdeny</code>.</span></li>
              <li className="flex gap-2.5"><span className="text-xp shrink-0">+</span><span><code className="text-gold">/back</code> returns to your last death or teleport.</span></li>
              <li className="flex gap-2.5"><span className="text-xp shrink-0">+</span><span><code className="text-gold">/msg &lt;player&gt;</code> &mdash; private message someone online. <code className="text-gold">/mail</code> for offline players (delivered next login).</span></li>
              <li className="flex gap-2.5"><span className="text-xp shrink-0">+</span><span><code className="text-gold">/trade</code> &mdash; opens the two-window trade GUI with another player.</span></li>
              <li className="flex gap-2.5"><span className="text-xp shrink-0">+</span><span><code className="text-gold">/pvp on|off|status</code>: Pacifists and Retired opt in or out of PvP (30-min toggle cooldown). Outlaws and Lawmen are always on.</span></li>
              <li className="flex gap-2.5"><span className="text-xp shrink-0">+</span><span><code className="text-gold">/lands</code> &mdash; open the claims menu. Defaults already block griefing inside your claim. <code className="text-gold">/upkeep</code> shows what your land owes and when.</span></li>
              <li className="flex gap-2.5"><span className="text-xp shrink-0">+</span><span><code className="text-gold">/marketday</code> &mdash; when the next Saturday market opens. <code className="text-gold">/warp market</code> takes you there.</span></li>
              <li className="flex gap-2.5"><span className="text-xp shrink-0">+</span><span><code className="text-gold">/event</code> &mdash; open the events hub: Boss Rush raids and arena PvP. <code className="text-gold">/event key</code> starts your own raid.</span></li>
              <li className="flex gap-2.5"><span className="text-xp shrink-0">+</span><span><code className="text-gold">/shop</code> and <code className="text-gold">/market</code> &mdash; the server store and the player-to-player market.</span></li>
              <li className="flex gap-2.5"><span className="text-xp shrink-0">+</span><span><code className="text-gold">/bal</code>, <code className="text-gold">/baltop</code>, <code className="text-gold">/pay &lt;player&gt; &lt;amount&gt;</code> &mdash; check your money, see who&apos;s rich, send cash.</span></li>
              <li className="flex gap-2.5"><span className="text-xp shrink-0">+</span><span><code className="text-gold">/graves</code> &mdash; lists every grave you&apos;ve got waiting, so you can find your stuff after a death.</span></li>
              <li className="flex gap-2.5"><span className="text-xp shrink-0">+</span><span><code className="text-gold">/stats</code> &mdash; your playtime, deaths, and session numbers (the same data the website reads).</span></li>
              <li className="flex gap-2.5"><span className="text-xp shrink-0">+</span><span><code className="text-gold">/tab hide</code> &mdash; clean up the tab list if you&apos;d rather not see everyone&apos;s stats while you play.</span></li>
            </ul>
            <p className="t-text-dim leading-relaxed mt-4 text-sm">
              Hold <strong className="t-text">Tab</strong>{' '}in-game to see the player list. It shows
              your session and all-time playtime, deaths, ping, and the server&apos;s{' '}
              <strong className="t-text">TPS</strong> (ticks per second). 20.0 is smooth; anything
              lower means the server is lagging.
            </p>
          </Expander>
        </div>

        <h3 className="font-pixel text-gold text-xs glow-gold uppercase tracking-widest mb-4">
          World rules
        </h3>
        <div className="space-y-3 mb-10">
          <Expander title="Combat, PvP & player heads">
            <ul className="space-y-2.5 text-sm t-text-dim list-none">
              <li className="flex gap-2.5"><span className="text-xp shrink-0">+</span><span><strong className="t-text">PvP is opt-in.</strong> Everyone starts as a Pacifist. Other players can&apos;t hit or shoot you, and you can&apos;t hit them. Type <code className="text-gold">/pvp on</code> to join the fight. Outlaws and Lawmen are always on. You become an Outlaw by attacking players, by killing villagers, or through a <code className="text-gold">/report</code> that staff approve.</span></li>
              <li className="flex gap-2.5"><span className="text-xp shrink-0">+</span><span><strong className="t-text">If you never type <code className="text-gold">/pvp on</code>, no other player can hurt, knock out or rob you outside the colosseum pit.</strong> Pacifists who turn PvP on get knocked out instead of killed, and the attacker can take up to 3 items.</span></li>
              <li className="flex gap-2.5"><span className="text-xp shrink-0">+</span><span><strong className="t-text">Other players can&apos;t attack you within 100 blocks of spawn</strong> (traps set up beforehand still work), and for <strong className="t-text">5 seconds after any teleport</strong> you can&apos;t hit or be hit. The colosseum pit is the exception: outside events, anyone in the pit has PvP on, even if they never typed <code className="text-gold">/pvp on</code>.</span></li>
              <li className="flex gap-2.5"><span className="text-xp shrink-0">+</span><span><strong className="t-text">Server difficulty is Hard.</strong> Hunger drains, zombies break doors, mobs deal real damage.</span></li>
              <li className="flex gap-2.5"><span className="text-xp shrink-0">+</span><span><strong className="t-text">Player heads drop from PvP kills only.</strong> Mob and environment deaths don&apos;t drop heads, which keeps the trophy meaningful.</span></li>
              <li className="flex gap-2.5"><span className="text-xp shrink-0">+</span><span>The reputation system gates the consequences. See{' '}<a href="/reputation" className="text-enchant hover:text-enchant/70 transition-colors underline underline-offset-2">how rep works</a>.</span></li>
            </ul>
          </Expander>

          <Expander title="Sleep & mob griefing">
            <ul className="space-y-2.5 text-sm t-text-dim list-none">
              <li className="flex gap-2.5"><span className="text-xp shrink-0">+</span><span><strong className="t-text">50% of online players</strong> in bed skips the night. No need to wrangle everyone.</span></li>
              <li className="flex gap-2.5"><span className="text-xp shrink-0">+</span><span><strong className="t-text">Mob griefing is vanilla in the wilderness</strong> (creepers blow stuff up) and <strong className="t-text">off inside Lands claims by default</strong>. Endermen can&apos;t pick up blocks anywhere — server-wide. Builds are safe; the world isn&apos;t a museum.</span></li>
            </ul>
          </Expander>

          <Expander title="The Nether & The End">
            <p className="t-text-dim leading-relaxed mb-3">
              <strong className="t-text">The Nether is open day one.</strong> Closest vote of the
              bunch (7 to 6 in favor of unlocking immediately), so it stays a community call;
              we&apos;ll see how it plays out.
            </p>
            <p className="t-text-dim leading-relaxed mb-3">
              <strong className="t-text">Season 2 gives the Nether room.</strong> The Nether border
              follows the overworld at 1/8 scale, so Season 1&apos;s 1,750-block start left it about
              220 blocks each way, which was way too cramped. Season 2 starts at 5,000, so the Nether
              opens at about 625 blocks each way and keeps growing with the overworld.
            </p>
            <p className="t-text-dim leading-relaxed mb-3">
              <strong className="t-text">The End is locked for Season 2&apos;s first week.</strong>{' '}
              The portal is findable but sealed until Saturday October 10 at 5 PM Arizona, when it
              opens automatically (there&apos;s a daily countdown in chat). After that it&apos;s open:
              elytra, shulkers, end cities, all fair game.
            </p>
            <p className="t-text-dim leading-relaxed">
              In Season 1 the End stayed locked until we took the Ender Dragon down together on
              group night (around May 30).
            </p>
          </Expander>

          <Expander title="Wars (currently off)">
            <p className="t-text-dim leading-relaxed mb-3">
              <strong className="t-text">Land wars are disabled this season. Your claims are safe
              from capture.</strong> Lands and nations can&apos;t declare war on each other, and
              the walk-through and elytra rules above always apply.
            </p>
            <p className="t-text-dim leading-relaxed">
              Part of the reason is the reputation system: PvP that&apos;s &ldquo;legal&rdquo; under
              a war declaration would still fire rep awards, so people would pick up outlaw rep for
              doing what the war system says is fine. Conflict happens in the wilderness, on the
              rep system&apos;s terms.
            </p>
          </Expander>
        </div>

        <h3 className="font-pixel text-gold text-xs glow-gold uppercase tracking-widest mb-4">
          Coming later
        </h3>
        <div className="space-y-3">

          <Expander title="Jobs & quests">
            <p className="t-text-dim leading-relaxed">
              The Quests poll won yes; the Jobs poll won later-after-economy. Both are coming, but
              not day one. We want to land the right plugin and format rather than ship something
              that gets ripped out two weeks in. (The economy, server shop, and player market{' '}
              <strong className="t-text">are</strong> live now &mdash; see{' '}
              <a href="/economy" className="text-enchant hover:text-enchant/70 transition-colors underline underline-offset-2">
                the economy page
              </a>
              .) Pipe up on Discord if you&apos;ve got a strong opinion on which plugin.
            </p>
          </Expander>
        </div>
      </section>

      <GrassDivider />

      <section id="world-border" className="max-w-3xl mx-auto px-4 py-16 scroll-mt-24">
        <div className="text-center">
          <CloudTitle><h2 className="font-pixel text-gold text-lg mb-6 glow-gold">World Border</h2></CloudTitle>
        </div>
        <CloudText>
          <p className="t-text-dim leading-relaxed mb-4 text-center">
            The world doesn&apos;t start infinite. Season 2 opens at a <strong className="t-text">5,000-block radius</strong> from
            spawn and grows every night based on how much the community plays.
          </p>
          <p className="t-text-dim leading-relaxed text-center">
            Once a day at <strong className="t-text">9 PM Arizona</strong>, the border plugin tallies total
            player-hours from the previous day and expands the border based on which tier the server hit.
            The thresholds scale with how many people are actively playing — 10 hours from one person
            counts more than 10 hours split across the whole server. The more people play, the more world
            everyone gets to explore.
          </p>
        </CloudText>

        <LiveBorderStatus />

        <BorderTiers />

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
              <span>Expansion happens automatically every night at 9 PM Arizona. Check the <a href="/map" className="text-enchant hover:text-enchant/70 transition-colors underline underline-offset-2">BlueMap</a> to see the current border.</span>
            </div>
          </div>
        </div>
      </section>

      <GrassDivider />

      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <CloudTitle><h2 className="font-pixel text-gold text-lg mb-6 glow-gold">What&apos;s next</h2></CloudTitle>
        <CloudText>
          <p className="t-text-dim leading-relaxed">
            The server&apos;s lean on purpose. The arena events system and the economy are live;
            jobs and quests won their polls but don&apos;t ship day one. We add features when the
            format&apos;s actually right for the group, not because the plugin list looked thin.
            Ping carsonxd on Discord if you want to push something up the queue.
          </p>
        </CloudText>
      </section>

      <GrassDivider />

      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-6">
          <CloudTitle><h2 className="font-pixel text-gold text-lg glow-gold">Plugins</h2></CloudTitle>
        </div>
        <CloudText className="mb-8">
          <p className="t-text-dim leading-relaxed text-center text-sm">
            The ones marked <strong className="t-text">in-house</strong> were written by carsonxd
            specifically for this server — the fifteen <strong className="t-text">Frontier</strong>{' '}
            plugins are now open-source and released for anyone to run. The rest are community
            plugins (Lands, mcMMO, CoreProtect, LuckPerms, EssentialsX, BlueMap).
          </p>
          <p className="t-text-dim leading-relaxed text-center text-sm mt-3">
            Every Frontier plugin has a full reference page — commands, permissions and every config
            key — in{' '}
            <Link
              href="/plugins"
              className="text-enchant hover:text-enchant/70 transition-colors underline underline-offset-2"
            >
              the suite wiki
            </Link>
            .
          </p>
        </CloudText>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {plugins.map((plugin) =>
            plugin.href ? (
              <Link key={plugin.name} href={plugin.href} className="inventory-slot p-3 block">
                <p className="font-pixel text-gold text-[10px] mb-1 leading-relaxed">
                  {plugin.name}
                </p>
                <p className="t-text-muted text-xs leading-snug">{plugin.description}</p>
              </Link>
            ) : (
              <div key={plugin.name} className="inventory-slot p-3">
                <p className="font-pixel t-text text-[10px] mb-1 leading-relaxed">{plugin.name}</p>
                <p className="t-text-muted text-xs leading-snug">{plugin.description}</p>
              </div>
            )
          )}
        </div>
        <p className="t-text-muted text-xs text-center mt-6">
          Gold names link to their wiki page.
        </p>
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
