import type { Metadata, Viewport } from 'next';
import './globals.css';
import ParallaxBackground from '@/components/ParallaxBackground';
import ParticleCanvas from '@/components/ParticleCanvas';
import RainCanvas from '@/components/RainCanvas';
import SeasonParticles from '@/components/SeasonParticles';
import SeasonProvider from '@/components/SeasonProvider';
import ThemeProvider from '@/components/ThemeProvider';
import WeatherProvider from '@/components/WeatherProvider';

export const metadata: Metadata = {
  title: 'mc.pvpers.us | Vanilla+ Minecraft Server',
  description:
    'A Vanilla+ Minecraft community server. Explore, build, and compete on mc.pvpers.us. Running Paper 26.3 with quality-of-life plugins.',
  keywords: ['minecraft', 'server', 'vanilla+', 'pvpers', 'community', 'survival'],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full antialiased" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" href="/favicon.png" />
        {/* Prevent flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const t = localStorage.getItem('mc-theme');
                if (t === 'light') document.documentElement.classList.remove('dark');
                else if (!t && window.matchMedia('(prefers-color-scheme: light)').matches) document.documentElement.classList.remove('dark');
              } catch(e) {}
              try {
                // Seasons: pvpers routes only (keep in sync with lib/seasons.ts)
                const p = location.pathname;
                const skip = ['/s/', '/dashboard', '/login', '/get-started', '/legal', '/api']
                  .some(function (x) { return p === x.replace(/\\/$/, '') || p.indexOf(x) === 0; });
                if (!skip) {
                  const o = localStorage.getItem('mc-season');
                  const az = new Date(Date.now() - 7 * 3600 * 1000);
                  const y = az.getUTCFullYear(), m = az.getUTCMonth(), d = az.getUTCDate();
                  // Easter Sunday (Anonymous Gregorian), then the holiday windows
                  const a = y % 19, b = Math.floor(y / 100), c = y % 100, e = b % 4;
                  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
                  const h = (19 * a + b - Math.floor(b / 4) - g + 15) % 30;
                  const l = (32 + 2 * e + 2 * Math.floor(c / 4) - h - (c % 4)) % 7;
                  const k = Math.floor((a + 11 * h + 22 * l) / 451);
                  const n = h + l - 7 * k + 114;
                  const fromEaster = (Date.UTC(y, m, d) - Date.UTC(y, Math.floor(n / 31) - 1, (n % 31) + 1)) / 864e5;
                  // Thanksgiving: fourth Thursday of November
                  const tg = 1 + ((4 - new Date(Date.UTC(y, 10, 1)).getUTCDay() + 7) % 7) + 21;
                  // Lunar New Year: table for 2026-2040 (days after Dec 31)
                  const ln = [48, 37, 26, 44, 34, 23, 42, 31, 50, 39, 28, 46, 35, 24, 43][y - 2026];
                  const fromLny = ln ? (Date.UTC(y, m, d) - Date.UTC(y, 0, ln)) / 864e5 : NaN;
                  const hol = (m === 11 && d >= 30) || (m === 0 && d === 1) ? 'newyear'
                    : fromLny >= -1 && fromLny <= 3 ? 'lunarnewyear'
                    : m === 1 && d >= 10 && d <= 14 ? 'valentines'
                    : m === 2 && d >= 14 && d <= 17 ? 'stpatricks'
                    : m === 4 && d >= 1 && d <= 5 ? 'cincodemayo'
                    : m === 4 && d >= 16 && d <= 18 ? 'mcbirthday'
                    : m === 6 && d >= 1 && d <= 5 ? 'july4'
                    : (m === 9 && d >= 21) || (m === 10 && d <= 2) ? 'halloween'
                    : m === 10 && Math.abs(d - tg) <= 3 ? 'thanksgiving'
                    : m === 11 && d <= 26 ? 'christmas'
                    : fromEaster >= -7 && fromEaster <= 1 ? 'easter' : null;
                  const cal = hol
                    || (m >= 2 && m <= 4 ? 'spring' : m >= 5 && m <= 7 ? 'summer' : m >= 8 && m <= 10 ? 'autumn' : 'winter');
                  const all = ['spring', 'summer', 'autumn', 'winter', 'newyear', 'lunarnewyear', 'valentines', 'stpatricks', 'easter', 'cincodemayo', 'mcbirthday', 'july4', 'halloween', 'thanksgiving', 'christmas', 'birch', 'darkforest', 'jungle', 'desert'];
                  const picked = o === 'off' || all.indexOf(o) >= 0;
                  // A manual pick keeps holidays only when "Holidays still take over" is on
                  const s = !picked ? cal
                    : hol && localStorage.getItem('mc-season-holidays') === '1' ? hol
                    : o === 'off' ? null : o;
                  if (s) document.documentElement.setAttribute('data-season', s);
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <SeasonProvider>
            <WeatherProvider>
              <ParallaxBackground />
              <RainCanvas />
              <SeasonParticles />
              <ParticleCanvas />
              {children}
            </WeatherProvider>
          </SeasonProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
