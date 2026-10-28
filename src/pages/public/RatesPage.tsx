import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { geographyService, rateService, RateNotFoundError } from '@/services';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { formatPKR } from '@/lib/format';
import { buildBreakdownRows, formToQuoteInput, calculateVolumetricWeight } from '@/lib/rateEngine';
import { serializeRatesToSearchParams } from '@/lib/bookingCarryOver';
import { ArrowRight, Calculator, AlertOctagon, RefreshCw, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function RatesPage() {
  useDocumentTitle('Shipping Rates — ABC');

  const resultHeadingRef = useRef<HTMLHeadingElement | null>(null);

  // Geography & Services
  const { data: cities } = useQuery({
    queryKey: ['cities'],
    queryFn: () => geographyService.listCities(),
  });

  const { data: services } = useQuery({
    queryKey: ['services'],
    queryFn: () => geographyService.listServices(),
  });

  // Form State
  const [originCityId, setOriginCityId] = useState('city-khi');
  const [destinationCityId, setDestinationCityId] = useState('city-lhe');
  const [destinationZoneId, setDestinationZoneId] = useState('');
  const [serviceId, setServiceId] = useState('srv-std');
  const [weightKg, setWeightKg] = useState<number | string>(1);
  const [isCod, setIsCod] = useState(false);
  const [codAmount, setCodAmount] = useState<number | string>('');

  // Dimensions (Optional)
  const [showDimensions, setShowDimensions] = useState(false);
  const [lengthCm, setLengthCm] = useState<number | string>('');
  const [widthCm, setWidthCm] = useState<number | string>('');
  const [heightCm, setHeightCm] = useState<number | string>('');

  // Track if form was edited since last successful quote
  const [isOutdated, setIsOutdated] = useState(false);

  // Destination zones filtered by destination city
  const { data: destinationZones } = useQuery({
    queryKey: ['zones', destinationCityId],
    queryFn: () => geographyService.listZones(destinationCityId),
    enabled: !!destinationCityId,
  });

  const selectedService = services?.find((s) => s.id === serviceId);
  const codAllowed = selectedService?.allowsCod ?? true;

  // Effective destination zone: ensure it belongs to the loaded destination zones
  const effectiveDestinationZoneId =
    destinationZones && destinationZones.some((z) => z.id === destinationZoneId)
      ? destinationZoneId
      : '';

  // Mark outdated on any field edit
  const markEdited = () => {
    setIsOutdated(true);
  };

  // Convert form state to QuoteInput
  const quoteInput = formToQuoteInput(
    {
      originCityId,
      destinationCityId,
      destinationZoneId: effectiveDestinationZoneId,
      serviceId,
      weightKg,
      lengthCm,
      widthCm,
      heightCm,
      isCod: codAllowed ? isCod : false,
      codAmountPkr: codAllowed ? codAmount : undefined,
    },
    destinationZones
  );

  const {
    data: quote,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['rateQuote', quoteInput],
    queryFn: async () => {
      const res = await rateService.getQuote(quoteInput);
      setIsOutdated(false);
      return res;
    },
    enabled: !!originCityId && !!destinationCityId && !!serviceId && Number(weightKg) > 0,
    retry: false,
  });

  // Focus moves to result heading after lookup
  useEffect(() => {
    if (quote && resultHeadingRef.current) {
      resultHeadingRef.current.focus();
    }
  }, [quote]);

  // Volumetric weight computation for hint
  const volumetricWeight = calculateVolumetricWeight(
    Number(lengthCm),
    Number(widthCm),
    Number(heightCm)
  );

  const isRateNotFound = error instanceof RateNotFoundError;

  // Build breakdown rows using pure helper (zero rows hidden except Base, tax only if > 0)
  const breakdownRows = quote ? buildBreakdownRows(quote) : [];

  // Carry-over search params for /book
  const carryOverParams = serializeRatesToSearchParams({
    originCityId,
    destinationCityId,
    destinationZoneId: effectiveDestinationZoneId || undefined,
    serviceId,
    weightKg: Number(weightKg) || 1,
    lengthCm: Number(lengthCm) || undefined,
    widthCm: Number(widthCm) || undefined,
    heightCm: Number(heightCm) || undefined,
    isCod: codAllowed ? isCod : false,
    codAmountPkr: codAllowed && isCod ? Number(codAmount) : undefined,
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-10">
        <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-3">
          <Calculator className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-ink-900 tracking-tight">
          Shipping Rate Calculator
        </h1>
        <p className="text-xs sm:text-sm text-ink-600 mt-1">
          Calculate instant tariff quotes based on routes, dimensions, and Cash on Delivery
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Inputs */}
        <div className="lg:col-span-7">
          <Card>
            <CardHeader>
              <CardTitle>Shipment Parameters</CardTitle>
              <CardDescription>Specify routing cities, delivery sector, and package weight</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Origin & Destination Cities */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Origin City"
                  value={originCityId}
                  onChange={(e) => {
                    setOriginCityId(e.target.value);
                    markEdited();
                  }}
                  options={cities?.map((c) => ({ value: c.id, label: `${c.name} (${c.code})` }))}
                />

                <Select
                  label="Destination City"
                  value={destinationCityId}
                  onChange={(e) => {
                    setDestinationCityId(e.target.value);
                    markEdited();
                  }}
                  options={cities?.map((c) => ({ value: c.id, label: `${c.name} (${c.code})` }))}
                />
              </div>

              {/* Destination Area / Zone (Optional, filtered by destination city) */}
              <Select
                label="Destination Delivery Area (Optional)"
                value={effectiveDestinationZoneId}
                onChange={(e) => {
                  setDestinationZoneId(e.target.value);
                  markEdited();
                }}
                options={[
                  { value: '', label: 'All Metro Sectors (Standard Area)' },
                  ...(destinationZones?.map((z) => ({
                    value: z.id,
                    label: `${z.name}${z.isRemote ? ' (Remote Surcharge Area)' : ''}`,
                  })) || []),
                ]}
                hint="Selecting a remote sector applies standard remote transit handling"
              />

              {/* Service & Weight */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Service Mode"
                  value={serviceId}
                  onChange={(e) => {
                    setServiceId(e.target.value);
                    markEdited();
                  }}
                  options={services?.map((s) => ({
                    value: s.id,
                    label: s.allowsCod ? s.name : `${s.name} (No COD)`,
                  }))}
                />

                <Input
                  label="Actual Weight (KG)"
                  type="number"
                  min="0.1"
                  max="70"
                  step="0.5"
                  value={weightKg}
                  onChange={(e) => {
                    setWeightKg(e.target.value);
                    markEdited();
                  }}
                  hint="Up to 70 kg domestic parcel limit"
                />
              </div>

              {/* Dimensions Section (Collapsible) */}
              <div className="border border-ink-200/80 rounded-lg p-3 bg-surface-muted/40">
                <button
                  type="button"
                  onClick={() => setShowDimensions(!showDimensions)}
                  className="flex items-center justify-between w-full text-xs font-semibold text-ink-800 hover:text-brand-600 focus:outline-none"
                  aria-expanded={showDimensions}
                >
                  <span>Parcel Dimensions (Optional)</span>
                  {showDimensions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showDimensions && (
                  <div className="mt-3 space-y-3 pt-2 border-t border-ink-200/60">
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        label="Length (cm)"
                        type="number"
                        min="1"
                        placeholder="L"
                        value={lengthCm}
                        onChange={(e) => {
                          setLengthCm(e.target.value);
                          markEdited();
                        }}
                      />
                      <Input
                        label="Width (cm)"
                        type="number"
                        min="1"
                        placeholder="W"
                        value={widthCm}
                        onChange={(e) => {
                          setWidthCm(e.target.value);
                          markEdited();
                        }}
                      />
                      <Input
                        label="Height (cm)"
                        type="number"
                        min="1"
                        placeholder="H"
                        value={heightCm}
                        onChange={(e) => {
                          setHeightCm(e.target.value);
                          markEdited();
                        }}
                      />
                    </div>
                    {volumetricWeight > 0 && (
                      <div className="text-[11px] text-ink-600 bg-surface p-2 rounded border border-ink-200">
                        Volumetric weight: <strong className="font-mono text-ink-900">{volumetricWeight} kg</strong>{' '}
                        (using domestic divisor 5,000). Chargeable weight will be the greater of actual and volumetric weight.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Cash on Delivery (COD) Options */}
              <div className="pt-2 border-t border-ink-100">
                {!codAllowed ? (
                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-800">
                    COD is not available for this service mode. Select Standard Delivery for Cash on Delivery.
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Checkbox
                      label="Cash on Delivery (COD) Shipment"
                      checked={isCod}
                      onChange={(e) => {
                        setIsCod(e.target.checked);
                        markEdited();
                      }}
                      description="Collect payment from consignee upon parcel handover"
                    />

                    {isCod && (
                      <Input
                        label="Cash on Delivery (COD) Amount (PKR)"
                        type="number"
                        min="1"
                        step="100"
                        value={codAmount}
                        placeholder="e.g. 2500"
                        onChange={(e) => {
                          setCodAmount(e.target.value);
                          markEdited();
                        }}
                        hint="COD collection handling fee is 1.5% (minimum PKR 50)"
                      />
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Estimated Rate Card & Result Region */}
        <div className="lg:col-span-5" aria-live="polite" aria-atomic="true">
          <Card className="bg-surface border-ink-200 shadow-sm relative">
            <CardHeader className="pb-3 border-b border-ink-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">
                  Estimated Tariff
                </span>
                {quote?.isSample && (
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded-full shadow-2xs">
                    SAMPLE rates — not final
                  </span>
                )}
              </div>

              {isOutdated && quote && (
                <div className="mt-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block font-medium">
                  Inputs changed — updating quote...
                </div>
              )}

              <h2
                ref={resultHeadingRef}
                tabIndex={-1}
                className="text-2xl sm:text-3xl font-bold font-mono text-ink-900 mt-2 focus:outline-none"
              >
                {isLoading ? (
                  <span className="animate-pulse text-ink-400">Calculating...</span>
                ) : quote ? (
                  formatPKR(quote.totalPkr)
                ) : (
                  '—'
                )}
              </h2>

              {quote && (
                <div className="text-xs text-ink-500 mt-1">
                  Estimated Transit: <span className="font-semibold text-ink-800">{quote.estimatedDays}</span>
                  {quote.volumetricWeightKg && (
                    <span className="block text-[11px] text-ink-400 mt-0.5">
                      Chargeable weight: {quote.chargeableWeightKg} kg
                    </span>
                  )}
                </div>
              )}
            </CardHeader>

            <CardContent className="pt-4 space-y-3 text-xs">
              {/* Rate Not Found Card */}
              {isRateNotFound && (
                <div className="p-4 bg-surface-muted border border-ink-200 rounded-lg text-center space-y-2">
                  <HelpCircle className="w-6 h-6 text-ink-400 mx-auto" />
                  <p className="text-xs font-medium text-ink-800">
                    We can't price this route online — contact us.
                  </p>
                  <Link to="/contact">
                    <Button variant="secondary" size="sm" className="mt-1">
                      Contact Sales & Support
                    </Button>
                  </Link>
                </div>
              )}

              {/* Generic Network Error */}
              {isError && !isRateNotFound && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center space-y-2">
                  <AlertOctagon className="w-6 h-6 text-danger mx-auto" />
                  <p className="text-xs font-medium text-danger">
                    {(error as Error)?.message || 'Failed to retrieve rate quote.'}
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => refetch()}
                    leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                  >
                    Retry
                  </Button>
                </div>
              )}

              {/* Breakdown Rows (Zero rows hidden except Base; tax row only if > 0) */}
              {quote && !isError && (
                <div className="space-y-2">
                  {breakdownRows.map((row) => (
                    <div key={row.key} className="flex justify-between py-1 text-ink-600">
                      <span>{row.label}:</span>
                      <span className="font-mono text-ink-900">{formatPKR(row.amountPkr)}</span>
                    </div>
                  ))}

                  <div className="pt-3 border-t border-ink-200 flex justify-between font-bold text-sm text-ink-900">
                    <span>Total Net Charge:</span>
                    <span className="font-mono text-brand-600">{formatPKR(quote.totalPkr)}</span>
                  </div>

                  {/* Exact Disclaimer */}
                  <div className="pt-2 text-[11px] text-ink-500 leading-normal border-t border-ink-100">
                    Estimated. Final charge may change after weighing/verification.
                  </div>

                  {/* Book This Shipment Button carrying carryOverParams */}
                  <div className="pt-4">
                    <Link
                      to={{
                        pathname: '/book',
                        search: `?${carryOverParams.toString()}`,
                      }}
                      className="block"
                    >
                      <Button
                        variant="accent"
                        className="w-full"
                        rightIcon={<ArrowRight className="w-4 h-4" />}
                      >
                        Book This Shipment
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
