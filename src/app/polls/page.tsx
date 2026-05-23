'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import pollsData from '@/data/polls.json';
import pollResults from '@/data/poll-results.json';
import { POLLS_CLOSE_AT } from '@/lib/polls';
import CloudTitle from '@/components/CloudTitle';
import CloudText from '@/components/CloudText';

type Poll = (typeof pollsData.polls)[number];
type PollState = { counts: Record<string, number>; userVote: string | null };
type DecisionStatus = 'live' | 'later' | 'tbd';
type Decision = {
  pollId: string;
  title: string;
  status: DecisionStatus;
  summary: string;
};

const decisions = pollResults.decisions as Decision[];

const statusGroups: { status: DecisionStatus; label: string; tag: string; tagClass: string; cardAccent: string }[] = [
  {
    status: 'live',
    label: 'Live at launch',
    tag: 'LIVE',
    tagClass: 'text-xp border-xp/50 bg-xp/10',
    cardAccent: 'border-xp/30',
  },
  {
    status: 'later',
    label: 'Coming later',
    tag: 'LATER',
    tagClass: 'text-gold border-gold/50 bg-gold/10',
    cardAccent: 'border-gold/30',
  },
  {
    status: 'tbd',
    label: 'Still being decided',
    tag: 'TBD',
    tagClass: 'text-enchant border-enchant/50 bg-enchant/10',
    cardAccent: 'border-enchant/30',
  },
];

const subscribeNoop = () => () => {};

