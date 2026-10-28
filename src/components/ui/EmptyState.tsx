import React from 'react';
import { PackageOpen } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useMotionPreference } from '@/motion/useMotionPreference';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const { reduced, lowPower } = useMotionPreference();

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center bg-surface-muted/50 rounded-xl border border-dashed border-ink-300',
        className
      )}
    >
      <div
        className={cn(
          'w-12 h-12 rounded-lg bg-ink-100 flex items-center justify-center text-ink-400 mb-3',
          !reduced && !lowPower && 'motion-safe:animate-float'
        )}
      >
        {icon || <PackageOpen className="w-6 h-6" />}
      </div>
      <h3 className="text-sm font-semibold text-ink-900 mb-1">{title}</h3>
      {description && <p className="text-xs text-ink-600 max-w-sm mb-4">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}
