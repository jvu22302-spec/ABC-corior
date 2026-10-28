import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LifeBuoy, AlertCircle, Phone } from 'lucide-react';

export interface HelpCardProps {
  trackingNo?: string;
}

export function HelpCard({ trackingNo }: HelpCardProps) {
  const supportUrl = trackingNo
    ? `/support?tn=${encodeURIComponent(trackingNo)}`
    : '/support';

  return (
    <Card className="bg-surface-muted/60 border-ink-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <LifeBuoy className="w-4 h-4 text-brand-600" aria-hidden="true" />
            <h3 className="text-sm font-bold text-ink-900">Need Help with this Shipment?</h3>
          </div>
          <p className="text-xs text-ink-600 max-w-xl">
            If your consignment delivery is delayed, requires updated address instructions, or you wish to file an inquiry, our operations desk is here to assist.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link to={supportUrl}>
            <Button variant="secondary" size="sm" leftIcon={<AlertCircle className="w-3.5 h-3.5" />}>
              Report a problem
            </Button>
          </Link>
          <Link to="/contact">
            <Button variant="ghost" size="sm" leftIcon={<Phone className="w-3.5 h-3.5" />}>
              Contact us
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
