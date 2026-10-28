import React from 'react';
import { usePublicContent } from '@/hooks/usePublicContent';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { ShieldAlert, FileText } from 'lucide-react';

export function TermsPage() {
  useDocumentTitle('Terms of Service');
  const { data: content, isLoading } = usePublicContent();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-ink-900 tracking-tight">
          Terms of Service
        </h1>
        <p className="text-xs text-ink-500 font-mono">
          Last Updated: {content?.lastUpdated || '16 October 2026'}
        </p>
      </div>

      {/* Prominent Banner */}
      <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-xl text-xs text-amber-950 flex items-start gap-3 shadow-2xs">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-sm">
            SAMPLE TEXT — replace with ABC's approved legal text before launch
          </div>
          <p className="text-amber-800 leading-relaxed">
            All clauses below represent placeholder legal provisions and sample carriage terms. Actual liability limits, refund conditions, claims procedures, and tariffs must be ratified by ABC legal counsel.
          </p>
        </div>
      </div>

      {/* Terms Sections */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : (
        <div className="space-y-6">
          {content?.termsSections.map((sec) => (
            <Card key={sec.id} className="p-6 border-ink-200">
              <h2 className="text-base font-bold text-ink-900 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-600" />
                <span>{sec.heading}</span>
              </h2>
              <p className="text-xs sm:text-sm text-ink-700 leading-relaxed">{sec.body}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
