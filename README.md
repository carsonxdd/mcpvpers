# mc.pvpers.us

Website for the mc.pvpers.us Vanilla+ Minecraft server. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- Minecraft-themed design with parallax backgrounds and ambient particle effects
- Server info with one-click IP copy
- Interactive Version Catch-Up timeline (1.0 through 26.1) with first-visit year picker, return-visit jump-to-year, year section headers, and per-version month labels
- Modpack import codes (QoL + Potato Edition) with CurseForge installation guide
- Guide for adding custom mods, resource packs, and shader packs
- Bedrock player guide with device-specific instructions
- Cloud text effects behind headings and descriptions (CloudTitle, CloudText, CloudTextSmall, CloudTextTiny)
- Dynamic weather system — random rain and thunderstorms with pixelated rain drops, lightning bolts, screen flash, and full-page desaturation
- Manual weather toggle in the header (cycles clear/rain/thunderstorm)
- Weather-aware UI — header, clouds, and background shift to moody gray tones during rain (light mode)
- World border expansion system explained across home (teaser), about (full tier table with new-chunk estimates), and BlueMap (legend) pages
- Leaderboards (placeholder — needs Stats API)
- BlueMap embed with legend explaining world border and land claims (placeholder — needs BlueMap URL)
- Screenshot gallery and news/changelog pages
- Fully responsive with mobile navigation

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment

No environment variables required for basic development. Future integrations (Stats API, BlueMap) will need configuration.

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS 4**
- **React 19**

## Project Structure

- `src/app/` — Pages (file-based routing)
- `src/components/` — Reusable UI components
- `src/data/` — JSON content files (rules, plugins, versions, news, modpacks)
- `public/` — Static assets (textures, audio, cursors)
