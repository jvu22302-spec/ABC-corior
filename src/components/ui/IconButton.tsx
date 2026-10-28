import React, { forwardRef } from 'react';
import { cn } from '@/lib/cn';
import { Spinner } from './Spinner';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  /** Allow decorative rotation (6deg) on hover. Do NOT use for directional arrows/back buttons */
  rotateOnHover?: boolean;
  'aria-label': string; // Accessible label is required
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      children,
      className,
      variant = 'ghost',
      size = 'md',
      isLoading = false,
      rotateOnHover = false,
      disabled,
      type = 'button',
      'aria-label': ariaLabel,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center rounded-md select-none transition-all duration-150 ' +
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 ' +
      'hover:scale-[1.08] active:scale-[0.96] ' +
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:active:scale-100';

    const sizeStyles = {
      sm: 'w-8 h-8 text-xs',
      md: 'w-10 h-10 text-sm',
      lg: 'w-11 h-11 text-base',
    }[size];

    const variantStyles = {
      primary: 'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-xs hover:shadow-sm',
      secondary: 'bg-surface text-ink-700 border border-ink-300 hover:bg-surface-muted active:bg-ink-100 shadow-xs',
      ghost: 'bg-transparent text-ink-600 hover:bg-ink-100 hover:text-ink-900 active:bg-ink-200',
      danger: 'bg-transparent text-danger hover:bg-danger-bg hover:text-danger-dark active:bg-red-100',
    }[variant];

    const rotationStyle = rotateOnHover ? 'hover:rotate-6 motion-reduce:hover:rotate-0' : '';

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        aria-label={ariaLabel}
        aria-busy={isLoading}
        className={cn(baseStyles, sizeStyles, variantStyles, rotationStyle, className)}
        {...props}
      >
        {isLoading ? <Spinner size={size === 'lg' ? 'md' : 'sm'} /> : children}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';
