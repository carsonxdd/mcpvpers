import { NextResponse } from 'next/server';
import { getEventsSnapshot } from '@/lib/eventsSnapshot';

export const runtime = 'nodejs';
// The snapshot lives in module memory and must survive across requests, so the
// route can't be statically optimized.
export const dynamic = 'force-dynamic';

// Serves the warm in-memory PiEvents (Boss Rush) snapshot — role leaderboards,
// summary banner, and recent-runs feed in one payload. Edge-cached so most hits
// never reach this process. When PiEvents isn't live upstream the snapshot's
// `available` flag is false and the client hides the section.
export async function GET() {
  const snapshot = await getEventsSnapshot();
  return NextResponse.json(snapshot, {
    headers: {
      'cache-control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
}
