import React, { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import { useMotionPreference } from './useMotionPreference';
import { formatPKR } from '@/lib/format';

export interface CountUpProps {
  value: number;
  from?: number;
  duration?: number;
  format?: 'number' | 'pkr' | 'custom';
  formatter?: (val: number) => string;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

/**
 * Animated numerical counter.
 * Uses requestAnimationFrame with cubic easeOutExpo curve.
 * Adheres to tabular-nums alignment to prevent layout shifts.
 * Renders final value instantly when prefers-reduced-motion is enabled.
 */
export function CountUp({
  value,
  from = 0,
  duration = 1.0,
  format = 'number',
  formatter,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-10%' });
  const { reduced, lowPower } = useMotionPreference();

  const [displayValue, setDisplayValue] = useState<number>(() => {
    return reduced || lowPower ? value : from;
  });

  useEffect(() => {
    if (reduced || lowPower || !isInView) {
      return;
    }

    let startTime: number | null = null;
    let animationFrameId: number;
    const durationMs = duration * 1000;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / durationMs, 1);

      // easeOutExpo curve: 1 - Math.pow(2, -10 * progress)
      const easedProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = from + (value - from) * easedProgress;

      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isInView, value, from, duration, reduced, lowPower]);

  const effectiveValue = reduced || lowPower ? value : displayValue;

  let formattedText = '';
  if (formatter) {
    formattedText = formatter(effectiveValue);
  } else if (format === 'pkr') {
    formattedText = formatPKR(Math.round(effectiveValue * 100) / 100);
  } else {
    formattedText = effectiveValue.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  return (
    <span
      ref={ref}
      style={{ fontVariantNumeric: 'tabular-nums' }}
      className={`inline-block tabular-nums ${className}`}
    >
      {prefix}
      {formattedText}
      {suffix}
    </span>
  );
}
