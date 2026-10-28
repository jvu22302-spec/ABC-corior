import React, { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Spinner } from '@/components/ui/Spinner';

// Guards
import { RequireAuth } from '@/guards/RequireAuth';
import { RequireRole } from '@/guards/RequireRole';

// Core Public Layout and Landing (Directly imported for instant home render)
import { PublicLayout } from '@/layouts/PublicLayout';
import { HomePage } from '@/pages/public/HomePage';

// Public Subpages (Code-split to keep initial public JS <= 250 KB gzipped)
const AboutPage = lazy(() => import('@/pages/public/AboutPage').then((m) => ({ default: m.AboutPage })));
const ServicesPage = lazy(() => import('@/pages/public/ServicesPage').then((m) => ({ default: m.ServicesPage })));
const BookParcelPage = lazy(() => import('@/pages/public/BookParcelPage').then((m) => ({ default: m.BookParcelPage })));
const TrackPage = lazy(() => import('@/pages/public/TrackPage').then((m) => ({ default: m.TrackPage })));
const RatesPage = lazy(() => import('@/pages/public/RatesPage').then((m) => ({ default: m.RatesPage })));
const CoveragePage = lazy(() => import('@/pages/public/CoveragePage').then((m) => ({ default: m.CoveragePage })));
const ContactPage = lazy(() => import('@/pages/public/ContactPage').then((m) => ({ default: m.ContactPage })));
const FaqPage = lazy(() => import('@/pages/public/FaqPage').then((m) => ({ default: m.FaqPage })));
const TermsPage = lazy(() => import('@/pages/public/TermsPage').then((m) => ({ default: m.TermsPage })));
const PrivacyPage = lazy(() => import('@/pages/public/PrivacyPage').then((m) => ({ default: m.PrivacyPage })));
const SupportPage = lazy(() => import('@/pages/public/SupportPage').then((m) => ({ default: m.SupportPage })));

// Auth Pages
const LoginPage = lazy(() => import('@/pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })));

// Error Pages
import { ForbiddenPage } from '@/pages/errors/ForbiddenPage';
const NotFoundPage = lazy(() => import('@/pages/errors/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

// Code-Split Portals
const AdminLayout = lazy(() => import('@/layouts/AdminLayout').then((m) => ({ default: m.AdminLayout })));
const RiderLayout = lazy(() => import('@/layouts/RiderLayout').then((m) => ({ default: m.RiderLayout })));
const MerchantLayout = lazy(() => import('@/layouts/MerchantLayout').then((m) => ({ default: m.MerchantLayout })));

const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })));
const ModulePlaceholderPage = lazy(() => import('@/pages/common/ModulePlaceholderPage').then((m) => ({ default: m.ModulePlaceholderPage })));
const RiderTasksPage = lazy(() => import('@/pages/rider/RiderTasksPage').then((m) => ({ default: m.RiderTasksPage })));
const RiderCashPage = lazy(() => import('@/pages/rider/RiderCashPage').then((m) => ({ default: m.RiderCashPage })));
const RiderProfilePage = lazy(() => import('@/pages/rider/RiderProfilePage').then((m) => ({ default: m.RiderProfilePage })));

