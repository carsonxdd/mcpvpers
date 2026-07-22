'use client';

import { useEffect, useState } from 'react';

type Entry = {
  rank: number;
  uuid: string | null;
  name: string;
  value: number;
};

type Board = {
  key: string;
  label: string;
  query: string;
  format: 'playtime' | 'distance' | 'number';
};

// Direct `leaderboard?stat=` boards only — the pvpers fan-out boards
// (commendations, skills, outlaw) need server-side snapshot machinery that is
// deliberately not shared across tenants.
const BOARDS: Board[] = [
  { key: 'playtime', label: 'Playtime', query: 'stat=playtime&window=all', format: 'playtime' },
  { key: 'playtime-month', label: 'Playtime (month)', query: 'stat=playtime&window=month', format: 'playtime' },
  { key: 'playtime-week', label: 'Playtime (week)', query: 'stat=playtime&window=week', format: 'playtime' },
  { key: 'deaths', label: 'Deaths', query: 'stat=deaths', format: 'number' },
  { key: 'mob_kills', label: 'Mob Kills', query: 'stat=mob_kills', format: 'number' },
  { key: 'ores_mined', label: 'Ores Mined', query: 'stat=ores_mined', format: 'number' },
  { key: 'distance', label: 'Distance', query: 'stat=distance', format: 'distance' },
  { key: 'advancements', label: 'Advancements', query: 'stat=advancements', format: 'number' },
  { key: 'xp_levels', label: 'XP Levels', query: 'stat=xp_levels', format: 'number' },
];

function formatPlaytime(seconds: number): string {
  const totalMinutes = Math.floor(seconds / 60);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes - days * 60 * 24) / 60);
  const minutes = totalMinutes - days * 60 * 24 - hours * 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatDistance(cm: number): string {
  const km = cm / 100_000;
  if (km >= 10) return `${Math.round(km)} km`;
  if (km >= 1) return `${km.toFixed(1)} km`;
  return `${Math.round(cm / 100)} m`;
}

function formatValue(format: Board['format'], value: number): string {
  if (format === 'playtime') return formatPlaytime(value);
  if (format === 'distance') return formatDistance(value);
  return value.toLocaleString();
}

export default function TenantLeaderboard({ slug }: { slug: string }) {
  const [active, setActive] = useState<Board>(BOARDS[0]);
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setEntries(null);
    setFailed(false);

    (async () => {
      try {
        const r = await fetch(`/api/s/${slug}/stats/leaderboard?${active.query}&limit=100`);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const json = (await r.json()) as { players?: Entry[] };
        if (cancelled) return;
        setEntries(Array.isArray(json?.players) ? json.players : []);
      } catch {
        if (cancelled) return;
        setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug, active]);

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2">
        {BOARDS.map((board) => (
          <button
            key={board.key}
            type="button"
            onClick={() => setActive(board)}
            className={`cursor-pointer px-3 py-1.5 font-pixel text-[10px] ${
              active.key === board.key ? 'mc-pill mc-pill-active' : 'mc-pill'
            }`}
          >
            {board.label}
          </button>
        ))}
      </div>

      <div className="mc-panel mt-8 p-6">
        {failed && (
          <p className="t-text-muted py-8 text-center font-pixel text-xs">
            Leaderboards are unreachable right now. Try again in a minute.
          </p>
        )}
        {!failed && entries === null && (
          <p className="t-text-muted py-8 text-center font-pixel text-xs">Loading…</p>
        )}
        {!failed && entries !== null && entries.length === 0 && (
          <p className="t-text-muted py-8 text-center font-pixel text-xs">No players yet.</p>
        )}
        {!failed && entries !== null && entries.length > 0 && (
          <ol className="space-y-1">
            {entries.map((entry) => (
              <li
                key={`${entry.rank}-${entry.name}`}
                className="hover-surface flex items-center gap-3 rounded px-2 py-1.5"
              >
                <span className="t-text-muted w-8 shrink-0 text-right font-pixel text-[10px]">
                  #{entry.rank}
                </span>
                {entry.uuid ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`https://mc-heads.net/avatar/${entry.uuid}/24`}
                    alt=""
                    width={24}
                    height={24}
                    className="shrink-0 rounded-sm"
                  />
                ) : (
                  <span className="t-surface h-6 w-6 shrink-0 rounded-sm" />
                )}
                <span className="t-text min-w-0 flex-1 truncate text-sm">{entry.name}</span>
                <span className="text-gold shrink-0 font-pixel text-[10px]">
                  {formatValue(active.format, entry.value)}
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
