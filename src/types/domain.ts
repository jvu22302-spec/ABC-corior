/**
 * Domain Types for ABC Courier Management & Parcel Tracking System
 * Single source of truth for core domain entities, enums, and state transitions.
 */

export type AppRole =
  | 'super_admin'
  | 'ops_manager'
  | 'branch_staff'
  | 'rider'
  | 'finance'
  | 'merchant'
  | 'customer';

export type ShipmentStatus =
  | 'booking_created'
  | 'pickup_scheduled'
  | 'pickup_assigned'
  | 'picked_up'
  | 'received_at_origin'
  | 'in_transit'
  | 'received_at_destination'
  | 'out_for_delivery'
  | 'delivered'
  | 'delivery_attempted'
  | 'delivery_failed'
  | 'on_hold'
  | 'return_initiated'
  | 'returning_to_origin'
  | 'returned_to_sender'
  | 'cancelled'
  | 'lost';

export type PaymentMethod = 'cod' | 'prepaid' | 'to_pay';

export type ShipmentSource =
  | 'admin'
  | 'branch'
  | 'web_guest'
  | 'web_customer'
  | 'merchant_portal'
  | 'merchant_bulk'
  | 'merchant_api';

export type CodStatus =
  | 'not_applicable'
  | 'pending'
  | 'collected'
  | 'partially_collected'
  | 'handed_over'
  | 'reconciled'
  | 'discrepancy'
  | 'not_collected';

export type SettlementStatus =
  | 'not_applicable'
  | 'unsettled'
  | 'in_settlement'
  | 'settled'
  | 'reversed';

export interface Branch {
  id: string;
  code: string;
  name: string;
  cityId: string;
  address: string;
  phone: string;
  email: string;
  isHub: boolean;
  isActive: boolean;
}

export interface City {
  id: string;
  code: string;
  name: string;
  province: string;
  isActive: boolean;
}

export interface DeliveryZone {
  id: string;
  cityId: string;
  code: string;
  name: string;
  branchId: string;
  isActive: boolean;
  isRemote?: boolean;
}

export interface ShippingService {
  id: string;
  code: string;
  name: string;
  description: string;
  estimatedDeliveryDays: string;
  baseWeightKg: number;
  baseRatePkr: number;
  perAdditionalKgPkr: number;
  isActive: boolean;
  allowsCod?: boolean;
}

export interface Profile {
  id: string;
  email: string;
  fullName: string;
  role: AppRole;
  phone?: string;
  branchId?: string;
  merchantId?: string;
  riderId?: string;
  isActive: boolean;
  avatarUrl?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  cityId: string;
  address: string;
  isActive: boolean;
  createdAt: string;
}

