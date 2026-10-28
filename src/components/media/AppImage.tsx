import React, { useState } from 'react';
import { ImageId, IMAGES } from '@/config/images';
import { cn } from '@/lib/cn';
import { Package, Image as ImageIcon } from 'lucide-react';

export interface AppImageProps {
  id: ImageId;
  className?: string;
  priority?: boolean;
  aspectRatioClass?: string;
}

export function AppImage({ id, className, priority, aspectRatioClass }: AppImageProps) {
  const meta = IMAGES[id];
  const [hasError, setHasError] = useState(false);

  if (!meta) {
    return null;
  }

  const isHero = id === 'IMG-01' || priority;
  const aspectRatio = `${meta.width} / ${meta.height}`;

  // If no URL or error loading image, render neutral, accessible placeholder
  if (!meta.url || hasError) {
    return (
      <div
        className={cn(
          'relative overflow-hidden rounded-xl bg-surface-muted border border-ink-200/80 flex flex-col items-center justify-center p-6 text-center select-none shadow-2xs',
          aspectRatioClass,
          className
        )}
        style={{ aspectRatio }}
        aria-hidden="true"
      >
        {/* Subtle geometric pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(var(--color-ink-900) 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        <div className="relative z-10 flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-surface border border-ink-200 flex items-center justify-center text-ink-400 shadow-2xs">
            {id === 'IMG-15' ? (
              <Package className="w-5 h-5 text-ink-400" />
            ) : (
              <ImageIcon className="w-5 h-5 text-ink-400" />
            )}
          </div>
          <span className="text-xs font-semibold text-ink-600 tracking-tight">
            {meta.label || meta.alt}
          </span>
          <span className="text-[10px] font-mono text-ink-400">
            {meta.width} × {meta.height} px · Asset placeholder
          </span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={meta.url}
      alt={meta.alt}
      width={meta.width}
      height={meta.height}
      loading={isHero ? 'eager' : 'lazy'}
      fetchPriority={isHero ? 'high' : 'auto'}
      decoding="async"
      onError={() => setHasError(true)}
      style={{ aspectRatio }}
      className={cn('w-full h-auto object-cover rounded-xl border border-ink-200', className)}
    />
  );
}
