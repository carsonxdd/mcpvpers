import type { Metadata } from 'next';
import Link from 'next/link';
import { requireUser, getOwnedTenants } from '@/lib/auth/session';
import { sitesRemaining } from '@/lib/billing/entitlements';

export const metadata: Metadata = {
  title: 'Dashboard | Server Sites',
};

export default async function DashboardPage() {
  const user = await requireUser();
  const [sites, remaining] = await Promise.all([
    getOwnedTenants(user.id),
    sitesRemaining(user.id),
  ]);
  const canCreate = remaining === null || remaining > 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-pixel text-lg text-gold glow-gold">Your sites</h1>

      <div className="mt-8 space-y-4">
        {sites.map(({ tenant, role }) => (
          <div key={tenant.id} className="mc-panel flex items-center justify-between gap-4 p-6">
            <div className="min-w-0">
              <h2 className="font-pixel t-text text-xs truncate">{tenant.name}</h2>
              <p className="t-text-muted mt-2 text-xs">
                /s/{tenant.slug} · {tenant.plan} plan · {role}
              </p>
            </div>
            <div className="flex shrink-0 gap-3">
              <Link href={`/s/${tenant.slug}`} className="mc-pill px-4 py-2 font-pixel text-[10px]">
                View site
              </Link>
              <Link
                href={`/dashboard/${tenant.slug}`}
                className="mc-pill px-4 py-2 font-pixel text-[10px]"
              >
                Manage
              </Link>
            </div>
          </div>
        ))}

        {sites.length === 0 && (
          <div className="mc-panel p-8 text-center">
            <p className="t-text-dim text-sm">
              No sites yet. Create one and your server gets a home on the web.
            </p>
          </div>
        )}
      </div>

      <div className="mt-8">
        {canCreate ? (
          <Link href="/dashboard/new" className="mc-pill inline-block px-6 py-3 font-pixel text-xs">
            + Create a site
          </Link>
        ) : (
          <p className="t-text-muted text-xs">
            You&apos;ve reached the free plan&apos;s site limit ({sites.length} of {sites.length}).
          </p>
        )}
      </div>
    </div>
  );
}
