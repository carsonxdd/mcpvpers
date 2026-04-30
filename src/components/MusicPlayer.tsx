'use client';

import { useState, useSyncExternalStore, useCallback } from 'react';

const subscribeNoop = () => () => {};

function readMutedCookie(): boolean {
  if (typeof document === 'undefined') return true;
  const row = document.cookie.split('; ').find((r) => r.startsWith('mc_muted='));
  return row ? row.split('=')[1] === 'true' : true;
}

export default function MusicPlayer() {
  const isLoaded = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const [isMuted, setIsMuted] = useState<boolean>(readMutedCookie);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      document.cookie = `mc_muted=${next};path=/;max-age=31536000`;
      return next;
    });
  }, []);

  if (!isLoaded) return null;

  return (
    <button
      onClick={toggleMute}
      className="fixed bottom-4 right-4 z-50 w-10 h-10 max-md:w-12 max-md:h-12 max-md:bottom-[max(1rem,env(safe-area-inset-bottom))] max-md:right-[max(1rem,env(safe-area-inset-right))] mc-panel flex items-center justify-center hover:scale-110 active:scale-95 focus-visible:outline-2 focus-visible:outline-gold/60 transition-all cursor-pointer"
      title={isMuted ? 'Unmute music' : 'Mute music'}
      aria-label={isMuted ? 'Unmute music' : 'Mute music'}
    >
      {isMuted ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="t-text-muted">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-enchant">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
      )}
    </button>
  );
}
