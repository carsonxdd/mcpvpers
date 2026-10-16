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
                  const cal = m === 9 && d >= 20 ? 'halloween'
                    : m === 11 && d <= 26 ? 'christmas'
                    : fromEaster >= -7 && fromEaster <= 1 ? 'easter'
                    : m >= 2 && m <= 4 ? 'spring' : m >= 5 && m <= 7 ? 'summer' : m >= 8 && m <= 10 ? 'autumn' : 'winter';
                  const all = ['spring', 'summer', 'autumn', 'winter', 'halloween', 'christmas', 'easter', 'birch', 'darkforest', 'jungle', 'desert'];
                  const s = o === 'off' ? null : (all.indexOf(o) >= 0 ? o : cal);
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
