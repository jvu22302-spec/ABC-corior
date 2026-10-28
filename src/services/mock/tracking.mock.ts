/**
 * Mock Tracking Service Implementation
 * Demonstrates public tracking with strict privacy projection and state machine compliance.
 * All shipment records herein are simulated demo data.
 */

import { PublicTracking, PublicTrackingEvent, ShipmentStatus } from '@/types/domain';
import { TrackingService, RateLimitedError } from '../contracts/tracking.contract';
import { validateTrackingNo, getPublicStatusLabel } from '@/lib/tracking';

const simulateLatency = (min = 200, max = 600) =>
  new Promise((resolve) => setTimeout(resolve, Math.floor(Math.random() * (max - min + 1)) + min));

// Internal shipment representation containing confidential operational data.
// This structure holds sensitive customer and financial records that MUST NEVER be leaked to public API consumers.
interface InternalShipmentEvent {
  occurredAt: string; // ISO
  status: ShipmentStatus;
  locationName: string;
  publicMessage: string;
  // Confidential internal fields:
  riderId?: string;
  riderName?: string;
  internalNote?: string;
}

interface InternalShipment {
  trackingNo: string;
  status: ShipmentStatus;
  originCity: string;
  destinationCity: string;
  serviceName: string;
  bookedAt: string; // ISO
  estimatedDeliveryText?: string;
  // Confidential customer & financial fields:
  senderFullName: string;
  senderPhone: string;
  senderAddress: string;
  recipientFullName: string;
  recipientPhone: string;
  recipientAddress: string;
  codAmountPkr?: number;
  shippingChargesPkr: number;
  internalNotes?: string;
  events: InternalShipmentEvent[];
}

/**
 * Privacy Filter Projection Function:
 * Explicitly constructs PublicTracking object from internal records.
 * Strips phone numbers, full addresses, full recipient surname, COD amounts, shipping charges,
 * internal operator notes, rider identities, and confidential audit flags.
 */
function toPublicTracking(internal: InternalShipment): PublicTracking {
  // Format recipient name to: first name + last initial (e.g., "Ali K.")
  let recipientDisplayName: string | undefined;
  if (internal.recipientFullName) {
    const parts = internal.recipientFullName.trim().split(/\s+/);
    if (parts.length <= 1) {
      recipientDisplayName = parts[0] || undefined;
    } else {
      const first = parts[0];
      const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
      recipientDisplayName = `${first} ${lastInitial}.`;
    }
  }

  // Explicitly map each event to public projection
  const publicEvents: PublicTrackingEvent[] = internal.events.map((ev) => ({
    occurredAt: ev.occurredAt,
    status: ev.status,
    publicStatusLabel: getPublicStatusLabel(ev.status),
    locationName: ev.locationName,
    publicMessage: ev.publicMessage,
  }));

  return {
    trackingNo: internal.trackingNo,
    status: internal.status,
    publicStatusLabel: getPublicStatusLabel(internal.status),
    originCity: internal.originCity,
    destinationCity: internal.destinationCity,
    serviceName: internal.serviceName,
    bookedAt: internal.bookedAt,
    estimatedDeliveryText: internal.estimatedDeliveryText,
    recipientDisplayName,
    events: publicEvents,
  };
}

/**
 * Seeded Demo Shipments
 * 8 verified shipments with valid Luhn check digits adhering to STATUS_TRANSITIONS
 *
 * 1. ABC26100000012 -> booking_created
 * 2. ABC26200000029 -> in_transit
 * 3. ABC26300000036 -> out_for_delivery
 * 4. ABC26400000043 -> delivered
 * 5. ABC26500000059 -> delivery_attempted
 * 6. ABC26600000066 -> on_hold
 * 7. ABC26700000073 -> returned_to_sender
 * 8. ABC26800000080 -> long timeline (10 events)
 */
