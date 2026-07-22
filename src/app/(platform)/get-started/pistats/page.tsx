import type { Metadata } from 'next';
import Link from 'next/link';
import CloudTitle from '@/components/CloudTitle';

export const metadata: Metadata = {
  title: 'PiStatsAPI setup | Server Sites',
  description:
    'How to install PiStatsAPI on your Minecraft server and connect live status and leaderboards to your site.',
};

export default function PistatsGuidePage() {
  return (
    <div>
      <section className="mx-auto max-w-3xl px-4 py-16">
        <div className="text-center">
          <CloudTitle>
            <h1 className="font-pixel text-gold glow-gold mb-8 text-xl sm:text-2xl">
              PiStatsAPI setup
            </h1>
          </CloudTitle>
        </div>

        <div className="space-y-5">
          <div className="mc-panel p-6">
            <h2 className="font-pixel t-text text-xs">What it is</h2>
            <p className="t-text-dim mt-3 text-sm leading-relaxed">
              PiStatsAPI is a lightweight plugin for Paper/Spigot servers that
              exposes read-only stats — player count, playtime, deaths, and more
              — over a small HTTP API. Your site polls it through a secure proxy
              to show live status and leaderboards. It never exposes commands or
              write access to your server.
            </p>
          </div>

          <div className="mc-panel p-6">
            <h2 className="font-pixel t-text text-xs">Install</h2>
            <ol className="t-text-dim mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed">
              <li>Drop the PiStatsAPI jar into your server&apos;s <code className="t-surface rounded px-1">plugins/</code> folder and restart.</li>
              <li>
                Open <code className="t-surface rounded px-1">plugins/PiStatsAPI/config.yml</code> and
                note (or change) the port it listens on.
              </li>
              <li>
                Expose that port. On a game host (DatHost, Pterodactyl panels,
                etc.) allocate an additional port in the panel and set it in the
                config. On a self-hosted box, open it in your firewall.
              </li>
              <li>Restart the server once more so the port change takes effect.</li>
            </ol>
          </div>

          <div className="mc-panel p-6">
            <h2 className="font-pixel t-text text-xs">Find your URL</h2>
            <p className="t-text-dim mt-3 text-sm leading-relaxed">
              Your endpoint is{' '}
              <code className="t-surface rounded px-1">http://&lt;your-server-host&gt;:&lt;port&gt;</code>{' '}
              — usually the same hostname players connect with, plus the port
              from the config. Plain <code className="t-surface rounded px-1">http://</code> is
              expected; the site proxies every request server-side so visitors
              always stay on https.
            </p>
            <p className="t-text-dim mt-3 text-sm leading-relaxed">
              Quick check: open{' '}
              <code className="t-surface rounded px-1">http://&lt;host&gt;:&lt;port&gt;/api/server</code>{' '}
              in a browser. If you see a short JSON blob with an{' '}
              <code className="t-surface rounded px-1">online</code> count, you&apos;re good.
            </p>
          </div>

          <div className="mc-panel p-6">
            <h2 className="font-pixel t-text text-xs">Connect it</h2>
            <p className="t-text-dim mt-3 text-sm leading-relaxed">
              In your site dashboard, open the <strong>Connection</strong> tab,
              paste the URL, hit <strong>Save</strong>, then{' '}
              <strong>Test connection</strong>. The moment the test passes, your
              home page shows the live player count and the Leaderboards page
              appears in your site&apos;s nav.
            </p>
          </div>

          <div className="mc-panel p-6">
            <h2 className="font-pixel t-text text-xs">Troubleshooting</h2>
            <ul className="t-text-dim mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed">
              <li>
                <strong>Timeout / connection refused:</strong> the port isn&apos;t
                reachable from the internet. Re-check the panel allocation or
                firewall rule, and confirm the plugin logged its listen port on
                startup.
              </li>
              <li>
                <strong>HTTP 404 on some boards:</strong> older plugin builds
                don&apos;t serve every stat. Update PiStatsAPI to the latest
                release.
              </li>
              <li>
                <strong>&quot;Private address&quot; error on save:</strong> the URL must
                be your server&apos;s public address — local or LAN addresses
                can&apos;t be reached from the site.
              </li>
              <li>
                <strong>Stale numbers:</strong> stats are cached for ~30 seconds;
                that&apos;s expected.
              </li>
            </ul>
          </div>
        </div>

        <p className="t-text-muted mt-8 text-center text-xs">
          <Link href="/get-started" className="underline hover:text-gold">
            ← Back to overview
          </Link>
        </p>
      </section>
    </div>
  );
}
