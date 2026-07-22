// Rank-based role comparison (EMS pattern). Higher rank = more authority.
export type MembershipRole = "owner" | "admin";

const ROLE_RANK: Record<MembershipRole, number> = {
  admin: 0,
  owner: 1,
};

export function hasRole(role: MembershipRole, minRole: MembershipRole): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[minRole];
}
