'use client';

import { useEffect, useState } from 'react';
import pollsData from '@/data/polls.json';
import CloudTitle from '@/components/CloudTitle';
import CloudText from '@/components/CloudText';

type Poll = (typeof pollsData.polls)[number];
type PollState = { counts: Record<string, number>; userVote: string | null };

export default function PollsPage() {
  const [state, setState] = useState<Record<string, PollState>>({});
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/polls', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data: Record<string, PollState>) => setState(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function vote(pollId: string, optionId: string) {
    if (voting) return;
    const prev = state[pollId];

    const optimistic: Record<string, number> = { ...(prev?.counts ?? {}) };
    if (prev?.userVote && prev.userVote !== optionId) {
      optimistic[prev.userVote] = Math.max(0, (optimistic[prev.userVote] ?? 0) - 1);
    }
    if (prev?.userVote !== optionId) {
      optimistic[optionId] = (optimistic[optionId] ?? 0) + 1;
    }
    setState((s) => ({ ...s, [pollId]: { counts: optimistic, userVote: optionId } }));
    setVoting(pollId);

    try {
      const res = await fetch(`/api/polls/${pollId}/vote`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ optionId }),
      });
      if (!res.ok) throw new Error('vote failed');
      const data = (await res.json()) as PollState;
      setState((s) => ({ ...s, [pollId]: data }));
    } catch {
      if (prev) setState((s) => ({ ...s, [pollId]: prev }));
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
            Vote on plugins, gameplay rules, and upcoming events. One vote per poll &mdash; change your mind anytime.
          </p>
        </CloudText>

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

function PollCard({
  poll,
  state,
  loading,
  busy,
  onVote,
}: {
  poll: Poll;
  state: PollState | undefined;
  loading: boolean;
  busy: boolean;
  onVote: (optionId: string) => void;
}) {
  const counts = state?.counts ?? {};
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const userVote = state?.userVote ?? null;

  return (
    <div className="mc-panel p-6">
      <h3 className="font-pixel text-enchant text-xs mb-4 glow-enchant">{poll.question}</h3>
      <div className="space-y-2">
        {poll.options.map((opt) => {
          const count = counts[opt.id] ?? 0;
          const pct = total > 0 ? (count / total) * 100 : 0;
          const selected = userVote === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              disabled={busy || loading}
              onClick={() => onVote(opt.id)}
              className={`inventory-slot p-2.5 w-full text-left relative overflow-hidden enchant-hover transition-all ${
                selected ? 'ring-2 ring-xp' : ''
              } ${busy ? 'opacity-70 cursor-wait' : loading ? 'cursor-wait' : 'cursor-pointer'}`}
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
    </div>
  );
}
