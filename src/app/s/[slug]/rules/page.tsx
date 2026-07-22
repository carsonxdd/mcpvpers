import { asc, eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { tenantRules } from '@/db/schema';
import { requireTenant } from '@/lib/tenant-context';
import CloudTitle from '@/components/CloudTitle';

export default async function TenantRulesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tenant = await requireTenant(slug);
  const rules = await db
    .select()
    .from(tenantRules)
    .where(eq(tenantRules.tenantId, tenant.id))
    .orderBy(asc(tenantRules.position));

  return (
    <div>
      <section className="mx-auto max-w-3xl px-4 py-16">
        <div className="text-center">
          <CloudTitle>
            <h1 className="font-pixel text-gold glow-gold mb-8 text-2xl sm:text-3xl">Rules</h1>
          </CloudTitle>
        </div>

        <div className="space-y-5">
          {rules.map((rule) => (
            <article key={rule.id} className="mc-panel p-6">
              <h2 className="font-pixel t-text text-xs">{rule.title}</h2>
              <div className="t-text-dim mt-3 space-y-2 text-sm leading-relaxed">
                {rule.body.split(/\n\n+/).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </article>
          ))}
        </div>

        {rules.length === 0 && (
          <p className="t-text-muted py-12 text-center font-pixel text-xs">
            No rules posted yet.
          </p>
        )}
      </section>
    </div>
  );
}
