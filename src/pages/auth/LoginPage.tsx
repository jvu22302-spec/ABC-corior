import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { Card } from '@/components/ui/Card';
import { DEMO_USERS, DEMO_PASSWORD } from '@/config/constants';
import { env } from '@/config/env';
import { t } from '@/i18n';
import { ShieldAlert, ArrowRight, Lock, Mail, UserCheck } from 'lucide-react';
import { AppError } from '@/lib/errors';
import { featureFlags } from '@/config/featureFlags';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { signIn } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formError, setFormError] = useState<string | null>(null);

  const nextUrl = searchParams.get('next');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setFormError(null);
    try {
      const profile = await signIn({
        email: data.email,
        password: data.password,
      });

      toast.success(`Welcome back, ${profile.fullName}!`);

      if (nextUrl) {
        navigate(decodeURIComponent(nextUrl));
        return;
      }

      // Default role redirect
      if (['super_admin', 'ops_manager', 'branch_staff', 'finance'].includes(profile.role)) {
        navigate('/admin');
      } else if (profile.role === 'rider') {
        navigate('/rider');
      } else if (profile.role === 'merchant') {
        navigate(featureFlags.merchantPortal ? '/merchant' : '/');
      } else {
        navigate('/');
      }
    } catch (err: unknown) {
      if (err instanceof AppError) {
        setFormError(err.message);
      } else if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError('Authentication failed. Please verify your credentials.');
      }
    }
  };

  const handleSelectDemoUser = (email: string) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', DEMO_PASSWORD, { shouldValidate: true });
    setFormError(null);
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <div className="w-12 h-12 bg-brand-600 text-white font-extrabold text-xl flex items-center justify-center rounded-xl mx-auto shadow-xs mb-3">
            ABC
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">
            {t('auth.loginTitle')}
          </h1>
          <p className="text-xs text-ink-600 mt-1">{t('auth.loginSubtitle')}</p>
        </div>

        {/* Dev / Demo Login Note */}
        {env.VITE_APP_ENV !== 'production' && (
          <div className="p-4 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 text-xs">
            <div className="font-bold flex items-center gap-1.5 mb-1.5 text-amber-950">
              <ShieldAlert className="w-4 h-4 text-amber-700" />
              <span>{t('auth.demoTitle')}</span>
            </div>
            <p className="text-amber-800 mb-2 leading-relaxed">{t('auth.demoHint')}</p>
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {DEMO_USERS.map((u) => (
                <button
                  key={u.role}
                  type="button"
                  onClick={() => handleSelectDemoUser(u.email)}
                  className="px-2 py-1.5 bg-white border border-amber-200 rounded text-left hover:border-brand-500 hover:bg-brand-50 transition-colors flex items-center justify-between"
                >
                  <div className="truncate">
                    <span className="font-semibold block truncate text-[11px] text-ink-900">
                      {u.label}
                    </span>
                    <span className="text-[10px] text-ink-400 block font-mono truncate">
                      {u.email}
                    </span>
                  </div>
                  <UserCheck className="w-3.5 h-3.5 text-ink-400 shrink-0 ml-1" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Login Form Card */}
        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {formError && (
              <div
                role="alert"
                className="p-3 text-xs bg-red-50 border border-red-200 text-danger rounded-md font-medium"
              >
                {formError}
              </div>
            )}

            <Input
              label={t('auth.email')}
              type="email"
              placeholder={t('auth.emailPlaceholder')}
              autoComplete="email"
              leftAddon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <div>
              <Input
                label={t('auth.password')}
                type="password"
                placeholder={t('auth.passwordPlaceholder')}
                autoComplete="current-password"
                leftAddon={<Lock className="w-4 h-4" />}
                error={errors.password?.message}
                {...register('password')}
              />
              <div className="flex justify-end mt-1">
                <Link
                  to="/forgot-password"
                  className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                >
                  {t('auth.forgotPassword')}
                </Link>
              </div>
            </div>

            <div className="pt-1">
              <Checkbox
                label={t('auth.rememberMe')}
                {...register('rememberMe')}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {t('auth.signInBtn')}
            </Button>
          </form>
        </Card>

        <div className="text-center text-xs text-ink-500">
          <Link to="/" className="hover:text-ink-900">
            ← Return to ABC Courier Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
