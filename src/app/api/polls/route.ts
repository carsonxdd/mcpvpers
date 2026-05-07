import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import pollsData from '@/data/polls.json';
import { getAllForVoter } from '@/lib/polls-store';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const VOTER_COOKIE = 'mcpvpers_voter';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export async function GET() {
  const cookieStore = await cookies();
  const existing = cookieStore.get(VOTER_COOKIE)?.value;
  const voterId = existing ?? crypto.randomUUID();

  const pollIds = pollsData.polls.map((p) => p.id);
  const result = await getAllForVoter(pollIds, voterId);

  const response = NextResponse.json(result);
  if (!existing) {
    response.cookies.set(VOTER_COOKIE, voterId, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    });
  }
  return response;
}
