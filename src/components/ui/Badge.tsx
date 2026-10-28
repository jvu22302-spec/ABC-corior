import React from 'react';
import { cn } from '@/lib/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'accent';
  size?: 'sm' | 'md';
}

export function Badge({
  children,
  variant = 'neutral',
  size = 'sm',
  className,
  ...props
}: BadgeProps) {
  const sizeStyles = {
    sm: 'text-[11px] font-semibold px-2 py-0.5',
    md: 'text-xs font-semibold px-2.5 py-1',
  }[size];

  const variantStyles = {
    neutral: 'bg-ink-100 text-ink-700 border border-ink-200',
    brand: 'bg-brand-50 text-brand-700 border border-brand-100',
    success: 'bg-green-50 text-success-dark border border-green-200',
    warning: 'bg-amber-50 text-warning-dark border border-amber-200',
    danger: 'bg-red-50 text-danger-dark border border-red-200',
    info: 'bg-sky-50 text-info-dark border border-sky-200',
    accent: 'bg-orange-50 text-accent-700 border border-orange-200',
  }[variant];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full select-none leading-none animate-fadeIn',
        sizeStyles,
        variantStyles,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
