import React, { forwardRef, useId } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options?: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options = [], placeholder, className, id, disabled, children, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id || generatedId;
    const errorId = `${selectId}-error`;
    const hintId = `${selectId}-hint`;

    return (
      <div className="w-full group">
        {label && (
          <label
            htmlFor={selectId}
            className={cn(
              'block text-xs font-semibold mb-1 transition-colors duration-150',
              error ? 'text-danger' : 'text-ink-700 group-focus-within:text-brand-600'
            )}
          >
            {label}
            {props.required && <span className="text-danger ml-0.5">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : hint ? hintId : undefined}
            className={cn(
              'w-full min-h-[40px] appearance-none pl-3 pr-9 py-2 text-sm text-ink-900 bg-surface border rounded-md transition-all duration-150',
              'focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-600 shadow-2xs',
              'disabled:bg-surface-muted disabled:text-ink-400 disabled:cursor-not-allowed cursor-pointer',
              error
                ? 'border-danger text-danger focus:ring-danger/25 focus:border-danger motion-safe:animate-[input-shake_0.3s_ease-in-out_1]'
                : 'border-ink-300 hover:border-ink-400',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
            {children}
          </select>
          <ChevronDown className="absolute right-3 w-4 h-4 text-ink-400 pointer-events-none group-focus-within:text-brand-600 transition-colors" />
        </div>
        {error && (
          <p id={errorId} className="mt-1 text-xs text-danger font-medium animate-fadeIn" role="alert">
            {error}
          </p>
        )}
        {!error && hint && (
          <p id={hintId} className="mt-1 text-xs text-ink-600">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
