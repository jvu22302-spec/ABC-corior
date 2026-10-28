import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  className,
}: PaginationProps) {
  const getPages = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <nav
      role="navigation"
      aria-label="Pagination Navigation"
      className={cn('flex items-center justify-between gap-4 py-3 text-sm text-ink-600', className)}
    >
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          aria-label="Go to previous page"
          className="p-1.5 rounded-md border border-ink-200 text-ink-700 hover:bg-surface-muted disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1 mx-1">
          {getPages().map((page, index) => {
            if (typeof page === 'string') {
              return (
                <span key={`ellipsis-${index}`} className="px-2 text-ink-400 select-none">
                  ...
                </span>
              );
            }

            const isCurrent = page === currentPage;
            return (
              <button
                key={`page-${page}`}
                type="button"
                onClick={() => onPageChange?.(page)}
                aria-current={isCurrent ? 'page' : undefined}
                className={cn(
                  'w-8 h-8 rounded-md text-xs font-medium flex items-center justify-center transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600',
                  isCurrent
                    ? 'bg-brand-600 text-white font-semibold'
                    : 'text-ink-700 hover:bg-surface-muted border border-transparent hover:border-ink-200'
                )}
              >
                {page}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onPageChange?.(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          aria-label="Go to next page"
          className="p-1.5 rounded-md border border-ink-200 text-ink-700 hover:bg-surface-muted disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="text-xs text-ink-600 hidden sm:block">
        Page <span className="font-semibold text-ink-900">{currentPage}</span> of{' '}
        <span className="font-semibold text-ink-900">{totalPages}</span>
      </div>
    </nav>
  );
}
