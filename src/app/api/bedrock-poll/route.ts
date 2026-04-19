import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'bedrock-poll.json');
const SALT = 'mc-pvpers-bedrock-poll-v1';

type PollState = { count: number; voterHashes: string[] };

let writeLock: Promise<unknown> = Promise.resolve();

async function readState(): Promise<PollState> {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (typeof parsed.count !== 'number' || !Array.isArray(parsed.voterHashes)) {
      return { count: 0, voterHashes: [] };
    }
    return parsed;
  } catch {
    return { count: 0, voterHashes: [] };
  }
}

async function writeState(state: PollState): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = DATA_FILE + '.tmp';
  await fs.writeFile(tmp, JSON.stringify(state), 'utf8');
  await fs.rename(tmp, DATA_FILE);
}

function hashIp(ip: string): string {
  return createHash('sha256').update(SALT + ':' + ip).digest('hex');
}

function getClientIp(req: NextRequest): string {
  const cf = req.headers.get('cf-connecting-ip');
  if (cf) return cf.trim();
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return 'unknown';
}

export async function GET() {
  const state = await readState();
  return NextResponse.json({ count: state.count });
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const hash = hashIp(ip);

  const result = await (writeLock = writeLock.then(async () => {
    const state = await readState();
    if (state.voterHashes.includes(hash)) {
      return { count: state.count, alreadyVoted: true };
    }
    const next: PollState = {
      count: state.count + 1,
      voterHashes: [...state.voterHashes, hash],
    };
    await writeState(next);
    return { count: next.count, alreadyVoted: false };
  }));

  return NextResponse.json(result);
}
