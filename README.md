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
- Leaderboards backed by real player data, split into a **Vanilla** section (Playtime, Deaths, Mob Kills, Blocks Mined, Ores Mined, Distance, Advancements, XP Levels) and a **Plugins** section (Power Level, Peaceful/Outlaw/Violence Rep, Lawmen, Commendations, plus broad **Event Score** and **PvP Wins** totals) via a top `[Vanilla] [Plugins]` toggle, with mc-heads.net player avatars. The granular Boss Rush / PvP role boards live on the `/events/*` tabs; only the broad totals surface here. Served from a warm in-process snapshot (`src/lib/leaderboardSnapshot.ts`) that refreshes in the background, so tab switches are instant and slow upstream calls never sit on a visitor's load. Each tab shows 50 rows, a "Load more" expands to 100, and beyond 100 ranks paginate. Top three ranks are colored gold / silver / bronze. Every player row links through to a full per-player stat profile (`/player/<username>`)
- Per-player stat profiles (`/player/<username>` — UUIDs work too) — player head, name, online/last-seen, and a reputation state/tier badge; a stats grid showing each stat's value **and** the player's server rank (Playtime, Blocks Mined, Mob Kills, Ores Mined, Distance, XP Levels, Advancements, Deaths, Commendations); a reputation panel (peaceful / violence / outlaw pools); an mcMMO skills panel showing each skill's level **and** its server rank ("#3 of 32"), plus the aggregated Power level's rank; and the in-game-style advancements grid grouped by category. Reads from the same warm leaderboard snapshot, so it loads in ~0.1s
- Reputation system explainer (`/reputation`) — covers Pacifist / Outlaw / Lawman roles, the three rep pools, claims vs wilderness, knockout mechanics, bounty flow, all commands, and a long FAQ. Deep content collapsed behind animated expanders (smooth open/close via `grid-template-rows` + opacity fade, full-row `<button>` hitbox, `aria-expanded` + `aria-controls`, `prefers-reduced-motion` honored) so the page reads as a quick skim with optional dives
- Wanted poster board (`/wanted`) — hybrid oak-frame + parchment posters with crisp pixel player heads, color-coded tier label (Drifter → Bandit → Outlaw → Notorious → Legend), bounty in diamonds, posted-by line, crime tally, and last-seen footer. Tilted "tacked to a board" layout, lifts on hover, respects `prefers-reduced-motion`. Fetches live outlaws from the plugin's `/api/reputation/wanted` endpoint via the stats proxy; when the board is empty, a single `EXAMPLE` poster is shown as a "this is what one looks like" placeholder rather than three mock posters
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

## Reputation + wanted board wired to live data (2026-05-23)

Launch-day pass: the rep leaderboard tabs and the wanted poster board both came off mock JSON and onto the plugin's live endpoints. Plugin side is shipping in parallel (the reputation context now lives at `/api/reputation` upstream, with new `/leaderboard/peaceful`, `/leaderboard/violence`, `/leaderboard/lawmen`, and `/wanted` handlers).

