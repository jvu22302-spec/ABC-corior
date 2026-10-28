import React from 'react';
import { LazyMotion, domAnimation, MotionConfig } from 'framer-motion';

export interface MotionProviderProps {
  children: React.ReactNode;
}

/**
 * Root Motion Provider
 * Uses LazyMotion with domAnimation feature bundle for minimal footprint (<20KB).
 * Applies MotionConfig reducedMotion="user" to respect user preferences globally.
 */
export function MotionProvider({ children }: MotionProviderProps) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}
