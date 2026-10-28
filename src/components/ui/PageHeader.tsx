import React from 'react';
import { cn } from '@/lib/cn';

export interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  kicker?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  kicker,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-ink-200/80 mb-6',
        className
      )}
    >
      <div>
        {kicker && (
          <div className="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-1">
            {kicker}
          </div>
        )}
        <h1 className="text-xl sm:text-2xl font-bold text-ink-900 tracking-tight">{title}</h1>
        {description && (
          <p className="text-xs sm:text-sm text-ink-600 mt-1 max-w-2xl leading-normal">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
    </div>
  );
}
