import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Home, Compass } from 'lucide-react';
import { t } from '@/i18n';

export function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xs">
          <Compass className="w-8 h-8" />
        </div>
        <div className="text-xs font-semibold text-brand-600 uppercase tracking-widest mb-2 font-mono">
          404 Error
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-ink-900 tracking-tight mb-2">
          {t('errors.pageNotFound')}
        </h1>
        <p className="text-sm text-ink-600 mb-8 leading-relaxed">
          {t('errors.pageNotFoundDesc')}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/">
            <Button variant="primary" leftIcon={<Home className="w-4 h-4" />}>
              {t('errors.returnHome')}
            </Button>
          </Link>
          <Link to="/track">
            <Button variant="secondary">
              {t('nav.track')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
