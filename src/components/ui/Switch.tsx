import React, { forwardRef, useId } from 'react';
import { m } from 'framer-motion';
import { cn } from '@/lib/cn';
import { SPRING } from '@/motion/tokens';
import { useMotionPreference } from '@/motion/useMotionPreference';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, description, checked, disabled, className, id, onChange, ...props }, ref) => {
    const generatedId = useId();
    const switchId = id || generatedId;
    const { reduced } = useMotionPreference();

    return (
      <div className="flex items-center justify-between gap-3">
        {(label || description) && (
          <div className="flex-1 min-w-0">
            {label && (
              <label
                htmlFor={switchId}
                className={cn('text-sm font-medium text-ink-900 cursor-pointer', disabled && 'opacity-50 cursor-not-allowed')}
              >
                {label}
              </label>
            )}
            {description && <p className="text-xs text-ink-600">{description}</p>}
          </div>
        )}
        <label htmlFor={switchId} className="relative inline-flex items-center cursor-pointer select-none">
          <input
            ref={ref}
            type="checkbox"
            id={switchId}
            checked={checked}
            disabled={disabled}
            onChange={onChange}
            className="sr-only peer"
            {...props}
          />
          <div
            className={cn(
              'w-9 h-5 rounded-full transition-colors duration-200 p-[2px] flex items-center',
              'peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-brand-600 peer-focus-visible:ring-offset-1',
              checked ? 'bg-brand-600' : 'bg-ink-300',
              disabled && 'opacity-50 cursor-not-allowed',
              className
            )}
          >
            {reduced ? (
              <span
                className={cn(
                  'h-4 w-4 rounded-full bg-white shadow-xs',
                  checked ? 'translate-x-4' : 'translate-x-0'
                )}
              />
            ) : (
              <m.span
                layout
                transition={SPRING.snappy}
                className={cn(
                  'h-4 w-4 rounded-full bg-white shadow-xs',
                  checked ? 'translate-x-4' : 'translate-x-0'
                )}
              />
            )}
          </div>
        </label>
      </div>
    );
  }
);

Switch.displayName = 'Switch';
