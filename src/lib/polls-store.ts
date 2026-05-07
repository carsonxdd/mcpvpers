import { promises as fs } from 'fs';
import path from 'path';
import { getRedis } from './redis';

export type PollState = { counts: Record<string, number>; userVote: string | null };

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'polls.json');

type FileState = {
  counts: Record<string, Record<string, number>>;
  voters: Record<string, Record<string, string>>;
};

let writeLock: Promise<unknown> = Promise.resolve();

async function readFile(): Promise<FileState> {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      counts: parsed.counts && typeof parsed.counts === 'object' ? parsed.counts : {},
      voters: parsed.voters && typeof parsed.voters === 'object' ? parsed.voters : {},
    };
  } catch {
    return { counts: {}, voters: {} };
  }
}

async function writeFile(state: FileState): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = DATA_FILE + '.tmp';
  await fs.writeFile(tmp, JSON.stringify(state), 'utf8');
  await fs.rename(tmp, DATA_FILE);
}

export async function getAllForVoter(
  pollIds: readonly string[],
  voterId: string
): Promise<Record<string, PollState>> {
  const redis = getRedis();
  const result: Record<string, PollState> = {};

  if (redis) {
    const pipeline = redis.pipeline();
    for (const id of pollIds) {
      pipeline.hgetall(`poll:${id}:counts`);
      pipeline.hget(`poll:${id}:voters`, voterId);
    }
    const raw = (await pipeline.exec()) ?? [];
    for (let i = 0; i < pollIds.length; i++) {
      const id = pollIds[i];
      const rawCounts = raw[i * 2]?.[1] as Record<string, string> | null | undefined;
      const userVote = (raw[i * 2 + 1]?.[1] as string | null | undefined) ?? null;
      const counts: Record<string, number> = {};
      if (rawCounts) {
        for (const [k, v] of Object.entries(rawCounts)) counts[k] = Number(v);
      }
      result[id] = { counts, userVote };
    }
    return result;
  }

  const file = await readFile();
  for (const id of pollIds) {
    result[id] = {
      counts: file.counts[id] ?? {},
      userVote: file.voters[id]?.[voterId] ?? null,
    };
  }
  return result;
}

export async function vote(
  pollId: string,
  optionId: string,
  voterId: string
): Promise<PollState> {
  const redis = getRedis();
  if (redis) {
    const countsKey = `poll:${pollId}:counts`;
    const votersKey = `poll:${pollId}:voters`;
    const previousVote = await redis.hget(votersKey, voterId);
    if (previousVote !== optionId) {
      const pipeline = redis.pipeline();
      if (previousVote) pipeline.hincrby(countsKey, previousVote, -1);
      pipeline.hincrby(countsKey, optionId, 1);
      pipeline.hset(votersKey, voterId, optionId);
      await pipeline.exec();
    }
    const rawCounts = await redis.hgetall(countsKey);
    const counts: Record<string, number> = {};
    for (const [k, v] of Object.entries(rawCounts)) counts[k] = Number(v);
    return { counts, userVote: optionId };
  }

  return (writeLock = writeLock.then(async () => {
    const state = await readFile();
    const counts = { ...(state.counts[pollId] ?? {}) };
    const voters = { ...(state.voters[pollId] ?? {}) };
    const previous = voters[voterId];
    if (previous !== optionId) {
      if (previous) counts[previous] = Math.max(0, (counts[previous] ?? 0) - 1);
      counts[optionId] = (counts[optionId] ?? 0) + 1;
      voters[voterId] = optionId;
      const next: FileState = {
        counts: { ...state.counts, [pollId]: counts },
        voters: { ...state.voters, [pollId]: voters },
      };
      await writeFile(next);
    }
    return { counts, userVote: optionId };
  })) as Promise<PollState>;
}
