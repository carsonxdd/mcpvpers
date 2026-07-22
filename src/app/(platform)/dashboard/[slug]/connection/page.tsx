import Link from 'next/link';
import { requireTenantRole } from '@/lib/auth/session';
import ConnectionForm from './ConnectionForm';

export default async function ConnectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { tenant } = await requireTenantRole(slug, 'admin');

  return (
    <div className="space-y-4">
      <div className="mc-panel p-6">
        <h2 className="font-pixel t-text text-xs">Live stats connection</h2>
        <p className="t-text-dim mt-3 text-sm">
          Connect your server&apos;s PiStatsAPI endpoint and your site gets a live
          player counter and leaderboards. Without it, your site stays fully
          static — no live features, no errors.
        </p>
        <div className="mt-6">
          <ConnectionForm slug={tenant.slug} initialUrl={tenant.pistatsUrl ?? ''} />
        </div>
      </div>

      <div className="mc-panel p-6">
        <h2 className="font-pixel t-text text-xs">How to set it up</h2>
        <ol className="t-text-dim mt-3 list-decimal space-y-2 pl-5 text-sm">
          <li>Install the PiStatsAPI plugin on your Paper/Spigot server.</li>
          <li>
            Pick a port in the plugin config and open it in your host&apos;s panel or
            firewall (game hosts usually let you allocate an extra port).
          </li>
          <li>
            Your URL is <code className="t-surface rounded px-1">http://&lt;your-server-host&gt;:&lt;port&gt;</code> —
            plain http is fine, the site proxies it securely.
          </li>
          <li>Paste it above, save, and hit Test connection.</li>
        </ol>
        <p className="t-text-muted mt-4 text-xs">
          Full walkthrough with troubleshooting:{' '}
          <Link href="/get-started/pistats" className="hover:text-gold underline">
            PiStatsAPI setup guide
          </Link>
        </p>
      </div>
    </div>
  );
}
