import React, { forwardRef, useId } from 'react';
import { AlertCircle } from 'lucide-react';
import { m } from 'framer-motion';
import { cn } from '@/lib/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
  /** Show animated success checkmark tick when valid */
  success?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftAddon, rightAddon, success = false, className, id, disabled, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    return (
      <div className="w-full group">
        {label && (
          <label
            htmlFor={inputId}
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
          {leftAddon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-ink-400 group-focus-within:text-brand-600 transition-colors">
              {leftAddon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : hint ? hintId : undefined}
            className={cn(
              'w-full min-h-[40px] px-3 py-2 text-sm text-ink-900 bg-surface border rounded-md transition-all duration-150',
              'placeholder:text-ink-400 placeholder:text-sm',
              'focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-600 shadow-2xs',
              'disabled:bg-surface-muted disabled:text-ink-400 disabled:cursor-not-allowed',
              leftAddon ? 'pl-9' : '',
              rightAddon || error || success ? 'pr-9' : '',
              error
                ? 'border-danger text-danger focus:ring-danger/25 focus:border-danger motion-safe:animate-[input-shake_0.3s_ease-in-out_1]'
                : 'border-ink-300 hover:border-ink-400',
              className
            )}
            {...props}
          />
          {rightAddon && !error && !success && (
            <div className="absolute right-3 flex items-center pointer-events-none text-ink-400">
              {rightAddon}
            </div>
          )}
          {error && (
            <div className="absolute right-3 flex items-center pointer-events-none text-danger animate-fadeIn">
              <AlertCircle className="w-4 h-4" />
            </div>
          )}
          {success && !error && (
            <div className="absolute right-3 flex items-center pointer-events-none text-success">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <m.path
                  d="M20 6L9 17l-5-5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                />
              </svg>
            </div>
          )}
        </div>
        {error && (
          <p id={errorId} className="mt-1 text-xs text-danger font-medium animate-fadeIn" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={hintId} className="mt-1 text-xs text-ink-500">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
