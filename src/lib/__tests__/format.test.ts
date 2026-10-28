import { describe, it, expect } from 'vitest';
import { formatPKR, formatDateTime } from '../format';

describe('Format Utility', () => {
  it('formats PKR amounts with currency prefix and two decimal places', () => {
    expect(formatPKR(1500)).toBe('PKR 1,500.00');
    expect(formatPKR(0)).toBe('PKR 0.00');
    expect(formatPKR(250000.5)).toBe('PKR 250,000.50');
    expect(formatPKR(45.25)).toBe('PKR 45.25');
  });

  it('handles negative or null PKR values safely', () => {
    expect(formatPKR(-1200)).toBe('-PKR 1,200.00');
    expect(formatPKR(null)).toBe('PKR 0.00');
    expect(formatPKR(undefined)).toBe('PKR 0.00');
  });

  it('formats date and time in Asia/Karachi timezone', () => {
    // 2026-10-16T09:35:00Z -> Asia/Karachi is UTC+5 -> 2026-10-16 14:35 (02:35 PM)
    const utcDate = new Date('2026-10-16T09:35:00Z');
    const formatted = formatDateTime(utcDate);
    expect(formatted).toBe('16 Oct 2026, 02:35 PM');
  });

  it('handles empty or invalid dates gracefully', () => {
    expect(formatDateTime(null)).toBe('—');
    expect(formatDateTime('invalid-date')).toBe('Invalid Date');
  });
});
