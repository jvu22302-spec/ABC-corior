import React from 'react';
import { ImageId, IMAGES } from '@/config/images';
import { cn } from '@/lib/cn';
import {
  Truck,
  Zap,
  Banknote,
  Boxes,
  FileCheck2,
  PackageSearch,
  Route,
  CheckCircle2,
} from 'lucide-react';

export type FeatureIconKey =
  | 'service-standard'
  | 'service-express'
  | 'service-cod'
  | 'service-cargo'
  | 'step-book'
  | 'step-pickup'
  | 'step-transit'
  | 'step-delivered';

interface FeatureIconProps {
  iconKey: FeatureIconKey;
  imageId?: ImageId;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const DEFAULT_LUCIDE_ICONS: Record<FeatureIconKey, React.ComponentType<{ className?: string }>> = {
  'service-standard': Truck,
  'service-express': Zap,
  'service-cod': Banknote,
  'service-cargo': Boxes,
  'step-book': FileCheck2,
  'step-pickup': PackageSearch,
  'step-transit': Route,
  'step-delivered': CheckCircle2,
};

export function FeatureIcon({
  iconKey,
  imageId,
  className,
  size = 'md',
}: FeatureIconProps) {
  // If an image asset URL is populated in the future, render image
  if (imageId && IMAGES[imageId]?.url) {
    const meta = IMAGES[imageId];
    return (
      <img
        src={meta.url}
        alt={meta.alt}
        width={meta.width}
        height={meta.height}
        className={cn('object-contain', className)}
      />
    );
  }

  const IconComponent = DEFAULT_LUCIDE_ICONS[iconKey] || Truck;

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }[size];

  return <IconComponent className={cn(sizeClasses, className)} aria-hidden="true" />;
}
