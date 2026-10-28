import { describe, it, expect } from 'vitest';
import {
  senderStepSchema,
  recipientStepSchema,
  shipmentStepSchema,
  bookingDraftSchema,
  bookingToQuoteInput,
} from '../bookingSchema';
import { format, addDays, subDays } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { DEFAULT_TIMEZONE } from '@/config/constants';
import { DeliveryZone } from '@/types/domain';

describe('bookingSchema: senderStepSchema', () => {
  const validSender = {
    name: 'Muhammad Tariq',
    phone: '0300 1234567',
    email: 'tariq@example.pk',
    address: 'Plot 48, Street 5, Industrial Area, Korangi',
    cityId: 'city-khi',
    zoneId: 'zone-khi-1',
    instructions: 'Ring bell on arrival',
  };

  it('validates a complete and correct sender input', () => {
    const result = senderStepSchema.safeParse(validSender);
    expect(result.success).toBe(true);
  });

  it('fails when sender name is too short (< 2 chars) or too long (> 80 chars)', () => {
    expect(senderStepSchema.safeParse({ ...validSender, name: 'A' }).success).toBe(false);
    expect(senderStepSchema.safeParse({ ...validSender, name: 'A'.repeat(81) }).success).toBe(false);
  });

  it('fails when phone number is not a valid Pakistani format', () => {
    expect(senderStepSchema.safeParse({ ...validSender, phone: '12345' }).success).toBe(false);
    expect(senderStepSchema.safeParse({ ...validSender, phone: '01234567890' }).success).toBe(false);
  });

  it('fails when address is shorter than 10 characters', () => {
    expect(senderStepSchema.safeParse({ ...validSender, address: 'Karachi' }).success).toBe(false);
  });

  it('fails when city or zone is missing', () => {
    expect(senderStepSchema.safeParse({ ...validSender, cityId: '' }).success).toBe(false);
    expect(senderStepSchema.safeParse({ ...validSender, zoneId: '' }).success).toBe(false);
  });
});

describe('bookingSchema: recipientStepSchema', () => {
  const validRecipient = {
    name: 'Hamza Khan',
    phone: '0321 9876543',
    altPhone: '042 35789012',
    address: 'House 14-B, Sector Y, DHA Phase 3',
    cityId: 'city-lhe',
    zoneId: 'zone-lhe-2',
  };

  it('validates a complete and correct recipient input', () => {
    const result = recipientStepSchema.safeParse(validRecipient);
    expect(result.success).toBe(true);
  });

  it('accepts optional altPhone when valid Pakistani landline or mobile', () => {
    const withoutAlt = { ...validRecipient, altPhone: '' };
    expect(recipientStepSchema.safeParse(withoutAlt).success).toBe(true);
  });

  it('rejects invalid altPhone if provided', () => {
    const withInvalidAlt = { ...validRecipient, altPhone: '00112233' };
    expect(recipientStepSchema.safeParse(withInvalidAlt).success).toBe(false);
  });
});

