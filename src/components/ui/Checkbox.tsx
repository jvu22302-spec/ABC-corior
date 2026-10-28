import React, { forwardRef, useId } from 'react';
import { m } from 'framer-motion';
import { cn } from '@/lib/cn';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, className, id, checked, disabled, ...props }, ref) => {
    const generatedId = useId();
    const checkboxId = id || generatedId;

    return (
      <div className="flex items-start gap-2.5">
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            checked={checked}
            disabled={disabled}
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              'w-4 h-4 rounded border flex items-center justify-center transition-colors duration-150 cursor-pointer overflow-hidden',
              'border-ink-300 bg-surface peer-checked:bg-brand-600 peer-checked:border-brand-600',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-brand-600 peer-focus-visible:ring-offset-1',
              'peer-disabled:opacity-50 peer-disabled:cursor-not-allowed',
              className
            )}
          >
            <svg
              className="w-2.5 h-2.5 text-white pointer-events-none stroke-current"
              viewBox="0 0 14 14"
              fill="none"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <m.path
                d="M2.5 7.5L5.5 10.5L11.5 3.5"
                initial={false}
                animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              />
            </svg>
          </div>
        </div>
        {(label || description) && (
          <div className="text-sm select-none">
            {label && (
              <label
                htmlFor={checkboxId}
                className={cn('font-medium text-ink-900 cursor-pointer', disabled && 'opacity-50 cursor-not-allowed')}
              >
                {label}
              </label>
            )}
            {description && <p className="text-xs text-ink-600 mt-0.5">{description}</p>}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
