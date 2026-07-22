import { requireTenant } from '@/lib/tenant-context';
import { hasModule } from '@/lib/billing/plans';
import CloudTitle from '@/components/CloudTitle';
import CloudTextSmall from '@/components/CloudTextSmall';
import CopyButton from '@/components/CopyButton';
import GrassDivider from '@/components/GrassDivider';
import TenantCountdown from '@/components/tenant/TenantCountdown';
import TenantServerStatus from '@/components/tenant/TenantServerStatus';

export default async function TenantHomePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tenant = await requireTenant(slug);
  const config = tenant.config ?? {};
  const liveStats = Boolean(tenant.pistatsUrl) && hasModule(tenant, 'liveStats');
  const launchAtMs = tenant.launchAt?.getTime() ?? null;

  return (
    <div>
      <section className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center">
        <CloudTitle>
          <h1 className="font-pixel text-gold glow-gold text-3xl sm:text-4xl">{tenant.name}</h1>
        </CloudTitle>

        {config.tagline && (
          <CloudTextSmall>
            <p className="font-pixel t-text-dim mt-6 text-xs sm:text-sm">{config.tagline}</p>
          </CloudTextSmall>
        )}

        <div className="mt-10 flex w-full max-w-lg flex-col items-center">
          {launchAtMs !== null && <TenantCountdown launchAt={launchAtMs} />}
          {liveStats && tenant.pistatsUrl && (
            <TenantServerStatus
              endpoint={`/api/s/${tenant.slug}/stats/server`}
              launchAt={launchAtMs}
            />
          )}
          <div className="mc-panel flex w-full items-center justify-between gap-4 p-4">
            <div className="min-w-0 text-left">
              <p className="font-pixel text-[10px] uppercase tracking-widest t-text-muted">
                Server address
              </p>
              <p className="t-text mt-1 truncate font-mono text-sm">{tenant.serverIp}</p>
              {tenant.bedrockPort && (
                <p className="t-text-muted mt-1 text-xs">Bedrock port: {tenant.bedrockPort}</p>
              )}
            </div>
            <CopyButton text={tenant.serverIp} />
          </div>
          {tenant.discordInvite && (
            <a
              href={tenant.discordInvite}
              target="_blank"
              rel="noopener noreferrer"
              className="mc-pill mt-4 inline-block px-6 py-3 font-pixel text-xs"
            >
              Join the Discord
            </a>
          )}
        </div>
      </section>

      {(config.description || config.serverVersion || config.gameplayTags?.length || config.staff?.length) && (
        <>
          <GrassDivider />
          <section className="mx-auto max-w-3xl px-4 py-16">
            {config.description && (
              <div className="mc-panel p-6">
                <h2 className="font-pixel t-text text-xs">About the server</h2>
                <div className="t-text-dim mt-3 space-y-2 text-sm leading-relaxed">
                  {config.description.split(/\n\n+/).map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </div>
            )}

            {(config.serverVersion || config.gameplayTags?.length) && (
              <div className="mc-panel mt-4 flex flex-wrap items-center gap-2 p-6">
                {config.serverVersion && (
                  <span className="px-2 py-0.5 text-[10px] font-pixel rounded bg-gold/10 text-gold">
                    {config.serverVersion}
                  </span>
                )}
                {config.gameplayTags?.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 text-[10px] font-pixel rounded t-surface t-text-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {config.staff && config.staff.length > 0 && (
              <div className="mc-panel mt-4 p-6">
                <h2 className="font-pixel t-text text-xs">Staff</h2>
                <ul className="mt-3 space-y-1">
                  {config.staff.map((s) => (
                    <li key={`${s.name}-${s.role}`} className="t-text-dim text-sm">
                      <span className="t-text">{s.name}</span>
                      <span className="t-text-muted"> — {s.role}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
