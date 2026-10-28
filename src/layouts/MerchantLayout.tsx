import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { featureFlags } from '@/config/featureFlags';
import { DevRoleSwitcher } from '@/components/dev/DevRoleSwitcher';
import { ForbiddenPage } from '@/pages/errors/ForbiddenPage';
import { Store, LayoutDashboard, Package, CalendarCheck, CircleDollarSign, Settings, LogOut } from 'lucide-react';
import { PageTransition } from '@/motion/PageTransition';

export function MerchantLayout() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // If merchant portal feature flag is off, hide whole area
  if (!featureFlags.merchantPortal) {
    return (
      <div className="p-8">
        <ForbiddenPage reason="Merchant Portal is currently disabled by configuration (featureFlags.merchantPortal = false)." />
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { to: '/merchant', label: 'Overview', icon: LayoutDashboard, exact: true },
    { to: '/merchant/shipments', label: 'Shipments', icon: Package, exact: false },
    { to: '/merchant/pickups', label: 'Book Pickups', icon: CalendarCheck, exact: false },
    { to: '/merchant/cod', label: 'COD & Payouts', icon: CircleDollarSign, exact: false },
    { to: '/merchant/settings', label: 'Account & API', icon: Settings, exact: false },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-surface-muted text-ink-900">
      <header className="sticky top-0 z-30 h-16 bg-surface border-b border-ink-200 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold">
            <Store className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-bold text-ink-900 leading-tight">ABC Merchant Portal</div>
            <div className="text-xs text-ink-600">{user?.fullName}</div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <DevRoleSwitcher />
          <button
            type="button"
            onClick={handleSignOut}
            className="p-2 text-ink-500 hover:text-danger rounded-md text-xs flex items-center gap-1.5"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      <div className="border-b border-ink-200 bg-surface px-4 sm:px-8">
        <nav className="flex items-center gap-6 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap -mb-[1px] ${
                  isActive
                    ? 'border-brand-600 text-brand-600 font-semibold'
                    : 'border-transparent text-ink-600 hover:text-ink-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full" id="merchant-main-content" tabIndex={-1}>
        <PageTransition preset="admin">
          <Outlet />
        </PageTransition>
      </main>
    </div>
  );
}
