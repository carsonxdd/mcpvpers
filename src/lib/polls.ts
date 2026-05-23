// Thursday May 21, 2026 at 11:59 PM Arizona time (UTC-7, no DST) = May 22, 2026 06:59 UTC
export const POLLS_CLOSE_AT = Date.parse('2026-05-22T06:59:00Z');

export function arePollsClosed(now: number = Date.now()): boolean {
  return now >= POLLS_CLOSE_AT;
}
