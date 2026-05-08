import { createHash } from 'crypto';
import type { NextRequest } from 'next/server';

const SALT = 'mc-pvpers-polls-v1';

export function getClientIp(req: NextRequest): string {
  const cf = req.headers.get('cf-connecting-ip');
  if (cf) return cf.trim();
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return 'unknown';
}

export function hashIp(ip: string): string {
  return createHash('sha256').update(SALT + ':' + ip).digest('hex');
}
