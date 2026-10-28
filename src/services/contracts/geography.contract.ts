import { Branch, City, DeliveryZone, ShippingService } from '@/types/domain';

export interface GeographyService {
  listCities(): Promise<City[]>;
  listZones(cityId?: string): Promise<DeliveryZone[]>;
  listBranches(): Promise<Branch[]>;
  listServices(): Promise<ShippingService[]>;
}
