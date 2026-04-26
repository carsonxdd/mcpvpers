'use client';

import { useState } from 'react';
import CloudTitle from '@/components/CloudTitle';

const categories = [
  'Playtime', 'Deaths', 'Player Kills', 'Mob Kills', 'Blocks Mined', 'Distance Traveled',
] as const;
type Category = (typeof categories)[number];

const mockData: Record<Category, { name: string; value: string }[]> = {
  Playtime: [
    { name: 'Steve', value: '142h 30m' },
    { name: 'Alex', value: '98h 15m' },
    { name: 'Notch', value: '87h 45m' },
    { name: 'Jeb', value: '64h 20m' },
    { name: 'Dinnerbone', value: '52h 10m' },
  ],
  Deaths: [
    { name: 'Alex', value: '347' },
    { name: 'Steve', value: '221' },
    { name: 'Dinnerbone', value: '198' },
    { name: 'Notch', value: '156' },
    { name: 'Jeb', value: '89' },
  ],
  'Player Kills': [
    { name: 'Steve', value: '45' },
    { name: 'Notch', value: '32' },
    { name: 'Alex', value: '28' },
    { name: 'Jeb', value: '15' },
    { name: 'Dinnerbone', value: '8' },
  ],
  'Mob Kills': [
    { name: 'Steve', value: '4,521' },
    { name: 'Alex', value: '3,892' },
    { name: 'Jeb', value: '2,445' },
    { name: 'Notch', value: '2,103' },
    { name: 'Dinnerbone', value: '1,876' },
  ],
  'Blocks Mined': [
    { name: 'Alex', value: '89,234' },
    { name: 'Steve', value: '76,891' },
    { name: 'Notch', value: '54,332' },
    { name: 'Jeb', value: '43,221' },
    { name: 'Dinnerbone', value: '32,109' },
  ],
  'Distance Traveled': [
    { name: 'Notch', value: '1,234 km' },
    { name: 'Steve', value: '987 km' },
    { name: 'Alex', value: '876 km' },
    { name: 'Jeb', value: '654 km' },
    { name: 'Dinnerbone', value: '432 km' },
  ],
};

const medalStyles = ['text-gold glow-gold', 't-text-dim', 'text-oak'];

export default function LeaderboardsPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('Playtime');
  const data = mockData[activeCategory];

  return (
    <div>
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center"><CloudTitle><h1 className="font-pixel text-gold text-2xl sm:text-3xl mb-8 glow-gold">Leaderboards</h1></CloudTitle></div>

        <div className="flex flex-wrap gap-1.5 mb-8 justify-center relative z-10">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`mc-pill ${activeCategory === cat ? 'mc-pill-active' : ''}`}>
              {cat}
            </button>
          ))}
        </div>

        <div className="mc-panel overflow-hidden max-md:overflow-x-auto">
          <div className="max-md:min-w-[320px]">
            <div className="grid grid-cols-[3rem_1fr_auto] gap-4 px-4 py-3 t-border-50 border-b max-md:grid-cols-[2.5rem_1fr_auto] max-md:gap-3 max-md:px-3">
              <span className="font-pixel t-text-muted text-[10px]">#</span>
              <span className="font-pixel t-text-muted text-[10px]">Player</span>
              <span className="font-pixel t-text-muted text-[10px] text-right">{activeCategory}</span>
            </div>

            {data.map((player, i) => (
              <div key={player.name}
                className="grid grid-cols-[3rem_1fr_auto] gap-4 px-4 py-3 t-border-20 border-b transition-colors hover-surface max-md:grid-cols-[2.5rem_1fr_auto] max-md:gap-3 max-md:px-3"
                style={i < 3 ? { background: 'color-mix(in srgb, var(--c-surface) 30%, transparent)' } : undefined}
              >
                <span className={`font-pixel text-xs ${i < 3 ? medalStyles[i] : 't-text-muted'}`}>
                  {i + 1}
                </span>
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-6 h-6 t-surface-light rounded shrink-0" />
                  <span className={`text-sm max-md:truncate ${i < 3 ? 't-text font-medium' : 't-text-dim'}`}>
                    {player.name}
                  </span>
                </div>
                <span className={`text-sm text-right whitespace-nowrap ${i === 0 ? 'text-gold font-pixel text-xs' : 't-text-muted'}`}>
                  {player.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="t-text-muted-50 text-xs text-center mt-4">
          Placeholder data. Stats API will provide real data once configured.
        </p>
      </section>
    </div>
  );
}
