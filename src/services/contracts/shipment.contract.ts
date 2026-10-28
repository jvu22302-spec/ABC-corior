import { ShipmentStatus, PaymentMethod, ShipmentSource } from '@/types/domain';

export interface ShipmentFilterParams {
  status?: ShipmentStatus;
  branchId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ShipmentRecord {
  id: string;
  trackingNo: string;
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  originCityId: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  destinationCityId: string;
  status: ShipmentStatus;
  paymentMethod: PaymentMethod;
  codAmountPkr: number;
  totalChargesPkr: number;
  weightKg: number;
  serviceId: string;
  source: ShipmentSource;
  createdAt: string;
  updatedAt: string;
}

export interface PublicBookingInput {
  sender: { name: string; phone: string; email?: string; address: string; cityId: string; zoneId: string; instructions?: string };
  recipient: { name: string; phone: string; altPhone?: string; address: string; cityId: string; zoneId: string; instructions?: string };
  shipment: { categoryId: string; description: string; pieces: number; serviceId: string; weightKg: number; dimensionsCm?: { length: number; width: number; height: number }; declaredValue?: number; pickupOption: 'pickup_from_address' | 'drop_at_branch'; preferredPickupDate?: string; specialHandling?: boolean; paymentMethod: 'cod' | 'prepaid'; codAmount?: number };
}
export interface PublicBookingResult { trackingNo: string; status: string; totalChargesPkr: number; createdAt: string; }

export interface ShipmentService {
  createPublicBooking(input: PublicBookingInput): Promise<PublicBookingResult>;
  getShipmentByTracking(trackingNo: string): Promise<ShipmentRecord | null>;
  listShipments(params?: ShipmentFilterParams): Promise<{ items: ShipmentRecord[]; total: number }>;
}
