'use client';

import { useState } from 'react';
import modpacks from '@/data/modpacks.json';
import CloudTitle from '@/components/CloudTitle';
import CloudText from '@/components/CloudText';
import CloudTextSmall from '@/components/CloudTextSmall';
import GrassDivider from '@/components/GrassDivider';
import CopyButton from '@/components/CopyButton';

type Mod = { name: string; description: string; featured?: boolean; category?: string };

const CATEGORY_ORDER = ['Performance', 'Visuals', 'Quality of Life', 'Libraries', 'Other'];

function ModRow({ mod }: { mod: Mod }) {
  return (
    <div className="inventory-slot p-2.5">
      <div className="font-pixel t-text text-[10px] mb-1.5">{mod.name}</div>
      <div className="t-text-muted text-xs leading-snug">{mod.description}</div>
    </div>
  );
}

function ModList({ mods, showAll }: { mods: Mod[]; showAll: boolean }) {
  if (!showAll) {
    return (
      <div className="space-y-2">
        {mods.filter((m) => m.featured).map((mod) => <ModRow key={mod.name} mod={mod} />)}
      </div>
    );
  }

  const grouped = mods.reduce<Record<string, Mod[]>>((acc, mod) => {
    const cat = mod.category ?? 'Other';
    (acc[cat] ||= []).push(mod);
    return acc;
  }, {});

  const sortedCats = Object.keys(grouped).sort(
    (a, b) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b)
  );

  return (
    <div className="space-y-5">
      {sortedCats.map((cat) => (
        <div key={cat}>
          <h3 className="font-pixel text-enchant text-[10px] mb-2 uppercase tracking-wider glow-enchant">{cat}</h3>
          <div className="space-y-2">
            {grouped[cat].map((mod) => <ModRow key={mod.name} mod={mod} />)}
          </div>
        </div>
      ))}
    </div>
  );
}

function ToggleButton({ expanded, total, onClick }: { expanded: boolean; total: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="mc-panel w-full px-4 py-2.5 font-pixel text-[10px] uppercase tracking-wider t-text-dim hover:text-gold transition-colors cursor-pointer"
    >
      {expanded ? 'Show fewer' : `Show all ${total} mods`}
    </button>
  );
}

