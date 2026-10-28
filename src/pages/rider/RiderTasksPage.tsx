import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/domain/StatusBadge';
import { formatPKR } from '@/lib/format';
import { MapPin, Phone, ShieldAlert } from 'lucide-react';

export function RiderTasksPage() {

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-ink-900">Today's Delivery Tasks</h1>
          <p className="text-xs text-ink-600">Assigned Zone: Clifton & DHA (Zone A)</p>
        </div>
        <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-800 rounded-md">
          Duty: Active
        </span>
      </div>

      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
        <span>Rider workflow Foundation (Phase F0). Live tasks unlock in Phase F5.</span>
      </div>

      {/* Sample Task Card */}
      <Card className="border-l-4 border-l-accent-500">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono font-bold text-ink-900">ABC26123456784</span>
          <StatusBadge status="out_for_delivery" size="sm" />
        </div>

        <div className="space-y-2 text-xs text-ink-700 mb-4">
          <div className="font-semibold text-sm text-ink-900">Muhammad Hamza (Consignee)</div>
          <p className="flex items-start gap-1.5 text-ink-600">
            <MapPin className="w-3.5 h-3.5 text-ink-400 mt-0.5 shrink-0" />
            <span>House 24-B, Khayaban-e-Shamsheer, Phase 5, DHA, Karachi</span>
          </p>
          <div className="flex items-center justify-between pt-1">
            <span className="text-ink-600">COD to Collect:</span>
            <span className="font-mono font-bold text-ink-900 text-sm">
              {formatPKR(2850)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-ink-100">
          <a
            href="tel:+923001234567"
            className="flex items-center justify-center gap-1.5 py-2 px-3 border border-ink-300 rounded-md text-xs font-semibold text-ink-700 hover:bg-surface-muted min-h-[44px]"
          >
            <Phone className="w-3.5 h-3.5 text-ink-600" />
            <span>Call Customer</span>
          </a>
          <Button variant="primary" size="sm" className="min-h-[44px]">
            Update Status
          </Button>
        </div>
      </Card>
    </div>
  );
}
