'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import CloudTitle from '@/components/CloudTitle';
import EventRunDetail from '@/components/EventRunDetail';
import GearChip from '@/components/GearChip';

type PvpEntry = {
  rank: number;
  uuid: string | null;
  name: string;
  matches: number;
  wins: number;
  kills: number;
  deaths: number;
  kd: number;
  total_money: number;
  best_killstreak: number;
  mvps: number;
};

type PvpMatch = {
  id: number;
  mode: string;
  decided: boolean;
  players: number;
  duration_ms: number;
  winner: string | null;
  mvp: string | null;
  gear_mode?: string | null;
  ended_at: number;
};

type PvpSnapshot = {
  available: boolean;
  boards: Record<string, PvpEntry[]>;
  recent: PvpMatch[];
  updatedAt: number;
};

// The boards, in tab order. `format` renders the sorted column per board.
const intFmt = (v: number) => Math.round(v).toLocaleString();
const BOARDS: { key: string; label: string; field: keyof PvpEntry; blurb: string; format: (v: number) => string }[] = [
  { key: 'wins', label: 'Wins', field: 'wins', blurb: 'Matches won', format: intFmt },
  { key: 'kills', label: 'Kills', field: 'kills', blurb: 'Total kills', format: intFmt },
  { key: 'kd', label: 'K/D', field: 'kd', blurb: 'Kill-to-death ratio', format: (v) => v.toFixed(2) },
  { key: 'streak', label: 'Killstreak', field: 'best_killstreak', blurb: 'Best killstreak', format: intFmt },
  { key: 'mvps', label: 'MVPs', field: 'mvps', blurb: 'Match MVP awards', format: intFmt },
  { key: 'matches', label: 'Matches', field: 'matches', blurb: 'Matches played', format: intFmt },
  { key: 'earnings', label: 'Earnings', field: 'total_money', blurb: 'Money won in the arena', format: (v) => `$${Math.round(v).toLocaleString()}` },
];

const medalStyles = ['text-gold glow-gold', 'text-silver glow-silver', 'text-bronze glow-bronze'];

// Team color → chip classes for the match-log winner badge.
const TEAM_CHIP: Record<string, string> = {
  RED: 'bg-redstone/15 text-redstone',
  BLUE: 'bg-blue-500/15 text-blue-300',
  GREEN: 'bg-xp/15 text-xp',
  YELLOW: 'bg-gold/15 text-gold',
};

