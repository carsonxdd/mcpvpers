import {
  pgTable,
  text,
  timestamp,
  uuid,
  pgEnum,
  jsonb,
  integer,
  uniqueIndex,
  index,
  primaryKey,
} from "drizzle-orm/pg-core";
import { users } from "./auth";
import type { EntitlementOverrides } from "@/lib/billing/plans";
import type { TenantConfig } from "@/lib/tenant-config";

// Subscription tier. Drives entitlements (site limit, gated modules) via
// src/lib/billing/plans.ts — keep values in sync with PLAN_IDS there.
// v1 is free-only; "pro" exists so paid tiers are a data change later.
export const planEnum = pgEnum("plan", ["free", "pro"]);

// Membership roles. "owner" is the creator; "admin" can manage content/settings.
export const membershipRoleEnum = pgEnum("membership_role", ["owner", "admin"]);

// One tenant = one Minecraft server's site, served at /s/{slug}.
// Column-vs-jsonb rule: anything validated, gated, or queried is a column;
// free-form display fields live in `config` (see src/lib/tenant-config.ts).
export const tenants = pgTable(
  "tenants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    // URL-safe slug for /s/{slug}. Globally unique; reserved list checked at creation.
    slug: text("slug").notNull(),
    // Display name, e.g. "mc.example.net" or "Skyfall SMP".
    name: text("name").notNull(),
    plan: planEnum("plan").notNull().default("free"),
    // Per-tenant patch over the plan's default entitlements (negotiated deals
    // are data, not code). Null = plan defaults verbatim.
    entitlementOverrides: jsonb("entitlement_overrides").$type<EntitlementOverrides>(),
    // The copy-to-clipboard join address shown on the tenant home page.
    serverIp: text("server_ip").notNull(),
    // Null = no Bedrock crossplay advertised.
    bedrockPort: integer("bedrock_port"),
    // Full https://discord.gg/... invite URL.
    discordInvite: text("discord_invite"),
    // "#rrggbb" accent override scoped to the tenant's pages. Null = default gold.
    accentColor: text("accent_color"),
    // The tenant's own PiStatsAPI endpoint, SSRF-validated at save time
    // (src/lib/pistats-url.ts). Null = static site, no live status/leaderboards.
    pistatsUrl: text("pistats_url"),
    // Future /s/{slug}/map embed; collected now, unused in v1.
    mapUrl: text("map_url"),
    // Future launch instant for a countdown hero. Null = launched / no countdown.
    launchAt: timestamp("launch_at", { withTimezone: true }),
    config: jsonb("config").$type<TenantConfig>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("tenants_slug_idx").on(t.slug)],
);

// User ↔ tenant join with role. A user can own multiple sites (up to the
// plan's maxSites entitlement).
export const memberships = pgTable(
  "memberships",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    role: membershipRoleEnum("role").notNull().default("owner"),
    joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.tenantId] }),
    index("memberships_tenant_idx").on(t.tenantId),
  ],
);
