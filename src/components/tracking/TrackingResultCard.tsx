import React, { useState } from 'react';
import { PublicTracking } from '@/types/domain';
import { StatusBadge } from '@/components/domain/StatusBadge';
import { RouteLine } from './RouteLine';
import { formatDateOnly } from '@/lib/format';
import { Copy, Check, Info, Calendar, PackageCheck, User } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export interface TrackingResultCardProps {
  tracking: PublicTracking;
}

export function TrackingResultCard({ tracking }: TrackingResultCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(tracking.trackingNo);
      } else {
        // Fallback for restricted clipboard
        const input = document.createElement('input');
        input.value = tracking.trackingNo;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore copy error
    }
  };

  return (
    <Card className="border-t-4 border-t-brand-600 shadow-sm space-y-6">
      {/* Top Header: Tracking Number, Copy, Status Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-ink-100">
        <div>
          <div className="text-[10px] sm:text-[11px] font-mono text-ink-400 uppercase tracking-wider mb-1">
            Consignment Airway Bill (AWB)
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold font-mono text-ink-900 tracking-tight">
              {tracking.trackingNo}
            </h2>
            <button
              type="button"
              onClick={handleCopy}
              className="p-1.5 text-ink-500 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
              title="Copy tracking number"
              aria-label="Copy tracking number"
            >
              {copied ? (
                <Check className="w-4 h-4 text-success" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
            <span
              className="text-[11px] font-medium text-success"
              aria-live="polite"
              aria-atomic="true"
            >
              {copied && 'Copied'}
            </span>
          </div>
        </div>

        <div className="shrink-0">
          <StatusBadge status={tracking.status} variant="public" size="md" />
        </div>
      </div>

      {/* Route Graphic */}
      <RouteLine originCity={tracking.originCity} destinationCity={tracking.destinationCity} />

      {/* Consignment Metadata Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="text-[11px] text-ink-400 block mb-0.5">Service Type</span>
          <span className="font-semibold text-ink-900 flex items-center gap-1.5">
            <PackageCheck className="w-3.5 h-3.5 text-ink-400" aria-hidden="true" />
            <span>{tracking.serviceName}</span>
          </span>
        </div>

        <div>
          <span className="text-[11px] text-ink-400 block mb-0.5">Booking Date</span>
          <span className="font-semibold text-ink-900 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-ink-400" aria-hidden="true" />
            <span>{formatDateOnly(tracking.bookedAt)}</span>
          </span>
        </div>

        {tracking.estimatedDeliveryText && (
          <div>
            <span className="text-[11px] text-ink-400 block mb-0.5">Delivery Status</span>
            <span className="font-semibold text-brand-700">
              {tracking.estimatedDeliveryText}
            </span>
          </div>
        )}

        {tracking.recipientDisplayName && (
          <div>
            <span className="text-[11px] text-ink-400 block mb-0.5">Recipient</span>
            <span className="font-semibold text-ink-900 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-ink-400" aria-hidden="true" />
              <span>{tracking.recipientDisplayName}</span>
            </span>
          </div>
        )}
      </div>

      {/* Staff Update Line — Strictly No GPS/Maps */}
      <div className="pt-4 border-t border-ink-100 flex items-center gap-2 text-xs text-ink-500">
        <Info className="w-4 h-4 text-ink-400 shrink-0" aria-hidden="true" />
        <span>Status updated by our staff at regional sorting gateways and transit checkpoints.</span>
      </div>
    </Card>
  );
}