export interface Merchant {
  id: string;
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  cityId: string;
  bankAccountTitle?: string;
  bankAccountNumber?: string;
  bankName?: string;
  iban?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Rider {
  id: string;
  profileId: string;
  fullName: string;
  phone: string;
  cnic: string;
  vehicleType: 'motorcycle' | 'van' | 'rickshaw';
  vehiclePlate: string;
  branchId: string;
  assignedZoneIds: string[];
  isActive: boolean;
}

export interface SystemSettings {
  companyName: string;
  tagline: string;
  supportPhone: string;
  supportEmail: string;
  headOfficeAddress: string;
  trackingPrefix: string;
  currency: string;
  timezone: string;
  codFeePkr: number;
  fuelSurchargePercent: number;
  gstPercent: number;
  stats?: { label: string; value: string }[];
  workingHours?: string;
}

export interface PublicContent {
  aboutText: string[];
  values: { title: string; description: string }[];
  howItWorks: {
    stepNumber: number;
    title: string;
    description: string;
    iconKey: 'step-book' | 'step-pickup' | 'step-transit' | 'step-delivered';
  }[];
  faqs: {
    id: string;
    question: string;
    answer: string;
    category: 'General' | 'Booking' | 'Tracking' | 'COD' | 'Exceptions';
  }[];
  termsSections: {
    id: string;
    heading: string;
    body: string;
  }[];
  privacySections: {
    id: string;
    heading: string;
    body: string;
  }[];
  lastUpdated: string;
}

/**
 * Terminal statuses where shipments cannot transition further.
 */
export const TERMINAL_STATUSES: readonly ShipmentStatus[] = [
  'delivered',
  'returned_to_sender',
  'cancelled',
  'lost',
] as const;

export function isTerminalStatus(status: ShipmentStatus): boolean {
  return TERMINAL_STATUSES.includes(status);
}

/**
 * Transition Table:
 * Maps: fromStatus -> toStatus -> Allowed Roles
 */
export const STATUS_TRANSITIONS: Record<
  ShipmentStatus,
  Partial<Record<ShipmentStatus, AppRole[]>>
> = {
  booking_created: {
    pickup_scheduled: ['ops_manager', 'branch_staff', 'super_admin'],
    received_at_origin: ['branch_staff', 'ops_manager', 'super_admin'],
    cancelled: ['ops_manager', 'branch_staff', 'super_admin'],
    on_hold: ['ops_manager', 'branch_staff', 'super_admin'],
  },
  pickup_scheduled: {
    pickup_assigned: ['ops_manager', 'branch_staff', 'super_admin'],
    cancelled: ['ops_manager', 'branch_staff', 'super_admin'],
    on_hold: ['ops_manager', 'branch_staff', 'super_admin'],
  },
  pickup_assigned: {
    picked_up: ['rider', 'ops_manager', 'super_admin'],
    pickup_scheduled: ['ops_manager', 'branch_staff', 'super_admin'],
    cancelled: ['ops_manager', 'branch_staff', 'super_admin'],
    on_hold: ['ops_manager', 'branch_staff', 'super_admin'],
  },
  picked_up: {
    received_at_origin: ['branch_staff', 'ops_manager', 'super_admin'],
    on_hold: ['ops_manager', 'branch_staff', 'super_admin'],
  },
  received_at_origin: {
    in_transit: ['branch_staff', 'ops_manager', 'super_admin'],
    out_for_delivery: ['ops_manager', 'branch_staff', 'super_admin'],
    on_hold: ['ops_manager', 'branch_staff', 'super_admin'],
  },
  in_transit: {
    in_transit: ['branch_staff', 'ops_manager', 'super_admin'],
    received_at_destination: ['branch_staff', 'ops_manager', 'super_admin'],
    lost: ['ops_manager', 'super_admin'],
    on_hold: ['ops_manager', 'branch_staff', 'super_admin'],
  },
  received_at_destination: {
    out_for_delivery: ['ops_manager', 'branch_staff', 'super_admin'],
    on_hold: ['ops_manager', 'branch_staff', 'super_admin'],
  },
  out_for_delivery: {
    delivered: ['rider', 'ops_manager', 'super_admin'],
    delivery_attempted: ['rider', 'ops_manager', 'super_admin'],
    on_hold: ['ops_manager', 'branch_staff', 'super_admin'],
  },
  delivery_attempted: {
    out_for_delivery: ['ops_manager', 'branch_staff', 'super_admin'],
    delivery_failed: ['ops_manager', 'super_admin'],
    on_hold: ['ops_manager', 'branch_staff', 'super_admin'],
  },
  delivery_failed: {
    out_for_delivery: ['ops_manager', 'super_admin'],
    return_initiated: ['ops_manager', 'super_admin'],
    on_hold: ['ops_manager', 'branch_staff', 'super_admin'],
  },
  on_hold: {
    return_initiated: ['ops_manager', 'super_admin'],
    cancelled: ['ops_manager', 'super_admin'],
    lost: ['ops_manager', 'super_admin'],
  },
  return_initiated: {
    returning_to_origin: ['branch_staff', 'ops_manager', 'super_admin'],
    on_hold: ['ops_manager', 'branch_staff', 'super_admin'],
  },
  returning_to_origin: {
    returned_to_sender: ['branch_staff', 'ops_manager', 'super_admin'],
    lost: ['ops_manager', 'super_admin'],
    on_hold: ['ops_manager', 'branch_staff', 'super_admin'],
  },
  delivered: {},
  returned_to_sender: {},
  cancelled: {},
  lost: {},
};

/**
 * Checks if a given role is permitted to transition a shipment from currentStatus to nextStatus.
 */
export function canTransition(
  from: ShipmentStatus,
  to: ShipmentStatus,
  role: AppRole
): boolean {
  if (isTerminalStatus(from)) {
    return false;
  }
  const allowed = STATUS_TRANSITIONS[from]?.[to];
  if (!allowed) {
    return false;
  }
  return allowed.includes(role);
}

/**
 * Public Tracking Data Transfer Objects (DTO)
 * Privacy-first public projection strictly omitting sensitive data
 * (no phones, full names, addresses, COD amount, charges, internal notes, rider identity, POD images).
 */
export interface PublicTrackingEvent {
  occurredAt: string; // ISO 8601
  status: ShipmentStatus;
  publicStatusLabel: string;
  locationName: string; // city or branch name
  publicMessage: string;
}

export interface PublicTracking {
  trackingNo: string;
  status: ShipmentStatus;
  publicStatusLabel: string;
  originCity: string;
  destinationCity: string;
  serviceName: string;
  bookedAt: string; // ISO 8601
  estimatedDeliveryText?: string;
  recipientDisplayName?: string; // first name + initial only, e.g. "Ali K."
  events: PublicTrackingEvent[];
}

/**
 * Multi-Step Booking Draft DTOs (Phase F3a)
 * In-memory representation across Steps 1 (Sender), 2 (Recipient), 3 (Shipment), and 4 (Review)
 */
export interface BookingDraftSender {
  name: string;
  phone: string;
  email?: string;
  address: string;
  cityId: string;
  zoneId: string;
  instructions?: string;
}

export interface BookingDraftRecipient {
  name: string;
  phone: string;
  altPhone?: string;
  address: string;
  cityId: string;
  zoneId: string;
  instructions?: string;
}

export interface BookingDraftShipment {
  categoryId: string;
  description: string;
  pieces: number;
  weightKg: number;
  dimensionsCm?: {
    length: number;
    width: number;
    height: number;
  };
  declaredValue?: number;
  serviceId: string;
  pickupOption: 'pickup_from_address' | 'drop_at_branch';
  preferredPickupDate?: string;
  paymentMethod: 'cod' | 'prepaid';
  codAmount?: number;
  specialHandling?: boolean;
}

export interface BookingDraft {
  sender: BookingDraftSender;
  recipient: BookingDraftRecipient;
  shipment: BookingDraftShipment;
}


