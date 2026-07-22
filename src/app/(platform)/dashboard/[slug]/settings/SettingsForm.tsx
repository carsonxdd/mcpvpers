'use client';

import { useActionState } from 'react';
import { updateTenantSettings, type ActionState } from '@/lib/actions/tenant';

export type SettingsFormValues = {
  slug: string;
  name: string;
  serverIp: string;
  bedrockPort: string;
  discordInvite: string;
  accentColor: string;
  mapUrl: string;
  launchAt: string;
  tagline: string;
  description: string;
  serverVersion: string;
  gameplayTags: string;
  staff: string;
};

const inputClass =
  't-surface t-text mt-2 w-full rounded border border-white/10 px-3 py-2 text-sm';

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="font-pixel t-text block text-[10px]">
        {label}
        {children}
      </label>
      {hint && <p className="t-text-muted mt-1 text-xs">{hint}</p>}
    </div>
  );
}

export default function SettingsForm({ initial }: { initial: SettingsFormValues }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    updateTenantSettings,
    null,
  );

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="slug" value={initial.slug} />

      <Field label="Server name">
        <input name="name" required maxLength={60} defaultValue={initial.name} className={inputClass} />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Server address">
          <input name="serverIp" required maxLength={253} defaultValue={initial.serverIp} className={inputClass} />
        </Field>
        <Field label="Bedrock port" hint="Leave empty if you don't support Bedrock crossplay.">
          <input name="bedrockPort" type="number" min={1} max={65535} defaultValue={initial.bedrockPort} className={inputClass} />
        </Field>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Discord invite" hint="Full https://discord.gg/… link.">
          <input name="discordInvite" type="url" maxLength={200} defaultValue={initial.discordInvite} className={inputClass} />
        </Field>
        <Field label="Accent color" hint="Hex like #fbbf24. Empty = default gold.">
          <input name="accentColor" maxLength={7} placeholder="#fbbf24" defaultValue={initial.accentColor} className={inputClass} />
        </Field>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Map URL" hint="Your BlueMap/Dynmap address, if any (shown later).">
          <input name="mapUrl" type="url" maxLength={300} defaultValue={initial.mapUrl} className={inputClass} />
        </Field>
        <Field label="Launch date" hint="If set in the future, your site shows a countdown.">
          <input name="launchAt" type="datetime-local" defaultValue={initial.launchAt} className={inputClass} />
        </Field>
      </div>

      <Field label="Tagline" hint="One line under your server name.">
        <input name="tagline" maxLength={120} defaultValue={initial.tagline} className={inputClass} />
      </Field>

      <Field label="Description">
        <textarea name="description" maxLength={1000} rows={4} defaultValue={initial.description} className={inputClass} />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Version" hint='e.g. "Paper 26.1".'>
          <input name="serverVersion" maxLength={40} defaultValue={initial.serverVersion} className={inputClass} />
        </Field>
        <Field label="Gameplay tags" hint="Comma-separated: Survival, SMP, PvE…">
          <input name="gameplayTags" maxLength={300} defaultValue={initial.gameplayTags} className={inputClass} />
        </Field>
      </div>

      <Field label="Staff" hint="One per line: Name - Role.">
        <textarea name="staff" maxLength={2000} rows={4} placeholder={'carsonxd - Owner'} defaultValue={initial.staff} className={inputClass} />
      </Field>

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
        {pending ? 'Saving…' : 'Save settings'}
      </button>
    </form>
  );
}
