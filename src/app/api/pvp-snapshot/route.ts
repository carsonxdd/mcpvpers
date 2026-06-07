import { NextResponse } from 'next/server';
import { getPvpSnapshot } from '@/lib/pvpSnapshot';

export const runtime = 'nodejs';
// The snapshot lives in module memory and must survive across requests, so the
// route can't be statically optimized.
export const dynamic = 'force-dynamic';

// Serves the warm PiEvents PvP (TDM/FFA) snapshot — Wins / Kills / K-D / Matches /
// Earnings boards plus the recent-match feed in one payload. Edge-cached so most
// hits never reach this process. When PvP isn't live upstream the snapshot's
// `available` flag is false and the client hides the boards.
export async function GET() {
  const snapshot = await getPvpSnapshot();
  return NextResponse.json(snapshot, {
    headers: {
      'cache-control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
}
