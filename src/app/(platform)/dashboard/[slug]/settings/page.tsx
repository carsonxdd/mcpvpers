import { requireTenantRole } from '@/lib/auth/session';
import SettingsForm, { type SettingsFormValues } from './SettingsForm';

// datetime-local wants "YYYY-MM-DDTHH:mm" in local time.
function toLocalInputValue(d: Date | null): string {
  if (!d) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default async function SiteSettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { tenant } = await requireTenantRole(slug, 'admin');
  const config = tenant.config ?? {};

  const initial: SettingsFormValues = {
    slug: tenant.slug,
    name: tenant.name,
    serverIp: tenant.serverIp,
    bedrockPort: tenant.bedrockPort?.toString() ?? '',
    discordInvite: tenant.discordInvite ?? '',
    accentColor: tenant.accentColor ?? '',
    mapUrl: tenant.mapUrl ?? '',
    launchAt: toLocalInputValue(tenant.launchAt),
    tagline: config.tagline ?? '',
    description: config.description ?? '',
    serverVersion: config.serverVersion ?? '',
    gameplayTags: (config.gameplayTags ?? []).join(', '),
    staff: (config.staff ?? []).map((s) => `${s.name} - ${s.role}`).join('\n'),
  };

  return (
    <div className="mc-panel p-6">
      <SettingsForm initial={initial} />
    </div>
  );
}