export default function PollsPage() {
  const isHydrated = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const [now, setNow] = useState(() => Date.now());
  const closed = isHydrated && now >= POLLS_CLOSE_AT;

  const [state, setState] = useState<Record<string, PollState>>({});
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  useEffect(() => {
    fetch('/api/polls', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data: Record<string, PollState>) => setState(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (Date.now() >= POLLS_CLOSE_AT) return;
    const remaining = POLLS_CLOSE_AT - Date.now();
    const id = setTimeout(() => setNow(Date.now()), remaining + 500);
    return () => clearTimeout(id);
  }, []);

  async function vote(pollId: string, optionId: string) {
    if (voting || closed) return;
    const prev = state[pollId];

    const optimistic: Record<string, number> = { ...(prev?.counts ?? {}) };
    if (prev?.userVote && prev.userVote !== optionId) {
      optimistic[prev.userVote] = Math.max(0, (optimistic[prev.userVote] ?? 0) - 1);
    }
    if (prev?.userVote !== optionId) {
      optimistic[optionId] = (optimistic[optionId] ?? 0) + 1;
    }
    setState((s) => ({ ...s, [pollId]: { counts: optimistic, userVote: optionId } }));
    setErrors((e) => ({ ...e, [pollId]: null }));
    setVoting(pollId);

    try {
      const res = await fetch(`/api/polls/${pollId}/vote`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ optionId }),
      });
      if (!res.ok) {
        let msg = 'Vote failed.';
        if (res.status === 429) {
          const retry = res.headers.get('retry-after');
          msg = retry ? `Slow down — try again in ${retry}s.` : 'Slow down — try again shortly.';
        } else if (res.status === 403) {
          let reason: string | undefined;
          try {
            const data = (await res.clone().json()) as { reason?: string };
            reason = data.reason;
          } catch {}
          if (reason === 'polls-closed') {
            msg = 'Polls are closed.';
            setNow(Date.now());
          } else {
            msg = 'Vote limit reached for this network.';
          }
        }
        if (prev) setState((s) => ({ ...s, [pollId]: prev }));
        else setState((s) => {
          const next = { ...s };
          delete next[pollId];
          return next;
        });
        setErrors((e) => ({ ...e, [pollId]: msg }));
        return;
      }
      const data = (await res.json()) as PollState;
      setState((s) => ({ ...s, [pollId]: data }));
    } catch {
      if (prev) setState((s) => ({ ...s, [pollId]: prev }));
      setErrors((e) => ({ ...e, [pollId]: 'Vote failed.' }));
    } finally {
      setVoting(null);
    }
  }

  const categories: string[] = [];
  for (const p of pollsData.polls) {
    if (!categories.includes(p.category)) categories.push(p.category);
  }
  const grouped = categories.map((name) => ({
    name,
    polls: pollsData.polls.filter((p) => p.category === name),
  }));

  return (
    <div>
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center">
          <CloudTitle>
            <h1 className="font-pixel text-gold text-2xl sm:text-3xl mb-4 glow-gold">Polls</h1>
          </CloudTitle>
        </div>
        <CloudText className="max-w-2xl mx-auto mb-12 text-center">
          <p className="t-text-dim">
            {closed
              ? 'Polls closed Thursday night before launch. Quick summary first, full vote counts below.'
              : 'Vote on plugins, gameplay rules, and upcoming events. One vote per poll — change your mind anytime.'}
          </p>
        </CloudText>

        {closed && <ResultsSummary />}

        {grouped.map((cat, idx) => (
          <div key={cat.name} className={idx === 0 ? '' : 'mt-16'}>
            <div className="text-center">
              <CloudTitle>
                <h2 className="font-pixel text-gold text-lg mb-8 glow-gold">{cat.name}</h2>
              </CloudTitle>
            </div>
            <div className="space-y-6">
              {cat.polls.map((poll) => (
                <PollCard
                  key={poll.id}
                  poll={poll}
                  state={state[poll.id]}
                  loading={loading}
                  busy={voting === poll.id}
                  closed={closed}
                  error={errors[poll.id] ?? null}
                  onVote={(optionId) => vote(poll.id, optionId)}
                />
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

function ResultsSummary() {
  return (
    <div className="mb-16">
      <div className="text-center mb-8">
        <CloudTitle>
          <h2 className="font-pixel text-gold text-lg mb-3 glow-gold">What the community decided</h2>
        </CloudTitle>
        <p className="t-text-muted text-xs font-pixel uppercase tracking-widest">
          Tap any decision to jump to the vote counts
        </p>
      </div>

      <div className="space-y-10">
        {statusGroups.map((group) => {
          const items = decisions.filter((d) => d.status === group.status);
          if (items.length === 0) return null;
          return (
            <div key={group.status}>
              <div className="flex items-center gap-3 mb-4">
                <span
                  className={`font-pixel text-[9px] uppercase tracking-widest px-2 py-1 border ${group.tagClass}`}
                >
                  {group.tag}
                </span>
                <h3 className="font-pixel text-gold text-xs glow-gold">{group.label}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {items.map((d) => (
                  <a
                    key={d.pollId}
                    href={`#${d.pollId}`}
                    className={`mc-panel p-4 border-2 ${group.cardAccent} hover-surface block transition-all`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h4 className="font-pixel text-enchant text-[11px] glow-enchant">{d.title}</h4>
                      <span
                        className={`font-pixel text-[8px] uppercase tracking-widest px-1.5 py-0.5 border shrink-0 ${group.tagClass}`}
                      >
                        {group.tag}
                      </span>
                    </div>
                    <p className="t-text-dim text-sm leading-relaxed">{d.summary}</p>
                  </a>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PollCard({
  poll,
  state,
  loading,
  busy,
  closed,
  error,
  onVote,
}: {
  poll: Poll;
  state: PollState | undefined;
  loading: boolean;
  busy: boolean;
  closed: boolean;
  error: string | null;
  onVote: (optionId: string) => void;
}) {
  const counts = state?.counts ?? {};
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const userVote = state?.userVote ?? null;

  return (
    <div id={poll.id} className="mc-panel p-6 scroll-mt-24">
      <div className="flex items-start justify-between gap-3 mb-4">
        <h3 className="font-pixel text-enchant text-xs glow-enchant">{poll.question}</h3>
        {closed && (
          <span className="font-pixel text-[9px] uppercase tracking-widest t-text-muted border border-current/40 px-2 py-1 shrink-0">
            Closed
          </span>
        )}
      </div>
      <div className="space-y-2">
        {poll.options.map((opt) => {
          const count = counts[opt.id] ?? 0;
          const pct = total > 0 ? (count / total) * 100 : 0;
          const selected = userVote === opt.id;
          const disabled = busy || loading || closed;
          return (
            <button
              key={opt.id}
              type="button"
              disabled={disabled}
              onClick={() => onVote(opt.id)}
              className={`inventory-slot p-2.5 w-full text-left relative overflow-hidden transition-all ${
                closed ? '' : 'enchant-hover'
              } ${selected ? 'ring-2 ring-xp' : ''} ${
                busy
                  ? 'opacity-70 cursor-wait'
                  : loading
                  ? 'cursor-wait'
                  : closed
                  ? 'cursor-default'
                  : 'cursor-pointer'
              }`}
            >
              <div
                className="absolute inset-y-0 left-0 bg-xp/20 transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
              <div className="relative flex items-center justify-between gap-3">
                <span className="font-pixel t-text text-[10px]">{opt.label}</span>
                <span className="t-text-muted text-xs font-pixel shrink-0">
                  {count} &middot; {pct.toFixed(0)}%
                </span>
              </div>
            </button>
          );
        })}
      </div>
      <div className="mt-4 text-center">
        <span className="font-pixel text-[10px] t-text-muted uppercase tracking-wider">
          {total} {total === 1 ? 'vote' : 'votes'}
          {userVote && ' · your vote recorded'}
        </span>
      </div>
      {error && (
        <div className="mt-2 text-center">
          <span className="font-pixel text-[10px] text-redstone uppercase tracking-wider">
            {error}
          </span>
        </div>
      )}
    </div>
  );
}
