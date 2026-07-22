'use client';

import { useActionState } from 'react';
import { saveConnection, testConnection, type ConnectionState } from '@/lib/actions/connection';

const inputClass =
  't-surface t-text mt-2 w-full rounded border border-white/10 px-3 py-2 text-sm';

function StatusLine({ state }: { state: ConnectionState }) {
  if (!state) return null;
  return (
    <p className={`text-xs ${state.ok ? 'text-xp' : 'text-redstone'}`} role="status">
      {state.message}
    </p>
  );
}

export default function ConnectionForm({
  slug,
  initialUrl,
}: {
  slug: string;
  initialUrl: string;
}) {
  const [saveState, saveAction, saving] = useActionState<ConnectionState, FormData>(saveConnection, null);
  const [testState, testAction, testing] = useActionState<ConnectionState, FormData>(testConnection, null);

  return (
    <div className="space-y-4">
      <form action={saveAction} className="space-y-4">
        <input type="hidden" name="slug" value={slug} />
        <div>
          <label htmlFor="pistatsUrl" className="font-pixel t-text block text-[10px]">
            PiStatsAPI URL
          </label>
          <input
            id="pistatsUrl"
            name="pistatsUrl"
            defaultValue={initialUrl}
            placeholder="http://your-host.example.net:17249"
            maxLength={300}
            className={inputClass}
          />
          <p className="t-text-muted mt-1 text-xs">
            Leave empty and save to disconnect live stats.
          </p>
        </div>
        <StatusLine state={saveState} />
        <button
          type="submit"
          disabled={saving}
          className="mc-pill cursor-pointer px-4 py-2 font-pixel text-[10px] disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </form>

      <form action={testAction} className="space-y-3">
        <input type="hidden" name="slug" value={slug} />
        <StatusLine state={testState} />
        <button
          type="submit"
          disabled={testing}
          className="mc-pill cursor-pointer px-4 py-2 font-pixel text-[10px] disabled:opacity-50"
        >
          {testing ? 'Testing…' : 'Test connection'}
        </button>
      </form>
    </div>
  );
}
