import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { geographyService, rateService, shipmentService, RateNotFoundError } from '@/services';
import { useToast } from '@/hooks/useToast';
import { RateQuote } from '@/services/contracts/rate.contract';
import {
  BookingDraft,
  BookingDraftSender,
  BookingDraftRecipient,
  BookingDraftShipment,
} from '@/types/domain';
import {
  senderStepSchema,
  recipientStepSchema,
  shipmentStepSchema,
  bookingToQuoteInput,
} from '@/lib/bookingSchema';
import { parseRatesFromSearchParams } from '@/lib/bookingCarryOver';
import { buildBreakdownRows, calculateVolumetricWeight } from '@/lib/rateEngine';
import { formatPKR } from '@/lib/format';
import { SHIPMENT_CATEGORIES, PICKUP_OPTIONS, PAYMENT_METHODS, BOOKING_LIMITS } from '@/config/booking';
import { Card, CardHeader, CardDescription, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
  Package,
  User,
  MapPin,
  Truck,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  ShieldCheck,
  Layers,
  Banknote,
  Send,
} from 'lucide-react';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function BookParcelPage() {
  useDocumentTitle('Book a Parcel — ABC');

  const { user } = useAuth();
  const toast = useToast();
  const [searchParams] = useSearchParams();

  // Ref to step heading for accessible focus shift on step change
  const stepHeadingRef = useRef<HTMLHeadingElement | null>(null);

  // Current active step (1 to 4)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Reset confirmation modal state
  const [showResetDialog, setShowResetDialog] = useState(false);

  // Mobile expanded summary state
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false);

  // Collapsible dimensions toggle in Step 3
  const [showDimensions, setShowDimensions] = useState(
    () => !!(carryOver.lengthCm && carryOver.widthCm && carryOver.heightCm)
  );

  // Field validation error states per step
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingResult, setBookingResult] = useState<{ trackingNo: string; totalChargesPkr: number } | null>(null);

  // Parse carry-over state from URL params
  const carryOver = parseRatesFromSearchParams(searchParams);

  // Master in-memory draft state
  const [draft, setDraft] = useState<BookingDraft>(() => ({
    sender: {
      name: user?.fullName || '',
      phone: user?.phone || '',
      email: user?.email || '',
      address: '',
      cityId: carryOver.originCityId || 'city-khi',
      zoneId: '',
      instructions: '',
    },
    recipient: {
      name: '',
      phone: '',
      altPhone: '',
      address: '',
      cityId: carryOver.destinationCityId || 'city-lhe',
      zoneId: carryOver.destinationZoneId || '',
      instructions: '',
    },
    shipment: {
      categoryId: 'cat-cloth',
      description: '',
      pieces: 1,
      weightKg: carryOver.weightKg || 1,
      dimensionsCm:
        carryOver.lengthCm && carryOver.widthCm && carryOver.heightCm
          ? {
              length: carryOver.lengthCm,
              width: carryOver.widthCm,
              height: carryOver.heightCm,
            }
          : undefined,
      serviceId: carryOver.serviceId || 'srv-std',
      pickupOption: 'pickup_from_address',
      preferredPickupDate: new Date().toISOString().split('T')[0],
      paymentMethod: carryOver.isCod ? 'cod' : 'prepaid',
      codAmount: carryOver.codAmountPkr || undefined,
      specialHandling: false,
    },
  }));

  // Fetch Cities and Services
  const { data: cities } = useQuery({
    queryKey: ['cities'],
    queryFn: () => geographyService.listCities(),
  });

  const { data: services } = useQuery({
    queryKey: ['services'],
    queryFn: () => geographyService.listServices(),
  });

  // Sender Zones
  const { data: senderZones } = useQuery({
    queryKey: ['zones', draft.sender.cityId],
    queryFn: () => geographyService.listZones(draft.sender.cityId),
    enabled: !!draft.sender.cityId,
  });

  // Recipient Zones
  const { data: recipientZones } = useQuery({
    queryKey: ['zones', draft.recipient.cityId],
    queryFn: () => geographyService.listZones(draft.recipient.cityId),
    enabled: !!draft.recipient.cityId,
  });

  // Shift focus to step heading whenever step changes
  useEffect(() => {
    if (stepHeadingRef.current) {
      stepHeadingRef.current.focus();
    }
  }, [currentStep]);

  // Selected Service Details
  const selectedService = services?.find((s) => s.id === draft.shipment.serviceId);
  const codAllowed = selectedService?.allowsCod ?? true;

  // Prepare Live Estimate Quote Input
  const allZones = useMemo(() => {
    const combined: typeof senderZones = [];
    if (senderZones) combined.push(...senderZones);
    if (recipientZones) combined.push(...recipientZones);
    return combined;
  }, [senderZones, recipientZones]);

  const rawQuoteInput = useMemo(() => {
    const effectiveDraft =
      !codAllowed && draft.shipment.paymentMethod === 'cod'
        ? {
            ...draft,
            shipment: {
              ...draft.shipment,
              paymentMethod: 'prepaid' as const,
              codAmount: undefined,
            },
          }
        : draft;
    return bookingToQuoteInput(effectiveDraft, allZones);
  }, [draft, allZones, codAllowed]);

  // Debounce quote input by 400 ms
  const debouncedQuoteInput = useDebounce(rawQuoteInput, 400);

  // Live Rate Quote Query
  const {
    data: liveQuote,
    isLoading: isQuoteLoading,
    error: quoteError,
  } = useQuery<RateQuote, Error>({
    queryKey: ['bookingLiveQuote', debouncedQuoteInput],
    queryFn: () => {
      if (!debouncedQuoteInput) {
        throw new Error('Incomplete booking parameters');
      }
      return rateService.getQuote(debouncedQuoteInput);
    },
    enabled: !!debouncedQuoteInput,
    retry: false,
    staleTime: 1000 * 30,
  });

  const isRateNotFound = quoteError instanceof RateNotFoundError;

  // Breakdown rows for live summary
  const breakdownRows = liveQuote ? buildBreakdownRows(liveQuote) : [];

  // Computed Volumetric Weight
  const volumetricWeight = calculateVolumetricWeight(
    draft.shipment.dimensionsCm?.length,
    draft.shipment.dimensionsCm?.width,
    draft.shipment.dimensionsCm?.height
  );

  // Field change helpers
  const updateSender = (field: keyof BookingDraftSender, value: unknown) => {
    setDraft((prev) => ({
      ...prev,
      sender: { ...prev.sender, [field]: value },
    }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const updateRecipient = (field: keyof BookingDraftRecipient, value: unknown) => {
    setDraft((prev) => ({
      ...prev,
      recipient: { ...prev.recipient, [field]: value },
    }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const updateShipment = (field: keyof BookingDraftShipment, value: unknown) => {
    setDraft((prev) => ({
      ...prev,
      shipment: { ...prev.shipment, [field]: value },
    }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Step Validation & Navigation
  const validateStep = (step: 1 | 2 | 3): boolean => {
    setErrors({});
    let result;

    if (step === 1) {
      result = senderStepSchema.safeParse(draft.sender);
    } else if (step === 2) {
      result = recipientStepSchema.safeParse(draft.recipient);
    } else {
      result = shipmentStepSchema.safeParse(draft.shipment);
    }

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      let firstErrorField: string | null = null;

      for (const issue of result.error.issues) {
        const fieldKey = issue.path.join('.');
        if (!fieldErrors[fieldKey]) {
          fieldErrors[fieldKey] = issue.message;
        }
        if (!firstErrorField) {
          firstErrorField = issue.path[0]?.toString() || null;
        }
      }

      setErrors(fieldErrors);

      // Focus first invalid input element
      if (firstErrorField) {
        const element = document.getElementById(firstErrorField) || document.querySelector(`[name="${firstErrorField}"]`);
        if (element instanceof HTMLElement) {
          element.focus();
        }
      }
      return false;
    }

    return true;
  };

  const handleSubmitBooking = async () => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      const firstInvalidStep = !senderStepSchema.safeParse(draft.sender).success ? 1
        : !recipientStepSchema.safeParse(draft.recipient).success ? 2 : 3;
      setCurrentStep(firstInvalidStep as 1 | 2 | 3);
      toast.error('Please complete all required booking fields before submitting.');
      return;
    }
    if (isSubmittingBooking || bookingResult) return;
    setIsSubmittingBooking(true);
    try {
      const result = await shipmentService.createPublicBooking({
        sender: {
          name: draft.sender.name.trim(), phone: draft.sender.phone.trim(), email: draft.sender.email?.trim() || undefined,
          address: draft.sender.address.trim(), cityId: draft.sender.cityId, zoneId: draft.sender.zoneId,
          instructions: draft.sender.instructions?.trim() || undefined,
        },
        recipient: {
          name: draft.recipient.name.trim(), phone: draft.recipient.phone.trim(), altPhone: draft.recipient.altPhone?.trim() || undefined,
          address: draft.recipient.address.trim(), cityId: draft.recipient.cityId, zoneId: draft.recipient.zoneId,
          instructions: draft.recipient.instructions?.trim() || undefined,
        },
        shipment: {
          categoryId: draft.shipment.categoryId, description: draft.shipment.description, pieces: draft.shipment.pieces,
          serviceId: draft.shipment.serviceId, weightKg: draft.shipment.weightKg, dimensionsCm: draft.shipment.dimensionsCm,
          declaredValue: draft.shipment.declaredValue, pickupOption: draft.shipment.pickupOption,
          preferredPickupDate: draft.shipment.preferredPickupDate, specialHandling: draft.shipment.specialHandling,
          paymentMethod: draft.shipment.paymentMethod, codAmount: draft.shipment.paymentMethod === 'cod' ? draft.shipment.codAmount : undefined,
        },
      });
      setBookingResult({ trackingNo: result.trackingNo, totalChargesPkr: result.totalChargesPkr });
      toast.success(`Booking confirmed. Tracking number: ${result.trackingNo}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to submit booking. Please try again.';
      toast.error(message);
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (validateStep(1)) setCurrentStep(2);
    } else if (currentStep === 2) {
      if (validateStep(2)) setCurrentStep(3);
    } else if (currentStep === 3) {
      if (validateStep(3)) setCurrentStep(4);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setErrors({});
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
    }
  };

  const handleResetConfirm = () => {
    setShowResetDialog(false);
    setErrors({});
    setCurrentStep(1);
    setDraft({
      sender: {
        name: user?.fullName || '',
        phone: user?.phone || '',
        email: user?.email || '',
        address: '',
        cityId: 'city-khi',
        zoneId: '',
        instructions: '',
      },
      recipient: {
        name: '',
        phone: '',
        altPhone: '',
        address: '',
        cityId: 'city-lhe',
        zoneId: '',
        instructions: '',
      },
      shipment: {
        categoryId: 'cat-cloth',
        description: '',
        pieces: 1,
        weightKg: 1,
        dimensionsCm: undefined,
        serviceId: 'srv-std',
        pickupOption: 'pickup_from_address',
        preferredPickupDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'prepaid',
        codAmount: undefined,
        specialHandling: false,
      },
    });
  };

  const senderCityName = cities?.find((c) => c.id === draft.sender.cityId)?.name || 'Origin';
  const recipientCityName = cities?.find((c) => c.id === draft.recipient.cityId)?.name || 'Destination';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-ink-100">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-600 uppercase tracking-wider mb-1">
            <Package className="w-4 h-4" />
            <span>Parcel Booking (Phase F3a)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-900 tracking-tight">
            Book a Domestic Parcel Pickup
          </h1>
          <p className="text-xs sm:text-sm text-ink-600 mt-0.5">
            Doorstep pickup, verified sorting lines, and guaranteed Cash on Delivery reconciliation.
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowResetDialog(true)}
          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          className="text-ink-500 hover:text-danger self-start sm:self-auto"
        >
          Reset Form
        </Button>
      </div>

      {/* Stepper Navigation Indicator */}
      <nav aria-label="Booking Progress" className="bg-surface p-3 sm:p-4 rounded-xl border border-ink-200 shadow-2xs">
        <ol className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
          {[
            { step: 1, title: 'Sender', desc: 'Pickup Details', icon: User },
            { step: 2, title: 'Recipient', desc: 'Destination', icon: MapPin },
            { step: 3, title: 'Shipment', desc: 'Service & COD', icon: Truck },
            { step: 4, title: 'Review', desc: 'Verification', icon: CheckCircle2 },
          ].map((item) => {
            const isCurrent = currentStep === item.step;
            const isCompleted = currentStep > item.step;
            const Icon = item.icon;

            return (
              <li
                key={item.step}
                aria-current={isCurrent ? 'step' : undefined}
                className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all ${
                  isCurrent
                    ? 'bg-brand-50/70 border-brand-300 ring-2 ring-brand-600/20 text-brand-900'
                    : isCompleted
                    ? 'bg-surface border-ink-200 text-ink-900'
                    : 'bg-surface-muted/50 border-transparent text-ink-400'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${
                    isCurrent
                      ? 'bg-brand-600 text-white shadow-2xs'
                      : isCompleted
                      ? 'bg-green-100 text-success'
                      : 'bg-ink-200 text-ink-500'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">
                    {item.step}. {item.title}
                  </div>
                  <div className="text-[10px] text-ink-500 hidden sm:block truncate">
                    {item.desc}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Main Grid: Form Steps (Left) + Sticky Summary Card (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Steps Container */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="shadow-xs">
            {/* STEP 1: SENDER DETAILS */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <CardHeader className="pb-4 border-b border-ink-100">
                  <h2
                    ref={stepHeadingRef}
                    tabIndex={-1}
                    className="text-lg font-bold text-ink-900 focus:outline-none"
                  >
                    Step 1: Sender & Pickup Information
                  </h2>
                  <CardDescription>
                    Where should our courier collect the parcel consignment?
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      id="name"
                      label="Sender Full Name"
                      required
                      placeholder="e.g. Tariq Mehmood"
                      value={draft.sender.name}
                      onChange={(e) => updateSender('name', e.target.value)}
                      error={errors.name}
                    />

                    <PhoneInput
                      id="phone"
                      label="Sender Mobile Phone"
                      required
                      value={draft.sender.phone}
                      onChange={(val) => updateSender('phone', val)}
                      error={errors.phone}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                      id="cityId"
                      label="Origin City"
                      required
                      value={draft.sender.cityId}
                      onChange={(e) => {
                        updateSender('cityId', e.target.value);
                        updateSender('zoneId', '');
                      }}
                      options={cities?.map((c) => ({ value: c.id, label: `${c.name} (${c.code})` }))}
                      error={errors.cityId}
                    />

                    <Select
                      id="zoneId"
                      label="Origin Area / Sector"
                      required
                      placeholder="Select origin area / sector"
                      value={draft.sender.zoneId}
                      onChange={(e) => updateSender('zoneId', e.target.value)}
                      options={senderZones?.map((z) => ({ value: z.id, label: z.name }))}
                      error={errors.zoneId}
                    />
                  </div>

                  <Textarea
                    id="address"
                    label="Complete Pickup Address"
                    required
                    rows={3}
                    placeholder="Plot / House No, Street, Building, Sector, Landmark..."
                    value={draft.sender.address}
                    onChange={(e) => updateSender('address', e.target.value)}
                    error={errors.address}
                    hint="Minimum 10 characters for courier routing precision"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      id="email"
                      label="Sender Email (Optional)"
                      type="email"
                      placeholder="tariq@example.pk"
                      value={draft.sender.email || ''}
                      onChange={(e) => updateSender('email', e.target.value)}
                      error={errors.email}
                      hint="For booking dispatch confirmation & receipt"
                    />

                    <Input
                      id="instructions"
                      label="Pickup Instructions (Optional)"
                      placeholder="e.g. Gate 2, call 10 mins prior"
                      value={draft.sender.instructions || ''}
                      onChange={(e) => updateSender('instructions', e.target.value)}
                      error={errors.instructions}
                    />
                  </div>
                </CardContent>
              </div>
            )}

            {/* STEP 2: RECIPIENT DETAILS */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <CardHeader className="pb-4 border-b border-ink-100">
                  <h2
                    ref={stepHeadingRef}
                    tabIndex={-1}
                    className="text-lg font-bold text-ink-900 focus:outline-none"
                  >
                    Step 2: Recipient & Delivery Address
                  </h2>
                  <CardDescription>
                    Who is receiving the parcel and where should it be delivered?
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      id="name"
                      label="Recipient Full Name"
                      required
                      placeholder="e.g. Hamza Khan"
                      value={draft.recipient.name}
                      onChange={(e) => updateRecipient('name', e.target.value)}
                      error={errors.name}
                    />

                    <PhoneInput
                      id="phone"
                      label="Recipient Mobile Phone"
                      required
                      value={draft.recipient.phone}
                      onChange={(val) => updateRecipient('phone', val)}
                      error={errors.phone}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                      id="cityId"
                      label="Destination City"
                      required
                      value={draft.recipient.cityId}
                      onChange={(e) => {
                        updateRecipient('cityId', e.target.value);
                        updateRecipient('zoneId', '');
                      }}
                      options={cities?.map((c) => ({ value: c.id, label: `${c.name} (${c.code})` }))}
                      error={errors.cityId}
                    />

                    <Select
                      id="zoneId"
                      label="Destination Area / Delivery Sector"
                      required
                      placeholder="Select destination area / sector"
                      value={draft.recipient.zoneId}
                      onChange={(e) => updateRecipient('zoneId', e.target.value)}
                      options={recipientZones?.map((z) => ({
                        value: z.id,
                        label: `${z.name}${z.isRemote ? ' (Remote Surcharge Area)' : ''}`,
                      }))}
                      error={errors.zoneId}
                    />
                  </div>

                  <Textarea
                    id="address"
                    label="Complete Delivery Address"
                    required
                    rows={3}
                    placeholder="House / Office No, Street, Floor, Sector, Landmark..."
                    value={draft.recipient.address}
                    onChange={(e) => updateRecipient('address', e.target.value)}
                    error={errors.address}
                    hint="Detailed address ensures first-attempt delivery success"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <PhoneInput
                      id="altPhone"
                      label="Alternate Contact Phone (Optional)"
                      value={draft.recipient.altPhone || ''}
                      onChange={(val) => updateRecipient('altPhone', val)}
                      error={errors.altPhone}
                      hint="Consignee secondary mobile or landline"
                    />

                    <Input
                      id="instructions"
                      label="Delivery Notes (Optional)"
                      placeholder="e.g. Leave with security desk if unavailable"
                      value={draft.recipient.instructions || ''}
                      onChange={(e) => updateRecipient('instructions', e.target.value)}
                      error={errors.instructions}
                    />
                  </div>
                </CardContent>
              </div>
            )}

            {/* STEP 3: SHIPMENT, SERVICE & COD */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <CardHeader className="pb-4 border-b border-ink-100">
                  <h2
                    ref={stepHeadingRef}
                    tabIndex={-1}
                    className="text-lg font-bold text-ink-900 focus:outline-none"
                  >
                    Step 3: Parcel Specs, Service Mode & COD
                  </h2>
                  <CardDescription>
                    Configure parcel weight, service level, pickup arrangement, and Cash on Delivery
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-5">
                  {/* Category & Description */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Select
                        id="categoryId"
                        label="Goods Category"
                        required
                        value={draft.shipment.categoryId}
                        onChange={(e) => updateShipment('categoryId', e.target.value)}
                        options={SHIPMENT_CATEGORIES.map((cat) => ({
                          value: cat.id,
                          label: cat.name,
                        }))}
                        error={errors.categoryId}
                      />
                      {(() => {
                        const cat = SHIPMENT_CATEGORIES.find((c) => c.id === draft.shipment.categoryId);
                        return cat?.restrictedNote ? (
                          <p className="mt-1 text-[11px] text-amber-700 bg-amber-50 p-1.5 rounded border border-amber-200">
                            <strong>Note:</strong> {cat.restrictedNote}
                          </p>
                        ) : null;
                      })()}
                    </div>

                    <Input
                      id="description"
                      label="Item Description"
                      required
                      placeholder="e.g. 2 Stitched Lawn Suits"
                      value={draft.shipment.description}
                      onChange={(e) => updateShipment('description', e.target.value)}
                      error={errors.description}
                    />
                  </div>

                  {/* Weight, Pieces & Declared Value */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input
                      id="pieces"
                      label="Number of Pieces"
                      type="number"
                      min={BOOKING_LIMITS.minPieces}
                      max={BOOKING_LIMITS.maxPieces}
                      value={draft.shipment.pieces}
                      onChange={(e) => updateShipment('pieces', parseInt(e.target.value, 10) || 1)}
                      error={errors.pieces}
                    />

                    <Input
                      id="weightKg"
                      label="Actual Weight (KG)"
                      type="number"
                      min="0.1"
                      max={BOOKING_LIMITS.maxWeightKg}
                      step="0.5"
                      required
                      value={draft.shipment.weightKg}
                      onChange={(e) => updateShipment('weightKg', parseFloat(e.target.value) || 0)}
                      error={errors.weightKg}
                      hint="Max 70 kg domestic parcel limit"
                    />

                    <Input
                      id="declaredValue"
                      label="Declared Value (PKR, Optional)"
                      type="number"
                      min="0"
                      step="500"
                      placeholder="e.g. 3500"
                      value={draft.shipment.declaredValue || ''}
                      onChange={(e) => updateShipment('declaredValue', parseFloat(e.target.value) || undefined)}
                      error={errors.declaredValue}
                    />
                  </div>

                  {/* Collapsible Dimensions */}
                  <div className="border border-ink-200/80 rounded-xl p-3 bg-surface-muted/30">
                    <button
                      type="button"
                      onClick={() => setShowDimensions(!showDimensions)}
                      className="flex items-center justify-between w-full text-xs font-semibold text-ink-800 hover:text-brand-600 focus:outline-none"
                      aria-expanded={showDimensions}
                    >
                      <span className="flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-ink-500" />
                        <span>Package Dimensions in CM (Optional)</span>
                      </span>
                      {showDimensions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {showDimensions && (
                      <div className="mt-3 space-y-3 pt-3 border-t border-ink-200/60">
                        <div className="grid grid-cols-3 gap-2">
                          <Input
                            id="dimensionsCm.length"
                            label="Length (cm)"
                            type="number"
                            min="1"
                            placeholder="L"
                            value={draft.shipment.dimensionsCm?.length || ''}
                            onChange={(e) =>
                              updateShipment('dimensionsCm', {
                                ...draft.shipment.dimensionsCm,
                                length: parseFloat(e.target.value) || undefined,
                              })
                            }
                            error={errors['dimensionsCm.length']}
                          />
                          <Input
                            id="dimensionsCm.width"
                            label="Width (cm)"
                            type="number"
                            min="1"
                            placeholder="W"
                            value={draft.shipment.dimensionsCm?.width || ''}
                            onChange={(e) =>
                              updateShipment('dimensionsCm', {
                                ...draft.shipment.dimensionsCm,
                                width: parseFloat(e.target.value) || undefined,
                              })
                            }
                            error={errors['dimensionsCm.width']}
                          />
                          <Input
                            id="dimensionsCm.height"
                            label="Height (cm)"
                            type="number"
                            min="1"
                            placeholder="H"
                            value={draft.shipment.dimensionsCm?.height || ''}
                            onChange={(e) =>
                              updateShipment('dimensionsCm', {
                                ...draft.shipment.dimensionsCm,
                                height: parseFloat(e.target.value) || undefined,
                              })
                            }
                            error={errors['dimensionsCm.height']}
                          />
                        </div>
                        {volumetricWeight > 0 && (
                          <div className="text-[11px] text-ink-600 bg-surface p-2 rounded border border-ink-200">
                            Volumetric weight:{' '}
                            <strong className="font-mono text-ink-900">{volumetricWeight} kg</strong>{' '}
                            (computed as (L×W×H)/5,000). Chargeable weight is the greater of actual and volumetric.
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Courier Service Selection */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-ink-700">
                      Courier Service Mode <span className="text-danger">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {services?.map((service) => {
                        const isSelected = draft.shipment.serviceId === service.id;
                        return (
                          <div
                            key={service.id}
                            onClick={() => {
                              setDraft((prev) => ({
                                ...prev,
                                shipment: {
                                  ...prev.shipment,
                                  serviceId: service.id,
                                  ...(!service.allowsCod && prev.shipment.paymentMethod === 'cod'
                                    ? { paymentMethod: 'prepaid', codAmount: undefined }
                                    : {}),
                                },
                              }));
                            }}
                            className={`p-3 rounded-xl border cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-brand-50/70 border-brand-500 ring-2 ring-brand-500/20'
                                : 'bg-surface border-ink-200 hover:border-ink-300'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-xs text-ink-900">{service.name}</span>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-ink-100 text-ink-700">
                                {service.estimatedDeliveryDays}
                              </span>
                            </div>
                            <p className="text-[11px] text-ink-600 leading-snug line-clamp-2">
                              {service.description}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                    {errors.serviceId && (
                      <p className="text-xs text-danger font-medium">{errors.serviceId}</p>
                    )}
                  </div>

                  {/* Pickup Arrangement */}
                  <div className="space-y-3 pt-2 border-t border-ink-100">
                    <label className="block text-xs font-semibold text-ink-700">
                      Pickup Arrangement <span className="text-danger">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {PICKUP_OPTIONS.map((opt) => {
                        const isSelected = draft.shipment.pickupOption === opt.id;
                        return (
                          <div
                            key={opt.id}
                            onClick={() => updateShipment('pickupOption', opt.id)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-brand-50/70 border-brand-500 ring-2 ring-brand-500/20'
                                : 'bg-surface border-ink-200 hover:border-ink-300'
                            }`}
                          >
                            <div className="font-bold text-xs text-ink-900">{opt.label}</div>
                            <p className="text-[11px] text-ink-600 mt-0.5">{opt.description}</p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Preferred Pickup Date (Only for Doorstep Pickup) */}
                    {draft.shipment.pickupOption === 'pickup_from_address' && (
                      <div className="max-w-xs pt-1">
                        <Input
                          id="preferredPickupDate"
                          label="Preferred Courier Pickup Date (PKT)"
                          type="date"
                          required
                          min={new Date().toISOString().split('T')[0]}
                          value={draft.shipment.preferredPickupDate || ''}
                          onChange={(e) => updateShipment('preferredPickupDate', e.target.value)}
                          error={errors.preferredPickupDate}
                          hint="Available dates: Today to next 14 business days"
                        />
                      </div>
                    )}
                  </div>

                  {/* Payment Method & Cash on Delivery */}
                  <div className="space-y-3 pt-2 border-t border-ink-100">
                    <label className="block text-xs font-semibold text-ink-700">
                      Payment & Cash on Delivery <span className="text-danger">*</span>
                    </label>

                    {!codAllowed ? (
                      <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-800">
                        Cash on Delivery is unavailable for the selected service mode ({selectedService?.name}).
                        Prepaid billing is applied.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {PAYMENT_METHODS.map((pm) => {
                          const isSelected = draft.shipment.paymentMethod === pm.id;
                          return (
                            <div
                              key={pm.id}
                              onClick={() => updateShipment('paymentMethod', pm.id)}
                              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                                isSelected
                                  ? 'bg-brand-50/70 border-brand-500 ring-2 ring-brand-500/20'
                                  : 'bg-surface border-ink-200 hover:border-ink-300'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 font-bold text-xs text-ink-900">
                                <Banknote className="w-3.5 h-3.5 text-brand-600" />
                                <span>{pm.label}</span>
                              </div>
                              <p className="text-[11px] text-ink-600 mt-0.5">{pm.description}</p>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* COD Amount Field */}
                    {draft.shipment.paymentMethod === 'cod' && codAllowed && (
                      <div className="max-w-sm pt-1">
                        <Input
                          id="codAmount"
                          label="Cash to Collect from Consignee (PKR)"
                          type="number"
                          min="1"
                          max={BOOKING_LIMITS.maxCodAmountPkr}
                          step="100"
                          required
                          placeholder="e.g. 3500"
                          value={draft.shipment.codAmount || ''}
                          onChange={(e) => updateShipment('codAmount', parseFloat(e.target.value) || undefined)}
                          error={errors.codAmount}
                          hint={`Maximum COD collection: PKR ${BOOKING_LIMITS.maxCodAmountPkr.toLocaleString()}`}
                        />
                      </div>
                    )}

                    {/* Special Handling Flag */}
                    <div className="pt-2">
                      <Checkbox
                        label="Special Handling / Fragile Parcel"
                        checked={draft.shipment.specialHandling || false}
                        onChange={(e) => updateShipment('specialHandling', e.target.checked)}
                        description="Flags package for top-tier stowage during linehaul transit"
                      />
                    </div>
                  </div>
                </CardContent>
              </div>
            )}

            {/* STEP 4: REVIEW & CONFIRM */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <CardHeader className="pb-4 border-b border-ink-100">
                  <h2
                    ref={stepHeadingRef}
                    tabIndex={-1}
                    className="text-lg font-bold text-ink-900 focus:outline-none"
                  >
                    Step 4: Review Booking & Consignment Summary
                  </h2>
                  <CardDescription>
                    Verify all recipient addresses and consignment specifications prior to submission
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Sender Section */}
                  <div className="p-4 bg-surface-muted/50 rounded-xl border border-ink-200">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-ink-200/80">
                      <div className="flex items-center gap-2 font-bold text-xs text-ink-900">
                        <User className="w-4 h-4 text-brand-600" />
                        <span>Sender Information</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="text-xs font-semibold text-brand-600 hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-ink-500">Name:</span>{' '}
                        <strong className="text-ink-900">{draft.sender.name}</strong>
                      </div>
                      <div>
                        <span className="text-ink-500">Phone:</span>{' '}
                        <strong className="font-mono text-ink-900">{draft.sender.phone}</strong>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-ink-500">City / Area:</span>{' '}
                        <span className="text-ink-900">
                          {senderCityName} — {senderZones?.find((z) => z.id === draft.sender.zoneId)?.name}
                        </span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-ink-500">Address:</span>{' '}
                        <span className="text-ink-800">{draft.sender.address}</span>
                      </div>
                    </div>
                  </div>

                  {/* Recipient Section */}
                  <div className="p-4 bg-surface-muted/50 rounded-xl border border-ink-200">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-ink-200/80">
                      <div className="flex items-center gap-2 font-bold text-xs text-ink-900">
                        <MapPin className="w-4 h-4 text-accent-600" />
                        <span>Recipient Information</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="text-xs font-semibold text-brand-600 hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-ink-500">Name:</span>{' '}
                        <strong className="text-ink-900">{draft.recipient.name}</strong>
                      </div>
                      <div>
                        <span className="text-ink-500">Phone:</span>{' '}
                        <strong className="font-mono text-ink-900">{draft.recipient.phone}</strong>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-ink-500">City / Sector:</span>{' '}
                        <span className="text-ink-900">
                          {recipientCityName} — {recipientZones?.find((z) => z.id === draft.recipient.zoneId)?.name}
                        </span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-ink-500">Address:</span>{' '}
                        <span className="text-ink-800">{draft.recipient.address}</span>
                      </div>
                    </div>
                  </div>

                  {/* Shipment Specs Section */}
                  <div className="p-4 bg-surface-muted/50 rounded-xl border border-ink-200">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-ink-200/80">
                      <div className="flex items-center gap-2 font-bold text-xs text-ink-900">
                        <Truck className="w-4 h-4 text-brand-600" />
                        <span>Shipment & Payment Specifications</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        className="text-xs font-semibold text-brand-600 hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-ink-500">Service:</span>{' '}
                        <strong className="text-ink-900">{selectedService?.name}</strong>
                      </div>
                      <div>
                        <span className="text-ink-500">Weight:</span>{' '}
                        <strong className="font-mono text-ink-900">{draft.shipment.weightKg} KG</strong>
                        {volumetricWeight > 0 && (
                          <span className="text-ink-500 text-[11px]"> (Volumetric: {volumetricWeight} KG)</span>
                        )}
                      </div>
                      <div>
                        <span className="text-ink-500">Category:</span>{' '}
                        <span className="text-ink-900">
                          {SHIPMENT_CATEGORIES.find((c) => c.id === draft.shipment.categoryId)?.name}
                        </span>
                      </div>
                      <div>
                        <span className="text-ink-500">Payment Mode:</span>{' '}
                        <strong className="text-ink-900 uppercase">
                          {draft.shipment.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Prepaid'}
                        </strong>
                      </div>
                      {draft.shipment.paymentMethod === 'cod' && (
                        <div>
                          <span className="text-ink-500">COD Collection:</span>{' '}
                          <strong className="font-mono text-success text-sm">
                            {formatPKR(draft.shipment.codAmount)}
                          </strong>
                        </div>
                      )}
                      <div>
                        <span className="text-ink-500">Pickup Arrangement:</span>{' '}
                        <span className="text-ink-900">
                          {draft.shipment.pickupOption === 'pickup_from_address'
                            ? `Doorstep Pickup (${draft.shipment.preferredPickupDate})`
                            : 'Drop at Branch'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {bookingResult ? (
                    <div className="p-5 rounded-xl border border-green-200 bg-green-50 text-center space-y-3" role="status" aria-live="polite">
                      <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto" />
                      <h3 className="text-lg font-bold text-ink-900">Booking received successfully</h3>
                      <p className="text-sm text-ink-700">Keep this tracking number to check your parcel status.</p>
                      <div className="rounded-lg bg-white border border-green-200 p-3">
                        <div className="text-xs text-ink-500">Your tracking number</div>
                        <div className="font-mono text-xl font-bold text-brand-700 break-all">{bookingResult.trackingNo}</div>
                        <div className="text-sm font-semibold mt-2">Estimated shipping charges: {formatPKR(bookingResult.totalChargesPkr)}</div>
                      </div>
                      <div className="flex flex-wrap justify-center gap-2">
                        <Button type="button" variant="primary" onClick={() => { window.location.assign(`/track/${encodeURIComponent(bookingResult.trackingNo)}`); }}>
                          Track Parcel
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => { setBookingResult(null); setCurrentStep(1); }}>
                          Book Another Parcel
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => navigator.clipboard?.writeText(bookingResult.trackingNo)}>
                          Copy Tracking Number
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-2 text-center space-y-2">
                      <Button
                        type="button"
                        variant="primary"
                        size="lg"
                        disabled={isSubmittingBooking}
                        className="w-full"
                        onClick={handleSubmitBooking}
                        rightIcon={<Send className="w-4 h-4" />}
                      >
                        {isSubmittingBooking ? 'Submitting booking…' : 'Submit Consignment Booking'}
                      </Button>
                      <p className="text-xs text-ink-500">
                        Booking details are validated before being saved to the courier database.
                      </p>
                    </div>
                  )}
                </CardContent>
              </div>
            )}

            {/* Step Action Buttons (Back & Next) */}
            <div className="p-4 sm:p-6 bg-surface-muted/30 border-t border-ink-100 flex items-center justify-between gap-3">
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleBack}
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                  Back
                </Button>
              ) : (
                <div />
              )}

              {currentStep < 4 && (
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleNext}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Next: {currentStep === 1 ? 'Recipient' : currentStep === 2 ? 'Shipment Specs' : 'Review'}
                </Button>
              )}
            </div>
          </Card>
        </div>

        {/* Desktop Sticky Live Summary Card (Right Column) */}
        <div className="hidden lg:block lg:col-span-5 sticky top-24" aria-live="polite" aria-atomic="true">
          <Card className="border-t-4 border-t-brand-600 shadow-sm space-y-4">
            <CardHeader className="pb-3 border-b border-ink-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">
                  Live Tariff Estimate
                </span>
                {liveQuote?.isSample && (
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded-full shadow-2xs">
                    SAMPLE rates — not final
                  </span>
                )}
              </div>

              <div className="text-2xl font-bold font-mono text-ink-900 mt-2">
                {isQuoteLoading ? (
                  <span className="animate-pulse text-ink-400">Computing...</span>
                ) : liveQuote ? (
                  formatPKR(liveQuote.totalPkr)
                ) : (
                  '—'
                )}
              </div>

              <div className="text-xs text-ink-500 mt-0.5">
                {senderCityName} → {recipientCityName} • {selectedService?.name}
              </div>
            </CardHeader>

            <CardContent className="space-y-3 text-xs">
              {/* Route Not Found / Pricing Error */}
              {isRateNotFound && (
                <div className="p-3 bg-surface-muted border border-ink-200 rounded-lg text-center space-y-1.5">
                  <HelpCircle className="w-5 h-5 text-ink-400 mx-auto" />
                  <p className="text-xs text-ink-800 font-medium">
                    We can't price this route online — contact us
                  </p>
                  <Link to="/contact">
                    <Button variant="secondary" size="sm">
                      Contact Operations
                    </Button>
                  </Link>
                </div>
              )}

              {/* Quote Breakdown Rows */}
              {liveQuote && !isRateNotFound && (
                <div className="space-y-2">
                  {breakdownRows.map((row) => (
                    <div key={row.key} className="flex justify-between py-0.5 text-ink-600">
                      <span>{row.label}:</span>
                      <span className="font-mono text-ink-900">{formatPKR(row.amountPkr)}</span>
                    </div>
                  ))}

                  <div className="pt-2 border-t border-ink-200 flex justify-between font-bold text-sm text-ink-900">
                    <span>Estimated Net Charge:</span>
                    <span className="font-mono text-brand-600">{formatPKR(liveQuote.totalPkr)}</span>
                  </div>

                  <div className="pt-2 text-[11px] text-ink-500 leading-normal border-t border-ink-100">
                    Estimated. Final charge may change after weighing/verification.
                  </div>
                </div>
              )}

              {/* Transit & COD Notice */}
              <div className="p-3 bg-surface-muted/60 rounded-lg border border-ink-100 space-y-1">
                <div className="flex justify-between">
                  <span className="text-ink-500">Weight:</span>
                  <span className="font-mono font-semibold text-ink-800">
                    {draft.shipment.weightKg} KG
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-500">Payment:</span>
                  <span className="font-semibold text-ink-800 uppercase">
                    {draft.shipment.paymentMethod}
                  </span>
                </div>
                {draft.shipment.paymentMethod === 'cod' && draft.shipment.codAmount && (
                  <div className="flex justify-between text-success">
                    <span>COD to Collect:</span>
                    <span className="font-mono font-bold">
                      {formatPKR(draft.shipment.codAmount)}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile Sticky Bottom Summary Bar (Expandable) */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-surface border-t border-ink-200 shadow-lg px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase font-semibold text-ink-400">Estimated Total</div>
            <div className="text-lg font-bold font-mono text-brand-600">
              {isQuoteLoading ? '...' : liveQuote ? formatPKR(liveQuote.totalPkr) : '—'}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsMobileSummaryOpen(!isMobileSummaryOpen)}
              rightIcon={isMobileSummaryOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            >
              {isMobileSummaryOpen ? 'Hide' : 'Details'}
            </Button>

            {currentStep < 4 ? (
              <Button type="button" variant="primary" size="sm" onClick={handleNext}>
                Next
              </Button>
            ) : null}
          </div>
        </div>

        {/* Collapsible details for mobile */}
        {isMobileSummaryOpen && liveQuote && (
          <div className="mt-3 pt-3 border-t border-ink-200 text-xs space-y-2 max-h-60 overflow-y-auto">
            {breakdownRows.map((row) => (
              <div key={row.key} className="flex justify-between text-ink-600">
                <span>{row.label}:</span>
                <span className="font-mono text-ink-900">{formatPKR(row.amountPkr)}</span>
              </div>
            ))}
            <div className="text-[10px] text-ink-500 pt-1">
              Estimated. Final charge may change after weighing/verification.
            </div>
          </div>
        )}
      </div>

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showResetDialog}
        onClose={() => setShowResetDialog(false)}
        onConfirm={handleResetConfirm}
        title="Reset Booking Form"
        message="Are you sure you want to reset this booking? All sender, recipient, and parcel details will be cleared."
        confirmLabel="Reset Form"
        cancelLabel="Keep Editing"
        variant="danger"
      />
    </div>
  );
}
