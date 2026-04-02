# mc.pvpers.us — Project Context

## Tech Stack
- **Framework**: Next.js 16.2.2 (App Router, Turbopack)
- **Language**: TypeScript 5.x (strict mode)
- **Styling**: Tailwind CSS 4 with `@tailwindcss/postcss`
- **React**: 19.2.4
- **Node**: 20.x
- **Package Manager**: npm

## Architecture
Single Next.js app with file-based routing under `src/app/`. All pages are statically generated (SSG) by default. Client components (`'use client'`) are used only where interactivity is needed (particles, music, tabs, copy buttons, etc.).

### Key Patterns
- **`@/*` import alias** maps to `./src/*` (configured in tsconfig)
- **Data-driven pages**: Content lives in `src/data/*.json` files and is imported directly into components. No database or CMS yet.
- **Custom CSS classes**: Minecraft-themed utility classes are defined in `globals.css` — `stone-panel`, `inventory-slot`, `mc-tooltip`, `grass-divider`, `enchant-hover`, `typewriter`, `weather-clear`, `weather-rain`, `weather-thunderstorm`
- **Cloud components**: Four tiers — `CloudTitle` (single blocky cloud behind headings), `CloudText` (5 overlapping clouds for multi-line text), `CloudTextSmall` (3 clouds for short 1-2 line text), `CloudTextTiny` (2 clouds for single-line text). All use SVG rects with bumpy top/bottom edges and a breathing animation. All are weather-aware — they desaturate/darken during rain via CSS filter on the SVG element.
- **Weather system**: `WeatherProvider` context manages `clear | rain | thunderstorm` state. Random scheduler (2-5 min intervals, 15% rain / 5% storm chance). `RainCanvas` renders pixelated 2px-wide rectangular drops on a separate canvas at z-5. `ThunderstormOverlay` renders pixelated lightning bolts (90-degree zigzag SVG), full-screen white flash, and plays thunder audio. `WeatherToggle` in Header cycles states manually. Desaturation is applied via CSS `filter` on the `ParallaxBackground` and cloud component SVGs only — text content is never filtered. In light mode, the Header shifts to a gray background with light text during rain.
- **Theme colors**: All defined as `@theme inline` CSS variables in `globals.css` and usable as Tailwind classes (e.g., `text-gold`, `bg-grass`, `text-birch`)
- **Pixel font**: `font-pixel` class uses local Minecraft font with Press Start 2P fallback for headings
- **Body font**: Nunito from Google Fonts for readability

## File Structure
```
src/
├── app/
│   ├── layout.tsx          # Root layout — Header, Footer, Parallax, Particles, Weather, Music
│   ├── page.tsx            # Home page
│   ├── globals.css         # All global styles, theme, animations
│   ├── about/page.tsx      # About & Rules
│   ├── modpacks/page.tsx   # Modpack import codes (client component)
│   ├── bedrock/page.tsx    # Bedrock player guide (client component)
│   ├── version-catchup/page.tsx  # Interactive version timeline with first-visit/return-visit UX (client component)
│   ├── map/page.tsx        # BlueMap embed placeholder (client component)
│   ├── leaderboards/page.tsx     # Stats leaderboard (client component)
│   ├── gallery/page.tsx    # Screenshot gallery (client component)
│   └── news/page.tsx       # News & changelog
├── components/
│   ├── Header.tsx          # Fixed nav bar with mobile menu, weather-aware styling (client)
│   ├── Footer.tsx          # Site footer with links (server)
│   ├── ParticleCanvas.tsx  # Canvas-based ambient particles (client)
│   ├── ParallaxBackground.tsx  # Scroll-based parallax sky/terrain, weather-aware (client)
│   ├── WeatherProvider.tsx # Weather context — state machine, random scheduler, desaturation wrapper (client)
│   ├── RainCanvas.tsx      # Canvas-based pixelated rain drops (client)
│   ├── ThunderstormOverlay.tsx # Lightning bolts, screen flash, thunder audio (client)
│   ├── WeatherToggle.tsx   # Header button to cycle clear/rain/thunderstorm (client)
│   ├── MusicPlayer.tsx     # Mute/unmute toggle with cookie persistence (client)
│   ├── CopyButton.tsx      # Click-to-copy with feedback (client)
│   ├── GrassDivider.tsx    # Themed section divider (server)
│   ├── CloudTitle.tsx      # Blocky cloud SVG behind section headings, weather-aware (client)
│   ├── CloudText.tsx       # Multi-cloud SVG behind larger text blocks, weather-aware (client)
│   ├── CloudTextSmall.tsx  # Lighter 3-cloud SVG for short 1-2 line text, weather-aware (client)
│   └── CloudTextTiny.tsx   # Minimal 2-cloud SVG for single-line text, weather-aware (client)
├── data/
│   ├── versions.json       # Minecraft version history (1.0–26.1) with year, month, details for catch-up page
│   ├── news.json           # News/changelog entries
│   ├── plugins.json        # Server plugin list
│   ├── rules.json          # Server rules
│   └── modpacks.json       # Modpack definitions with mod lists and import codes
├── hooks/                  # (empty — future custom hooks)
└── lib/                    # (empty — future utilities)
public/
├── textures/               # Minecraft-style textures and assets
├── audio/                  # Background music files
└── cursors/                # Custom cursor images
```

