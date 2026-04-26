# mc.pvpers.us — Project Context

## Tech Stack
- **Framework**: Next.js 16.2.2 (App Router, Turbopack)
- **Language**: TypeScript 5.x (strict mode)
- **Styling**: Tailwind CSS 4 with `@tailwindcss/postcss`
- **React**: 19.2.4
- **Node**: 20.x
- **Package Manager**: npm

## Architecture
Single Next.js app with file-based routing under `src/app/`. Pages are statically generated (SSG) by default; API routes live under `src/app/api/*/route.ts` and are server-rendered on demand. Client components (`'use client'`) are used only where interactivity is needed (particles, music, tabs, copy buttons, poll voting, etc.).

### Key Patterns
- **`@/*` import alias** maps to `./src/*` (configured in tsconfig)
- **Data-driven pages**: Content lives in `src/data/*.json` files and is imported directly into components. No database or CMS yet.
- **Custom CSS classes**: Minecraft-themed utility classes are defined in `globals.css` — `stone-panel`, `inventory-slot`, `mc-tooltip`, `grass-divider`, `enchant-hover`, `typewriter`, `weather-clear`, `weather-rain`, `weather-thunderstorm`
- **Cloud components**: Four tiers — `CloudTitle` (single blocky cloud behind headings), `CloudText` (5 overlapping clouds for multi-line text), `CloudTextSmall` (3 clouds for short 1-2 line text), `CloudTextTiny` (2 clouds for single-line text). All use SVG rects with bumpy top/bottom edges and a breathing animation. All are weather-aware — they desaturate/darken during rain via CSS filter on the SVG element.
- **Weather system**: `WeatherProvider` context manages `clear | rain | thunderstorm` state. Random scheduler (2-5 min intervals, 15% rain / 5% storm chance). `RainCanvas` renders pixelated 2px-wide rectangular drops on a separate canvas at z-5. `ThunderstormOverlay` renders pixelated lightning bolts (90-degree zigzag SVG), full-screen white flash, and plays thunder audio. `WeatherToggle` in Header cycles states manually. Desaturation is applied via CSS `filter` on the `ParallaxBackground` and cloud component SVGs only — text content is never filtered. In light mode, the Header shifts to a gray background with light text during rain.
- **Theme colors**: All defined as `@theme inline` CSS variables in `globals.css` and usable as Tailwind classes (e.g., `text-gold`, `bg-grass`, `text-birch`)
- **Pixel font**: `font-pixel` class uses local Minecraft font with Press Start 2P fallback for headings
- **Body font**: Nunito from Google Fonts for readability
- **Two-preset responsive design**: Single `md:` breakpoint (768px) splits **mobile preset** (< 768px) from **desktop preset** (≥ 768px). No tablet middle state. Mobile-only overrides use the `max-md:` Tailwind prefix so desktop classes are untouched (e.g. `w-8 h-8 max-md:w-11 max-md:h-11`). Universal accessibility additions (viewport meta, `prefers-reduced-motion` guards, `focus-visible:`/`active:` siblings on hover-only states) apply at all sizes but don't visually change desktop. Canvas-heavy effects (`ParticleCanvas`, `RainCanvas`, `ShootingStars`, `ParallaxBackground` scroll listener) probe `window.innerWidth < 768` once on mount and downscale or skip on mobile. Reduced-motion listeners are read-once on mount via `matchMedia('(prefers-reduced-motion: reduce)')` — they do not subscribe to changes.

## File Structure
```
src/
├── app/
│   ├── layout.tsx          # Root layout — Header, Footer, Parallax, Particles, Weather, Music
│   ├── page.tsx            # Home page
│   ├── globals.css         # All global styles, theme, animations
│   ├── about/page.tsx      # About & Rules
│   ├── modpacks/page.tsx   # Modpack import codes (client component)
│   ├── bedrock/page.tsx    # Bedrock interest poll with live counter (client component)
│   ├── bedrock/archived-geyser-page.tsx  # Original GeyserMC how-to-join page, preserved but not routed (rename to page.tsx to restore)
│   ├── api/bedrock-poll/route.ts  # GET/POST endpoint for the Bedrock poll — reads/writes data/bedrock-poll.json, dedupes on sha256(salt + CF-Connecting-IP)
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
data/                       # Runtime state (gitignored). Created at first write by API routes.
└── bedrock-poll.json       # { count: number, voterHashes: string[] }
```

## Running the Project
```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build
npm run start    # Serve production build
npm run lint     # ESLint
```

