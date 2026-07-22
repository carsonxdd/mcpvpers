import { eq, count } from "drizzle-orm";
import { db } from "@/db/client";
import { memberships } from "@/db/schema";
import { PLANS } from "@/lib/billing/plans";

// v1 is free-only, so a user's site cap is the free plan's maxSites. When paid
// tiers arrive this becomes "highest plan across the user's tenants" (or a
// per-user plan) — keep every caller going through this function so that's a
// one-place change.
export async function sitesRemaining(userId: string): Promise<number | null> {
  const cap = PLANS.free.entitlements.maxSites;
  if (cap === null) return null;
  const [row] = await db
    .select({ n: count() })
    .from(memberships)
    .where(eq(memberships.userId, userId));
  return Math.max(0, cap - (row?.n ?? 0));
}
