import { cache } from "react";
import { redirect, notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { memberships, tenants } from "@/db/schema";
import { auth } from "@/lib/auth";
import { hasRole, type MembershipRole } from "@/lib/auth/roles";

export type SessionUser = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
};

// cache() dedupes across layout + page + generateMetadata within one request.
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const session = await auth();
  if (!session?.user?.id) return null;
  return {
    id: session.user.id,
    name: session.user.name ?? null,
    email: session.user.email ?? null,
    image: session.user.image ?? null,
  };
});

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export type TenantMembership = {
  user: SessionUser;
  tenant: typeof tenants.$inferSelect;
  role: MembershipRole;
};

// The current user's membership in the tenant named by the URL slug.
export const getMembership = cache(
  async (slug: string): Promise<TenantMembership | null> => {
    const user = await getSessionUser();
    if (!user) return null;
    const rows = await db
      .select({ tenant: tenants, role: memberships.role })
      .from(memberships)
      .innerJoin(tenants, eq(memberships.tenantId, tenants.id))
      .where(and(eq(memberships.userId, user.id), eq(tenants.slug, slug.toLowerCase())))
      .limit(1);
    const row = rows[0];
    if (!row) return null;
    return { user, tenant: row.tenant, role: row.role };
  },
);

// Guard for dashboard pages/actions. Unknown slug and no-membership both 404
// so the response never leaks which slugs exist.
export async function requireTenantRole(
  slug: string,
  minRole: MembershipRole = "admin",
): Promise<TenantMembership> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const membership = await getMembership(slug);
  if (!membership || !hasRole(membership.role, minRole)) notFound();
  return membership;
}

export async function getOwnedTenants(userId: string) {
  return db
    .select({ tenant: tenants, role: memberships.role })
    .from(memberships)
    .innerJoin(tenants, eq(memberships.tenantId, tenants.id))
    .where(eq(memberships.userId, userId))
    .orderBy(tenants.createdAt);
}