- **`src/app/api/stats/[...path]/route.ts`** — added `reputation` to `ALLOWED_KINDS`. The catch-all proxy now passes `/api/stats/reputation/leaderboard/<peaceful|violence|lawmen>` and `/api/stats/reputation/wanted` straight through to the upstream's reputation context, with the same 30s revalidate + Cloudflare edge caching as the existing stats paths
- **`/leaderboards`** — the three rep tabs (Peaceful Rep, Violence Rep, Lawmen) now fetch live via the proxy instead of reading from `src/data/reputation-leaderboards.json`. The `isRep` / `displayLoading` / `displayError` branching collapsed away — all 11 tabs share one fetch + render path. The SAMPLE / "Illustrative data" banner is gone. Until the plugin ships the rep handlers, the tabs land in the standard "Couldn't load leaderboard" empty state rather than a mock fallback
- **`/wanted`** — converted from a server component reading `src/data/wanted.json` to a client component fetching `/api/stats/reputation/wanted` on mount. The Quick stats strip (Wanted count, Total bounty, Highest tier) now derives from the live list — empty list reads `0 / 0◆ / none`, which is its own "this is live, the board just spun up" signal. The hero's SAMPLE banner was dropped (the example poster carries that meaning now)
- **Empty-board fallback** — when the wanted fetch returns an empty list or errors, the board renders **one** `EXAMPLE` poster (clearly badged in the top-right corner) with a caption explaining real ones populate as players cross the rep threshold. Prefer one illustrative card over three mock ones — keeps the page from feeling spammy or fake-busy. The example data lives inline in `src/app/wanted/page.tsx` (no JSON file)
- **`src/components/TopLawmen.tsx` (new)** — the "Top Lawmen" callout on `/wanted` was extracted out of the page (which is now client-side anyway) into its own client component that fetches the lawmen leaderboard directly. The three-stat row (Kills / Commends / Donated) collapsed to a single centered commendations count, since the plugin's lawmen payload only exposes `{ rank, uuid, name, tier, commendations }` — outlaw kills and donated diamonds aren't tracked separately in the rep system
- **Plugin contract (server-side, coordinated, not in this repo)** — for `/api/reputation/wanted` the plugin normalizes its native shape into the page's `Outlaw` type: emits `uuid`, renames `outlaw_rep` → `outlawRep`, `bounty_total_diamond_eq` → `bountyDiamonds`, and `top_crimes` `[{type, count}]` → `crimes` `[{kind, count}]`. `bountyMultiplier` is derived from tier (Drifter 1.0 / Bandit 1.5 / Outlaw 2.0 / Notorious 2.5 / Legend 3.0) per `PiReputation` config. `lastSeenMinutes` comes from `(now - last_seen_ts) / 60_000` clamped ≥ 0. `postedBy` always returns `"Sheriff's Office"` (Phase A bounties are auto-posted from the treasury, no human placer to attribute)
- **Deleted** — `src/data/reputation-leaderboards.json` and `src/data/wanted.json`. The README's `src/data/` reference was updated accordingly

## Player advancements page + leaderboard polish (2026-06-01)

Clickable leaderboard rows now lead to a per-player advancements page, plus an Outlaw Rep tab and decimal rounding on the rep columns.

- **`/leaderboards` — Outlaw Rep tab** — a 12th tab added between Peaceful Rep and Violence Rep. The plugin has no global outlaw-rep leaderboard endpoint (`/reputation/leaderboard/outlaw` 404s), so this tab sources from the existing `/api/stats/reputation/wanted` payload, which already returns players ranked by `outlaw_rep` descending. Mapped into the standard leaderboard row shape (rank by index, top 10). Caveat: the wanted board only includes players above the 25-rep Drifter threshold, so it lists wanted outlaws by rep rather than every player's outlaw rep — for an "Outlaw Rep" board that's the right population anyway. Swapping to a true full-roster endpoint later is a one-line change (drop the special case, add it to `repEndpoints`)
- **`/leaderboards` — rep rounding** — Peaceful / Violence / Outlaw Rep values now render via `toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })`, so the raw floats (e.g. `56.8166…`) show as `56.8`. Lawmen (tier name) and the count-based tabs are unaffected
- **`/leaderboards` — clickable rows** — the avatar + name cell is now wrapped in a `next/link` to `/player/<uuid>` when a `uuid` exists. Reputation rows can carry `uuid: null`; those stay as a plain non-clickable `<div>`
- **`src/app/player/[uuid]/page.tsx` (new)** — client component rendering a player's advancement progress. Header shows the player head, name, completed/total + percent, and (best-effort) playtime / deaths / online from the player summary endpoint. Body is the in-game-style grid grouped by category (Minecraft, Nether, The End, Adventure, Husbandry) with tiles styled by frame (task/goal/challenge), dimmed until earned, a ✓ on completed and ★ on challenges, and the description on hover. No proxy change needed — `/api/stats/players/<uuid>/advancements` already routes through the existing catch-all (`players` is allowlisted). One deviation from the handoff: the in-effect `setLoading(true)`/`setError(null)` resets were dropped because they trip the project's `react-hooks/set-state-in-effect` rule; the page is only ever mounted fresh from a leaderboard row, so initial state covers the single fetch per mount
- **Item icons** — the advancements payload carries a Bukkit `Material` name per advancement, but no item-texture asset is wired into the site yet, so tiles use frame-color + ✓/★ styling instead of true item sprites. The `icon` field is already there to map against if a sprite sheet is added later
- **Backend dependency** — the player page needs `PiStatsAPI-1.1.0.jar` (adds `GET /api/players/<uuid>/advancements`) deployed to DatHost **and a server restart**. Until then the endpoint 404s and the page shows its "server may be restarting" error state

