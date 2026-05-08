const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20;
const MAX_BUCKETS = 5000;

const buckets = new Map<string, number[]>();

export function checkRateLimit(key: string): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const fresh = (buckets.get(key) ?? []).filter((t) => now - t < WINDOW_MS);

  if (fresh.length >= MAX_PER_WINDOW) {
    buckets.set(key, fresh);
    const retryAfter = Math.max(1, Math.ceil((WINDOW_MS - (now - fresh[0])) / 1000));
    return { ok: false, retryAfter };
  }

  fresh.push(now);
  buckets.set(key, fresh);

  if (buckets.size > MAX_BUCKETS) {
    for (const [k, v] of buckets) {
      const f = v.filter((t) => now - t < WINDOW_MS);
      if (f.length === 0) buckets.delete(k);
      else buckets.set(k, f);
    }
  }

  return { ok: true, retryAfter: 0 };
}
