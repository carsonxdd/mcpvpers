'use client';

import { useState } from 'react';
import CopyButton from '@/components/CopyButton';
import GrassDivider from '@/components/GrassDivider';
import CloudTitle from '@/components/CloudTitle';
import CloudTextSmall from '@/components/CloudTextSmall';

const tabs = ['Xbox Series X|S', 'PlayStation 5', 'Mobile', 'Windows 10/11'] as const;
type Tab = (typeof tabs)[number];

const instructions: Record<Tab, { steps: string[]; note?: string }> = {
  'Xbox Series X|S': {
    steps: [
      'Open Minecraft Bedrock Edition on your Xbox.',
      'Go to Settings > General > Network Settings.',
      'Select Advanced Settings.',
      'Change your DNS settings to Manual.',
      'Set Primary DNS to 104.238.130.180 (BedrockConnect).',
      'Set Secondary DNS to 8.8.8.8 (Google DNS).',
      'Press B to save and go back to the home screen.',
      'Launch Minecraft and go to the Servers tab.',
      'Select any featured server (e.g. Hive, CubeCraft).',
      'You\'ll be redirected to the BedrockConnect server list.',
      'Select "Connect to a Server" and enter mc.pvpers.us with port 19132.',
      'Hit Submit and you\'re in!',
    ],
    note: 'You only need to change DNS once. After that, just pick any featured server each time to get to the server list.',
  },
  'PlayStation 5': {
    steps: [
      'On your PS5, go to Settings > Network > Settings > Set Up Internet Connection.',
      'Select your current connection (Wi-Fi or LAN) and hit Edit.',
      'Change DNS Settings to Manual.',
      'Set Primary DNS to 104.238.130.180 (BedrockConnect).',
      'Set Secondary DNS to 8.8.8.8 (Google DNS).',
      'Save and connect.',
      'Open Minecraft Bedrock Edition.',
      'Go to the Servers tab.',
      'Select any featured server (e.g. Hive, CubeCraft).',
      'You\'ll be redirected to the BedrockConnect server list.',
      'Select "Connect to a Server" and enter mc.pvpers.us with port 19132.',
      'Hit Submit and you\'re in!',
    ],
    note: 'PlayStation added server browsing support through BedrockConnect. You only need to set DNS once — it persists across restarts.',
  },
  Mobile: {
    steps: [
      'Open Minecraft Bedrock Edition on your device.',
      'Tap "Play" then go to the "Servers" tab.',
      'Scroll down and tap "Add Server".',
      'Enter mc.pvpers.us as the Server Address.',
      'Enter 19132 as the Port.',
      'Tap "Save" then tap the server to join!',
    ],
  },
  'Windows 10/11': {
    steps: [
      'Open Minecraft Bedrock Edition from the Microsoft Store.',
      'Click "Play" then go to the "Servers" tab.',
      'Scroll down and click "Add Server".',
      'Enter mc.pvpers.us as the Server Address.',
      'Enter 19132 as the Port.',
      'Click "Save" then click the server to join!',
    ],
  },
};

const limitations = [
  'Some visual effects may differ from Java Edition',
  'Redstone behavior has minor differences',
  'Some plugins may have limited Bedrock support',
  'Custom resource packs may not display correctly',
  'Combat mechanics differ slightly from Java',
];

export default function BedrockPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Xbox Series X|S');

  const current = instructions[activeTab];

  return (
    <div>
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <CloudTitle><h1 className="font-pixel text-gold text-2xl sm:text-3xl mb-4 glow-gold">Bedrock Players</h1></CloudTitle>
        <CloudTextSmall className="mb-6">
          <p className="t-text-dim">
            We support Bedrock Edition through <strong className="text-xp">GeyserMC</strong>, which
            lets Bedrock players join Java servers seamlessly. No mods required on your end.
          </p>
        </CloudTextSmall>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <CopyButton text="mc.pvpers.us" label="IP: mc.pvpers.us" />
          <CopyButton text="19132" label="Port: 19132" />
        </div>
      </section>

      <GrassDivider />

      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center"><CloudTitle><h2 className="font-pixel text-gold text-lg mb-6 glow-gold">How to Join</h2></CloudTitle></div>

        <div className="flex flex-wrap gap-1.5 mb-6 justify-center">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`mc-pill ${activeTab === tab ? 'mc-pill-active' : ''}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="mc-panel p-6">
          <ol className="space-y-3">
            {current.steps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="font-pixel text-gold text-xs shrink-0 w-5 text-right">{i + 1}.</span>
                <span className="t-text-dim">{step}</span>
              </li>
            ))}
          </ol>

          {current.note && (
            <div className="mt-5 pt-4 flex gap-2.5 text-xs" style={{ borderTop: '1px solid var(--c-border)' }}>
              <span className="text-gold font-pixel shrink-0">TIP</span>
              <span className="t-text-muted">{current.note}</span>
            </div>
          )}
        </div>

        {/* DNS quick reference for console players */}
        {(activeTab === 'Xbox Series X|S' || activeTab === 'PlayStation 5') && (
          <div className="mc-panel p-5 mt-4">
            <h3 className="font-pixel text-gold text-[10px] uppercase tracking-wider mb-3">DNS Quick Reference</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="t-text-muted text-xs">Primary DNS</span>
                <p className="font-pixel text-xp text-sm">104.238.130.180</p>
              </div>
              <div>
                <span className="t-text-muted text-xs">Secondary DNS</span>
                <p className="font-pixel t-text text-sm">8.8.8.8</p>
              </div>
              <div>
                <span className="t-text-muted text-xs">Server Address</span>
                <p className="font-pixel text-gold text-sm">mc.pvpers.us</p>
              </div>
              <div>
                <span className="t-text-muted text-xs">Port</span>
                <p className="font-pixel t-text text-sm">19132</p>
              </div>
            </div>
          </div>
        )}
      </section>

      <GrassDivider />

      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center"><CloudTitle><h2 className="font-pixel text-gold text-lg mb-6 glow-gold">Known Limitations</h2></CloudTitle></div>
        <div className="mc-panel p-6">
          <ul className="space-y-2">
            {limitations.map((item, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="text-redstone shrink-0 font-pixel text-xs">!</span>
                <span className="t-text-dim">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
