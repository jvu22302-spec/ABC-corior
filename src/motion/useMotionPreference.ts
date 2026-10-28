import { useState, useEffect } from 'react';

export interface MotionPreference {
  /** True when the user prefers reduced motion (OS or browser setting) */
  reduced: boolean;
  /** True on low-power devices, battery saver, data-saver mode, or low-core machines */
  lowPower: boolean;
}

function checkReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function checkLowPower(): boolean {
  if (typeof navigator === 'undefined') return false;

  try {
    // 1. Data-saver mode enabled
    const conn = (navigator as unknown as { connection?: { saveData?: boolean } }).connection;
    if (conn && conn.saveData === true) {
      return true;
    }

    // 2. Hardware concurrency <= 4 cores
    if (typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4) {
      return true;
    }

    // 3. Device memory <= 4 GB (when reported by Chromium browsers)
    const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory;
    if (typeof mem === 'number' && mem > 0 && mem <= 4) {
      return true;
    }
  } catch {
    // Fallback safely if browser denies access
  }

  return false;
}

/**
 * Hook to read motion preference and device capability.
 * Updates dynamically if user toggles prefers-reduced-motion in OS settings.
 */
export function useMotionPreference(): MotionPreference {
  const [reduced, setReduced] = useState<boolean>(checkReducedMotion);
  const [lowPower] = useState<boolean>(checkLowPower);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (event: MediaQueryListEvent) => {
      setReduced(event.matches);
    };

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else if (typeof mediaQuery.addListener === 'function') {
      // Legacy Safari / Older WebKit
      mediaQuery.addListener(handler);
      return () => mediaQuery.removeListener(handler);
    }
  }, []);

  return { reduced, lowPower };
}