describe('bookingSchema: shipmentStepSchema', () => {
  const karachiNow = toZonedTime(new Date(), DEFAULT_TIMEZONE);
  const todayStr = format(karachiNow, 'yyyy-MM-dd');
  const validShipment = {
    categoryId: 'cat-cloth',
    description: 'Cotton Stitched Kurta Suits',
    pieces: 2,
    weightKg: 2.5,
    serviceId: 'srv-std',
    pickupOption: 'pickup_from_address' as const,
    preferredPickupDate: todayStr,
    paymentMethod: 'prepaid' as const,
  };

  it('validates standard prepaid shipment with valid pickup date', () => {
    const result = shipmentStepSchema.safeParse(validShipment);
    expect(result.success).toBe(true);
  });

  it('fails when weight is 0 or negative or exceeds 70 kg', () => {
    expect(shipmentStepSchema.safeParse({ ...validShipment, weightKg: 0 }).success).toBe(false);
    expect(shipmentStepSchema.safeParse({ ...validShipment, weightKg: -1 }).success).toBe(false);
    expect(shipmentStepSchema.safeParse({ ...validShipment, weightKg: 70.5 }).success).toBe(false);
  });

  it('fails when pieces is not between 1 and 50', () => {
    expect(shipmentStepSchema.safeParse({ ...validShipment, pieces: 0 }).success).toBe(false);
    expect(shipmentStepSchema.safeParse({ ...validShipment, pieces: 51 }).success).toBe(false);
    expect(shipmentStepSchema.safeParse({ ...validShipment, pieces: 1.5 }).success).toBe(false);
  });

  it('enforces all-or-none dimensions rule', () => {
    // None provided: valid
    expect(shipmentStepSchema.safeParse(validShipment).success).toBe(true);

    // All provided and > 0: valid
    expect(
      shipmentStepSchema.safeParse({
        ...validShipment,
        dimensionsCm: { length: 20, width: 15, height: 10 },
      }).success
    ).toBe(true);

    // Partial dimensions (missing height): invalid
    expect(
      shipmentStepSchema.safeParse({
        ...validShipment,
        dimensionsCm: { length: 20, width: 15 },
      }).success
    ).toBe(false);

    // Zero dimension: invalid
    expect(
      shipmentStepSchema.safeParse({
        ...validShipment,
        dimensionsCm: { length: 20, width: 15, height: 0 },
      }).success
    ).toBe(false);
  });

  it('validates COD requirements: codAmount required, > 0 and <= 100,000', () => {
    const codShipment = {
      ...validShipment,
      paymentMethod: 'cod' as const,
      codAmount: 3500,
    };
    expect(shipmentStepSchema.safeParse(codShipment).success).toBe(true);

    // Missing codAmount for COD
    expect(
      shipmentStepSchema.safeParse({
        ...validShipment,
        paymentMethod: 'cod' as const,
      }).success
    ).toBe(false);

    // 0 codAmount
    expect(
      shipmentStepSchema.safeParse({
        ...validShipment,
        paymentMethod: 'cod' as const,
        codAmount: 0,
      }).success
    ).toBe(false);

    // Exceeds max limit (100,000)
    expect(
      shipmentStepSchema.safeParse({
        ...validShipment,
        paymentMethod: 'cod' as const,
        codAmount: 100001,
      }).success
    ).toBe(false);
  });

  it('validates preferredPickupDate in Asia/Karachi: today or within 14 days', () => {
    const yesterdayStr = format(subDays(karachiNow, 1), 'yyyy-MM-dd');
    const futureStr = format(addDays(karachiNow, 15), 'yyyy-MM-dd');
    const validFutureStr = format(addDays(karachiNow, 5), 'yyyy-MM-dd');

    // Past date fails
    expect(
      shipmentStepSchema.safeParse({
        ...validShipment,
        preferredPickupDate: yesterdayStr,
      }).success
    ).toBe(false);

    // Beyond 14 days fails
    expect(
      shipmentStepSchema.safeParse({
        ...validShipment,
        preferredPickupDate: futureStr,
      }).success
    ).toBe(false);

    // Within 14 days passes
    expect(
      shipmentStepSchema.safeParse({
        ...validShipment,
        preferredPickupDate: validFutureStr,
      }).success
    ).toBe(true);
  });
});

