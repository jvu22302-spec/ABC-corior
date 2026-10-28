import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { StatusBadge } from '@/components/domain/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import {
  Package,
  CalendarCheck,
  Receipt,
  RotateCcw,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { ShipmentStatus } from '@/types/domain';

export function AdminDashboardPage() {
  const { user, role } = useAuth();

  const previewStatuses: ShipmentStatus[] = [
    'booking_created',
    'picked_up',
    'in_transit',
    'out_for_delivery',
    'delivered',
    'delivery_attempted',
    'on_hold',
    'returned_to_sender',
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.fullName || 'Operator'}`}
        kicker="Operations Gateway"
        description={`Active Session Role: ${role?.replace('_', ' ').toUpperCase()} · Branch: Karachi Central Hub (KHI-HUB-01)`}
        actions={
          <Link to="/admin/shipments">
            <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              View Shipments
            </Button>
          </Link>
        }
      />

      {/* Operational Module Quick Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/admin/shipments" className="block">
          <Card className="hover:border-brand-500 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-ink-600">Shipments</span>
              <Package className="w-4 h-4 text-brand-600" />
            </div>
            <div className="text-xl font-bold font-mono text-ink-900">Module F0</div>
            <div className="text-[11px] text-ink-500 mt-1">Consignment tracking & dispatch</div>
          </Card>
        </Link>

        <Link to="/admin/pickups" className="block">
          <Card className="hover:border-brand-500 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-ink-600">Pickups</span>
              <CalendarCheck className="w-4 h-4 text-accent-500" />
            </div>
            <div className="text-xl font-bold font-mono text-ink-900">Module F0</div>
            <div className="text-[11px] text-ink-500 mt-1">Doorstep pickup scheduling</div>
          </Card>
        </Link>

        <Link to="/admin/finance" className="block">
          <Card className="hover:border-brand-500 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-ink-600">COD & Finance</span>
              <Receipt className="w-4 h-4 text-success" />
            </div>
            <div className="text-xl font-bold font-mono text-ink-900">PKR Currency</div>
            <div className="text-[11px] text-ink-500 mt-1">Daily reconciliation & payouts</div>
          </Card>
        </Link>

        <Link to="/admin/returns" className="block">
          <Card className="hover:border-brand-500 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-ink-600">Exceptions</span>
              <RotateCcw className="w-4 h-4 text-warning" />
            </div>
            <div className="text-xl font-bold font-mono text-ink-900">State Machine</div>
            <div className="text-[11px] text-ink-500 mt-1">Hold & Return workflows</div>
          </Card>
        </Link>
      </div>

      {/* Shipment Status State Machine Showcase */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-600" />
            <CardTitle className="text-sm">Consignment Status System (Domain Component Showcase)</CardTitle>
          </div>
          <p className="text-xs text-ink-600">
            All 17 standardized lifecycle statuses defined in <code className="font-mono text-ink-800">src/types/domain.ts</code> with RBAC state transitions.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2.5 pt-2">
            {previewStatuses.map((st) => (
              <StatusBadge key={st} status={st} size="md" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
