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
  sender: { name: string; phone: string; address: string; cityId: string; zoneId: string };
  recipient: { name: string; phone: string; address: string; cityId: string; zoneId: string };
  shipment: { serviceId: string; weightKg: number; paymentMethod: 'cod' | 'prepaid'; codAmount?: number };
}
export interface PublicBookingResult { trackingNo: string; status: string; totalChargesPkr: number; createdAt: string; }

export interface ShipmentService {
  createPublicBooking(input: PublicBookingInput): Promise<PublicBookingResult>;
  getShipmentByTracking(trackingNo: string): Promise<ShipmentRecord | null>;
  listShipments(params?: ShipmentFilterParams): Promise<{ items: ShipmentRecord[]; total: number }>;
}
