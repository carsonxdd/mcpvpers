"use server";

import { revalidatePath } from "next/cache";
import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { tenantRules } from "@/db/schema";
import { requireTenantRole } from "@/lib/auth/session";
import { normalizeSlug } from "@/lib/reserved-slugs";
import type { ActionState } from "@/lib/actions/tenant";

const ruleSchema = z.object({
  title: z.string().trim().min(1).max(100),
  body: z.string().trim().min(1).max(2000),
});

function revalidateRules(slug: string) {
  revalidatePath(`/s/${slug}/rules`);
  revalidatePath(`/dashboard/${slug}/rules`);
}

export async function createRule(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const slug = normalizeSlug(String(formData.get("slug") ?? ""));
  const { tenant } = await requireTenantRole(slug, "admin");

  const parsed = ruleSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
  });
  if (!parsed.success) return { error: "Title (≤100 chars) and body (≤2000 chars) are required." };

  const existing = await db
    .select({ position: tenantRules.position })
    .from(tenantRules)
    .where(eq(tenantRules.tenantId, tenant.id));
  const nextPosition = existing.length ? Math.max(...existing.map((r) => r.position)) + 1 : 0;

  await db.insert(tenantRules).values({
    tenantId: tenant.id,
    position: nextPosition,
    ...parsed.data,
  });
  revalidateRules(slug);
  return null;
}

export async function updateRule(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const slug = normalizeSlug(String(formData.get("slug") ?? ""));
  const { tenant } = await requireTenantRole(slug, "admin");
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) return { error: "Invalid rule." };

  const parsed = ruleSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
  });
  if (!parsed.success) return { error: "Title (≤100 chars) and body (≤2000 chars) are required." };

  await db
    .update(tenantRules)
    .set(parsed.data)
    .where(and(eq(tenantRules.id, id.data), eq(tenantRules.tenantId, tenant.id)));
  revalidateRules(slug);
  return null;
}

export async function deleteRule(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const slug = normalizeSlug(String(formData.get("slug") ?? ""));
  const { tenant } = await requireTenantRole(slug, "admin");
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) return { error: "Invalid rule." };

  await db
    .delete(tenantRules)
    .where(and(eq(tenantRules.id, id.data), eq(tenantRules.tenantId, tenant.id)));
  revalidateRules(slug);
  return null;
}

// Swap positions with the neighbor above/below.
export async function moveRule(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const slug = normalizeSlug(String(formData.get("slug") ?? ""));
  const { tenant } = await requireTenantRole(slug, "admin");
  const id = z.uuid().safeParse(formData.get("id"));
  const direction = formData.get("direction");
  if (!id.success || (direction !== "up" && direction !== "down")) return { error: "Invalid move." };

  const rules = await db
    .select({ id: tenantRules.id, position: tenantRules.position })
    .from(tenantRules)
    .where(eq(tenantRules.tenantId, tenant.id))
    .orderBy(asc(tenantRules.position));

  const index = rules.findIndex((r) => r.id === id.data);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapWith < 0 || swapWith >= rules.length) return null;

  const a = rules[index];
  const b = rules[swapWith];
  await db.transaction(async (tx) => {
    await tx.update(tenantRules).set({ position: b.position }).where(eq(tenantRules.id, a.id));
    await tx.update(tenantRules).set({ position: a.position }).where(eq(tenantRules.id, b.id));
  });
  revalidateRules(slug);
  return null;
}
