import React, { forwardRef, useId } from 'react';
import { cn } from '@/lib/cn';
import { validatePkPhone } from '@/lib/phone';

export interface PhoneInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  error?: string;
  hint?: string;
  value?: string;
  onChange?: (value: string, validationResult: ReturnType<typeof validatePkPhone>) => void;
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ label, error, hint, value = '', onChange, className, id, disabled, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (onChange) {
        const validation = validatePkPhone(val);
        onChange(val, validation);
      }
    };

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
        <div
          className={cn(
            'relative flex items-center rounded-md border transition-all duration-150 bg-surface shadow-2xs',
            'focus-within:ring-2 focus-within:ring-brand-500/25 focus-within:border-brand-600',
            error
              ? 'border-danger text-danger focus-within:ring-danger/25 focus-within:border-danger motion-safe:animate-[input-shake_0.3s_ease-in-out_1]'
              : 'border-ink-300 hover:border-ink-400'
          )}
        >
          {/* Pakistan country code indicator */}
          <div className="flex items-center gap-1.5 pl-3 pr-2 py-2 border-r border-ink-200 bg-surface-muted rounded-l-md select-none group-focus-within:border-brand-300 transition-colors">
            <span className="text-xs font-semibold text-ink-700">🇵🇰 +92</span>
          </div>
          <input
            ref={ref}
            id={inputId}
            type="tel"
            disabled={disabled}
            value={value}
            onChange={handleChange}
            placeholder="0300 1234567"
            aria-invalid={!!error}
            aria-describedby={error ? errorId : hint ? hintId : undefined}
            className={cn(
              'w-full min-h-[40px] px-3 py-2 text-sm text-ink-900 bg-transparent',
              'placeholder:text-ink-400 placeholder:text-sm',
              'focus:outline-none',
              'disabled:text-ink-400 disabled:cursor-not-allowed',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p id={errorId} className="mt-1 text-xs text-danger font-medium animate-fadeIn" role="alert">
            {error}
          </p>
        )}
        {!error && (hint || true) && (
          <p id={hintId} className="mt-1 text-xs text-ink-600">
            {hint || 'Format: 03XX XXXXXXX (Mobile) or 0XX XXXXXXX (Landline)'}
          </p>
        )}
      </div>
    );
  }
);

PhoneInput.displayName = 'PhoneInput';
