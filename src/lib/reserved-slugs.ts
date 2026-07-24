// Slug rules for tenant sites at /s/{slug}. Tenants live under /s/, so slugs
// can never collide with top-level routes — the reserved list is brand/abuse
// protection, not routing safety.

export const SLUG_REGEX = /^[a-z0-9](?:[a-z0-9-]{1,30}[a-z0-9])?$/;

const RESERVED = new Set([
  "admin",
  "api",
  "app",
  "auth",
  "dashboard",
  "docs",
  "get-started",
  "help",
  "legal",
  "login",
  "logout",
  "mc-pvpers",
  "official",
  "privacy",
  "pvpers",
  "s",
  "settings",
  "staff",
  "support",
  "terms",
  "www",
]);

export function normalizeSlug(raw: string): string {
  return raw.trim().toLowerCase();
}

// Best-effort suggestion from a display name (used by the create form).
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
}

export function slugError(slug: string): string | null {
  if (!SLUG_REGEX.test(slug)) {
    return "Slugs are 2–32 characters: lowercase letters, numbers, and hyphens (not at the ends).";
  }
  if (RESERVED.has(slug)) {
    return "That slug is reserved. Pick another.";
  }
  return null;
}
