import type { Variants } from 'framer-motion';
import { DURATION, EASING } from './tokens';

/**
 * Standard Fade In
 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: DURATION.base,
      ease: EASING.easeOutExpo,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: DURATION.fast,
      ease: EASING.easeInOut,
    },
  },
};

/**
 * Fade Up (16px vertical translation)
 */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION.base,
      ease: EASING.easeOutExpo,
    },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: {
      duration: DURATION.fast,
      ease: EASING.easeInOut,
    },
  },
};

/**
 * Scale In (from 0.95 scale + fade)
 */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: DURATION.base,
      ease: EASING.easeOutExpo,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: DURATION.fast,
      ease: EASING.easeInOut,
    },
  },
};

/**
 * Slide In Left (-24px X translation)
 */
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: DURATION.base,
      ease: EASING.easeOutExpo,
    },
  },
  exit: {
    opacity: 0,
    x: -24,
    transition: {
      duration: DURATION.fast,
      ease: EASING.easeInOut,
    },
  },
};

/**
 * Slide In Right (+24px X translation)
 */
export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: DURATION.base,
      ease: EASING.easeOutExpo,
    },
  },
  exit: {
    opacity: 0,
    x: 24,
    transition: {
      duration: DURATION.fast,
      ease: EASING.easeInOut,
    },
  },
};

/**
 * Stagger Container for item lists / grids
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.04,
      staggerDirection: -1,
    },
  },
};

/**
 * SVG Path Draw Line (for checkmarks, route lines, status ticks)
 */
export const drawLine: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      duration: 0.45,
      ease: EASING.easeOutExpo,
    },
  },
};

/**
 * Subtle Pulse Dot (for active courier / in-transit indicators)
 */
export const pulseDot: Variants = {
  initial: { scale: 1, opacity: 0.8 },
  animate: {
    scale: [1, 1.25, 1],
    opacity: [0.8, 1, 0.8],
    transition: {
      duration: 1.8,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

/**
 * Gentle Float Y (for empty state illustrations / decorative icons)
 */
export const floatY: Variants = {
  initial: { y: 0 },
  animate: {
    y: [0, -6, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};
