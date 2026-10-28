import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ticketService } from '@/services';
import { useSettings } from '@/hooks/useSettings';
import { useToast } from '@/hooks/useToast';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { validatePkPhone } from '@/lib/phone';
import { Phone, Mail, MapPin, Send, CheckCircle2, ShieldCheck, ShieldAlert, RefreshCw } from 'lucide-react';

const contactFormSchema = z.object({
  name: z.string().min(1, 'Full name is required').max(100, 'Name is too long'),
  phone: z.string().min(1, 'Phone number is required').refine((val) => validatePkPhone(val).isValid, {
    message: 'Please enter a valid Pakistani number (e.g. 0300 1234567 or 021 34567890)',
  }),
  email: z.string().email('Please enter a valid email address').or(z.literal('')).optional(),
  message: z.string().min(10, 'Message must be at least 10 characters long').max(2000, 'Message is too long'),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export function ContactPage() {
  useDocumentTitle('Contact Us');
  const { data: settings } = useSettings();
  const toast = useToast();

  const [ticketReference, setTicketReference] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      message: '',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setSubmissionError(null);
    try {
      const result = await ticketService.createContactTicket({
        name: data.name,
        phone: data.phone,
        email: data.email || undefined,
        message: data.message,
      });

      setTicketReference(result.ticketNo);
      toast.success(`Support ticket ${result.ticketNo} generated successfully.`);
      reset();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setSubmissionError(err.message);
      } else {
        setSubmissionError('Unable to submit your inquiry. Please try again.');
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-ink-900 tracking-tight">
          Customer Support & Operations Contact
        </h1>
        <p className="text-xs sm:text-sm text-ink-600">
          Inquire about parcel consignments, account registration, or merchant services.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto">
        {/* Contact Info Card */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="bg-brand-50/70 border-brand-200/80">
            <h2 className="text-base font-bold text-ink-900 mb-4">Sample Office Information</h2>
            <div className="space-y-4 text-xs text-ink-800">
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-brand-600 mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold text-ink-900">UAN Helpline</div>
                  <div className="text-ink-600">{settings?.supportPhone}</div>
                  <div className="text-[10px] text-ink-500 font-mono mt-0.5">
                    {settings?.workingHours || 'Monday – Saturday: 9:00 AM – 7:00 PM'}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-brand-600 mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold text-ink-900">Email Address</div>
                  <div className="text-ink-600">{settings?.supportEmail}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-brand-600 mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold text-ink-900">Central Hub Address</div>
                  <div className="text-ink-600 leading-relaxed">{settings?.headOfficeAddress}</div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-brand-200/60 text-[11px] text-ink-600 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>SAMPLE DATA — Addresses and phone numbers are placeholders.</span>
            </div>
          </Card>
        </div>

        {/* Contact Form Card */}
        <div className="lg:col-span-7">
          <Card>
            <CardHeader>
              <CardTitle>Open a Support Ticket</CardTitle>
              <CardDescription>
                Fill out the form below. Every inquiry generates a verifiable tracking reference.
              </CardDescription>
            </CardHeader>

            <CardContent>
              {/* Success View */}
              {ticketReference ? (
                <div className="p-6 text-center space-y-4 bg-green-50/50 rounded-xl border border-green-200" aria-live="polite">
                  <div className="w-12 h-12 rounded-full bg-green-100 text-success flex items-center justify-center mx-auto shadow-2xs">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-semibold text-success uppercase tracking-wider block">
                      Inquiry Logged Successfully
                    </span>
                    <h3 className="text-lg font-bold text-ink-900 mt-1">
                      Reference Number: <span className="font-mono text-brand-600">{ticketReference}</span>
                    </h3>
                    <p className="text-xs text-ink-600 mt-2 max-w-md mx-auto leading-relaxed">
                      Thank you. Your support inquiry has been recorded in the ABC operations desk. Please quote this reference when communicating with our representatives.
                    </p>
                  </div>
                  <div className="pt-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setTicketReference(null)}
                    >
                      Submit Another Ticket
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                  {submissionError && (
                    <div
                      role="alert"
                      className="p-3 text-xs bg-red-50 border border-red-200 text-danger rounded-md font-medium flex items-center justify-between gap-2"
                    >
                      <span>{submissionError}</span>
                      <button
                        type="button"
                        onClick={handleSubmit(onSubmit)}
                        className="inline-flex items-center gap-1 text-[11px] underline hover:no-underline font-semibold"
                      >
                        <RefreshCw className="w-3 h-3" /> Retry
                      </button>
                    </div>
                  )}

                  <Input
                    label="Full Name"
                    required
                    placeholder="e.g. Tariq Mehmood"
                    error={errors.name?.message}
                    {...register('name')}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Controller
                      name="phone"
                      control={control}
                      render={({ field }) => (
                        <PhoneInput
                          label="Pakistani Phone Number"
                          required
                          value={field.value}
                          onChange={(val) => field.onChange(val)}
                          error={errors.phone?.message}
                        />
                      )}
                    />

                    <Input
                      label="Email Address (Optional)"
                      type="email"
                      placeholder="name@domain.com"
                      error={errors.email?.message}
                      {...register('email')}
                    />
                  </div>

                  <Textarea
                    label="Detailed Inquiry / Message"
                    required
                    rows={4}
                    placeholder="Please specify your consignment tracking number or question (minimum 10 characters)..."
                    error={errors.message?.message}
                    {...register('message')}
                  />

                  {/* Cloudflare Turnstile Bot Protection Placeholder Box */}
                  <div className="p-3 bg-surface-muted border border-dashed border-ink-300 rounded-lg text-center select-none">
                    <div className="flex items-center justify-center gap-2 text-xs font-semibold text-ink-700">
                      <ShieldCheck className="w-4 h-4 text-brand-600" />
                      <span>Security Verification</span>
                    </div>
                    <p className="text-[11px] text-ink-500 mt-0.5">
                      Bot protection (Cloudflare Turnstile) will be enabled in production.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                    leftIcon={<Send className="w-4 h-4" />}
                  >
                    {isSubmitting ? 'Submitting Ticket...' : 'Submit Support Ticket'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
