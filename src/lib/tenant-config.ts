// Display-only tenant fields, stored in tenants.config (jsonb) and rendered
// verbatim. Adding a field here is a form + render change, never a migration.
// Anything the server validates, gates on, or queries belongs as a real column
// on the tenants table instead.

export type TenantStaffMember = {
  name: string;
  role: string;
};

export type TenantConfig = {
  tagline?: string;
  description?: string;
  serverVersion?: string;
  gameplayTags?: string[];
  staff?: TenantStaffMember[];
};