## Deployment
Runs on a Raspberry Pi, managed by PM2 (`pm2 describe mcpvpers` shows cwd + args), served via Cloudflare Tunnel on port 3002. Domain: mc.pvpers.us. Deploy flow: `git push` from dev, then on the Pi: `git pull && npm run build && pm2 restart mcpvpers`. Because an API route now uses `data/` for runtime state, Vercel/static hosts would need a persistence swap.

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
- Bedrock page replaced with an interest poll (counter + one-click vote, dedupe via localStorage + hashed IP). Original GeyserMC guide preserved at `src/app/bedrock/archived-geyser-page.tsx`.
- Site messaging reframed around peaceful survival with opt-in Lands wars (no "griefing not tolerated" language; claim-based PvP opt-in instead)
- Modpacks page rebuilt around the current QoL + FPS Boost pack lineup. Each mod in `modpacks.json` has `featured` and `category` (`Performance` / `Visuals` / `Quality of Life` / `Libraries`). Cards show the 8 featured mods by default with a name-over-description layout; a "Show all N mods" button expands to the full list grouped by category. Install flow is now 7 steps with an explicit RAM-allocation step (8–10 GB for QoL, 4 GB default acceptable for FPS Boost with expected stutter). A second note reminds players the packs are optional.
- ShootingStars component renders pixelated comets in dark mode during clear weather. Bug fix: the rotated parent applies `transform: rotate(...)` inline while the keyframe animates `transform: translateX(...)` on a nested inner div. Putting translate inside the rotated parent makes motion follow the tilt so the tail trails correctly behind the head. See Gotchas.
- `/map` page embeds BlueMap in an iframe pointing at `/bluemap/`. nginx proxies that path with `sub_filter` rules to rewrite BlueMap's four absolute-path fetches (`/settings.json`, `/textures.json`, `/live/...`, `/assets/playerheads/...`) into `/bluemap/...`. **Important:** the live mc.pvpers.us survival server is hosted on DatHost, not the Pi — see top-level `~/projects/CLAUDE.md`. The current nginx target is a placeholder (`127.0.0.1:8100` = Pi dev mirror) and must be updated to the DatHost public endpoint for production use.
- Mobile responsiveness pass: `viewport` export added to `layout.tsx` (`width=device-width, initialScale=1, viewportFit=cover`). Header hamburger, `WeatherToggle`, `ThemeToggle`, `MusicPlayer` enlarged to ≥44px on mobile only via `max-md:`. Hamburger now sets `aria-expanded`; menu closes on Escape. `LeaderboardsPage` grid wrapped in `max-md:overflow-x-auto` with a `max-md:min-w-[320px]` inner shell, mobile-only narrower rank column / gap / padding, and player name `max-md:truncate`. `/map` iframe shrunk to `max-md:h-[60vh] max-md:min-h-[360px]`; legend panel narrowed to `max-md:w-52`. Particle counts: 25 → 10 on mobile (single check at mount). Rain drops: 450/800 → 180/280 on mobile (rain/storm). Shooting-star spawn chance halved and interval doubled on mobile. Parallax scroll listener disabled on mobile and on `prefers-reduced-motion: reduce`. Hover-only `.mc-pill` and `.hover-surface` rules now also fire on `:focus-visible` with `:active` tap-feedback siblings.

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
- SVG `fill` set via attribute DOES animate with CSS transitions if the transition is declared on a CSS rule targeting the element (e.g. `.cloud-fade rect { transition: fill 1.5s; }` in globals.css). Attribute-set presentation properties are treated as CSS properties by the browser. The four cloud text components use the `cloud-fade` class so theme toggle fades cloud fill in sync with the sky crossfade (both 1.5s ease-in-out). Weather transitions use `filter` on the SVG element directly.
- Pixelated cloud SVGs need `shapeRendering="crispEdges"` on the `<svg>` or the browser anti-aliases the shared edges between adjacent `<rect>` elements, producing a visible grid pattern at certain pixel densities / zoom levels. Present on all four cloud text components and the parallax sky-clouds SVG.
- Weather desaturation filter is on ParallaxBackground and cloud SVGs only, never on content/text
- `ThunderstormOverlay` renders outside the WeatherProvider filter wrapper so lightning flash is not desaturated
- Mobile/desktop boundary is **only** `md:` (768px). Use `max-md:` for mobile-only overrides — never edit existing base classes that already render correctly on desktop. `sm:`/`lg:`/`xl:` should not be introduced for the mobile pass; they create a tablet middle state we explicitly don't support.
- Canvas effects (`ParticleCanvas`, `RainCanvas`, `ShootingStars`) read `window.innerWidth < 768` once at mount to pick particle/spawn counts. Resizing past the breakpoint at runtime does NOT re-evaluate — this is intentional (a phone doesn't suddenly become a desktop). Same pattern applies to the `prefers-reduced-motion` check.
- `RainCanvas` reads the mobile/motion check inside the `weather` effect (not the mount effect), so changing weather re-applies the correct cap.
- Don't add `hover:` Tailwind classes to interactive controls without `focus-visible:` and `active:` siblings — touch users get no feedback otherwise. The CSS-class versions (`.mc-pill`, `.hover-surface`) already include both.
- API routes that write runtime state use a module-level promise chain (`writeLock = writeLock.then(...)`) to serialize writes and prevent race conditions on the JSON file. See `src/app/api/bedrock-poll/route.ts` for the pattern.
- Files in `src/app/*/` that are not named `page.tsx`, `layout.tsx`, `route.ts`, etc. are ignored by Next.js routing but still type-checked. Used for archiving old page content alongside its replacement (e.g. `bedrock/archived-geyser-page.tsx`).
- CSS individual transform properties (`translate` / `rotate` / `scale`) compose with the `transform` shorthand in a fixed order: `translate` → `rotate` → `scale` → `transform`. When combining them, the individual properties are applied *before* the shorthand, which can produce surprises. In `ShootingStars.tsx` the inline `transform: rotate(Xdeg)` paired with a keyframe animating the `translate` property caused the comet to tilt but slide purely horizontally — tail trailed straight back while the head pointed down-and-right. Fix: nest the animated element inside the rotated parent and animate `transform: translateX(...)` so the translate runs in the rotated coordinate space.
