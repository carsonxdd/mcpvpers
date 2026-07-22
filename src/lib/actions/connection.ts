"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { tenants } from "@/db/schema";
import { requireTenantRole } from "@/lib/auth/session";
import { normalizeSlug } from "@/lib/reserved-slugs";
import { validatePistatsUrl, assertPublicHost } from "@/lib/pistats-url";

export type ConnectionState = { ok: boolean; message: string } | null;

function revalidateConnection(slug: string) {
  revalidatePath(`/s/${slug}`, "layout");
  revalidatePath(`/dashboard/${slug}`, "layout");
}

export async function saveConnection(
  _prev: ConnectionState,
  formData: FormData,
): Promise<ConnectionState> {
  const slug = normalizeSlug(String(formData.get("slug") ?? ""));
  const { tenant } = await requireTenantRole(slug, "admin");
  const raw = String(formData.get("pistatsUrl") ?? "").trim();

  if (raw === "") {
    await db
      .update(tenants)
      .set({ pistatsUrl: null, updatedAt: new Date() })
      .where(eq(tenants.id, tenant.id));
    revalidateConnection(slug);
    return { ok: true, message: "Live stats disconnected." };
  }

  const validated = validatePistatsUrl(raw);
  if (!validated.ok) return { ok: false, message: validated.error };

  try {
    await assertPublicHost(validated.url);
  } catch {
    return { ok: false, message: "That hostname resolves to a private address, which isn't allowed." };
  }

  await db
    .update(tenants)
    .set({ pistatsUrl: validated.url, updatedAt: new Date() })
    .where(eq(tenants.id, tenant.id));
  revalidateConnection(slug);
  return { ok: true, message: "Saved. Use Test connection to verify it responds." };
}

export async function testConnection(
  _prev: ConnectionState,
  formData: FormData,
): Promise<ConnectionState> {
  const slug = normalizeSlug(String(formData.get("slug") ?? ""));
  const { tenant } = await requireTenantRole(slug, "admin");
  if (!tenant.pistatsUrl) return { ok: false, message: "Save a PiStatsAPI URL first." };

  try {
    await assertPublicHost(tenant.pistatsUrl);
    const res = await fetch(`${tenant.pistatsUrl}/api/server`, {
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });
    if (!res.ok) return { ok: false, message: `Endpoint responded with HTTP ${res.status}.` };
    const json = (await res.json()) as { online?: number; max?: number };
    if (typeof json?.online !== "number") {
      return { ok: false, message: "Endpoint responded, but not with PiStatsAPI's /api/server shape." };
    }
    return { ok: true, message: `Connected! Server reports ${json.online}/${json.max ?? "?"} players online.` };
  } catch {
    return { ok: false, message: "Couldn't reach the endpoint (timeout or connection refused)." };
  }
}
