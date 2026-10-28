import React from 'react';
import { cn } from '@/lib/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'muted' | 'outline';
  interactive?: boolean;
}

export function Card({ variant = 'default', interactive = false, className, children, ...props }: CardProps) {
  const variantStyles = {
    default: 'bg-surface border border-ink-200 shadow-xs',
    muted: 'bg-surface-muted border border-ink-200',
    outline: 'bg-transparent border border-ink-300',
  }[variant];

  return (
    <div
      className={cn(
        'rounded-xl p-5',
        variantStyles,
        interactive &&
          'transition-all duration-200 hover:-translate-y-1 hover:shadow-md motion-reduce:hover:translate-y-0 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex flex-col space-y-1 mb-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-base font-semibold text-ink-900', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-xs text-ink-600', className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('space-y-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex items-center pt-4 border-t border-ink-100 mt-4', className)} {...props}>
      {children}
    </div>
  );
}
