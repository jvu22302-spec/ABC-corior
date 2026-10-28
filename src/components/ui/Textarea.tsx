import React, { forwardRef, useId } from 'react';
import { cn } from '@/lib/cn';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, disabled, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id || generatedId;
    const errorId = `${textareaId}-error`;
    const hintId = `${textareaId}-hint`;

    return (
      <div className="w-full group">
        {label && (
          <label
            htmlFor={textareaId}
            className={cn(
              'block text-xs font-semibold mb-1 transition-colors duration-150',
              error ? 'text-danger' : 'text-ink-700 group-focus-within:text-brand-600'
            )}
          >
            {label}
            {props.required && <span className="text-danger ml-0.5">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={cn(
            'w-full min-h-[80px] px-3 py-2 text-sm text-ink-900 bg-surface border rounded-md transition-all duration-150',
            'placeholder:text-ink-400 placeholder:text-sm',
            'focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-600 shadow-2xs',
            'disabled:bg-surface-muted disabled:text-ink-400 disabled:cursor-not-allowed',
            error
              ? 'border-danger text-danger focus:ring-danger/25 focus:border-danger motion-safe:animate-[input-shake_0.3s_ease-in-out_1]'
              : 'border-ink-300 hover:border-ink-400',
            className
          )}
          {...props}
        />
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

Textarea.displayName = 'Textarea';
