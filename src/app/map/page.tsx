'use client';

import { useState } from 'react';
import CloudTitle from '@/components/CloudTitle';

export default function MapPage() {
  const [legendOpen, setLegendOpen] = useState(true);

  return (
    <div>
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center"><CloudTitle><h1 className="font-pixel text-gold text-2xl sm:text-3xl mb-6 glow-gold">BlueMap</h1></CloudTitle></div>

        <div className="relative mc-panel overflow-hidden h-[70vh] min-h-[500px] max-md:h-[60vh] max-md:min-h-[360px]">
          {/* Fallback shown behind the iframe — visible if BlueMap is offline. */}
          <div className="absolute inset-0 flex items-center justify-center t-surface">
            <div className="text-center px-6">
              <div className="font-pixel text-gold text-sm mb-2 glow-gold">BlueMap is offline</div>
              <p className="t-text-muted text-sm">
                The live map is served directly from the game server. If it&apos;s down for a restart, check back in a minute.
              </p>
            </div>
          </div>

          <iframe
            src="https://map.pvpers.us"
            title="BlueMap live server map"
            className="absolute inset-0 w-full h-full border-0"
          />


          <div className={`absolute top-4 right-4 z-10 transition-all ${legendOpen ? 'w-72 max-md:w-52' : 'w-auto'}`}>
            <button
              onClick={() => setLegendOpen(!legendOpen)}
              className="mc-panel px-3 py-1.5 font-pixel text-[10px] t-text-dim hover:text-gold transition-colors cursor-pointer"
            >
              {legendOpen ? 'Hide Legend' : 'Legend'}
            </button>

            {legendOpen && (
              <div className="mc-panel p-4 mt-2">
                <h3 className="font-pixel t-text-dim text-[10px] mb-3 uppercase tracking-wider">Map Legend</h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-3 h-3 bg-redstone/30 border border-redstone/60 rounded-sm inline-block" />
                      <span className="t-text-dim">World Border</span>
                    </div>
                    <p className="t-text-muted pl-5 mb-1">
                      The visible world is bounded by the world border. It starts at 1,750 blocks
                      from spawn and expands every Sunday based on combined community playtime.
                    </p>
                    <p className="t-text-muted pl-5">
                      <a href="/about#world-border" className="text-enchant hover:text-enchant/70 transition-colors underline underline-offset-2 text-[11px]">
                        See expansion tiers &rarr;
                      </a>
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-3 h-3 bg-grass/30 border border-grass/60 rounded-sm inline-block" />
                      <span className="t-text-dim">Land Claims</span>
                    </div>
                    <p className="t-text-muted pl-5">Protected territory via Lands plugin.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
