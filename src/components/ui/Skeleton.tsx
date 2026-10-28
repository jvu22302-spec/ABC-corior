import React from 'react';
import { cn } from '@/lib/cn';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md bg-ink-200/60',
        'after:absolute after:inset-0 after:-translate-x-full after:animate-shimmer after:bg-gradient-to-r after:from-transparent after:via-white/40 after:to-transparent',
        className
      )}
      aria-hidden="true"
      {...props}
    />
  );
}
