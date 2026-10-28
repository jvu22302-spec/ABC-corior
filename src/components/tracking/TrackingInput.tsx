import React from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface TrackingInputProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading?: boolean;
  error?: string | null;
  placeholder?: string;
  autoFocus?: boolean;
}

export function TrackingInput({
  value,
  onChange,
  onSubmit,
  isLoading = false,
  error,
  placeholder = 'Enter tracking number (e.g. ABC26123456784)',
  autoFocus = false,
}: TrackingInputProps) {
  const handleClear = () => {
    onChange('');
  };

  return (
    <div className="w-full">
      <form
        onSubmit={onSubmit}
        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-surface p-1.5 sm:p-2 rounded-xl border border-ink-300 shadow-xs focus-within:ring-2 focus-within:ring-brand-600 focus-within:border-transparent transition-all"
        noValidate
      >
        <div className="relative flex-1 flex items-center">
          <Search className="w-5 h-5 text-ink-400 absolute left-3 pointer-events-none" aria-hidden="true" />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            autoFocus={autoFocus}
            aria-label="Consignment tracking number"
            aria-invalid={!!error}
            aria-describedby={error ? 'tracking-input-error' : undefined}
            className="w-full pl-10 pr-9 py-2.5 sm:py-3 text-sm sm:text-base font-mono text-ink-900 bg-transparent focus:outline-none placeholder:text-ink-400 placeholder:font-sans uppercase"
          />
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 p-1 text-ink-400 hover:text-ink-700 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
              aria-label="Clear tracking input"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isLoading}
          className="w-full sm:w-auto shrink-0 font-semibold"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              <span>Tracking...</span>
            </span>
          ) : (
            'Track'
          )}
        </Button>
      </form>

      {error && (
        <p
          id="tracking-input-error"
          role="alert"
          className="text-xs text-danger font-medium mt-2 px-2"
        >
          {error}
        </p>
      )}
    </div>
  );
}
