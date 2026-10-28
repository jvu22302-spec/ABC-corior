import React, { useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { m, AnimatePresence, type Variants } from 'framer-motion';
import { useMotionPreference } from './useMotionPreference';

export interface PageTransitionProps {
  children: React.ReactNode;
  /** Transition preset: 'public' (expressive slide + fade) or 'admin' / 'rider' (restrained opacity-only) */
  preset?: 'public' | 'admin' | 'rider';
  className?: string;
}

const publicVariants: Variants = {
  initial: {
    opacity: 0,
    y: 12,
    filter: 'blur(3px)',
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.35,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    filter: 'blur(2px)',
    transition: {
      duration: 0.2,
      ease: [0.42, 0, 0.58, 1],
    },
  },
};

const restrainedVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.15,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.1,
      ease: 'easeIn',
    },
  },
};

/**
 * Route level transition wrapper.
 * Integrates AnimatePresence keyed by location.pathname.
 * Focuses main content or h1 heading upon transition finish for WCAG accessibility.
 */
export function PageTransition({
  children,
  preset = 'public',
  className = 'w-full min-h-full',
}: PageTransitionProps) {
  const location = useLocation();
  const { reduced } = useMotionPreference();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleAnimationComplete = () => {
    // Accessible focus management: focus primary heading or main container after route transition
    if (typeof document !== 'undefined') {
      const heading = document.querySelector('h1, main [tabindex="-1"], main');
      if (heading instanceof HTMLElement) {
        heading.focus();
      }
    }
  };

  const variants = reduced || preset !== 'public' ? restrainedVariants : publicVariants;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <m.div
        ref={containerRef}
        key={location.pathname}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        onAnimationComplete={handleAnimationComplete}
        className={className}
      >
        {children}
      </m.div>
    </AnimatePresence>
  );
}
