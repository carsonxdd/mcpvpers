'use client';

import { useMemo, useState } from 'react';
import Rich from './Rich';
import type { SuiteConfigKey } from '@/data/frontier-suite';

/** `states.pacifist.knockout_enabled` → `states`; a bare `enabled` → `general`. */
function groupOf(key: string) {
  const dot = key.indexOf('.');
  return dot === -1 ? 'general' : key.slice(0, dot);
}

/**
 * The config reference for one plugin. Keys are bucketed by their first path
 * segment so a 100-key file reads as a dozen scannable sections. Big files
 * start collapsed; typing in the filter opens every section that still matches.
 */
export default function ConfigTable({ rows }: { rows: SuiteConfigKey[] }) {
  const groups = useMemo(() => {
    const byGroup = new Map<string, SuiteConfigKey[]>();
    for (const row of rows) {
      const g = groupOf(row.key);
      const bucket = byGroup.get(g);
      if (bucket) bucket.push(row);
      else byGroup.set(g, [row]);
    }
    return [...byGroup.entries()].map(([name, items]) => ({ name, items }));
  }, [rows]);

  const startsOpen = rows.length <= 30 || groups.length === 1;
  const [q, setQ] = useState('');
  const [opened, setOpened] = useState<Record<string, boolean>>({});

  const needle = q.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      groups
        .map((g) => ({
          ...g,
          items: needle
            ? g.items.filter((i) =>
                `${i.key} ${i.def} ${i.what}`.toLowerCase().includes(needle)
              )
            : g.items,
        }))
        .filter((g) => g.items.length > 0),
    [groups, needle]
  );

  const isOpen = (name: string) =>
    needle.length > 0 || (opened[name] ?? startsOpen);

  const matchCount = filtered.reduce((n, g) => n + g.items.length, 0);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <label className="flex-1 min-w-[200px]">
          <span className="sr-only">Filter config keys</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Filter ${rows.length} config keys…`}
            className="w-full rounded-md border px-3 py-2 text-sm t-text bg-transparent placeholder:t-text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
            style={{ borderColor: 'var(--c-border)' }}
          />
        </label>
        {groups.length > 1 && !needle && (
          <div className="flex gap-2">
            <button
              type="button"
              className="mc-pill"
              onClick={() =>
                setOpened(Object.fromEntries(groups.map((g) => [g.name, true])))
              }
            >
              Expand all
            </button>
            <button
              type="button"
              className="mc-pill"
              onClick={() =>
                setOpened(Object.fromEntries(groups.map((g) => [g.name, false])))
              }
            >
              Collapse
            </button>
          </div>
        )}
      </div>

      {needle && (
        <p className="t-text-muted text-xs mb-4">
          {matchCount} {matchCount === 1 ? 'key' : 'keys'} matching &ldquo;{q}&rdquo;
        </p>
      )}

      <div className="space-y-2">
        {filtered.map((group) => {
          const open = isOpen(group.name);
          return (
            <div
              key={group.name}
              className="border rounded-md overflow-hidden"
              style={{ borderColor: 'var(--c-border)' }}
            >
              <button
                type="button"
                aria-expanded={open}
                onClick={() =>
                  setOpened((o) => ({ ...o, [group.name]: !open }))
                }
                className="w-full flex items-center justify-between gap-4 text-left px-4 py-3 cursor-pointer hover-surface transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-inset"
              >
                <span className="font-mono text-sm t-text">
                  {group.name === 'general' ? 'top level' : `${group.name}.`}
                  <span className="t-text-muted text-xs ml-2">
                    {group.items.length}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className={`text-gold text-sm shrink-0 transition-transform duration-300 ease-out motion-reduce:transition-none ${
                    open ? 'rotate-45' : ''
                  }`}
                >
                  +
                </span>
              </button>

              {open && (
                <div className="px-4 pb-4 overflow-x-auto">
                  <table className="w-full text-sm max-md:text-xs">
                    <thead>
                      <tr className="border-b" style={{ borderColor: 'var(--c-border)' }}>
                        <th className="font-pixel text-gold text-[10px] text-left py-2 pr-4">Key</th>
                        <th className="font-pixel text-gold text-[10px] text-left py-2 pr-4">Default</th>
                        <th className="font-pixel text-gold text-[10px] text-left py-2">What it controls</th>
                      </tr>
                    </thead>
                    <tbody className="t-text-dim">
                      {group.items.map((item) => (
                        <tr
                          key={item.key}
                          className="border-b last:border-b-0 align-top"
                          style={{ borderColor: 'var(--c-border)' }}
                        >
                          <td className="py-3 pr-4 font-mono text-[0.85em] t-text break-words min-w-[150px]">
                            {item.key}
                          </td>
                          <td className="py-3 pr-4 font-mono text-[0.8em] text-xp break-words min-w-[90px]">
                            {item.def}
                          </td>
                          <td className="py-3 leading-relaxed">
                            <Rich text={item.what} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="t-text-muted text-sm py-6 text-center">
          No config key matches &ldquo;{q}&rdquo;.
        </p>
      )}
    </div>
  );
}
