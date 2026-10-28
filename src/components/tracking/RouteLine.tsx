import React from 'react';
import { ArrowRight, MapPin } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface RouteLineProps {
  originCity: string;
  destinationCity: string;
  className?: string;
}

export function RouteLine({ originCity, destinationCity, className }: RouteLineProps) {
  return (
    <div
      className={cn(
        'p-3.5 sm:p-4 bg-surface-muted/70 rounded-xl border border-ink-200/80',
        className
      )}
      aria-label={`Route from ${originCity} to ${destinationCity}`}
    >
      <div className="flex items-center justify-between gap-3 sm:gap-6">
        {/* Origin */}
        <div className="flex-1 min-w-0">
          <span className="text-[10px] sm:text-[11px] font-semibold text-ink-400 uppercase tracking-wider block">
            Origin
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="w-2.5 h-2.5 rounded-full bg-brand-600 shrink-0" aria-hidden="true" />
            <span className="text-xs sm:text-sm font-bold text-ink-900 truncate">
              {originCity}
            </span>
          </div>
        </div>

        {/* Visual Connector: ──●── */}
        <div className="flex items-center justify-center flex-1 max-w-[140px] px-2 select-none">
          <div className="h-0.5 flex-1 bg-ink-300" />
          <div className="w-6 h-6 rounded-full bg-surface border border-ink-300 flex items-center justify-center mx-1 shadow-2xs text-brand-600 shrink-0">
            <ArrowRight className="w-3 h-3" aria-hidden="true" />
          </div>
          <div className="h-0.5 flex-1 bg-ink-300" />
        </div>

        {/* Destination */}
        <div className="flex-1 min-w-0 text-right">
          <span className="text-[10px] sm:text-[11px] font-semibold text-ink-400 uppercase tracking-wider block">
            Destination
          </span>
          <div className="flex items-center justify-end gap-1.5 mt-0.5">
            <span className="text-xs sm:text-sm font-bold text-ink-900 truncate">
              {destinationCity}
            </span>
            <MapPin className="w-3.5 h-3.5 text-accent-600 shrink-0" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  );
}
