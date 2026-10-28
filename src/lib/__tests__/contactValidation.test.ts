import { describe, it, expect } from 'vitest';
import { validatePkPhone } from '@/lib/phone';
import { z } from 'zod';

const contactValidationSchema = z.object({
  name: z.string().min(1, 'Full name is required').max(100),
  phone: z.string().min(1, 'Phone number is required').refine((val) => validatePkPhone(val).isValid, {
    message: 'Invalid Pakistani phone number',
  }),
  email: z.string().email('Invalid email').or(z.literal('')).optional(),
  message: z.string().min(10, 'Message must be at least 10 characters long').max(2000),
});

describe('Contact Form Validation', () => {
  it('passes on valid contact data with Pakistani mobile', () => {
    const valid = contactValidationSchema.safeParse({
      name: 'Bilal Khan',
      phone: '0300 1234567',
      email: 'bilal@example.com',
      message: 'Need rates for 50 daily COD consignments from Lahore.',
    });
    expect(valid.success).toBe(true);
  });

  it('passes on valid contact data with Pakistani landline', () => {
    const valid = contactValidationSchema.safeParse({
      name: 'Karachi Office',
      phone: '021-35001122',
      email: '',
      message: 'Inquiry regarding shipment drop-off timings at Korangi hub.',
    });
    expect(valid.success).toBe(true);
  });

  it('rejects invalid or too short phone numbers', () => {
    const invalidPhone = contactValidationSchema.safeParse({
      name: 'Ali Raza',
      phone: '12345',
      message: 'This is a test message of sufficient length.',
    });
    expect(invalidPhone.success).toBe(false);
  });

  it('rejects messages shorter than 10 characters', () => {
    const shortMessage = contactValidationSchema.safeParse({
      name: 'Ali Raza',
      phone: '0300 1234567',
      message: 'Too short',
    });
    expect(shortMessage.success).toBe(false);
    if (!shortMessage.success) {
      expect(shortMessage.error.issues[0].message).toContain('at least 10 characters');
    }
  });

  it('rejects missing or empty name', () => {
    const emptyName = contactValidationSchema.safeParse({
      name: '',
      phone: '0300 1234567',
      message: 'Valid message content length testing.',
    });
    expect(emptyName.success).toBe(false);
  });
});
