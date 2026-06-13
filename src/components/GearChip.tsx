import { gearMode } from '@/lib/bossDisplay';

// Gear-mode chip for event rows (PiStatsAPI 1.7.0+). Dense lists (raid log,
// match log, profile rows) hide the default KIT mode and only flag
// BYOG/HARDCORE; pass `showKit` where the extra context helps (live banner,
// run-detail header). `null`/absent = pre-feature kit-era rows → render nothing.
export default function GearChip({
  mode,
  showKit = false,
}: {
  mode?: string | null;
  showKit?: boolean;
}) {
  if (!mode) return null;
  const g = gearMode[mode];
  if (!g || (!showKit && mode === 'KIT')) return null;
  return (
    <span
      className="font-pixel text-[9px] px-1 py-0.5 rounded shrink-0"
      style={{ color: g.color, background: `color-mix(in srgb, ${g.color} 15%, transparent)` }}
    >
      {g.label}
    </span>
  );
}
