/**
 * Formatting utilities for ABC — Courier & Parcel Tracking
 * Currency: PKR
 * Timezone: Asia/Karachi
 */

import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { DEFAULT_TIMEZONE } from '@/config/constants';

/**
 * Format currency in Pakistani Rupees (PKR)
 * Example: formatPKR(1500) -> "PKR 1,500.00"
 */
export function formatPKR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'PKR 0.00';
  }

  const parts = Math.abs(amount).toFixed(2).split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const formatted = `${integerPart}.${parts[1]}`;

  return amount < 0 ? `-PKR ${formatted}` : `PKR ${formatted}`;
}

/**
 * Format date & time into Pakistan Time (Asia/Karachi)
 * Example: "16 Oct 2026, 02:35 PM"
 */
export function formatDateTime(
  dateInput: Date | string | number | null | undefined,
  formatPattern = 'dd MMM yyyy, hh:mm a'
): string {
  if (!dateInput) return '—';

  try {
    const dateObj = typeof dateInput === 'string' || typeof dateInput === 'number'
      ? new Date(dateInput)
      : dateInput;

    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }

    const zonedDate = toZonedTime(dateObj, DEFAULT_TIMEZONE);
    return format(zonedDate, formatPattern);
  } catch {
    return 'Invalid Date';
  }
}

/**
 * Format date only (e.g. "16 Oct 2026")
 */
export function formatDateOnly(dateInput: Date | string | number | null | undefined): string {
  return formatDateTime(dateInput, 'dd MMM yyyy');
}

/**
 * Format time only (e.g. "02:35 PM")
 */
export function formatTimeOnly(dateInput: Date | string | number | null | undefined): string {
  return formatDateTime(dateInput, 'hh:mm a');
}
