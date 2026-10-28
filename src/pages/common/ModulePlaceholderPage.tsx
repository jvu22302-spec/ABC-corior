import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export interface ModulePlaceholderPageProps {
  title: string;
  moduleName: string;
  phase?: string;
  description?: string;
}

export function ModulePlaceholderPage({
  title,
  moduleName,
  phase = 'Phase F1 - F4',
  description = 'This operational module is scheduled for implementation in upcoming system phases.',
}: ModulePlaceholderPageProps) {
  return (
    <div>
      <PageHeader
        title={title}
        kicker="Core Logistics Module"
        description={`Operational view for ${moduleName}. Currently in Foundation Phase (F0).`}
      />

      <Card className="max-w-3xl">
        <CardHeader>
          <div className="flex items-center gap-2 text-brand-600 mb-1">
            <Clock className="w-5 h-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Coming in a later phase ({phase})
            </span>
          </div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="p-4 bg-surface-muted rounded-lg border border-ink-200 text-xs text-ink-600 space-y-2">
            <div className="font-semibold text-ink-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-success" />
              <span>Architecture & Security Verified</span>
            </div>
            <p>
              Navigation routes, permission guards, state transitions, and service contracts for{' '}
              <strong className="text-ink-900">{moduleName}</strong> are active and enforced.
              Full database persistence, live querying, and data tables will unlock in subsequent phases.
            </p>
          </div>

          <div className="pt-2">
            <Link to="/admin">
              <Button variant="secondary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Return to Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
