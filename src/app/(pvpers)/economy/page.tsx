import GrassDivider from '@/components/GrassDivider';
import CloudTitle from '@/components/CloudTitle';
import CloudText from '@/components/CloudText';
import CloudTextSmall from '@/components/CloudTextSmall';
import StreakBoard from '@/components/StreakBoard';
import ShopDeals from '@/components/ShopDeals';
import ShopCatalogLive from '@/components/ShopCatalogLive';
import MarketListings from '@/components/MarketListings';

export const metadata = {
  title: 'Economy — mc.pvpers.us',
  description: 'How money works on the Frontier: the server shop, the player market, and where the cash comes from.',
};

const categories: { name: string; icon: string; blurb: string }[] = [
  { name: 'Building', icon: '🧱', blurb: 'Stone, dirt, glass, concrete — the bulk stuff bases eat by the stack.' },
  { name: 'Wood', icon: '🪵', blurb: 'Every log and plank type, for when the nearest forest is a trek.' },
  { name: 'Ores & Minerals', icon: '⛏️', blurb: 'Iron, gold, diamonds, copper, redstone, and the rest of the rock.' },
  { name: 'Farming', icon: '🌾', blurb: 'Crops, seeds, saplings, and animal goods to skip the grind.' },
  { name: 'Mob Drops', icon: '💀', blurb: 'Gunpowder, string, bones, ender pearls — the stuff mobs cough up.' },
  { name: 'Food', icon: '🍖', blurb: 'Cooked meals and ingredients so you never raid your own pantry.' },
  { name: 'Utility & Sinks', icon: '🧨', blurb: 'Name tags, saddles, sponges, XP bottles, TNT. Buy-only money sinks.' },
];

