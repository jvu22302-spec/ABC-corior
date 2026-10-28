import { GeographyService } from '../contracts/geography.contract';
import { Branch, City, DeliveryZone, ShippingService } from '@/types/domain';
import {
  SAMPLE_BRANCHES,
  SAMPLE_CITIES,
  SAMPLE_SERVICES,
  SAMPLE_ZONES,
} from './seedData';

const simulateLatency = (min = 150, max = 300) =>
  new Promise((resolve) => setTimeout(resolve, Math.floor(Math.random() * (max - min + 1)) + min));

export class MockGeographyService implements GeographyService {
  async listCities(): Promise<City[]> {
    await simulateLatency();
    return [...SAMPLE_CITIES];
  }

  async listZones(cityId?: string): Promise<DeliveryZone[]> {
    await simulateLatency();
    if (cityId) {
      return SAMPLE_ZONES.filter((z) => z.cityId === cityId);
    }
    return [...SAMPLE_ZONES];
  }

  async listBranches(): Promise<Branch[]> {
    await simulateLatency();
    return [...SAMPLE_BRANCHES];
  }

  async listServices(): Promise<ShippingService[]> {
    await simulateLatency();
    return [...SAMPLE_SERVICES];
  }
}
