import Link from 'next/link';

export default function TenantFooter({
  name,
  discordInvite,
}: {
  name: string;
  discordInvite: string | null;
}) {
  return (
    <footer className="relative z-20 t-bg-90 border-t t-border-50 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-8 text-center">
        <p className="font-pixel text-[10px] t-text-dim">{name}</p>
        {discordInvite && (
          <a
            href={discordInvite}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs t-text-muted hover:text-gold transition-colors"
          >
            Join us on Discord
          </a>
        )}
        <p className="text-[10px] t-text-muted">
          <Link href="/get-started" className="hover:text-gold transition-colors">
            Get a site like this for your server →
          </Link>
        </p>
      </div>
    </footer>
  );
}
