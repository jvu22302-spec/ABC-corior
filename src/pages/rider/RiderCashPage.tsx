import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatPKR } from '@/lib/format';
import { Banknote } from 'lucide-react';

export function RiderCashPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-ink-900">Cash on Hand (COD)</h1>
        <p className="text-xs text-ink-600">Daily cash collected from delivered consignments</p>
      </div>

      <Card className="bg-surface border-ink-200">
        <div className="flex items-center gap-2 text-xs font-semibold text-brand-600 mb-1">
          <Banknote className="w-4 h-4" />
          <span>CURRENT SHIFT BALANCE</span>
        </div>
        <div className="text-2xl font-bold font-mono text-ink-900 mb-1">
          {formatPKR(8450)}
        </div>
        <p className="text-xs text-ink-600">
          Collected across 3 delivered shipments today. Hand over to Branch Cashier at shift closure.
        </p>

        <div className="pt-4 mt-4 border-t border-ink-100">
          <Button variant="secondary" className="w-full min-h-[44px]">
            Generate Handover Token
          </Button>
        </div>
      </Card>
    </div>
  );
}
