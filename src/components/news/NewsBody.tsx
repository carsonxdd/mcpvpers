import { Fragment, type ReactNode } from 'react';

/**
 * Formats a news.json body for the /news page. Bodies stay plain prose in the
 * JSON; structure is inferred here so posts don't need any markup:
 *
 * - The first paragraph is the lede and renders a touch larger.
 * - Later paragraphs that open with a short lead ("Land.", "The catch:",
 *   "Want it harder?") get that lead as a gold run-in heading.
 * - Slash commands (/shop, /lands bank deposit <amount>) become code chips,
 *   and dollar amounts are highlighted.
 * - `code` and **bold** from the wiki's Rich syntax also work.
 */

// Subcommand words that may follow a /command. Anything else ends the chip,
// so "/shop buys and sells" chips only "/shop".
const SUBCOMMANDS =
  'on|off|warmode|reclaim|debt|spectate|key|list|hide|dappledforest|market|place|sell|bank|deposit';

const INLINE = new RegExp(
  [
    '`[^`]+`',
    '\\*\\*[^*]+\\*\\*',
    `(?<=^|[\\s(])\\/[a-z][\\w-]*(?: (?:${SUBCOMMANDS}))*(?: <[^>]+>)*`,
    '\\$\\d[\\d,]*(?:\\.\\d+)?',
  ].join('|'),
  'g',
);

const LEAD = /^(.{2,60}?[.:?])\s+(?=\S)/;
const MAX_LEAD_WORDS = 7;

function Inline({ text }: { text: string }) {
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(INLINE)) {
    const tok = m[0];
    const at = m.index ?? 0;
    if (at > last) out.push(<Fragment key={`t${at}`}>{text.slice(last, at)}</Fragment>);

    if (tok.startsWith('**')) {
      out.push(<strong key={at} className="t-text font-semibold">{tok.slice(2, -2)}</strong>);
    } else if (tok.startsWith('$')) {
      out.push(<span key={at} className="text-gold font-semibold whitespace-nowrap">{tok}</span>);
    } else {
      const code = tok.startsWith('`') ? tok.slice(1, -1) : tok;
      out.push(
        <code
          key={at}
          className="px-1.5 py-0.5 rounded t-surface border t-border font-mono text-[0.85em] text-xp break-words"
        >
          {code}
        </code>,
      );
    }
    last = at + tok.length;
  }
  if (last < text.length) out.push(<Fragment key="end">{text.slice(last)}</Fragment>);
  return <>{out}</>;
}

function splitLead(para: string): [string | null, string] {
  const m = para.match(LEAD);
  if (!m) return [null, para];
  const lead = m[1];
  if (lead.split(/\s+/).length > MAX_LEAD_WORDS) return [null, para];
  return [lead, para.slice(m[0].length)];
}

export function Paragraph({ text, lede = false }: { text: string; lede?: boolean }) {
  if (lede) {
    return (
      <p className="t-text text-[15px] leading-relaxed">
        <Inline text={text} />
      </p>
    );
  }

  const [lead, rest] = splitLead(text);
  return (
    <p className="t-text-dim text-sm leading-relaxed">
      {lead && (
        <span className="font-pixel text-gold text-[10px] leading-loose mr-2 align-[1px]">
          <Inline text={lead} />
        </span>
      )}
      <Inline text={rest} />
    </p>
  );
}

export function paragraphs(body: string): string[] {
  return body.split(/\n\n+/);
}

export function readMinutes(body: string): number {
  return Math.max(1, Math.round(body.split(/\s+/).length / 200));
}
