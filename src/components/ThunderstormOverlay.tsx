'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useWeather } from './WeatherProvider';

interface BoltSegment {
  x: number;
  y: number;
  w: number;
  h: number;
}

function generateBolt(canvasWidth: number, canvasHeight: number): BoltSegment[] {
  const segments: BoltSegment[] = [];
  const startX = Math.random() * canvasWidth * 0.6 + canvasWidth * 0.2;
  let x = startX;
  let y = 0;
  const endY = canvasHeight * (0.5 + Math.random() * 0.3);
  const boltWidth = 4;

  while (y < endY) {
    const stepDown = 20 + Math.random() * 20; // 20-40px vertical steps
    const shiftX = (Math.random() - 0.5) * 60; // -30 to +30px horizontal shift

    // Vertical segment
    segments.push({ x: x - boltWidth / 2, y, w: boltWidth, h: stepDown });
    y += stepDown;

    // Horizontal segment
    const hx = shiftX > 0 ? x : x + shiftX;
    segments.push({ x: hx - boltWidth / 2, y: y - boltWidth / 2, w: Math.abs(shiftX) + boltWidth, h: boltWidth });
    x += shiftX;

    // 30% chance of a branch
    if (Math.random() < 0.3) {
      const branchDir = Math.random() < 0.5 ? -1 : 1;
      let bx = x;
      let by = y;
      const branchSteps = 2 + Math.floor(Math.random() * 2);
      for (let b = 0; b < branchSteps; b++) {
        const bStep = 10 + Math.random() * 15;
        const bShift = branchDir * (10 + Math.random() * 20);
        segments.push({ x: bx - 2, y: by, w: 3, h: bStep });
        by += bStep;
        const bhx = bShift > 0 ? bx : bx + bShift;
        segments.push({ x: bhx - 2, y: by - 2, w: Math.abs(bShift) + 3, h: 3 });
        bx += bShift;
      }
    }
  }

  return segments;
}

export default function ThunderstormOverlay() {
  const { weather } = useWeather();
  const [flashOpacity, setFlashOpacity] = useState(0);
  const [bolt, setBolt] = useState<BoltSegment[] | null>(null);
  const strikeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioRefs = useRef<HTMLAudioElement[]>([]);
  const weatherRef = useRef(weather);

  useEffect(() => {
    weatherRef.current = weather;
  }, [weather]);

  // Preload thunder audio
  useEffect(() => {
    if (typeof window === 'undefined') return;
    audioRefs.current = [
      new Audio('/audio/thunder1.mp3'),
      new Audio('/audio/thunder2.mp3'),
      new Audio('/audio/thunder3.mp3'),
    ];
    audioRefs.current.forEach(a => {
      a.volume = 0.4;
      a.preload = 'auto';
    });
  }, []);

  const doStrike = useCallback(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const segments = generateBolt(w, h);

    // Show bolt + flash
    setBolt(segments);
    setFlashOpacity(0.7);

    // Fade flash after 100ms
    setTimeout(() => setFlashOpacity(0.3), 100);
    setTimeout(() => setFlashOpacity(0), 300);

    // Hide bolt after 150ms
    setTimeout(() => setBolt(null), 150);

    // Thunder sound with delay (light-before-sound)
    const soundDelay = 200 + Math.random() * 600;
    setTimeout(() => {
      if (audioRefs.current.length > 0) {
        const audio = audioRefs.current[Math.floor(Math.random() * audioRefs.current.length)];
        const clone = audio.cloneNode() as HTMLAudioElement;
        clone.volume = 0.3 + Math.random() * 0.2;
        clone.play().catch(() => {}); // ignore autoplay restrictions
      }
    }, soundDelay);
  }, []);

  // Schedule strikes during thunderstorm
  useEffect(() => {
    function scheduleStrike() {
      if (weatherRef.current !== 'thunderstorm') return;
      const delay = 5000 + Math.random() * 10000; // 5-15 seconds
      strikeTimerRef.current = setTimeout(() => {
        if (weatherRef.current === 'thunderstorm') {
          doStrike();
          scheduleStrike();
        }
      }, delay);
    }

    if (weather === 'thunderstorm') {
      // Initial strike shortly after storm starts
      const initialDelay = 1000 + Math.random() * 2000;
      strikeTimerRef.current = setTimeout(() => {
        if (weatherRef.current === 'thunderstorm') {
          doStrike();
          scheduleStrike();
        }
      }, initialDelay);
    }

    return () => {
      if (strikeTimerRef.current) {
        clearTimeout(strikeTimerRef.current);
        strikeTimerRef.current = null;
      }
    };
  }, [weather, doStrike]);

  // Don't render anything if clear and no active effects
  if (weather === 'clear' && flashOpacity === 0 && !bolt) return null;

  return (
    <>
      {/* Lightning flash overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 50,
          backgroundColor: 'white',
          opacity: flashOpacity,
          transition: flashOpacity === 0 ? 'opacity 0.2s ease-out' : 'none',
        }}
      />

      {/* Lightning bolt */}
      {bolt && (
        <svg
          className="fixed inset-0 pointer-events-none"
          style={{ zIndex: 50 }}
          width="100%"
          height="100%"
        >
          {bolt.map((seg, i) => (
            <rect
              key={i}
              x={seg.x}
              y={seg.y}
              width={seg.w}
              height={seg.h}
              fill="white"
              fillOpacity={0.95}
            />
          ))}
          {/* Glow layer */}
          {bolt.map((seg, i) => (
            <rect
              key={`g${i}`}
              x={seg.x - 2}
              y={seg.y - 2}
              width={seg.w + 4}
              height={seg.h + 4}
              fill="white"
              fillOpacity={0.3}
            />
          ))}
        </svg>
      )}
    </>
  );
}
