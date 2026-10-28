import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { ShieldX, Home, ArrowLeft } from 'lucide-react';
import { t } from '@/i18n';
import { useAuth } from '@/hooks/useAuth';

export interface ForbiddenPageProps {
  reason?: string;
}

export function ForbiddenPage({ reason }: ForbiddenPageProps) {
  const { user, role } = useAuth();

  const getDashboardLink = () => {
    if (!role) return '/';
    if (['super_admin', 'ops_manager', 'branch_staff', 'finance'].includes(role)) return '/admin';
    if (role === 'rider') return '/rider';
    if (role === 'merchant') return '/merchant';
    return '/';
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-50 text-danger rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xs">
          <ShieldX className="w-8 h-8" />
        </div>
        <div className="text-xs font-semibold text-danger uppercase tracking-widest mb-2 font-mono">
          403 Forbidden
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-ink-900 tracking-tight mb-2">
          {t('errors.forbidden')}
        </h1>
        <p className="text-sm text-ink-600 mb-2 leading-relaxed">
          {reason || t('errors.forbiddenDesc')}
        </p>
        {user && (
          <p className="text-xs text-ink-400 font-mono mb-8">
            Signed in as: <span className="font-semibold text-ink-700">{user.email}</span> ({role})
          </p>
        )}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to={getDashboardLink()}>
            <Button variant="primary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              {t('errors.goToDashboard')}
            </Button>
          </Link>
          <Link to="/">
            <Button variant="secondary" leftIcon={<Home className="w-4 h-4" />}>
              {t('errors.returnHome')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
