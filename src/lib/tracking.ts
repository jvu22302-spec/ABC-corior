/**
 * Tracking Number Generation and Validation
 * Specification: prefix + 2-digit year + 8 random digits + 1 Luhn check digit
 * Example: ABC2612345678X (where X is 0-9)
 */

import { DEFAULT_TRACKING_PREFIX } from '@/config/constants';
import { ShipmentStatus } from '@/types/domain';

/**
 * Calculates a Luhn check digit for a string of numeric digits.
 * The resulting digit makes the full number (digits + checkDigit) pass standard Luhn check.
 */
export function calculateLuhnCheckDigit(numericPayload: string): number {
  let sum = 0;
  // Starting from rightmost digit of payload (which will be index 1 in the final number with check digit attached)
  for (let i = numericPayload.length - 1, count = 0; i >= 0; i--, count++) {
    let digit = parseInt(numericPayload.charAt(i), 10);
    if (isNaN(digit)) return -1;

    // Alternating digits starting with the first one to the left of the check digit
    if (count % 2 === 0) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
  }

  const remainder = sum % 10;
  return remainder === 0 ? 0 : 10 - remainder;
}

/**
 * Validates a numeric string against the Luhn algorithm.
 */
export function verifyLuhn(numericString: string): boolean {
  if (!numericString || !/^\d+$/.test(numericString)) return false;

  let sum = 0;
  let double = false;
  for (let i = numericString.length - 1; i >= 0; i--) {
    let digit = parseInt(numericString.charAt(i), 10);
    if (double) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
    double = !double;
  }

  return sum % 10 === 0;
}

/**
 * Generates a valid tracking number with prefix, current 2-digit year, 8 random digits, and 1 Luhn check digit.
 * Format: ABC26XXXXXXXXC (Total: prefix length + 11 characters)
 */
export function generateTrackingNo(prefix = DEFAULT_TRACKING_PREFIX, year?: number): string {
  const cleanPrefix = (prefix || DEFAULT_TRACKING_PREFIX).toUpperCase().trim();
  const currentYear = year !== undefined ? year : new Date().getFullYear();
  const year2Digit = String(currentYear).slice(-2);

  // Generate 8 random digits
  let random8 = '';
  for (let i = 0; i < 8; i++) {
    random8 += Math.floor(Math.random() * 10).toString();
  }

  const payload = `${year2Digit}${random8}`;
  const checkDigit = calculateLuhnCheckDigit(payload);

  return `${cleanPrefix}${payload}${checkDigit}`;
}

export interface TrackingValidationResult {
  isValid: boolean;
  prefix?: string;
  year?: string;
  serial?: string;
  checkDigit?: number;
  error?: string;
}

/**
 * Validates tracking number format and Luhn check digit
 */
export function validateTrackingNo(
  trackingNo: string,
  expectedPrefix?: string
): TrackingValidationResult {
  if (!trackingNo || typeof trackingNo !== 'string') {
    return { isValid: false, error: 'Tracking number is required' };
  }

  const cleaned = trackingNo.trim().toUpperCase();

  // Pattern: 2-5 uppercase letters followed by 11 digits (2-year + 8-serial + 1-check)
  const match = cleaned.match(/^([A-Z]{2,5})(\d{2})(\d{8})(\d{1})$/);
  if (!match) {
    return {
      isValid: false,
      error: 'Invalid tracking number format. Expected format: ABC26XXXXXXXXX (prefix + 11 digits).',
    };
  }

  const [, prefix, year, serial, checkDigitStr] = match;

  if (expectedPrefix && prefix !== expectedPrefix.toUpperCase()) {
    return {
      isValid: false,
      error: `Tracking number must start with prefix "${expectedPrefix.toUpperCase()}".`,
    };
  }

  const numericPart = `${year}${serial}${checkDigitStr}`;
  if (!verifyLuhn(numericPart)) {
    return {
      isValid: false,
      error: 'Invalid tracking number check digit. Please verify the number.',
    };
  }

  return {
    isValid: true,
    prefix,
    year,
    serial,
    checkDigit: parseInt(checkDigitStr, 10),
  };
}

export const PUBLIC_STATUS_LABELS: Record<ShipmentStatus, string> = {
  booking_created: 'Booking received',
  pickup_scheduled: 'Pickup scheduled',
  pickup_assigned: 'Pickup scheduled',
  picked_up: 'Picked up',
  received_at_origin: 'At origin facility',
  in_transit: 'In transit',
  received_at_destination: 'At destination facility',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  delivery_attempted: 'Delivery attempted',
  delivery_failed: 'Delivery unsuccessful',
  on_hold: 'On hold',
  return_initiated: 'Return in progress',
  returning_to_origin: 'Returning to sender',
  returned_to_sender: 'Returned to sender',
  cancelled: 'Cancelled',
  lost: 'Under investigation',
};

/**
 * Returns user-friendly public status label according to ABC tracking specification.
 */
export function getPublicStatusLabel(status: ShipmentStatus): string {
  return PUBLIC_STATUS_LABELS[status] || status;
}

