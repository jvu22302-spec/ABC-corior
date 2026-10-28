import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { DevRoleSwitcher } from '@/components/dev/DevRoleSwitcher';
import { t } from '@/i18n';
import { Bike, CheckSquare, Banknote, User, LogOut } from 'lucide-react';

import { PageTransition } from '@/motion/PageTransition';

export function RiderLayout() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const tabs = [
    { to: '/rider', label: t('nav.tasks'), icon: CheckSquare, exact: true },
    { to: '/rider/cash', label: t('nav.cash'), icon: Banknote, exact: false },
    { to: '/rider/profile', label: t('nav.profile'), icon: User, exact: false },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-surface-muted text-ink-900 pb-20">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 h-14 bg-surface border-b border-ink-200 px-4 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold">
            <Bike className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-ink-900 leading-tight">ABC Rider App</div>
            <div className="text-[10px] text-ink-600 font-medium">{user?.fullName}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DevRoleSwitcher />
          <button
            type="button"
            onClick={handleSignOut}
            className="p-2 text-ink-500 hover:text-danger rounded-md min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-[0.97] transition-transform"
            title="Sign Out"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 max-w-lg mx-auto w-full" id="rider-main-content" tabIndex={-1}>
        <PageTransition preset="rider">
          <Outlet />
        </PageTransition>
      </main>

      {/* Bottom Large Touch Target Navigation */}
      <nav
        role="navigation"
        aria-label="Rider navigation tabs"
        className="fixed bottom-0 inset-x-0 h-16 bg-surface border-t border-ink-200 z-40 flex items-center justify-around px-2 shadow-lg max-w-lg mx-auto"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.exact
            ? location.pathname === tab.to
            : location.pathname.startsWith(tab.to);

          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] active:scale-[0.98] transition-all select-none ${
                isActive
                  ? 'text-brand-600 font-bold'
                  : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-brand-600 stroke-[2.5]' : ''}`} />
              <span className="text-xs">{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
