import Link from 'next/link';
import type { Metadata } from 'next';
import CloudTitle from '@/components/CloudTitle';
import LiveEventBanner from '@/components/LiveEventBanner';
import RecentPlunder from '@/components/RecentPlunder';

export const metadata: Metadata = {
  title: 'Events - mc.pvpers.us',
  description: 'Server events: co-op Boss Rush raids and PvP Arena matches. Climb the boards, win the loot.',
};

// One card per event mode. `href` null = a teaser (not yet a real page).
const MODES: { title: string; icon: string; blurb: string; href: string | null; cta: string }[] = [
  {
    title: 'Boss Rush',
    icon: '⚔️',
    blurb: 'Co-op PvE raids. Six bosses, Pit levels, Pitforged loot.',
    href: '/events/boss-rush',
    cta: 'Enter the raids →',
  },
  {
    title: 'PvP Arena',
    icon: '🗡️',
    blurb: 'TDM & FFA matches. Kill for cash, climb the boards.',
    href: '/events/pvp',
    cta: 'Step in the ring →',
  },
  {
    title: 'More modes coming',
    icon: '🎯',
    blurb: 'KOTH, duels, and more are in the works. Watch this space.',
    href: null,
    cta: 'Soon™',
  },
];

export default function EventsHubPage() {
  return (
    <div>
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <CloudTitle>
            <h1 className="font-pixel text-gold text-2xl sm:text-3xl mb-3 glow-gold">Events</h1>
          </CloudTitle>
          <p className="relative z-10 t-text-muted text-sm max-w-xl mx-auto">
            Scheduled server events that pay out cash and drop gear. Pick your mode - fight a boss
            with the party, or fight the party.
          </p>
        </div>

        <LiveEventBanner />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {MODES.map((m) =>
            m.href ? (
              <Link
                key={m.title}
                href={m.href}
                className="mc-panel p-6 gradient-border hover-surface block transition-all"
              >
                <span className="text-3xl leading-none block mb-3" aria-hidden>{m.icon}</span>
                <h2 className="font-pixel text-gold text-xs mb-2">{m.title}</h2>
                <p className="t-text-dim text-sm">{m.blurb}</p>
                <p className="text-enchant text-xs mt-3 font-pixel">{m.cta}</p>
              </Link>
            ) : (
              <div key={m.title} className="mc-panel p-6 gradient-border opacity-70">
                <span className="text-3xl leading-none block mb-3 grayscale" aria-hidden>{m.icon}</span>
                <h2 className="font-pixel t-text-muted text-xs mb-2">{m.title}</h2>
                <p className="t-text-muted text-sm">{m.blurb}</p>
                <p className="t-text-muted text-xs mt-3 font-pixel">{m.cta}</p>
              </div>
            )
          )}
        </div>

        <RecentPlunder title="Latest Pitforged drops" tier="pitforged" limit={6} className="mt-12" />
      </section>
    </div>
  );
}