## Stat profiles, leaderboard caching, pagination & commendations (2026-06-02)

A larger evening pass: the per-player page grew from an advancements view into a full stat profile, the leaderboards moved onto a warm server-side snapshot with pagination, profiles became linkable by username, and a commendations board was added — all without a plugin rebuild. Throughout, the recurring lesson was that `blocks_mined` is computed live upstream and takes ~21s per call (every other stat is sub-second), so it always has to be kept off a visitor's critical path.

- **`src/lib/leaderboardSnapshot.ts` (new) — warm in-process snapshot** — holds every leaderboard board in module memory, refreshed lazily with stale-while-revalidate (3-min TTL): a cold start awaits only the fast boards (~0.5s), a stale snapshot is served instantly while it refreshes in the background. `blocks_mined` is fetched on a separate slow track (28s timeout) and merged in when it lands, only overwriting on real data so a timeout never blanks it. Shared by both the leaderboards route and the profile route. `getSnapshot()` / `rowFor()` are the public surface
- **`/api/leaderboards-snapshot` (new)** — thin route that serves the snapshot, edge-cached (`s-maxage=60`) so most hits never reach the process
- **`/leaderboards` — one snapshot fetch, instant tabs** — the page fetches the snapshot once instead of hitting the proxy per tab. Tab switches are now instant, an "Updated Xm ago" line shows freshness, and `blocks_mined` gets a brief "warming up" state right after a restart. Diagnosis that drove this: every tab is sub-second except `blocks_mined` (~21s), and the old 30s/5s-timeout proxy could never even load it
- **`/leaderboards` — 50 / Load more / pagination** — the snapshot pulls the full roster per stat board (`limit=1000`); the page shows 50, a "Load more" button reveals up to 100, and beyond 100 ranks paginate in pages of 100 (Prev/Next + an "N–M of T" counter). Ranks/medals use absolute rank across pages; switching tab/window/page resets the reveal. **Caveat:** the reputation boards (peaceful/violence/lawmen) are hard-capped at 10 upstream — `limit` is ignored there — so those tabs max out at 10 until the plugin lifts the cap. Outlaw (derived from `/wanted`) and the stat boards are uncapped
- **`/leaderboards` — gold / silver / bronze** — `#2` and `#3` are now silver and bronze instead of plain gray. Added `--color-silver` / `--color-bronze` theme colors and matching dark-mode `.glow-silver` / `.glow-bronze` classes in `globals.css`
- **`src/app/api/player-profile/[uuid]/route.ts` (new) — profile aggregator** — the upstream has no rich single-player endpoint, so this assembles one. It resolves the route param (UUID **or** username, case-insensitive) against the roster, reads each stat's value + server rank straight from the warm snapshot (no per-view leaderboard fetches), and makes just two quick upstream calls: the roster (online status + name↔uuid) and reputation (keyed by name). Unknown names return `found: false`
- **`/player/<id>` — full stat profile** — rebuilt from the advancements-only page into: header (head, name, online/last-seen, state/tier badge), a stats grid (value + server rank per stat, including `blocks_mined` and `commendations`), a reputation panel (three rep pools + state), and the existing advancements grid. A skeleton loading animation mirrors the layout so nothing jumps when data lands
- **Username URLs** — `/player/<username>` resolves (the aggregator maps name→uuid; advancements are then fetched by the canonical uuid since the upstream advancements endpoint is uuid-only and returns empty for a name). Leaderboard rows link by username for readable URLs; UUID links still resolve. Trade-off: a bookmarked `/player/<oldname>` breaks if a player changes their Minecraft name — UUIDs never do
- **Why profiles were slow / missing stats (fixed)** — the first cut of the aggregator re-fetched all 7 stat leaderboards from upstream on every view under a 5s timeout; from the Pi those parallel fetches timed out, so only Playtime + the separately-fetched Blocks Mined showed, and loads dragged. Moving to the shared snapshot fixed both — all stats now resolve from one consistent source in ~0.1s warm
- **Commendations (no plugin rebuild)** — there's no upstream commendations leaderboard endpoint, so the snapshot builds one website-side: it fans out `/reputation/player/<name>` across the roster and ranks by `unique_commenders_90d` (a "most commended lately" board). Surfaced as a new **Commendations** leaderboard tab and a profile stat card (value from the player's own reputation, rank from the board). Scales linearly with roster size — one rep call per player per refresh, fine at current scale; a dedicated plugin endpoint would be the move if the roster grows large
- **Header z-index fix** — the profile's state/last-seen line was painting *behind* the `CloudTitle` cloud (an absolutely-positioned, downward-offset SVG at `z-index: 0`). Lifted the line with `relative z-10`, the same trick the heading text already uses

