/**
 * Application Constants
 * All sample values are explicitly marked SAMPLE.
 */

export const APP_NAME = 'ABC';
export const APP_LEGAL_NAME = 'ABC Courier Logistics (Pvt) Ltd.';
export const DEFAULT_CURRENCY = 'PKR';
export const DEFAULT_TIMEZONE = 'Asia/Karachi';
export const DEFAULT_TRACKING_PREFIX = 'ABC';

export const DEMO_PASSWORD = 'Demo@12345';

export const SAMPLE_CONTACT = {
  phone: '+92 21 111 222 333 (SAMPLE — replace)',
  email: 'support@abc-courier.sample.pk (SAMPLE — replace)',
  address: 'Plot 42, Korangi Industrial Area, Karachi, Pakistan (SAMPLE — replace)',
  uancNumber: '021-111-222-333 (SAMPLE — replace)',
  whatsapp: '+92 300 1234567 (SAMPLE — replace)',
};

export const DEMO_USERS = [
  { role: 'super_admin' as const, email: 'superadmin@abc.test', label: 'Super Admin', name: 'Zainab Ahmed' },
  { role: 'ops_manager' as const, email: 'ops@abc.test', label: 'Operations Manager', name: 'Bilal Khan' },
  { role: 'branch_staff' as const, email: 'branch@abc.test', label: 'Branch Staff', name: 'Hamza Tariq' },
  { role: 'rider' as const, email: 'rider@abc.test', label: 'Rider / Courier', name: 'Tariq Mehmood' },
  { role: 'finance' as const, email: 'finance@abc.test', label: 'Finance Officer', name: 'Ayesha Siddiqui' },
  { role: 'merchant' as const, email: 'merchant@abc.test', label: 'E-commerce Merchant', name: 'Kashif Trading Co.' },
  { role: 'customer' as const, email: 'customer@abc.test', label: 'Retail Customer', name: 'Maryam Raza' },
];
