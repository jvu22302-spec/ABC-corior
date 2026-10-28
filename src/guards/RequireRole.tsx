import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AppRole } from '@/types/domain';
import { featureFlags } from '@/config/featureFlags';
import { ForbiddenPage } from '@/pages/errors/ForbiddenPage';
import { Spinner } from '@/components/ui/Spinner';

export interface RequireRoleProps {
  allowedRoles: AppRole[];
  children?: React.ReactNode;
}

export function RequireRole({ allowedRoles, children }: RequireRoleProps) {
  const { user, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Spinner size="lg" className="text-brand-600" />
      </div>
    );
  }

  if (!user || !role) {
    return <Navigate to="/login" replace />;
  }

  // Merchant feature flag check
  if (role === 'merchant' && !featureFlags.merchantPortal) {
    return <ForbiddenPage reason="Merchant portal is currently inactive under Phase F0 configuration." />;
  }

  if (!allowedRoles.includes(role)) {
    return <ForbiddenPage />;
  }

  return children ? <>{children}</> : <Outlet />;
}
