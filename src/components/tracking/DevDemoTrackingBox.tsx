import React from 'react';
import { DEMO_TRACKING_NUMBERS } from '@/services/mock/tracking.mock';
import { Sparkles } from 'lucide-react';

export interface DevDemoTrackingBoxProps {
  onSelectTrackingNo: (trackingNo: string) => void;
  activeTrackingNo?: string;
}

export function DevDemoTrackingBox({
  onSelectTrackingNo,
  activeTrackingNo,
}: DevDemoTrackingBoxProps) {
  // Visible ONLY in development mode; completely stripped in production builds
  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <aside
      className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2.5 text-xs select-none"
      aria-label="Development Demo Consignments"
    >
      <div className="flex items-center gap-1.5 text-amber-900 font-bold uppercase tracking-wider text-[11px]">
        <Sparkles className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
        <span>Dev Mode: Demo Consignments</span>
      </div>
      <p className="text-[11px] text-amber-800">
        Click any seeded consignment below to inspect state transition timeline and privacy projections:
      </p>

      <div className="flex flex-wrap gap-1.5 pt-0.5">
        {DEMO_TRACKING_NUMBERS.map((demo) => {
          const isSelected = activeTrackingNo?.toUpperCase() === demo.no;
          return (
            <button
              key={demo.no}
              type="button"
              onClick={() => onSelectTrackingNo(demo.no)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors border text-left ${
                isSelected
                  ? 'bg-amber-700 text-white border-amber-700 shadow-2xs font-bold'
                  : 'bg-white text-ink-800 border-amber-300 hover:bg-amber-100/70 hover:border-amber-400'
              }`}
              title={`Load demo consignment ${demo.no} (${demo.label})`}
            >
              <span>{demo.no}</span>
              <span className="opacity-75 font-sans ml-1 text-[10px]">({demo.label})</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
