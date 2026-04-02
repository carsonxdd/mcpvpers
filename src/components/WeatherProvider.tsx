'use client';

import { createContext, useContext, useCallback, useEffect, useRef, useState } from 'react';
import ThunderstormOverlay from './ThunderstormOverlay';

export type WeatherState = 'clear' | 'rain' | 'thunderstorm';

interface WeatherContextValue {
  weather: WeatherState;
  setWeather: (w: WeatherState) => void;
  isManual: boolean;
}

const WeatherContext = createContext<WeatherContextValue>({
  weather: 'clear',
  setWeather: () => {},
  isManual: false,
});

export function useWeather() {
  return useContext(WeatherContext);
}

export default function WeatherProvider({ children }: { children: React.ReactNode }) {
  const [weather, setWeatherState] = useState<WeatherState>('clear');
  const [isManual, setIsManual] = useState(false);

  const weatherRef = useRef(weather);
  const isManualRef = useRef(isManual);
  const checkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const durationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    weatherRef.current = weather;
  }, [weather]);

  useEffect(() => {
    isManualRef.current = isManual;
  }, [isManual]);

  const clearTimers = useCallback(() => {
    if (checkTimerRef.current) {
      clearTimeout(checkTimerRef.current);
      checkTimerRef.current = null;
    }
    if (durationTimerRef.current) {
      clearTimeout(durationTimerRef.current);
      durationTimerRef.current = null;
    }
  }, []);

  const startAutoWeather = useCallback((type: 'rain' | 'thunderstorm') => {
    setWeatherState(type);
    if (durationTimerRef.current) clearTimeout(durationTimerRef.current);
    const duration = type === 'rain'
      ? 30000 + Math.random() * 60000   // 30-90s
      : 45000 + Math.random() * 75000;  // 45-120s
    durationTimerRef.current = setTimeout(() => {
      setWeatherState('clear');
      durationTimerRef.current = null;
    }, duration);
  }, []);

  // Random weather scheduler
  useEffect(() => {
    function scheduleNextCheck() {
      const delay = 120000 + Math.random() * 180000; // 2-5 minutes
      checkTimerRef.current = setTimeout(() => {
        if (!isManualRef.current) {
          const roll = Math.random();
          if (weatherRef.current === 'clear') {
            if (roll < 0.05) {
              startAutoWeather('thunderstorm');
            } else if (roll < 0.20) {
              startAutoWeather('rain');
            }
          } else if (weatherRef.current === 'rain') {
            if (roll < 0.10) {
              startAutoWeather('thunderstorm');
            }
          }
        }
        scheduleNextCheck();
      }, delay);
    }

    scheduleNextCheck();
    return () => clearTimers();
  }, [clearTimers, startAutoWeather]);

  // Manual weather setter
  const setWeather = useCallback((w: WeatherState) => {
    if (durationTimerRef.current) {
      clearTimeout(durationTimerRef.current);
      durationTimerRef.current = null;
    }

    if (w === 'clear') {
      setIsManual(false);
    } else {
      setIsManual(true);
    }
    setWeatherState(w);
  }, []);

  return (
    <WeatherContext.Provider value={{ weather, setWeather, isManual }}>
      {children}
      <ThunderstormOverlay />
    </WeatherContext.Provider>
  );
}
