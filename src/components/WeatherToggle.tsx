'use client';

import { useWeather, type WeatherState } from './WeatherProvider';

const weatherCycle: WeatherState[] = ['clear', 'rain', 'thunderstorm'];
const labels: Record<WeatherState, string> = {
  clear: 'Weather: Clear',
  rain: 'Weather: Rain',
  thunderstorm: 'Weather: Thunderstorm',
};

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="t-text-dim">
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="5" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="4.93" y1="4.93" x2="6.76" y2="6.76" />
      <line x1="17.24" y1="17.24" x2="19.07" y2="19.07" />
      <line x1="2" y1="12" x2="5" y2="12" />
      <line x1="19" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="19.07" x2="6.76" y2="17.24" />
      <line x1="17.24" y1="6.76" x2="19.07" y2="4.93" />
    </svg>
  );
}

function RainIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-sky-400">
      <path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25" />
      <line x1="8" y1="16" x2="8" y2="20" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="16" y1="16" x2="16" y2="20" />
    </svg>
  );
}

function ThunderIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold">
      <path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9" />
      <polyline points="13 11 9 17 15 17 11 23" />
    </svg>
  );
}

export default function WeatherToggle() {
  const { weather, setWeather } = useWeather();

  const handleClick = () => {
    const currentIdx = weatherCycle.indexOf(weather);
    const nextIdx = (currentIdx + 1) % weatherCycle.length;
    setWeather(weatherCycle[nextIdx]);
  };

  return (
    <button
      onClick={handleClick}
      className="w-8 h-8 max-md:w-11 max-md:h-11 flex items-center justify-center rounded-md hover-surface focus-visible:outline-2 focus-visible:outline-gold/60 active:bg-[color-mix(in_srgb,var(--c-surface)_50%,transparent)] transition-colors cursor-pointer"
      title={labels[weather]}
      aria-label={labels[weather]}
    >
      {weather === 'clear' && <SunIcon />}
      {weather === 'rain' && <RainIcon />}
      {weather === 'thunderstorm' && <ThunderIcon />}
    </button>
  );
}
