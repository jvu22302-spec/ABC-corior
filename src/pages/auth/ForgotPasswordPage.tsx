import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { authService } from '@/services';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { t } from '@/i18n';
import { Mail, CheckCircle2, ArrowLeft } from 'lucide-react';

const forgotSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotFormData) => {
    try {
      await authService.requestPasswordReset(data.email);
    } finally {
      // Always show generic message to avoid email enumeration
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-brand-50 text-brand-600 font-bold text-xl flex items-center justify-center rounded-xl mx-auto shadow-xs mb-3">
            <Mail className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">
            {t('auth.resetTitle')}
          </h1>
          <p className="text-xs text-ink-600 mt-1">{t('auth.resetSubtitle')}</p>
        </div>

        <Card>
          {submitted ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-10 h-10 rounded-full bg-green-100 text-success flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-ink-900">Request Dispatched</h3>
              <p className="text-xs text-ink-600 leading-relaxed">
                {t('auth.resetSentGeneric')}
              </p>
              <div className="pt-2">
                <Link to="/login">
                  <Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                    {t('auth.backToLogin')}
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label={t('auth.email')}
                type="email"
                placeholder={t('auth.emailPlaceholder')}
                autoComplete="email"
                leftAddon={<Mail className="w-4 h-4" />}
                error={errors.email?.message}
                {...register('email')}
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={isSubmitting}
              >
                {t('auth.resetBtn')}
              </Button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="text-xs text-ink-600 hover:text-ink-900 inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{t('auth.backToLogin')}</span>
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