## Per-skill mcMMO ranks on profiles (2026-06-03)

Each player's mcMMO skill (and the aggregated Power level) now shows its server rank — "Mining 702 · #1 of 32" — on the profile page. The upstream has no per-skill leaderboard (only the aggregated `power_level`; `leaderboard?stat=mining` returns `Unknown stat`), so the ranks are built website-side, no plugin rebuild needed.

- **`src/lib/leaderboardSnapshot.ts` — per-skill boards** — new `fetchSkillBoards()` fans out `/players/<uuid>/skills` across the roster (one call per player, same pattern/scale as the commendations board), groups the results by mcMMO skill, and ranks each into its own board keyed `skill:<SKILL_ENUM>` (e.g. `skill:MINING`) by level descending. Merged into the warm snapshot alongside the existing boards, so profiles read a skill rank straight from memory with no per-view fetch. **Caveat:** the refresh now runs two roster fan-outs concurrently (commendations + skills ≈ 64 upstream calls every 3-min TTL) — fine at 32 players, but a real per-skill plugin endpoint is the move if the roster grows large
- **`src/app/api/player-profile/[uuid]/route.ts` — `skillRanks` map** — the profile aggregator (which already holds the snapshot) now returns a `skillRanks` map of `<SKILL_ENUM>` → `{ rank, total }`, plus a `POWER_LEVEL` entry sourced from the existing `power_level` board. `total` is the roster size, matching the "of 32" framing
- **`/player/<id>` — rank labels** — each skill tile shows its `#N of <roster>` rank under the level, and the mcMMO Power header gained its rank too. Shared `RankLabel` reuses the stats grid's gold `★ #1` styling. Ranks render only on skills the player has actually trained (level > 0) — a skill sitting at 0 just shows the level, no rank clutter

## Boss Rush events page + per-player event stats (2026-06-06)

A full Boss Rush (PiEvents) section landed: a live `/events` hub with per-role leaderboards, a raid log, and a summary banner; six statically-generated per-raid pages with boss mechanics and full loot tables; and a Boss Rush block on player profiles. Backed by PiStatsAPI 1.3.0's `/api/events/*` endpoints. Everything degrades to "not live yet" when PiEvents isn't reachable, so the site is safe to ship before the plugin does.

