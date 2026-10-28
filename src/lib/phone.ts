/**
 * Pakistan Phone Number Handling & Normalization
 * Supports standard Pakistani mobile numbers (03XX-XXXXXXX) and landlines (0[2-9]X-XXXXXXX).
 */

export interface PhoneValidationResult {
  isValid: boolean;
  normalized?: string;
  type?: 'mobile' | 'landline';
  error?: string;
}

/**
 * Strips formatting (spaces, hyphens, parentheses) and converts to E.164 (+92...) format
 * Example: normalizePkPhone("0300 1234567") -> "+923001234567"
 */
export function normalizePkPhone(rawPhone: string): string {
  if (!rawPhone) return '';

  // Remove whitespace, dashes, brackets, dots
  let cleaned = rawPhone.trim().replace(/[\s\-\(\)\.]+/g, '');

  if (cleaned.startsWith('0092')) {
    cleaned = '+' + cleaned.slice(2);
  } else if (cleaned.startsWith('92') && !cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  } else if (cleaned.startsWith('0')) {
    cleaned = '+92' + cleaned.slice(1);
  } else if (!cleaned.startsWith('+')) {
    // If entered without prefix e.g. 3001234567
    if (cleaned.length === 10 && cleaned.startsWith('3')) {
      cleaned = '+92' + cleaned;
    }
  }

  return cleaned;
}

/**
 * Validates a Pakistani mobile or landline phone number and returns a friendly error message
 */
export function validatePkPhone(phone: string): PhoneValidationResult {
  if (!phone || !phone.trim()) {
    return {
      isValid: false,
      error: 'Phone number is required',
    };
  }

  const normalized = normalizePkPhone(phone);

  // Check mobile format: +92 followed by 3 and 9 digits (total 13 chars)
  // e.g. +923001234567
  const mobileRegex = /^\+92(3[0-9]{2})[0-9]{7}$/;
  if (mobileRegex.test(normalized)) {
    return {
      isValid: true,
      normalized,
      type: 'mobile',
    };
  }

  // Check landline format: +92 followed by area code [2-9]XX and 6-8 digits
  // Total digits after +92 should be 9-10 digits, starting with 2-9
  const landlineRegex = /^\+92([2-9][0-9]{1,2})[0-9]{6,8}$/;
  if (landlineRegex.test(normalized)) {
    return {
      isValid: true,
      normalized,
      type: 'landline',
    };
  }

  // Determine specific helpful guidance
  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.length < 10) {
    return {
      isValid: false,
      error: 'Phone number is too short. Please enter a valid 11-digit number (e.g., 0300 1234567).',
    };
  }
  if (digitsOnly.length > 13) {
    return {
      isValid: false,
      error: 'Phone number contains too many digits.',
    };
  }

  return {
    isValid: false,
    error: 'Please enter a valid Pakistani number (e.g. mobile 0300-1234567 or landline 021-34567890).',
  };
}

/**
 * Formats a Pakistani phone number for display (e.g. "+92 300 1234567" or "0300 1234567")
 */
export function formatPkPhoneDisplay(phone: string, withCountryCode = true): string {
  const normalized = normalizePkPhone(phone);
  if (!normalized.startsWith('+92')) return phone;

  const localDigits = normalized.slice(3); // e.g. 3001234567
  if (localDigits.length === 10 && localDigits.startsWith('3')) {
    // Mobile format
    const prefix = localDigits.slice(0, 3);
    const rest = localDigits.slice(3);
    return withCountryCode ? `+92 ${prefix} ${rest}` : `0${prefix} ${rest}`;
  }

  return normalized;
}
