import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import pollsData from '@/data/polls.json';
import { vote, PollLimitError } from '@/lib/polls-store';
import { getClientIp, hashIp } from '@/lib/client-ip';
import { checkRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const VOTER_COOKIE = 'mcpvpers_voter';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const poll = pollsData.polls.find((p) => p.id === id);
  if (!poll) {
    return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
  }

  const body = (await req.json()) as { optionId?: string };
  const optionId = body.optionId;
  if (!optionId || !poll.options.some((o) => o.id === optionId)) {
    return NextResponse.json({ error: 'Invalid option' }, { status: 400 });
  }

  const ip = getClientIp(req);
  const rl = checkRateLimit(`vote:${ip}`);
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'Too many votes — slow down.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
    );
  }
  const ipH = hashIp(ip);

  const cookieStore = await cookies();
  const existing = cookieStore.get(VOTER_COOKIE)?.value;
  const voterId = existing ?? crypto.randomUUID();

  let result;
  try {
    result = await vote(id, optionId, voterId, ipH);
  } catch (e) {
    if (e instanceof PollLimitError) {
      return NextResponse.json(
        { error: 'Vote limit reached for this network.' },
        { status: 403 }
      );
    }
    throw e;
  }

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