describe('bookingSchema: bookingDraftSchema combined', () => {
  it('validates a combined complete draft successfully', () => {
    const todayStr = format(toZonedTime(new Date(), DEFAULT_TIMEZONE), 'yyyy-MM-dd');
    const fullDraft = {
      sender: {
        name: 'Zainab Ahmed',
        phone: '0300 1234567',
        address: 'Sector F-8/2, Islamabad',
        cityId: 'city-isb',
        zoneId: 'zone-isb-1',
      },
      recipient: {
        name: 'Bilal Khan',
        phone: '0321 9876543',
        address: 'Gulberg III, Main Boulevard, Lahore',
        cityId: 'city-lhe',
        zoneId: 'zone-lhe-1',
      },
      shipment: {
        categoryId: 'cat-doc',
        description: 'Legal Tender Documents',
        pieces: 1,
        weightKg: 0.5,
        serviceId: 'srv-std',
        pickupOption: 'pickup_from_address' as const,
        preferredPickupDate: todayStr,
        paymentMethod: 'prepaid' as const,
      },
    };

    const parsed = bookingDraftSchema.safeParse(fullDraft);
    expect(parsed.success).toBe(true);
  });
});

describe('bookingSchema: bookingToQuoteInput helper', () => {
  const sampleZones: DeliveryZone[] = [
    { id: 'zone-1', cityId: 'city-lhe', code: 'Z1', name: 'DHA', branchId: 'b1', isActive: true, isRemote: false },
    { id: 'zone-remote', cityId: 'city-isb', code: 'ZR', name: 'Rural Area', branchId: 'b2', isActive: true, isRemote: true },
  ];

  it('converts complete booking draft into quote input', () => {
    const draft = {
      sender: {
        name: 'Sender',
        phone: '03001234567',
        address: 'Addr',
        cityId: 'city-khi',
        zoneId: 'z-khi',
      },
      recipient: {
        name: 'Recipient',
        phone: '03211234567',
        address: 'Addr',
        cityId: 'city-lhe',
        zoneId: 'zone-1',
      },
      shipment: {
        categoryId: 'cat-cloth',
        description: 'Clothes',
        pieces: 1,
        weightKg: 3.5,
        serviceId: 'srv-std',
        pickupOption: 'drop_at_branch' as const,
        paymentMethod: 'cod' as const,
        codAmount: 4500,
        dimensionsCm: { length: 20, width: 15, height: 10 },
      },
    };

    const quoteInput = bookingToQuoteInput(draft, sampleZones);
    expect(quoteInput).not.toBeNull();
    expect(quoteInput?.originCityId).toBe('city-khi');
    expect(quoteInput?.destinationCityId).toBe('city-lhe');
    expect(quoteInput?.serviceId).toBe('srv-std');
    expect(quoteInput?.weightKg).toBe(3.5);
    expect(quoteInput?.codAmountPkr).toBe(4500);
    expect(quoteInput?.lengthCm).toBe(20);
    expect(quoteInput?.widthCm).toBe(15);
    expect(quoteInput?.heightCm).toBe(10);
    expect(quoteInput?.isRemoteDestination).toBeFalsy();
  });

  it('sets isRemoteDestination when destination zone is remote', () => {
    const draft = {
      sender: { name: 'S', phone: '03001234567', address: 'A', cityId: 'city-khi', zoneId: 'z1' },
      recipient: { name: 'R', phone: '03211234567', address: 'A', cityId: 'city-isb', zoneId: 'zone-remote' },
      shipment: {
        categoryId: 'cat-cloth',
        description: 'Clothes',
        pieces: 1,
        weightKg: 2,
        serviceId: 'srv-std',
        pickupOption: 'drop_at_branch' as const,
        paymentMethod: 'prepaid' as const,
      },
    };

    const quoteInput = bookingToQuoteInput(draft, sampleZones);
    expect(quoteInput?.isRemoteDestination).toBe(true);
    // COD amount should be undefined for prepaid
    expect(quoteInput?.codAmountPkr).toBeUndefined();
  });

  it('returns null if essential pricing parameters are missing', () => {
    expect(bookingToQuoteInput({})).toBeNull();
    expect(
      bookingToQuoteInput({
        sender: { name: 'S', phone: '03001234567', address: 'A', cityId: 'city-khi', zoneId: 'z1' },
      })
    ).toBeNull();
  });
});
