import type { Metadata } from 'next';
import { requireTenant, getTenantBySlug } from '@/lib/tenant-context';
import { hasModule } from '@/lib/billing/plans';
import TenantHeader from '@/components/tenant/TenantHeader';
import TenantFooter from '@/components/tenant/TenantFooter';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tenant = await getTenantBySlug(slug);
  if (!tenant) return {};
  return {
    title: `${tenant.name} | Minecraft Server`,
    description:
      tenant.config?.description ??
      tenant.config?.tagline ??
      `${tenant.name} — a Minecraft server. Join at ${tenant.serverIp}.`,
  };
}

export default async function TenantSiteLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}>) {
  const { slug } = await params;
  const tenant = await requireTenant(slug);
  const showLeaderboards = Boolean(tenant.pistatsUrl) && hasModule(tenant, 'liveStats');

  return (
    <div
      className="flex min-h-full flex-1 flex-col"
      // Re-tints every gold utility in the subtree; glow shadows keep the default hue.
      style={
        tenant.accentColor
          ? ({ '--color-gold': tenant.accentColor } as React.CSSProperties)
          : undefined
      }
    >
      <TenantHeader slug={tenant.slug} name={tenant.name} showLeaderboards={showLeaderboards} />
      <main className="relative z-20 flex-1 pt-14">{children}</main>
      <TenantFooter name={tenant.name} discordInvite={tenant.discordInvite} />
    </div>
  );
}
