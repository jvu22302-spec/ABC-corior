import { describe, it, expect, beforeEach } from 'vitest';
import { MockTrackingService, DEMO_TRACKING_NUMBERS } from '../tracking.mock';
import { RateLimitedError } from '../../contracts/tracking.contract';
import { getPublicStatusLabel, PUBLIC_STATUS_LABELS, calculateLuhnCheckDigit } from '@/lib/tracking';
import { STATUS_TRANSITIONS, ShipmentStatus } from '@/types/domain';

describe('Tracking Service & Public Tracking Tests', () => {
  let service: MockTrackingService;

  beforeEach(() => {
    service = new MockTrackingService();
    service.resetRateLimit();
  });

  // TEST 1: Privacy Test
  it('strictly protects privacy and never leaks internal/sensitive data in public projections', async () => {
    for (const demo of DEMO_TRACKING_NUMBERS) {
      service.resetRateLimit();
      const tracking = await service.track(demo.no);
      expect(tracking).not.toBeNull();
      if (!tracking) continue;

      const serialized = JSON.stringify(tracking).toLowerCase();

      // Must not contain phone numbers (03xx...)
      expect(serialized).not.toMatch(/03\d{2}[-\s]?\d{7}/);
      expect(serialized).not.toMatch(/03\d{9}/);

      // Must not contain forbidden keywords
      expect(serialized).not.toContain('"cod"');
      expect(serialized).not.toContain('cod');
      expect(serialized).not.toContain('charge');
      expect(serialized).not.toContain('rider');
      expect(serialized).not.toContain('note');
      expect(serialized).not.toContain('address');

      // If recipient display name exists, it must be in "First L." format
      if (tracking.recipientDisplayName) {
        expect(tracking.recipientDisplayName).toMatch(/^[A-Za-z]+(\s[A-Z]\.)?$/);
      }

      // Assert no riderId or internalNote on events
      for (const event of tracking.events) {
        expect((event as unknown as { riderId?: string }).riderId).toBeUndefined();
        expect((event as unknown as { riderName?: string }).riderName).toBeUndefined();
        expect((event as unknown as { internalNote?: string }).internalNote).toBeUndefined();
      }
    }
  });

  // TEST 2: Not-Found Equality Test
  it('returns null identically for malformed, bad-check-digit, and unknown-valid inputs', async () => {
    // Malformed inputs
    expect(await service.track('')).toBeNull();
    expect(await service.track('MALFORMED')).toBeNull();
    expect(await service.track('12345')).toBeNull();
    expect(await service.track('ABC')).toBeNull();

    // Bad check digit
    // ABC26100000012 has check digit 2; let's alter to 5
    expect(await service.track('ABC26100000015')).toBeNull();

    // Unknown valid Luhn number
    const payload = '2699999999';
    const validCheck = calculateLuhnCheckDigit(payload);
    const validUnknownAwb = `ABC${payload}${validCheck}`;
    expect(await service.track(validUnknownAwb)).toBeNull();
  });

  // TEST 3: Rate-Limit Test
  it('allows up to 30 lookups per minute and throws RateLimitedError on the 31st attempt', async () => {
    service.resetRateLimit();

    // First 30 lookups should succeed (or return null without rate limit error)
    for (let i = 0; i < 30; i++) {
      await expect(service.track('ABC26100000012', true)).resolves.toBeDefined();
    }

    // 31st lookup must throw RateLimitedError
    await expect(service.track('ABC26100000012', true)).rejects.toThrow(RateLimitedError);
  });

  // TEST 4: Status Label Mapping Test
  it('covers all 17 shipment statuses with exact public label mappings', () => {
    const all17Statuses: ShipmentStatus[] = [
      'booking_created',
      'pickup_scheduled',
      'pickup_assigned',
      'picked_up',
      'received_at_origin',
      'in_transit',
      'received_at_destination',
      'out_for_delivery',
      'delivered',
      'delivery_attempted',
      'delivery_failed',
      'on_hold',
      'return_initiated',
      'returning_to_origin',
      'returned_to_sender',
      'cancelled',
      'lost',
    ];

    expect(Object.keys(PUBLIC_STATUS_LABELS)).toHaveLength(17);

    const expectedLabels: Record<ShipmentStatus, string> = {
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

    for (const status of all17Statuses) {
      expect(getPublicStatusLabel(status)).toBe(expectedLabels[status]);
    }
  });

  // TEST 5: Seeded Timelines Validity Test
  it('ensures every consecutive event transition in seeded timelines is valid per STATUS_TRANSITIONS', async () => {
    for (const demo of DEMO_TRACKING_NUMBERS) {
      service.resetRateLimit();
      const tracking = await service.track(demo.no);
      expect(tracking).not.toBeNull();
      if (!tracking) continue;

      const events = tracking.events;
      for (let i = 0; i < events.length - 1; i++) {
        const fromStatus = events[i].status;
        const toStatus = events[i + 1].status;

        const allowedTransitions = STATUS_TRANSITIONS[fromStatus];
        expect(
          allowedTransitions,
          `Status ${fromStatus} has no defined transitions`
        ).toBeDefined();

        expect(
          allowedTransitions && toStatus in allowedTransitions,
          `Invalid transition in shipment ${demo.no}: ${fromStatus} -> ${toStatus}`
        ).toBe(true);
      }
    }
  });
});
