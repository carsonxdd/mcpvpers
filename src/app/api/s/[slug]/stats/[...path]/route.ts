import { NextRequest, NextResponse } from 'next/server';
import { getTenantBySlug } from '@/lib/tenant-context';
import { hasModule } from '@/lib/billing/plans';
import { assertPublicHost } from '@/lib/pistats-url';

export const runtime = 'nodejs';

// Narrower than the pvpers proxy: tenants only get status + leaderboards.
const ALLOWED_KINDS = new Set(['server', 'players', 'leaderboard']);
const REVALIDATE_SECONDS = 30;
const TIMEOUT_MS = 5000;
const MAX_BODY_BYTES = 1_000_000;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; path: string[] }> },
) {
  const { slug, path } = await params;
  const [kind, ...rest] = path;

  const tenant = await getTenantBySlug(slug);
  if (!tenant?.pistatsUrl || !hasModule(tenant, 'liveStats')) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (!kind || !ALLOWED_KINDS.has(kind)) {
    return NextResponse.json({ error: 'Unknown stats endpoint' }, { status: 404 });
  }

  try {
    await assertPublicHost(tenant.pistatsUrl);
  } catch {
    return NextResponse.json({ error: 'Stats endpoint not allowed' }, { status: 502 });
  }

  const subpath = rest.length ? '/' + rest.map(encodeURIComponent).join('/') : '';
  const url = `${tenant.pistatsUrl}/api/${kind}${subpath}${req.nextUrl.search}`;

  try {
    // Next's data cache keys on the full URL, so caching is per-tenant for free.
    const upstream = await fetch(url, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      next: { revalidate: REVALIDATE_SECONDS },
    });

    const length = Number(upstream.headers.get('content-length') ?? 0);
    if (length > MAX_BODY_BYTES) {
      return NextResponse.json({ error: 'Upstream response too large' }, { status: 502 });
    }
    const body = await upstream.text();
    if (body.length > MAX_BODY_BYTES) {
      return NextResponse.json({ error: 'Upstream response too large' }, { status: 502 });
    }

    return new NextResponse(body, {
      status: upstream.status,
      headers: {
        'content-type': upstream.headers.get('content-type') ?? 'application/json',
        'cache-control': `public, s-maxage=${REVALIDATE_SECONDS}, stale-while-revalidate=60`,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Stats endpoint unreachable' }, { status: 502 });
  }
}
