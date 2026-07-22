"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { tenants, memberships, tenantRules } from "@/db/schema";
import { requireUser, requireTenantRole } from "@/lib/auth/session";
import { sitesRemaining } from "@/lib/billing/entitlements";
import { normalizeSlug, slugError } from "@/lib/reserved-slugs";
import type { TenantConfig } from "@/lib/tenant-config";

export type ActionState = { error: string } | null;

const nameSchema = z.string().trim().min(2).max(60);
const serverIpSchema = z
  .string()
  .trim()
  .min(3)
  .max(253)
  .regex(/^[a-zA-Z0-9.:-]+$/, "Server address can only contain letters, numbers, dots, colons, and hyphens.");

const STARTER_RULES = [
  {
    title: "Be respectful",
    body: "No harassment, slurs, or targeted grief. Disagreements happen — keep them in-game.",
  },
  {
    title: "No cheating",
    body: "No hacked clients, x-ray, or exploit abuse. Cosmetic and performance mods are fine.",
  },
  {
    title: "Respect builds",
    body: "Don't touch other players' builds or chests without permission.",
  },
];

export async function createTenant(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const name = nameSchema.safeParse(formData.get("name"));
  if (!name.success) return { error: "Name must be 2–60 characters." };
  const serverIp = serverIpSchema.safeParse(formData.get("serverIp"));
  if (!serverIp.success) return { error: "Enter a valid server address (e.g. mc.example.net)." };

  const slug = normalizeSlug(String(formData.get("slug") ?? ""));
  const slugProblem = slugError(slug);
  if (slugProblem) return { error: slugProblem };

  const remaining = await sitesRemaining(user.id);
  if (remaining !== null && remaining <= 0) {
    return { error: "You've reached the free plan's site limit." };
  }

  const existing = await db.query.tenants.findFirst({ where: eq(tenants.slug, slug) });
  if (existing) return { error: "That slug is taken. Pick another." };

  await db.transaction(async (tx) => {
    const [tenant] = await tx
      .insert(tenants)
      .values({ slug, name: name.data, serverIp: serverIp.data })
      .returning({ id: tenants.id });
    await tx.insert(memberships).values({
      userId: user.id,
      tenantId: tenant.id,
      role: "owner",
    });
    await tx.insert(tenantRules).values(
      STARTER_RULES.map((r, i) => ({ tenantId: tenant.id, position: i, ...r })),
    );
  });

  redirect(`/dashboard/${slug}`);
}

const settingsSchema = z.object({
  name: nameSchema,
  serverIp: serverIpSchema,
  bedrockPort: z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : Number(v)))
    .pipe(z.number().int().min(1).max(65535).nullable()),
  discordInvite: z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : v))
    .pipe(z.url().startsWith("https://").max(200).nullable()),
  accentColor: z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : v))
    .pipe(z.string().regex(/^#[0-9a-fA-F]{6}$/).nullable()),
  mapUrl: z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : v))
    .pipe(z.url().max(300).nullable()),
  launchAt: z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : new Date(v)))
    .pipe(z.date().nullable()),
  tagline: z.string().trim().max(120),
  description: z.string().trim().max(1000),
  serverVersion: z.string().trim().max(40),
  gameplayTags: z.string().trim().max(300),
  staff: z.string().trim().max(2000),
});

export async function updateTenantSettings(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const slug = normalizeSlug(String(formData.get("slug") ?? ""));
  const { tenant } = await requireTenantRole(slug, "admin");

  const parsed = settingsSchema.safeParse({
    name: formData.get("name"),
    serverIp: formData.get("serverIp"),
    bedrockPort: formData.get("bedrockPort") ?? "",
    discordInvite: formData.get("discordInvite") ?? "",
    accentColor: formData.get("accentColor") ?? "",
    mapUrl: formData.get("mapUrl") ?? "",
    launchAt: formData.get("launchAt") ?? "",
    tagline: formData.get("tagline") ?? "",
    description: formData.get("description") ?? "",
    serverVersion: formData.get("serverVersion") ?? "",
    gameplayTags: formData.get("gameplayTags") ?? "",
    staff: formData.get("staff") ?? "",
  });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { error: `${issue.path.join(".")}: ${issue.message}` };
  }
  const d = parsed.data;

  // Staff rows come in as one "Name - Role" pair per line.
  const staff = d.staff
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, ...roleParts] = line.split(/\s*[-|]\s*/);
      return { name: name.trim(), role: roleParts.join(" - ").trim() || "Staff" };
    })
    .filter((s) => s.name);

  const config: TenantConfig = {
    tagline: d.tagline || undefined,
    description: d.description || undefined,
    serverVersion: d.serverVersion || undefined,
    gameplayTags: d.gameplayTags
      ? d.gameplayTags.split(",").map((t) => t.trim()).filter(Boolean)
      : undefined,
    staff: staff.length ? staff : undefined,
  };

  await db
    .update(tenants)
    .set({
      name: d.name,
      serverIp: d.serverIp,
      bedrockPort: d.bedrockPort,
      discordInvite: d.discordInvite,
      accentColor: d.accentColor,
      mapUrl: d.mapUrl,
      launchAt: d.launchAt,
      config,
      updatedAt: new Date(),
    })
    .where(eq(tenants.id, tenant.id));

  revalidatePath(`/s/${slug}`, "layout");
  revalidatePath(`/dashboard/${slug}`, "layout");
  return null;
}
