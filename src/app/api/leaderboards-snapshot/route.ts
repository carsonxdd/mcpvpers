import { NextResponse } from 'next/server';
import { getSnapshot } from '@/lib/leaderboardSnapshot';

export const runtime = 'nodejs';
// The snapshot lives in module memory and must survive across requests, so the
// route can't be statically optimized.
export const dynamic = 'force-dynamic';

// Serves the warm in-memory leaderboard snapshot (see lib/leaderboardSnapshot).
// Edge-cached so most hits never reach this process.
export async function GET() {
  const snapshot = await getSnapshot();
  return NextResponse.json(snapshot, {
    headers: {
      'cache-control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
}
