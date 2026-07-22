'use client';

import { useEffect, useState } from 'react';
import CloudTitle from '@/components/CloudTitle';
import CloudText from '@/components/CloudText';
import CloudTextSmall from '@/components/CloudTextSmall';
import GrassDivider from '@/components/GrassDivider';

export default function BedrockPollPage() {
  const [count, setCount] = useState<number | null>(null);
  const [voted, setVoted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('mc-bedrock-poll-voted') === 'true') {
      setVoted(true);
    }
    fetch('/api/bedrock-poll', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setCount(typeof d.count === 'number' ? d.count : 0))
      .catch(() => setError('Could not load the vote count. Try refreshing.'));
  }, []);

  async function vote() {
    if (submitting || voted) return;
    setSubmitting(true);
    setError(null);
    try {
      const r = await fetch('/api/bedrock-poll', { method: 'POST', cache: 'no-store' });
      if (!r.ok) throw new Error('bad status');
      const d = await r.json();
      if (typeof d.count === 'number') setCount(d.count);
      setVoted(true);
      localStorage.setItem('mc-bedrock-poll-voted', 'true');
    } catch {
      setError('Vote failed. Try again?');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <CloudTitle>
          <h1 className="font-pixel text-gold text-2xl sm:text-3xl mb-4 glow-gold">Bedrock Support?</h1>
        </CloudTitle>
        <CloudTextSmall className="mb-8">
          <p className="t-text-dim">
            We&apos;re a Java server today. Adding Bedrock edition support lets Xbox, PlayStation,
            Switch, and mobile players join too, but it&apos;s real work to set up and keep running.
          </p>
        </CloudTextSmall>
        <CloudText className="mb-10">
          <p className="t-text-dim leading-relaxed">
            If enough people actually want it, we&apos;ll build it. Otherwise we&apos;ll put that time
            into other things. Your vote tells us which way to go.
          </p>
        </CloudText>
      </section>

      <GrassDivider />

      <section className="max-w-2xl mx-auto px-4 py-16">
        <div className="mc-panel p-8 sm:p-10 text-center">
          <p className="font-pixel t-text-dim text-[10px] uppercase tracking-widest mb-3">
            Players who want Bedrock
          </p>
          <div className="font-pixel text-gold glow-gold text-5xl sm:text-6xl mb-2">
            {count === null ? '…' : count}
          </div>
          <p className="t-text-muted text-xs mb-8">
            {count === null
              ? 'Loading…'
              : count === 1
              ? 'vote so far'
              : 'votes so far'}
          </p>

          {voted ? (
            <div className="space-y-2">
              <p className="font-pixel text-xp text-sm glow-xp">Thanks — your vote counts.</p>
              <p className="t-text-muted text-xs">
                We&apos;ll revisit this once we have a clearer read on interest.
              </p>
            </div>
          ) : (
            <>
              <button
                onClick={vote}
                disabled={submitting || count === null}
                className="mc-pill mc-pill-active font-pixel text-xs px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting…' : "I'm interested"}
              </button>
              <p className="t-text-muted text-[11px] mt-4">
                One vote per person. We only store a hashed version of your IP for dedupe.
              </p>
            </>
          )}

          {error && (
            <p className="text-redstone text-xs mt-4 font-pixel">{error}</p>
          )}
        </div>
      </section>

      <GrassDivider />

      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center">
          <CloudTitle>
            <h2 className="font-pixel text-gold text-lg mb-6 glow-gold">What Bedrock would mean</h2>
          </CloudTitle>
        </div>
        <div className="mc-panel p-6">
          <ul className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="text-xp shrink-0 font-pixel">+</span>
              <span className="t-text-dim">
                Console and mobile players can join without buying Java Edition.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-xp shrink-0 font-pixel">+</span>
              <span className="t-text-dim">
                Bigger player base, more people online at once.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-redstone shrink-0 font-pixel">!</span>
              <span className="t-text-dim">
                Some plugins and combat mechanics work differently on Bedrock.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-redstone shrink-0 font-pixel">!</span>
              <span className="t-text-dim">
                Console players may need a one-time DNS change to connect.
              </span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
