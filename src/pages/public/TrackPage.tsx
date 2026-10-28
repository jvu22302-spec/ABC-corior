import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { trackingService, RateLimitedError } from '@/services';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { validateTrackingNo } from '@/lib/tracking';
import { TrackingInput } from '@/components/tracking/TrackingInput';
import { TrackingResultCard } from '@/components/tracking/TrackingResultCard';
import { TrackingTimeline } from '@/components/tracking/TrackingTimeline';
import { HelpCard } from '@/components/tracking/HelpCard';
import { DevDemoTrackingBox } from '@/components/tracking/DevDemoTrackingBox';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AlertOctagon, RefreshCw, HelpCircle, Package, ArrowRight } from 'lucide-react';

export function TrackPage() {
  const { trackingNo: paramAwb } = useParams<{ trackingNo?: string }>();
  const navigate = useNavigate();

  // Input state synced with URL parameter
  const [inputValue, setInputValue] = useState(paramAwb || '');
  const [prevParam, setPrevParam] = useState(paramAwb);
  const [inlineError, setInlineError] = useState<string | null>(null);

  // Result heading ref for accessible programmatic focus after successful query
  const resultHeadingRef = useRef<HTMLHeadingElement | null>(null);

  // Adjust state during render when URL param changes (React recommended pattern)
  if (paramAwb !== prevParam) {
    setPrevParam(paramAwb);
    setInputValue(paramAwb || '');
    setInlineError(null);
  }

  const activeTrackingNo = paramAwb?.trim().toUpperCase();

  // Document Title
  useDocumentTitle(
    activeTrackingNo ? `Track ${activeTrackingNo}` : 'Track Parcel'
  );

  // Check if active URL param is syntactically valid before query execution
  const isParamValid = activeTrackingNo ? validateTrackingNo(activeTrackingNo).isValid : false;

  // TanStack Query for tracking data
  // Disabled automatic retries for not-found and rate-limited queries
  const {
    data: trackingData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['public-tracking', activeTrackingNo],
    queryFn: async () => {
      if (!activeTrackingNo) return null;
      // Client-side format/check digit validation guard
      const validation = validateTrackingNo(activeTrackingNo);
      if (!validation.isValid) {
        // Return null directly without remote service call
        return null;
      }
      return trackingService.track(activeTrackingNo);
    },
    enabled: !!activeTrackingNo && isParamValid,
    retry: false,
    staleTime: 1000 * 30, // 30 seconds
  });

  // Programmatically shift focus to results area once loaded
  useEffect(() => {
    if (trackingData && resultHeadingRef.current) {
      resultHeadingRef.current.focus();
    }
  }, [trackingData]);

  // Form submit handler with strict client-side validation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputValue.trim().toUpperCase();

    if (!clean) {
      setInlineError('Enter a valid tracking number');
      return;
    }

    const validation = validateTrackingNo(clean);
    if (!validation.isValid) {
      setInlineError('Enter a valid tracking number');
      return;
    }

    setInlineError(null);
    if (clean !== activeTrackingNo) {
      navigate(`/track/${clean}`);
    } else {
      refetch();
    }
  };

  const handleSelectDemo = (no: string) => {
    setInputValue(no);
    setInlineError(null);
    navigate(`/track/${no}`);
  };

  const isRateLimited = error instanceof RateLimitedError;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-ink-900 tracking-tight">
          Track Your Consignment
        </h1>
        <p className="text-xs sm:text-sm text-ink-600">
          Enter your Airway Bill (AWB) number to review sorting milestones and delivery progress.
        </p>
      </div>

      {/* Tracking Input */}
      <div className="max-w-2xl mx-auto">
        <TrackingInput
          value={inputValue}
          onChange={(val) => {
            setInputValue(val);
            if (inlineError) setInlineError(null);
          }}
          onSubmit={handleSubmit}
          isLoading={isLoading || isFetching}
          error={inlineError}
          autoFocus={!paramAwb}
        />
      </div>

      {/* Dev Mode Demo Consignments Box */}
      <DevDemoTrackingBox
        onSelectTrackingNo={handleSelectDemo}
        activeTrackingNo={activeTrackingNo}
      />

      {/* Main Results Region (Live Announcer for Screen Readers) */}
      <section
        aria-live="polite"
        aria-atomic="true"
        className="space-y-8"
        id="tracking-results-region"
      >
        {/* STATE 1: Idle (No search query yet) */}
        {!activeTrackingNo && (
          <Card className="text-center py-12 px-6 bg-surface-muted/60 border-dashed border-ink-300">
            <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-3 shadow-2xs">
              <Package className="w-6 h-6" aria-hidden="true" />
            </div>
            <h2 className="text-base font-bold text-ink-900 mb-1">
              Ready to Trace Your Parcel
            </h2>
            <p className="text-xs sm:text-sm text-ink-600 max-w-md mx-auto leading-relaxed">
              Consignment numbers consist of prefix <strong className="font-mono text-ink-800">ABC</strong> followed by a 2-digit year and 9 numeric digits.
            </p>
            <div className="mt-4 pt-3 border-t border-ink-200/60 inline-flex items-center gap-2 text-xs text-ink-500">
              <span>Standard format example:</span>
              <button
                type="button"
                onClick={() => handleSelectDemo('ABC26123456784')}
                className="font-mono font-semibold text-brand-600 hover:underline"
              >
                ABC26123456784
              </button>
            </div>
          </Card>
        )}

        {/* STATE 2: Loading Skeleton */}
        {activeTrackingNo && (isLoading || isFetching) && (
          <div className="space-y-6" aria-label="Loading tracking details">
            <div className="p-6 bg-surface rounded-xl border border-ink-200 space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-ink-100">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <Skeleton className="h-16 w-full rounded-xl" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>

            <div className="p-6 bg-surface rounded-xl border border-ink-200 space-y-4">
              <Skeleton className="h-6 w-36" />
              <div className="space-y-4 pl-6">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          </div>
        )}

        {/* STATE 3: Rate Limited Error */}
        {activeTrackingNo && !isLoading && !isFetching && isError && isRateLimited && (
          <Card className="p-8 text-center bg-amber-50/70 border-amber-300 space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-2xs">
              <AlertOctagon className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-ink-900">
                Too Many Tracking Attempts
              </h2>
              <p className="text-xs sm:text-sm text-ink-700 mt-1 max-w-md mx-auto leading-relaxed">
                Too many attempts. Please try again in a minute.
              </p>
            </div>
            <div className="pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => refetch()}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Retry Search
              </Button>
            </div>
          </Card>
        )}

        {/* STATE 4: Generic Network / Server Error */}
        {activeTrackingNo && !isLoading && !isFetching && isError && !isRateLimited && (
          <Card className="p-8 text-center bg-red-50/70 border-red-200 space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-danger flex items-center justify-center mx-auto shadow-2xs">
              <AlertOctagon className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-ink-900">
                Service Communication Error
              </h2>
              <p className="text-xs sm:text-sm text-ink-700 mt-1 max-w-md mx-auto leading-relaxed">
                {(error as Error)?.message || 'Unable to communicate with the tracking service. Please try again.'}
              </p>
            </div>
            <div className="pt-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => refetch()}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Retry
              </Button>
            </div>
          </Card>
        )}

        {/* STATE 5: Not Found (Neutral card identical for malformed, bad check digit, and unknown) */}
        {activeTrackingNo && !isLoading && !isFetching && !isError && !trackingData && (
          <Card className="p-8 text-center bg-surface border-ink-200 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-surface-muted border border-ink-200 text-ink-500 flex items-center justify-center mx-auto shadow-2xs">
              <HelpCircle className="w-6 h-6" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-bold text-ink-900">
                Consignment Not Found
              </h2>
              <p className="text-xs sm:text-sm text-ink-600 max-w-md mx-auto leading-relaxed">
                We couldn't find this number. Please check it and try again.
              </p>
            </div>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setInputValue('');
                  navigate('/track');
                }}
              >
                Clear Search
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSelectDemo('ABC26123456784')}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Try Sample: ABC26123456784
              </Button>
            </div>
          </Card>
        )}

        {/* STATE 6: Found & Tracking Data Available */}
        {activeTrackingNo && !isLoading && !isFetching && trackingData && (
          <div className="space-y-8 animate-fadeIn">
            {/* Hidden heading for screen readers to receive focus */}
            <h2
              ref={resultHeadingRef}
              tabIndex={-1}
              className="sr-only focus:not-sr-only focus:p-2 focus:bg-brand-50 focus:text-brand-800 focus:rounded"
            >
              Tracking Results for Consignment {trackingData.trackingNo}
            </h2>

            {/* Consignment Overview Card */}
            <TrackingResultCard tracking={trackingData} />

            {/* Milestone Timeline Card */}
            <Card>
              <TrackingTimeline events={trackingData.events} />
            </Card>

            {/* Help & Support Card */}
            <HelpCard trackingNo={trackingData.trackingNo} />
          </div>
        )}
      </section>
    </div>
  );
}
