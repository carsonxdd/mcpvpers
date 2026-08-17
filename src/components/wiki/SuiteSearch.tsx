'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import Rich from './Rich';
import {
  plugins,
  categoryOrder,
  categoryBlurb,
  type PluginCategory,
} from '@/data/frontier-suite';

type Filter = 'All' | PluginCategory;
const filters: Filter[] = ['All', ...categoryOrder];

function PluginCard({ slug }: { slug: string }) {
  const p = plugins.find((x) => x.slug === slug)!;
  return (
    <Link
      href={`/plugins/${p.slug}`}
      className="mc-panel p-5 block hover-surface transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
    >
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <h3 className="font-pixel text-gold text-[11px] glow-gold leading-relaxed">
          {p.name}
        </h3>
        <span className="t-text-muted font-mono text-[10px] shrink-0">v{p.version}</span>
      </div>
      <p className="t-text-dim text-sm leading-relaxed">
        <Rich text={p.oneLine} />
      </p>
      <div className="mt-3 flex flex-wrap gap-2 text-[10px]">
        <span className="t-text-muted font-mono">{p.commands.length} commands</span>
        <span className="t-text-muted font-mono">·</span>
        <span className="t-text-muted font-mono">{p.config.length} config keys</span>
        {p.hardDep && (
          <>
            <span className="t-text-muted font-mono">·</span>
            <span className="text-redstone font-mono">needs {p.hardDep}</span>
          </>
        )}
      </div>
    </Link>
  );
}

function ResultRow({
  href,
  label,
  detail,
  tag,
}: {
  href: string;
  label: string;
  detail: string;
  tag: string;
}) {
  return (
    <Link
      href={href}
      className="flex max-md:flex-col gap-x-4 gap-y-1 py-3 px-2 -mx-2 rounded-md hover-surface transition-colors border-b last:border-b-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
      style={{ borderColor: 'var(--c-border)' }}
    >
      <span className="font-mono text-[0.82rem] t-text shrink-0 md:w-64 break-words">
        {label}
      </span>
      <span className="t-text-dim text-sm leading-relaxed flex-1">
        <Rich text={detail} />
      </span>
      <span className="font-pixel text-[9px] text-gold shrink-0 md:self-center">{tag}</span>
    </Link>
  );
}

export default function SuiteSearch() {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<Filter>('All');
  const needle = q.trim().toLowerCase();

  const results = useMemo(() => {
    if (!needle) return null;
    const hit = (s: string) => s.toLowerCase().includes(needle);

    return {
      plugins: plugins.filter(
        (p) =>
          hit(p.name) ||
          hit(p.short) ||
          hit(p.oneLine) ||
          hit(p.tagline) ||
          p.what.some(hit)
      ),
      commands: plugins.flatMap((p) =>
        p.commands
          .filter((c) => hit(c.cmd) || hit(c.what))
          .map((c) => ({ ...c, plugin: p.short, slug: p.slug }))
      ),
      permissions: plugins.flatMap((p) =>
        p.permissions
          .filter((n) => hit(n.node) || hit(n.grants))
          .map((n) => ({ ...n, plugin: p.short, slug: p.slug }))
      ),
      config: plugins.flatMap((p) =>
        p.config
          .filter((c) => hit(c.key) || hit(c.what))
          .map((c) => ({ ...c, plugin: p.short, slug: p.slug }))
      ),
    };
  }, [needle]);

  const total = results
    ? results.plugins.length +
      results.commands.length +
      results.permissions.length +
      results.config.length
    : 0;

  return (
    <div>
      <label className="block">
        <span className="sr-only">Search the Frontier Suite</span>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search plugins, commands, permissions, config keys…"
          className="w-full rounded-md border px-4 py-3 text-sm t-text bg-transparent placeholder:t-text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
          style={{ borderColor: 'var(--c-border)' }}
        />
      </label>

      {!results && (
        <>
          <div className="mt-5 flex flex-wrap gap-2 justify-center">
            {filters.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`mc-pill ${filter === f ? 'mc-pill-active' : ''}`}
                aria-pressed={filter === f}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="mt-8 space-y-10">
            {categoryOrder
              .filter((c) => filter === 'All' || filter === c)
              .map((cat) => {
                const inCat = plugins.filter((p) => p.category === cat);
                if (inCat.length === 0) return null;
                return (
                  <div key={cat}>
                    <div className="mb-4">
                      <h3 className="font-pixel text-xp text-xs glow-xp uppercase tracking-widest mb-1">
                        {cat}
                      </h3>
                      <p className="t-text-muted text-xs">{categoryBlurb[cat]}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {inCat.map((p) => (
                        <PluginCard key={p.slug} slug={p.slug} />
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        </>
      )}

      {results && (
        <div className="mt-6">
          <p className="t-text-muted text-xs mb-5">
            {total} {total === 1 ? 'result' : 'results'} for &ldquo;{q.trim()}&rdquo;
          </p>

          {total === 0 && (
            <p className="t-text-dim text-sm py-8 text-center">
              Nothing found. Try a command like <code className="text-gold">/bounty</code>, a
              config key like <code className="text-gold">knockout</code>, or a plugin name.
            </p>
          )}

          {results.plugins.length > 0 && (
            <section className="mb-8">
              <h3 className="font-pixel text-gold text-[10px] uppercase tracking-widest mb-3">
                Plugins
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {results.plugins.map((p) => (
                  <PluginCard key={p.slug} slug={p.slug} />
                ))}
              </div>
            </section>
          )}

          {results.commands.length > 0 && (
            <section className="mb-8">
              <h3 className="font-pixel text-gold text-[10px] uppercase tracking-widest mb-3">
                Commands
              </h3>
              <div className="mc-panel px-5 py-2">
                {results.commands.map((c) => (
                  <ResultRow
                    key={`${c.slug}-${c.cmd}`}
                    href={`/plugins/${c.slug}#commands`}
                    label={c.cmd}
                    detail={c.what}
                    tag={c.plugin}
                  />
                ))}
              </div>
            </section>
          )}

          {results.permissions.length > 0 && (
            <section className="mb-8">
              <h3 className="font-pixel text-gold text-[10px] uppercase tracking-widest mb-3">
                Permission nodes
              </h3>
              <div className="mc-panel px-5 py-2">
                {results.permissions.map((n) => (
                  <ResultRow
                    key={`${n.slug}-${n.node}`}
                    href={`/plugins/${n.slug}#permissions`}
                    label={n.node}
                    detail={`**${n.def}** — ${n.grants}`}
                    tag={n.plugin}
                  />
                ))}
              </div>
            </section>
          )}

          {results.config.length > 0 && (
            <section>
              <h3 className="font-pixel text-gold text-[10px] uppercase tracking-widest mb-3">
                Config keys
              </h3>
              <div className="mc-panel px-5 py-2">
                {results.config.map((c) => (
                  <ResultRow
                    key={`${c.slug}-${c.key}`}
                    href={`/plugins/${c.slug}#config`}
                    label={c.key}
                    detail={`\`${c.def}\` — ${c.what}`}
                    tag={c.plugin}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
