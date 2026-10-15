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
                  const m = new Date(Date.now() - 7 * 3600 * 1000).getUTCMonth();
                  const cal = m >= 2 && m <= 4 ? 'spring' : m >= 5 && m <= 7 ? 'summer' : m >= 8 && m <= 10 ? 'autumn' : 'winter';
                  const s = o === 'off' ? null : (['spring', 'summer', 'autumn', 'winter'].indexOf(o) >= 0 ? o : cal);
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
