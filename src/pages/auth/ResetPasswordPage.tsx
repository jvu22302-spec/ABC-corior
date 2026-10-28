import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useSearchParams } from 'react-router-dom';
import { authService } from '@/services';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { t } from '@/i18n';
import { Lock, CheckCircle2, ArrowRight } from 'lucide-react';

const resetSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetFormData = z.infer<typeof resetSchema>;

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || 'demo-token';
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetFormData) => {
    setErrorMessage(null);
    try {
      await authService.resetPassword(token, data.password);
      setSuccess(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Unable to update password. Please request a new link.');
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-brand-50 text-brand-600 font-bold text-xl flex items-center justify-center rounded-xl mx-auto shadow-xs mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">
            {t('auth.resetNewPasswordTitle')}
          </h1>
          <p className="text-xs text-ink-600 mt-1">
            Choose a secure password for your account
          </p>
        </div>

        <Card>
          {success ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-10 h-10 rounded-full bg-green-100 text-success flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-ink-900">Password Updated</h3>
              <p className="text-xs text-ink-600 leading-relaxed">
                {t('auth.passwordUpdated')}
              </p>
              <div className="pt-2">
                <Link to="/login">
                  <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Proceed to Sign In
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {errorMessage && (
                <div className="p-3 text-xs bg-red-50 border border-red-200 text-danger rounded-md">
                  {errorMessage}
                </div>
              )}

              <Input
                label={t('auth.newPassword')}
                type="password"
                leftAddon={<Lock className="w-4 h-4" />}
                placeholder="••••••••••••"
                error={errors.password?.message}
                {...register('password')}
              />

              <Input
                label={t('auth.confirmPassword')}
                type="password"
                leftAddon={<Lock className="w-4 h-4" />}
                placeholder="••••••••••••"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={isSubmitting}
              >
                {t('auth.updatePasswordBtn')}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
