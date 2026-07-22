// Pure, client-safe plan registry (EMS pattern). Defines what each tier gets;
// enforcement reads entitlements only through getEntitlements() so negotiated
// per-tenant deals are a data change (entitlementOverrides), never a code change.
// Keep PLAN_IDS in sync with the `plan` pgEnum in src/db/schema/tenant.ts.

export const PLAN_IDS = ["free", "pro"] as const;
export type PlanId = (typeof PLAN_IDS)[number];

// Modules a tenant site can have switched on. `liveStats` gates the PiStatsAPI
// connection + live status/leaderboards. `customDomain` and `gallery` are
// registry slots for future paid features — nothing enforces them yet.
export const GATED_MODULES = ["liveStats", "customDomain", "gallery"] as const;
export type GatedModule = (typeof GATED_MODULES)[number];

export type Entitlements = {
  // How many sites one user may own. null = unlimited.
  maxSites: number | null;
  modules: GatedModule[];
};

// Per-tenant patch over the plan defaults, stored in tenants.entitlementOverrides.
export type EntitlementOverrides = Partial<Entitlements>;

export type Plan = {
  id: PlanId;
  name: string;
  price: string;
  blurb: string;
  entitlements: Entitlements;
};

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Free",
    price: "Free",
    blurb: "Everything a small server needs: a branded site, rules, news, and live stats.",
    entitlements: {
      maxSites: 2,
      modules: ["liveStats"],
    },
  },
  // Not purchasable in v1 — exists so paid tiers are a data change later.
  pro: {
    id: "pro",
    name: "Pro",
    price: "TBD",
    blurb: "For networks: more sites, custom domains, and galleries.",
    entitlements: {
      maxSites: 10,
      modules: ["liveStats", "customDomain", "gallery"],
    },
  },
};

type TenantLike = {
  plan: PlanId;
  entitlementOverrides?: EntitlementOverrides | null;
};

// Plan defaults merged field-by-field with the tenant's overrides.
export function getEntitlements(tenant: TenantLike): Entitlements {
  const base = PLANS[tenant.plan].entitlements;
  const overrides = tenant.entitlementOverrides ?? {};
  return {
    maxSites: overrides.maxSites !== undefined ? overrides.maxSites : base.maxSites,
    modules: overrides.modules !== undefined ? overrides.modules : base.modules,
  };
}

export function hasModule(tenant: TenantLike, module: GatedModule): boolean {
  return getEntitlements(tenant).modules.includes(module);
}
