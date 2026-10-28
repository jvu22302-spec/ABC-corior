import React, { forwardRef, useRef, useState, useImperativeHandle } from 'react';
import { cn } from '@/lib/cn';
import { Spinner } from './Spinner';
import { useMotionPreference } from '@/motion/useMotionPreference';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  /** Optional magnetic attraction toward cursor for hero primary CTAs (desktop fine pointer only) */
  magnetic?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      type = 'button',
      magnetic = false,
      onMouseMove,
      onMouseLeave,
      style,
      ...props
    },
    forwardedRef
  ) => {
    const internalRef = useRef<HTMLButtonElement | null>(null);
    useImperativeHandle(forwardedRef, () => internalRef.current as HTMLButtonElement);

    const { reduced, lowPower } = useMotionPreference();
    const [magneticOffset, setMagneticOffset] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
      onMouseMove?.(e);
      if (!magnetic || reduced || lowPower) return;
      if (typeof window !== 'undefined' && !window.matchMedia('(pointer: fine)').matches) return;

      const btn = internalRef.current;
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = (e.clientX - centerX) * 0.15;
      const deltaY = (e.clientY - centerY) * 0.15;
      const max = 6;
      setMagneticOffset({
        x: Math.max(-max, Math.min(max, deltaX)),
        y: Math.max(-max, Math.min(max, deltaY)),
      });
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
      onMouseLeave?.(e);
      if (magneticOffset.x !== 0 || magneticOffset.y !== 0) {
        setMagneticOffset({ x: 0, y: 0 });
      }
    };

    const baseStyles =
      'group relative inline-flex items-center justify-center font-medium rounded-md select-none transition-all duration-150 ' +
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' +
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none disabled:active:scale-100 disabled:hover:shadow-none';

    const sizeStyles = {
      sm: 'text-xs px-3 py-1.5 min-h-[36px] gap-1.5',
      md: 'text-sm px-4 py-2 min-h-[40px] gap-2',
      lg: 'text-base px-5 py-2.5 min-h-[44px] gap-2.5',
    }[size];

    const variantStyles = {
      primary:
        'bg-brand-600 text-white overflow-hidden shadow-xs ' +
        'hover:bg-brand-700 hover:shadow-[0_4px_16px_rgba(11,95,255,0.28)] ' +
        'active:scale-[0.97] active:bg-brand-800 ' +
        'focus-visible:ring-brand-600 focus-visible:ring-offset-2',
      secondary:
        'bg-surface text-ink-700 border border-ink-300 shadow-xs ' +
        'bg-gradient-to-r from-ink-100/80 to-ink-100/80 bg-[length:0%_100%] bg-no-repeat hover:bg-[length:100%_100%] ' +
        'hover:border-ink-400 hover:text-ink-900 ' +
        'active:scale-[0.97] active:bg-ink-200 ' +
        'focus-visible:ring-brand-600 focus-visible:ring-offset-2 transition-[background-size,border-color,color,transform,box-shadow]',
      accent:
        'relative z-0 bg-accent-500 text-white font-semibold shadow-xs overflow-hidden ' +
        'hover:bg-accent-600 hover:shadow-[0_4px_16px_rgba(255,122,0,0.35)] ' +
        'active:scale-[0.97] active:bg-accent-700 ' +
        'focus-visible:ring-accent-500 focus-visible:ring-offset-2 ' +
        (reduced || lowPower ? '' : 'motion-safe:animate-accent-pulse hover:animate-none focus-visible:animate-none'),
      ghost:
        'bg-transparent text-ink-600 ' +
        'hover:bg-ink-100/70 hover:text-ink-900 ' +
        'active:scale-[0.97] active:bg-ink-200 ' +
        'focus-visible:ring-brand-600 focus-visible:ring-offset-2 ' +
        'after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-[1.5px] after:bg-current after:transition-all after:duration-200 ' +
        'hover:after:w-3/4 focus-visible:after:w-3/4',
      danger:
        'bg-danger text-white shadow-xs ' +
        'hover:bg-danger-dark hover:shadow-[0_0_14px_rgba(220,38,38,0.4)] ' +
        'active:scale-[0.97] active:bg-red-800 ' +
        'focus-visible:ring-danger focus-visible:ring-offset-2 transition-[box-shadow,background-color,transform]',
    }[variant];

    const magneticTransform =
      magneticOffset.x || magneticOffset.y
        ? `translate3d(${magneticOffset.x}px, ${magneticOffset.y}px, 0)`
        : undefined;

    return (
      <button
        ref={internalRef}
        type={type}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: magneticTransform,
          ...style,
        }}
        className={cn(baseStyles, sizeStyles, variantStyles, className)}
        {...props}
      >
        {/* Accent variant animated traveling gradient border */}
        {variant === 'accent' && !disabled && !isLoading && !reduced && !lowPower && (
          <span
            aria-hidden="true"
            className="absolute -inset-[1.5px] rounded-[8px] pointer-events-none overflow-hidden -z-10 opacity-75"
          >
            <span className="absolute -inset-[150%] bg-[conic-gradient(from_0deg,#ff7a00,#ffedd5,#ea6c00,#ff7a00)] animate-border-spin" />
          </span>
        )}

        {/* Primary variant diagonal sheen sweep on hover / focus */}
        {variant === 'primary' && !disabled && !isLoading && !reduced && (
          <span
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none overflow-hidden rounded-md"
          >
            <span className="absolute -inset-full top-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-20 transition-transform duration-700 ease-out group-hover:translate-x-[500%] group-focus-visible:translate-x-[500%]" />
          </span>
        )}

        {/* Content container with stable layout during loading */}
        {isLoading ? (
          <>
            <Spinner size={size === 'lg' ? 'md' : 'sm'} className="shrink-0" />
            <span>{children}</span>
            {/* Moving bottom edge progress shimmer */}
            <span
              aria-hidden="true"
              className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/30 overflow-hidden"
            >
              <span className="block h-full w-full bg-white/80 animate-shimmer" />
            </span>
          </>
        ) : (
          <>
            {leftIcon && (
              <span className="shrink-0 inline-flex transition-transform duration-150 group-hover:scale-105" aria-hidden="true">
                {leftIcon}
              </span>
            )}
            <span>{children}</span>
            {rightIcon && (
              <span className="shrink-0 inline-flex transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true">
                {rightIcon}
              </span>
            )}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
