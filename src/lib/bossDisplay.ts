// Shared boss/loot display helpers, used by both the /events overview (client)
// and the /events/[slug] detail pages (server). Data is static (bosses.json).

import bossesData from '@/data/bosses.json';

export type LootDrop = {
  tier: 'pitforged' | 'epic' | 'rare' | 'common';
  name: string;
  item: string;
  enchants: string;
  lore?: string;
};

export type Boss = {
  id: string;
  name: string;
  mob: string;
  raid: string;
  kind: 'ladder' | 'duel';
  rank: number;
  ladderLabel: string;
  accent: string;
  icon: string;
  description: string;
  moves: { name: string; description: string }[];
  loot: LootDrop[];
};

// Sorted by rank: Tier 1–5, then the duel.
export const bosses = (bossesData as Boss[]).slice().sort((a, b) => a.rank - b.rank);

export function bossBySlug(slug: string): Boss | undefined {
  return bosses.find((b) => b.id === slug);
}

// PiEvents identifies a raid by a mob-based key (event_history.raid / live_event.raid:
// "zombie", "skeleton", …) rather than the boss id. Map it back to the boss so the
// raid log, run details and live banner can show the boss name + icon.
const RAID_KEY_TO_ID: Record<string, string> = {
  zombie: 'mortrax',
  skeleton: 'ossivar',
  spider: 'vexspinne',
  wither: 'vaelthorn',
  illager: 'maelgrave',
  champion: 'korrin',
};

export function bossByRaidKey(key: string | null | undefined): Boss | undefined {
  if (!key) return undefined;
  const lower = key.toLowerCase();
  return bossBySlug(RAID_KEY_TO_ID[lower] ?? lower);
}

// Ladder bosses read "Tier N"; the standalone duel reads "Duel".
export function tierLabel(boss: Boss): string {
  return boss.kind === 'duel' ? 'Duel' : `Tier ${boss.rank}`;
}

// Per-boss accent (Tailwind class tokens).
export const accentClass: Record<string, { text: string; border: string; chip: string }> = {
  fire: { text: 'text-redstone', border: 'border-redstone/50', chip: 'bg-redstone/15 text-redstone' },
  bone: { text: 'text-slate-300', border: 'border-slate-400/50', chip: 'bg-slate-400/15 text-slate-300' },
  venom: { text: 'text-violet-400', border: 'border-violet-400/50', chip: 'bg-violet-400/15 text-violet-300' },
  arcane: { text: 'text-fuchsia-400', border: 'border-fuchsia-400/50', chip: 'bg-fuchsia-400/15 text-fuchsia-300' },
  nature: { text: 'text-xp', border: 'border-xp/50', chip: 'bg-xp/15 text-xp' },
  gold: { text: 'text-gold', border: 'border-gold/50', chip: 'bg-gold/15 text-gold' },
};
export const accentFor = (a: string) => accentClass[a] ?? accentClass.gold;

// Loot tier → badge label + official in-game rarity color (§-codes). Pitforged
// (&d pink) is the top tier, sitting above epic/rare/common — it's the Pit 1+ epic
// pool with above-vanilla-cap gear. (There is no legendary tier; it was cut in
// config before shipping — do not re-add legendary badges/tables anywhere.)
export const lootTier: Record<string, { badge: string; color: string }> = {
  pitforged: { badge: 'PITFORGED', color: '#FF55FF' },
  epic: { badge: 'EPIC', color: '#AA00AA' },
  rare: { badge: 'RARE', color: '#5555FF' },
  common: { badge: 'COMMON', color: '#55FF55' },
};

// Colored chip: tier color text on a faint same-color wash.
export function tierChip(color: string) {
  return { color, backgroundColor: `color-mix(in srgb, ${color} 16%, transparent)` };
}

// Every boss shares this skeleton — rendered on the overview and each detail page.
export const SHARED_MECHANICS: { name: string; desc: string }[] = [
  { name: 'Fixate', desc: 'Locks onto one player — run. Tanks get a taunt tool to override it.' },
  { name: 'Summons', desc: 'Adds join the fight mid-phase.' },
  { name: 'Enrage', desc: 'Soft enrage in the last phase — burn it down or wipe.' },
  { name: 'Taunt', desc: "Tank tool that yanks the boss's fixate off a teammate." },
];