export const DEMO_TRACKING_NUMBERS = [
  { no: 'ABC26100000012', status: 'booking_created' as const, label: 'Booking Received' },
  { no: 'ABC26200000029', status: 'in_transit' as const, label: 'In Transit' },
  { no: 'ABC26300000036', status: 'out_for_delivery' as const, label: 'Out for Delivery' },
  { no: 'ABC26400000043', status: 'delivered' as const, label: 'Delivered' },
  { no: 'ABC26500000059', status: 'delivery_attempted' as const, label: 'Delivery Attempted' },
  { no: 'ABC26600000066', status: 'on_hold' as const, label: 'On Hold' },
  { no: 'ABC26700000073', status: 'returned_to_sender' as const, label: 'Returned to Sender' },
  { no: 'ABC26800000080', status: 'delivered' as const, label: 'Multi-City Transit (10 Events)' },
];

const SEEDED_INTERNAL_SHIPMENTS: Record<string, InternalShipment> = {
  // 1. booking_created
  'ABC26100000012': {
    trackingNo: 'ABC26100000012',
    status: 'booking_created',
    originCity: 'Karachi',
    destinationCity: 'Lahore',
    serviceName: 'Standard Delivery',
    bookedAt: '2026-10-15T09:00:00.000Z',
    estimatedDeliveryText: 'Estimated delivery: 2-3 business days',
    senderFullName: 'Zubair Commercial Traders',
    senderPhone: '03001234567',
    senderAddress: 'Plot 48, Sector 15 Korangi Industrial Area, Karachi',
    recipientFullName: 'Hamza Tariq',
    recipientPhone: '03219876543',
    recipientAddress: 'House 14-B, Sector Y, DHA Phase 3, Lahore',
    codAmountPkr: 3200,
    shippingChargesPkr: 250,
    internalNotes: 'Customer requested evening booking confirmation call.',
    events: [
      {
        occurredAt: '2026-10-15T09:00:00.000Z',
        status: 'booking_created',
        locationName: 'Karachi Central Hub',
        publicMessage: 'Electronic consignment booking created and registered in ABC logistics system.',
        internalNote: 'Registered via web portal API token',
      },
    ],
  },

  // 2. in_transit
  'ABC26200000029': {
    trackingNo: 'ABC26200000029',
    status: 'in_transit',
    originCity: 'Karachi',
    destinationCity: 'Lahore',
    serviceName: 'Express Delivery',
    bookedAt: '2026-10-14T10:30:00.000Z',
    estimatedDeliveryText: 'Estimated delivery: Next business day',
    senderFullName: 'Tech Hub Online Store',
    senderPhone: '03005551234',
    senderAddress: 'Shop 12, Techno City Mall, I.I. Chundrigar Road, Karachi',
    recipientFullName: 'Bilal Khan',
    recipientPhone: '03334445566',
    recipientAddress: 'Flat 402, Al-Hafeez Heights, Gulberg III, Lahore',
    codAmountPkr: 14500,
    shippingChargesPkr: 450,
    internalNotes: 'Fragile electronics package. Handle with extreme care.',
    events: [
      {
        occurredAt: '2026-10-14T10:30:00.000Z',
        status: 'booking_created',
        locationName: 'Karachi Central Hub',
        publicMessage: 'Electronic consignment booking created.',
      },
      {
        occurredAt: '2026-10-14T11:15:00.000Z',
        status: 'pickup_scheduled',
        locationName: 'Karachi Central Hub',
        publicMessage: 'Courier pickup scheduled from merchant premises.',
      },
      {
        occurredAt: '2026-10-14T12:00:00.000Z',
        status: 'pickup_assigned',
        locationName: 'Karachi Central Hub',
        publicMessage: 'Courier assigned for doorstep parcel collection.',
        riderId: 'RDR-0042',
        riderName: 'Tariq Mehmood',
      },
      {
        occurredAt: '2026-10-14T14:20:00.000Z',
        status: 'picked_up',
        locationName: 'Karachi South Hub',
        publicMessage: 'Consignment successfully collected from merchant warehouse.',
        riderId: 'RDR-0042',
        riderName: 'Tariq Mehmood',
      },
      {
        occurredAt: '2026-10-14T17:45:00.000Z',
        status: 'received_at_origin',
        locationName: 'Karachi Central Hub',
        publicMessage: 'Consignment received at origin gateway, verified and processed for linehaul dispatch.',
      },
      {
        occurredAt: '2026-10-14T22:30:00.000Z',
        status: 'in_transit',
        locationName: 'National Linehaul Corridor',
        publicMessage: 'Consignment dispatched via secured inter-city linehaul towards Lahore Central Gateway.',
      },
    ],
  },

  // 3. out_for_delivery
  'ABC26300000036': {
    trackingNo: 'ABC26300000036',
    status: 'out_for_delivery',
    originCity: 'Lahore',
    destinationCity: 'Islamabad',
    serviceName: 'Express Delivery',
    bookedAt: '2026-10-14T08:00:00.000Z',
    estimatedDeliveryText: 'Expected delivery today',
    senderFullName: 'Lahore Apparel House',
    senderPhone: '03451112233',
    senderAddress: 'Main Boulevard, Gulberg, Lahore',
    recipientFullName: 'Zainab Ahmed',
    recipientPhone: '03017778899',
    recipientAddress: 'House 8, Street 42, Sector F-8/2, Islamabad',
    codAmountPkr: 4800,
    shippingChargesPkr: 450,
    internalNotes: 'Call consignee before arrival.',
    events: [
      {
        occurredAt: '2026-10-14T08:00:00.000Z',
        status: 'booking_created',
        locationName: 'Lahore Main Branch',
        publicMessage: 'Consignment booking registered in system.',
      },
      {
        occurredAt: '2026-10-14T11:00:00.000Z',
        status: 'received_at_origin',
        locationName: 'Lahore Main Branch',
        publicMessage: 'Parcel weighed and sorted at origin gateway.',
      },
      {
        occurredAt: '2026-10-14T18:00:00.000Z',
        status: 'in_transit',
        locationName: 'M-2 Motorway Linehaul',
        publicMessage: 'In transit to Islamabad Capital Gateway.',
      },
      {
        occurredAt: '2026-10-15T04:30:00.000Z',
        status: 'received_at_destination',
        locationName: 'Islamabad Capital Hub',
        publicMessage: 'Arrived at destination gateway and assigned to local delivery sector.',
      },
      {
        occurredAt: '2026-10-15T09:15:00.000Z',
        status: 'out_for_delivery',
        locationName: 'Islamabad Blue Area Branch',
        publicMessage: 'Consignment handed over to delivery courier for doorstep delivery.',
        riderId: 'RDR-0019',
        riderName: 'Noman Siddique',
      },
    ],
  },

  // 4. delivered
  'ABC26400000043': {
    trackingNo: 'ABC26400000043',
    status: 'delivered',
    originCity: 'Islamabad',
    destinationCity: 'Rawalpindi',
    serviceName: 'Standard Delivery',
    bookedAt: '2026-10-13T11:00:00.000Z',
    estimatedDeliveryText: 'Delivered',
    senderFullName: 'Islamabad Book Depot',
    senderPhone: '03123456780',
    senderAddress: 'Shop 4, F-6 Markaz, Islamabad',
    recipientFullName: 'Ali Raza',
    recipientPhone: '03009998877',
    recipientAddress: 'House 55, Street 10, Saddar Cantt, Rawalpindi',
    codAmountPkr: 1950,
    shippingChargesPkr: 250,
    internalNotes: 'Signed by recipient personally.',
    events: [
      {
        occurredAt: '2026-10-13T11:00:00.000Z',
        status: 'booking_created',
        locationName: 'Islamabad Capital Hub',
        publicMessage: 'Booking request confirmed.',
      },
      {
        occurredAt: '2026-10-13T13:00:00.000Z',
        status: 'pickup_scheduled',
        locationName: 'Islamabad Capital Hub',
        publicMessage: 'Pickup scheduled.',
      },
      {
        occurredAt: '2026-10-13T14:00:00.000Z',
        status: 'pickup_assigned',
        locationName: 'Islamabad Capital Hub',
        publicMessage: 'Pickup assigned to local courier.',
      },
      {
        occurredAt: '2026-10-13T15:30:00.000Z',
        status: 'picked_up',
        locationName: 'F-6 Sector, Islamabad',
        publicMessage: 'Parcel collected from shipper.',
      },
      {
        occurredAt: '2026-10-13T18:00:00.000Z',
        status: 'received_at_origin',
        locationName: 'Islamabad Capital Hub',
        publicMessage: 'Received and verified at origin hub.',
      },
      {
        occurredAt: '2026-10-14T09:00:00.000Z',
        status: 'out_for_delivery',
        locationName: 'Rawalpindi Delivery Sector',
        publicMessage: 'Out for delivery to consignee doorstep.',
      },
      {
        occurredAt: '2026-10-14T13:45:00.000Z',
        status: 'delivered',
        locationName: 'Saddar, Rawalpindi',
        publicMessage: 'Consignment successfully delivered to consignee.',
        riderId: 'RDR-0031',
        riderName: 'Imran Ashraf',
      },
    ],
  },

  // 5. delivery_attempted
  'ABC26500000059': {
    trackingNo: 'ABC26500000059',
    status: 'delivery_attempted',
    originCity: 'Karachi',
    destinationCity: 'Karachi',
    serviceName: 'Standard Delivery',
    bookedAt: '2026-10-14T09:00:00.000Z',
    estimatedDeliveryText: 'Delivery re-attempt scheduled for next business day',
    senderFullName: 'Home Furnishings Co.',
    senderPhone: '03212223344',
    senderAddress: 'Plot 99, SITE Area, Karachi',
    recipientFullName: 'Sara Mehmood',
    recipientPhone: '03332221100',
    recipientAddress: 'Apartment 3A, Sunset Boulevard, Phase 2, DHA, Karachi',
    codAmountPkr: 5200,
    shippingChargesPkr: 250,
    internalNotes: 'Consignee phone was ringing unanswered during first attempt.',
    events: [
      {
        occurredAt: '2026-10-14T09:00:00.000Z',
        status: 'booking_created',
        locationName: 'Karachi Central Hub',
        publicMessage: 'Booking created and entered into distribution system.',
      },
      {
        occurredAt: '2026-10-14T14:00:00.000Z',
        status: 'received_at_origin',
        locationName: 'Karachi Central Hub',
        publicMessage: 'Package sorted and processed at distribution center.',
      },
      {
        occurredAt: '2026-10-15T09:30:00.000Z',
        status: 'out_for_delivery',
        locationName: 'DHA Sector 1, Karachi',
        publicMessage: 'Out for delivery with courier.',
        riderId: 'RDR-0042',
        riderName: 'Tariq Mehmood',
      },
      {
        occurredAt: '2026-10-15T14:15:00.000Z',
        status: 'delivery_attempted',
        locationName: 'DHA Sector 1, Karachi',
        publicMessage: 'Delivery attempt unsuccessful — premises closed or recipient unavailable. Rescheduled for next business day.',
        riderId: 'RDR-0042',
        riderName: 'Tariq Mehmood',
        internalNote: 'Door locked, call unanswered at 2:10 PM',
      },
    ],
  },

  // 6. on_hold
  'ABC26600000066': {
    trackingNo: 'ABC26600000066',
    status: 'on_hold',
    originCity: 'Lahore',
    destinationCity: 'Faisalabad',
    serviceName: 'Standard Delivery',
    bookedAt: '2026-10-14T11:00:00.000Z',
    estimatedDeliveryText: 'On hold pending destination clarification',
    senderFullName: 'Punjab Garments Supply',
    senderPhone: '03007776655',
    senderAddress: 'Shah Alam Market, Lahore',
    recipientFullName: 'Usman Farooq',
    recipientPhone: '03445556677',
    recipientAddress: 'Main Bazar, Faisalabad (Incomplete street address)',
    codAmountPkr: 3750,
    shippingChargesPkr: 250,
    internalNotes: 'Street number missing from consignee address. Awaiting updated details from merchant.',
    events: [
      {
        occurredAt: '2026-10-14T11:00:00.000Z',
        status: 'booking_created',
        locationName: 'Lahore Main Branch',
        publicMessage: 'Booking received at origin station.',
      },
      {
        occurredAt: '2026-10-14T16:00:00.000Z',
        status: 'received_at_origin',
        locationName: 'Lahore Main Branch',
        publicMessage: 'Consignment received at facility.',
      },
      {
        occurredAt: '2026-10-15T10:00:00.000Z',
        status: 'on_hold',
        locationName: 'Lahore Main Branch',
        publicMessage: 'Shipment temporarily on hold. Customer destination verification or instructions required.',
        internalNote: 'Flagged by sorting staff: street/house number missing',
      },
    ],
  },

  // 7. returned_to_sender
  'ABC26700000073': {
    trackingNo: 'ABC26700000073',
    status: 'returned_to_sender',
    originCity: 'Karachi',
    destinationCity: 'Faisalabad',
    serviceName: 'Express Delivery',
    bookedAt: '2026-10-10T08:00:00.000Z',
    estimatedDeliveryText: 'Consignment returned to sender',
    senderFullName: 'Karachi Cosmetics Boutique',
    senderPhone: '03001112222',
    senderAddress: 'Tariq Road, PECHS, Karachi',
    recipientFullName: 'Maryam Raza',
    recipientPhone: '03159998877',
    recipientAddress: 'Peoples Colony No. 1, Faisalabad',
    codAmountPkr: 6400,
    shippingChargesPkr: 450,
    internalNotes: 'Customer refused COD delivery: claimed item was ordered by mistake.',
    events: [
      {
        occurredAt: '2026-10-10T08:00:00.000Z',
        status: 'booking_created',
        locationName: 'Karachi Central Hub',
        publicMessage: 'Consignment booking created.',
      },
      {
        occurredAt: '2026-10-10T12:00:00.000Z',
        status: 'received_at_origin',
        locationName: 'Karachi Central Hub',
        publicMessage: 'Sorted and scanned at origin gateway.',
      },
      {
        occurredAt: '2026-10-10T21:00:00.000Z',
        status: 'in_transit',
        locationName: 'Karachi Linehaul Terminal',
        publicMessage: 'Dispatched via night linehaul to Faisalabad gateway.',
      },
      {
        occurredAt: '2026-10-11T13:00:00.000Z',
        status: 'received_at_destination',
        locationName: 'Faisalabad Branch Hub',
        publicMessage: 'Received at destination sorting center.',
      },
      {
        occurredAt: '2026-10-12T09:30:00.000Z',
        status: 'out_for_delivery',
        locationName: 'Faisalabad Peoples Colony',
        publicMessage: 'Out for delivery to consignee doorstep.',
      },
      {
        occurredAt: '2026-10-12T13:00:00.000Z',
        status: 'delivery_attempted',
        locationName: 'Faisalabad Peoples Colony',
        publicMessage: 'Delivery attempted. Consignee requested cancellation upon arrival.',
      },
      {
        occurredAt: '2026-10-12T17:00:00.000Z',
        status: 'delivery_failed',
        locationName: 'Faisalabad Branch Hub',
        publicMessage: 'Delivery unsuccessful — consignment refused by recipient.',
      },
      {
        occurredAt: '2026-10-13T09:00:00.000Z',
        status: 'return_initiated',
        locationName: 'Faisalabad Branch Hub',
        publicMessage: 'Return procedure initiated to original sender branch.',
      },
      {
        occurredAt: '2026-10-13T19:00:00.000Z',
        status: 'returning_to_origin',
        locationName: 'National Return Linehaul',
        publicMessage: 'In transit returning to origin sorting hub in Karachi.',
      },
      {
        occurredAt: '2026-10-14T16:30:00.000Z',
        status: 'returned_to_sender',
        locationName: 'Karachi Central Hub',
        publicMessage: 'Consignment successfully returned to shipper.',
        internalNote: 'Merchant signed RTS handover receipt #9821.',
      },
    ],
  },

  // 8. Long timeline (10 events) -> delivered
  'ABC26800000080': {
    trackingNo: 'ABC26800000080',
    status: 'delivered',
    originCity: 'Islamabad',
    destinationCity: 'Karachi',
    serviceName: 'Express Delivery',
    bookedAt: '2026-10-11T07:30:00.000Z',
    estimatedDeliveryText: 'Delivered',
    senderFullName: 'Northern Craft Artisans',
    senderPhone: '03335559900',
    senderAddress: 'Lok Virsa Market, Garden Avenue, Islamabad',
    recipientFullName: 'Kashif Trading Co.',
    recipientPhone: '03008889911',
    recipientAddress: 'Suite 501, Business Avenue, Shahrah-e-Faisal, Karachi',
    codAmountPkr: 8900,
    shippingChargesPkr: 650,
    internalNotes: 'Corporate delivery. Security gate clearance required.',
    events: [
      {
        occurredAt: '2026-10-11T07:30:00.000Z',
        status: 'booking_created',
        locationName: 'Islamabad Capital Hub',
        publicMessage: 'Consignment booked online.',
      },
      {
        occurredAt: '2026-10-11T09:00:00.000Z',
        status: 'pickup_scheduled',
        locationName: 'Islamabad Capital Hub',
        publicMessage: 'Courier pickup scheduled.',
      },
      {
        occurredAt: '2026-10-11T10:15:00.000Z',
        status: 'pickup_assigned',
        locationName: 'Islamabad Capital Hub',
        publicMessage: 'Pickup assigned to dispatch courier.',
      },
      {
        occurredAt: '2026-10-11T11:45:00.000Z',
        status: 'picked_up',
        locationName: 'Islamabad Lok Virsa',
        publicMessage: 'Parcel collected from shipper.',
      },
      {
        occurredAt: '2026-10-11T14:00:00.000Z',
        status: 'received_at_origin',
        locationName: 'Islamabad Capital Hub',
        publicMessage: 'Scanned, weighed and sorted at origin gateway.',
      },
      {
        occurredAt: '2026-10-11T20:00:00.000Z',
        status: 'in_transit',
        locationName: 'Linehaul Gateway North',
        publicMessage: 'Departed Islamabad Hub on long-haul transport.',
      },
      {
        occurredAt: '2026-10-12T14:30:00.000Z',
        status: 'in_transit',
        locationName: 'Midway Checkpoint Sukkur',
        publicMessage: 'Transit scan recorded at intermediate regional gateway checkpoint.',
      },
      {
        occurredAt: '2026-10-13T05:00:00.000Z',
        status: 'received_at_destination',
        locationName: 'Karachi Central Hub',
        publicMessage: 'Consignment arrived at destination facility and sorted for local delivery.',
      },
      {
        occurredAt: '2026-10-13T09:15:00.000Z',
        status: 'out_for_delivery',
        locationName: 'Karachi South Delivery Sector',
        publicMessage: 'Handed over to delivery courier for final doorstep delivery.',
      },
      {
        occurredAt: '2026-10-13T14:20:00.000Z',
        status: 'delivered',
        locationName: 'Shahrah-e-Faisal, Karachi',
        publicMessage: 'Consignment successfully delivered to recipient.',
        riderId: 'RDR-0012',
        riderName: 'Farhan Akhtar',
        internalNote: 'Delivered to reception desk; token verified.',
      },
    ],
  },
};

