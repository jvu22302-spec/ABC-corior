import { describe, it, expect } from 'vitest';
import { normalizePkPhone, validatePkPhone } from '../phone';

describe('Pakistan Phone Utility', () => {
  it('normalizes local 03xx mobile numbers with spaces and dashes to E.164 (+92)', () => {
    expect(normalizePkPhone('0300 1234567')).toBe('+923001234567');
    expect(normalizePkPhone('0321-7654321')).toBe('+923217654321');
    expect(normalizePkPhone('0345 (1234567)')).toBe('+923451234567');
    expect(normalizePkPhone('03001234567')).toBe('+923001234567');
  });

  it('handles existing country prefixes correctly', () => {
    expect(normalizePkPhone('+923001234567')).toBe('+923001234567');
    expect(normalizePkPhone('923001234567')).toBe('+923001234567');
    expect(normalizePkPhone('00923001234567')).toBe('+923001234567');
  });

  it('validates mobile numbers', () => {
    const validMobile = validatePkPhone('0300 1234567');
    expect(validMobile.isValid).toBe(true);
    expect(validMobile.normalized).toBe('+923001234567');
    expect(validMobile.type).toBe('mobile');
  });

  it('validates landline numbers', () => {
    const validLandline = validatePkPhone('021-34567890');
    expect(validLandline.isValid).toBe(true);
    expect(validLandline.type).toBe('landline');
  });

  it('rejects invalid or too short numbers with friendly errors', () => {
    const shortResult = validatePkPhone('0300 12');
    expect(shortResult.isValid).toBe(false);
    expect(shortResult.error).toBeDefined();

    const emptyResult = validatePkPhone('');
    expect(emptyResult.isValid).toBe(false);
  });
});
