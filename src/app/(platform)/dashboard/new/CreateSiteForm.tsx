'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { createTenant, type ActionState } from '@/lib/actions/tenant';
import { slugify } from '@/lib/reserved-slugs';

export default function CreateSiteForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createTenant,
    null,
  );
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <label htmlFor="name" className="font-pixel t-text block text-[10px]">
          Server name
        </label>
        <input
          id="name"
          name="name"
          required
          maxLength={60}
          placeholder="Skyfall SMP"
          className="t-surface t-text mt-2 w-full rounded border border-white/10 px-3 py-2 text-sm"
          onChange={(e) => {
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
        />
      </div>

      <div>
        <label htmlFor="serverIp" className="font-pixel t-text block text-[10px]">
          Server address
        </label>
        <input
          id="serverIp"
          name="serverIp"
          required
          maxLength={253}
          placeholder="mc.example.net"
          className="t-surface t-text mt-2 w-full rounded border border-white/10 px-3 py-2 text-sm"
        />
        <p className="t-text-muted mt-1 text-xs">
          The address players copy to join. You can change it later.
        </p>
      </div>

      <div>
        <label htmlFor="slug" className="font-pixel t-text block text-[10px]">
          Site URL
        </label>
        <div className="mt-2 flex items-center gap-1">
          <span className="t-text-muted text-sm">/s/</span>
          <input
            id="slug"
            name="slug"
            required
            maxLength={32}
            value={slug}
            placeholder="skyfall"
            className="t-surface t-text w-full rounded border border-white/10 px-3 py-2 text-sm"
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value.toLowerCase());
            }}
          />
        </div>
        <p className="t-text-muted mt-1 text-xs">
          Lowercase letters, numbers, and hyphens. This one you can&apos;t change later.
        </p>
      </div>

      {state?.error && (
        <p className="text-redstone text-xs" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mc-pill cursor-pointer px-6 py-3 font-pixel text-xs disabled:opacity-50"
      >
        {pending ? 'Creating…' : 'Create site'}
      </button>
      <p className="t-text-muted text-xs">
        By creating a site, you agree to the{' '}
        <Link href="/legal/terms" target="_blank" className="underline hover:text-gold">
          Terms of Service &amp; Acceptable Use Policy
        </Link>.
      </p>
    </form>
  );
}
