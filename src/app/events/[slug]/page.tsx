import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  bosses,
  bossBySlug,
  accentFor,
  tierLabel,
  lootTier,
  SHARED_MECHANICS,
} from '@/lib/bossDisplay';

// Static params: one page per boss. Data is fully static (bosses.json), so every
// raid page is prerendered at build time and edge-cached.
export function generateStaticParams() {
  return bosses.map((b) => ({ slug: b.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const boss = bossBySlug(slug);
  if (!boss) return { title: 'Boss Rush — mc.pvpers.us' };
  return {
    title: `${boss.name} · ${boss.raid} — Boss Rush`,
    description: boss.description,
  };
}

const TIER_ORDER = ['epic', 'rare', 'common'] as const;

export default async function RaidPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const boss = bossBySlug(slug);
  if (!boss) notFound();

  const a = accentFor(boss.accent);
  const idx = bosses.findIndex((b) => b.id === boss.id);
  const prev = bosses[idx - 1];
  const next = bosses[idx + 1];

  return (
    <div>
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="mb-6">
          <Link href="/events" className="text-sm t-text-muted hover:underline">
            ← Boss Rush
          </Link>
        </div>

        {/* Header */}
        <div className={`mc-panel p-6 mb-8 border-l-2 ${a.border}`}>
          <div className="flex items-start gap-4">
            <span className="text-4xl leading-none shrink-0" aria-hidden>
              {boss.icon}
            </span>
            <div className="min-w-0">
              <span className={`font-pixel text-[10px] px-1.5 py-0.5 rounded ${a.chip}`}>
                {tierLabel(boss)}
              </span>
              <h1 className={`font-pixel ${a.text} text-xl sm:text-2xl max-md:text-base mt-2`}>
                {boss.name}
              </h1>
              <p className="font-pixel t-text-muted text-[11px] mt-2 relative z-10">
                {boss.raid} · {boss.mob}
              </p>
            </div>
          </div>
          <p className="t-text-dim text-sm mt-4 leading-relaxed relative z-10">{boss.description}</p>
        </div>

        {/* The fight */}
        <div className="mb-8">
          <h2 className="font-pixel t-text text-sm mb-3 px-1">The Fight</h2>
          <div className="mc-panel p-5">
            <p className="t-text-muted text-sm mb-4 leading-snug">
              Four waves of adds, then the boss — fought across three HP phases (
              <span className="t-text-dim">100% → 60% → 30%</span>), its kit escalating as it drops.
            </p>

            {/* Signature moves */}
            <h3 className="font-pixel t-text-dim text-xs mb-3">Signature moves</h3>
            <div className="space-y-2.5 mb-5">
              {boss.moves.map((m) => (
                <div key={m.name} className="flex gap-2.5 text-sm">
                  <span className={`font-pixel text-[10px] px-1.5 py-0.5 rounded shrink-0 h-fit ${a.chip}`}>
                    {m.name}
                  </span>
                  <span className="t-text-muted leading-snug">{m.description}</span>
                </div>
              ))}
            </div>

            {/* Shared mechanics */}
            <div className="pt-4 t-border-20 border-t">
              <h3 className="font-pixel t-text-dim text-xs mb-3">Plus, like every boss</h3>
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5 text-xs">
                {SHARED_MECHANICS.map((m) => (
                  <div key={m.name} className="flex gap-2">
                    <span className="font-pixel text-[10px] px-1.5 py-0.5 rounded shrink-0 h-fit t-surface-light t-text-dim">
                      {m.name}
                    </span>
                    <span className="t-text-muted leading-snug">{m.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Loot table */}
        <div className="mb-8">
          <h2 className="font-pixel t-text text-sm mb-3 px-1">Loot Table</h2>
          <p className="t-text-muted text-[11px] mb-4 px-1">
            Dropped on a clear. Top-3 scorers also roll an epic; every roll has a 35% chance to
            upgrade to rare.
          </p>
          <div className="space-y-6">
            {TIER_ORDER.map((tier) => {
              const items = boss.loot.filter((d) => d.tier === tier);
              if (items.length === 0) return null;
              const t = lootTier[tier];
              return (
                <div key={tier}>
                  <h3 className="font-pixel text-xs mb-3 flex items-baseline gap-2">
                    <span style={{ color: t.color }}>{t.badge}</span>
                    <span className="t-text-muted">· {items.length}</span>
                  </h3>
                  <div className="mc-panel overflow-hidden">
                    {items.map((d) => (
                      <div key={d.name} className="px-4 py-3 t-border-20 border-b last:border-b-0">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-sm font-medium" style={{ color: t.color }}>
                            {d.name}
                          </span>
                          <span className="t-text-muted text-xs">{d.item}</span>
                          {d.enchants && (
                            <span className="t-text-dim text-xs ml-auto max-md:ml-0 max-md:basis-full">
                              {d.enchants}
                            </span>
                          )}
                        </div>
                        {d.lore && (
                          <p className="t-text-muted italic text-[11px] mt-1 leading-snug">“{d.lore}”</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Prev / next raid */}
        <div className="flex items-center justify-between gap-3 pt-4 t-border-20 border-t">
          {prev ? (
            <Link href={`/events/${prev.id}`} className="text-xs t-text-muted hover:t-text-dim min-w-0">
              ← {tierLabel(prev)}: <span className="t-text-dim">{prev.name}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/events/${next.id}`} className="text-xs t-text-muted hover:t-text-dim text-right min-w-0">
              {tierLabel(next)}: <span className="t-text-dim">{next.name}</span> →
            </Link>
          ) : (
            <span />
          )}
        </div>
      </section>
    </div>
  );
}