- **`src/app/api/stats/[...path]/route.ts`** — `events` added to `ALLOWED_KINDS`, so `/api/stats/events/*` passes through to the upstream (used by the profile route for the authoritative per-player event line)
- **`src/lib/eventsSnapshot.ts` (new) — warm events snapshot** — same pattern as `leaderboardSnapshot.ts`: one in-memory snapshot holding the seven role boards (`/categories`), the summary banner (`/summary`), and the recent-runs feed (`/recent`), refreshed in the background (60s TTL). When every endpoint is unreachable (503 on old PiStatsAPI / missing PiEvents `stats.db`) the snapshot is flagged `available: false`. `getEventsSnapshot()` / `eventRowFor()` are the public surface
- **`/api/events-snapshot` (new)** — thin edge-cached route serving the snapshot (`s-maxage=60`)
- **`/events` (new) — the hub** — summary banner (runs / clears / clear rate / paid out / players / last run), the seven **role boards** (Score, Damage, Boss Damage, Tank, Support, Adds, Clears) as instant-switching tabs sourced from the one snapshot, a **raid log** (Cleared/Wiped · players · wave · time-ago), and **The Raids** grid: six clickable tiles labeled **Tier 1–5** (derived from `rank`) plus a **Duel** tile, each linking to its detail page. Below: a shared-mechanics panel (3 HP phases + Fixate/Summons/Enrage/Taunt), a "How loot drops" panel (epic to the podium, 35% upgrade-to-rare, common otherwise), and the payouts/score-weights panel. Hidden behind a "Boss Rush isn't live yet" state until the snapshot reports `available`
- **`/events/[slug]` (new) — per-raid pages** — statically generated via `generateStaticParams` (one page per boss id, e.g. `/events/vexspinne`), with `generateMetadata` so shared links read "Vexspinne, the Broodmother · The Hollow Hive — Boss Rush". Each page: boss header (icon, tier badge, raid · mob, description), a "The Fight" panel (phases + signature moves + shared mechanics), the full **loot table** grouped EPIC / RARE / COMMON with enchants + lore on every item, and prev/next tier navigation
- **`src/lib/bossDisplay.ts` (new)** — shared `Boss`/`LootDrop` types, per-boss accent map, official rarity colors (epic `#AA00AA` / rare `#5555FF` / common `#55FF55`), `tierLabel()`, `bossBySlug()`, and the shared-mechanics list — imported by both the client hub and the server detail pages so they can't drift
- **`src/data/bosses.json` (new)** — the six raids (Mortrax's Tomb → The Pale Court → The Hollow Hive → The Ashbound Throne → The Grand Conclave, plus the Champion of the Pit duel). Each carries the boss's mob, signature moves, and a 12-item loot table (3 epic / 4 rare / 5 common) with exact enchants and lore lines
- **`src/app/api/player-profile/[uuid]/route.ts` — `events` + `eventRanks`** — the profile aggregator now reads the events snapshot too: it returns the player's full event stat line (fetched from `/api/events/player/<name>`, authoritative even outside any board's top-25) plus per-role ranks pulled from the snapshot's role boards. Both null/empty when PiEvents isn't live
- **`/player/<id>` — Boss Rush section** — for players who've joined at least one run, a new panel shows role stat cards (Score / Damage / Boss Damage / Damage Taken / Healing / Adds) with `#N of M` ranks, a runs/clears/best-score header, and a survivals / lives-lost / earnings footer. Hidden for non-participants and when PiEvents is down
- **`components/Header.tsx`** — nav gained a **Boss Rush** link (`/events`)
- **Backend dependency** — needs **PiStatsAPI 1.3.0** (the `/api/events/*` surface) shipped to DatHost **and** PiEvents live. Until both land, every events endpoint returns 503, the `/events` page shows its "not live yet" state, and the profile section stays hidden. The boss/loot content is static, so the raid pages render regardless

## Leaderboards Vanilla/Plugins split + gear badges (2026-06-07)

Split the flat 14-tab `/leaderboards` into a top `[Vanilla] [Plugins]` toggle so vanilla survival stats and plugin/progression stats read as distinct sections. Added two broad event boards — **Event Score** (Boss Rush `total_score`) and **PvP Wins** — under Plugins, keeping the granular role boards (Damage/Tank/Support/Adds/K-D/Killstreak/MVPs) on the dedicated `/events/boss-rush` and `/events/pvp` tabs. Both event boards source from new `events/leaderboard?stat=score` / `events/pvp/leaderboard?stat=wins` fetches in `leaderboardSnapshot.ts` and degrade to empty until PiStatsAPI 1.7.0 ships to DatHost. On the player profile, added gear-mode badges (KIT/BYOG/HARDCORE) to recent runs/matches — the last open item from the events handoff §7; `gear_mode` already flows through the profile aggregator untouched, so this was types + a `GearChip`.

## Economy live data, Raid Keys, loot refresh & daily streaks (2026-06-10)

Batch applying the 06-10 handoff updates (PiShop 1.3.0 / PiStatsAPI 1.11.0 / PiEvents raid keys + wipe rule / PiReputation 1.7.0 daily rewards). Everything new is gated or self-hiding, so it's safe ahead of the DatHost ship:

