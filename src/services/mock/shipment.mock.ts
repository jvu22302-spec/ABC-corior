import { ShipmentFilterParams, ShipmentRecord, ShipmentService } from '../contracts/shipment.contract';

const simulateLatency = (min = 150, max = 300) =>
  new Promise((resolve) => setTimeout(resolve, Math.floor(Math.random() * (max - min + 1)) + min));

export class MockShipmentService implements ShipmentService {
  private inMemoryShipments: ShipmentRecord[] = [];

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
