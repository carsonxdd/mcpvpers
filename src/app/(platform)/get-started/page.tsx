import type { Metadata } from 'next';
import Link from 'next/link';
import CloudTitle from '@/components/CloudTitle';
import CloudTextSmall from '@/components/CloudTextSmall';
import GrassDivider from '@/components/GrassDivider';
import { PLANS } from '@/lib/billing/plans';

export const metadata: Metadata = {
  title: 'Get a site for your Minecraft server | Server Sites',
  description:
    'A branded website for your Minecraft server: copy-to-join address, rules, news, live player count and leaderboards. Free.',
};

const FEATURES = [
  {
    title: 'Branded home page',
    body: 'Your server name, tagline, accent color, and a one-click copy-to-join address.',
  },
  {
    title: 'Rules & news',
    body: 'Edit rules and post updates from a simple dashboard. No files, no redeploys.',
  },
  {
    title: 'Live status',
    body: 'Connect PiStatsAPI and your site shows who’s online, right on the home page.',
  },
  {
    title: 'Leaderboards',
    body: 'Playtime, deaths, mob kills, ores mined, distance and more — straight from your server.',
  },
  {
    title: 'Weather included',
    body: 'The same living sky as this site: drifting clouds, rain, thunderstorms, day and night themes.',
  },
  {
    title: 'Launch countdown',
    body: 'Launching soon? Set a date and your site counts down, then flips live on its own.',
  },
];

const STEPS = [
  { step: '1', body: 'Sign in with Discord.' },
  { step: '2', body: 'Name your server, paste its address, pick a URL.' },
  { step: '3', body: 'Make the starter rules yours and post a first update.' },
  { step: '4', body: 'Optionally connect PiStatsAPI for live stats.' },
];

export default function GetStartedPage() {
  const free = PLANS.free;

  return (
    <div>
      <section className="flex flex-col items-center px-4 py-24 text-center">
        <CloudTitle>
          <h1 className="font-pixel text-gold glow-gold text-2xl sm:text-4xl">
            A site like this for your server
          </h1>
        </CloudTitle>
        <CloudTextSmall>
          <p className="font-pixel t-text-dim mt-6 text-xs sm:text-sm">
            Rules, news, live stats — set up in minutes
          </p>
        </CloudTextSmall>
        <Link href="/login" className="mc-pill mt-10 inline-block px-8 py-4 font-pixel text-sm">
          Create your site
        </Link>
      </section>

      <GrassDivider />

      <section className="mx-auto max-w-5xl px-4 py-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="mc-panel enchant-hover p-6">
              <h2 className="font-pixel t-text text-xs">{f.title}</h2>
              <p className="t-text-dim mt-3 text-sm leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <GrassDivider />

      <section className="mx-auto max-w-3xl px-4 py-16">
        <div className="text-center">
          <CloudTitle>
            <h2 className="font-pixel text-gold glow-gold mb-8 text-xl sm:text-2xl">
              How it works
            </h2>
          </CloudTitle>
        </div>
        <div className="space-y-3">
          {STEPS.map((s) => (
            <div key={s.step} className="mc-panel flex items-center gap-4 p-5">
              <span className="inventory-slot flex h-10 w-10 shrink-0 items-center justify-center font-pixel text-gold">
                {s.step}
              </span>
              <p className="t-text-dim text-sm">{s.body}</p>
            </div>
          ))}
        </div>
        <p className="t-text-muted mt-6 text-center text-xs">
          Live stats need the PiStatsAPI plugin on your server —{' '}
          <Link href="/get-started/pistats" className="underline hover:text-gold">
            here&apos;s the 10-minute setup guide
          </Link>
          .
        </p>
      </section>

      <GrassDivider />

      <section className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="mc-panel p-8">
          <h2 className="font-pixel text-gold text-sm">{free.name}</h2>
          <p className="font-pixel t-text mt-3 text-2xl">{free.price}</p>
          <p className="t-text-dim mt-4 text-sm">{free.blurb}</p>
          <ul className="t-text-muted mt-4 space-y-1 text-xs">
            <li>Up to {free.entitlements.maxSites} sites</li>
            <li>Live stats included</li>
          </ul>
          <Link href="/login" className="mc-pill mt-8 inline-block px-6 py-3 font-pixel text-xs">
            Get started
          </Link>
        </div>
      </section>
    </div>
  );
}
