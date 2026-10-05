# The Frontier Suite — server pack wiki

Fifteen open-source [Paper](https://papermc.io) plugins built for a Wild-West-flavoured
survival server and released as **separate jars** — install one, install all fifteen, or
anything in between. Every plugin works on its own; the integrations between them switch
on automatically when both sides are present. Everything is configurable, and every config
key is listed on this page.

- **Source & releases:** <https://github.com/carsonxdd/frontier> (MIT). Each GitHub Release
  attaches all 15 jars.
- **Downloads:** one Modrinth project per plugin — `modrinth.com/plugin/frontier-<name>`
  (links in each section below).
- **Requirements (all plugins):** Paper **26.3+** and Java **25+**. Spigot is not supported.
- **Reference server:** everything here runs live on `mc.pvpers.us`.

> Modrinth links on this page point at the planned project slugs and go live with v1.0.0.
> Until then, download from GitHub Releases.

## The pack at a glance

| Plugin | Ver | One line | Kind |
|---|---|---|---|
| **FrontierReputation** | 1.13.0 | Wild West reputation: outlaws, lawmen, bounties, wanted posters, marshals, `/pvp` war mode, daily rewards | Flagship · economy/social |
| **FrontierShop** | 1.12.0 | Server shop + player market with **daily-ticker pricing**, sign shops, daily deals, black market, custom items | Flagship · economy |
| **FrontierEvents** | 1.6.1 | Event engine: Boss Rush raids, the Gauntlet, keystone Raid Keys, TDM/FFA/KOTH, duel tournaments with wagers, Colosseum Night, open ring, arenas, kits | Flagship · minigames |
| **FrontierStatsAPI** | 1.19.0 | Embedded HTTP/JSON API (36 routes) serving every plugin's data to a website or bot | Infrastructure |
| **FrontierBorder** | 2.5.0 | Playtime-gated world border that grows on a daily schedule; sets the server timezone | World |
| **FrontierTab** | 1.2.2 | Tab-list header/footer with playtime, deaths, session, border, End status | QoL |
| **FrontierGraves** | 1.1.2 | Permanent graves — keep your inventory on death, claim it later | QoL |
| **FrontierMail** | 1.0.1 | Offline messages + item mailbox; other plugins deliver into it | QoL |
| **FrontierTrade** | 1.0.1 | Safe two-sided trade GUI | QoL |
| **FrontierEnderTracker** | 1.0.0 | Per-player Ender Dragon damage tracking, live sidebar, fight history | World |
| **FrontierEndLock** | 1.2.0 | Lock the End until a scheduled date (or until staff open it) | World |
| **FrontierNetherLock** | 1.0.0 | Lock the Nether until staff open it | World |
| **FrontierHeads** | 1.0.1 | Drop the victim's head on PvP kills | PvP |
| **FrontierBackup** | 1.0.1 | Scheduled zip backups with rotation | Ops |
| **FrontierAnnouncements** | 1.2.3 | Rotating chat announcements, the Frontier Gazette, Market Day, `/help` menu | Ops |

## Which plugin needs which

Only three plugins have a *hard* requirement, and it's always the same one: **FrontierTab**
is the playtime store that Border, Reputation and StatsAPI read. Everything else is optional
and degrades gracefully.

| Plugin | Requires (won't load without) | Optional — unlocks… |
|---|---|---|
| FrontierReputation | **FrontierTab** | Vault (bounty money, treasury), mcMMO (XP boost for pacifists in war mode), FrontierEvents (event kills don't count as crimes), FrontierMail (daily-reward overflow → mailbox), Lands (hazard-rule own-land exception, spawn builders), FrontierAnnouncements (Gazette, weekly shoutout) |
| FrontierShop | — | Vault (**effectively required** — no economy = shop is read-only), Lands (land upkeep, debt, town discount), EssentialsX (AFK detection for the dynamic cap) |
| FrontierEvents | — | Vault (payouts, wagers), FrontierMail (reward overflow), FrontierGraves (arena grave sweep), FrontierAnnouncements (Gazette) |
| FrontierStatsAPI | **FrontierTab** | FrontierBorder, FrontierReputation, FrontierEvents, FrontierShop, FrontierAnnouncements, mcMMO — each adds its routes; missing ones return empty |
| FrontierBorder | **FrontierTab** | FrontierAnnouncements (Gazette), Discord webhook for expansion announcements |
| FrontierTab | — | FrontierBorder (border line), FrontierEndLock (End 🔒), FrontierEvents (event and ring-edge deaths not counted), FrontierReputation (rep prefix on names), FrontierAnnouncements (soft dependency) |
| FrontierGraves | — | FrontierEvents (no graves for event deaths; arena sweep) |
| FrontierMail | — | *(is used by Reputation and Events — Shop's market keeps its own mailbox)* |
| FrontierEndLock | — | FrontierAnnouncements (Gazette post when the End opens) |
| FrontierHeads | — | FrontierEvents (no heads for event or ring kills) |
| everything else | — | — |

**Third-party:** [Vault](https://github.com/MilkBowl/Vault) + any economy (EssentialsX
tested), [LuckPerms](https://luckperms.net) (any perms plugin works; nodes are
`frontier.<plugin>.<action>`), [mcMMO](https://www.spigotmc.org/resources/64348/) 2.3+,
[Lands](https://www.spigotmc.org/resources/53313/) (optional: Shop land upkeep/debt/town
discount; Reputation hazard own-land exception and spawn builders),
[EssentialsX](https://essentialsx.net) (optional beyond the economy: Shop AFK detection for
the dynamic cap and sell gate; StatsAPI baltop).

**Data flow (who reads whom):**

```
FrontierTab ──playtime──▶ FrontierBorder      FrontierMail ◀── Reputation / Events (deliver items; Shop's market has its own mailbox)
FrontierTab ──playtime──▶ FrontierReputation  FrontierEvents ──"in event?"──▶ Graves, Tab, Reputation, Heads
FrontierTab ──────────────▶ FrontierStatsAPI ◀── Border, Reputation, Events, Shop, mcMMO (read on disk)
Reputation, Border, EndLock, Events ──Gazette posts──▶ FrontierAnnouncements ──▶ StatsAPI /api/gazette
FrontierBorder ──server-timezone──▶ every plugin's "midnight"
```

## Suggested install order

1. **FrontierTab** (the store others read) → **FrontierBorder** → **FrontierGraves**,
   **FrontierMail**, **FrontierTrade** — no third-party deps, instant QoL.
2. Vault + economy, then **FrontierShop** and **FrontierReputation**.
3. **FrontierEvents** once arenas can be built.
4. **FrontierStatsAPI** if a website/bot will consume it (it opens an HTTP port — firewall it).
5. Locks, Heads, EnderTracker, Backup, Announcements — anytime.

Drop jars in `plugins/`, **full restart** (never `/reload`, never overwrite a jar while the
server runs), edit `plugins/Frontier<Name>/config.yml`, then use the plugin's `reload`
subcommand where one exists (listed per plugin below).

## Permissions in one minute

Player features default to **true**, staff features to **op**. Every node follows
`frontier.<plugin>.<action>`, so a LuckPerms setup is e.g.
`lp group default permission set frontier.shop.use true`. Wildcards work:
`frontier.reputation.*`. Full tables per plugin below.

## Timezone in one minute

Several plugins have a "midnight" (shop ticker rollover, daily deals, black-market
windows, daily rewards, border expansion hour). Most use the JVM's default timezone, and
**FrontierBorder's `server-timezone`** sets that for the whole server (`America/New_York`,
`Europe/Berlin`, … or `system` to leave the host's). Set it once, first. A few schedules
also have their own timezone key — EndLock's `timezone`, Announcements' `gazette.timezone`
and `market-day.timezone`, Events' `arena-chest.timezone` — so keep those on the same zone.

---

## Table of contents

- [FrontierReputation](#frontierreputation)
- [FrontierShop](#frontiershop)
- [FrontierEvents](#frontierevents)
- [FrontierStatsAPI](#frontierstatsapi)
- [FrontierBorder](#frontierborder)
- [FrontierTab](#frontiertab)
- [FrontierGraves](#frontiergraves)
- [FrontierMail](#frontiermail)
- [FrontierTrade](#frontiertrade)
- [FrontierEnderTracker](#frontierendertracker)
- [FrontierEndLock](#frontierendlock)
- [FrontierNetherLock](#frontiernetherlock)
- [FrontierHeads](#frontierheads)
- [FrontierBackup](#frontierbackup)
- [FrontierAnnouncements](#frontierannouncements)

---

## FrontierReputation
> Wild West reputation, bounties, wanted posters and daily login rewards.  **v1.13.0** · Download: [Modrinth](https://modrinth.com/plugin/frontier-reputation) · [GitHub](https://github.com/carsonxdd/frontier/tree/master/reputation)

**What it does** — Every player is in one of four states: **Pacifist** (the default — cannot die from PvP, gets knocked out at 1 HP and robbed instead), **Lawman** (a five-tier ladder from Citizen to Marshal, entered by killing an outlaw and taking the badge), **Outlaw** (Drifter to Legend of the Frontier, listed on `/wanted` and bounty-able) or **Retired**. Rep is never negative — three independent pools (outlaw / peaceful / violence) grow from actions, and the lawman ladder needs *both* peaceful and violence rep plus a number of unique commenders, so a pure builder and a pure killer both cap at Citizen. Self-defense is free (a kill within 30 s of being hit by the victim earns no outlaw rep), outlaw-on-outlaw kills are neutral rivalry by default, and there is deliberately no revenge timer — revenge is served through the existing bounty, report, badge and hot-revenge paths. Bounties are cash: anyone but an Outlaw can put their own money on an outlaw with `/bounty place <player> <amount>`, and the killer collects the total. It only moves money between players, so it cannot mint any. The `/donate` reward pool is separate and pays the automatic item reward drops Lawmen get for outlaw kills, under weekly server-wide caps. Players run justice themselves through reports, commendations, denouncements, restitution and pardons, each with anti-abuse caps. A streak-based daily login reward (money + item kits) rounds it out. Tuned for a friend-group server of roughly 10–20 active players.

Season 2 guardrails: combat-logging leaves a lootable **logout body** for 5 minutes instead of killing you on return; clean-hour rep and outlaw decay only count **real activity**; **spawn is no-PvP** and lava, fire, TNT and beds can't be used near other players; an outlaw who dies to a Lawman sheds rep **scaled by the gear they carried**; and rep-trusted **spawn builders** get build access in the Spawn land. It can also post to the **Frontier Gazette** and run a weekly commend **shoutout** (both through FrontierAnnouncements).

**Requires / integrates with**
| | |
|---|---|
| Required | Paper 26.3+, Java 25+, FrontierTab (hard dependency — provides the tab/chat tier prefixes; the plugin will not load without it) |
| Optional | Vault + an economy (daily-reward money and rep-reward payouts; skipped without it) · FrontierMail (daily-reward overflow items go to `/mailbox` instead of dropping at your feet) · FrontierEvents (arena/event combat is exempt from all reputation effects) · mcMMO (XP boost while PvP-effective) · FrontierBorder (its `server-timezone` sets the "midnight" used by daily/weekly resets) · FrontierAnnouncements (Gazette posts and the weekly commend shoutout) · Lands (own-land exception to the hazard rule; spawn-builder access to the Spawn land) · any claim plugin that cancels PvP damage (Lands, WorldGuard, GriefPrevention — inside PvP-denied claims the rep system does nothing) |
| Used by | FrontierStatsAPI (reads `data.db` for leaderboards, wanted posters, profiles, economy and streaks) · FrontierTab (displays the tier prefixes) |

**Commands**
| Command | Who | What |
|---|---|---|
| `/rep [help]` | Everyone | Rules summary (states, redemption paths, key commands); shown automatically on first join |
| `/rep title <hide\|show>` | Everyone | Hide or show your reputation title |
| `/whois <player>` | Everyone | Full reputation lookup — state, rep pools, tiers, recent crimes; self-view while Outlaw appends the redemption path |
| `/wanted [player]` | Everyone | Top-5 outlaws by tier, or one player's wanted poster |
| `/badge <yes\|no>` | Everyone | Accept or decline the Deputy badge after your first outlaw kill |
| `/commend <player> <reason>` | Everyone | Award peaceful rep (uses a charge; charges accrue from playtime; 6 h cooldown per recipient) |
| `/commend list [player]` | Everyone | Commendations you (or another player) received — commender, reason, date |
| `/denounce <player> <reason>` | Everyone (not Outlaws) | Flag a player to staff. Costs a commend charge and needs 5 h of non-AFK play; max 3 a day, once per target per week. When 2+ players on different connections denounce the same player within 7 days it goes to the staff queue, and staff can take −10 (minor) or −25 (serious) peaceful rep |
| `/donate` | Everyone | Open the donation chest; items fund the reward pool behind Lawmen's automatic reward drops, donors earn capped peaceful rep |
| `/donate log [count]` / `pool` / `top` | Everyone | Donation ledger, current pool contents, top donors |
| `/report <player> <reason>` | Everyone | File a complaint (needs `reports.reporter_min_playtime_hours` playtime; 24 h cooldown per target) |
| `/report list\|view\|approve\|deny\|reverse …` | Deputy+ | Adjudicate reports; false reports cost the reporter peaceful rep |
| `/bounty [list]` | Everyone | One line per Outlaw with a bounty: total cash and number of posters |
| `/bounty track <player>` | Everyone | Tracking compass toward an Outlaw (position fuzzed ±100 blocks, 10-min cooldown) |
| `/bounty treasury` | Everyone | Read-only Sheriff's Office reward pool (donated items behind the automatic reward drops; separate from posted bounties) |
| `/bounty place <player> <amount>` | Everyone but Outlaws | Post a cash bounty from your own balance (`2500`, `2,500` or `2.5k`; $250 minimum, no maximum). Pacifists and Retired wait 48h between posts (persisted), Lawmen have no cooldown. Bounties stack; the killer gets every bounty on the target as cash, a poster who kills their own target gets their money back, and a pardon, 30 days of target inactivity or a shared-IP void refunds the poster (offline too) |
| `/daily` | Everyone | Daily login streak status (current/best streak, claimed today?, tomorrow's payout); the reward itself is granted automatically once you've played 10 minutes that day, for at most 2 accounts per connection |
| `/pvp [on\|off\|status]` | Everyone (Pacifist/Retired) | Opt into PvP ("warmode"); default off, needs 5 h of playtime, 30-min toggle cooldown, refused while combat-tagged; Outlaws/Lawmen are always on |
| `/restitution <victim>` | Outlaws only | 27-slot UI to return stolen items (online victim → inventory, offline → mailbox). Earns no peaceful rep: it pays down the outlaw rep charged for crimes against that victim, and only raw diamonds, emeralds, netherite and their blocks give credit (gear counts 0) |
| `/pardon <player>` | Sheriff+ | Reduce outlaw rep — Sheriff −25 %, Senior Sheriff −50 %, Marshal −100 %; refunds active bounties; one pardon per target per 7 days across all pardoners; murder rep is floored (see `pardon_unforgivable_floor_pct`) |
| `/marshal grant-rep <player> <amount> <reason>` | Marshal / Admin | Admin-light rep adjustment |
| `/marshal audit <player>` / `audit-by <player>` | Marshal / Admin | Corruption-detection trail of lawman actions |
| `/repadmin reload` | Admin | Re-read `config.yml` live |
| `/repadmin setrep <player> <outlaw\|peaceful\|violence> <amount>` | Admin | Manually set a rep pool |
| `/repadmin state <player> <PACIFIST\|LAWMAN\|OUTLAW\|RETIRED>` | Admin | Manually set a state |
| `/repadmin reset-rep <player> confirm` | Admin | Emergency full wipe to new-player state (refunds bounties, deletes crimes/reports/commendations against the target; audit logs kept) |
| `/repadmin spawnbuilders` / `spawnbuilder …` | Admin | Spawn builders — the rep-trusted players who get build access in the Spawn land |
| `/repadmin shoutout [status\|preview\|now]` | Admin | The weekly commend shoutout: status, a preview, or post it now |
| `/repadmin commendflags` | Admin | Commendations flagged by the anti-abuse checks |
| `/repadmin bodies` | Admin | Logout bodies (combat-log stand-ins) |
| `/repadmin afkflags` | Admin | Players flagged by the activity/AFK checks |
| `/repadmin denounces` | Admin | The denouncement queue |
| `/repadmin denounce confirm\|dismiss …` | Admin | Uphold or dismiss a queued denouncement |

Tier gates (Deputy+, Sheriff+, Senior Sheriff+, Marshal) are enforced in code by lawman tier — the permission nodes below are all granted to everyone except the three op nodes.

**Permissions**
| Node | Default | Grants |
|---|---|---|
| `frontier.reputation.rep` | true | `/rep` |
| `frontier.reputation.whois` | true | `/whois` |
| `frontier.reputation.wanted` | true | `/wanted` |
| `frontier.reputation.badge` | true | `/badge` |
| `frontier.reputation.commend` | true | `/commend` (award + list) |
| `frontier.reputation.donate` | true | `/donate` (UI + log/pool/top) |
| `frontier.reputation.report` | true | `/report` — filing; adjudication gated by lawman tier in code |
| `frontier.reputation.denounce` | true | `/denounce` — Outlaws refused in code |
| `frontier.reputation.bounty` | true | `/bounty` — placement open to everyone but Outlaws |
| `frontier.reputation.daily` | true | `/daily` |
| `frontier.reputation.pvp` | true | `/pvp` opt-in toggle |
| `frontier.reputation.restitution` | true | `/restitution` — outlaws only, checked in code |
| `frontier.reputation.pardon` | true | `/pardon` — Sheriff+ checked in code |
| `frontier.reputation.marshal` | true | `/marshal` — Marshal tier or admin, checked in code |
| `frontier.reputation.admin` | op | `/repadmin`, plus admin bypass of the tier gate on `/marshal` |
| `frontier.reputation.combat.bypass` | op | Bypass the combat-tag teleport-command block |
| `frontier.reputation.hazard.bypass` | op | Bypass the rule against lava, fire, TNT and beds near other players |

Legacy `pireputation.*` nodes are still declared, but children only resolve downward: holding `pireputation.x` does **not** grant `frontier.reputation.x`. Old grants appear to keep working only because every player node defaults to true.

**Config** — path `plugins/FrontierReputation/config.yml`, reload: `/repadmin reload` (never use Bukkit `/reload` — it wipes in-memory knockout/provocation state)
| Key | Default | What it controls |
|---|---|---|
| `ladders.outlaw.<tier>` | drifter 25 / bandit 75 / outlaw 175 / notorious 350 / legend 600 | One entry per outlaw tier, fields: `rep` (threshold), `multiplier` (bounty multiplier 1.0 → 3.0), `title` |
| `ladders.lawman.<tier>` | citizen 30/5/0 · deputy 80/25/2 · sheriff 200/80/4 · senior_sheriff 400/180/5 · marshal 700/350/6 | One entry per lawman tier, fields: `peaceful`, `violence`, `unique_commenders`, `title`. mc.pvpers.us runs citizen 30/5/0 · deputy 60/10/1 · sheriff 170/15/3 · senior_sheriff 300/70/4 · marshal 450/100/5 |
| `rep_actions.outlaw.unprovoked_kill_pacifist` | 50 | Outlaw rep for an unprovoked kill of a Pacifist |
| `rep_actions.outlaw.unprovoked_kill_lawman` | 15 | …of a Lawman |
| `rep_actions.outlaw.unprovoked_kill_outlaw` | 0 | …of an Outlaw (0 = outlaw-vs-outlaw is rivalry, not crime; mc.pvpers.us runs 5) |
| `rep_actions.outlaw.unprovoked_kill_newcomer` | 75 | …of a player still under newcomer protection (worse than a normal pacifist kill) |
| `rep_actions.outlaw.villager_kill` | 3 | Killing a villager |
| `rep_actions.outlaw.village_structure_break` | 2 | Breaking village structures |
| `rep_actions.outlaw.farm_mob_kill` | 1 | Killing farm animals |
| `rep_actions.outlaw.donation_chest_theft_per_stack` | 5 | Stealing from the donation chest, per stack |
| `rep_actions.outlaw.pet_kill` | 1 | Killing a tamed mob owned by someone else |
| `rep_actions.lawman_peaceful.online_hour_clean` | 1.0 | Peaceful rep per clean online hour (active minutes only; mc.pvpers.us runs 2.0) |
| `rep_actions.lawman_peaceful.commend_received` | 10 | Peaceful rep per commendation received (mc.pvpers.us runs 5) |
| `rep_actions.lawman_peaceful.defend_player` | 3 | Peaceful rep for defending another player |
| `rep_actions.lawman_peaceful.report_approved` | 2 | Peaceful rep when your report is approved |
| `rep_actions.lawman_violence.kill_<tier>` | drifter 10 / bandit 20 / outlaw 40 / notorious 75 / legend 150 | Violence rep for killing an outlaw of each tier |
| `rep_actions.lawman_violence.assist_pct` | 25 | Percent of the kill's violence rep credited to assisting attackers |
| `rep_actions.lawman_violence.lawman_death_violence_penalty` | 5 | Violence rep a Lawman loses when killed by an Outlaw |
| `donations.enabled` | true | Enable the `/donate` chest and reward pool |
| `donations.weekly_rep_cap_per_donor` | 10 | Max peaceful rep a donor can earn per week |
| `donations.outlaws_can_earn_rep` | false | Outlaws can deposit but earn no rep |
| `donations.item_values.<MATERIAL>` | DIAMOND 0.5, NETHERITE_SCRAP 1.0, NETHERITE_INGOT 4.0, EMERALD 0.25, GOLD_INGOT 0.1, IRON_INGOT 0.05, COOKED_BEEF/BREAD 0.02, OAK/SPRUCE/BIRCH_LOG 0.01 | Diamond-equivalent value per material (drives donation rep, theft rep and treasury value) |
| `restitution.require_logged_crime` | true | Restitution only credits against crimes logged against that victim (items still deliver either way) |
| `restitution.other_crime_rep_per_diamond_equivalent` | 0.25 | Outlaw rep paid down per diamond-equivalent returned. Only raw diamonds, emeralds, netherite and their blocks count; gear is credited 0. Restitution earns no peaceful rep |
| `reports.enabled` | true | Enable `/report` |
| `reports.reporter_min_playtime_hours` | 2 | Playtime needed before you can file a report |
| `reports.pending_expiry_days` | 7 | Unadjudicated reports expire after this |
| `reports.reporter_cooldown_per_target_hours` | 24 | One report per target per this window |
| `reports.false_report_penalty` | -10 | Peaceful rep change for a denied/false report |
| `reports.reverse_window_hours` | 24 | Window in which an approved report can be reversed |
| `reports.severity_rep.{minor,moderate,serious}` | 5 / 20 / 50 | Outlaw rep added on approval, by severity |
| `marshal.{grant_rep_limit, grant_rep_window_days}` | 20, 7 | Cap on rep a Marshal can hand out with `/marshal grant-rep` per window |
| `denounce.*` | 5 h play · 3 a day · once per target per week | `/denounce`: costs a commend charge; 2+ denouncers on different connections within 7 days put the target in the staff queue; staff can take −10 (minor) or −25 (serious) peaceful rep |
| `commend.enabled` | true | Enable `/commend` |
| `commend.same_recipient_cooldown_hours` | 6 | Cooldown before commending the same player again |
| `commend.anti_trade_cooldown_hours` | 6 | Blocks A→B then B→A commend trades within this window |
| `commend.list_limit` | 10 | Rows shown by `/commend list` |
| `ladder_requirements.unique_commenders_window_days` | 90 | Commendations older than this don't count toward the unique-commender gate |
| `ladder_requirements.enforce_unique_commenders` | true | Set false to disable unique-commender gating on the lawman ladder |
| `caps.online_clean_rep_per_day` | 6 | Daily cap on peaceful rep from clean playtime (mc.pvpers.us runs 12) |
| `caps.defend_player_cooldown_sec` | 600 | Cooldown between defend-player rep awards |
| `caps.commend_charge_hours` | 10 | Playtime hours per commend charge earned |
| `caps.commend_max_stockpile` | 8 | Max stored commend charges |
| `caps.outlaw_kills_full_reward_per_24h` | 3 | Outlaw kills per 24 h that pay the full reward |
| `caps.weekly_server_diamond_cap` | 100 | Server-wide weekly cap on diamonds paid as rewards (mc.pvpers.us runs 50) |
| `caps.weekly_server_netherite_cap` | 50 | Same for netherite (mc.pvpers.us runs 20) |
| `caps.restitution_outlaw_rep_reduction_per_day` | 0 | Daily cap on outlaw rep paid down through `/restitution` (0 = no cap) |
| `redemption.death_to_lawman_pct` | 15 | % of outlaw rep lost when killed by a lawman |
| `redemption.death_scaling.*` | 2 % – 15 % | Death to a Lawman sheds rep scaled by how geared the outlaw was |
| `redemption.death_floor_pct` | 66 | Death redemption never takes unreturned murder/robbery rep below this % |
| `redemption.death_to_bounty_hunter_pct` | 20 | % lost when killed for a bounty |
| `redemption.pardon_pct.{sheriff,senior_sheriff,marshal}` | 25 / 50 / 100 | % of outlaw rep removed by a pardon, per pardoning tier |
| `redemption.pardon_unforgivable_floor_pct` | 30 | % of murder rep that survives any pardon (0 = off); unreturned robbery rep survives in full |
| `redemption.pardon_cooldown_days` | 7 | One pardon per target per this many days, across all pardoners |
| `redemption.offline_decay_pct_per_week` | 2 | Outlaw rep decay while offline |
| `outlaw_decay.*` | 7 crime-free days, then −1 per active hour | Online decay: after a week without crimes an outlaw sheds rep while actually playing |
| `states.pacifist.knockout_enabled` | true | Pacifists get knocked out instead of dying to PvP |
| `states.pacifist.knockout_duration_sec` | 30 | Phase 1: fully invulnerable, debuffed, robbable |
| `states.pacifist.knockout_cooldown_sec` | 300 | Phase 2: after wake-up the knockout is disarmed — a lethal hit is a real death (attacker takes full pacifist-kill rep) |
| `states.pacifist.knockout_regen_amplifier` | 1 | Wake-up Regeneration level (0 = I, 1 = II, 2 = III) |
| `states.pacifist.knockout_regen_duration_sec` | 5 | Wake-up Regeneration length |
| `states.pacifist.knockout_max_items_taken` | 3 | Distinct stack-clicks the attacker may take in the theft GUI |
| `states.pacifist.knockout_theft_hotbar_only` | false | true = only the victim's hotbar is robbable (false = hotbar + main inventory; armor/offhand never) |
| `states.pacifist.knockout_theft_max_per_stack` | 16 | Per-stack cap on items taken (64 = full stacks) |
| `states.pacifist.knockout_with_theft_outlaw_rep` | 1 | Base outlaw rep for robbing a knocked-out player |
| `states.pacifist.knockout_theft_rep_per_diamond_eq` | 0.25 | Extra rep per diamond-equivalent stolen (0 = flat) |
| `states.pacifist.knockout_theft_victim_cooldown_min` | 60 | A robbed player can't be robbed again for this long |
| `states.pacifist.knockout_theft_makes_drifter` | true | Any robbery tops a non-outlaw robber up to Drifter (25 outlaw rep) |
| `states.pacifist.pacifist_vs_pacifist_warn` | true | First hit between two pacifists is cancelled with a warning |
| `states.pacifist.pacifist_vs_pacifist_warn_cooldown_sec` | 600 | Warning silenced for this long per attacker→victim pair |
| `states.pacifist.newcomer_protection_hours` | 5 | New players under this playtime are protected (and killing them costs `unprovoked_kill_newcomer`) |
| `states.pacifist.pvp_opt_in_enabled` | true | Enable `/pvp` warmode for Pacifists/Retired |
| `states.pacifist.pvp_toggle_cooldown_min` | 30 | Cooldown between `/pvp` toggles |
| `states.pacifist.outlaw_land_protection_bypass` | true | PvP-effective attackers can hit Outlaw victims (melee or projectiles) even inside PvP-denied claims (stops outlaws bunkering) |
| `states.pacifist.mcmmo_warmode_xp_multiplier` | 1.05 | mcMMO XP × this while PvP-effective (1.0 disables; needs mcMMO) |
| `states.lawman.auto_retire_after_inactive_days` | 30 | Inactive lawmen become Retired (rep frozen, restored on next fight) |
| `states.spawn.radius_blocks` | 200 | Spawn-region radius for the spawn-kill override (mc.pvpers.us runs 100) |
| `states.spawn.spawn_kill_rep_override` | 30 | Outlaw rep for a kill inside the spawn region |
| `states.spawn.overworld_only` | true | Spawn override applies only in the overworld |
| `broadcasts.promotion_cooldown_per_player_min` | 10 | Min minutes between promotion broadcasts for one player |
| `broadcasts.max_broadcasts_per_minute_server` | 3 | Server-wide broadcast rate cap |
| `bounties.min_amount` | 250 | Smallest cash bounty; no maximum |
| `bounties.place_cooldown_hours.{pacifist,retired,lawman}` | 48 / 48 / 0 | Hours between one player's placements |
| `bounties.bounty_inactive_refund_days` | 30 | Bounties refund if the target is absent this long |
| `bounties.tracking_compass_cooldown_min` | 10 | Per-player `/bounty track` cooldown |
| `bounties.tracking_compass_accuracy_blocks` | 100 | Fuzz applied to the tracked position |
| `bounties.claim_allowed.{lawman,pacifist,retired,outlaw}` | true / true / true / false | Which states may claim a bounty by killing the target |
| `rewards.enabled` | true | Server-generated item drops on outlaw kills |
| `rewards.<tier>` | drifter DIAMOND:1 … legend DIAMOND:10 + NETHERITE_SCRAP:4 | One entry per outlaw tier, fields: `base` (item list) and `bonus_rolls` (list of `{chance, items}`); items are `MATERIAL:count` or `MATERIAL:1dN` dice |
| `anti_abuse.alt_detection` | true | Detect alt accounts by shared IP |
| `anti_abuse.alt_shared_ip_window_days` | 14 | Window for shared-IP alt matching |
| `anti_abuse.combat_log_window_sec` | 10 | Disconnecting within this many seconds of PvP damage counts as combat-logging |
| `anti_abuse.combat_log_npc_duration_sec` | 30 | Unused — replaced by logout bodies |
| `anti_abuse.logout_body.*` | 300 s | Quitting within the combat-log window, or while knocked out, leaves a body holding your whole inventory (armor included) for this long. Anyone can loot it and it is never a crime; leftovers come back on login, with no rep charge and no death on return |
| `anti_abuse.lawman_kill_pair_cooldown_hours` | 24 | Cooldown on paying out repeat Lawman kills of the same Outlaw |
| `anti_abuse.activity.*` | — | Activity gate: clean-hour rep and outlaw decay need real, non-AFK activity |
| `anti_abuse.respawn_invuln_sec` | 30 | Post-respawn invulnerability (drops on your first aggression) |
| `anti_abuse.block_teleport_commands` | true | Block teleport-style commands while combat-tagged |
| `anti_abuse.blocked_teleport_commands` | 33 commands | The blocked command list (teleport-style commands such as `/home`, `/tpa`, `/spawn`, `/back`, `/warp`) |
| `pvp_guardrails.*` | — | Spawn is no-PvP, and lava, fire, TNT and beds can't be used near other players (own land excepted, via Lands; `frontier.reputation.hazard.bypass` skips it) |
| `spawn_builders.*` | mc.pvpers.us: 80 peaceful, 30 h, 14 clean days | Rep-trusted players who meet these thresholds get build access in the Lands land named Spawn |
| `gazette.*` | on (mc.pvpers.us) | Post reputation moments to the Frontier Gazette (needs FrontierAnnouncements) |
| `shoutout.*` | on (mc.pvpers.us) | Weekly Sunday commend shoutout: players with 2+ commends in the last 7 days, ranked by unique commenders |
| `onboarding.first_join_welcome` | true | 3-line welcome on a player's first ever join |
| `onboarding.first_crime_redemption_hint` | true | One-shot "how to clear your name" hint on first becoming an Outlaw |
| `audio.enabled` | true | Single-recipient sound cues on state changes |
| `audio.master_volume_multiplier` | 1.0 | Multiplied onto every cue's volume |
| `audio.events.{became_wanted,badge_prompt,bounty_resolved,fully_redeemed}` | all true | Toggle each of the four cues |
| `daily_reward.enabled` | true | Daily login rewards |
| `daily_reward.min_play_minutes` | 10 | Minutes played that day before the reward is granted (checked every 20 s) |
| `daily_reward.{one_claim_per_ip, claims_per_ip}` | true, 2 | Cap how many accounts per connection can claim each day |
| `daily_reward.voice_bonus.enabled` | false (mc.pvpers.us) | Optional Simple Voice Chat bonus on the daily reward — off here |
| `daily_reward.money.by_day` | [100, 120, 150, 180, 210, 240, 280, 310, 340, 370, 400, 430, 460, 500] | Money per streak day (day 1 first; days past the end keep paying the last value). mc.pvpers.us runs [80, 100, 120, 140, 170, 190, 220, 250, 270, 300, 320, 340, 370, 400] |
| `daily_reward.items.tiers.<day>` | 1 / 3 / 7 / 14 | Item kit per streak tier (highest tier at or below the current streak applies); one list per tier of `MATERIAL:count` |
| `daily_reward.items.milestones.<day>` | 3: GOLD_INGOT:8 · 7: DIAMOND:4 + EXPERIENCE_BOTTLE:16 | Extra items on that exact streak day |
| `daily_reward.items.repeating.<interval>` | 14: DIAMOND:8 + ENCHANTED_GOLDEN_APPLE:1 | Bonus on every multiple of the interval |
| `daily_reward.broadcast_milestones` | true | Announce milestone streaks server-wide |
| `daily_reward.sound` | true | Sound cue on claim |
| `crime_log_retention_days` | 90 | Crimes older than this age out (drives natural rep recovery) |
| `last_seen_coord_rounding` | 100 | Broadcast/poster coordinates rounded to this many blocks |

**Good to know**
- All state lives in `plugins/FrontierReputation/data.db` (SQLite, WAL mode; schema auto-migrates on boot). Never use Bukkit `/reload` — restart instead; `/repadmin reload` is safe for config.
- Inside any claim where PvP is denied the plugin does nothing (no knockout, no rep) — except Outlaw victims, who lose claim protection when `outlaw_land_protection_bypass` is on. Keep claim-plugin "war" modes off; they create the two-factions dynamic the design rejects.
- Daily/weekly resets roll at midnight in the server's JVM timezone; set FrontierBorder's `server-timezone` if your host clock is UTC.
- The config table quotes shipped defaults; where mc.pvpers.us runs a different value, the row says so.
- Only plain PvP damage is seen — environmental kills (lava pushes, traps) earn no rep; multi-attacker assist credit and friend-farmed commendations are known open items.
- Most-tweaked knobs: `ladders.lawman` thresholds (scale unique-commenders to your player count), `states.pacifist.knockout_*`, `redemption.*`, and the `daily_reward` money curve.

---

## FrontierShop
> Server shop and player market GUIs with daily-ticker pricing, deals, a rotating black market and upgradeable custom items.  **v1.12.0** · Download: [Modrinth](https://modrinth.com/plugin/frontier-shop) · [GitHub](https://github.com/carsonxdd/frontier/tree/master/shop)

**What it does** — `/shop` opens a category-based server shop (the shipped catalog has 8 categories and 119 items; mc.pvpers.us runs 200) where every slot is its own terminal (left-click buy 1, shift-left buy a stack, right-click sell 1, shift-right sell everything matching), and `/market` opens a player market for listing your own items at your own price. Prices ride a **daily ticker**: each item has a price index that re-prices *once a day at local midnight* from yesterday's net player flow (clamped 60–140 %), buy and sell both ride the same index so the spread never changes and a dumped item eventually becomes cheap to buy back. Prices never move mid-day; the anti-farm guard is a daily **warehouse cap** (by default the server buys at most `appetite × 5` of each item per day) rather than price-crushing, and only plain, unenchanted, undamaged items sell. On top of the cap: each player (and each connection) may fill only a **share** of it, the cap **scales with active players**, and the warehouse won't buy from you until you've played **30 non-AFK minutes** that week. mc.pvpers.us runs a tighter ticker (warehouse ×1, index 30–140 %, daily moves up to 10 % with a 15 % pull back toward par). On top of that: seeded **daily deals**, `[shop]` **sign shops** on chests, and a buy-only **black market** that opens on fixed weekly windows with per-window stock and rosters that rotate by weekday — selling vanilla contraband you can't normally get in survival (spawn eggs, mob heads, loot-only gear), captured mob spawners, and five tiered custom trinkets plus three consumables that players level up at an **Upgrade Station**.

**Land upkeep** (with Lands): claimed chunks cost a daily upkeep. An **active** land that can't pay keeps its chunks and goes into **debt** — no new claims or bank withdrawals, and deposits pay the debt first — and only unclaims once inactive or after too long in debt (14 days on mc.pvpers.us). Unclaimed chunks can be reclaimed free for 30 days with `/upkeep reclaim`. An optional **town discount** lowers upkeep for lands with active members (on at mc.pvpers.us, off by default). Villager trade discounts from curing, Hero of the Village and gossip are **stripped**.

**Requires / integrates with**
| | |
|---|---|
| Required | Paper 26.3+, Java 25+ |
| Optional | Vault + a Vault-registered economy (all money; without it the GUIs open but every transaction is refused with "The economy is offline") · FrontierBorder (its `server-timezone` sets the "local midnight" used by the ticker, deals and black-market windows) · Lands (land upkeep, upkeep debt and the town discount) · EssentialsX (AFK detection for the dynamic warehouse cap and sell gate) · a claim plugin such as Lands/GriefPrevention (protects sign-shop chests from hoppers/pistons — the plugin only guards sign/chest breaking and explosions) |
| Used by | FrontierStatsAPI (reads `demand.db` / `market.db` / `sales.db` read-only for catalog, market, deals, price history and black-market endpoints) |

**Commands**
| Command | Who | What |
|---|---|---|
| `/shop` | Everyone | Open the server shop GUI |
| `/shop upgrade` | Everyone | Open the Upgrade Station (same as the anvil button in `/shop`) — pay money to raise the held custom item one tier |
| `/shop reload` | Admin | Re-read `config.yml` and rebuild the catalog (ticker indexes and market data kept) |
| `/market` | Everyone | Browse the player market GUI (also the emerald in `/shop`) |
| `/market sell <price>` | Everyone | List the whole held stack at a price (listing tax applies) |
| `/upkeep [land]` (also `/town`) | Everyone | Your land's upkeep status (needs Lands) |
| `/upkeep debt [land]` | Everyone | Show a land's upkeep debt |
| `/upkeep reclaim` | Everyone | Reclaim chunks lost to unpaid upkeep, free, within 30 days |
| `/shopadmin listings [player]` | Admin | List live market listings with IDs (console-friendly) |
| `/shopadmin removelisting <id>` | Admin | Pull a listing — item returns to the seller's mailbox, seller notified (staff can also shift-click a listing in `/market`) |
| `/shopadmin price <material> <buy> <sell> [appetite]` | Admin | Persistent price override written to `overrides.yml`; `price <material> clear` removes it |
| `/shopadmin ticker <material>` | Admin | Show index, overnight change, live prices, today's sold/bought and warehouse left (`demand` is an alias) |
| `/shopadmin ticker reset <material\|all>` | Admin | Snap the index back to 100 % and clear today's counters |
| `/shopadmin deals` | Admin | Show today's daily deals with effective prices |
| `/shopadmin blackmarket [status]` | Admin | Inspect the black-market window and remaining stock |
| `/shopadmin blackmarket open [day…] [minutes]` | Admin | Force a window open (default 30 min); add a weekday (`open friday 60`) to preview only that night's roster |
| `/shopadmin blackmarket close` | Admin | Close a window early — stays shut for the rest of that scheduled window |
| `/shopadmin active` | Admin | Active-player count behind the dynamic warehouse cap |
| `/shopadmin upkeep debts\|debt\|forgive\|audit\|lost\|minutes\|settle …` | Admin | Land-upkeep administration: list debts, inspect or forgive one, audit, lost chunks, activity minutes, settle |

Sign shops have no command: place a sign on a chest/barrel and write `[shop]` / `<amount>` / `<price>`; the chest's first item becomes the offer.

**Permissions**
| Node | Default | Grants |
|---|---|---|
| `frontier.shop.use` | true | `/shop`, `/shop upgrade`, `/market`, `/market sell` |
| `frontier.shop.signshop` | true | Creating `[shop]` signs on chests/barrels |
| `frontier.shop.upkeep` | true | `/upkeep` (and `/town`) |
| `frontier.shop.admin` | op | `/shop reload`, all of `/shopadmin`, shift-click listing removal in `/market`, breaking other players' shop signs |

Legacy `pishop.*` nodes are still declared, but children only resolve downward: holding `pishop.x` does **not** grant `frontier.shop.x`. Old grants appear to keep working only because the player nodes default to true.

**Config** — path `plugins/FrontierShop/config.yml`, reload: `/shop reload`
| Key | Default | What it controls |
|---|---|---|
| `ticker.drift-max` | 0.05 | Biggest one-day index move from player flow (5 %; mc.pvpers.us runs 0.10) |
| `ticker.drift-idle` | 0.02 | Quiet-day drift back toward 100 % of base (mc.pvpers.us runs 0.04) |
| `ticker.pull` | mc.pvpers.us: 0.15 | Daily pull of the index back toward par |
| `ticker.index-min` | 0.60 | Prices never fall below this fraction of base (mc.pvpers.us runs 0.30) |
| `ticker.index-max` | 1.40 | …or rise above this |
| `ticker.warehouse-multiple` | 5 | Server buys `appetite × this` of each item per day, then tapers (mc.pvpers.us runs 1) |
| `ticker.taper.enabled` | true | Keep buying past the cap/share at a tapering rate (`false` = old hard wall until midnight) |
| `ticker.taper.rates` | [0.50, 0.25] | Rate for each band of extra units, one allowance wide |
| `ticker.taper.floor` | 0.10 | Rate for everything after the bands, until midnight |
| `ticker.default-appetite` | 256 | Appetite used when a catalog item omits it |
| `player-share` | 0.25 | Share of an item's daily warehouse cap any one player (and connection) may sell at full price; past it the taper applies |
| `share-per-ip` / `share-ip-exempt` | — | Also count the player share per connection (hashed IP), and the exemptions from that |
| `dynamic-cap.*` | 1.0× – 1.5× base | Scales the daily warehouse cap with active connections, from a floor of 1.0 × base to a ceiling of 1.5 × base (AFK detection via EssentialsX) |
| `dynamic-cap.sell-min-minutes` | 30 | Sell gate: non-AFK minutes a player needs this week before the warehouse buys from them |
| `villager-discounts.strip` | true | Strip villager trade discounts from curing, Hero of the Village and gossip |
| `sounds` | true | Low-volume UI/buy/sell sounds |
| `market.tax` | 0.05 | Cut taken from each player-market and sign-shop sale (money sink) |
| `market.max-listings` | 8 | Active listings per player |
| `market.expiry-days` | 7 | Unsold listings move to the seller's claim chest after this |
| `market.max-price` | 1000000 | Listing price ceiling |
| `market.expiry-warn-hours` | 24 | On join, warn about listings expiring within this window |
| `deals.enabled` | true | Daily deals on/off |
| `deals.count` | 9 | Deals per day (seeded by the calendar date, flip at local midnight) |
| `deals.buy-discount` | 0.25 | Buy deals: fraction off the static buy price |
| `deals.sell-bonus` | 0.50 | Sell deals: bonus on the sell base (falls back to a buy deal if it would cross half the buy price) |
| `blackmarket.schedule` | Tuesday 21:00 for 3 h, Friday 21:00 for 3 h | List of weekly windows, fields: `day` (uppercase weekday), `open-hour` (0–23), `duration-hours`; server-local time |
| `blackmarket.announce` | true | Broadcast open/close |
| `blackmarket.items` | 47 entries shipped (6 always-on, 16 Tuesday "Deep & Dark", 25 Friday "Wild & Sky"); mc.pvpers.us runs 44 (5 / 15 / 24) | One entry per good, fields: `material` *or* `custom: <id>` (custom item / `spawner_<mob>`), `buy`, `stock` (per window; omit or -1 = unlimited), optional `days: [WEEKDAY…]` to rotate; max ~45 shown per window |
| `blackmarket.random-spawners.{nice,hostile}` | *(not in shipped config; mc.pvpers.us defines both)* | Optional mob-name pools for the `spawner_random_nice` / `spawner_random_hostile` ids; built-in pool used when missing |
| `mount-trinket.include-boats` | true | Saddle of Swiftness also gives boats a velocity assist |
| `mount-trinket.max-level` | 3 | Number of tiers |
| `mount-trinket.level-{1,2,3}-bonus` | 0.50 / 1.00 / 1.50 | Mount-speed bonus at each tier (+50 % / +100 % / +150 %) |
| `mount-trinket.level-{2,3}-cost` | 40000 / 90000 | Upgrade Station cost to reach tier 2 / 3 |
| `ghast-locket.max-level` | 3 | Ghastbound Locket tiers (I no fall damage, II sneak-glide, III double-jump) |
| `ghast-locket.level-{2,3}-cost` | 30000 / 60000 | Upgrade costs |
| `ghast-locket.double-jump-power` | 0.9 | Tier-III leap upward velocity |
| `verdant-band.max-level` | 3 | Verdant Band tiers (radius crop growth) |
| `verdant-band.level-{1,2,3}-radius` | 4 / 6 / 8 | Growth radius per tier |
| `verdant-band.level-{2,3}-cost` | 25000 / 50000 | Upgrade costs |
| `verdant-band.interval-ticks` | 40 | How often a carrier's surroundings are sampled |
| `verdant-band.blocks-per-pass` | 12 | Random blocks checked per pass (keep small) |
| `verdant-band.grow-chance` | 0.6 | Chance a sampled crop advances a stage |
| `verdant-band.level3-burst-chance` | 0.15 | Tier III: chance to fully grow one crop per pass |
| `miner-lantern.max-level` | 3 | Miner's Lantern tiers (Night Vision, + Haste I, + Haste II underground) |
| `miner-lantern.level-{2,3}-cost` | 18000 / 36000 | Upgrade costs |
| `miner-lantern.sky-light-threshold` | 3 | "Underground" = block sky light ≤ this |
| `miner-lantern.interval-ticks` | 40 | Re-check interval |
| `warden-sigil.max-level` | 3 | Warden's Sigil tiers (sculk ignores you, mobs shed aggro, sneak-vanish) |
| `warden-sigil.level-{2,3}-cost` | 30000 / 55000 | Upgrade costs |
| `warden-sigil.aggro-drop-chance` | 0.5 | Tier II: chance a targeting mob loses your trail |
| `tempest-vial.power` | 1.6 | Launch strength of the single-use Tempest Vial |
| `tempest-vial.glide-seconds` | 6 | Slow Falling tail length |
| `spawner-compass.max-radius-chunks` | 16 | Diviner's Compass scan radius (≈256 blocks) |
| `spawner-compass.chunks-per-batch` | 6 | Async chunk loads per tick (lower = gentler) |
| `spawner-compass.min-skip-blocks` | 8.0 | Ignore spawners closer than this |
| `spawner-compass.timeout-seconds` | 15 | Give up (item not consumed) after this long |
| `signshops.enabled` | true | Sign-shop master switch |
| `history.retention-days` | 90 | `sales.db` rows older than this are pruned on boot |
| `categories.<key>.name` | e.g. `&eBuilding Blocks` | Category display name (colour codes allowed) |
| `categories.<key>.icon` | e.g. BRICKS | Category icon material |
| `categories.<key>.items` | 8 categories, 119 items shipped: building 22, art 11, wood 10, ores 14, farming 15, mobdrops 18, food 13, utility 16 (mc.pvpers.us runs 200 items, 92 of them art) | One entry per item, fields: `material`, `buy` (0 = not sold), `sell` (0 = not bought), optional `appetite` (units/day); keep buy ≥ ~3× sell; max 45 items per category |

**Good to know**
- Data files in `plugins/FrontierShop/`: `demand.db` (ticker state), `market.db` (listings, mailbox, notices), `sales.db` (price history, deal picks, black-market window/stock), `overrides.yml` (admin price overrides — kept separate so `config.yml` is never rewritten). All SQLite files run in WAL mode so other tools can read them live; if a DB fails to open the shop degrades to in-memory and keeps working.
- Midnight rollover is lazy (missed days are replayed on first access) and keyed to the JVM timezone; the same clock drives daily deals and black-market windows, so set FrontierBorder's `server-timezone` on a UTC host.
- The plugin warns on boot if any catalog pair is arbitrage-risky (`sell` more than ~60 % of `buy`); fix in config or with `/shopadmin price`. Boat/utility sinks like Lead and Name Tag ship with `sell: 0` on purpose.
- Black-market stock is per window and keyed by entry (custom id or material), so several rows sharing a material never collide; closing a window with `/shopadmin blackmarket close` keeps it shut until the next scheduled one. The `spawner_random_*` entries are not in the shipped config — add rows yourself.
- Market sales are paid straight to the seller's balance, even offline. The market's own mailbox (in `market.db`) only holds returned items — FrontierShop does not deliver through FrontierMail.
- Most-tweaked knobs: catalog prices/appetites, `market.tax`, `blackmarket.schedule` and roster `days`, and the `level-N-cost` curves for the Upgrade Station.

---

## FrontierEvents
> Arena events for survival servers — co-op Boss Rush raids, player-started raid keys, the endless Gauntlet, TDM/FFA/KOTH, duel tournaments with wagers, Colosseum Night and an open PvP ring — with three gear modes and crash-safe isolation.  **v1.6.1** · Download: [Modrinth](https://modrinth.com/plugin/frontier-events) · [GitHub](https://github.com/carsonxdd/frontier/tree/master/events)

**What it does** — An event and minigame engine that runs inside a normal survival world. **Boss Rush** is the flagship: a party fights trickle-spawned waves of armored mobs up to a phased, scripted boss across six themed raids (plus the endless **Gauntlet**), with per-wave lives, class kits, cobweb/barricade traps, a **Pit** difficulty ladder (1–5) that scales mobs, payouts and loot odds, and four-tier RNG loot including above-vanilla-cap **Pitforged** gear. **Raid Keys** let players start their own raids WoW-keystone style with no admin present. **TDM/FFA**, **KOTH** and **FFA-KOTH** PvP with kits, placeable cobwebs and siegeable fort barricades, and **Duel Tournaments** (1v1 single-elimination bracket, best-of-3 final, parimutuel wagers) round out the modes. **Colosseum Night** is the one event that schedules itself: sign-ups open before a set start time, modes rotate (FFA, FFA-KOTH, TDM…), and everyone fights in the same **Knight** kit, getting their own gear back afterwards. The prize is a fixed winner's chest — **$500 + 4 diamonds + 8 XP bottles + one jackpot roll**, with the cash split in team modes. The **open ring** is a standing PvP ring in the colosseum; ring deaths drop items on the ring floor (no grave). Every event runs in one of three **gear modes** — `[KIT]` (provided loadouts, nothing at stake), `[BYOG]` (bring your own gear, deaths never drop it) or `[HARDCORE]` (your gear drops where you fall) — behind a click-through consent gate. Two design pillars stand out: **no item loss unless explicitly opted into** (Boss Rush intercepts fatal hits instead of letting you die; event deaths don't inflate your real death count; inventories are snapshotted to SQLite on join and restored even after a crash), and **the arena never needs a reset** (block changes are prevented rather than rolled back; traps decay or are swept; the colosseum is grief-proof even between events). Everything player-facing is GUI-driven — clickable join broadcast, Event Hub, Colosseum Night sign-up, kit and team pickers, admin control panel — and anyone can spectate a running event.

**Requires / integrates with**
| | |
|---|---|
| Required | Paper 26.3+, Java 25+; `sqlite-jdbc` is downloaded automatically at first boot |
| Optional | Vault + any economy (money payouts, wagers, raid-key start costs — without it runs still complete and loot/stats still happen, money is skipped); FrontierMail (loot that won't fit or arrives while offline is mailed to `/mailbox`; otherwise ground-drop / lost for offline players); FrontierGraves (stray graves are swept out of the arena at teardown); FrontierAnnouncements (Gazette posts) |
| Used by | FrontierReputation (uses `EventApi` to exempt arena combat from murders/bounties/PvP opt-out), FrontierTab (does not count event or ring-edge deaths), FrontierGraves (implements `GraveApi`, refuses to spawn graves in a live event or for ring-edge deaths), FrontierHeads (no head for event or ring kills), FrontierStatsAPI (serves `stats.db` on `/api/events/*` and `/api/events/pvp/*`) |

**Commands** — `/event help`, `/event night` and `/event ring` also work from console; everything else is player-only. `/event` is one command; rows marked Admin are gated on `frontier.events.admin` inside the command.
| Command | Who | What |
|---|---|---|
| `/event` (also `hub`, `gui`) | Everyone | While an event is live: the Event Hub GUI (join/leave/spectate, kit, team, info); mid-match the join button becomes Spectate. With no event running: the Colosseum Night sign-up GUI while sign-ups are open, otherwise the chat help list |
| `/event help` | Everyone | Chat list of the event commands |
| `/event night` (also `colosseum`, `chest`, `pitchest`) | Everyone | Colosseum Night schedule and sign-up |
| `/event night now [seconds]` / `stop` / `reload` | Admin | Run Colosseum Night now (optional `[seconds]`), stop it, or reload its config |
| `/event ring [status]` | Everyone | Open PvP ring status |
| `/event ring open\|close` | Admin | Open or close the open ring |
| `/event join [team]` | Everyone | Join the current event (allowed through the countdown); first join of a BYOG/hardcore event shows the risk warning + a click-through confirm |
| `/event leave` | Everyone | Leave the event (inventory restored; forfeits payout mid-match; the starter walking out of their own key run counts as a wipe) |
| `/event spectate` (also `watch`) | Everyone | Watch any event, even mid-match — spectator mode, arena leash, no effect on results or payouts; `/event leave` to exit |
| `/event kit` | Everyone | Open the kit selector (auto-opens on join; picks lock at match start; explains there are none in own-gear events) |
| `/event team` | Everyone | Open the team selector (team modes) |
| `/event key` (also `keys`) | Everyone | Raid-key board GUI: your key's Pit, the six raids with cleared/next/locked status, one-click starts |
| `/event key start <raid> [pit] [kit\|byog]` | Everyone | Start a key run directly; lower Pits than your key = practice runs |
| `/event info` | Everyone | Current event info, including the gear-mode tag |
| `/event stats [player]` | Everyone | Your (or another player's) cumulative Boss Rush / PvP totals |
| `/event leaderboard` (also `top`) | Everyone | Top players from `stats.db` |
| `/event bet <fighter> <amount>` | Everyone | Duels only: parimutuel stake on the current pairing while the betting window is open (fighters of that match excluded; top-ups OK, no side-switching) |
| `/event create <name> <type> <arena> [teams\|raid] [pit] [kit\|byog\|hardcore]` | Admin | Create an event; `type` = `BOSS_RUSH`, `TDM`, `FFA`, `KOTH`, `FFA_KOTH` or `DUEL`; Boss Rush takes a raid key + optional Pit; a trailing gear word picks the mode (default `defaults.gear-mode`) |
| `/event start` / `/event forcestart` | Admin | Start with countdown / start now |
| `/event stop` (also `cancel`) | Admin | Cancel the event (refunds key start fees) |
| `/event forceend [clear\|wipe]` (also `forceresolve`, `forcepayout`) | Admin | Force-resolve a stuck live event: default = clear payout, `wipe` = resolve as a loss |
| `/event settings <key> <value>` | Admin | Tune `time`, `scorelimit`, `respawn`, `respawndelay`, `difficulty`, `gearmode` (only while the lobby is empty), `testmode` (dev toggle: 1 glass-jaw add per wave + a 30-HP boss) |
| `/event difficulty <n>` (also `pit <n>`) | Admin | Shorthand for `settings difficulty <n>` |
| `/event admin` | Admin | Control-panel GUI: create wizard (mode → arena → raid → Pit → gear), start/stop, lobby settings, force-join/kick |
| `/event forcejoin <player> [team]` | Admin | Add an online player to the lobby (skips the consent gate but still warns them) |
| `/event kick <player>` | Admin | Remove a player (inventory restored; win condition re-checked) |
| `/event statedit get\|set\|add\|reset\|run …` | Admin | Edit persisted stats rows in `stats.db` for online or offline players (`get <player> [bossrush\|pvp\|keys]`, `set\|add <player> <bossrush\|pvp\|keys> <field> <value>`, `reset <player> <…>`, `run <eventId> cleared <true\|false>`); bare `statedit` prints the field list |
| `/arena create\|delete\|setlobby\|setspawn\|pos1\|pos2\|setcenter\|radius\|height\|list\|info <name> …` | Admin | Build and inspect arenas: `setcenter` + `radius <x> <z>` + `height` define the elliptical combat ring, `pos1`/`pos2` the outer stands box, `setlobby` the lobby spawn, `setspawn <name> red` a combat spawn |
| `/kit list` / `/kit give <name>` | Admin | List configured kits / give yourself one to test |

**Permissions**
| Node | Default | Grants |
|---|---|---|
| `frontier.events.use` | true | `/event` participation subcommands (join, leave, spectate, kit, team, key, info, stats, leaderboard, bet, hub) |
| `frontier.events.admin` | op | `/arena`, `/kit`, and the admin subcommands of `/event` (create/start/stop/forceend/settings/admin/forcejoin/kick/statedit); also lets you start a key run without holding a key |
| `frontier.events.bypass` | op | Exempt from the in-event command whitelist and from arena containment / idle grief protection (staff) |

**Config** — path `plugins/FrontierEvents/config.yml`, reload: restart required for most keys (config is parsed at enable); `/event night reload` reloads the Colosseum Night config
| Key | Default | What it controls |
|---|---|---|
| `defaults.duration` | `300` | Event duration in seconds (0 = no time limit) — PvP-mode default |
| `defaults.score-limit` | `50` | First team/player to reach this wins (0 = no limit) |
| `defaults.countdown` | `10` | Seconds of countdown before an event starts |
| `defaults.respawn` | `true` | Allow respawning in PvP (`false` = elimination mode) |
| `defaults.respawn-delay` | `3` | Seconds before respawn |
| `defaults.gear-mode` | `kit` | `kit`, `byog` or `hardcore` — used when create doesn't specify one |
| `kits.<name>` | 11 kits: `knight`, `archer`, `tank`, `scout`, `pvp_healer`, `rush_tank`, `rush_dps`, `rush_healer`, `rush_ranged`, `rush_trapper`, `rush_berserker` | One entry per kit, fields: `icon`, `description` (lore lines), `items` (`MATERIAL[:amount[:ENCHANT=lvl]]`, potions as `POTION:amount:TYPE`), `armor.{helmet,chestplate,leggings,boots}`, `effects` (`EFFECT:ticks:amplifier`), optional `role: healer` (adds a live "Healing" sidebar line) |
| `pvp.kits` | `[knight, archer, tank, scout, pvp_healer]` | Kits offered in TDM/FFA (must exist in `kits:`); first entry is the default |
| `pvp.cobweb.{enabled, cap, decay-seconds, max-height, refund}` | `true, 6, 60, 3, false` | Placeable kit cobwebs in PvP: per-player cap, seconds before they crumble, max blocks above feet, refund on decay |
| `pvp.barricade.{enabled, material, amount, decay-seconds, max-height, kits}` | `true, OAK_PLANKS, 10, 0, 3, [knight, archer, tank, scout]` | Fort planks: `amount` doubles as the cap; `decay-seconds: 0` = stands until match end (enemies can still break them ~3 s/block); which kits carry them |
| `pvp.rewards.participation.money` | `150` | Paid to everyone who finishes a match |
| `pvp.rewards.win-pool.money` | `2500` | TDM: split evenly among the winning team |
| `pvp.rewards.ffa-podium` | `[1250, 750, 500]` | FFA top 3 by kills (used instead of win-pool) |
| `pvp.rewards.per-kill.{money, cap}` | `25, 500` | Per kill and the per-match cap (0 = uncapped) |
| `pvp.rewards.mvp-bonus.money` | `500` | Most kills overall, either mode |
| `koth.*` | hill radius 4, height 4, 1 pt/s | King of the Hill (KOTH and FFA-KOTH): hill size and the points per second for holding it |
| `arena-chest.*` | 20:00, 10-min sign-up, `knight` kit | Colosseum Night: start time and `timezone` (America/Phoenix on mc.pvpers.us), sign-up window, the fixed kit everyone fights in, the mode rotation (ffa / ffa_koth / tdm …) and the fixed winner's chest ($500 + 4 diamonds + 8 XP bottles + one jackpot roll; cash split in team modes) |
| `open-ring.*` | — | The open PvP ring; deaths in it drop items on the ring floor (no grave) |
| `duel.kits` | `[]` | Kits offered in duels; empty = `pvp.kits` |
| `duel.round-seconds` | `90` | Seconds per round; on timeout the higher damage total wins (coin flip at 0–0) |
| `duel.final-best-of` | `3` | The final is best-of-N; earlier matches are best-of-1 |
| `duel.intermission-seconds` | `6` | Breather between matches and between final rounds |
| `duel.rewards.{participation, per-duel-win, champion, runner-up}` | `150, 200, 1500, 500` | Duel purse |
| `duel.wagers.{enabled, rake, min-bet, max-bet, window-seconds}` | `true, 0.05, 10, 2000, 20` | Parimutuel betting: house cut at settle, stake limits per player per match, betting window after a pairing is announced |
| `boss-rush.lives` | `2` | Lives **per wave**; anyone who ran out is revived at the next wave — you only wipe if the whole team is down within one wave |
| `boss-rush.min-players` | `1` | Minimum players to start (solo works) |
| `boss-rush.wave-break.{countdown-seconds, regen-seconds}` | `5, 4` | Between-wave breather: action-bar countdown before the next wave (0 = instant) and seconds of Regeneration II for survivors |
| `boss-rush.scaling.{boss-hp-per-player, adds-per-player, add-multiplier, max-adds}` | `0.5, 0.25, 1.0, 0` | Party-size scaling: boss HP per extra player, extra adds per extra player, global dial on every wave's add count (drop to ~0.4 for solo testing), hard cap on adds per wave (0 = uncapped) |
| `boss-rush.pit.max-level` | `5` | Highest Pit level |
| `boss-rush.pit.{hp-per-level, damage-per-level, speed-per-level, speed-mult-cap}` | `1.00, 0.00, 0.10, 1.75` | Linear per-Pit multipliers on mob HP, damage and movement speed (default: Pit makes mobs tankier and faster, not harder-hitting), plus the speed ceiling |
| `boss-rush.pit.money-per-level` | `0.75` | All Boss Rush money ×(1 + 0.75·Pit) |
| `boss-rush.pit.{rare-chance-per-level, epic-chance-per-level, rare-chance-cap, epic-chance-cap}` | `0.10, 0.05, 0.75, 0.75` | Loot odds added per Pit and the ceilings they can never exceed (`legendary-chance-*` keys are present but commented out) |
| `boss-rush.pit.pitforged-loot-threshold` | `1` | At or above this Pit a won epic roll draws from the raid's `pitforged` table instead of its epics |
| `boss-rush.kit-scaling.{enabled, protection, sharpness, power, unbreaking, armor-tier-bump}` | `true, [0,1,2,3,4,2], [0,1,1,2,3,4], [0,1,1,2,3,4], [0,0,1,1,2,2], [0,0,0,0,0,1]` | Pit-indexed lists (index 0 = Pit 0) layering enchants onto provided kits and bumping armor material tiers (leather → chain → iron → diamond) so kits keep pace; own-gear modes are never touched |
| `boss-rush.stuck-mob.{enabled, glow-seconds, kill-seconds, move-threshold}` | `true, 8, 20, 1.0` | Wave-stall failsafe: an add that stops moving glows and is teleported to the arena centre, then force-removed if still stuck; the boss is exempt |
| `boss-rush.max-active` / `max-active-per-player` / `max-active-solo` | `8, 2, 4` | How many adds are alive at once (the wave total trickles in): base for a 2-player group, extra per player beyond the 2nd, and a gentler cap for a solo player; a per-wave `max-active` in `raids:` overrides |
| `boss-rush.equipment.{enabled, base-chance, rise-per-wave, max-chance}` | `true, 0.35, 0.18, 0.9` | Mob gear ramp by wave tier (leather → gold → chain → iron; wood → stone → iron → diamond weapons); nothing drops |
| `boss-rush.equipment.{spear-chance, spear-chance-per-wave, spear-chance-max}` | `0.18, 0.07, 0.85` | Fraction of armed melee adds carrying a spear instead of a sword, rising per wave |
| `boss-rush.kits` | `[rush_tank, rush_dps, rush_healer, rush_ranged, rush_trapper, rush_berserker]` | Kits offered in Boss Rush; first is the default |
| `boss-rush.barricade.{enabled, material, amount, decay-seconds, max-height, kits}` | `true, OAK_PLANKS, 8, 30, 3, [rush_tank, rush_healer]` | Temporary cover blocks (cap = amount, crumble after N seconds, refunded on decay) |
| `boss-rush.cobweb.{enabled, cap, decay-seconds, max-height, refund}` | `true, 6, 8, 3, true` | Crowd-control webs every kit carries; short decay so nobody can wall off the boss |
| `boss-rush.taunt.{enabled, duration-seconds, cooldown-seconds, kits}` | `true, 5, 12, [rush_tank]` | Right-click taunt tool that forces every live mob onto the tank (outranks a boss fixate) |
| `boss-rush.rewards.wipe-pays-nothing` | `true` | A wipe pays no money and no items |
| `boss-rush.rewards.participation.{money, items}` | `250, [EMERALD:3]` | Flat floor for everyone who joins and stays |
| `boss-rush.rewards.pool.money` | `5000` | Performance pool split by weighted score |
| `boss-rush.rewards.weights.{damage, damage-taken, healing, adds, survival-bonus, death-penalty}` | `1.0, 0.8, 12.0, 6.0, 200.0, 120.0` | Score = Σ(metric × weight) − livesLost × death-penalty + survival-bonus if survived |
| `boss-rush.rewards.{metric-cap, min-score}` | `0.0, 1.0` | Anti-abuse cap per metric (0 = uncapped) and minimum score to share the pool |
| `boss-rush.rewards.clear-bonus.{money, items}` | `1000, []` | Everyone gets this if the boss actually dies |
| `boss-rush.rewards.category-bonus.money` | `750` | Flat extra for topping a category (Top Damage / Best Tank / Best Support / Most Adds / Survivor) |
| `boss-rush.rewards.jackpot.{enabled, top, items}` | `true, 1, [SPAWNER:1]` | Rare top-placement drop on a clear (raids that define their own `loot` table use that instead) |
| `boss-rush.default-raid` | `zombie` | Raid used when create doesn't name one |
| `boss-rush.raids.<key>` | 6 raids + `gauntlet`: `zombie`, `skeleton`, `wither`, `spider`, `illager`, `champion` | One entry per raid, fields: `display`; `waves` (list of `{mobs: {TYPE: total}, max-active}` add waves ending in `{boss: <boss key>}`); `loot.{epic-top, rare-chance, epic-chance, epic-top-chance}` (`3, 0.35, 0.15, 0.35`) and item lists `loot.{pitforged, epic, rare, common}` (each item: `material`, `amount`, `name`, `lore`, `enchants`; `legendary` + `legendary-chance` present but commented out) |
| `boss-rush.raids.gauntlet.{display, endless, boss-every, boss-hp-mult, bosses}` | `The Gauntlet, true, 5, 0.6, [all six bosses]` | Endless raid: waves are generated from `pool`, every 5th wave the next boss in rotation spawns at 60% of its raid HP |
| `boss-rush.raids.gauntlet.escalation.{hp-per-wave, damage-per-wave, count-per-wave, count-cap}` | `0.06, 0.03, 0.04, 45` | Compounding per-wave multipliers on top of Pit and party scaling; hard cap on a wave's adds |
| `boss-rush.raids.gauntlet.rewards.{participation-money, money-per-wave-base, money-per-wave-growth}` | `100, 75, 25` | Money banked per cleared wave (paid at run end, Pit-multiplied, so a wipe never zeroes it) |
| `boss-rush.raids.gauntlet.milestone-every` | `10` | Server-wide broadcast every N cleared waves |
| `boss-rush.raids.gauntlet.loot-scaling.{rare-chance-per-wave, epic-chance-per-wave, rare-chance-cap, epic-chance-cap}` | `0.01, 0.005, 0.75, 0.50` | Boss-kill loot odds climb with depth, up to the caps |
| `boss-rush.raids.gauntlet.pool` | 10 wave templates | Same format as `waves`; themes mixed from all six raids |
| `bosses.<key>` | 6 bosses: `zombie_king`, `skeleton_king`, `wither_king`, `broodmother`, `grand_augur`, `pit_champion` | One entry per boss, fields: `base` (EntityType), `health`, `damage`, `speed`, `knockback-resist`, `armor`, `bossbar.{title, color}`, `phases` (list of `{at: <HP %>, name, announce, bossbar, on-enter: [...], abilities: [...]}`); abilities are `ground_slam`, `summon_adds`, `fixate`, `volley`, `enrage`, `debuff`, `fangs`, `leap`, each with a `cooldown` and its own params |
| `keys.enabled` | `true` | Player-started raid keys on/off |
| `keys.raid-order` | `[zombie, skeleton, spider, wither, illager, champion]` | Ladder unlock order (non-endless raids only; the Gauntlet can never be a key run) |
| `keys.start-cost-base` | `150` | Starting a run costs base × (Pit + 1), sunk win or lose (refunded only on admin stop or crash); joining is free |
| `keys.daily-starts` / `keys.cooldown-minutes` | `3, 15` | Per-player limits on starts (joins are unlimited) |
| `keys.min-players` | `3` | Fighters required in the lobby before a key run can launch (spectators and disconnected players don't count; re-checked when the countdown ends). If fewer finish, pool and category money scale to fighters / min-players |
| `keys.reward-multiplier` | `0.35` | Key-run money payouts are scaled by this (loot rolls untouched) |
| `keys.paid-clears-per-day` | `2` | Key clears per player per day that pay money; later clears roll loot only |
| `keys.cap-per-ip` / `keys.ip-exempt` | `true`, — | Also count the paid-clear cap per connection (hashed IP), and the exemptions from that |
| `keys.money-needs-contribution` | `true` | Key-run money only goes to raiders who contributed (dealt or took damage, killed an add, or healed); AFK raiders get loot only |
| `keys.wipe-pays-nothing` | `true` | A wiped key run pays nothing (admin raids keep normal wipe payouts) |
| `keys.arena` | `""` | Arena for key runs; empty = the first arena defined |

**Good to know**
- Arenas are two-zone: an inner elliptical combat ring (`setcenter` + `radius` + `height`) inside an outer stands box (`pos1`/`pos2`). Before a match players roam the stands and are kept out of the ring; during it the leash flips to the ring. A box-only arena also works. The whole footprint is build-protected even when idle for anyone without `frontier.events.bypass`, natural mob spawns are blocked in it, and outsiders are bounced off the combat floor.
- Two SQLite files live in `plugins/FrontierEvents/`: `vault.db` (inventory snapshots, placed traps — restored/swept on boot after a crash) and `stats.db` (`event_history`, `event_players`, `loot_log`, `payout_log`, `player_totals`, `pvp_totals`, `player_keys`, `live_event`) — the latter is what FrontierStatsAPI serves.
- Loot is public, money is private: every drop is broadcast as `<name> received <item>`, while each earner is whispered their own `You earned $X (…)` line. Event deaths never touch your real death statistic or spawn a grave.
- The legendary loot tier is fully built but disabled in the shipped config (too much permanent power leaking into survival); uncomment the `loot.legendary` blocks and `legendary-chance` keys to re-enable it.
- The most common owner tweaks are `boss-rush.scaling.add-multiplier` (lower it for a small server), the `rewards` money figures if your economy is tighter or looser, `defaults.gear-mode`, and `keys.min-players` / `keys.daily-starts` / `keys.paid-clears-per-day` to control key-run pacing. Remember most edits need a restart.
- Colosseum Night and the open ring are fought under the event rules: nobody's own gear is at risk in Colosseum Night, and a death in the open ring (or just after leaving it) drops items on the ring floor instead of making a grave, isn't counted by FrontierTab and drops no head.

---

## FrontierStatsAPI
> A read-only HTTP/JSON API baked into the server so a website or bot can show live stats without RCON, FTP or a database.  **v1.19.0** · Download: [Modrinth](https://modrinth.com/plugin/frontier-statsapi) · [GitHub](https://github.com/carsonxdd/frontier/tree/master/statsapi)

**What it does** — Starts a small HTTP server on its own port and answers `GET` requests with server status, player summaries, leaderboards (playtime with all/week/month windows, deaths, XP, mob kills, blocks and ores mined, distance, advancements, mcMMO power level), per-player advancement and mcMMO skill detail, and everything the other Frontier plugins keep on disk — border, reputation, events/PvP, shop, economy, and the Frontier Gazette feed. Its defining decision is that it reads sibling plugins **off disk, not through their APIs**: FrontierTab's YAML files, SQLite databases opened read-only, EssentialsX userdata — so a sibling being disabled or on an older version degrades a route to an omitted field or a `503`, never a crash. It is cheap by design (one JSON parse per player instead of ~1,100 statistic calls, cached baltop and advancement catalog) and includes a CORS allow-list, per-IP rate limiting and preflight handling. Full route parameters, response shapes and error cases are in the repo's docs/API.md.

**Requires / integrates with**
| | |
|---|---|
| Required | Paper 26.3+, Java 25+, FrontierTab (its per-player files are the player index — no players, leaderboards or today-stats without it); `sqlite-jdbc` is downloaded automatically at first boot (needs outbound internet once) |
| Optional | FrontierBorder (`/api/border`), FrontierReputation (`/api/reputation/*`), FrontierEvents (`/api/events/*`), FrontierShop (`/api/shop/*`), FrontierAnnouncements (`/api/gazette`), mcMMO (`/api/players/{uuid}/skills` and the `power_level` leaderboard), EssentialsX (`/api/economy/baltop`; discovered by folder, not declared) |
| Used by | none in-game — consumers are websites/bots (e.g. the reference server's companion site) |

**Commands**
| Command | Who | What |
|---|---|---|
| `/statsapi reload` | Admin | Re-read `config.yml` (rate limit, ores list, CORS origins); port changes still need a restart |
| `/statsapi resetdeaths` | Admin | Prints a warning and does nothing |
| `/statsapi resetdeaths confirm` | Admin | Reset every player's **vanilla** `minecraft:deaths` statistic to 0 (online via the API, offline by rewriting their stats file); note this is *not* the deaths number the API serves |

**Permissions**
| Node | Default | Grants |
|---|---|---|
| `frontier.statsapi.admin` | op | `/statsapi reload` and `/statsapi resetdeaths` |

**Config** — path `plugins/FrontierStatsAPI/config.yml`, reload: `/statsapi reload` (everything except `port`, which needs a restart)
| Key | Default | What it controls |
|---|---|---|
| `port` | `17249` | HTTP listener port; binds all interfaces; read once at enable |
| `allowed-origins` | `["https://example.com", "http://localhost:3000"]` | CORS allow-list — an `Origin` header that exactly matches an entry gets it echoed back; anything else gets no CORS header (browsers block, curl doesn't care) |
| `rate-limit` | `60` | Max requests per client IP per fixed 60-second window; over it returns `429` |
| `ores` | 19 materials (coal → ancient debris, incl. deepslate + nether variants) | Bukkit `Material` names that count toward `?stat=ores_mined`; unknown names log a warning and are skipped (`blocks_mined` needs no list) |

**Routes** — base URL `http://<host>:<port>`, all `GET`, all JSON. One row per route group; see docs/API.md in the repo for every parameter and example response.
| Group | Routes | Needs |
|---|---|---|
| Server | `/api/server`, `/api/plugins` | — |
| Players | `/api/players`, `/api/players/{uuid}`, `/api/players/{uuid}/advancements`, `/api/players/{uuid}/skills` | FrontierTab; world advancement files; mcMMO for skills |
| Leaderboards | `/api/leaderboard?stat=&window=&limit=` | FrontierTab (+ mcMMO for `power_level`) |
| Border | `/api/border` | FrontierBorder |
| Economy | `/api/economy/baltop?limit=` | EssentialsX userdata |
| Reputation | `/api/reputation/leaderboard/{outlaws\|peaceful\|violence\|lawmen\|donors\|streaks}`, `/api/reputation/{wanted\|economy\|donations\|recent}`, `/api/reputation/player/{name}` | FrontierReputation |
| Events | `/api/events/{leaderboard\|categories\|recent\|summary\|live}`, `/api/events/loot/recent`, `/api/events/run/{id}`, `/api/events/player/{nameOrUuid}` | FrontierEvents |
| PvP | `/api/events/pvp/{leaderboard\|recent}`, `/api/events/pvp/player/{nameOrUuid}` | FrontierEvents |
| Shop | `/api/shop/{catalog\|market\|deals\|history}` | FrontierShop |
| Gazette | `/api/gazette?limit=` | FrontierAnnouncements |

**Good to know**
- There is **no authentication and no bind-address option**; everything served is public-leaderboard grade, but `/api/reputation/wanted` includes last-seen coordinates and `/api/plugins` lists every installed plugin and version — put it behind a reverse proxy or firewall if that matters.
- The `deaths` field is FrontierTab's own counter (excludes event-arena deaths); `/statsapi resetdeaths` zeroes the vanilla statistic, which no route reads — use `/tab reset <player> deaths` for the number the API shows.
- A `503 … not available` on an events/reputation sub-route usually means the sibling is on an older build that hasn't created that table/column yet; upgrade it and the flag latches on the first time the schema is seen.
- "Address already in use" at boot means another process holds the port — the plugin still enables but serves nothing until you change `port` and restart.
- Day boundaries (`today_*`, streaks, shop deals) use the JVM timezone; FrontierBorder's `server-timezone` sets that for the whole server.

---

## FrontierBorder
> The world border grows itself from combined player-hours — one predictable expansion a night.  **v2.5.0** · Download: [Modrinth](https://modrinth.com/plugin/frontier-border) · [GitHub](https://github.com/carsonxdd/frontier/tree/master/border)

**What it does** — The overworld starts small and earns its growth from how much everyone played. Once a day, at a configured local hour, FrontierBorder reads yesterday's AFK-aware playtime from FrontierTab, matches the combined hours against a tier table, clamps the result by current world size, and animates the border outward (the Nether follows at 1/8 scale, the End optionally). The distinctive choices: expansion is *scheduled* (one nightly event everyone can watch, sized by the previous full day) rather than a silent trickle, and thresholds scale with the number of active players so five people playing an hour each is harder to clear than one person playing five. It also carries two small server-wide policies: it sets the JVM's default timezone from `server-timezone` before any other plugin loads (so every plugin's "midnight" is your local midnight even on hosts that run Java in UTC), and it can cancel enderman block grief without touching `mobGriefing`. It also handles **spawn protection** — near spawn there is no fire spread or burning, no ignition, no lava, and explosions break no blocks (campfires and nether-portal lighting still work) — and can apply **gamerules** to every world, e.g. `players_sleeping_percentage`.

**Requires / integrates with**
| | |
|---|---|
| Required | Paper 26.3+, Java 25+, FrontierTab (source of playtime — the plugin refuses to load without it) |
| Optional | FrontierAnnouncements (Gazette posts). A Discord webhook URL can also be set for expansion announcements |
| Used by | FrontierTab (reads `data.yml` + config for the `Border: 1500 → 1750` header element), FrontierStatsAPI (serves `data.yml` on `/api/border`) |

**Commands**
| Command | Who | What |
|---|---|---|
| `/borderinfo` | Everyone | Radius / max, center, total expansions, paused state, and tonight's preview (yesterday's hours, active players, blocks earned) or period progress in continuous mode |
| `/border info` | Admin | Same output as `/borderinfo` |
| `/border expand <amount>` | Admin | Grow the radius by `<amount>` blocks now (animated over `expand-duration`, clamped to `max-radius`); recorded as `manual` |
| `/border set <radius>` | Admin | Set the radius directly (instant), mirror to other dimensions, and reset the period counters so auto-expansion is re-armed |
| `/border pause` | Admin | Pause automatic expansion (playtime still accrues; flag persists across restarts) |
| `/border resume` | Admin | Resume automatic expansion |
| `/border reset` | Admin | Zero the period playtime counter and re-arm expansion for this period |
| `/border autopregen [on\|off]` | Admin | Show or toggle automatic ring pre-generation after expansions (writes `auto-pregen` back to config.yml) |
| `/border pregen` | Admin | Pre-generate every chunk inside the current overworld border, with a broadcast progress bar every 10 s |
| `/border cancelpregen` | Admin | Stop a running pre-generation |

All commands also work from console.

**Permissions**
| Node | Default | Grants |
|---|---|---|
| `frontier.border.admin` | op | `/border` and every subcommand |
| `frontier.border.info` | true | `/borderinfo` |
| `frontier.border.spawn.bypass` | op | Ignore spawn protection |

**Config** — path `plugins/FrontierBorder/config.yml`, reload: restart required (no reload command; only `auto-pregen` is written live by `/border autopregen`)
| Key | Default | What it controls |
|---|---|---|
| `server-timezone` | `system` | IANA zone id (e.g. `America/New_York`) applied to the whole JVM at load; `system` leaves the host default alone; unknown ids are logged and ignored (mc.pvpers.us runs `America/Phoenix`) |
| `border.initial-radius` | `1750` | Radius (not diameter) applied on first boot (mc.pvpers.us runs 5000) |
| `border.max-radius` | `10000` | Hard ceiling; expansion stops here (mc.pvpers.us runs 20000) |
| `border.dimensions.nether` | `true` | Mirror the overworld border into the Nether at 1/8 scale |
| `border.dimensions.end` | `false` | Mirror into the End at 1:1; `false` pushes the End border to the vanilla maximum (unbounded) |
| `reset-mode` | `daily` | `daily` or `weekly` — the period model used by continuous mode and `/border reset` |
| `reset-hour` | `0` | Hour (0–23, server-local) the period counter resets |
| `week-reset-day` | `SUNDAY` | Day the weekly reset fires; only used when `reset-mode: weekly` |
| `expansion-mode` | `scheduled` | `scheduled` = one expansion per day at `expansion-hour` sized by yesterday's playtime; `continuous` = top up toward the earned tier on every check |
| `expansion-hour` | `21` | Hour (0–23, server-local) the scheduled expansion fires (first check at/after this hour) |
| `expansion-tiers` | 5 tiers: 8h→500, 5h→400, 3h→300, 1.5h→200, 0.5h→100 | Combined player-hours → blocks; one entry per tier, fields `hours`, `blocks`; first match wins so list highest-hours first |
| `scaling.enabled` | `true` | Multiply tier hour thresholds by `activePlayers^exponent` (a lone player is never scaled) |
| `scaling.exponent` | `1.15` | Population-scaling exponent (mc.pvpers.us runs 0.5) |
| `scaling.min-active-seconds` | `0` | Period playtime needed to count as an "active" player (0 = any participation) |
| `world-size-caps` | 3 caps: <4000→500, <7000→375, <10000→250 | Clamp on any single expansion by current radius; one entry per cap, fields `below-radius`, `max-blocks`; first match wins so list smallest radius first. mc.pvpers.us adds a 4th cap, <20000→250 |
| `check-interval-minutes` | `10` | Scheduler period; also the precision of the expansion time |
| `expand-duration` | `60` | Seconds the border animates outward |
| `announce-expansion` | `true` | Chat broadcast + sound to everyone online on expansion |
| `broadcast-sound` | `ENTITY_PLAYER_LEVELUP` | Any Bukkit `Sound` name; an invalid name is silent |
| `discord-webhook-url` | `""` | POSTs an embed on every automatic expansion; empty = off |
| `auto-pregen` | `false` | Ring-pregenerate the new band after each automatic expansion (CPU-heavy; enable on the live server, not a test box) |
| `prevent-enderman-grief` | `true` | Cancel enderman block pickup/placement without touching the `mobGriefing` gamerule |
| `spawn-protection.*` | mc.pvpers.us: on, 100 blocks | Within this radius of spawn: no fire spread or burning, no ignition, no lava, and explosions break no blocks; campfires and nether-portal lighting still allowed. `frontier.border.spawn.bypass` ignores it |
| `gamerules.*` | mc.pvpers.us: players_sleeping_percentage 50 | Gamerules applied to every world |

**Good to know**
- Scheduled mode reads *yesterday's* playtime, so a fresh server's first expansion happens the day after people first play; a zero-playtime day simply doesn't expand.
- `plugins/FrontierBorder/data.yml` is the plugin's public state (`current-radius`, `total-expansions`, `paused`, `expansion-history` with `{date, from, to, player-hours, active-players, triggered-by}`) — safe to read from other tools; the plugin also re-applies the border every boot and syncs `current-radius` back if someone runs vanilla `/worldborder set`.
- `/border set` also zeroes the period counters; if you only want to correct the radius, use vanilla `/worldborder set` instead — that is picked up without touching the schedule.
- `/border autopregen` calls `saveConfig()`, which strips the comments from config.yml — hand-edit if you want to keep them.
- Both list keys are "first match wins": tiers highest-hours first, caps smallest-radius first, or you silently get the wrong number.

---

## FrontierTab
> Tab-list stats plus the per-player playtime/deaths store the rest of the suite is built on.  **v1.2.2** · Download: [Modrinth](https://modrinth.com/plugin/frontier-tab) · [GitHub](https://github.com/carsonxdd/frontier/tree/master/tab)

**What it does** — Renders a two-line tab header (server name, then TPS · players · border radius with its predicted next expansion · total deaths · End padlock), decorates every player's list entry with their death count, ping and an `[AFK]` tag, and gives each viewer a personal footer showing all-time playtime and session time. Behind the display is a small per-player stats store (`data/<uuid>.yml`) that tracks **AFK-excluded playtime in daily buckets**, deaths and XP levels earned. Two decisions make it the suite's foundation: playtime is stored per calendar day so any reader can compute week/month leaderboards without the plugin ever "closing" a period, and it keeps its own deaths counter that ignores deaths inside a FrontierEvents arena — FrontierBorder and FrontierStatsAPI both read these files straight off disk.

**Requires / integrates with**
| | |
|---|---|
| Required | Paper 26.3+, Java 25+ |
| Optional | FrontierBorder (enables the `Border: 1500 → 1750` header element), FrontierEndLock (enables the `End: 🔒` element while the End is locked), FrontierEvents (makes deaths inside events, and ring-edge deaths just after leaving the colosseum ring, not count), FrontierAnnouncements (soft dependency) |
| Used by | FrontierBorder (reads daily playtime buckets to size expansion), FrontierStatsAPI (serves all player stats and leaderboards), FrontierReputation (registers a name prefix so tier titles show in tab) |

**Commands**
| Command | Who | What |
|---|---|---|
| `/tab` | Everyone | Show the subcommands you're allowed to use |
| `/tab hide` | Everyone | Hide your own header/footer (saved to your data file; player-only) |
| `/tab show` | Everyone | Show your header/footer again |
| `/tab reload` | Admin | Reload `config.yml` and restart the refresh timer |
| `/tab set <player> playtime <value>` | Admin | Overwrite a player's playtime (`<value>` = raw seconds or `1d2h30m` style); works on offline players |
| `/tab set <player> deaths <n>` | Admin | Overwrite the deaths counter; works on offline players |
| `/tab reset <player> [playtime\|deaths]` | Admin | Zero one stat, or both if omitted; works on offline players |
| `/stats [player]` | Everyone | Playtime, deaths, current session, AFK status for you or another (offline players found by last name) |

**Permissions**
| Node | Default | Grants |
|---|---|---|
| `frontier.tab.admin` | op | `/tab reload`, `/tab set`, `/tab reset` |
| `frontier.tab.hide` | true | `/tab hide` / `/tab show` |
| `frontier.tab.stats` | true | `/stats` |

**Config** — path `plugins/FrontierTab/config.yml`, reload: `/tab reload`
| Key | Default | What it controls |
|---|---|---|
| `refresh-interval` | `40` | Ticks between tab re-renders and AFK re-checks (also the playtime resolution); 40 = every 2 s |
| `afk-timeout-minutes` | `5` | Minutes without a block-level move, interact, break/place or chat before a player is tagged `[AFK]`; AFK time is not counted as playtime |
| `playtime-bucket-retain-days` | `35` | Daily buckets older than this fold into the archive total on save; keep it above the longest window any reader wants (30 d for the month leaderboard) |
| `tps-thresholds.green` | `18.0` | TPS at or above this shows green |
| `tps-thresholds.yellow` | `15.0` | TPS at or above this (but below green) shows yellow; else red |
| `ping-thresholds.green` | `80` | Ping (ms) at or below this shows green |
| `ping-thresholds.yellow` | `150` | Ping at or below this shows yellow; else red |
| `show-playtime` | `true` | Footer `⏱ Played` line |
| `show-deaths` | `true` | Reserved — deaths currently always render on the player entry |
| `show-session-time` | `true` | Footer `🕐 Session` line |
| `show-ping` | `true` | Reserved — ping currently always renders on the player entry |
| `show-tps` | `true` | Header: TPS element |
| `show-player-count` | `true` | Header: online player count |
| `show-border` | `true` | Header: border radius → next expansion (needs FrontierBorder; silently skipped otherwise) |
| `show-total-deaths` | `false` | Header: 💀 sum of deaths of online players |
| `show-end-lock` | `false` | Header: `End: 🔒` while locked (needs FrontierEndLock) |
| `server-name` | `"My Server"` | Header line 1 (gold, bold) |

**Good to know**
- The `deaths` shown in tab (and by anything reading FrontierTab, e.g. the FrontierStatsAPI deaths leaderboard) is FrontierTab's **own** counter, not the vanilla `minecraft:deaths` statistic — resetting vanilla stats does not change it; use `/tab set` / `/tab reset`.
- Playtime that "freezes" is AFK exclusion working as designed: standing on a farm or only turning your head counts as AFK after `afk-timeout-minutes`.
- Data is saved every 5 minutes (async), on quit, and on shutdown; a hard crash loses at most 5 minutes of playtime.
- The code falls back to `true` for `show-total-deaths` and `show-end-lock` if the keys are missing, so deleting them turns those elements *on* — keep them explicit.
- Daily buckets roll at the JVM's midnight; install FrontierBorder (or set `-Duser.timezone`) if you want them to roll at your local midnight.

---

## FrontierGraves
> Permanent, shared player graves — keep your inventory on death, claim it later.  **v1.1.2** · Download: [Modrinth](https://modrinth.com/plugin/frontier-graves) · [GitHub](https://github.com/carsonxdd/frontier/tree/master/graves)

**What it does** — When a player dies their drops are not scattered on the ground: the plugin cancels them, places an invisible armor stand wearing the victim's head as a marker at the death spot (clamped inside world height, so void deaths still get a reachable grave), and stores the inventory in `graves.yml`. Anyone can right-click the marker to open a shared loot GUI; several players can browse the same grave at once and take what they want, and whatever they leave stays. Graves never decay on a timer — a grave despawns only when the last viewer closes it empty — and the dead player gets their XP levels back the first time they open it. Graves are shared rather than owner-locked on purpose: it keeps death meaningful (your gear is on the floor, go get it) while removing the worst part of vanilla, the 5-minute despawn timer and lava/void loss. Whether someone else loots you is a social question, not a plugin one.

**Requires / integrates with**
| | |
|---|---|
| Required | Paper 26.3+, Java 25+ |
| Optional | FrontierEvents — deaths inside an event (fighter or spectator) never make a grave, nor does a ring-edge death just after leaving the colosseum ring (drops stay on the floor); FrontierEvents can also sweep stray graves out of an arena at teardown |
| Used by | FrontierEvents (looks up the `GraveApi` service to clear arena graves) |

**Commands**
| Command | Who | What |
|---|---|---|
| `/grave` or `/grave list` | Everyone | List your active graves: world, block coordinates and creation time |
| `/grave nearest` | Everyone | Coordinates and distance of your closest grave in your current world |
| `/graves` | Everyone | Alias for `/grave list` |
| `/graveadmin` or `/graveadmin info` | Admin | Total number of graves on the server |
| `/graveadmin reload` | Admin | Reload `config.yml` and re-read `graves.yml` from disk |
| `/graveadmin wipe` | Admin | Remove every grave (marker + stored items) — irreversible |

`/grave` and `/graves` are player-only; `/graveadmin` also works from console.

**Permissions**
| Node | Default | Grants |
|---|---|---|
| `frontier.graves.admin` | op | `/graveadmin` (info, reload, wipe) |

**Config** — path `plugins/FrontierGraves/config.yml`, reload: `/graveadmin reload`
| Key | Default | What it controls |
|---|---|---|
| `enabled` | `true` | Master toggle. `false` = deaths drop items normally |
| `restore-xp` | `true` | Store the victim's XP level and return it when the owner first opens the grave. When `true`, dropped XP orbs are suppressed and the player respawns at level 0; when `false` vanilla XP drop applies. Non-owners never receive the XP |
| `announce-death` | `true` | Broadcast `<name>'s grave appeared at x, y, z.` to the server (the victim is always told privately). mc.pvpers.us runs `false` |

**Good to know**
- Storage is `plugins/FrontierGraves/graves.yml` — one record per grave (owner, location, XP, contents) written on every add, remove, XP claim and GUI close. Items sit in this file, not as ground entities, so chunk unloads, lag and the item timer can't eat them.
- The GUI is take-only: putting items into a grave is blocked, so it can't be used as free storage. Only the owner gets the XP, only once, only on click — if someone else empties and closes the grave first, the stored XP is gone with it.
- If the death already keeps inventory (`keepInventory`), the plugin does nothing.
- Graves open at LOWEST event priority, so land-protection plugins usually can't block looting a grave inside someone else's claim. There is no owner-only mode — an `allow-anyone` key may still be present in `config.yml`, but the code never reads it; anyone can loot.
- Grave times in `/grave list` use the JVM default timezone (FrontierBorder's `server-timezone` sets that server-wide if installed). A grave in a world that no longer exists shows as `?`, is skipped by `nearest`, and can only be cleared with `/graveadmin wipe`.

---

## FrontierMail
> Offline text mail and a per-player item mailbox.  **v1.0.1** · Download: [Modrinth](https://modrinth.com/plugin/frontier-mail) · [GitHub](https://github.com/carsonxdd/frontier/tree/master/mail)

**What it does** — Short text messages (`/mail`) and a per-player item mailbox (`/mailbox`) that other players — and other Frontier plugins — can drop items into while the recipient is offline. Two design choices keep items safe: `/senditem` removes the stack from your hand only after it has been written to the recipient's mailbox, so a full mailbox never eats an item; and `/mailbox` is a chest GUI where whatever you drag out is yours and whatever you leave stays mailed — nothing is auto-dumped into your inventory, so a full inventory can't spill mail onto the ground. Everything is stored per player as a JSON file: no database, nothing to configure beyond two limits.

**Requires / integrates with**
| | |
|---|---|
| Required | Paper 26.3+, Java 25+ |
| Optional | none |
| Used by | FrontierEvents (mails event payouts that don't fit or are owed to an offline player, as "Event Rewards"); FrontierReputation (mails daily-login reward items that overflow the inventory, as "Daily Reward"). FrontierShop does not use it — the market keeps its own mailbox |

**Commands**
| Command | Who | What |
|---|---|---|
| `/mail send <player> <message…>` | Everyone | Send a text message. Recipient must have played before (or be online); online recipients are pinged immediately |
| `/mail read` | Everyone | Print all stored messages (newest last, `(new)` marker on unread) and mark them all read |
| `/mail clear` | Everyone | Delete all of your messages |
| `/mailbox` | Everyone | Open your item mailbox GUI. Items you take out are removed; items you leave stay |
| `/senditem <player>` | Everyone | Mail the stack in your main hand. Refuses on empty hand, self-send, or a full mailbox |

All three commands are player-only. Names tab-complete from the online list, but any player who has ever joined is accepted.

**Permissions**
| Node | Default | Grants |
|---|---|---|
| `frontier.mail.use` | true | `/mail`, `/mailbox` |
| `frontier.mail.senditem` | true | `/senditem` |

**Config** — path `plugins/FrontierMail/config.yml`, reload: restart required (values are read on use, so `/reload confirm` also works)
| Key | Default | What it controls |
|---|---|---|
| `max-messages` | `50` | Maximum stored messages per player. At the cap the oldest message is silently dropped to make room (FIFO), so mail is never refused — only forgotten |
| `notify-on-join` | `true` | Send "You have N unread messages / N items" 2 seconds after a player joins |
| `max-mailbox-items` | `27` | Maximum items in a player's mailbox. Unlike messages, a full mailbox refuses new items: `/senditem` tells the sender it's full and plugin deliveries fall back to their own handling. The GUI grows in 9-slot rows up to 54; values above 54 are stored but only the first 54 show at once |

**Good to know**
- Storage is `plugins/FrontierMail/data/<uuid>.json`, one file per player holding messages and items. Files are read on demand and rewritten after every change; there is no cache and no save-on-shutdown step.
- Item mail keeps enchantments, names, lore and custom data intact through the round-trip; only exotic items with genuinely fractional or very large numeric fields can lose precision.
- "has never played on this server": `send`/`senditem` require the recipient to have joined at least once under that exact name; offline-mode servers and name changes can make the lookup miss.
- Timestamps in `/mail read` use the JVM default timezone. Rearranging items inside the mailbox before closing can shuffle the remembered "from" between items — the items themselves are always correct.

---

## FrontierTrade
> Scam-proof player-to-player item trading.  **v1.0.1** · Download: [Modrinth](https://modrinth.com/plugin/frontier-trade) · [GitHub](https://github.com/carsonxdd/frontier/tree/master/trade)

**What it does** — `/trade <player>` sends a request; on `/tradeaccept` both players get the same shared chest GUI — your items on the left, theirs on the right, a confirm button in the middle. The trade only executes when both have confirmed, and any change to either side un-confirms both, so the classic "confirm, then swap the diamond for dirt" scam is impossible. No economy, no database, no persistence — a session lives in memory and is unwound (items handed back) when either player closes the GUI, disconnects, or the plugin disables, so items can never get stuck in the window.

**Requires / integrates with**
| | |
|---|---|
| Required | Paper 26.3+, Java 25+ |
| Optional | none |
| Used by | none |

**Commands**
| Command | Who | What |
|---|---|---|
| `/trade <player>` | Everyone | Send a request. Refused if either of you is already trading, the target is offline or yourself, you're farther than `max-distance` (or in another world, when a limit is set), or you already have a live request to them |
| `/tradeaccept` | Everyone | Accept the request currently addressed to you and open the trade GUI for both. Refused if the requester logged off or either of you is now in another trade |
| `/tradedeny` | Everyone | Decline the pending request; the requester is told |

All player-only. `/trade` tab-completes online players other than yourself.

**Permissions**
| Node | Default | Grants |
|---|---|---|
| `frontier.trade.use` | true | `/trade`, `/tradeaccept`, `/tradedeny` |

**Config** — path `plugins/FrontierTrade/config.yml`, reload: restart required (values are read per request/session, so `/reload confirm` also works)
| Key | Default | What it controls |
|---|---|---|
| `request-timeout` | `30` | Seconds a request stays open; when it lapses both players get an "expired" message. A newer request to the same target overrides an older one |
| `max-distance` | `0` | Max block distance for `/trade <player>`; `0` = unlimited. When > 0 the players must also be in the same world. Checked at request time only, not on accept |
| `trade-rows` | `3` | Item rows per side (clamped 1–3). Each side gets rows × 3 slots; the GUI is rows + 1 tall (extra row = status panes + confirm button) |

**Good to know**
- Pending requests are keyed by target: if two people `/trade` the same player, the second request silently replaces the first, and the target accepts whoever asked most recently.
- Completion moves the offered stacks straight into the other player's inventory; anything that doesn't fit drops at their feet. If a player disconnects mid-trade their offered items are dropped at their last location for anyone to pick up — trade near your base, not in the wilderness.
- Any close of the trade GUI (including the client-side close on respawn or disconnect) cancels the whole session for both players; there is no pause.
- Command aliases defined in `commands.yml` will not work — the plugin dispatches on the exact labels `trade` / `tradeaccept` / `tradedeny`.

---

## FrontierEnderTracker
> Who actually killed the dragon? Per-player damage credit, live sidebar and a ranked leaderboard for every Ender Dragon fight.  **v1.0.0** · Download: [Modrinth](https://modrinth.com/plugin/frontier-endertracker) · [GitHub](https://github.com/carsonxdd/frontier/tree/master/endertracker)

**What it does** — From the moment a dragon spawns, every hit a player lands is credited to them — melee, arrows, TNT and tamed pets are all traced back to the responsible player, and non-player damage (crystals, environment) is ignored. A scoreboard sidebar shows the top contributors live during the fight; when the dragon dies the plugin broadcasts a ranked leaderboard with percentages (and a "Final blow" line if the killer wasn't the top damager), updates lifetime stats, appends a JSON record to a fight log, and can run reward console commands for the top contributor(s). By default it counts *final* damage (after the dragon's armor and effects) so the numbers reflect true contribution, and it is reload-safe: a dragon already alive when the plugin loads is adopted on the first hit.

**Requires / integrates with**
| | |
|---|---|
| Required | Paper 26.3+, Java 25+ |
| Optional | none |
| Used by | none (its `stats.yml` and `fights.jsonl` are stable, readable files for outside tools) |

**Commands** — `/dragondmg` also answers to `/ddmg` and `/dragondamage`.
| Command | Who | What |
|---|---|---|
| `/dragondmg` | Everyone | Your damage in the current fight, or in the last completed one (player only) |
| `/dragondmg top` | Everyone | Top 10 for the current fight, or the last fight if none is running |
| `/dragondmg stats [player]` | Everyone | Lifetime total damage / fights joined / killing blows (defaults to you; console must name a player) |
| `/dragondmg history [n]` | Everyone | Last `n` (1–20, default 5) logged fights: id, time, killer, top damager |
| `/dragondmg reset` | Admin | Clear the current fight's totals and drop the sidebar (does not touch `stats.yml`) |
| `/dragondmg reload` | Admin | Reload `config.yml` |

**Permissions**
| Node | Default | Grants |
|---|---|---|
| `frontier.endertracker.use` | true | `/dragondmg`, `top`, `history` (base command node) |
| `frontier.endertracker.stats` | true | `/dragondmg stats` |
| `frontier.endertracker.admin` | op | `/dragondmg reset`, `/dragondmg reload` |

**Config** — path `plugins/FrontierEnderTracker/config.yml`, reload: `/dragondmg reload` (keys are read live; a running fight keeps its sidebar title until the next fight)
| Key | Default | What it controls |
|---|---|---|
| `use-final-damage` | `true` | `true` = damage after armor/effects (true contribution); `false` = raw pre-mitigation damage |
| `show-sidebar` | `true` | Live scoreboard sidebar during a fight |
| `sidebar-top-n` | `5` | Rows shown on the sidebar (min 1) |
| `sidebar-refresh-ticks` | `20` | Sidebar refresh period in ticks (min 5); 20 = 1 s |
| `sidebar-title` | `'&5&lDragon Damage'` | Sidebar title (`&` colour codes) |
| `broadcast-on-death` | `true` | Ranked chat leaderboard when the dragon dies |
| `show-percent` | `true` | Append each player's share of total damage to the broadcast |
| `reward-commands` | `[]` | Console commands run for the top contributor(s); placeholders `{player}`, `{rank}`, `{damage}` (e.g. `give {player} diamond 3`) |
| `reward-top-n` | `1` | How many top players receive the reward commands |
| `persist-stats` | `true` | Write lifetime totals to `stats.yml` |
| `storage` | `yaml` | Storage backend; only `yaml` is implemented (`sqlite` is accepted but ignored) |
| `log-fights` | `true` | Append a per-fight record to `fights.jsonl` on each dragon death |
| `max-history` | `200` | Trim `fights.jsonl` to this many lines (0 = unlimited) |

**Good to know**
- During a fight the sidebar is set on **every online player** (not just those in the End) and any other plugin's sidebar is overridden until the fight ends — set `show-sidebar: false` if another scoreboard plugin matters more.
- Only one dragon is tracked at a time; a second dragon (another End world or a respawn while the first lives) is ignored until the active one dies or `/dragondmg reset` is run.
- `stats.yml` is `<uuid>: {name, total, fights, kills}`; `fights.jsonl` is one JSON object per line (`id`, `time`, `world`, `killer`, `durationMs`, `total`, ranked `participants[]`) — append-only, trimmed from the head.
- Both files are written on the main thread and `history` reads the whole log each call — fine at the default `max-history`, so don't set it to `0` on a busy server.

---

## FrontierEndLock
> Keeps the End closed until a scheduled unlock, or until an admin opens it.  **v1.2.0** · Download: [Modrinth](https://modrinth.com/plugin/frontier-endlock) · [GitHub](https://github.com/carsonxdd/frontier/tree/master/endlock)

**What it does** — Locks the End so a fresh survival server can reach the Dragon fight together instead of one player rushing it in week one. While locked, players without bypass cannot enter an End portal, place End portal frames, or push Eyes of Ender into frames. The lock can open **automatically on a schedule** (`unlock-at`), with daily countdown broadcasts and final warnings before it fires; staff can still flip it by hand. Unlocking broadcasts a decorated "The End Has Been Unlocked!" banner. The lock state persists in `config.yml` and the End starts locked on a fresh install. On mc.pvpers.us the End is locked and opens on its own on **Saturday, October 10 at 5 PM Arizona**.

**Requires / integrates with**
| | |
|---|---|
| Required | Paper 26.3+, Java 25+ |
| Optional | FrontierAnnouncements (Gazette post when the End opens) |
| Used by | FrontierTab (optionally shows an `End: 🔒` element in the header while locked) |

**Commands**
| Command | Who | What |
|---|---|---|
| `/endlock on` | Admin | Lock the End; broadcasts "The End has been locked!" |
| `/endlock off` | Admin | Unlock the End; broadcasts a banner |
| `/endlock status` | Admin | Show LOCKED / UNLOCKED (running `/endlock` with no argument also shows status and usage) |
| `/endlock schedule <yyyy-MM-ddTHH:mm>` | Admin | Schedule the automatic unlock (in the plugin's `timezone`) |
| `/endlock schedule clear` | Admin | Cancel the scheduled unlock |
| `/endlock reload` | Admin | Re-read `config.yml` |

**Permissions**
| Node | Default | Grants |
|---|---|---|
| `frontier.endlock.admin` | op | `/endlock` |
| `frontier.endlock.bypass` | false | Ignore the lock: enter portals, place frames, use eyes |

**Config** — path `plugins/FrontierEndLock/config.yml`, reload: `/endlock reload` (for the lock itself, use `/endlock on|off` rather than editing)
| Key | Default | What it controls |
|---|---|---|
| `locked` | `true` | Whether the End is currently locked. Written by `/endlock on|off` and again on shutdown |
| `unlock-at` | — | Scheduled automatic unlock (`yyyy-MM-ddTHH:mm`, set with `/endlock schedule`). mc.pvpers.us: 2026-10-10 17:00 |
| `timezone` | — | Zone `unlock-at` and the announcement times are read in (mc.pvpers.us runs `America/Phoenix`) |
| `announce.daily-time` | — | Time of day for the daily countdown broadcast |
| `announce.final-warnings-minutes` | — | Minutes before the unlock at which final warnings go out |
| `announce.on-join` | — | Also show the countdown to players as they join |
| `announce.{message, final-warning-message, date-format}` | — | Countdown and final-warning text, and how the unlock date is printed |
| `schedule-fired` / `last-daily-announce` | — | Internal bookkeeping written by the plugin — don't edit |

**Good to know**
- Don't edit `config.yml` while the server runs: the plugin holds the state in memory and rewrites `locked` on shutdown, so hand edits get overwritten. Use the command, or edit with the server stopped.
- Only player portal travel is blocked. Entities, and teleports that aren't End-portal travel (plugin `/tp`, End gateways, other portal plugins), are not.
- `frontier.endlock.bypass` defaults to false, but ops with a `*` wildcard grant will have it. Bypass is per-player, and turning the lock on does not kick players already in the End.
- Frame placement is cancelled at HIGH event priority; a plugin at a higher priority un-cancelling it, WorldEdit, or `/setblock` will get around it.

---

## FrontierNetherLock
> Keeps the Nether closed until an admin opens it.  **v1.0.0** · Download: [Modrinth](https://modrinth.com/plugin/frontier-netherlock) · [GitHub](https://github.com/carsonxdd/frontier/tree/master/netherlock)

**What it does** — The sibling of FrontierEndLock, for servers that want a "stone age" opening week before anyone can rush Nether gear. While locked, players without bypass cannot travel through a Nether portal or light one on obsidian with flint & steel or a fire charge, and portal creation by fire from any source (lava, fire spread, dispensers, ghast fireballs) is cancelled. Unlocking broadcasts a "The Nether Has Been Unlocked!" banner. State persists in `config.yml`; unlike EndLock, the Nether ships open until you run `/netherlock on`.

**Requires / integrates with**
| | |
|---|---|
| Required | Paper 26.3+, Java 25+ |
| Optional | none |
| Used by | none |

**Commands**
| Command | Who | What |
|---|---|---|
| `/netherlock on` | Admin | Lock the Nether; broadcasts "The Nether has been locked!" |
| `/netherlock off` | Admin | Unlock the Nether; broadcasts a banner |
| `/netherlock status` | Admin | Show LOCKED / UNLOCKED (running `/netherlock` with no argument also shows status and usage) |

**Permissions**
| Node | Default | Grants |
|---|---|---|
| `frontier.netherlock.admin` | op | `/netherlock` |
| `frontier.netherlock.bypass` | false | Ignore the lock: travel through, light and create portals |

**Config** — path `plugins/FrontierNetherLock/config.yml`, reload: restart required (use `/netherlock on|off` instead of editing)
| Key | Default | What it controls |
|---|---|---|
| `locked` | `false` | Whether the Nether is currently locked. Written by `/netherlock on|off` and again on shutdown; read once at startup. If the key is missing entirely the plugin falls back to `true` (locked) |

**Good to know**
- Don't edit `config.yml` while the server runs: the plugin holds the state in memory and rewrites `locked` on shutdown. Use the command, or edit with the server stopped.
- Only player portal travel is blocked — `/tp`, other portal plugins, and entities riding through (boats, pets, items) are not. Existing portals stay lit when you lock; the lock stops travel through them, not their existence.
- `frontier.netherlock.bypass` defaults to false, but a `*` wildcard grant includes it.
- A hand-emptied `config.yml` produces a locked Nether (missing key defaults to `true`); run `/netherlock off` to fix.

---

## FrontierHeads
> PvP kills drop the victim's head as a trophy.  **v1.0.1** · Download: [Modrinth](https://modrinth.com/plugin/frontier-heads) · [GitHub](https://github.com/carsonxdd/frontier/tree/master/heads)

**What it does** — When one player kills another, the victim's skinned head lands in the death drops (subject to `drop-chance`), named `<victim>'s Head`, optionally with "Slain by <killer>" and the date as lore, and optionally a chat line announcing the claim. It does nothing else: no mob heads, no crafting, no shop hooks. The trigger is strictly PvP — the killer must be a different player, so suicides and mob or environment deaths never drop a head. The head is added to the vanilla drop list, so it obeys whatever else touches drops (graves plugins collect it too).

**Requires / integrates with**
| | |
|---|---|
| Required | Paper 26.3+, Java 25+ |
| Optional | FrontierEvents — event kills and colosseum-ring kills (including ring-edge deaths) drop no head and no broadcast |
| Used by | none (FrontierGraves collects the head like any other drop) |

**Commands**
| Command | Who | What |
|---|---|---|
| `/headsadmin status` | Admin | Print `enabled`, `drop-chance`, `announce-kill` (also the no-argument default) |
| `/headsadmin reload` | Admin | Re-read `config.yml` |

**Permissions**
| Node | Default | Grants |
|---|---|---|
| `frontier.heads.admin` | op | `/headsadmin` |

**Config** — path `plugins/FrontierHeads/config.yml`, reload: `/headsadmin reload`
| Key | Default | What it controls |
|---|---|---|
| `enabled` | `true` | Master toggle. `false` = no heads ever drop |
| `drop-chance` | `1.0` | Probability (0.0–1.0) that a PvP kill drops a head; `1.0` = always |
| `announce-kill` | `true` | Broadcast `<killer> claimed <victim>'s head.` when a head drops |
| `custom-lore` | `true` | Add lore `Slain by <killer>` and the current date to the head |

**Good to know**
- Any FrontierEvents event kill or colosseum-ring kill, including a ring-edge death just after leaving the ring, drops no head and sends no broadcast. Separately, if another plugin cancels the death event the head is skipped — the listener ignores cancelled events.
- Arrows and tridents count as player kills; wolves and TNT only if the server attributes them to the shooter.
- With a graves plugin installed the head goes into the victim's grave, so the killer has to loot it — intended.
- The lore date uses the JVM default timezone; on hosts running UTC it rolls at 00:00 UTC. Names and lore use legacy `&` colour codes.

---

## FrontierBackup
> Scheduled world backups zipped on a rolling window.  **v1.0.1** · Download: [Modrinth](https://modrinth.com/plugin/frontier-backup) · [GitHub](https://github.com/carsonxdd/frontier/tree/master/backup)

**What it does** — On a fixed interval (and on `/backup start`) the plugin saves the configured worlds on the main thread, then zips their folders asynchronously into `backup-<yyyy-MM-dd-HH-mm>.zip` in a directory of your choice, and prunes the oldest zips once the count exceeds `max-backups`. It is deliberately small: no cloud upload, no restore command, no incremental diffs — just a rolling window of zips that a host panel or an rsync job can pick up. Because the zip step runs off the main thread, the tick loop is never blocked by file I/O, and a single-flight guard refuses a second backup while one is running.

**Requires / integrates with**
| | |
|---|---|
| Required | Paper 26.3+, Java 25+ |
| Optional | none |
| Used by | none |

**Commands**
| Command | Who | What |
|---|---|---|
| `/backup start` | Admin | Start a backup now (refused if one is already in progress) |
| `/backup list` | Admin | List `backup-*.zip` files in the backup directory, newest first, with date and size |
| `/backup` | Admin | Print usage |

**Permissions**
| Node | Default | Grants |
|---|---|---|
| `frontier.backup.admin` | op | `/backup start`, `/backup list` |

**Config** — path `plugins/FrontierBackup/config.yml`, reload: restart required
| Key | Default | What it controls |
|---|---|---|
| `backup-interval` | `720` | Minutes between automatic backups (720 = twice a day). The first automatic backup runs one full interval after startup, never at boot |
| `max-backups` | `3` | Rolling retention: once more than this many `backup-*.zip` files exist, the oldest (by file modification time) are deleted after each run |
| `backup-directory` | `backups` | Where zips are written, relative to the server root |
| `worlds` | `[world]` | World folder names to include, relative to the server root. On Paper 26.1+ every dimension lives under `world/dimensions/`, so one `world` entry captures overworld, nether and end; add entries for separately-created worlds |
| `announce` | `true` | Broadcast "Starting world backup..." / "Backup complete!" / failure messages to chat |

**Good to know**
- There is no restore command — restoring means stopping the server and unzipping by hand. Size `max-backups` to your disk; each zip is a full copy of every listed world and a mature survival world can be several GB per zip.
- The zip is a "hot" copy: worlds are saved first, but auto-save is not paused while the zip walks the folder. For a guaranteed-consistent copy, `save-off` + `save-all` first, or back up while the server is stopped.
- Entries in `worlds:` are folder names relative to the server root, not Bukkit world names; a missing folder logs `World folder not found, skipping`.
- Filenames use the JVM's default timezone, so hosts running UTC get UTC timestamps. Pruning sorts by file modification time, not by the timestamp in the name — copying old zips into the directory gives them a fresh mtime.
- Watch console for `Automatic backups scheduled every N minutes.` on boot, and use `/backup start` to test immediately.

---

## FrontierAnnouncements
> Rotating announcements, the Frontier Gazette, Market Day and the /help menu.  **v1.2.3** · Download: [Modrinth](https://modrinth.com/plugin/frontier-announcements) · [GitHub](https://github.com/carsonxdd/frontier/tree/master/announcements)

**What it does** — Every `interval` seconds the plugin broadcasts the next message from a configured list to everyone online (padded with a blank line above and below so it stands out from chat), then advances to the next one, looping back to the top when the list ends. Two deliberate choices: the timer skips its slot without advancing when nobody is online, so an empty server never burns through the rotation; and any player can opt out for themselves with `/muteannouncements`, a choice that is saved to disk and survives relogs and restarts. It also runs the **Frontier Gazette** — posts from other Frontier plugins (Reputation, Border, EndLock, Events) sent to a Discord webhook and kept as an in-game feed that FrontierStatsAPI serves on `/api/gazette` — plus a weekly **Market Day** window, and a clickable **`/help`** menu (alias `/commands`) listing every command the player can use.

**Requires / integrates with**
| | |
|---|---|
| Required | Paper 26.3+, Java 25+ |
| Optional | none |
| Used by | FrontierReputation, FrontierBorder, FrontierEndLock and FrontierEvents (post to the Gazette); FrontierStatsAPI (serves the feed on `/api/gazette`) |

**Commands**
| Command | Who | What |
|---|---|---|
| `/help [section\|command\|word] [page]` (also `/commands`) | Everyone | Clickable list of every command you can use; filter by section, command or keyword |
| `/marketday [status]` | Everyone | When the next (or current) Market Day is |
| `/marketday force <open\|close>` | Admin | Force Market Day open or closed |
| `/gazette status` / `test <trigger>` | Admin | Gazette status, or send a test post for one trigger |
| `/announcements reload` | Admin | Re-read `config.yml`, restart the timer and rewind to message #1 (any other or omitted argument prints usage) |
| `/muteannouncements` | Everyone | Toggle whether you receive announcements (player-only). Aliases: `/muteann`, `/mutebroadcasts` |

**Permissions**
| Node | Default | Grants |
|---|---|---|
| `frontier.announcements.help` | true | `/help`, `/commands` |
| `frontier.announcements.marketday` | true | `/marketday` |
| `frontier.announcements.marketday.admin` | op | `/marketday force` |
| `frontier.announcements.gazette.admin` | op | `/gazette` |
| `frontier.announcements.admin` | op | `/announcements reload` |
| `frontier.announcements.mute` | true | `/muteannouncements` |

**Config** — path `plugins/FrontierAnnouncements/config.yml`, reload: `/announcements reload`
| Key | Default | What it controls |
|---|---|---|
| `enabled` | `true` | Master switch. `false` = the timer is never started |
| `interval` | `420` | Seconds between announcements (420 = 7 minutes). The first message goes out one full interval after boot or reload, not immediately |
| `prefix` | `"&8[&6Server&8] &f"` | Prepended to every broadcast; `&` colour codes are translated |
| `messages` | 20-entry example list | Sent in order, one per interval, looping. `&` colour codes are translated; the prefix is added automatically. Empty list = nothing is sent (mc.pvpers.us runs 28) |
| `gazette.*` | mc.pvpers.us: on, with a role ping | The Frontier Gazette: Discord webhook, in-game feed, which triggers post, and `gazette.timezone` |
| `market-day.*` | mc.pvpers.us: off (the market is a permanent stall area at spawn) | The weekly Market Day window and `market-day.timezone` (America/Phoenix on mc.pvpers.us) |
| `help.*` | — | The `/help` menu |

**Good to know**
- Replace the shipped `messages:` list before going live — the defaults advertise the rest of the Frontier suite and a placeholder `example.com/…` website; they show the intended tone, not text you want broadcast verbatim.
- Per-player mutes live in `plugins/FrontierAnnouncements/muted.yml` (a `muted:` list of UUIDs). Deleting the file un-mutes everyone.
- Messages use legacy `&` colour codes, not MiniMessage — `<gold>` style tags are sent literally. `prefix:` applies to broadcasts only; command replies use a fixed `[Announcement]` prefix.
- If nothing is broadcasting: check `enabled: true`, a non-empty `messages:` list, at least one player online, and remember the first message fires only after a full interval.

---
