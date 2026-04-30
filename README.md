# mc.pvpers.us

Website for the mc.pvpers.us Vanilla+ Minecraft server. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- Minecraft-themed design with parallax backgrounds and ambient particle effects
- Server info with one-click IP copy
- Interactive Version Catch-Up timeline (1.0 through 26.1) with first-visit year picker, return-visit jump-to-year, year section headers, and per-version month labels
- Modpack import codes (QoL + FPS Boost) with featured/expanded mod lists grouped by category, a 7-step CurseForge installation guide, and per-pack RAM allocation guidance (8–10 GB for QoL, 4 GB default for FPS Boost). Both packs include Simple Voice Chat for server-wide proximity voice
- Reminder that the packs are optional — players can join with vanilla, disable mods in CurseForge, or bring their own
- Guide for adding custom mods, resource packs, and shader packs
- Bedrock interest poll with live vote counter (backed by a JSON file + Next.js API route, dedupes on hashed IP)
- Cloud text effects behind headings and descriptions (CloudTitle, CloudText, CloudTextSmall, CloudTextTiny)
- Dynamic weather system — random rain and thunderstorms with pixelated rain drops, lightning bolts, screen flash, and full-page desaturation
- Manual weather toggle in the header (cycles clear/rain/thunderstorm)
- Weather-aware UI — header, clouds, and background shift to moody gray tones during rain (light mode)
- Occasional shooting stars streak across the night sky in dark mode during clear weather (pixelated comet + fading tail, motion aligned to the tilt)
- World border expansion system explained across home (teaser), about (full tier table with new-chunk estimates), and BlueMap (legend) pages
- Live server status (online player count, polled every 30s) below the home-page IP copy, fed by the PiStatsAPI plugin via a server-side proxy
- Live world-border widget on the about page (current radius, weekly playtime, total expansions), fed by the same proxy
- Leaderboards backed by real player data (Playtime / Deaths) with mc-heads.net player avatars
- BlueMap embed with legend explaining world border and land claims (placeholder — needs BlueMap URL)
- Screenshot gallery and news/changelog pages
- Two-preset responsive design: a single `md:` breakpoint (768px) splits the **mobile preset** from the **desktop preset** — mobile gets enlarged touch targets, throttled canvas effects, narrower BlueMap legend, and shorter map iframe; desktop is untouched. Honors `prefers-reduced-motion` (skips the parallax scroll listener, particles, rain, and shooting stars)

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

No environment variables required for basic development. The stats proxy at `/api/stats/[...path]` defaults to the DatHost production PiStatsAPI endpoint (`http://stained.dathost.net:17249`); set `PISTATS_URL` to point at a different upstream (e.g. `http://localhost:8081` for the Pi dev mirror).

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS 4**
- **React 19**

## Project Structure

- `src/app/` — Pages (file-based routing) and API routes under `src/app/api/`
- `src/components/` — Reusable UI components
- `src/data/` — JSON content files (rules, plugins, versions, news, modpacks)
- `data/` — Runtime state (poll counts, etc.) — gitignored, created at first write
- `public/` — Static assets (textures, audio, cursors)

## Credits

Built by [Carson Caplan](https://carsoncaplan.com) — see carsoncaplan.com for more projects.
