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
- Pre-launch polls page (`/polls`) covering plugins, gameplay, events, server settings, and progression. Storage auto-switches between Redis (when `REDIS_URL` is set) and a JSON file at `data/polls.json`, with one-vote-per-poll dedupe and a 3-vote-per-IP cap. Polls auto-close at a single timestamp (`POLLS_CLOSE_AT` in `src/lib/polls.ts`, currently Thu May 21 11:59 PM Arizona) — the vote API returns 403 past that instant, and the UI swaps to read-only results with a per-poll "Closed" badge without needing a refresh
- Cloud text effects behind headings and descriptions (CloudTitle, CloudText, CloudTextSmall, CloudTextTiny)
- Dynamic weather system — random rain and thunderstorms with pixelated rain drops, lightning bolts, screen flash, and full-page desaturation
- Manual weather toggle in the header (cycles clear/rain/thunderstorm)
- Weather-aware UI — header, clouds, and background shift to moody gray tones during rain (light mode)
- Occasional shooting stars streak across the night sky in dark mode during clear weather (pixelated comet + fading tail, motion aligned to the tilt)
- World border expansion system explained across home (teaser), about (full tier table with new-chunk estimates), and BlueMap (legend) pages. The tier table is now dynamic — thresholds scale with active player count via the plugin's scaling exponent, and a "Preview" row of buttons (1p / 2p / 3p / 5p / 10p) lets visitors see what the requirements look like at different participation levels
- Launch countdown on the home page (target: Saturday May 23, 2026 at 5 PM Arizona) — ticks down to days/hours/min/sec, swaps to a "We're live" tile at zero
- Live server status (online player count, polled every 30s) below the home-page IP copy, fed by the PiStatsAPI plugin via a server-side proxy — hidden until the launch timestamp passes, then auto-activates without a refresh
- Live world-border widget on the about page (current radius, weekly playtime, active players, total expansions), fed by the same proxy
- Leaderboards backed by real player data (Playtime / Deaths) with mc-heads.net player avatars
- Reputation system explainer (`/reputation`) — covers Pacifist / Outlaw / Lawman roles, the three rep pools, claims vs wilderness, knockout mechanics, bounty flow, all commands, and a long FAQ. Deep content collapsed behind animated expanders (smooth open/close via `grid-template-rows` + opacity fade, full-row `<button>` hitbox, `aria-expanded` + `aria-controls`, `prefers-reduced-motion` honored) so the page reads as a quick skim with optional dives
- Wanted poster board (`/wanted`) — hybrid oak-frame + parchment posters with crisp pixel player heads, color-coded tier label (Drifter → Bandit → Outlaw → Notorious → Legend), bounty in diamonds, posted-by line, crime tally, and last-seen footer. Tilted "tacked to a board" layout, lifts on hover, respects `prefers-reduced-motion`. Data is shaped to match the eventual `/api/stats/wanted` plugin payload so the page just swaps its import for a fetch when the rep system ships
- mcMMO explainer (`/mcmmo`) — full breakdown of 15 skills (Gathering / Combat / Crafting & utility), passive bonuses, active abilities, commands, getting-started tips, and how mcMMO interacts with the reputation system. Same expander pattern as `/reputation`
- BlueMap embed with legend explaining the world border. Land-claims overlay is intentionally disabled at launch (we're not feeding claim outlines to BlueMap yet); the legend block is commented out in `src/app/map/page.tsx` pending a post-launch poll
- Screenshot gallery and news/changelog pages
- Two-preset responsive design: a single `md:` breakpoint (768px) splits the **mobile preset** from the **desktop preset** — mobile gets enlarged touch targets, throttled canvas effects, narrower BlueMap legend, and shorter map iframe; desktop is untouched. Honors `prefers-reduced-motion` (skips the parallax scroll listener, particles, rain, and shooting stars)

## Launch-prep work (2026-05-21)

Polls closed Thursday night before the May 23 launch. The site was flipped from pre-launch voting voice to post-vote, system-is-live voice in one pass:

- **`/polls`** — added a "What the community decided" summary block (shown when `arePollsClosed()` returns true) grouped into three buckets: Live at launch, Coming later (boss raids, weekly events, jobs, quests), and Still being decided (End unlock). Decisions live in `src/data/poll-results.json` so the wording is editable without code changes. Each summary card jumps to its corresponding vote-count card via `#pollId` anchor
- **`/reputation`** — hero flipped from "vote on it" to "Live as of launch." Bottom CTA changed from "Vote on the cowboy poll" to "See the poll result"
- **`/about`** — added a "What's live at launch" section (id=`whats-live`, linked from home blurb) with 10 expanders in three groups: Plugins (reputation, mcMMO, Lands with the `MONSTER_SPAWN` off tip, Graves & death), World rules (combat/PvP/heads, sleep/phantoms/mob-griefing, Nether/End), and Coming later (Wars currently off with reasoning, community boss raids, jobs/quests/economy). War-system language stripped from the intro/why-one-rule/what's-next sections. Plugins grid gained a one-line credit explaining which entries are in-house (carsonxd) versus community plugins
- **`/`** — "Nations & war" feature card replaced with "Frontier reputation" (linkable to `/reputation`). Server Info "Features" tile updated from "Claims, Nations, War" to "Reputation, mcMMO, Lands". Polls CTA flipped to "Polls closed — see what the community voted in"
- **`/mcmmo` (new)** — mirrors the `/reputation` page structure: hero, simple-version rules, three skill-group cards, expanders for every skill line-by-line, commands, getting-started tips, and how mcMMO plays with the reputation system
- **`src/data/plugins.json`** — rebuilt to reflect the actual launch lineup (Lands, Reputation, mcMMO, Graves, Heads, Border, Tab, Stats API, Mail, Trade, Announcements, CoreProtect, LuckPerms, EssentialsX, BlueMap, DiscordSRV). The Pi* internal prefix was dropped from user-facing names; the in-house plugins are tagged with "In-house." in their descriptions instead. (PiSpawn dropped — not in use)
- **`/wanted`** — PREVIEW badge renamed to SAMPLE, hero copy flipped from "in the vote" to "live at launch." A "Top Lawmen" callout strip was added between the hero and the poster board: top 3 lawmen as vertical cards (80px head, name, color-coded tier, three-stat row showing Kills / Commends / Donated). Backed by the same mock-data pattern (`preview: true` in `src/data/reputation-leaderboards.json`) so it swaps to live data when the rep API endpoint wires in. Big top padding (`pt-48`) pushes the strip below the fold so the hero gets its own viewport first. Lands `/lands ban` reference removed from the about page per "we're turning off Lands ban for now"
- **`/leaderboards`** — three new rep tabs at the end of the row: Peaceful Rep, Violence Rep, Lawmen. Peaceful / Violence display numeric rep totals; Lawmen shows the tier name (Marshal → Citizen, color-coded) plus the commendation count. The rep tabs read from `src/data/reputation-leaderboards.json` instead of the API since the proxy allowlist doesn't include reputation paths yet — flip `preview: false` (or extend the proxy and swap to a fetch) when the plugin endpoint is wired. SAMPLE strip shown above the table while in preview mode
- **Em-dash sweep** — heavy reduction of em-dashes across all the launch-prep copy, replaced with periods, colons, parens, or rewording per stylistic preference

## Plugin lineup refinements (2026-05-22)

Day-before-launch cleanup pass: plugin lineup adjusted to match what's actually shipping, the `/about` launch section got two new explainer expanders, and the footer picked up the new pages.

- **`src/data/plugins.json`** — added Mail, Trade, Announcements as in-house plugins (Pi-prefix dropped from user-facing names, same as the other in-house entries). PiSpawn entry dropped (not in use). Tab description rewritten to match the actual columns: session/all-time playtime, deaths, ping, server TPS (rep tier column not in yet)
- **`/about` section rename** — "What's live at launch" heading renamed to "Plugins & world rules" since the section also covers world rules and coming-later items. Intro reworded to drop "Every system below was decided by community vote" — not every entry was. New version reads "Many of these systems were voted in by the community. Tap any topic for an explanation and use case. Full vote counts on the polls page."
- **`/about` new expanders** — two new entries added to the Plugins subsection under the launch section. "Quality of life: mail, trade, announcements" with one bullet per plugin. "Commands you'll actually use" as a cheat sheet for `/home`, `/sethome`, `/tpa`, `/tpaccept`/`/tpdeny`, `/spawn`, `/back`, `/msg`, `/mail`, `/trade`, `/lands`, with a trailing note explaining what the Tab list shows and defining TPS
- **`components/Footer.tsx`** — Links column expanded from 4 to 8 entries to cover the new pages on this branch: Reputation, mcMMO, Polls, Wanted added alongside About & Rules, Modpacks, Leaderboards, BlueMap
- **Knockout polls drafted (this README, commented out)** — six future-poll IDs sketched out for revisiting the pacifist knockout mechanic a few weeks post-launch: `knockout-scope`, `knockout-duration`, `knockout-finishable`, `knockout-area`, `knockout-revive`, `knockout-cooldown`. Kept in an HTML comment block at the end of "Future polls" so they don't get rolled into the active future-polls list until we decide which to keep

### Future polls (post-launch)

Tracked in `src/data/future-polls.json` so they're not forgotten. Not loaded by any route. Move an entry into `src/data/polls.json` and bump `POLLS_CLOSE_AT` when re-opening voting:

- **`lands-map-overlay`** — Show Lands claim outlines on BlueMap? (currently off — the legend block on `/map` is commented out pending this vote)
- **`end-unlock`** — When should the End unlock? (locked at launch regardless of the pre-launch vote; re-vote with grounded context)
- **`quests-plugin`** — Which quests plugin? (Quests won 'yes' pre-launch but didn't ship day one)
- **`jobs-plugin`** — Which jobs plugin? (Jobs won 'later-after-economy' pre-launch)

<!--
### Knockout tuning polls (drafted, post-launch)

To re-vote on how the pacifist knockout mechanic actually feels in play. Hold these for a few weeks after launch so we have lived-in feedback, then drop into `polls.json` and bump `POLLS_CLOSE_AT`. Not on the polls page yet.

- **`knockout-scope`** — Who gets the pacifist knockout treatment? Only Pacifist rep tier (current behavior), or all players regardless of tier?
- **`knockout-duration`** — How long should a knocked-out player stay down before they respawn or wake?
- **`knockout-finishable`** — Can another player finish off a knocked-out player for the full kill, or do they always come back?
- **`knockout-area`** — Does knockout apply everywhere, only in the wilderness, or only inside claims?
- **`knockout-revive`** — Can a teammate revive a knocked-out player before the timer runs out?
- **`knockout-cooldown`** — Cooldown before a player can be knocked again after waking up?
-->

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
- `src/data/` — JSON content files (rules, plugins, versions, news, modpacks, polls, poll-results, wanted, reputation-leaderboards, future-polls)
- `data/` — Runtime state (poll counts, etc.) — gitignored, created at first write
- `public/` — Static assets (textures, audio, cursors)

## Credits

Built by [Carson Caplan](https://carsoncaplan.com) — see carsoncaplan.com for more projects.
