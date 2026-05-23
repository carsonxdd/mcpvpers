'use client';

import { useId, useState, type ReactNode } from 'react';

type Variant = 'deep' | 'faq';

export default function Expander({
  title,
  variant = 'deep',
  defaultOpen = false,
  children,
}: {
  title: string;
  variant?: Variant;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const contentId = useId();

  if (variant === 'faq') {
    return (
      <div
        className="border-t first:border-t-0"
        style={{ borderColor: 'var(--c-border)' }}
      >
        <button
          type="button"
          aria-expanded={open}
          aria-controls={contentId}
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center justify-between gap-4 text-left py-3 px-2 -mx-2 rounded-md cursor-pointer transition-colors hover-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-enchant/50"
        >
          <span className="font-pixel text-enchant text-xs glow-enchant">{title}</span>
          <span
            aria-hidden="true"
            className={`text-gold text-sm shrink-0 transition-transform duration-300 ease-out motion-reduce:transition-none ${
              open ? 'rotate-45' : ''
            }`}
          >
            +
          </span>
        </button>
        <div
          id={contentId}
          className="grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none"
          style={{
            gridTemplateRows: open ? '1fr' : '0fr',
            opacity: open ? 1 : 0,
          }}
        >
          <div className="overflow-hidden">
            <p className="t-text-dim text-sm leading-relaxed pb-3">{children}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mc-panel overflow-hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 text-left p-5 cursor-pointer transition-colors hover-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-inset"
      >
        <span className="font-pixel text-gold text-sm glow-gold">{title}</span>
        <span
          aria-hidden="true"
          className={`text-gold text-sm shrink-0 transition-transform duration-300 ease-out motion-reduce:transition-none ${
            open ? 'rotate-45' : ''
          }`}
        >
          +
        </span>
      </button>
      <div
        id={contentId}
        className="grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none"
        style={{
          gridTemplateRows: open ? '1fr' : '0fr',
          opacity: open ? 1 : 0,
        }}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-5">{children}</div>
        </div>
      </div>
    </div>
  );
}
