import React, { useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { useMotionPreference } from '@/motion/useMotionPreference';

export interface GlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}

/**
 * GlowCard
 * Interactive card with cursor-following spotlight border glow.
 * Active exclusively on fine pointer (mouse/trackpad); gracefully degraded on touch and low-power/reduced-motion.
 */
export function GlowCard({
  children,
  className,
  glowColor = 'rgba(11, 95, 255, 0.18)',
  onMouseMove,
  onMouseLeave,
  ...props
}: GlowCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const { reduced, lowPower } = useMotionPreference();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    onMouseMove?.(e);
    if (reduced || lowPower) return;
    if (typeof window !== 'undefined' && !window.matchMedia('(pointer: fine)').matches) return;

    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    onMouseLeave?.(e);
    setMousePos(null);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'relative rounded-xl border border-ink-200 bg-surface overflow-hidden transition-all duration-200',
        className
      )}
      {...props}
    >
      {/* Dynamic Cursor Spotlight Border Layer */}
      {mousePos && !reduced && !lowPower && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-px rounded-xl transition-opacity duration-300 opacity-100 -z-0"
          style={{
            background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, ${glowColor}, transparent 65%)`,
          }}
        />
      )}

      {/* Content wrapper */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
