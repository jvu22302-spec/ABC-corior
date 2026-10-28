/**
 * Motion Tokens for ABC Logistics & Courier Tracking
 * Standardized durations, easing curves, and physics springs.
 */

export const DURATION = {
  fast: 0.15,
  base: 0.3,
  slow: 0.6,
  hero: 1.0,
} as const;

export const EASING = {
  easeOutExpo: [0.16, 1, 0.3, 1] as const,
  easeInOut: [0.42, 0, 0.58, 1] as const,
  linear: [0, 0, 1, 1] as const,
} as const;

export const SPRING = {
  snappy: {
    type: 'spring',
    stiffness: 420,
    damping: 32,
    mass: 0.8,
  } as const,
  soft: {
    type: 'spring',
    stiffness: 180,
    damping: 24,
    mass: 1,
  } as const,
  bouncy: {
    type: 'spring',
    stiffness: 300,
    damping: 20,
    mass: 0.9,
  } as const,
} as const;
