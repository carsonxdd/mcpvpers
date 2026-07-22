import { asc, eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { tenantRules } from '@/db/schema';
import { requireTenantRole } from '@/lib/auth/session';
import RulesEditor from './RulesEditor';

export default async function RulesAdminPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { tenant } = await requireTenantRole(slug, 'admin');
  const rules = await db
    .select({ id: tenantRules.id, title: tenantRules.title, body: tenantRules.body })
    .from(tenantRules)
    .where(eq(tenantRules.tenantId, tenant.id))
    .orderBy(asc(tenantRules.position));

  return <RulesEditor slug={tenant.slug} rules={rules} />;
}
