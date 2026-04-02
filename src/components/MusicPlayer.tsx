'use client';

import { useState, useEffect, useCallback } from 'react';

export default function MusicPlayer() {
  const [isMuted, setIsMuted] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = document.cookie.split('; ').find((row) => row.startsWith('mc_muted='));
    if (saved) setIsMuted(saved.split('=')[1] === 'true');
    setIsLoaded(true);
  }, []);

  const toggleMute = useCallback(() => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    document.cookie = `mc_muted=${newMuted};path=/;max-age=31536000`;
  }, [isMuted]);

  if (!isLoaded) return null;

  return (
    <button
      onClick={toggleMute}
      className="fixed bottom-4 right-4 z-50 w-10 h-10 mc-panel flex items-center justify-center hover:scale-110 transition-all cursor-pointer"
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
