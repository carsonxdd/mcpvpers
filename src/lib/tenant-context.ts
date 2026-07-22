import { cache } from "react";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { tenants } from "@/db/schema";

export type Tenant = typeof tenants.$inferSelect;

// cache() dedupes the lookup across layout + page + generateMetadata in one request.
export const getTenantBySlug = cache(async (slug: string): Promise<Tenant | null> => {
  const row = await db.query.tenants.findFirst({
    where: eq(tenants.slug, slug.toLowerCase()),
  });
  return row ?? null;
});

export async function requireTenant(slug: string): Promise<Tenant> {
  const tenant = await getTenantBySlug(slug);
  if (!tenant) notFound();
  return tenant;
}