export default function EconomyPage() {
  return (
    <div>
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <CloudTitle><h1 className="font-pixel text-gold text-2xl sm:text-3xl mb-6 glow-gold">Economy</h1></CloudTitle>
        <CloudText>
          <p className="t-text-dim leading-relaxed mb-4">
            The Frontier runs on real money now. Everyone starts with{' '}
            <strong className="t-text">$100</strong>, earns more by fighting in events and selling to
            the shop, and spends it at the server store, the player market, and whatever comes next.
          </p>
          <p className="t-text-dim leading-relaxed">
            No debt is possible — you can&apos;t go below zero. Check your pocket with{' '}
            <code className="text-gold">/bal</code>, see who&apos;s rich with{' '}
            <code className="text-gold">/baltop</code>, and hand cash to someone with{' '}
            <code className="text-gold">/pay</code>.
          </p>
        </CloudText>
      </section>

      <GrassDivider />

      {/* How money works */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center"><CloudTitle><h2 className="font-pixel text-gold text-lg mb-8 glow-gold">How money works</h2></CloudTitle></div>
        <div className="mc-panel p-6 sm:p-8">
          <ul className="space-y-4 text-sm t-text-dim list-none">
            <li className="flex gap-3">
              <span className="text-xp shrink-0">+</span>
              <span>
                <strong className="t-text">You start with $100.</strong> Every player gets a one-time
                grant the day the economy goes live. From there it&apos;s on you.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-xp shrink-0">+</span>
              <span>
                <strong className="t-text">Earn it by playing.</strong> Event payouts are the main
                faucet — Boss Rush clears and PvP matches both pay out (participation, kills, wins,
                MVP bonuses). Selling clean items to the{' '}
                <code className="text-gold">/shop</code> is the steady-drip alternative.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-xp shrink-0">+</span>
              <span>
                <strong className="t-text">Spend it</strong> at the server shop, the player market,
                and the money sinks built to keep prices from spiraling. More cash features will land
                as the server grows.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-xp shrink-0">+</span>
              <span>
                <strong className="t-text">The commands:</strong> <code className="text-gold">/bal</code>{' '}
                checks your balance, <code className="text-gold">/baltop</code> ranks the server,{' '}
                <code className="text-gold">/pay &lt;player&gt; &lt;amount&gt;</code> sends money to
                anyone.
              </span>
            </li>
          </ul>
        </div>
      </section>

      <GrassDivider />

      {/* The Shop */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center"><CloudTitle><h2 className="font-pixel text-gold text-lg mb-6 glow-gold">The Shop</h2></CloudTitle></div>
        <CloudTextSmall className="text-center mb-8">
          <p className="t-text-dim">
            <code className="text-gold">/shop</code> opens the server store — 104 items across seven
            categories, with prices that actually react to the server.
          </p>
        </CloudTextSmall>

        <div className="mc-panel p-6 sm:p-8 mb-6">
          <h3 className="font-pixel text-enchant text-xs mb-3 glow-enchant uppercase tracking-wider">Prices move like a stock ticker</h3>
          <p className="t-text-dim text-sm leading-relaxed mb-5">
            Every item carries a price index, and it re-prices <strong className="t-text">once a
            day</strong>, at midnight server time, off what the server actually traded the day
            before. Sell the shop a mountain of iron and tomorrow iron ticks down (up to{' '}
            <strong className="t-text">5%</strong>); if everyone was buying, it ticks up; on a quiet
            day it drifts back toward normal. Buy and sell prices ride the{' '}
            <strong className="t-text">same index</strong>, so a crashed item is also a bargain to
            buy — and nothing ever swings below <strong className="t-text">60%</strong> or above{' '}
            <strong className="t-text">140%</strong> of base.
          </p>
          <h3 className="font-pixel text-enchant text-xs mb-3 glow-enchant uppercase tracking-wider">Steady all day, capped per day</h3>
          <p className="t-text-dim text-sm leading-relaxed mb-3">
            Prices hold steady all day — no mid-session surprises — they only move at midnight. The
            shop also only buys so much of each item per day: hit the{' '}
            <strong className="t-text">warehouse cap</strong> and it stops buying that item until
            midnight.
          </p>
          <p className="t-text-dim text-sm leading-relaxed">
            One catch: <strong className="t-text">only clean items sell.</strong> Renamed, enchanted,
            or damaged gear never matches the catalog — so you can&apos;t cash out event loot at the
            shop.
          </p>
        </div>

        <div className="mc-panel p-6 sm:p-8 mb-6">
          <h3 className="font-pixel text-enchant text-xs mb-3 glow-enchant uppercase tracking-wider">Daily deals</h3>
          <p className="t-text-dim text-sm leading-relaxed mb-5">
            Nine catalog items go on deal every day — <strong className="t-text">25% off</strong> to
            buy or <strong className="t-text">+50%</strong> to sell — rotating at midnight server
            time. Look for the ★ in <code className="text-gold">/shop</code>; the day&apos;s deals are
            announced when you join.
          </p>
          <h3 className="font-pixel text-enchant text-xs mb-3 glow-enchant uppercase tracking-wider">Market nights — the black market</h3>
          <p className="t-text-dim text-sm leading-relaxed">
            Twice a week — <strong className="t-text">Tuesday and Friday, 9 PM to midnight</strong>{' '}
            server time — the black market opens: buy-only exotic goods (golden apples, totems,
            wither skulls…) at steep prices, with limited stock per window. When it&apos;s gone,
            it&apos;s gone until the next market night.
          </p>
        </div>

        {/* Live deals strip + black-market status — self-hides until PiShop ships */}
        <ShopDeals />

        <h3 className="font-pixel text-gold text-xs glow-gold uppercase tracking-widest mb-4 text-center">The seven categories</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {categories.map((cat) => (
            <div key={cat.name} className="inventory-slot p-4 flex gap-3 items-start">
              <span className="text-2xl shrink-0 leading-none" aria-hidden>{cat.icon}</span>
              <div>
                <p className="font-pixel t-text text-[10px] mb-1.5">{cat.name}</p>
                <p className="t-text-muted text-xs leading-snug">{cat.blurb}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="t-text-muted text-xs text-center mt-4">
          Prices may get rebalanced after launch, so the categories are the durable part — the live
          price table (shown once the shop is online) and the in-game ticker always have the
          real numbers.
        </p>

        {/* Live price table — self-hides until PiShop ships to prod */}
        <ShopCatalogLive />
      </section>

      <GrassDivider />

      {/* The Market */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center"><CloudTitle><h2 className="font-pixel text-gold text-lg mb-6 glow-gold">The Market</h2></CloudTitle></div>
        <CloudTextSmall className="text-center mb-8">
          <p className="t-text-dim">
            <code className="text-gold">/market</code> is the player-to-player side — set your own
            prices, no middleman but a small fee.
          </p>
        </CloudTextSmall>
        <div className="mc-panel p-6 sm:p-8">
          <ul className="space-y-4 text-sm t-text-dim list-none">
            <li className="flex gap-3">
              <span className="text-xp shrink-0">+</span>
              <span><strong className="t-text">Browse</strong> the listing GUI to see what people are selling.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-xp shrink-0">+</span>
              <span>
                <strong className="t-text">List your own</strong> — hold a stack and type{' '}
                <code className="text-gold">/market sell &lt;price&gt;</code> to put it up for the
                whole-stack price you set.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-xp shrink-0">+</span>
              <span>Sellers pay a <strong className="t-text">listing fee</strong> when an item sells.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-xp shrink-0">+</span>
              <span>
                Offline when it sells? The money lands in your{' '}
                <strong className="t-text">mailbox</strong>. Listings survive restarts.
              </span>
            </li>
          </ul>
          <div className="mt-5 pt-5 t-border-20 border-t">
            <h3 className="font-pixel text-enchant text-xs mb-3 glow-enchant uppercase tracking-wider">Sign shops</h3>
            <p className="t-text-dim text-sm leading-relaxed">
              Prefer a physical storefront? Put a sign on a chest or barrel, write{' '}
              <code className="text-gold">[shop]</code> on the first line with an amount and a price,
              and it sells the chest&apos;s first item — enchants included — at your price. The
              market fee applies, and your stock is whatever&apos;s in the chest.
            </p>
          </div>
        </div>

        {/* Live listings — self-hides until PiShop ships / the market has stock */}
        <MarketListings />
      </section>

      <GrassDivider />

      {/* Daily login rewards */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center"><CloudTitle><h2 className="font-pixel text-gold text-lg mb-6 glow-gold">Daily login rewards</h2></CloudTitle></div>
        <CloudTextSmall className="text-center mb-8">
          <p className="t-text-dim">
            Show up each day and get paid. Your first join of the day drops cash and a haul of loot
            straight into your inventory — no command to run.
          </p>
        </CloudTextSmall>
        <div className="mc-panel p-6 sm:p-8">
          <ul className="space-y-4 text-sm t-text-dim list-none">
            <li className="flex gap-3">
              <span className="text-xp shrink-0">+</span>
              <span>
                <strong className="t-text">It&apos;s a streak.</strong> Day 1 pays{' '}
                <strong className="t-text">$100</strong> and the payout climbs every consecutive day,
                up to <strong className="t-text">$500</strong> at a 14-day streak (then $500 every day
                you keep it alive). Miss a day and it resets to 1, so keep it going.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-xp shrink-0">+</span>
              <span>
                <strong className="t-text">Loot every day, and it upgrades with the streak</strong> —
                golden carrots and iron at first, then gold, diamonds, and XP bottles as the days
                stack up. Hit a <strong className="t-text">milestone</strong> day — 3, 7, and every
                14th day after that — and you&apos;ll bag bonus loot (the every-two-weeks milestone
                drops diamonds and an enchanted golden apple), with a server-wide shout-out.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-xp shrink-0">+</span>
              <span>
                Run <code className="text-gold">/daily</code> anytime to check your current streak, your
                best streak, and what tomorrow pays.
              </span>
            </li>
          </ul>
          <p className="t-text-muted text-xs mt-5">
            The day rolls over at <strong className="t-text">5 PM Arizona</strong> (UTC midnight), same as
            the rest of the server&apos;s daily resets — so your streak ticks over mid-afternoon, not at
            local midnight.
          </p>
        </div>
        {/* Live board — self-hides until PiStatsAPI 1.8.0 ships to prod */}
        <StreakBoard />
      </section>

      <GrassDivider />

      {/* Where money comes from — and where it leaves */}
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <CloudTitle><h2 className="font-pixel text-gold text-lg mb-6 glow-gold">Where the money comes from</h2></CloudTitle>
        <CloudText>
          <p className="t-text-dim leading-relaxed mb-4">
            Events are the main faucet — and it&apos;s clear or nothing. Boss Rush money enters the
            economy only on clears (a wiped raid pays <strong className="t-text">$0</strong> — no
            participation money, no bonuses), while PvP matches pay participation, kills, wins, and
            MVP bonuses. Selling to the shop is the steady-drip alternative.
          </p>
          <p className="t-text-dim leading-relaxed mb-4">
            And where it leaves: <strong className="t-text">Raid Key start fees</strong> are the
            biggest repeatable sink — $150 × (Pit + 1), sunk win or lose, up to three starts a day —
            alongside the shop&apos;s buy-only utility goods, the black market&apos;s steep prices,
            and the market&apos;s listing fee. Key runs also pay out at 0.75× to keep them honest.
          </p>
          <p className="t-text-dim leading-relaxed">
            Full payout tables live on the{' '}
            <a href="/events/pvp" className="text-enchant hover:text-enchant/70 transition-colors underline underline-offset-2">
              PvP Arena page
            </a>{' '}
            and the{' '}
            <a href="/events" className="text-enchant hover:text-enchant/70 transition-colors underline underline-offset-2">
              Events hub
            </a>
            .
          </p>
        </CloudText>
      </section>
    </div>
  );
}
