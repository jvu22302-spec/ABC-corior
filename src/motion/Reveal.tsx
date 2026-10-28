import React from 'react';
import { m, type Variants, type HTMLMotionProps } from 'framer-motion';
import { useMotionPreference } from './useMotionPreference';
import { fadeUp, fadeIn, scaleIn, slideInLeft, slideInRight } from './variants';

export interface RevealProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  variant?: 'fadeUp' | 'fadeIn' | 'scaleIn' | 'slideInLeft' | 'slideInRight';
  delay?: number;
  duration?: number;
  className?: string;
}

const variantMap: Record<NonNullable<RevealProps['variant']>, Variants> = {
  fadeUp,
  fadeIn,
  scaleIn,
  slideInLeft,
  slideInRight,
};

/**
 * Scroll Reveal Component
 * Triggers animation once when scrolled into view (-10% margin).
 * Automatically strips spatial movement if prefers-reduced-motion is active.
 */
export function Reveal({
  children,
  variant = 'fadeUp',
  delay = 0,
  duration,
  className,
  ...props
}: RevealProps) {
  const { reduced } = useMotionPreference();

  // If user prefers reduced motion, render immediately without spatial movement
  if (reduced) {
    return (
      <m.div initial={false} animate={false} className={className} {...props}>
        {children}
      </m.div>
    );
  }

  const baseVariant = variantMap[variant] || fadeUp;
  const customVariants: Variants = {
    hidden: baseVariant.hidden,
    visible: {
      ...baseVariant.visible,
      transition: {
        ...(typeof baseVariant.visible === 'object' && 'transition' in baseVariant.visible
          ? (baseVariant.visible as { transition?: object }).transition
          : {}),
        delay,
        ...(duration ? { duration } : {}),
      },
    },
  };

  return (
    <m.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-10%' }}
      variants={customVariants}
      className={className}
      {...props}
    >
      {children}
    </m.div>
  );
}
