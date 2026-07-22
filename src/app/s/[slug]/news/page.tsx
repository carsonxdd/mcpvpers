import { desc, eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { tenantNews } from '@/db/schema';
import { requireTenant } from '@/lib/tenant-context';
import CloudTitle from '@/components/CloudTitle';

export default async function TenantNewsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tenant = await requireTenant(slug);
  const posts = await db
    .select()
    .from(tenantNews)
    .where(eq(tenantNews.tenantId, tenant.id))
    .orderBy(desc(tenantNews.publishedAt));

  return (
    <div>
      <section className="mx-auto max-w-3xl px-4 py-16">
        <div className="text-center">
          <CloudTitle>
            <h1 className="font-pixel text-gold glow-gold mb-8 text-2xl sm:text-3xl">News</h1>
          </CloudTitle>
        </div>

        <div className="space-y-5">
          {posts.map((entry) => (
            <article key={entry.id} className="mc-panel p-6">
              <div className="mb-3 flex items-start justify-between gap-4">
                <h2 className="font-pixel t-text text-xs">{entry.title}</h2>
                <time className="t-text-muted shrink-0 font-pixel text-xs">
                  {entry.publishedAt.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </time>
              </div>

              <div className="t-text-dim mb-3 space-y-2 text-sm leading-relaxed">
                {entry.body.split(/\n\n+/).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>

              {entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {entry.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 text-[10px] font-pixel rounded bg-gold/10 text-gold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>

        {posts.length === 0 && (
          <p className="t-text-muted py-12 text-center font-pixel text-xs">
            No news yet. Check back soon!
          </p>
        )}
      </section>
    </div>
  );
}
