import { Fragment } from 'react';

/**
 * Renders the tiny inline syntax used throughout src/data/frontier-suite.ts:
 * `code` becomes a gold <code>, **bold** becomes emphasised body text.
 * Everything else passes through as plain text.
 */
const TOKEN = /(`[^`]+`|\*\*[^*]+\*\*)/g;

export default function Rich({ text }: { text: string }) {
  const parts = text.split(TOKEN).filter((p) => p !== '');

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code
              key={i}
              className="text-gold font-mono text-[0.92em] break-words"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={i} className="t-text font-semibold">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}
