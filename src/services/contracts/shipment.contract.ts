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

export interface ShipmentService {
  getShipmentByTracking(trackingNo: string): Promise<ShipmentRecord | null>;
  listShipments(params?: ShipmentFilterParams): Promise<{ items: ShipmentRecord[]; total: number }>;
}
