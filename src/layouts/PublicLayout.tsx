import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { m, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { DevRoleSwitcher } from '@/components/dev/DevRoleSwitcher';
import { useAuth } from '@/hooks/useAuth';
import { useSettings } from '@/hooks/useSettings';
import { t } from '@/i18n';
import { validateTrackingNo } from '@/lib/tracking';
import { PageTransition } from '@/motion/PageTransition';
import { StaggerContainer, StaggerItem } from '@/motion/Stagger';
import { useMotionPreference } from '@/motion/useMotionPreference';
import { SPRING } from '@/motion/tokens';
import { cn } from '@/lib/cn';
import {
  Menu,
  X,
  Phone,
  Search,
  Box,
  ArrowRight,
  LogOut,
  User,
} from 'lucide-react';

export function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [headerAwb, setHeaderAwb] = useState('');
  const [headerAwbError, setHeaderAwbError] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [bottomBarVisible, setBottomBarVisible] = useState(true);

  const { user, role, signOut, isAuthenticated } = useAuth();
  const { data: settings } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const { reduced } = useMotionPreference();

  const lastScrollYRef = useRef(0);

  // Monitor scroll for header blur, top progress bar, and mobile bottom bar visibility
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 16);

      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress(Math.min(1, Math.max(0, currentScrollY / totalHeight)));
      }

      // Hide mobile bottom bar on scroll down, show on scroll up
      if (currentScrollY > lastScrollYRef.current + 8 && currentScrollY > 60) {
        setBottomBarVisible(false);
      } else if (currentScrollY < lastScrollYRef.current - 8 || currentScrollY <= 20) {
        setBottomBarVisible(true);
      }
      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/services', label: t('nav.services') },
    { to: '/track', label: t('nav.track') },
    { to: '/rates', label: t('nav.rates') },
    { to: '/coverage', label: t('nav.coverage') },
    { to: '/contact', label: t('nav.contact') },
  ];

  const getDashboardPath = () => {
    if (!role) return '/';
    if (['super_admin', 'ops_manager', 'branch_staff', 'finance'].includes(role)) return '/admin';
    if (role === 'rider') return '/rider';
    if (role === 'merchant') return '/merchant';
    return '/';
  };

  const handleQuickTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = headerAwb.trim().toUpperCase();
    const validation = validateTrackingNo(clean);

    if (!validation.isValid) {
      setHeaderAwbError(true);
      return;
    }

    setHeaderAwbError(false);
    setHeaderAwb('');
    navigate(`/track/${clean}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface text-ink-900 pb-20 md:pb-0">
      {/* Scroll Progress Bar at very top (scaleX transform, brand to accent) */}
      <div
        aria-hidden="true"
        className="fixed top-0 inset-x-0 h-[2.5px] z-50 origin-left bg-gradient-to-r from-brand-600 via-brand-500 to-accent-500 pointer-events-none transition-transform duration-75"
        style={{ transform: `scaleX(${scrollProgress})` }}
      />

      {/* Main Header with glass blur on scroll */}
      <header
        className={cn(
          'sticky top-0 z-30 transition-[background-color,backdrop-filter,box-shadow,border-color] duration-200',
          isScrolled
            ? 'bg-surface/95 backdrop-blur-md border-b border-ink-200/90 shadow-xs'
            : 'bg-surface/80 backdrop-blur-xs border-b border-transparent shadow-none'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo Wordmark with one-time intro */}
          <Link
            to="/"
            className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 rounded shrink-0 group"
            aria-label="ABC Home"
          >
            {reduced ? (
              <div className="w-9 h-9 bg-brand-600 text-white font-extrabold text-lg flex items-center justify-center rounded-lg shadow-xs tracking-wider">
                ABC
              </div>
            ) : (
              <m.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="w-9 h-9 bg-brand-600 text-white font-extrabold text-lg flex items-center justify-center rounded-lg shadow-xs tracking-wider"
              >
                ABC
              </m.div>
            )}
            <div className="hidden sm:block">
              <span className="text-base font-bold tracking-tight text-ink-900 block leading-tight">
                ABC
              </span>
              <span className="text-[10px] text-ink-600 font-medium tracking-wide block uppercase">
                Courier & Parcel Tracking
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links with animated underline and active layoutId */}
          <nav className="hidden xl:flex items-center gap-6" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    'relative py-1 text-sm font-medium transition-colors select-none',
                    'after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-brand-600 after:transition-all after:duration-200',
                    isActive ? 'text-brand-600 font-semibold' : 'text-ink-600 hover:text-ink-900'
                  )}
                >
                  <span>{link.label}</span>
                  {isActive && (
                    reduced ? (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-600 rounded-full" />
                    ) : (
                      <m.span
                        layoutId="public-nav-active-pill"
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-600 rounded-full"
                        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                      />
                    )
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Compact Header Quick-Tracking Input (Desktop >=1024px) */}
          <div className="hidden lg:block w-56 xl:w-64">
            <form onSubmit={handleQuickTrackSubmit} className="relative">
              <input
                type="text"
                value={headerAwb}
                onChange={(e) => {
                  setHeaderAwb(e.target.value);
                  if (headerAwbError) setHeaderAwbError(false);
                }}
                placeholder="Track AWB..."
                aria-label="Quick consignment tracking"
                className={`w-full pl-8 pr-16 py-1.5 text-xs bg-surface-muted border rounded-md focus:outline-none focus:ring-2 focus:bg-surface text-ink-900 placeholder:text-ink-400 transition-colors ${
                  headerAwbError
                    ? 'border-danger focus:ring-danger'
                    : 'border-ink-300 focus:ring-brand-600'
                }`}
              />
              <Search className="w-3.5 h-3.5 text-ink-400 absolute left-2.5 top-2.5 pointer-events-none" />
              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 px-2 text-[11px] font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 rounded transition-colors"
              >
                Track
              </button>
            </form>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5 shrink-0">
            <DevRoleSwitcher />

            {/* Book Now Button (Accent CTA) */}
            <Link to="/book" className="hidden sm:inline-flex">
              <Button variant="accent" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                {t('nav.bookNow')}
              </Button>
            </Link>

            {/* Auth Actions */}
            {isAuthenticated ? (
              <div className="flex items-center gap-1.5">
                <Link to={getDashboardPath()}>
                  <Button variant="secondary" size="sm" leftIcon={<User className="w-3.5 h-3.5" />}>
                    <span className="max-w-[80px] sm:max-w-[100px] truncate">
                      {user?.fullName.split(' ')[0]}
                    </span>
                  </Button>
                </Link>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="p-2 text-ink-400 hover:text-ink-900 rounded-md focus-visible:ring-2 focus-visible:ring-brand-600"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link to="/login">
                <Button variant="secondary" size="sm">
                  {t('nav.login')}
                </Button>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 text-ink-600 hover:text-ink-900 rounded-md focus-visible:ring-2 focus-visible:ring-brand-600"
              aria-label="Toggle Navigation Menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Drawer with staggered link reveal */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <m.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="xl:hidden border-b border-ink-200 bg-surface px-4 pt-3 pb-6 space-y-3 overflow-hidden shadow-md"
            >
              <StaggerContainer staggerDelay={0.04} delayChildren={0.02} className="flex flex-col space-y-1">
                {navLinks.map((link) => (
                  <StaggerItem key={link.to}>
                    <Link
                      to={link.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'block px-3 py-2 text-sm font-medium rounded-md transition-colors',
                        location.pathname === link.to
                          ? 'bg-brand-50 text-brand-700 font-semibold'
                          : 'text-ink-700 hover:bg-surface-muted'
                      )}
                    >
                      {link.label}
                    </Link>
                  </StaggerItem>
                ))}
              </StaggerContainer>
              <div className="pt-3 border-t border-ink-100 flex flex-col gap-2">
                <Link to="/book" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="accent" className="w-full">
                    {t('nav.bookNow')}
                  </Button>
                </Link>
                {!isAuthenticated && (
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="secondary" className="w-full">
                      {t('nav.login')}
                    </Button>
                  </Link>
                )}
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Page Content with PageTransition */}
      <main className="flex-1" id="main-content" tabIndex={-1}>
        <PageTransition preset="public">
          <Outlet />
        </PageTransition>
      </main>

      {/* Footer */}
      <footer className="bg-surface-muted border-t border-ink-200 mt-16 text-ink-600 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand column */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-brand-600 text-white font-bold text-sm flex items-center justify-center rounded">
                  ABC
                </div>
                <span className="font-bold text-ink-900 text-sm">ABC</span>
              </div>
              <p className="text-ink-600 leading-relaxed text-xs">
                {settings?.tagline || 'Courier logistics and COD management.'}
              </p>
              <div className="text-[11px] text-ink-400 font-mono">
                Currency: PKR · Timezone: Asia/Karachi
              </div>
            </div>

            {/* Services Links */}
            <div>
              <h4 className="text-xs font-semibold text-ink-900 uppercase tracking-wider mb-3">
                Courier Services
              </h4>
              <ul className="space-y-2">
                <li><Link to="/services" className="hover:text-brand-600">Standard Delivery</Link></li>
                <li><Link to="/services" className="hover:text-brand-600">Express Overnight</Link></li>
                <li><Link to="/rates" className="hover:text-brand-600">Rate Calculator</Link></li>
                <li><Link to="/book" className="hover:text-brand-600">Book a Parcel</Link></li>
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xs font-semibold text-ink-900 uppercase tracking-wider mb-3">
                Tracking & Support
              </h4>
              <ul className="space-y-2">
                <li><Link to="/track" className="hover:text-brand-600">Track Consignment</Link></li>
                <li><Link to="/coverage" className="hover:text-brand-600">Coverage & Hubs</Link></li>
                <li><Link to="/faq" className="hover:text-brand-600">FAQ</Link></li>
                <li><Link to="/contact" className="hover:text-brand-600">Contact Us</Link></li>
              </ul>
            </div>

            {/* Contact details from settings (SAMPLE) */}
            <div>
              <h4 className="text-xs font-semibold text-ink-900 uppercase tracking-wider mb-3">
                Sample Office Contact
              </h4>
              <div className="space-y-1.5 text-xs text-ink-600">
                <p>{settings?.headOfficeAddress}</p>
                <p className="font-semibold text-ink-900">UAN: {settings?.supportPhone}</p>
                <p>Email: {settings?.supportEmail}</p>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-ink-200/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-ink-400">
            <div>
              © 2026 ABC. {t('common.allRightsReserved')}
            </div>
            <div className="flex gap-4">
              <Link to="/terms" className="hover:text-ink-600">Terms of Service</Link>
              <Link to="/privacy" className="hover:text-ink-600">Privacy Policy</Link>
              <Link to="/about" className="hover:text-ink-600">About Company</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Sticky Bottom Action Bar on Mobile: Track | Book | Call */}
      {/* Slides up on first load and hides on scroll down, shows on scroll up */}
      <m.div
        initial={reduced ? { y: 0 } : { y: 60 }}
        animate={{ y: bottomBarVisible ? 0 : 80 }}
        transition={reduced ? { duration: 0.1 } : SPRING.snappy}
        className="fixed bottom-0 inset-x-0 bg-surface/95 backdrop-blur-md border-t border-ink-200 z-40 md:hidden flex items-center justify-around py-2 px-3 shadow-lg"
      >
        <Link
          to="/track"
          className="flex flex-col items-center justify-center flex-1 py-1 text-ink-600 hover:text-brand-600 active:text-brand-700 min-h-[44px]"
        >
          <Search className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] font-medium">Track</span>
        </Link>
        <Link
          to="/book"
          className="flex flex-col items-center justify-center flex-1 py-1 text-accent-600 font-semibold min-h-[44px]"
        >
          <Box className="w-4 h-4 mb-0.5" />
          <span className="text-[10px]">Book</span>
        </Link>
        <a
          href="tel:+9221111222333"
          className="flex flex-col items-center justify-center flex-1 py-1 text-ink-600 hover:text-brand-600 min-h-[44px]"
        >
          <Phone className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] font-medium">Call</span>
        </a>
      </m.div>
    </div>
  );
}
