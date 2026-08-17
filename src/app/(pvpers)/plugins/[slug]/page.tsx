import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import GrassDivider from '@/components/GrassDivider';
import CloudTitle from '@/components/CloudTitle';
import Rich from '@/components/wiki/Rich';
import WikiTable from '@/components/wiki/WikiTable';
import ConfigTable from '@/components/wiki/ConfigTable';
import { plugins, pluginBySlug, suiteMeta } from '@/data/frontier-suite';

// One page per plugin, fully static — the whole suite reference is a build-time
// data file, so every page is prerendered and edge-cached.
export function generateStaticParams() {
  return plugins.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = pluginBySlug(slug);
  if (!p) return { title: 'The Frontier Suite - mc.pvpers.us' };
  return {
    title: `${p.name} v${p.version} - The Frontier Suite`,
    description: p.tagline,
  };
}

function SectionHeading({ id, title }: { id: string; title: string }) {
  return (
    <h2
      id={id}
      className="font-pixel text-gold text-sm glow-gold uppercase tracking-widest mb-5 scroll-mt-24"
    >
      {title}
    </h2>
  );
}

export default async function PluginPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = pluginBySlug(slug);
  if (!p) notFound();

  const idx = plugins.findIndex((x) => x.slug === p.slug);
  const prev = plugins[idx - 1];
  const next = plugins[idx + 1];

  const jumps: [string, string][] = [
    ['#overview', 'Overview'],
    ['#requirements', 'Requirements'],
    ['#commands', `Commands (${p.commands.length})`],
    ['#permissions', `Permissions (${p.permissions.length})`],
    ['#config', `Config (${p.config.length})`],
    ...(p.routes ? ([['#routes', 'HTTP routes']] as [string, string][]) : []),
    ['#notes', 'Good to know'],
  ];

  return (
    <div>
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 pt-12 pb-10">
        <Link
          href="/plugins"
          className="t-text-muted text-xs hover:text-gold transition-colors inline-block mb-6"
        >
          ← The Frontier Suite
        </Link>

        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2 mb-4">
          <CloudTitle>
            <h1 className="font-pixel text-gold text-xl sm:text-2xl glow-gold leading-relaxed">
              {p.name}
            </h1>
          </CloudTitle>
          <span className="font-mono text-sm text-xp">v{p.version}</span>
          <span className="font-pixel text-[9px] t-text-muted uppercase tracking-widest">
            {p.kind}
          </span>
        </div>

        <p className="t-text-dim leading-relaxed max-w-2xl">{p.tagline}</p>

        <div className="mt-6 flex flex-wrap gap-3">
          <a href={p.modrinth} target="_blank" rel="noopener noreferrer" className="mc-pill">
            Modrinth ↗
          </a>
          <a href={p.github} target="_blank" rel="noopener noreferrer" className="mc-pill">
            Source ↗
          </a>
          {p.liveOnSite?.map((l) => (
            <Link key={l.href} href={l.href} className="mc-pill">
              {l.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Sticky jump bar */}
      <nav
        aria-label="On this page"
        className="sticky top-14 z-30 t-bg-95 backdrop-blur-md border-y t-border-30"
      >
        <div className="max-w-4xl mx-auto px-4 py-2 flex gap-4 overflow-x-auto">
          {jumps.map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="t-text-dim hover:text-gold transition-colors text-xs whitespace-nowrap py-1"
            >
              {label}
            </a>
          ))}
        </div>
      </nav>

      {/* Overview */}
      <section id="overview" className="max-w-4xl mx-auto px-4 py-12 scroll-mt-24">
        <SectionHeading id="overview-h" title="What it does" />
        <div className="mc-panel p-6 sm:p-8 space-y-4">
          {p.what.map((para, i) => (
            <p key={i} className="t-text-dim leading-relaxed">
              <Rich text={para} />
            </p>
          ))}
        </div>
      </section>

      <GrassDivider />

      {/* Requirements */}
      <section id="requirements" className="max-w-4xl mx-auto px-4 py-12 scroll-mt-24">
        <SectionHeading id="requirements-h" title="Requires & integrates with" />
        <div className="mc-panel p-6 sm:p-8 max-md:p-4">
          <dl className="space-y-5 text-sm">
            {[
              ['Required', p.requires],
              ['Optional', p.optional],
              ['Used by', p.usedBy],
            ].map(([label, body]) => (
              <div key={label} className="flex max-md:flex-col gap-x-6 gap-y-1">
                <dt className="font-pixel text-gold text-[10px] shrink-0 md:w-24 md:pt-0.5">
                  {label}
                </dt>
                <dd className="t-text-dim leading-relaxed flex-1">
                  <Rich text={body} />
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {p.hardDep && (
          <p className="t-text-muted text-xs mt-4 leading-relaxed">
            Heads up: this plugin will not enable without{' '}
            <strong className="t-text">{p.hardDep}</strong> installed. Everything else listed as
            optional is genuinely optional — the feature simply doesn&apos;t appear.
          </p>
        )}
      </section>

      <GrassDivider />

      {/* Commands */}
      <section id="commands" className="max-w-5xl mx-auto px-4 py-12 scroll-mt-24">
        <SectionHeading id="commands-h" title="Commands" />
        {p.commandsNote && (
          <p className="t-text-dim text-sm leading-relaxed mb-5">
            <Rich text={p.commandsNote} />
          </p>
        )}
        <div className="mc-panel p-6 sm:p-8 max-md:p-4">
          <WikiTable
            columns={[
              { head: 'Command', key: true, className: 'md:w-[26%]' },
              { head: 'Who', className: 'md:w-[14%]' },
              { head: 'What it does' },
            ]}
            rows={p.commands.map((c) => [c.cmd, c.who, c.what])}
            filterPlaceholder={`Filter ${p.commands.length} commands…`}
          />
        </div>
      </section>

      <GrassDivider />

      {/* Permissions */}
      <section id="permissions" className="max-w-5xl mx-auto px-4 py-12 scroll-mt-24">
        <SectionHeading id="permissions-h" title="Permissions" />
        <p className="t-text-dim text-sm leading-relaxed mb-5">
          <Rich text={suiteMeta.permissionsPrimer} />
        </p>
        <div className="mc-panel p-6 sm:p-8 max-md:p-4">
          <WikiTable
            columns={[
              { head: 'Node', key: true, className: 'md:w-[32%]' },
              { head: 'Default', className: 'md:w-[10%]' },
              { head: 'Grants' },
            ]}
            rows={p.permissions.map((n) => [n.node, n.def, n.grants])}
            filterPlaceholder="Filter nodes…"
          />
        </div>
        {p.permissionsNote && (
          <p className="t-text-muted text-xs mt-4 leading-relaxed">
            <Rich text={p.permissionsNote} />
          </p>
        )}
      </section>

      <GrassDivider />

      {/* Config */}
      <section id="config" className="max-w-5xl mx-auto px-4 py-12 scroll-mt-24">
        <SectionHeading id="config-h" title="Config reference" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <div className="inventory-slot p-4">
            <p className="font-pixel t-text-muted text-[9px] uppercase tracking-wider mb-1.5">
              File
            </p>
            <p className="font-mono text-xs t-text break-all">{p.configPath}</p>
          </div>
          <div className="inventory-slot p-4">
            <p className="font-pixel t-text-muted text-[9px] uppercase tracking-wider mb-1.5">
              To apply changes
            </p>
            <p className="t-text-dim text-xs leading-relaxed">
              <Rich text={p.configReload} />
            </p>
          </div>
        </div>

        <div className="mc-panel p-6 sm:p-8 max-md:p-4">
          <ConfigTable rows={p.config} />
        </div>
      </section>

      {/* Routes (StatsAPI only) */}
      {p.routes && (
        <>
          <GrassDivider />
          <section id="routes" className="max-w-5xl mx-auto px-4 py-12 scroll-mt-24">
            <SectionHeading id="routes-h" title="HTTP routes" />
            {p.routesNote && (
              <p className="t-text-dim text-sm leading-relaxed mb-5">
                <Rich text={p.routesNote} />
              </p>
            )}
            <div className="mc-panel p-6 sm:p-8 max-md:p-4">
              <WikiTable
                columns={[
                  { head: 'Group', className: 'md:w-[14%]' },
                  { head: 'Routes', key: true },
                  { head: 'Needs', className: 'md:w-[22%]' },
                ]}
                rows={p.routes.map((r) => [r.group, r.routes, r.needs])}
                filterPlaceholder="Filter routes…"
              />
            </div>
          </section>
        </>
      )}

      <GrassDivider />

      {/* Good to know */}
      <section id="notes" className="max-w-4xl mx-auto px-4 py-12 scroll-mt-24">
        <SectionHeading id="notes-h" title="Good to know" />
        <div className="mc-panel p-6 sm:p-8">
          <ul className="space-y-4 text-sm t-text-dim list-none">
            {p.notes.map((n, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-xp shrink-0">+</span>
                <span className="leading-relaxed">
                  <Rich text={n} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <GrassDivider />

      {/* Prev / next */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {prev ? (
            <Link href={`/plugins/${prev.slug}`} className="mc-panel p-5 block hover-surface transition-colors">
              <p className="t-text-muted text-[10px] uppercase tracking-widest font-pixel mb-2">
                ← Previous
              </p>
              <p className="font-pixel text-gold text-[11px] leading-relaxed">{prev.name}</p>
              <p className="t-text-dim text-xs mt-1.5 leading-relaxed">
                <Rich text={prev.oneLine} />
              </p>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              href={`/plugins/${next.slug}`}
              className="mc-panel p-5 block hover-surface transition-colors sm:text-right"
            >
              <p className="t-text-muted text-[10px] uppercase tracking-widest font-pixel mb-2">
                Next →
              </p>
              <p className="font-pixel text-gold text-[11px] leading-relaxed">{next.name}</p>
              <p className="t-text-dim text-xs mt-1.5 leading-relaxed">
                <Rich text={next.oneLine} />
              </p>
            </Link>
          )}
        </div>

        <p className="t-text-muted text-xs text-center mt-8">
          Looking for something specific?{' '}
          <Link
            href="/plugins#browse"
            className="text-enchant hover:text-enchant/70 transition-colors underline underline-offset-2"
          >
            Search the whole suite
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
