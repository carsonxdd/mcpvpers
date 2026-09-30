import CopyButton from '@/components/CopyButton';
import GrassDivider from '@/components/GrassDivider';
import CloudTitle from '@/components/CloudTitle';
import CloudText from '@/components/CloudText';
import LiveServerStatus from '@/components/LiveServerStatus';
import Season2Banner from '@/components/Season2Banner';

type Feature = { title: string; description: string; href?: string };

const features: Feature[] = [
  {
    title: 'Your land, your rules',
    description:
      'Lands claims give you full permission control. Decide who builds and who opens chests. Just keep the land bank topped up. Land costs upkeep now.',
  },
  {
    title: 'Fight if you want to',
    description:
      "PvP is off unless you turn it on. Opt in to hunt outlaws, or skip it and just build. If you want a real fight, the colosseum's open, and there's a PvP event in the ring every night.",
  },
  {
    title: 'Frontier reputation',
    description:
      "PvP is a choice you make, not a class you're stuck with. Pacifists can opt in to hunt outlaws but keep one-hit-kill protection. Cross lines and your name lands on the wanted board. Take outlaws down and you earn the lawman badge.",
    href: '/reputation',
  },
];

// Keep in step with the Season 2 news post (id 20) and the /about expanders.
const season2 = [
  {
    title: 'The shop is open day one',
    description:
      '/shop buys and sells 200 items. Prices shift once a day at midnight based on what everyone traded. /market is for selling to each other at your own price.',
  },
  {
    title: 'Land has upkeep',
    description:
      "Starting a land costs $500 (that covers your first 3×3), and each chunk after that is $25. Every land then pays $5 per chunk per day from its land bank (/lands bank deposit <amount>). Still playing but the bank ran dry? The land goes into debt and keeps its chunks. Walk away from it and the newest chunks go back to the wild. Your own balance is never touched.",
  },
  {
    title: 'PvP is opt-in only',
    description:
      "Other players can't hit or shoot you unless you've typed /pvp on, except in the colosseum ring. For 5 seconds after any teleport you can't hit or be hit.",
  },
  {
    title: 'A protected spawn',
    description:
      "You spawn in a huge Dappled Forest. It's public: hang out, meet people, trade. Nobody can claim it, other players can't attack you, and nothing there burns.",
  },
  {
    title: 'Colosseum Night',
    description:
      'Every night at 8 PM Arizona the colosseum runs a PvP event with a rotating mode. Everyone fights in the same Knight kit and gets their own gear back after. The winner takes a chest: $500, 4 diamonds, 8 XP bottles and a jackpot roll. Outside events the ring is always PvP-on and ring kills never touch rep, but die in there and your items drop on the floor for the taking.',
  },
  {
    title: 'Play a part',
    description:
      'This season leans into roleplay. Pick a part below, talk to people, and the server rewards it. Nothing is required.',
  },
];

// Roleplay parts. Each one maps to a system that already exists.
const parts = [
  {
    title: 'Lawman',
    description:
      'Opt into PvP, take down outlaws, and climb from Citizen to Marshal. Sheriffs hand out pardons, and anyone can put cash on an outlaw.',
    href: '/reputation',
    cta: 'How the badge works',
  },
  {
    title: 'Outlaw',
    description:
      'Pick fights, get your face on the wanted board, and carry a price on your head. Pay restitution if you ever want to go straight.',
    href: '/wanted',
    cta: 'The wanted board',
  },
  {
    title: 'Trader',
    description:
      'Run a sign shop, work the /market, or set up a stall at spawn on market day. Buy low when the ticker dips.',
    href: '/economy',
    cta: 'How money works',
  },
  {
    title: 'Homesteader',
    description:
      'Settle down with neighbors, name your town, and keep the upkeep paid. Towns with more active members pay less.',
    href: '/about#play-a-part',
    cta: 'Towns & upkeep',
  },
];

