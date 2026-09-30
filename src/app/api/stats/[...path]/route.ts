import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const ALLOWED_KINDS = new Set(['players', 'leaderboard', 'border', 'server', 'reputation', 'events', 'shop']);
const UPSTREAM = process.env.PISTATS_URL ?? 'http://stained.dathost.net:17249';
const FRESH_SECONDS = 30;
const TIMEOUT_MS = 5000;
// How long a last-good response may stand in for an unreachable upstream. Past this the
// proxy 502s and the widgets hide. Next's fetch data cache used to do this job, but it
// serves a stale entry forever when every background revalidation fails, which left the
// site showing Season 1 numbers for days while prod was stopped.
const MAX_STALE_MS = 5 * 60 * 1000;
const MAX_ENTRIES = 500;

type Cached = { body: string; status: number; contentType: string; fetchedAt: number };

// Single PM2 process on the Pi, so module state is the whole cache.
const cache = new Map<string, Cached>();
const inflight = new Map<string, Promise<Cached>>();

function remember(url: string, entry: Cached) {
  cache.delete(url);
  cache.set(url, entry);
  if (cache.size > MAX_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
}

async function fetchUpstream(url: string): Promise<Cached> {
  const upstream = await fetch(url, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: 'no-store',
  });
  const entry: Cached = {
    body: await upstream.text(),
    status: upstream.status,
    contentType: upstream.headers.get('content-type') ?? 'application/json',
    fetchedAt: Date.now(),
  };
  // Only successful bodies are worth falling back to.
  if (upstream.ok) remember(url, entry);
  return entry;
}

function respond(entry: Cached, stale: boolean) {
  return new NextResponse(entry.body, {
    status: entry.status,
    headers: {
      'content-type': entry.contentType,
      'cache-control': stale
        ? 'no-store'
        : `public, s-maxage=${FRESH_SECONDS}, stale-while-revalidate=60`,
      ...(stale ? { 'x-stats-stale': '1' } : {}),
    },
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const [kind, ...rest] = path;

  if (!kind || !ALLOWED_KINDS.has(kind)) {
    return NextResponse.json(
      { error: 'Unknown stats endpoint' },
      { status: 404 },
    );
  }

  const subpath = rest.length ? '/' + rest.map(encodeURIComponent).join('/') : '';
  const url = `${UPSTREAM}/api/${kind}${subpath}${req.nextUrl.search}`;

  const cached = cache.get(url);
  if (cached && Date.now() - cached.fetchedAt < FRESH_SECONDS * 1000) {
    return respond(cached, false);
  }

  try {
    let pending = inflight.get(url);
    if (!pending) {
      pending = fetchUpstream(url).finally(() => inflight.delete(url));
      inflight.set(url, pending);
    }
    return respond(await pending, false);
  } catch (err) {
    if (cached && Date.now() - cached.fetchedAt < MAX_STALE_MS) {
      return respond(cached, true);
    }
    return NextResponse.json(
      { error: 'PiStatsAPI unreachable', detail: String(err) },
      { status: 502 },
    );
  }
}