function LazyRoute({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-[240px] flex items-center justify-center p-8">
          <Spinner size="md" className="text-brand-600" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<LazyRoute><AboutPage /></LazyRoute>} />
        <Route path="/services" element={<LazyRoute><ServicesPage /></LazyRoute>} />
        <Route path="/book" element={<LazyRoute><BookParcelPage /></LazyRoute>} />
        <Route path="/track" element={<LazyRoute><TrackPage /></LazyRoute>} />
        <Route path="/track/:trackingNo" element={<LazyRoute><TrackPage /></LazyRoute>} />
        <Route path="/rates" element={<LazyRoute><RatesPage /></LazyRoute>} />
        <Route path="/coverage" element={<LazyRoute><CoveragePage /></LazyRoute>} />
        <Route path="/contact" element={<LazyRoute><ContactPage /></LazyRoute>} />
        <Route path="/faq" element={<LazyRoute><FaqPage /></LazyRoute>} />
        <Route path="/terms" element={<LazyRoute><TermsPage /></LazyRoute>} />
        <Route path="/privacy" element={<LazyRoute><PrivacyPage /></LazyRoute>} />
        <Route path="/support" element={<LazyRoute><SupportPage /></LazyRoute>} />
        <Route path="/login" element={<LazyRoute><LoginPage /></LazyRoute>} />
        <Route path="/forgot-password" element={<LazyRoute><ForgotPasswordPage /></LazyRoute>} />
        <Route path="/reset-password" element={<LazyRoute><ResetPasswordPage /></LazyRoute>} />
        <Route path="/403" element={<ForbiddenPage />} />
      </Route>

      {/* Admin Portal (Guarded by super_admin, ops_manager, branch_staff, finance) */}
      <Route
        element={
          <RequireAuth>
            <RequireRole allowedRoles={['super_admin', 'ops_manager', 'branch_staff', 'finance']}>
              <LazyRoute>
                <AdminLayout />
              </LazyRoute>
            </RequireRole>
          </RequireAuth>
        }
      >
        <Route path="/admin" element={<LazyRoute><AdminDashboardPage /></LazyRoute>} />
        <Route
          path="/admin/shipments"
          element={<LazyRoute><ModulePlaceholderPage title="Consignment Shipments" moduleName="Shipments" /></LazyRoute>}
        />
        <Route
          path="/admin/pickups"
          element={<LazyRoute><ModulePlaceholderPage title="Pickup Schedule & Assign" moduleName="Pickups" /></LazyRoute>}
        />
        <Route
          path="/admin/customers"
          element={<LazyRoute><ModulePlaceholderPage title="Customer Accounts" moduleName="Customers" /></LazyRoute>}
        />
        <Route
          path="/admin/merchants"
          element={<LazyRoute><ModulePlaceholderPage title="E-Commerce Merchants" moduleName="Merchants" /></LazyRoute>}
        />
        <Route
          path="/admin/riders-staff"
          element={<LazyRoute><ModulePlaceholderPage title="Riders & Operations Staff" moduleName="Riders & Staff" /></LazyRoute>}
        />
        <Route
          path="/admin/branches-hubs"
          element={<LazyRoute><ModulePlaceholderPage title="Hubs & Distribution Centers" moduleName="Branches & Hubs" /></LazyRoute>}
        />
        <Route
          path="/admin/cities-zones"
          element={<LazyRoute><ModulePlaceholderPage title="Coverage Cities & Delivery Zones" moduleName="Cities & Zones" /></LazyRoute>}
        />
        <Route
          path="/admin/rates"
          element={<LazyRoute><ModulePlaceholderPage title="Tariff Rate Cards" moduleName="Shipping Rates" /></LazyRoute>}
        />
        <Route
          path="/admin/finance"
          element={<LazyRoute><ModulePlaceholderPage title="Cash on Delivery (COD) & Payouts" moduleName="COD & Finance" /></LazyRoute>}
        />
        <Route
          path="/admin/returns"
          element={<LazyRoute><ModulePlaceholderPage title="Returns & Exception Center" moduleName="Returns & Exceptions" /></LazyRoute>}
        />
        <Route
          path="/admin/reports"
          element={<LazyRoute><ModulePlaceholderPage title="Analytics & Operational Reports" moduleName="Reports" /></LazyRoute>}
        />
        <Route
          path="/admin/notifications"
          element={<LazyRoute><ModulePlaceholderPage title="Broadcasts & System Alerts" moduleName="Notifications" /></LazyRoute>}
        />
        <Route
          path="/admin/support"
          element={<LazyRoute><ModulePlaceholderPage title="Customer Support Tickets" moduleName="Support Tickets" /></LazyRoute>}
        />
        <Route
          path="/admin/settings"
          element={<LazyRoute><ModulePlaceholderPage title="System & Company Settings" moduleName="Settings" /></LazyRoute>}
        />
        <Route
          path="/admin/permissions"
          element={<LazyRoute><ModulePlaceholderPage title="Roles & Access Control" moduleName="Users & Permissions" /></LazyRoute>}
        />
        <Route
          path="/admin/audit-logs"
          element={<LazyRoute><ModulePlaceholderPage title="Audit Trail & Security Logs" moduleName="Audit Logs" /></LazyRoute>}
        />
      </Route>

      {/* Rider Portal (Mobile-First, Guarded by rider) */}
      <Route
        element={
          <RequireAuth>
            <RequireRole allowedRoles={['rider']}>
              <LazyRoute>
                <RiderLayout />
              </LazyRoute>
            </RequireRole>
          </RequireAuth>
        }
      >
        <Route path="/rider" element={<LazyRoute><RiderTasksPage /></LazyRoute>} />
        <Route path="/rider/cash" element={<LazyRoute><RiderCashPage /></LazyRoute>} />
        <Route path="/rider/profile" element={<LazyRoute><RiderProfilePage /></LazyRoute>} />
      </Route>

      {/* Merchant Portal (Guarded by merchant + feature flag) */}
      <Route
        element={
          <RequireAuth>
            <RequireRole allowedRoles={['merchant']}>
              <LazyRoute>
                <MerchantLayout />
              </LazyRoute>
            </RequireRole>
          </RequireAuth>
        }
      >
        <Route
          path="/merchant"
          element={<LazyRoute><ModulePlaceholderPage title="Merchant Portal" moduleName="Merchant Overview" /></LazyRoute>}
        />
        <Route
          path="/merchant/shipments"
          element={<LazyRoute><ModulePlaceholderPage title="Merchant Shipments" moduleName="Merchant Shipments" /></LazyRoute>}
        />
        <Route
          path="/merchant/pickups"
          element={<LazyRoute><ModulePlaceholderPage title="Bulk Pickup Requests" moduleName="Merchant Pickups" /></LazyRoute>}
        />
        <Route
          path="/merchant/cod"
          element={<LazyRoute><ModulePlaceholderPage title="COD Statements & Remittances" moduleName="COD & Payouts" /></LazyRoute>}
        />
        <Route
          path="/merchant/settings"
          element={<LazyRoute><ModulePlaceholderPage title="Merchant API Keys & Webhooks" moduleName="Merchant Settings" /></LazyRoute>}
        />
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<PublicLayout />}>
        <Route path="*" element={<LazyRoute><NotFoundPage /></LazyRoute>} />
      </Route>
    </Routes>
  );
}
