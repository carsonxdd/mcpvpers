import type { Metadata } from 'next';
import { requireUser } from '@/lib/auth/session';
import { sitesRemaining } from '@/lib/billing/entitlements';
import CreateSiteForm from './CreateSiteForm';

export const metadata: Metadata = {
  title: 'Create a site | Server Sites',
};

export default async function NewSitePage() {
  const user = await requireUser();
  const remaining = await sitesRemaining(user.id);

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <h1 className="font-pixel text-lg text-gold glow-gold">Create a site</h1>
      <div className="mc-panel mt-8 p-6">
        {remaining !== null && remaining <= 0 ? (
          <p className="t-text-dim text-sm">
            You&apos;ve reached the free plan&apos;s site limit.
          </p>
        ) : (
          <CreateSiteForm />
        )}
      </div>
    </div>
  );
}
