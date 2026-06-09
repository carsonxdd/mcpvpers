import GrassDivider from '@/components/GrassDivider';
import CloudTitle from '@/components/CloudTitle';
import CloudText from '@/components/CloudText';
import CloudTextSmall from '@/components/CloudTextSmall';

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
          <h3 className="font-pixel text-enchant text-xs mb-3 glow-enchant uppercase tracking-wider">Buy prices never move</h3>
          <p className="t-text-dim text-sm leading-relaxed mb-5">
            What you pay to buy an item is fixed. No surge pricing on the way in — the cost is the cost.
          </p>
          <h3 className="font-pixel text-enchant text-xs mb-3 glow-enchant uppercase tracking-wider">Sell prices follow demand</h3>
          <p className="t-text-dim text-sm leading-relaxed mb-3">
            Sell prices do move. Every item has a daily <strong className="t-text">appetite</strong>,
            and the more the server dumps of one thing, the less the next unit pays — down to a{' '}
            <strong className="t-text">20% floor</strong>. Prices recover on their own over about a
            day, and the GUI shows the live price and a demand bar so you can time the market.
          </p>
          <p className="t-text-dim text-sm leading-relaxed">
            One catch: <strong className="t-text">only clean items sell.</strong> Renamed, enchanted,
            or damaged gear never matches the catalog — so you can&apos;t cash out event loot at the
            shop.
          </p>
        </div>

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
          Prices may get rebalanced after launch, so the categories are the durable part — the exact
          numbers live in-game on the demand bar.
        </p>
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
        </div>
      </section>

      <GrassDivider />

      {/* Where money comes from */}
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <CloudTitle><h2 className="font-pixel text-gold text-lg mb-6 glow-gold">Where the money comes from</h2></CloudTitle>
        <CloudText>
          <p className="t-text-dim leading-relaxed mb-4">
            Events are the main faucet. Boss Rush clears and PvP matches both pay out — participation,
            kills, wins, and MVP bonuses. Fight, earn, spend.
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
