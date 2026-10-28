import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/lib/cn';
import { useMotionPreference } from '@/motion/useMotionPreference';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Failed to load information',
  message = 'An unexpected error occurred while communicating with the ABC logistics services.',
  onRetry,
  className,
}: ErrorStateProps) {
  const { reduced, lowPower } = useMotionPreference();

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center bg-red-50/50 rounded-xl border border-red-200',
        className
      )}
      role="alert"
    >
      <div
        className={cn(
          'w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center text-danger mb-3',
          !reduced && !lowPower && 'motion-safe:animate-float'
        )}
      >
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-semibold text-ink-900 mb-1">{title}</h3>
      <p className="text-xs text-ink-600 max-w-sm mb-4 leading-relaxed">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
          Retry
        </Button>
      )}
    </div>
  );
}
