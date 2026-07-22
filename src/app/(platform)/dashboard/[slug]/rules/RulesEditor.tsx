'use client';

import { useActionState } from 'react';
import { createRule, updateRule, deleteRule, moveRule } from '@/lib/actions/rules';
import type { ActionState } from '@/lib/actions/tenant';

export type RuleItem = { id: string; title: string; body: string };

const inputClass =
  't-surface t-text mt-2 w-full rounded border border-white/10 px-3 py-2 text-sm';

function RuleCard({
  slug,
  rule,
  isFirst,
  isLast,
}: {
  slug: string;
  rule: RuleItem;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [updateState, updateAction, updating] = useActionState<ActionState, FormData>(updateRule, null);
  const [, deleteAction, deleting] = useActionState<ActionState, FormData>(deleteRule, null);
  const [, moveAction, moving] = useActionState<ActionState, FormData>(moveRule, null);

  return (
    <div className="mc-panel p-6">
      <form action={updateAction} className="space-y-4">
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="id" value={rule.id} />
        <input name="title" required maxLength={100} defaultValue={rule.title} className={inputClass} aria-label="Rule title" />
        <textarea name="body" required maxLength={2000} rows={3} defaultValue={rule.body} className={inputClass} aria-label="Rule body" />
        {updateState?.error && <p className="text-redstone text-xs">{updateState.error}</p>}
        <button type="submit" disabled={updating} className="mc-pill cursor-pointer px-4 py-2 font-pixel text-[10px] disabled:opacity-50">
          {updating ? 'Saving…' : 'Save'}
        </button>
      </form>

      <div className="mt-3 flex gap-2">
        <form action={moveAction}>
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="id" value={rule.id} />
          <input type="hidden" name="direction" value="up" />
          <button type="submit" disabled={isFirst || moving} className="mc-pill cursor-pointer px-3 py-1.5 font-pixel text-[10px] disabled:opacity-30" aria-label="Move up">
            ↑
          </button>
        </form>
        <form action={moveAction}>
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="id" value={rule.id} />
          <input type="hidden" name="direction" value="down" />
          <button type="submit" disabled={isLast || moving} className="mc-pill cursor-pointer px-3 py-1.5 font-pixel text-[10px] disabled:opacity-30" aria-label="Move down">
            ↓
          </button>
        </form>
        <form
          action={deleteAction}
          className="ml-auto"
          onSubmit={(e) => {
            if (!window.confirm('Delete this rule?')) e.preventDefault();
          }}
        >
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="id" value={rule.id} />
          <button type="submit" disabled={deleting} className="mc-pill cursor-pointer px-3 py-1.5 font-pixel text-[10px] text-redstone disabled:opacity-50">
            Delete
          </button>
        </form>
      </div>
    </div>
  );
}

export default function RulesEditor({ slug, rules }: { slug: string; rules: RuleItem[] }) {
  const [createState, createAction, creating] = useActionState<ActionState, FormData>(createRule, null);

  return (
    <div className="space-y-4">
      {rules.map((rule, i) => (
        <RuleCard key={rule.id} slug={slug} rule={rule} isFirst={i === 0} isLast={i === rules.length - 1} />
      ))}

      <div className="mc-panel p-6">
        <h2 className="font-pixel t-text text-xs">Add a rule</h2>
        <form action={createAction} className="mt-4 space-y-4">
          <input type="hidden" name="slug" value={slug} />
          <input name="title" required maxLength={100} placeholder="Rule title" className={inputClass} aria-label="New rule title" />
          <textarea name="body" required maxLength={2000} rows={3} placeholder="What's the rule?" className={inputClass} aria-label="New rule body" />
          {createState?.error && <p className="text-redstone text-xs">{createState.error}</p>}
          <button type="submit" disabled={creating} className="mc-pill cursor-pointer px-4 py-2 font-pixel text-[10px] disabled:opacity-50">
            {creating ? 'Adding…' : '+ Add rule'}
          </button>
        </form>
      </div>
    </div>
  );
}
