"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { tenantNews } from "@/db/schema";
import { requireTenantRole } from "@/lib/auth/session";
import { normalizeSlug } from "@/lib/reserved-slugs";
import type { ActionState } from "@/lib/actions/tenant";

const postSchema = z.object({
  title: z.string().trim().min(1).max(120),
  body: z.string().trim().min(1).max(8000),
  tags: z
    .string()
    .trim()
    .max(200)
    .transform((v) =>
      v
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 6),
    ),
});

function revalidateNews(slug: string) {
  revalidatePath(`/s/${slug}/news`);
  revalidatePath(`/s/${slug}`);
  revalidatePath(`/dashboard/${slug}/news`);
}

export async function createNewsPost(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const slug = normalizeSlug(String(formData.get("slug") ?? ""));
  const { tenant } = await requireTenantRole(slug, "admin");

  const parsed = postSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
    tags: formData.get("tags") ?? "",
  });
  if (!parsed.success) return { error: "Title (≤120 chars) and body (≤8000 chars) are required." };

  await db.insert(tenantNews).values({ tenantId: tenant.id, ...parsed.data });
  revalidateNews(slug);
  return null;
}

export async function updateNewsPost(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const slug = normalizeSlug(String(formData.get("slug") ?? ""));
  const { tenant } = await requireTenantRole(slug, "admin");
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) return { error: "Invalid post." };

  const parsed = postSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
    tags: formData.get("tags") ?? "",
  });
  if (!parsed.success) return { error: "Title (≤120 chars) and body (≤8000 chars) are required." };

  await db
    .update(tenantNews)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(and(eq(tenantNews.id, id.data), eq(tenantNews.tenantId, tenant.id)));
  revalidateNews(slug);
  return null;
}

export async function deleteNewsPost(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const slug = normalizeSlug(String(formData.get("slug") ?? ""));
  const { tenant } = await requireTenantRole(slug, "admin");
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) return { error: "Invalid post." };

  await db
    .delete(tenantNews)
    .where(and(eq(tenantNews.id, id.data), eq(tenantNews.tenantId, tenant.id)));
  revalidateNews(slug);
  return null;
}
