import React from 'react';
import {
  FilePlus,
  Calendar,
  UserCheck,
  PackageCheck,
  Building2,
  Truck,
  Warehouse,
  Navigation,
  CheckCircle2,
  ClockAlert,
  AlertOctagon,
  PauseCircle,
  CornerUpLeft,
  ArrowLeftRight,
  Archive,
  XCircle,
  ShieldAlert,
} from 'lucide-react';
import { ShipmentStatus } from '@/types/domain';
import { getPublicStatusLabel } from '@/lib/tracking';
import { t } from '@/i18n';
import { cn } from '@/lib/cn';

interface StatusConfig {
  variant:
    | 'neutral'
    | 'info'
    | 'accent'
    | 'success'
    | 'warning'
    | 'danger'
    | 'dark-neutral'
    | 'muted-danger';
  icon: React.ComponentType<{ className?: string }>;
}

const STATUS_CONFIGS: Record<ShipmentStatus, StatusConfig> = {
  // Neutral
  booking_created: { variant: 'neutral', icon: FilePlus },
  pickup_scheduled: { variant: 'neutral', icon: Calendar },
  pickup_assigned: { variant: 'neutral', icon: UserCheck },

  // Info
  picked_up: { variant: 'info', icon: PackageCheck },
  received_at_origin: { variant: 'info', icon: Building2 },
  in_transit: { variant: 'info', icon: Truck },
  received_at_destination: { variant: 'info', icon: Warehouse },

  // Accent
  out_for_delivery: { variant: 'accent', icon: Navigation },

  // Success
  delivered: { variant: 'success', icon: CheckCircle2 },

  // Warning
  delivery_attempted: { variant: 'warning', icon: ClockAlert },
  on_hold: { variant: 'warning', icon: PauseCircle },
  return_initiated: { variant: 'warning', icon: CornerUpLeft },
  returning_to_origin: { variant: 'warning', icon: ArrowLeftRight },

  // Danger
  delivery_failed: { variant: 'danger', icon: AlertOctagon },
  lost: { variant: 'danger', icon: ShieldAlert },

  // Dark Neutral
  returned_to_sender: { variant: 'dark-neutral', icon: Archive },

  // Muted Danger
  cancelled: { variant: 'muted-danger', icon: XCircle },
};

const VARIANT_STYLES: Record<StatusConfig['variant'], string> = {
  neutral: 'bg-ink-100 text-ink-700 border border-ink-200',
  info: 'bg-sky-50 text-sky-800 border border-sky-200',
  accent: 'bg-orange-50 text-orange-800 border border-orange-200 font-semibold',
  success: 'bg-green-50 text-green-800 border border-green-200 font-semibold',
  warning: 'bg-amber-50 text-amber-800 border border-amber-200',
  danger: 'bg-red-50 text-red-800 border border-red-200 font-semibold',
  'dark-neutral': 'bg-slate-700 text-white border border-slate-800',
  'muted-danger': 'bg-rose-50 text-rose-700 border border-rose-200/80 line-through opacity-85',
};

export interface StatusBadgeProps {
  status: ShipmentStatus;
  size?: 'sm' | 'md';
  className?: string;
  showIcon?: boolean;
  variant?: 'internal' | 'public';
}

export function StatusBadge({
  status,
  size = 'sm',
  className,
  showIcon = true,
  variant = 'internal',
}: StatusBadgeProps) {
  const config = STATUS_CONFIGS[status] || { variant: 'neutral', icon: FilePlus };
  const IconComponent = config.icon;
  const label = variant === 'public' ? getPublicStatusLabel(status) : t(`status.${status}`);

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  }[size];

  const isPulsing = status === 'in_transit' || status === 'out_for_delivery';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full leading-none select-none tracking-normal font-medium animate-fadeIn',
        VARIANT_STYLES[config.variant],
        sizeClasses,
        className
      )}
    >
      {isPulsing && (
        <span className="relative flex h-1.5 w-1.5 shrink-0" aria-hidden="true">
          <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current" />
        </span>
      )}
      {showIcon && !isPulsing && <IconComponent className={size === 'md' ? 'w-3.5 h-3.5' : 'w-3 h-3'} aria-hidden="true" />}
      <span>{label}</span>
    </span>
  );
}
