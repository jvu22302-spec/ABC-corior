import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { geographyService } from '@/services';
import { useSettings } from '@/hooks/useSettings';
import { usePublicContent } from '@/hooks/usePublicContent';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { AppImage } from '@/components/media/AppImage';
import { FeatureIcon, FeatureIconKey } from '@/components/media/FeatureIcon';
import { validateTrackingNo } from '@/lib/tracking';
import { formatPKR } from '@/lib/format';
import {
  Search,
  ArrowRight,
  Calculator,
  MapPin,
  Phone,
  Mail,
  Zap,
} from 'lucide-react';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { GridBackground } from '@/components/ui/GridBackground';
import { GlowCard } from '@/components/ui/GlowCard';
import { CountUp } from '@/motion/CountUp';

export function HomePage() {
  useDocumentTitle('Home');

  const navigate = useNavigate();
  const { data: settings } = useSettings();
  const { data: content } = usePublicContent();

  const {
    data: services,
    isLoading: servicesLoading,
    isError: servicesError,
    refetch: refetchServices,
  } = useQuery({
    queryKey: ['services'],
    queryFn: () => geographyService.listServices(),
  });

  const { data: cities } = useQuery({
    queryKey: ['cities'],
    queryFn: () => geographyService.listCities(),
  });

  const [trackingInput, setTrackingInput] = useState('');
  const [trackingError, setTrackingError] = useState<string | null>(null);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = trackingInput.trim().toUpperCase();
    if (!clean) {
      setTrackingError('Enter a valid tracking number');
      return;
    }

    const validation = validateTrackingNo(clean);
    if (!validation.isValid) {
      setTrackingError('Enter a valid tracking number');
      return;
    }

    setTrackingError(null);
    navigate(`/track/${clean}`);
  };

  const previewCities = (cities || []).slice(0, 6);

  return (
    <div className="space-y-16">
      {/* Hero Section with Aurora & Grid Backgrounds */}
      <section className="relative overflow-hidden bg-surface border-b border-ink-200/80 pt-10 pb-14 sm:py-16 lg:py-20">
        <AuroraBackground />
        <GridBackground />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Headlines, Big Tracking Box & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-50 border border-brand-100 rounded-full text-brand-700 text-xs font-semibold uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5" />
                <span>Courier Management & Tracking</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold text-ink-900 tracking-tight leading-[1.15]">
                Reliable parcel logistics & real-time consignment tracking
              </h1>

              <p className="text-sm sm:text-base text-ink-600 max-w-xl leading-relaxed">
                Connect your business or personal deliveries across major sorting hubs in Pakistan with barcoded dispatch, doorstep collections, and secure Cash on Delivery reconciliation.
              </p>

              {/* Big Tracking Input wrapped in GlowCard */}
              <div className="pt-2">
                <GlowCard className="p-1 rounded-xl shadow-xs border-ink-300">
                  <form
                    onSubmit={handleTrackSubmit}
                    className="flex flex-col sm:flex-row items-stretch gap-2 bg-surface p-1.5 rounded-lg focus-within:ring-2 focus-within:ring-brand-600 focus-within:border-transparent"
                  >
                    <div className="relative flex-1 flex items-center">
                      <Search className="w-5 h-5 text-ink-400 absolute left-3 pointer-events-none" />
                      <input
                        type="text"
                        value={trackingInput}
                        onChange={(e) => {
                          setTrackingInput(e.target.value);
                          if (trackingError) setTrackingError(null);
                        }}
                        placeholder="Enter 14-character tracking number (e.g. ABC26123456784)"
                        className="w-full pl-10 pr-4 py-3 text-sm text-ink-900 bg-transparent focus:outline-none placeholder:text-ink-400"
                        aria-label="Tracking Number"
                      />
                    </div>
                    <Button type="submit" variant="primary" size="lg" magnetic className="sm:w-auto w-full">
                      Track
                    </Button>
                  </form>
                </GlowCard>

                {trackingError && (
                  <p className="text-xs text-danger font-medium mt-1.5 px-2" role="alert">
                    {trackingError}
                  </p>
                )}

                <div className="mt-2 text-xs text-ink-500 px-2 flex items-center justify-between">
                  <span>Standard format: ABC + Year + 8 digits + Check digit</span>
                  <button
                    type="button"
                    onClick={() => setTrackingInput('ABC26123456784')}
                    className="text-brand-600 hover:underline font-mono text-[11px]"
                  >
                    Sample AWB: ABC26123456784
                  </button>
                </div>
              </div>

              {/* CTAs with Magnetic on Book a Parcel */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link to="/book">
                  <Button variant="accent" size="lg" magnetic rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Book a Parcel
                  </Button>
                </Link>
                <Link to="/rates">
                  <Button variant="secondary" size="lg">
                    Calculate Rates
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Column: Hero Visual AppImage IMG-01 */}
            <div className="lg:col-span-5 order-last">
              <AppImage
                id="IMG-01"
                priority
                className="w-full shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Strip with CountUp */}
      {settings?.stats && settings.stats.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative p-6 bg-surface border border-ink-200 rounded-xl grid grid-cols-2 md:grid-cols-4 gap-6 text-center shadow-2xs">
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
              <span className="text-[9px] uppercase font-bold text-amber-800 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded shadow-2xs tracking-wider">
                SAMPLE STATS
              </span>
            </div>
            {settings.stats.map((stat, idx) => {
              const match = stat.value.match(/^(\d+(\.\d+)?)(.*)$/);
              return (
                <div key={idx} className="space-y-1">
                  <div className="text-2xl sm:text-3xl font-extrabold text-ink-900 font-mono tracking-tight tabular-nums">
                    {match ? (
                      <CountUp
                        value={parseFloat(match[1])}
                        suffix={match[3]}
                        decimals={match[1].includes('.') ? 1 : 0}
                      />
                    ) : (
                      stat.value
                    )}
                  </div>
                  <div className="text-xs text-ink-600 font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Services Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-ink-900 tracking-tight">
            Courier & Shipping Services
          </h2>
          <p className="text-xs sm:text-sm text-ink-600 mt-1">
            Structured domestic transportation modes designed for retail senders and e-commerce merchants.
          </p>
        </div>

        {servicesLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        )}

        {servicesError && (
          <div className="max-w-md mx-auto">
            <ErrorState
              title="Unable to load services"
              message="Failed to retrieve courier tariffs from the gateway."
              onRetry={() => refetchServices()}
            />
          </div>
        )}

        {services && !servicesLoading && !servicesError && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {services.map((service) => {
              const iconKey: FeatureIconKey =
                service.code === 'EXP' ? 'service-express' : 'service-standard';

              return (
                <Card key={service.id} className="flex flex-col justify-between hover:border-brand-500 transition-colors">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                        <FeatureIcon iconKey={iconKey} size="md" />
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-ink-100 text-ink-700">
                        {service.estimatedDeliveryDays}
                      </span>
                    </div>

                    <CardTitle className="text-base mb-1">{service.name}</CardTitle>
                    <CardDescription className="leading-relaxed mb-4">
                      {service.description}
                    </CardDescription>

                    <div className="p-3 bg-surface-muted rounded-lg text-xs space-y-1 mb-4">
                      <div className="flex justify-between">
                        <span className="text-ink-600">Base weight ({service.baseWeightKg} kg):</span>
                        <span className="font-mono font-bold text-ink-900">
                          {formatPKR(service.baseRatePkr)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ink-600">Additional kg rate:</span>
                        <span className="font-mono font-bold text-ink-900">
                          {formatPKR(service.perAdditionalKgPkr)}
                        </span>
                      </div>
                      <div className="text-[10px] text-amber-700 font-medium pt-1 text-right border-t border-ink-200/60">
                        SAMPLE rate
                      </div>
                    </div>
                  </div>

                  <Link to="/book" className="block pt-2">
                    <Button variant="secondary" size="sm" className="w-full" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                      Book this service
                    </Button>
                  </Link>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* How It Works (4 Steps from content.howItWorks) */}
      {content?.howItWorks && content.howItWorks.length > 0 && (
        <section className="bg-surface-muted/60 border-y border-ink-200/80 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-ink-900 tracking-tight">
                How It Works
              </h2>
              <p className="text-xs sm:text-sm text-ink-600 mt-1">
                From digital booking to doorstep delivery and COD remittance.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {content.howItWorks.map((step) => (
                <div
                  key={step.stepNumber}
                  className="p-6 bg-surface border border-ink-200 rounded-xl relative flex flex-col justify-between shadow-2xs"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                        <FeatureIcon iconKey={step.iconKey} size="md" />
                      </div>
                      <span className="text-xs font-mono font-bold text-ink-400">
                        0{step.stepNumber}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-ink-900 mb-1.5">{step.title}</h3>
                    <p className="text-xs text-ink-600 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Coverage Preview (First 6 cities, chips, 'View all coverage' link) */}
      {previewCities.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 bg-surface border border-ink-200 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xs">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-brand-600 uppercase tracking-wider">
                <MapPin className="w-4 h-4" />
                <span>Regional Hub Network</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-ink-900">
                Operating across key logistics centers
              </h2>
              <p className="text-xs sm:text-sm text-ink-600 max-w-xl">
                Daily linehauls connect primary metropolitan hubs and their suburban delivery sectors.
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                {previewCities.map((c) => (
                  <span
                    key={c.id}
                    className="px-3 py-1 bg-surface-muted border border-ink-200 rounded-md text-xs font-medium text-ink-800"
                  >
                    {c.name} ({c.province})
                  </span>
                ))}
              </div>
            </div>

            <div className="shrink-0">
              <Link to="/coverage">
                <Button variant="secondary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  View all coverage
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Rate Calculator Teaser Card linking to /rates */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 bg-brand-50/70 border border-brand-200/80 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-700 uppercase tracking-wider">
              <Calculator className="w-4 h-4" />
              <span>Instant Tariff Calculation</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-ink-900">
              Check delivery rates before booking
            </h2>
            <p className="text-xs sm:text-sm text-ink-600 max-w-xl">
              Calculate estimated base tariffs, weight surcharges, fuel index, and COD handling fees in PKR.
            </p>
          </div>

          <div className="shrink-0">
            <Link to="/rates">
              <Button variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Open Rate Calculator
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Strip with SAMPLE details */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 bg-surface-muted border border-ink-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-ink-600">
          <div className="space-y-1">
            <div className="font-semibold text-ink-900 text-sm">Need Operational Assistance?</div>
            <div>Support Helpline: <strong className="text-ink-900">{settings?.supportPhone}</strong></div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/contact">
              <Button variant="secondary" size="sm" leftIcon={<Mail className="w-3.5 h-3.5" />}>
                Contact Support
              </Button>
            </Link>
            <a href="tel:+9221111222333">
              <Button variant="ghost" size="sm" leftIcon={<Phone className="w-3.5 h-3.5" />}>
                Call UAN
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Final CTA Band */}
      <section className="bg-ink-900 text-white py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-5">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Ready to dispatch your parcels with ABC?
          </h2>
          <p className="text-xs sm:text-sm text-ink-300 max-w-xl mx-auto leading-relaxed">
            Create consignment bookings with barcoded tracking or integrate your merchant store for automated collection and remittance.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link to="/book">
              <Button variant="accent" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Book a Parcel
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                Staff & Merchant Portal
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
