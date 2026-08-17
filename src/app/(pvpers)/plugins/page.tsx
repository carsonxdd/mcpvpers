import Link from 'next/link';
import type { Metadata } from 'next';
import CloudTitle from '@/components/CloudTitle';
import CloudText from '@/components/CloudText';
import GrassDivider from '@/components/GrassDivider';
import Expander from '@/components/Expander';
import Rich from '@/components/wiki/Rich';
import SuiteSearch from '@/components/wiki/SuiteSearch';
import { plugins, suiteMeta, SUITE_GITHUB } from '@/data/frontier-suite';

export const metadata: Metadata = {
  title: 'The Frontier Suite - mc.pvpers.us',
  description:
    'Wiki and download index for the Frontier Suite: 15 open-source Paper plugins built for mc.pvpers.us. Commands, permissions and every config key, searchable.',
};

const totals = {
  commands: plugins.reduce((n, p) => n + p.commands.length, 0),
  config: plugins.reduce((n, p) => n + p.config.length, 0),
  nodes: plugins.reduce((n, p) => n + p.permissions.length, 0),
};

// Straight from SUITE.md's "Which plugin needs which" table.
const dependencyRows: { plugin: string; slug: string; requires: string; optional: string }[] = [
  {
    plugin: 'FrontierReputation',
    slug: 'reputation',
    requires: '**FrontierTab**',
    optional:
      'Vault (bounty money, treasury), mcMMO (XP boost for pacifists in war mode), FrontierEvents (event kills don’t count as crimes), FrontierMail (daily-reward overflow → mailbox)',
  },
  {
    plugin: 'FrontierShop',
    slug: 'shop',
    requires: '—',
    optional: 'Vault (**effectively required** — no economy means the shop is read-only)',
  },
  {
    plugin: 'FrontierEvents',
    slug: 'events',
    requires: '—',
    optional: 'Vault (payouts, wagers), FrontierMail (reward overflow), FrontierGraves (arena grave sweep)',
  },
  {
    plugin: 'FrontierStatsAPI',
    slug: 'statsapi',
    requires: '**FrontierTab**',
    optional:
      'FrontierBorder, FrontierReputation, FrontierEvents, FrontierShop, mcMMO — each adds its routes; missing ones return empty',
  },
  {
    plugin: 'FrontierBorder',
    slug: 'border',
    requires: '**FrontierTab**',
    optional: 'Discord webhook for expansion announcements',
  },
  {
    plugin: 'FrontierTab',
    slug: 'tab',
    requires: '—',
    optional:
      'FrontierBorder (border line), FrontierEndLock (End padlock), FrontierEvents (event deaths not counted), FrontierReputation (rep prefix on names)',
  },
  {
    plugin: 'FrontierGraves',
    slug: 'graves',
    requires: '—',
    optional: 'FrontierEvents (no graves for event deaths; arena sweep)',
  },
  {
    plugin: 'FrontierMail',
    slug: 'mail',
    requires: '—',
    optional: '*(is used by Shop, Reputation and Events)*',
  },
  {
    plugin: 'Everything else',
    slug: '',
    requires: '—',
    optional: '—',
  },
];

