import { desc, eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { tenantNews } from '@/db/schema';
import { requireTenantRole } from '@/lib/auth/session';
import NewsEditor, { type NewsItem } from './NewsEditor';

export default async function NewsAdminPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { tenant } = await requireTenantRole(slug, 'admin');
  const rows = await db
    .select()
    .from(tenantNews)
    .where(eq(tenantNews.tenantId, tenant.id))
    .orderBy(desc(tenantNews.publishedAt));

  const posts: NewsItem[] = rows.map((r) => ({
    id: r.id,
    title: r.title,
    body: r.body,
    tags: r.tags,
    publishedAt: r.publishedAt.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
  }));

  return <NewsEditor slug={tenant.slug} posts={posts} />;
}
