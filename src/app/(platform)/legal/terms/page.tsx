import type { Metadata } from 'next';
import Link from 'next/link';
import CloudTitle from '@/components/CloudTitle';

export const metadata: Metadata = {
  title: 'Terms of Service & Acceptable Use | Server Sites',
  description: 'Terms of Service and Acceptable Use Policy for Server Sites, the mc.pvpers.us site-building platform.',
};

const EFFECTIVE_DATE = 'July 24, 2026';

export default function TermsPage() {
  return (
    <div>
      <section className="mx-auto max-w-3xl px-4 py-16">
        <div className="text-center">
          <CloudTitle>
            <h1 className="font-pixel text-gold glow-gold mb-8 text-xl sm:text-2xl">
              Terms of Service &amp; Acceptable Use
            </h1>
          </CloudTitle>
          <p className="t-text-muted text-xs">Effective {EFFECTIVE_DATE}</p>
        </div>

        <div className="mt-8 space-y-5">
          <div className="mc-panel p-6">
            <h2 className="font-pixel t-text text-xs">The short version</h2>
            <p className="t-text-dim mt-3 text-sm leading-relaxed">
              Server Sites (&quot;the platform&quot;, &quot;we&quot;) lets you build a free website
              for your own Minecraft server, hosted under mc.pvpers.us. It&apos;s
              provided as-is, best-effort, by one person as a side project — not
              a company, not a guaranteed service. Don&apos;t use it for anything
              illegal or harmful, and we can suspend or remove sites that break
              that rule. Everything below is the detailed version of that.
            </p>
          </div>

          <div className="mc-panel p-6">
            <h2 className="font-pixel t-text text-xs">1. What this is</h2>
            <p className="t-text-dim mt-3 text-sm leading-relaxed">
              The platform gives you a hosted page at <code className="t-surface rounded px-1">mc.pvpers.us/s/&lt;your-slug&gt;</code>{' '}
              for a Minecraft server you already run or have purchased hosting
              for elsewhere. We don&apos;t host, sell, or operate your Minecraft
              server — only the website describing it. Optional live stats
              (player count, leaderboards) work by connecting to a PiStatsAPI
              endpoint you run on your own server; see the{' '}
              <Link href="/get-started/pistats" className="underline hover:text-gold">setup guide</Link>.
            </p>
          </div>

          <div className="mc-panel p-6">
            <h2 className="font-pixel t-text text-xs">2. Your account</h2>
            <p className="t-text-dim mt-3 text-sm leading-relaxed">
              You sign in with Discord OAuth; we never see or store your
              Discord password. You&apos;re responsible for what happens under
              your account. The free plan currently allows up to 2 sites per
              account — we may adjust plan limits going forward, and any
              future paid tier will be announced before it affects existing
              sites.
            </p>
          </div>

          <div className="mc-panel p-6">
            <h2 className="font-pixel t-text text-xs">3. Your content</h2>
            <p className="t-text-dim mt-3 text-sm leading-relaxed">
              You keep ownership of the rules, news, server name, and other
              content you enter. By publishing it through the platform, you
              give us the license needed to store and display it as part of
              your site. You&apos;re responsible for making sure it&apos;s accurate and
              legal to publish.
            </p>
          </div>

          <div className="mc-panel p-6">
            <h2 className="font-pixel t-text text-xs">4. Acceptable use</h2>
            <p className="t-text-dim mt-3 text-sm leading-relaxed">Your site, its content, and any connected server must not:</p>
            <ul className="t-text-dim mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed">
              <li>Host or link to illegal content, malware, or phishing</li>
              <li>Contain hate speech, harassment, doxxing, or threats</li>
              <li>Impersonate another person, server, or organization</li>
              <li>Be used to scrape, abuse, or overload the platform&apos;s APIs or infrastructure</li>
              <li>Violate Discord&apos;s Terms of Service or, for the Minecraft server itself, Mojang&apos;s EULA</li>
            </ul>
            <p className="t-text-dim mt-3 text-sm leading-relaxed">
              We may remove content, suspend a site, or terminate an account
              that violates this policy, with or without advance notice,
              depending on severity.
            </p>
          </div>

          <div className="mc-panel p-6">
            <h2 className="font-pixel t-text text-xs">5. Availability &amp; liability</h2>
            <p className="t-text-dim mt-3 text-sm leading-relaxed">
              The platform is provided &quot;as is&quot;, without uptime guarantees or
              warranties of any kind. It runs on modest self-hosted
              infrastructure. We&apos;re not liable for downtime, data loss, or
              damages arising from your use of the platform, to the fullest
              extent the law allows. We do take periodic backups, but you
              should not treat the platform as your only copy of anything
              important.
            </p>
          </div>

          <div className="mc-panel p-6">
            <h2 className="font-pixel t-text text-xs">6. Changes</h2>
            <p className="t-text-dim mt-3 text-sm leading-relaxed">
              We may update these terms as the platform grows. Material
              changes will be reflected here with an updated effective date.
              Continued use after a change means you accept the update.
            </p>
          </div>

          <div className="mc-panel p-6">
            <h2 className="font-pixel t-text text-xs">7. Contact</h2>
            <p className="t-text-dim mt-3 text-sm leading-relaxed">
              Questions, takedown requests, or abuse reports:{' '}
              <strong>carsonxd</strong> on{' '}
              <a
                href="https://discord.gg/3fyMmcSf4C"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-gold"
              >
                Discord
              </a>.
            </p>
          </div>
        </div>

        <p className="t-text-muted mt-8 text-center text-xs">
          <Link href="/get-started" className="underline hover:text-gold">
            &larr; Back to overview
          </Link>
        </p>
      </section>
    </div>
  );
}
