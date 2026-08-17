'use client';

import { useMemo, useState } from 'react';
import Rich from './Rich';

export type WikiColumn = {
  head: string;
  /** Render this cell in the pixel font, no wrapping — for commands and nodes. */
  key?: boolean;
  className?: string;
};

/**
 * Filterable table used for the commands / permissions / routes blocks on a
 * plugin page. Cells are Rich-parsed, so backticks and **bold** work.
 */
export default function WikiTable({
  columns,
  rows,
  filterPlaceholder,
  /** Below this many rows the filter box is hidden — it just gets in the way. */
  filterThreshold = 8,
}: {
  columns: WikiColumn[];
  rows: string[][];
  filterPlaceholder?: string;
  filterThreshold?: number;
}) {
  const [q, setQ] = useState('');
  const showFilter = rows.length >= filterThreshold;

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((r) => r.join(' ').toLowerCase().includes(needle));
  }, [q, rows]);

  return (
    <div>
      {showFilter && (
        <label className="block mb-3">
          <span className="sr-only">{filterPlaceholder ?? 'Filter rows'}</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={filterPlaceholder ?? 'Filter…'}
            className="w-full rounded-md border px-3 py-2 text-sm t-text bg-transparent placeholder:t-text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
            style={{ borderColor: 'var(--c-border)' }}
          />
        </label>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm max-md:text-xs">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--c-border)' }}>
              {columns.map((c) => (
                <th
                  key={c.head}
                  className={`font-pixel text-gold text-[10px] text-left py-2 pr-4 last:pr-0 align-bottom ${c.className ?? ''}`}
                >
                  {c.head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="t-text-dim">
            {visible.map((row) => (
              <tr
                key={row[0]}
                className="border-b last:border-b-0 align-top"
                style={{ borderColor: 'var(--c-border)' }}
              >
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className={`py-3 pr-4 last:pr-0 leading-relaxed ${
                      columns[ci]?.key
                        ? 'font-mono text-[0.85em] t-text whitespace-nowrap'
                        : ''
                    } ${columns[ci]?.className ?? ''}`}
                  >
                    <Rich text={cell} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {visible.length === 0 && (
        <p className="t-text-muted text-sm py-6 text-center">
          Nothing matches &ldquo;{q}&rdquo;.
        </p>
      )}
    </div>
  );
}