export default function ModpacksPage() {
  const [qolShowAll, setQolShowAll] = useState(false);
  const [potatoShowAll, setPotatoShowAll] = useState(false);

  return (
    <div>
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center"><CloudTitle><h1 className="font-pixel text-gold text-2xl sm:text-3xl mb-4 glow-gold">Modpacks</h1></CloudTitle></div>
        <CloudText className="max-w-2xl mx-auto mb-4 text-center">
          <p className="t-text-dim">
            Our approved client-side modpacks enhance your experience without giving unfair advantages.
            All mods are pre-configured with server-friendly settings.
          </p>
        </CloudText>

        <div className="mc-panel p-4 max-w-2xl mx-auto mb-6 text-center">
          <h2 className="font-pixel t-text-dim text-[10px] mb-2 uppercase tracking-wider">Which pack is right for you?</h2>
          <p className="t-text-muted text-sm">
            <strong className="text-xp">QoL Modpack</strong>: Full experience — shaders, Fresh Animations, controller support, connected textures, and more.
            <br />
            <strong className="text-gold">FPS Boost</strong>: Just performance. For machines that need every frame they can get.
          </p>
        </div>

        <div className="mc-panel p-4 max-w-2xl mx-auto mb-12 text-center">
          <h2 className="font-pixel t-text-dim text-[10px] mb-2 uppercase tracking-wider">Or none of the above</h2>
          <p className="t-text-muted text-sm">
            These packs are optional. You can join with <strong className="t-text">vanilla</strong> Minecraft, disable any mods you don&apos;t want in CurseForge, or <strong className="t-text">add your own</strong> mods, resource packs, and shaders — see the guides below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="mc-panel p-6">
            <h2 className="font-pixel text-xp text-sm mb-2 glow-xp">{modpacks.qol.name}</h2>
            <p className="t-text-muted text-sm mb-6">{modpacks.qol.description}</p>
            <div className="mb-4">
              <ModList mods={modpacks.qol.mods} showAll={qolShowAll} />
            </div>
            <div className="mb-6">
              <ToggleButton
                expanded={qolShowAll}
                total={modpacks.qol.mods.length}
                onClick={() => setQolShowAll((v) => !v)}
              />
            </div>
            <div className="text-center">
              <p className="font-pixel text-[10px] t-text-muted mb-2 uppercase tracking-wider">Import Code</p>
              <CopyButton text={modpacks.qol.importCode} label={modpacks.qol.importCode} className="w-full" />
            </div>
          </div>

          <div className="mc-panel p-6">
            <h2 className="font-pixel text-gold text-sm mb-2 glow-gold">{modpacks.potato.name}</h2>
            <p className="t-text-muted text-sm mb-6">{modpacks.potato.description}</p>
            <div className="mb-4">
              <ModList mods={modpacks.potato.mods} showAll={potatoShowAll} />
            </div>
            <div className="mb-6">
              <ToggleButton
                expanded={potatoShowAll}
                total={modpacks.potato.mods.length}
                onClick={() => setPotatoShowAll((v) => !v)}
              />
            </div>
            <div className="text-center">
              <p className="font-pixel text-[10px] t-text-muted mb-2 uppercase tracking-wider">Import Code</p>
              <CopyButton text={modpacks.potato.importCode} label={modpacks.potato.importCode} className="w-full" />
            </div>
          </div>
        </div>
      </section>

      <GrassDivider />

      {/* CurseForge Installation */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center"><CloudTitle><h2 className="font-pixel text-gold text-lg mb-6 glow-gold">Installing via CurseForge</h2></CloudTitle></div>
        <CloudTextSmall className="text-center mb-8">
          <p className="t-text-dim">
            Copy an import code above and paste it into CurseForge to install. Takes about 30 seconds.
          </p>
        </CloudTextSmall>

        <div className="mc-panel p-6 sm:p-8">
          <ol className="space-y-4">
            <li className="flex gap-4 text-sm">
              <span className="font-pixel text-gold text-xs shrink-0 w-5 text-right">1.</span>
              <span className="t-text-dim">Download the CurseForge App from <strong className="t-text">curseforge.com</strong> and install it. Select Minecraft when prompted.</span>
            </li>
            <li className="flex gap-4 text-sm">
              <span className="font-pixel text-gold text-xs shrink-0 w-5 text-right">2.</span>
              <span className="t-text-dim">Copy the <strong className="t-text">Import Code</strong> for the modpack you want from above.</span>
            </li>
            <li className="flex gap-4 text-sm">
              <span className="font-pixel text-gold text-xs shrink-0 w-5 text-right">3.</span>
              <span className="t-text-dim">Open CurseForge, go to <strong className="t-text">Minecraft</strong>, then click <strong className="t-text">Create Custom Profile</strong>.</span>
            </li>
            <li className="flex gap-4 text-sm">
              <span className="font-pixel text-gold text-xs shrink-0 w-5 text-right">4.</span>
              <span className="t-text-dim">Click <strong className="t-text">Import</strong> and paste the import code when prompted.</span>
            </li>
            <li className="flex gap-4 text-sm">
              <span className="font-pixel text-gold text-xs shrink-0 w-5 text-right">5.</span>
              <span className="t-text-dim">CurseForge will install everything automatically. Once it&apos;s done, hit <strong className="t-text">Play</strong>.</span>
            </li>
          </ol>
        </div>
      </section>

      <GrassDivider />

      {/* Adding Your Own Content */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center"><CloudTitle><h2 className="font-pixel text-gold text-lg mb-6 glow-gold">Adding Your Own Content</h2></CloudTitle></div>
        <CloudTextSmall className="text-center mb-8">
          <p className="t-text-dim">
            Want to customize further? You can add mods, resource packs, and shaders directly through CurseForge.
          </p>
        </CloudTextSmall>

        <div className="space-y-5">
          <div className="mc-panel p-6">
            <h3 className="font-pixel text-enchant text-xs mb-3 glow-enchant">Mods</h3>
            <ol className="space-y-2">
              <li className="flex gap-3 text-sm">
                <span className="font-pixel text-gold text-xs shrink-0 w-5 text-right">1.</span>
                <span className="t-text-dim">Right-click your profile and select <strong className="t-text">Open Folder</strong>, or click the puzzle piece icon.</span>
              </li>
              <li className="flex gap-3 text-sm">
                <span className="font-pixel text-gold text-xs shrink-0 w-5 text-right">2.</span>
                <span className="t-text-dim">Click <strong className="t-text">Add More Content</strong> and search for any mod you want.</span>
              </li>
              <li className="flex gap-3 text-sm">
                <span className="font-pixel text-gold text-xs shrink-0 w-5 text-right">3.</span>
                <span className="t-text-dim">Hit <strong className="t-text">Install</strong>. CurseForge handles dependencies automatically.</span>
              </li>
            </ol>
          </div>

          <div className="mc-panel p-6">
            <h3 className="font-pixel text-enchant text-xs mb-3 glow-enchant">Resource Packs</h3>
            <ol className="space-y-2">
              <li className="flex gap-3 text-sm">
                <span className="font-pixel text-gold text-xs shrink-0 w-5 text-right">1.</span>
                <span className="t-text-dim">In your profile, click <strong className="t-text">Add More Content</strong> and switch the filter to <strong className="t-text">Resource Packs</strong>.</span>
              </li>
              <li className="flex gap-3 text-sm">
                <span className="font-pixel text-gold text-xs shrink-0 w-5 text-right">2.</span>
                <span className="t-text-dim">Install any pack you like. Once in-game, go to <strong className="t-text">Options &gt; Resource Packs</strong> to enable it.</span>
              </li>
            </ol>
          </div>

          <div className="mc-panel p-6">
            <h3 className="font-pixel text-enchant text-xs mb-3 glow-enchant">Shader Packs</h3>
            <ol className="space-y-2">
              <li className="flex gap-3 text-sm">
                <span className="font-pixel text-gold text-xs shrink-0 w-5 text-right">1.</span>
                <span className="t-text-dim">Make sure <strong className="t-text">Iris Shaders</strong> is installed (included in both modpacks).</span>
              </li>
              <li className="flex gap-3 text-sm">
                <span className="font-pixel text-gold text-xs shrink-0 w-5 text-right">2.</span>
                <span className="t-text-dim">Download a shader pack from CurseForge or sites like Modrinth.</span>
              </li>
              <li className="flex gap-3 text-sm">
                <span className="font-pixel text-gold text-xs shrink-0 w-5 text-right">3.</span>
                <span className="t-text-dim">In-game, go to <strong className="t-text">Options &gt; Video Settings &gt; Shader Packs</strong> and drag the file in, or click <strong className="t-text">Open Shader Pack Folder</strong> and drop it there.</span>
              </li>
            </ol>
          </div>
        </div>
      </section>
    </div>
  );
}
