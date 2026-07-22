import Link from 'next/link';
import { requireTenantRole } from '@/lib/auth/session';

const TABS = [
  { href: '', label: 'Overview' },
  { href: '/settings', label: 'Settings' },
  { href: '/rules', label: 'Rules' },
  { href: '/news', label: 'News' },
  { href: '/connection', label: 'Connection' },
];

export default async function ManageSiteLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}>) {
  const { slug } = await params;
  const { tenant } = await requireTenantRole(slug, 'admin');

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="font-pixel text-lg text-gold glow-gold">{tenant.name}</h1>
        <Link href={`/s/${slug}`} className="font-pixel text-[10px] t-text-muted hover:text-gold">
          View public site →
        </Link>
      </div>
      <nav className="mt-6 flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={`/dashboard/${slug}${tab.href}`}
            className="mc-pill px-4 py-2 font-pixel text-[10px]"
          >
            {tab.label}
          </Link>
        ))}
      </nav>
      <div className="mt-8">{children}</div>
    </div>
  );
}
