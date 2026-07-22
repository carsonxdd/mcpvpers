import { notFound } from 'next/navigation';
import { requireTenant } from '@/lib/tenant-context';
import { hasModule } from '@/lib/billing/plans';
import CloudTitle from '@/components/CloudTitle';
import TenantLeaderboard from '@/components/tenant/TenantLeaderboard';

export default async function TenantLeaderboardsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tenant = await requireTenant(slug);
  if (!tenant.pistatsUrl || !hasModule(tenant, 'liveStats')) notFound();

  return (
    <div>
      <section className="mx-auto max-w-3xl px-4 py-16">
        <div className="text-center">
          <CloudTitle>
            <h1 className="font-pixel text-gold glow-gold mb-8 text-2xl sm:text-3xl">
              Leaderboards
            </h1>
          </CloudTitle>
        </div>
        <TenantLeaderboard slug={tenant.slug} />
      </section>
    </div>
  );
}
