import React from 'react';
import { PublicTrackingEvent } from '@/types/domain';
import { StatusBadge } from '@/components/domain/StatusBadge';
import { formatDateTime } from '@/lib/format';
import { MapPin, Clock } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface TrackingTimelineProps {
  events: PublicTrackingEvent[];
  className?: string;
}

export function TrackingTimeline({ events, className }: TrackingTimelineProps) {
  if (!events || events.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-ink-500">
        No tracking milestone events recorded yet.
      </div>
    );
  }

  // Sort events newest first
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
  );

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between pb-3 border-b border-ink-100">
        <h2 className="text-sm font-bold text-ink-900 tracking-tight flex items-center gap-2">
          <Clock className="w-4 h-4 text-brand-600" aria-hidden="true" />
          <span>Tracking History</span>
        </h2>
        <span className="text-[11px] text-ink-400 font-mono">
          Newest first ({sortedEvents.length} {sortedEvents.length === 1 ? 'event' : 'events'})
        </span>
      </div>

      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 sm:before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-ink-200">
        {sortedEvents.map((event, index) => {
          const isLatest = index === 0;

          return (
            <div key={`${event.occurredAt}-${index}`} className="relative group">
              {/* Timeline marker bullet */}
              <div
                className={cn(
                  'absolute -left-6 sm:-left-8 top-1 w-5 h-5 rounded-full border-2 bg-surface flex items-center justify-center transition-transform',
                  isLatest
                    ? 'border-brand-600 bg-brand-600 shadow-xs ring-4 ring-brand-50'
                    : 'border-ink-300'
                )}
                aria-hidden="true"
              >
                {isLatest ? (
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-ink-400" />
                )}
              </div>

              {/* Event card content */}
              <div
                className={cn(
                  'p-3.5 sm:p-4 rounded-xl border transition-colors',
                  isLatest
                    ? 'bg-brand-50/40 border-brand-200 shadow-2xs'
                    : 'bg-surface border-ink-200/80 hover:border-ink-300'
                )}
              >
                {/* Header: StatusBadge, Location, Timestamp */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={event.status} variant="public" size="sm" />
                    <span className="text-xs font-semibold text-ink-900 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-ink-400 shrink-0" aria-hidden="true" />
                      <span>{event.locationName}</span>
                    </span>
                  </div>

                  <time
                    dateTime={event.occurredAt}
                    className="text-[11px] font-mono font-medium text-ink-500 whitespace-nowrap"
                  >
                    {formatDateTime(event.occurredAt, 'dd MMM yyyy, hh:mm a')}
                  </time>
                </div>

                {/* Public message */}
                <p className="text-xs text-ink-700 leading-relaxed">
                  {event.publicMessage}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