## Running the Project
```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build
npm run start    # Serve production build
npm run lint     # ESLint
```

## Deployment
Not yet configured. Intended for Vercel or similar static/SSR hosting. Domain: mc.pvpers.us

## Current State
**Phase 1-3 complete (structure + all pages scaffolded):**
- All 9 pages are built and rendering
- Parallax background, canvas particle system, music toggle
- Responsive header with mobile menu
- Minecraft-themed design system (colors, fonts, panels, slots, dividers)
- Version Catch-Up timeline (1.0 through 26.1 Tiny Takeover) with two-phase UX: first visit shows year picker ("When did you last play?"), return visits auto-show timeline scrolled to latest year. Year buttons jump-scroll to year sections. Versions grouped by year with gold header markers, each card shows release month. Uses localStorage to track visited state.
- Copy-to-clipboard for server IP
- Cloud effects behind all section headings and description text (CloudTitle, CloudText, CloudTextSmall)
- Modpacks page uses CurseForge import codes (click-to-copy) instead of file downloads
- Guide for adding custom mods, resource packs, and shader packs
- Hero subtitle uses pixel font
- Weather system with rain and thunderstorm effects (random + manual toggle)
- Pixelated rain drops (canvas), lightning bolts (SVG), screen flash, and desaturation
- Weather-aware header (gray bg + light text in light mode during rain)
- All cloud components darken during weather events
- World border expansion system: home page teaser with link, about page has full section (`#world-border`) with tier table (5 tiers, playtime thresholds, block expansion, new-chunk estimates) and bullet-point notes, BlueMap legend explains bounded world with link back to about page
- About page rules are left-aligned with centered heading

**Still placeholder / TODO:**
- Live border widget on home page (needs Stats API to expose current border size and weekly progress)
- Auto-posting news entries on border expansion (needs Stats API)
- BlueMap page has no actual iframe (needs BlueMap URL)
- Leaderboard data is mock (needs Stats API plugin)
- Gallery has placeholder images (needs screenshots)
- Music player has no audio files (needs royalty-free MC-style tracks in public/audio/)
- Thunder sound effects are silent placeholders (need real thunder MP3s in public/audio/thunder1-3.mp3)
- Custom cursor images not yet created (public/cursors/)
- No Minecraft skin renders for staff section (needs Crafatar integration)
- Player heads on leaderboard are placeholder divs
- Page transition loading screen not implemented
- No favicon yet
- Modpack import codes are placeholders (need real CurseForge import codes in modpacks.json)

## Gotchas
- Tailwind 4 uses `@theme inline` for custom values, NOT `tailwind.config.ts` `theme.extend`
- The `@import` order in globals.css matters — Google Fonts must come before Tailwind
- ParticleCanvas uses a MutationObserver to resize with content changes — don't remove it
- Music player stores mute preference as a cookie, not localStorage
- All particle effects run on a single canvas element for performance
- The parallax background is `fixed` positioned — content needs `relative z-20` to sit above it
- Weather z-index layering: ParallaxBackground (z-0) → RainCanvas (z-5) → ParticleCanvas (z-10) → Content (z-20) → Header (z-40) → Lightning flash/bolts (z-50)
- SVG `fill` attribute does not animate with CSS transitions — cloud components use inline `style={{ fill }}` for smooth weather transitions
- Weather desaturation filter is on ParallaxBackground and cloud SVGs only, never on content/text
- `ThunderstormOverlay` renders outside the WeatherProvider filter wrapper so lightning flash is not desaturated
