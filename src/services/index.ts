/**
 * Service registry. Production uses Supabase; mock data is only for local demos.
 */
import { env } from '@/config/env';
import { AuthService } from './contracts/auth.contract';
import { SettingsService } from './contracts/settings.contract';
import { GeographyService } from './contracts/geography.contract';
import { ShipmentService } from './contracts/shipment.contract';
import { TrackingService } from './contracts/tracking.contract';
import { RateService } from './contracts/rate.contract';
import { TicketService } from './contracts/ticket.contract';
import { MockAuthService } from './mock/auth.mock';
import { MockSettingsService } from './mock/settings.mock';
import { MockGeographyService } from './mock/geography.mock';
import { MockShipmentService } from './mock/shipment.mock';
import { MockTrackingService } from './mock/tracking.mock';
import { MockRateService } from './mock/rate.mock';
import { MockTicketService } from './mock/ticket.mock';
import { supabaseServices } from './supabase';

let authServiceInstance: AuthService;
let settingsServiceInstance: SettingsService;
let geographyServiceInstance: GeographyService;
let shipmentServiceInstance: ShipmentService;
let trackingServiceInstance: TrackingService;
let rateServiceInstance: RateService;
let ticketServiceInstance: TicketService;

if (env.VITE_DATA_SOURCE === 'supabase') {
  authServiceInstance = supabaseServices.auth;
  settingsServiceInstance = supabaseServices.settings;
  geographyServiceInstance = supabaseServices.geography;
  shipmentServiceInstance = supabaseServices.shipment;
  trackingServiceInstance = supabaseServices.tracking;
  rateServiceInstance = supabaseServices.rate;
  ticketServiceInstance = supabaseServices.ticket;
} else {
  authServiceInstance = new MockAuthService();
  settingsServiceInstance = new MockSettingsService();
  geographyServiceInstance = new MockGeographyService();
  shipmentServiceInstance = new MockShipmentService();
  trackingServiceInstance = new MockTrackingService();
  rateServiceInstance = new MockRateService();
  ticketServiceInstance = new MockTicketService();
}

export const authService = authServiceInstance;
export const settingsService = settingsServiceInstance;
export const geographyService = geographyServiceInstance;
export const shipmentService = shipmentServiceInstance;
export const trackingService = trackingServiceInstance;
export const rateService = rateServiceInstance;
export const ticketService = ticketServiceInstance;

export * from './contracts/auth.contract';
export * from './contracts/settings.contract';
export * from './contracts/geography.contract';
export * from './contracts/shipment.contract';
export * from './contracts/tracking.contract';
export * from './contracts/rate.contract';
export * from './contracts/ticket.contract';
