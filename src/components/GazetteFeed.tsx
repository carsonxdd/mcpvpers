// The Frontier Gazette: in-world write-ups of big server moments (new Marshal,
// bounty collected, Market Day open...). Served by FrontierStatsAPI
// (1.17.0+, prod runs 1.18.0) at /api/gazette, fetched server-side here with a short revalidate so
// the news page picks up new entries within a minute.
//
// `body` can carry player-written commendation reasons, so it is only ever
// rendered as text (React escapes it), never as HTML. `{enabled: false}`, an
// empty feed, an older PiStatsAPI (404) or an unreachable host all hide the
// section.

const UPSTREAM = process.env.PISTATS_URL ?? 'http://stained.dathost.net:17249';
const REVALIDATE_SECONDS = 60;
const TIMEOUT_MS = 5000;
const LIMIT = 20;

type GazetteEntry = {
  id: number;
  timestamp: number;
  iso: string;
  trigger: string;
  title: string;
  body: string;
  thumbnail: string | null;
};

type GazetteResponse = { enabled: boolean; entries: GazetteEntry[] };

async function fetchGazette(): Promise<GazetteEntry[]> {
  try {
    const res = await fetch(`${UPSTREAM}/api/gazette?limit=${LIMIT}`, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as GazetteResponse;
    if (!data.enabled || !Array.isArray(data.entries)) return [];
    return data.entries;
  } catch {
    return [];
  }
}

// Only show thumbnails from the player-head host the plugin uses.
function safeThumbnail(url: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.protocol === 'https:' && u.hostname === 'mc-heads.net' ? url : null;
  } catch {
    return null;
  }
}

const dateFormat = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Phoenix',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

export default async function GazetteFeed() {
  const entries = await fetchGazette();
  if (entries.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="text-center mb-6">
        <h2 className="font-pixel text-bronze text-sm mb-2">The Frontier Gazette</h2>
        <p className="t-text-muted text-xs">Straight off the wire from the server. Times are Arizona.</p>
      </div>
      <div className="space-y-3">
        {entries.map((entry) => {
          const thumb = safeThumbnail(entry.thumbnail);
          return (
            <article key={entry.id} className="mc-panel p-5 flex gap-4">
              {thumb && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={thumb}
                  alt=""
                  width={40}
                  height={40}
                  loading="lazy"
                  className="w-10 h-10 rounded shrink-0 t-surface-light"
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="font-pixel text-gold text-[10px] leading-relaxed">{entry.title}</h3>
                  <time dateTime={entry.iso} className="t-text-muted text-[10px] font-pixel shrink-0">
                    {dateFormat.format(new Date(entry.timestamp))}
                  </time>
                </div>
                <p className="t-text-dim text-sm leading-relaxed whitespace-pre-line break-words">{entry.body}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