- **`/economy` — live shop panels** — `shop` added to the proxy allowlist; new self-hiding client components fetch the PiShop API: `ShopCatalogLive` (per-category live price table from `/api/shop/catalog` — buy price, demand-adjusted sell price, demand bar), `ShopDeals` (Today's Deals strip + pulsing black-market OPEN NOW panel with per-window stock, from `/api/shop/deals`), and `MarketListings` ("for sale right now" from `/api/shop/market`). Static copy added for daily deals, the black market's fixed windows (Tue & Fri 9 PM–midnight), and sign shops; the faucet/sink section now covers Raid Key start fees (the biggest repeatable sink) and the wipe-pays-nothing rule. `/api/shop/history` (price-trend sparklines) is exposed upstream but not rendered yet
- **`/economy` — daily login rewards** — section corrected to the real PiReputation 1.7.0 numbers: $100 day 1 climbing to $500 at a 14-day streak, streak-tier loot, milestones on days 3/7 and a recurring god-apple milestone every 14 days, UTC-midnight (5 PM Arizona) rollover footnote. New `StreakBoard` component renders a "Longest Login Streaks" board from `/api/reputation/leaderboard/streaks` (PiStatsAPI 1.8.0, 503 until ship → hidden), honoring `streak_active` (🔥 = alive). `/daily` added to the `/reputation` command table; profiles show a "🔥 N-day login streak" / "Best: N days" line when the 1.8.0 fields are present
- **`src/data/bosses.json` — full loot refresh** — all four tiers replaced for all six raids with the 06-10 authoritative tables (rename rework, spears, Court Herald's Warmace rare→epic, 13 themed tools incl. Fortune/Silk Touch picks and a fishing rod; every Pitforged a strict enchant-superset of its epic, on the same item)
- **Boss Rush page** — new ⚷ **Raid Keys** explainer panel (`/event key`, $150 × (Pit+1) start fee sunk win or lose, 3 starts/day, key depletion on wipes, free joins, 0.75× payouts); wipe-pays-nothing copy in the loot + payouts panels ("clear or nothing"); Gauntlet rows in the raid log render as gold "Wave N · The Gauntlet" instead of a red Wiped failure
- **Gear-mode chips everywhere events render** — shared `GearChip` component (profile's local copy replaced); BYOG/HARDCORE chips on the raid log and PvP match log rows, all-modes chip + description on the run-detail header and the live banner. PvP page gained a gear-modes explainer panel
- **Live banner** — detects player key runs by the `/-key-p\d+$/` name suffix and swaps to "⚷ Player key run forming … anyone can join free!"

## Multi-tenant platform (2026-07-21)

The repo now doubles as a multi-tenant platform: other Minecraft server owners can sign up via Discord and get a branded site at `/s/[slug]` (home, rules, news, leaderboards), editable from `/dashboard`. The original mc.pvpers.us site is untouched — its pages moved verbatim into a `src/app/(pvpers)/` route group (URLs unchanged) with its own layout carrying `Header`/`Footer`/`MusicPlayer`; the root layout keeps only theme/weather/backgrounds, which tenant sites inherit for free. A tenant site has zero DB/auth dependency in the shared root layout, so if the platform's database is ever unreachable, the main pvpers site is unaffected — only `/dashboard`, `/login`, `/get-started`, and `/s/*` depend on it.

- **Stack** — Auth.js v5 (`next-auth@5`, Discord OAuth, database sessions) + Drizzle ORM + Postgres (`docker-compose.yml`, container `mcpvpers-postgres`, host port **5435**). Migrations in `src/db/migrations/`, schema in `src/db/schema/` (Auth.js tables + `tenants`/`memberships` + `tenantRules`/`tenantNews`)
- **Entitlements** — `src/lib/billing/plans.ts` is a pure, client-safe plan registry (`free`: 2 sites + live stats; `pro`: reserved, not yet purchasable). `sitesRemaining()` gates site creation
- **Tenant resolution** — no middleware; the slug is a route param resolved via `src/lib/tenant-context.ts`. Reserved slugs are enforced in `src/lib/reserved-slugs.ts`
- **Per-tenant stats proxy** — `src/app/api/s/[slug]/stats/[...path]/route.ts` mirrors the pvpers stats proxy (allowlist `server|players|leaderboard`, 30s revalidate) with SSRF guards in `src/lib/pistats-url.ts` (save-time + request-time host validation, since tenants supply their own PiStatsAPI URL)
- **Dashboard** — `src/app/(platform)/` — sign in, site list, create/settings/rules/news/connection management per site. Server actions in `src/lib/actions/` all check the caller's role via `requireTenantRole` before writing
- **Dev tooling** — `scripts/seed-test-tenant.ts` seeds a `testfall` tenant for local testing (`npx tsx scripts/seed-test-tenant.ts`)

## Cross-linking the flagship site and the platform (2026-07-22)

The multi-tenant platform launched live but was undiscoverable from mc.pvpers.us itself — no nav, footer, or home page mentioned it, and `/get-started` had no way back to the flagship site either. Closed the loop in both directions:

- **`src/app/(pvpers)/page.tsx`** — new closing section on the home page ("Run a server of your own?") pitching the platform with a CTA button to `/get-started`, styled to match the existing `/reputation`/`/mcmmo`/`/wanted` button pattern
- **`src/components/Footer.tsx`** — added a line above the copyright ("Run a Minecraft server? Get a site like this one — free.") linking to `/get-started`
- **`src/app/(platform)/layout.tsx`** — added a small "← mc.pvpers.us" link next to the "Server Sites" brand mark so visitors on `/get-started`, `/login`, and the dashboard can navigate back to the flagship site

All other pvpers pages (Reputation, mcMMO, Events, Economy, Modpacks, etc.) describe the actual game server and were left untouched — they're not about the platform.

## Getting Started

```bash
# Install dependencies
npm install

# Start the platform's Postgres container (only needed for /dashboard, /login, /s/*)
docker compose up -d postgres
npm run db:migrate

# Start development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The original pvpers site works with no database at all — Postgres is only required for the multi-tenant dashboard and tenant sites.

## Environment

No environment variables required for the base pvpers site. The stats proxy at `/api/stats/[...path]` defaults to the DatHost production PiStatsAPI endpoint (`http://stained.dathost.net:17249`); set `PISTATS_URL` to point at a different upstream (e.g. `http://localhost:8081` for the Pi dev mirror).

The multi-tenant platform (`/dashboard`, `/login`, `/get-started`, `/s/*`) needs a few more, in `.env.local`:

- `DATABASE_URL` — Postgres connection string (`postgres://mcpvpers:<password>@localhost:5435/mcpvpers` for the local `docker-compose.yml` setup)
- `AUTH_SECRET`, `AUTH_URL` — Auth.js session secret and canonical origin
- `AUTH_DISCORD_ID`, `AUTH_DISCORD_SECRET` — from a Discord app (developer portal) with redirect URI `<AUTH_URL>/api/auth/callback/discord`. Sign-in fails (redirects to Discord with a blank client id) until these are set

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS 4**
- **React 19**

## Project Structure

- `src/app/(pvpers)/` — The original mc.pvpers.us site (pages + its own layout: Header/Footer/Music). URLs unchanged from before the multi-tenant split
- `src/app/(platform)/` — Multi-tenant dashboard: sign-in, site list, per-site settings/rules/news/connection editors
- `src/app/s/[slug]/` — Public tenant sites (home, rules, news, leaderboards)
- `src/app/api/` — API routes, including the pvpers stats proxy (`api/stats/`), the per-tenant stats proxy (`api/s/[slug]/stats/`), and the Auth.js handler (`api/auth/`)
- `src/components/` — Reusable UI components; `src/components/tenant/` holds the tenant-site variants (thin, prop-driven)
- `src/db/` — Drizzle schema (`schema/`) and migrations for the multi-tenant Postgres database
- `src/lib/` — Shared logic: `launch.ts` (launch timestamp), `polls.ts` (poll storage + close gate), `leaderboardSnapshot.ts` (warm in-process leaderboard cache shared by the leaderboards and profile routes), `eventsSnapshot.ts` (warm Boss Rush cache: role boards + summary + recent runs), `bossDisplay.ts` (shared boss/loot types, rarity colors, the `gearMode` KIT/BYOG/HARDCORE badge map, and helpers for the `/events` hub and per-raid pages), `auth/` (Auth.js config + session/role helpers), `actions/` (server actions for the dashboard), `billing/` (plan entitlements registry), `tenant-context.ts` / `tenant-config.ts` / `reserved-slugs.ts` / `pistats-url.ts` (tenant resolution + SSRF guards)
- `src/data/` — JSON content files (rules, plugins, versions, news, modpacks, polls, poll-results, future-polls, bosses). Wanted outlaws and reputation leaderboards are fetched live from the plugin via the stats proxy
- `data/` — Runtime state (poll counts, etc.) — gitignored, created at first write
- `public/` — Static assets (textures, audio, cursors)
- `docker-compose.yml` — Local Postgres container for the multi-tenant platform
- `scripts/` — One-off dev scripts (e.g. `seed-test-tenant.ts`)

## Credits

Built by [Carson Caplan](https://carsoncaplan.com) — see carsoncaplan.com for more projects.
