import Image from 'next/image';
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

export default function AboutPage() {
  return (
    <div>
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <CloudTitle><h1 className="font-pixel text-gold text-2xl sm:text-3xl mb-6 glow-gold">About</h1></CloudTitle>
        <CloudText>
          <p className="t-text-dim leading-relaxed mb-4">
            mc.pvpers.us runs on a simple idea: the fewer rules a server has, the more interesting it
            gets. We don&apos;t curate playstyles. We give you the tools (Lands claims, a cowboy-style
            reputation system, mcMMO, proximity voice chat) and let the world fill in around them.
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
            <p className="t-text-dim leading-relaxed">
              Trust friends in with <code className="text-gold">/lands trust &lt;player&gt;</code>.
              Nations (federated claims with shared trust) are supported, though wars are off for
              now. See &ldquo;Coming later&rdquo; below.
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
              <li className="flex gap-2.5"><span className="text-xp shrink-0">+</span><span><code className="text-gold">/sethome</code> and <code className="text-gold">/home</code> &mdash; save and teleport back to a spot. You can keep multiple.</span></li>
              <li className="flex gap-2.5"><span className="text-xp shrink-0">+</span><span><code className="text-gold">/tpa &lt;player&gt;</code> &mdash; request a teleport to someone. They reply with <code className="text-gold">/tpaccept</code> or <code className="text-gold">/tpdeny</code>.</span></li>
              <li className="flex gap-2.5"><span className="text-xp shrink-0">+</span><span><code className="text-gold">/spawn</code> sends you to world spawn. <code className="text-gold">/back</code> returns to your last death or teleport.</span></li>
              <li className="flex gap-2.5"><span className="text-xp shrink-0">+</span><span><code className="text-gold">/msg &lt;player&gt;</code> &mdash; private message someone online. <code className="text-gold">/mail</code> for offline players (delivered next login).</span></li>
              <li className="flex gap-2.5"><span className="text-xp shrink-0">+</span><span><code className="text-gold">/trade</code> &mdash; opens the two-window trade GUI with another player.</span></li>
              <li className="flex gap-2.5"><span className="text-xp shrink-0">+</span><span><code className="text-gold">/pvp on|off|status</code>: Pacifists and Retired opt in or out of PvP (30-min toggle cooldown). Outlaws and Lawmen are always on.</span></li>
              <li className="flex gap-2.5"><span className="text-xp shrink-0">+</span><span><code className="text-gold">/lands</code> &mdash; open the claims menu. Defaults already block griefing inside your claim.</span></li>
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
              <li className="flex gap-2.5"><span className="text-xp shrink-0">+</span><span><strong className="t-text">PvP is on in the wilderness for Outlaws and Lawmen.</strong> Pacifists and Retired players are exempt by default (they can&apos;t deal or take PvP damage), but can opt in with <code className="text-gold">/pvp on</code> to join the fight.</span></li>
              <li className="flex gap-2.5"><span className="text-xp shrink-0">+</span><span><strong className="t-text">Server difficulty is Hard.</strong> Hunger drains, zombies break doors, mobs deal real damage.</span></li>
              <li className="flex gap-2.5"><span className="text-xp shrink-0">+</span><span><strong className="t-text">Player heads drop from PvP kills only.</strong> Mob and environment deaths don&apos;t drop heads, which keeps the trophy meaningful.</span></li>
              <li className="flex gap-2.5"><span className="text-xp shrink-0">+</span><span>The reputation system gates the consequences. See{' '}<a href="/reputation" className="text-enchant hover:text-enchant/70 transition-colors underline underline-offset-2">how rep works</a>.</span></li>
            </ul>
          </Expander>

          <Expander title="Sleep, phantoms & mob griefing">
            <ul className="space-y-2.5 text-sm t-text-dim list-none">
              <li className="flex gap-2.5"><span className="text-xp shrink-0">+</span><span><strong className="t-text">50% of online players</strong> in bed skips the night. No need to wrangle everyone.</span></li>
              <li className="flex gap-2.5"><span className="text-xp shrink-0">+</span><span><strong className="t-text">Phantom spawn rate is reduced.</strong> They still show up, just not nightly. Sleeping mostly keeps them off.</span></li>
              <li className="flex gap-2.5"><span className="text-xp shrink-0">+</span><span><strong className="t-text">Mob griefing is vanilla in the wilderness</strong> (creepers blow stuff up, endermen pick up blocks) and <strong className="t-text">off inside Lands claims by default</strong>. Builds are safe; the world isn&apos;t a museum.</span></li>
            </ul>
          </Expander>

          <Expander title="The Nether & The End">
            <p className="t-text-dim leading-relaxed mb-3">
              <strong className="t-text">The Nether is open day one.</strong> Closest vote of the
              bunch (7 to 6 in favor of unlocking immediately), so it stays a community call;
              we&apos;ll see how it plays out.
            </p>
            <p className="t-text-dim leading-relaxed">
              <strong className="t-text">The End stays locked</strong> at launch regardless of the
              vote result. A focused poll on opening conditions is coming once people have settled
              in and we have a sense of the meta.
            </p>
          </Expander>
        </div>

        <h3 className="font-pixel text-gold text-xs glow-gold uppercase tracking-widest mb-4">
          Coming later
        </h3>
        <div className="space-y-3">
          <Expander title="Wars (currently off)">
            <p className="t-text-dim leading-relaxed mb-3">
              Lands supports nation-vs-nation war declarations, but we&apos;re leaving the war
              feature <strong className="t-text">off at launch</strong>. The reason is the
              reputation system: PvP that&apos;s &ldquo;legal&rdquo; under a war declaration would
              still fire rep awards under the current config, meaning people would lose hella
              outlaw rep doing what the war system says is fine.
            </p>
            <p className="t-text-dim leading-relaxed">
              Wars come back on once the Lands/reputation integration is built. Wartime kills
              between declared belligerents won&apos;t count as crimes. Until then, conflict
              happens in the wilderness on the rep system&apos;s terms.
            </p>
          </Expander>

          <Expander title="Community boss raids">
            <p className="t-text-dim leading-relaxed">
              The boss raid won the &ldquo;next event&rdquo; vote and event frequency won
              &ldquo;weekly.&rdquo; carsonxd is targeting <strong className="t-text">every two
              weeks realistically</strong> while shooting for weekly. Format is still being
              built; first raid likely in the opening weeks.
            </p>
          </Expander>

          <Expander title="Jobs, quests & deeper economy">
            <p className="t-text-dim leading-relaxed">
              The Quests poll won yes; the Jobs poll won later-after-economy. Both are coming, but
              not day one. We want to land the right plugin and format rather than ship something
              that gets ripped out two weeks in. Player shops and a deeper economy sit in the same
              bucket. Pipe up on Discord if you&apos;ve got a strong opinion on which plugin.
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
            The world doesn&apos;t start infinite. It opens at a <strong className="t-text">1,750-block radius</strong> from
            spawn and grows every week based on how much the community plays.
          </p>
          <p className="t-text-dim leading-relaxed text-center">
            Every Sunday, the border plugin tallies total player-hours from the past week and expands the
            border based on which tier the server hit. The thresholds scale with how many people are
            actively playing — 10 hours from one person counts more than 10 hours split across the whole
            server. The more people play, the more world everyone gets to explore.
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
            The server&apos;s lean on purpose. Jobs, quests, player shops, more events: they all
            won their polls, but none of them ship day one. We add features when the format&apos;s
            actually right for the group, not because the plugin list looked thin. Ping carsonxd on
            Discord if you want to push something up the queue.
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
            specifically for this server. The rest are community plugins
            (Lands, mcMMO, CoreProtect, LuckPerms, EssentialsX, BlueMap, DiscordSRV).
          </p>
        </CloudText>
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
