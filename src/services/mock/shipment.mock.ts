import { ShipmentFilterParams, ShipmentRecord, ShipmentService } from '../contracts/shipment.contract';

const simulateLatency = (min = 150, max = 300) =>
  new Promise((resolve) => setTimeout(resolve, Math.floor(Math.random() * (max - min + 1)) + min));

export class MockShipmentService implements ShipmentService {
  private inMemoryShipments: ShipmentRecord[] = [];

  async createPublicBooking(input: import('../contracts/shipment.contract').PublicBookingInput): Promise<import('../contracts/shipment.contract').PublicBookingResult> {
    await simulateLatency();
    const trackingNo = `DEMO${Date.now().toString().slice(-10)}`;
    const now = new Date().toISOString();
    this.inMemoryShipments.unshift({
      id: trackingNo, trackingNo, senderName: input.sender.name, senderPhone: input.sender.phone,
      senderAddress: input.sender.address, originCityId: input.sender.cityId,
      recipientName: input.recipient.name, recipientPhone: input.recipient.phone,
      recipientAddress: input.recipient.address, destinationCityId: input.recipient.cityId,
      status: 'booking_created', paymentMethod: input.shipment.paymentMethod,
      codAmountPkr: input.shipment.codAmount || 0, totalChargesPkr: 0, weightKg: input.shipment.weightKg,
      serviceId: input.shipment.serviceId, source: 'web_guest', createdAt: now, updatedAt: now,
    });
    return { trackingNo, status: 'booking_created', totalChargesPkr: 0, createdAt: now };
  }

  async getShipmentByTracking(trackingNo: string): Promise<ShipmentRecord | null> {
    await simulateLatency();
    const cleanNo = trackingNo.trim().toUpperCase();
    return this.inMemoryShipments.find((s) => s.trackingNo === cleanNo) || null;
  }

  async listShipments(params?: ShipmentFilterParams): Promise<{ items: ShipmentRecord[]; total: number }> {
    await simulateLatency();
    let results = [...this.inMemoryShipments];

    if (params?.status) {
      results = results.filter((s) => s.status === params.status);
    }
    if (params?.branchId) {
      results = results.filter((s) => s.originCityId === params.branchId);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      results = results.filter(
        (s) =>
          s.trackingNo.toLowerCase().includes(q) ||
          s.recipientName.toLowerCase().includes(q) ||
          s.recipientPhone.includes(q)
      );
    }

    const limit = params?.limit ?? 20;
    const offset = params?.offset ?? 0;
    const paginated = results.slice(offset, offset + limit);

    return {
      items: paginated,
      total: results.length,
    };
  }
}
