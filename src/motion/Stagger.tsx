import React from 'react';
import { m, type Variants, type HTMLMotionProps } from 'framer-motion';
import { useMotionPreference } from './useMotionPreference';
import { fadeUp, fadeIn } from './variants';

export interface StaggerContainerProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  staggerDelay?: number;
  delayChildren?: number;
  className?: string;
}

export function StaggerContainer({
  children,
  staggerDelay = 0.08,
  delayChildren = 0.02,
  className,
  ...props
}: StaggerContainerProps) {
  const { reduced } = useMotionPreference();

  if (reduced) {
    return (
      <m.div initial={false} animate={false} className={className} {...props}>
        {children}
      </m.div>
    );
  }

  const customContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren,
      },
    },
  };

  return (
    <m.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-10%' }}
      variants={customContainer}
      className={className}
      {...props}
    >
      {children}
    </m.div>
  );
}

export interface StaggerItemProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  variant?: 'fadeUp' | 'fadeIn';
  className?: string;
}

export function StaggerItem({
  children,
  variant = 'fadeUp',
  className,
  ...props
}: StaggerItemProps) {
  const { reduced } = useMotionPreference();

  if (reduced) {
    return (
      <m.div initial={false} animate={false} className={className} {...props}>
        {children}
      </m.div>
    );
  }

  return (
    <m.div
      variants={variant === 'fadeIn' ? fadeIn : fadeUp}
      className={className}
      {...props}
    >
      {children}
    </m.div>
  );
}
