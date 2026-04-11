import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ParallaxBackground from '@/components/ParallaxBackground';
import ParticleCanvas from '@/components/ParticleCanvas';
import RainCanvas from '@/components/RainCanvas';
import MusicPlayer from '@/components/MusicPlayer';
import ThemeProvider from '@/components/ThemeProvider';
import WeatherProvider from '@/components/WeatherProvider';

export const metadata: Metadata = {
  title: 'mc.pvpers.us — Vanilla+ Minecraft Server',
  description:
    'A Vanilla+ Minecraft community server. Explore, build, and compete on mc.pvpers.us. Running Paper 1.21 with quality-of-life plugins.',
  keywords: ['minecraft', 'server', 'vanilla+', 'pvpers', 'community', 'survival'],
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
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <WeatherProvider>
            <ParallaxBackground />
            <RainCanvas />
            <ParticleCanvas />
            <Header />
            <main className="relative z-20 flex-1 pt-14">{children}</main>
            <Footer />
            <MusicPlayer />
          </WeatherProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
