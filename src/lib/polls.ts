// Round 1 (pre-launch) close: Thursday May 21, 2026 at 11:59 PM Arizona = May 22, 2026 06:59 UTC
export const POLLS_CLOSE_AT = Date.parse('2026-05-22T06:59:00Z');

// Round 2 (post-launch) close: Friday May 29, 2026 at 11:59 PM Arizona = May 30, 2026 06:59 UTC
export const ROUND_2_CLOSE_AT_ISO = '2026-05-30T06:59:00Z';
export const ROUND_2_CLOSE_AT = Date.parse(ROUND_2_CLOSE_AT_ISO);

export function pollCloseTime(closesAt?: string): number {
  return closesAt ? Date.parse(closesAt) : POLLS_CLOSE_AT;
}

export function isPollClosed(closesAt: string | undefined, now: number = Date.now()): boolean {
  return now >= pollCloseTime(closesAt);
}

export function arePollsClosed(now: number = Date.now()): boolean {
  return now >= POLLS_CLOSE_AT;
}
