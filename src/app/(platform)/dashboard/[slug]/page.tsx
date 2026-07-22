import Link from 'next/link';
import { count, eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { tenantNews, tenantRules } from '@/db/schema';
import { requireTenantRole } from '@/lib/auth/session';

export default async function SiteOverviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { tenant } = await requireTenantRole(slug, 'admin');

  const [[rules], [news]] = await Promise.all([
    db.select({ n: count() }).from(tenantRules).where(eq(tenantRules.tenantId, tenant.id)),
    db.select({ n: count() }).from(tenantNews).where(eq(tenantNews.tenantId, tenant.id)),
  ]);

  const checklist = [
    {
      done: Boolean(tenant.config?.description || tenant.config?.tagline),
      label: 'Describe your server',
      href: `/dashboard/${slug}/settings`,
      hint: 'Add a tagline and description in Settings.',
    },
    {
      done: (rules?.n ?? 0) > 0,
      label: 'Review your rules',
      href: `/dashboard/${slug}/rules`,
      hint: 'We seeded three starter rules — make them yours.',
    },
    {
      done: (news?.n ?? 0) > 0,
      label: 'Post your first news update',
      href: `/dashboard/${slug}/news`,
      hint: 'Even "we exist now" counts.',
    },
    {
      done: Boolean(tenant.pistatsUrl),
      label: 'Connect live stats',
      href: `/dashboard/${slug}/connection`,
      hint: 'Point the site at your PiStatsAPI endpoint for live status and leaderboards.',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="mc-panel p-6">
        <h2 className="font-pixel t-text text-xs">Setup checklist</h2>
        <ul className="mt-4 space-y-3">
          {checklist.map((item) => (
            <li key={item.label} className="flex items-start gap-3">
              <span className={item.done ? 'text-xp' : 't-text-muted'} aria-hidden>
                {item.done ? '✔' : '□'}
              </span>
              <div>
                <Link href={item.href} className="t-text text-sm hover:text-gold">
                  {item.label}
                </Link>
                {!item.done && <p className="t-text-muted text-xs">{item.hint}</p>}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mc-panel p-6">
        <h2 className="font-pixel t-text text-xs">At a glance</h2>
        <p className="t-text-dim mt-3 text-sm">
          {rules?.n ?? 0} rules · {news?.n ?? 0} news posts · live stats{' '}
          {tenant.pistatsUrl ? 'connected' : 'not connected'}
        </p>
      </div>
    </div>
  );
}