export class MockTrackingService implements TrackingService {
  private requestTimestamps: number[] = [];

  // Reset helper for testing
  resetRateLimit(): void {
    this.requestTimestamps = [];
  }

  async track(trackingNo: string, skipDelay = false): Promise<PublicTracking | null> {
    if (!skipDelay) {
      await simulateLatency();
    }

    // Dev flag simulation: ?fail=1 in URL or query parameter triggers simulated network error
    if (typeof window !== 'undefined' && window.location?.search?.includes('fail=1')) {
      throw new Error('Simulated network error (?fail=1). Please check your internet connection.');
    }

    // Rate Limiting: Max 30 lookups per minute
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    this.requestTimestamps = this.requestTimestamps.filter((ts) => ts > oneMinuteAgo);

    if (this.requestTimestamps.length >= 30) {
      throw new RateLimitedError(60, 'Too many tracking attempts. Please try again in a minute.');
    }

    this.requestTimestamps.push(now);

    const cleanNo = (trackingNo || '').trim().toUpperCase();

    // Malformed or bad check digit validation: returns null (identical to unknown consignment)
    const validation = validateTrackingNo(cleanNo);
    if (!validation.isValid) {
      return null;
    }

    // Lookup in seeded demo shipments
    const internal = SEEDED_INTERNAL_SHIPMENTS[cleanNo];
    if (!internal) {
      return null;
    }

    // Privacy projection
    return toPublicTracking(internal);
  }
}