function formatAgo(ts: number): string {
  if (!ts) return '';
  const secs = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (secs < 60) return 'just now';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatDuration(ms: number): string {
  if (!ms || ms <= 0) return '';
  const total = Math.round(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export default function PvpPage() {
  const [snap, setSnap] = useState<PvpSnapshot | null>(null);
  const [activeBoard, setActiveBoard] = useState<string>('wins');
  const [expandedMatch, setExpandedMatch] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/pvp-snapshot')
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return (await r.json()) as PvpSnapshot;
      })
      .then((json) => {
        if (!cancelled) setSnap(json);
      })
      .catch((e) => {
        if (!cancelled) setError(String(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const available = snap?.available ?? false;
  const recent = snap?.recent ?? [];
  const board = snap?.boards[activeBoard] ?? [];
  const activeMeta = BOARDS.find((b) => b.key === activeBoard)!;
  const hasBoards = BOARDS.some((b) => (snap?.boards[b.key]?.length ?? 0) > 0);

  return (
    <div>
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="mb-6">
          <Link href="/events" className="text-sm t-text-muted hover:underline">
            ← Events
          </Link>
        </div>

        <div className="text-center">
          <CloudTitle>
            <h1 className="font-pixel text-gold text-2xl sm:text-3xl mb-3 glow-gold">PvP Arena</h1>
          </CloudTitle>
          <p className="relative z-10 t-text-muted text-sm max-w-xl mx-auto mb-10">
            Step into the coliseum. Team Deathmatch and Free-for-All, fought in scheduled matches -
            every kill pays, every win pays more, and the boards remember who showed up.
          </p>
        </div>

        {/* How it works */}
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          <div className="mc-panel p-5">
            <h2 className="font-pixel text-gold text-xs mb-2">Team Deathmatch</h2>
            <p className="t-text-muted text-sm leading-snug">
              Two teams, balanced kits, one scoreboard. Rack up kills or wipe the other side out.
              Respawn mode keeps you in the fight; elimination rounds don&apos;t. If the clock runs out
              level, it&apos;s a draw.
            </p>
          </div>
          <div className="mc-panel p-5">
            <h2 className="font-pixel text-gold text-xs mb-2">Free-for-All</h2>
            <p className="t-text-muted text-sm leading-snug">
              Everyone for themselves. Same arena, same kit, no allies - last one standing (or top of
              the kill count at time) takes the podium. Watch your back; everyone&apos;s a target.
            </p>
          </div>
        </div>

        {/* Payouts */}
        <div className="mc-panel p-5 mb-4">
          <h2 className="font-pixel t-text-dim text-xs mb-1">Payouts</h2>
          <p className="t-text-muted text-[11px] mb-4">Cash hits your balance the moment the match ends.</p>
          <div className="space-y-3 text-sm">
            <PayoutRow amount="$150" label="Participation" who="everyone who joins and stays" />
            <PayoutRow amount="$25 / kill" label="Bounty" who="capped at $500 per match" />
            <PayoutRow amount="$2,500 pool" label="TDM win" who="split among the winning team" />
            <PayoutRow amount="$1,250 / $750 / $500" label="FFA podium" who="1st · 2nd · 3rd" />
            <PayoutRow amount="$500" label="MVP" who="most valuable player of the match" />
          </div>
        </div>

        {/* Gear modes — PvP is where HARDCORE bites hardest */}
        <div className="mc-panel p-5 mb-12">
          <h2 className="font-pixel t-text-dim text-xs mb-1">Gear modes</h2>
          <p className="t-text-muted text-[11px] mb-4">
            Every match runs in one of three gear modes - check the chip on the match before you queue up.
          </p>
          <div className="space-y-2.5 text-sm">
            <div className="flex gap-2.5">
              <span className="font-pixel text-[9px] px-1.5 py-0.5 rounded shrink-0 h-fit min-w-[6rem] text-center bg-xp/15 text-xp">KIT</span>
              <span className="t-text-muted leading-snug">
                Most matches. Gear&apos;s provided, your inventory is vaulted, deaths cost nothing.
              </span>
            </div>
            <div className="flex gap-2.5">
              <span className="font-pixel text-[9px] px-1.5 py-0.5 rounded shrink-0 h-fit min-w-[6rem] text-center bg-gold/15 text-gold">BYOG</span>
              <span className="t-text-muted leading-snug">
                Bring your own gear, but you keep it no matter what - durability and consumables are the only risk.
              </span>
            </div>
            <div className="flex gap-2.5">
              <span className="font-pixel text-[9px] px-1.5 py-0.5 rounded shrink-0 h-fit min-w-[6rem] text-center bg-redstone/15 text-redstone">HARDCORE</span>
              <span className="t-text-muted leading-snug">
                The real-stakes mode: die and your inventory drops where you fell, free for anyone to grab -
                winners walk away with the losers&apos; gear. You confirm before joining.
              </span>
            </div>
          </div>
        </div>

        {/* States */}
        {loading && (
          <div className="px-4 py-10 text-center t-text-muted text-sm">Loading…</div>
        )}
        {!loading && error && (
          <div className="px-4 py-10 text-center t-text-muted text-sm">
            Couldn&apos;t reach the arena stats. The server may be restarting - try again later.
          </div>
        )}
        {!loading && !error && !available && (
          <div className="mc-panel px-4 py-10 text-center t-text-muted text-sm">
            The arena isn&apos;t live yet - the boards light up once the first matches are fought.
            Check back after launch.
          </div>
        )}

        {/* Leaderboards */}
        {!loading && !error && available && (
          <div className="mb-16">
            <h2 className="font-pixel t-text text-sm mb-4 px-1">Boards</h2>

            <div className="flex flex-wrap gap-1.5 mb-2 justify-center relative z-10">
              {BOARDS.map((b) => (
                <button
                  key={b.key}
                  onClick={() => setActiveBoard(b.key)}
                  className={`mc-pill ${activeBoard === b.key ? 'mc-pill-active' : ''}`}
                >
                  {b.label}
                </button>
              ))}
            </div>
            <p className="text-center t-text-muted text-[11px] mb-6">{activeMeta.blurb}</p>

            <div className="mc-panel overflow-hidden max-md:overflow-x-auto">
              <div className="max-md:min-w-[320px]">
                <div className="grid grid-cols-[3rem_1fr_auto] gap-4 px-4 py-3 t-border-50 border-b max-md:grid-cols-[2.5rem_1fr_auto] max-md:gap-3 max-md:px-3">
                  <span className="font-pixel t-text-muted text-[10px]">#</span>
                  <span className="font-pixel t-text-muted text-[10px]">Player</span>
                  <span className="font-pixel t-text-muted text-[10px] text-right">{activeMeta.label}</span>
                </div>

                {board.length === 0 ? (
                  <div className="px-4 py-8 text-center t-text-muted text-sm">
                    {hasBoards ? 'No one on this board yet.' : 'No matches fought yet.'}
                  </div>
                ) : (
                  board.map((p, i) => {
                    const value = p[activeMeta.field] as number;
                    return (
                      <div
                        key={p.uuid ?? p.name}
                        className="grid grid-cols-[3rem_1fr_auto] gap-4 px-4 py-3 t-border-20 border-b transition-colors hover-surface max-md:grid-cols-[2.5rem_1fr_auto] max-md:gap-3 max-md:px-3"
                        style={i < 3 ? { background: 'color-mix(in srgb, var(--c-surface) 30%, transparent)' } : undefined}
                      >
                        <span className={`font-pixel text-xs ${i < 3 ? medalStyles[i] : 't-text-muted'}`}>
                          {i + 1}
                        </span>
                        <Link
                          href={`/player/${encodeURIComponent(p.name)}`}
                          className="flex items-center gap-2.5 min-w-0 hover:underline"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`https://mc-heads.net/avatar/${p.uuid ?? p.name}/24`}
                            alt=""
                            width={24}
                            height={24}
                            loading="lazy"
                            className="w-6 h-6 rounded shrink-0 t-surface-light"
                          />
                          <span className={`text-sm max-md:truncate ${i < 3 ? 't-text font-medium' : 't-text-dim'}`}>
                            {p.name}
                          </span>
                        </Link>
                        <span className={`text-sm text-right whitespace-nowrap ${i === 0 ? 'text-gold font-pixel text-xs' : 't-text-muted'}`}>
                          {activeMeta.format(value)}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* Match log */}
        {!loading && !error && available && recent.length > 0 && (
          <div className="mb-4">
            <h2 className="font-pixel t-text text-sm mb-4 px-1">Match Log</h2>
            <div className="mc-panel overflow-hidden">
              {recent.map((m, i) => {
                const canExpand = typeof m.id === 'number';
                const expanded = canExpand && expandedMatch === m.id;
                const duration = formatDuration(m.duration_ms);
                return (
                  <div key={m.id ?? i} className="t-border-20 border-b last:border-b-0">
                    <button
                      type="button"
                      onClick={canExpand ? () => setExpandedMatch(expanded ? null : m.id) : undefined}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors ${canExpand ? 'hover-surface' : 'cursor-default'}`}
                      aria-expanded={canExpand ? expanded : undefined}
                    >
                      <span className="font-pixel text-[10px] px-2 py-1 rounded shrink-0 t-surface-light t-text-dim">
                        {m.mode}
                      </span>
                      {m.decided ? (
                        <span className={`font-pixel text-[10px] px-2 py-1 rounded shrink-0 ${TEAM_CHIP[m.winner ?? ''] ?? 'bg-gold/15 text-gold'}`}>
                          {m.winner ? `${m.winner} wins` : 'Decided'}
                        </span>
                      ) : (
                        <span className="font-pixel text-[10px] px-2 py-1 rounded shrink-0 t-surface-light t-text-muted">
                          Draw
                        </span>
                      )}
                      <GearChip mode={m.gear_mode} />
                      <span className="t-text-dim min-w-0 truncate">
                        {m.players} {m.players === 1 ? 'player' : 'players'}
                        {duration && <span className="t-text-muted max-md:hidden"> · {duration}</span>}
                      </span>
                      {m.mvp && (
                        <span className="t-text-muted text-xs shrink-0 max-md:hidden">★ {m.mvp}</span>
                      )}
                      <span className="t-text-muted text-xs ml-auto whitespace-nowrap shrink-0">
                        {formatAgo(m.ended_at)}
                      </span>
                      {canExpand && (
                        <span className={`t-text-muted text-[10px] shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`} aria-hidden>
                          ▶
                        </span>
                      )}
                    </button>
                    {expanded && <EventRunDetail runId={m.id} />}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function PayoutRow({ amount, label, who }: { amount: string; label: string; who: string }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
      <span className="text-gold font-pixel text-xs shrink-0 w-44 max-md:w-full">{amount}</span>
      <span className="t-text-dim">{label}</span>
      <span className="t-text-muted text-xs">- {who}</span>
    </div>
  );
}
