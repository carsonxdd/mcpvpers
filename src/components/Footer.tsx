import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="relative z-20 t-bg t-border-30 border-t transition-colors duration-300">

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-pixel text-gold text-xs mb-3 glow-gold">mc.pvpers.us</h3>
            <p className="t-text-muted text-sm leading-relaxed">
              A Vanilla+ Minecraft server focused on community, exploration, and adventure.
              Running Paper 1.21.
            </p>
          </div>

          <div>
            <h3 className="font-pixel t-text-dim text-xs mb-3">Links</h3>
            <div className="flex flex-col gap-2">
              <Link href="/about" className="t-text-muted text-sm hover:text-xp transition-colors">About & Rules</Link>
              <Link href="/modpacks" className="t-text-muted text-sm hover:text-xp transition-colors">Modpacks</Link>
              <Link href="/leaderboards" className="t-text-muted text-sm hover:text-xp transition-colors">Leaderboards</Link>
              <Link href="/map" className="t-text-muted text-sm hover:text-xp transition-colors">BlueMap</Link>
            </div>
          </div>

          <div>
            <h3 className="font-pixel t-text-dim text-xs mb-3">Connect</h3>
            <div className="flex flex-col gap-2">
              <a href="#" className="t-text-muted text-sm hover:text-xp transition-colors" target="_blank" rel="noopener noreferrer">Discord</a>
              <a href="#" className="t-text-muted text-sm hover:text-xp transition-colors" target="_blank" rel="noopener noreferrer">CurseForge</a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 t-border-20 border-t flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="t-text-muted-60 text-xs">
            &copy; {new Date().getFullYear()} mc.pvpers.us. Not affiliated with Mojang Studios.
          </p>
          <p className="t-text-muted-60 text-xs flex items-center gap-1.5">
            Powered by Paper
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-xp shadow-[0_0_4px_rgba(126,252,32,0.4)]" />
          </p>
        </div>

        <p className="mt-2 t-text-muted-60 text-xs text-center">
          Built by <a href="https://carsoncaplan.com" target="_blank" rel="noopener noreferrer" className="hover:text-xp transition-colors">Carson Caplan</a>
        </p>
      </div>
    </footer>
  );
}
