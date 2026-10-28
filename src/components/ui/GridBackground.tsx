import React from 'react';
import { useMotionPreference } from '@/motion/useMotionPreference';
import { cn } from '@/lib/cn';

export interface GridBackgroundProps {
  className?: string;
}

/**
 * Grid Background
 * Subtle precision logistics grid overlay with radial vignette fade.
 * Disables high-contrast or animated shifts under reduced motion / low-power constraints.
 */
export function GridBackground({ className }: GridBackgroundProps) {
  const { reduced, lowPower } = useMotionPreference();

  if (reduced || lowPower) {
    return (
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-surface-muted/60 to-transparent',
          className
        )}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 -z-10 overflow-hidden select-none',
        className
      )}
    >
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_35%,#000_70%,transparent_100%)] opacity-60"
      />
    </div>
  );
}
