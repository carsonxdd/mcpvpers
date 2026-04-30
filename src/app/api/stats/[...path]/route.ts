import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const ALLOWED_KINDS = new Set(['players', 'leaderboard', 'border', 'server']);
const UPSTREAM = process.env.PISTATS_URL ?? 'http://stained.dathost.net:17249';
const REVALIDATE_SECONDS = 30;
const TIMEOUT_MS = 5000;

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

  try {
    const upstream = await fetch(url, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      next: { revalidate: REVALIDATE_SECONDS },
    });

    const body = await upstream.text();
    return new NextResponse(body, {
      status: upstream.status,
      headers: {
        'content-type':
          upstream.headers.get('content-type') ?? 'application/json',
        'cache-control': `public, s-maxage=${REVALIDATE_SECONDS}, stale-while-revalidate=60`,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'PiStatsAPI unreachable', detail: String(err) },
      { status: 502 },
    );
  }
}
