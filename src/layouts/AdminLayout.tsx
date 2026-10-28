import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { m } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { DevRoleSwitcher } from '@/components/dev/DevRoleSwitcher';
import { PageTransition } from '@/motion/PageTransition';
import { useMotionPreference } from '@/motion/useMotionPreference';
import {
  LayoutDashboard,
  Package,
  CalendarCheck,
  Users,
  Store,
  Bike,
  Building2,
  MapPin,
  CircleDollarSign,
  Receipt,
  RotateCcw,
  BarChart3,
  Bell,
  Headset,
  Settings,
  ShieldCheck,
  History,
  Menu,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';

interface SidebarNavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  allowedRoles: string[];
}

const SIDEBAR_ITEMS: SidebarNavItem[] = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, allowedRoles: ['super_admin', 'ops_manager', 'branch_staff', 'finance'] },
  { to: '/admin/shipments', label: 'Shipments', icon: Package, allowedRoles: ['super_admin', 'ops_manager', 'branch_staff', 'finance'] },
  { to: '/admin/pickups', label: 'Pickups', icon: CalendarCheck, allowedRoles: ['super_admin', 'ops_manager', 'branch_staff'] },
  { to: '/admin/customers', label: 'Customers', icon: Users, allowedRoles: ['super_admin', 'ops_manager', 'branch_staff'] },
  { to: '/admin/merchants', label: 'Merchants', icon: Store, allowedRoles: ['super_admin', 'ops_manager', 'finance'] },
  { to: '/admin/riders-staff', label: 'Riders & Staff', icon: Bike, allowedRoles: ['super_admin', 'ops_manager', 'branch_staff'] },
  { to: '/admin/branches-hubs', label: 'Branches & Hubs', icon: Building2, allowedRoles: ['super_admin', 'ops_manager'] },
  { to: '/admin/cities-zones', label: 'Cities & Zones', icon: MapPin, allowedRoles: ['super_admin', 'ops_manager'] },
  { to: '/admin/rates', label: 'Shipping Rates', icon: CircleDollarSign, allowedRoles: ['super_admin', 'ops_manager', 'finance'] },
  { to: '/admin/finance', label: 'COD & Finance', icon: Receipt, allowedRoles: ['super_admin', 'finance', 'ops_manager'] },
  { to: '/admin/returns', label: 'Returns & Exceptions', icon: RotateCcw, allowedRoles: ['super_admin', 'ops_manager', 'branch_staff'] },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3, allowedRoles: ['super_admin', 'ops_manager', 'finance'] },
  { to: '/admin/notifications', label: 'Notifications', icon: Bell, allowedRoles: ['super_admin', 'ops_manager', 'branch_staff', 'finance'] },
  { to: '/admin/support', label: 'Support Tickets', icon: Headset, allowedRoles: ['super_admin', 'ops_manager', 'branch_staff'] },
  { to: '/admin/settings', label: 'Settings', icon: Settings, allowedRoles: ['super_admin'] },
  { to: '/admin/permissions', label: 'Users & Permissions', icon: ShieldCheck, allowedRoles: ['super_admin'] },
  { to: '/admin/audit-logs', label: 'Audit Logs', icon: History, allowedRoles: ['super_admin'] },
];

export function AdminLayout() {
  const { user, role, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { reduced } = useMotionPreference();

  // Collapsed sidebar state with UI preference in localStorage
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('abc_admin_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('abc_admin_sidebar_collapsed', String(next));
      } catch {
        // Ignore
      }
      return next;
    });
  };

  const visibleNavItems = SIDEBAR_ITEMS.filter(
    (item) => role && item.allowedRoles.includes(role)
  );

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-surface-muted text-ink-900">
      {/* Mobile Drawer Backdrop */}
      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 bg-ink-900/50 z-40 lg:hidden"
          onClick={() => setMobileDrawerOpen(false)}
        />
      )}

      {/* Sidebar: Mobile Drawer + Desktop Collapsible */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-surface border-r border-ink-200 transition-all duration-150 flex flex-col ${
          mobileDrawerOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-18' : 'lg:w-64'}`}
      >
        {/* Brand / Logo Area */}
        <div className="h-16 px-4 border-b border-ink-200 flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 bg-brand-600 text-white font-extrabold text-sm flex items-center justify-center rounded-lg shrink-0">
              ABC
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <span className="text-sm font-bold text-ink-900 truncate block leading-tight">
                  ABC Ops Portal
                </span>
                <span className="text-[10px] text-ink-400 font-mono block truncate">
                  Role: {role}
                </span>
              </div>
            )}
          </Link>

          {/* Close for mobile drawer */}
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(false)}
            className="lg:hidden p-1 text-ink-400 hover:text-ink-900 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isExact = item.to === '/admin';
            const isActive = isExact
              ? location.pathname === '/admin'
              : location.pathname.startsWith(item.to);

            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileDrawerOpen(false)}
                title={isCollapsed ? item.label : undefined}
                className={`relative flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors select-none ${
                  isActive
                    ? 'text-brand-700 font-semibold shadow-2xs'
                    : 'text-ink-600 hover:bg-surface-muted hover:text-ink-900'
                } ${isCollapsed ? 'justify-center' : ''}`}
              >
                {isActive && (
                  reduced ? (
                    <span className="absolute inset-0 bg-brand-50 rounded-md -z-10" />
                  ) : (
                    <m.span
                      layoutId="admin-nav-active-pill"
                      className="absolute inset-0 bg-brand-50 rounded-md -z-10"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    />
                  )
                )}
                <Icon className={`w-4 h-4 shrink-0 relative z-10 ${isActive ? 'text-brand-600' : 'text-ink-400'}`} />
                {!isCollapsed && <span className="truncate relative z-10">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer / Collapse Toggle */}
        <div className="p-3 border-t border-ink-200 hidden lg:flex items-center justify-between">
          <button
            type="button"
            onClick={toggleCollapse}
            className="w-full flex items-center justify-center gap-2 px-2 py-1.5 text-xs text-ink-500 hover:text-ink-900 hover:bg-surface-muted rounded-md transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse Sidebar</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-150 ${
          isCollapsed ? 'lg:pl-18' : 'lg:pl-64'
        }`}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-surface border-b border-ink-200 px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden p-2 text-ink-600 hover:text-ink-900 rounded-md"
              aria-label="Open sidebar navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Global Search Placeholder */}
            <div className="relative hidden sm:block w-64 md:w-80">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-ink-400" />
              <input
                type="text"
                placeholder="Search shipments, AWB, riders..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-surface-muted border border-ink-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-600 focus:bg-surface text-ink-900 placeholder:text-ink-400"
              />
            </div>
          </div>

          {/* Right Top Bar CTAs */}
          <div className="flex items-center gap-3">
            <DevRoleSwitcher />

            {/* Notifications Bell */}
            <button
              type="button"
              className="p-2 text-ink-500 hover:text-ink-900 hover:bg-surface-muted rounded-md relative"
              title="Notifications placeholder"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-600 rounded-full" />
            </button>

            {/* User Profile & Sign Out */}
            <div className="flex items-center gap-2 pl-2 border-l border-ink-200">
              <div className="hidden md:block text-right">
                <div className="text-xs font-semibold text-ink-900 leading-tight">
                  {user?.fullName}
                </div>
                <div className="text-[10px] text-ink-400 capitalize">
                  {user?.role.replace('_', ' ')}
                </div>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="p-2 text-ink-400 hover:text-danger rounded-md transition-colors"
                title="Sign out of Admin Portal"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Inner Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8" id="admin-main-content" tabIndex={-1}>
          <PageTransition preset="admin">
            <Outlet />
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
