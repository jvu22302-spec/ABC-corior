import { describe, it, expect } from 'vitest';
import { generateTrackingNo, validateTrackingNo, verifyLuhn, calculateLuhnCheckDigit } from '../tracking';

describe('Tracking Number Utility', () => {
  it('calculates Luhn check digit accurately', () => {
    // Test payload with known Luhn check
    const payload = '2612345678';
    const checkDigit = calculateLuhnCheckDigit(payload);
    expect(checkDigit).toBeGreaterThanOrEqual(0);
    expect(checkDigit).toBeLessThanOrEqual(9);
    expect(verifyLuhn(`${payload}${checkDigit}`)).toBe(true);
  });

  it('generates a valid tracking number matching prefix and year', () => {
    const trackingNo = generateTrackingNo('ABC', 2026);
    expect(trackingNo.startsWith('ABC26')).toBe(true);
    expect(trackingNo.length).toBe(14); // ABC (3) + 26 (2) + 8 digits + 1 check digit = 14

    const validation = validateTrackingNo(trackingNo, 'ABC');
    expect(validation.isValid).toBe(true);
    expect(validation.prefix).toBe('ABC');
    expect(validation.year).toBe('26');
  });

  it('validates correct tracking numbers and catches altered check digits', () => {
    const trackingNo = generateTrackingNo('ABC', 2026);
    const validResult = validateTrackingNo(trackingNo);
    expect(validResult.isValid).toBe(true);

    // Corrupt the last digit
    const lastChar = trackingNo.slice(-1);
    const corruptedChar = lastChar === '9' ? '0' : String(Number(lastChar) + 1);
    const corrupted = trackingNo.slice(0, -1) + corruptedChar;

    const corruptedResult = validateTrackingNo(corrupted);
    expect(corruptedResult.isValid).toBe(false);
  });

  it('rejects improperly formatted tracking strings', () => {
    expect(validateTrackingNo('').isValid).toBe(false);
    expect(validateTrackingNo('ABC123').isValid).toBe(false);
    expect(validateTrackingNo('ABC2612345678X').isValid).toBe(false);
  });
});