export default function PluginsIndexPage() {
  return (
    <div>
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <CloudTitle>
          <h1 className="font-pixel text-gold text-2xl sm:text-3xl mb-6 glow-gold">
            The Frontier Suite
          </h1>
        </CloudTitle>
        <CloudText>
          <p className="t-text-dim leading-relaxed mb-4">
            Fifteen open-source Paper plugins written for this server and released as{' '}
            <strong className="t-text">separate jars</strong>. Install one, install all fifteen, or
            anything in between. Every plugin works on its own; the integrations between them
            switch on automatically when both sides are present.
          </p>
          <p className="t-text-dim leading-relaxed">
            This page is the wiki. Every command, every permission node and every config key in the
            suite is listed and searchable — {totals.commands} commands, {totals.nodes} permission
            nodes and {totals.config} config keys across the {suiteMeta.count} plugins.
          </p>
        </CloudText>

        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <a
            href={SUITE_GITHUB}
            target="_blank"
            rel="noopener noreferrer"
            className="mc-pill"
          >
            Source on GitHub
          </a>
          <Link href="/plugins#install" className="mc-pill">
            Install guide
          </Link>
          <Link href="/about" className="mc-pill">
            See it running here
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
          {[
            ['Server', suiteMeta.paper],
            ['Runtime', suiteMeta.java],
            ['Licence', `${suiteMeta.license} — free forever`],
            ['Reference server', 'mc.pvpers.us'],
          ].map(([label, value]) => (
            <div key={label} className="inventory-slot p-3">
              <p className="font-pixel t-text-muted text-[9px] uppercase tracking-wider mb-1">
                {label}
              </p>
              <p className="t-text text-xs leading-snug">{value}</p>
            </div>
          ))}
        </div>

        <p className="t-text-muted text-xs mt-5 max-w-2xl mx-auto leading-relaxed">
          Spigot is not supported. Each GitHub Release attaches all 15 jars; the Modrinth links on
          each plugin page point at the planned project slugs and go live with v1.0.0 — until then,
          download from GitHub Releases.
        </p>
      </section>

      <GrassDivider />

      {/* Search + browse */}
      <section id="browse" className="max-w-5xl mx-auto px-4 py-16 scroll-mt-20">
        <div className="text-center mb-8">
          <CloudTitle>
            <h2 className="font-pixel text-gold text-lg mb-4 glow-gold">Browse the suite</h2>
          </CloudTitle>
          <p className="t-text-dim text-sm">
            Search across every plugin at once, or pick a category and read.
          </p>
        </div>
        <SuiteSearch />
      </section>

      <GrassDivider />

      {/* Which plugin needs which */}
      <section id="dependencies" className="max-w-4xl mx-auto px-4 py-16 scroll-mt-20">
        <div className="text-center mb-6">
          <CloudTitle>
            <h2 className="font-pixel text-gold text-lg mb-4 glow-gold">
              Which plugin needs which
            </h2>
          </CloudTitle>
        </div>
        <CloudText className="mb-8">
          <p className="t-text-dim leading-relaxed text-center text-sm">
            Only three plugins have a <strong className="t-text">hard</strong> requirement, and
            it&apos;s always the same one: FrontierTab is the playtime store that Border, Reputation
            and StatsAPI read. Everything else is optional and degrades gracefully.
          </p>
        </CloudText>

        <div className="mc-panel p-6 sm:p-8 max-md:p-3">
          <div className="overflow-x-auto">
            <table className="w-full text-sm max-md:text-xs">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--c-border)' }}>
                  <th className="font-pixel text-gold text-[10px] text-left py-2 pr-4">Plugin</th>
                  <th className="font-pixel text-gold text-[10px] text-left py-2 pr-4">
                    Won&apos;t load without
                  </th>
                  <th className="font-pixel text-gold text-[10px] text-left py-2">
                    Optional — unlocks…
                  </th>
                </tr>
              </thead>
              <tbody className="t-text-dim">
                {dependencyRows.map((row) => (
                  <tr
                    key={row.plugin}
                    className="border-b last:border-b-0 align-top"
                    style={{ borderColor: 'var(--c-border)' }}
                  >
                    <td className="py-3 pr-4 t-text whitespace-nowrap">
                      {row.slug ? (
                        <Link
                          href={`/plugins/${row.slug}`}
                          className="text-enchant hover:text-enchant/70 transition-colors underline underline-offset-2"
                        >
                          {row.plugin}
                        </Link>
                      ) : (
                        row.plugin
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <Rich text={row.requires} />
                    </td>
                    <td className="py-3 leading-relaxed">
                      <Rich text={row.optional} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mc-panel p-6 mt-6">
          <h3 className="font-pixel text-xp text-xs glow-xp uppercase tracking-widest mb-4">
            Who reads whom
          </h3>
          <ul className="space-y-2.5 text-sm t-text-dim list-none">
            {suiteMeta.dataFlow.map((line) => (
              <li key={line} className="flex gap-2.5">
                <span className="text-xp shrink-0">+</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <GrassDivider />

      {/* Install */}
      <section id="install" className="max-w-3xl mx-auto px-4 py-16 scroll-mt-20">
        <div className="text-center mb-8">
          <CloudTitle>
            <h2 className="font-pixel text-gold text-lg mb-4 glow-gold">Suggested install order</h2>
          </CloudTitle>
          <p className="t-text-dim text-sm">
            Nothing here is mandatory beyond FrontierTab. This is just the order that causes the
            fewest surprises.
          </p>
        </div>

        <div className="mc-panel p-6 sm:p-8">
          <div className="space-y-5 text-sm t-text-dim">
            {suiteMeta.installOrder.map((s) => (
              <div key={s.step} className="flex gap-4 items-start">
                <span className="font-pixel text-gold text-[10px] shrink-0 mt-1 w-4">
                  {s.step}.
                </span>
                <span>
                  <strong className="t-text block mb-1">{s.head}</strong>
                  <span className="leading-relaxed">{s.body}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mc-panel p-6 mt-4">
          <h3 className="font-pixel text-gold text-xs glow-gold mb-3">How to install</h3>
          <p className="t-text-dim text-sm leading-relaxed">
            <Rich text={suiteMeta.installHow} />
          </p>
        </div>

        <div className="space-y-3 mt-8">
          <Expander title="Permissions in one minute">
            <p className="t-text-dim text-sm leading-relaxed mb-3">
              <Rich text={suiteMeta.permissionsPrimer} />
            </p>
            <p className="t-text-dim text-sm leading-relaxed">
              Full permission tables live on each plugin page, and the search box above covers every
              node in the suite.
            </p>
          </Expander>

          <Expander title="Timezone in one minute">
            <p className="t-text-dim text-sm leading-relaxed">
              <Rich text={suiteMeta.timezonePrimer} />
            </p>
          </Expander>

          <Expander title="Third-party plugins the suite can use">
            <div className="space-y-4">
              {suiteMeta.thirdParty.map((t) => (
                <div key={t.name}>
                  <a
                    href={t.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-pixel text-gold text-[10px] hover:text-gold/70 transition-colors"
                  >
                    {t.name} ↗
                  </a>
                  <p className="t-text-dim text-sm leading-relaxed mt-1">
                    <Rich text={t.what} />
                  </p>
                </div>
              ))}
            </div>
          </Expander>
        </div>
      </section>

      <GrassDivider />

      {/* Closing */}
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <CloudText>
          <p className="t-text-dim leading-relaxed mb-4">
            Everything on this page runs live on mc.pvpers.us. If you want to see it in motion
            before you install anything, the{' '}
            <Link
              href="/reputation"
              className="text-enchant hover:text-enchant/70 transition-colors underline underline-offset-2"
            >
              reputation system
            </Link>
            ,{' '}
            <Link
              href="/economy"
              className="text-enchant hover:text-enchant/70 transition-colors underline underline-offset-2"
            >
              the economy
            </Link>{' '}
            and{' '}
            <Link
              href="/events"
              className="text-enchant hover:text-enchant/70 transition-colors underline underline-offset-2"
            >
              the events
            </Link>{' '}
            pages are the player-facing view of the same plugins.
          </p>
          <p className="t-text-muted text-sm leading-relaxed">
            Found a bug, or want a knob that isn&apos;t exposed? Open an issue on{' '}
            <a
              href={SUITE_GITHUB}
              target="_blank"
              rel="noopener noreferrer"
              className="text-enchant hover:text-enchant/70 transition-colors underline underline-offset-2"
            >
              GitHub
            </a>{' '}
            or ping carsonxd on Discord.
          </p>
        </CloudText>
      </section>
    </div>
  );
}
