import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/Spinner';

export function RequireAuth({ children }: { children?: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" className="text-brand-600" />
          <span className="text-xs text-ink-600 font-medium">Authenticating session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const nextPath = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${nextPath}`} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
