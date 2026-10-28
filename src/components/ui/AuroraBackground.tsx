import React from 'react';
import { useMotionPreference } from '@/motion/useMotionPreference';
import { cn } from '@/lib/cn';

export interface AuroraBackgroundProps {
  className?: string;
}

/**
 * Aurora Background
 * Soft blurred drifting gradient blobs in brand and accent tones.
 * Automatically falls back to a clean static gradient when reduced motion or low-power mode is detected.
 */
export function AuroraBackground({ className }: AuroraBackgroundProps) {
  const { reduced, lowPower } = useMotionPreference();

  if (reduced || lowPower) {
    return (
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-0 overflow-hidden bg-gradient-to-b from-brand-50/40 via-surface to-surface -z-10',
          className
        )}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 overflow-hidden -z-10 select-none', className)}
    >
      {/* Top Left Blob - Brand Blue */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-brand-500/15 blur-3xl motion-safe:animate-float" />

      {/* Center Right Blob - Soft Accent Amber */}
      <div
        className="absolute top-20 right-0 w-80 h-80 rounded-full bg-accent-500/10 blur-3xl motion-safe:animate-float"
        style={{ animationDelay: '-1.8s' }}
      />

      {/* Bottom Center Blob - Subtle Cyan / Info */}
      <div
        className="absolute bottom-0 left-1/3 w-[30rem] h-64 rounded-full bg-sky-400/10 blur-3xl motion-safe:animate-float"
        style={{ animationDelay: '-3.2s' }}
      />
    </div>
  );
}
