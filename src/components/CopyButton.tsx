'use client';

import { useState } from 'react';

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
}

export default function CopyButton({ text, label, className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`mc-panel px-5 py-2.5 font-pixel text-sm transition-all hover:scale-105 enchant-hover cursor-pointer ${
        copied ? 'text-xp glow-xp' : 'text-gold glow-gold'
      } ${className}`}
      style={{ borderColor: copied ? 'var(--color-xp)' : undefined }}
    >
      {copied ? 'Copied!' : label || text}
      <span className="t-text-muted text-[10px] ml-2">
        {copied ? '' : 'click to copy'}
      </span>
    </button>
  );
}
