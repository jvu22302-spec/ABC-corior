import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { geographyService } from '@/services';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { FeatureIcon, FeatureIconKey } from '@/components/media/FeatureIcon';
import { formatPKR } from '@/lib/format';
import { Link } from 'react-router-dom';
import { ArrowRight, Calculator, CheckCircle2, Banknote, ShieldAlert } from 'lucide-react';

export function ServicesPage() {
  useDocumentTitle('Services');

  const {
    data: services,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['services'],
    queryFn: () => geographyService.listServices(),
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-ink-900 tracking-tight">
          Courier & Cargo Transportation Modes
        </h1>
        <p className="text-xs sm:text-sm text-ink-600">
          Structured domestic parcel solutions connecting regional hubs with full tracking visibility.
        </p>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="max-w-md mx-auto">
          <ErrorState
            title="Failed to load shipping services"
            message="Unable to communicate with the service catalog."
            onRetry={() => refetch()}
          />
        </div>
      )}

      {/* Services Grid */}
      {services && !isLoading && !isError && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {services.map((service) => {
            const isExpress = service.code === 'EXP';
            const iconKey: FeatureIconKey = isExpress ? 'service-express' : 'service-standard';

            return (
              <Card
                key={service.id}
                className={`relative flex flex-col justify-between ${
                  isExpress ? 'border-brand-600 ring-1 ring-brand-600 shadow-md' : 'border-ink-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isExpress ? 'bg-brand-50 text-brand-600' : 'bg-surface-muted text-ink-600'
                      }`}
                    >
                      <FeatureIcon iconKey={iconKey} size="md" />
                    </div>
                    <div className="flex items-center gap-2">
                      {service.allowsCod && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-success-dark border border-green-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          COD Allowed
                        </span>
                      )}
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-ink-100 text-ink-700">
                        {service.estimatedDeliveryDays}
                      </span>
                    </div>
                  </div>

                  <CardTitle className="text-lg mb-2">{service.name}</CardTitle>
                  <CardDescription className="leading-relaxed mb-6">
                    {service.description}
                  </CardDescription>

                  <div className="p-4 bg-surface-muted rounded-lg border border-ink-200/80 space-y-2 text-xs mb-6">
                    <div className="flex justify-between items-center text-ink-600">
                      <span>Base tariff (up to {service.baseWeightKg} kg):</span>
                      <span className="font-bold text-ink-900 font-mono text-sm">
                        {formatPKR(service.baseRatePkr)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-ink-600">
                      <span>Additional weight rate (per kg):</span>
                      <span className="font-bold text-ink-900 font-mono text-sm">
                        {formatPKR(service.perAdditionalKgPkr)}
                      </span>
                    </div>
                    <div className="text-[10px] text-amber-800 font-medium text-right pt-1.5 border-t border-ink-200/60">
                      SAMPLE tariffs — subject to operational confirmation
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Link to="/book" className="block">
                    <Button
                      variant={isExpress ? 'primary' : 'secondary'}
                      className="w-full"
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Book with this service
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* How COD Works Informational Block (Generic, no fees) */}
      <div className="max-w-4xl mx-auto p-6 sm:p-8 bg-surface-muted border border-ink-200 rounded-xl space-y-4">
        <div className="flex items-center gap-2.5 text-ink-900">
          <div className="w-8 h-8 rounded-lg bg-green-100 text-success flex items-center justify-center">
            <Banknote className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-bold">How Cash on Delivery (COD) Operates</h2>
        </div>

        <div className="text-xs sm:text-sm text-ink-700 space-y-3 leading-relaxed">
          <p>
            Cash on Delivery enables digital retailers and individuals to send shipments without requiring upfront online customer payment. The courier collects the exact consignment value specified at booking before handing over the parcel.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-3 bg-surface rounded-lg border border-ink-200">
              <div className="font-semibold text-xs text-ink-900 mb-1">1. Doorstep Collection</div>
              <p className="text-[11px] text-ink-600">
                Courier collects specified cash amount upon delivery verification.
              </p>
            </div>
            <div className="p-3 bg-surface rounded-lg border border-ink-200">
              <div className="font-semibold text-xs text-ink-900 mb-1">2. Branch Reconciliation</div>
              <p className="text-[11px] text-ink-600">
                Collected funds are verified against barcode manifests at shift closure.
              </p>
            </div>
            <div className="p-3 bg-surface rounded-lg border border-ink-200">
              <div className="font-semibold text-xs text-ink-900 mb-1">3. Bank Remittance</div>
              <p className="text-[11px] text-ink-600">
                Audited proceeds are remitted to merchant accounts via commercial banking.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-ink-500 pt-2">
          <ShieldAlert className="w-3.5 h-3.5 text-ink-400 shrink-0" />
          <span>SAMPLE PROCEDURE — Fee percentages and settlement cycles are defined in individual merchant agreements.</span>
        </div>
      </div>

      {/* Action CTAs */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
        <Link to="/rates">
          <Button variant="secondary" leftIcon={<Calculator className="w-4 h-4" />}>
            Calculate Shipping Charges
          </Button>
        </Link>
        <Link to="/book">
          <Button variant="accent" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Book a Parcel
          </Button>
        </Link>
      </div>
    </div>
  );
}