// Reasons to talk to people. All live from Season 2's first day. Keep in sync with /about#play-a-part.
const talkRewards = [
  {
    title: 'Voice chat is built in',
    description:
      "Simple Voice Chat runs on the server and ships in both modpacks. Walk up to someone and talk. Press V once to check your mic and you're on. It's the fastest way to turn a stranger into a neighbor.",
  },
  {
    title: 'Sunday shoutouts',
    description:
      '/commend the people who made your week. Every Sunday at 6 PM Arizona the top 3 get a shoutout in Discord and in-game.',
  },
  {
    title: 'Titles you can see',
    description: 'Your lawman or outlaw rank shows before your name in chat, in the Tab list and above your head.',
  },
  {
    title: 'Towns pay less upkeep',
    description: 'Lands with 2 or more active members get 10–30% off the daily upkeep.',
  },
  {
    title: 'Market Day',
    description:
      'Saturdays 7:00–7:55 PM Arizona, anyone can put up a stall at the market next to spawn (/warp market). Then head to the colosseum for Colosseum Night.',
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
            One rule, a few guardrails, and a lot of room.
          </p>
        </CloudTitle>
        <div className="mb-8" />

        <Season2Banner />

        <div className="mb-6" />

        <CopyButton text="mc.pvpers.us" label="mc.pvpers.us" className="text-lg max-md:text-sm mb-4" />
        <LiveServerStatus />

        {/* Server Stats */}
        <div className="mc-panel p-6 max-w-lg w-full">
          <h2 className="font-pixel t-text-dim text-[10px] mb-4 uppercase tracking-widest">Server Info</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="t-text-muted text-xs">Version</span>
              <p className="text-xp font-pixel text-sm glow-xp">26.3</p>
            </div>
            <div>
              <span className="t-text-muted text-xs">Gameplay</span>
              <p className="text-xp font-pixel text-sm glow-xp">Vanilla+ Survival</p>
            </div>
            <div>
              <span className="t-text-muted text-xs">Features</span>
              <p className="t-text font-pixel text-sm">Reputation, mcMMO, Lands</p>
            </div>
            <div>
              <span className="t-text-muted text-xs">Platform</span>
              <p className="t-text font-pixel text-sm">Java</p>
            </div>
          </div>
        </div>
      </section>

      <GrassDivider />

      {/* Season 2 at a glance */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center">
          <CloudTitle>
            <h2 className="font-pixel text-gold text-lg mb-8 glow-gold">New in Season 2</h2>
          </CloudTitle>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {season2.map((item) => (
            <div key={item.title} className="mc-panel p-5">
              <h3 className="font-pixel text-bronze text-[10px] mb-2 leading-relaxed">{item.title}</h3>
              <p className="t-text-dim text-sm leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
        <p className="text-center mt-6">
          <a
            href="/news"
            className="font-pixel text-enchant text-[10px] hover:text-enchant/70 focus-visible:text-enchant/70 active:text-enchant/50 transition-colors"
          >
            The full Season 2 post &rarr;
          </a>
        </p>
      </section>

      <GrassDivider />

      {/* Roleplay: pick a part + talk rewards */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center">
          <CloudTitle>
            <h2 className="font-pixel text-gold text-lg mb-6 glow-gold">Pick your part</h2>
          </CloudTitle>
          <CloudText className="mb-8">
            <p className="t-text-dim leading-relaxed">
              The Frontier works better with characters in it. You don&apos;t have to roleplay, and
              nobody gets punished for keeping to themselves. But if you pick a part and talk to
              people, the server notices.
            </p>
          </CloudText>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {parts.map((part) => (
            <a key={part.title} href={part.href} className="mc-panel p-5 hover-surface block transition-all">
              <h3 className="font-pixel text-gold text-xs mb-2">{part.title}</h3>
              <p className="t-text-dim text-sm leading-relaxed">{part.description}</p>
              <p className="text-enchant text-[10px] mt-3 font-pixel">{part.cta} &rarr;</p>
            </a>
          ))}
        </div>

        <div className="mc-panel p-6 max-w-3xl mx-auto">
          <h3 className="font-pixel text-bronze text-[10px] uppercase tracking-widest mb-4">
            Reasons to talk · live from day one
          </h3>
          <ul className="space-y-2.5 text-sm t-text-dim list-none">
            {talkRewards.map((r) => (
              <li key={r.title} className="flex gap-2.5">
                <span className="text-xp shrink-0">+</span>
                <span><strong className="t-text">{r.title}.</strong> {r.description}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <GrassDivider />

      {/* Feature Cards */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {features.map((feature) =>
            feature.href ? (
              <a
                key={feature.title}
                href={feature.href}
                className="mc-panel p-6 gradient-border hover-surface block transition-all"
              >
                <h3 className="font-pixel text-gold text-xs mb-2">{feature.title}</h3>
                <p className="t-text-dim text-sm">{feature.description}</p>
                <p className="text-enchant text-xs mt-3 font-pixel">Read the rules &rarr;</p>
              </a>
            ) : (
              <div key={feature.title} className="mc-panel p-6 gradient-border">
                <h3 className="font-pixel text-gold text-xs mb-2">{feature.title}</h3>
                <p className="t-text-dim text-sm">{feature.description}</p>
              </div>
            )
          )}
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
            mc.pvpers.us is a Wild West-themed hard survival server. Lands claims, a cowboy
            reputation system, mcMMO, and a slow-growing world border. No pay-to-win, no required
            mods, no curated experience.
          </p>
          <p className="t-text-dim leading-relaxed mb-4">
            Inside your claim, you set the rules. Lock down your base, invite the people you trust,
            and decide what they can and can&apos;t do. Outside the claim border, the wilderness is
            the frontier: mob griefing on, creepers doing creeper things.
          </p>
          <p className="t-text-dim leading-relaxed">
            PvP is opt-in. Other players can&apos;t hit or shoot you until you type /pvp on (the colosseum ring is the exception). Opt in and you can hunt
            outlaws. Cross the line and you land on /wanted, where anyone can put a cash bounty on you. Lawmen earn the badge by
            taking outlaws down. The community votes on every system change.{' '}
            <a href="/about#whats-live" className="text-enchant hover:text-enchant/70 transition-colors underline underline-offset-2">
              See what&apos;s live at launch &rarr;
            </a>
          </p>
        </CloudText>
      </section>

      <GrassDivider />

      {/* Platform cross-promo */}
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <CloudTitle>
          <h2 className="font-pixel text-gold text-lg mb-6 glow-gold">Run a server of your own?</h2>
        </CloudTitle>
        <CloudText>
          <p className="t-text-dim leading-relaxed mb-6">
            This site runs on a platform we built for server owners: a branded home page, rules,
            news, and live stats, all editable from a dashboard — no files, no redeploys. Free for
            up to two sites.
          </p>
        </CloudText>
        <a
          href="/get-started"
          className="inline-block mc-panel px-6 py-3 font-pixel text-gold text-xs glow-gold hover-surface"
        >
          Get your own site &rarr;
        </a>
      </section>
    </div>
  );
}
