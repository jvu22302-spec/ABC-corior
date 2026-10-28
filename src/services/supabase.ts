import { env } from '@/config/env';
import { Profile, City, Branch, DeliveryZone, ShippingService, PublicTracking, SystemSettings, PublicContent } from '@/types/domain';
import { AuthService, SignInParams } from './contracts/auth.contract';
import { SettingsService } from './contracts/settings.contract';
import { GeographyService } from './contracts/geography.contract';
import { ShipmentService, ShipmentFilterParams, ShipmentRecord, PublicBookingInput, PublicBookingResult } from './contracts/shipment.contract';
import { TrackingService } from './contracts/tracking.contract';
import { RateService, CalculateRateParams, RateBreakdown, QuoteInput, RateQuote, RateNotFoundError } from './contracts/rate.contract';
import { TicketService, CreateTicketParams, TicketResult } from './contracts/ticket.contract';
import { RateLimitedError } from './contracts/tracking.contract';
import { AppError } from '@/lib/errors';
import { validatePkPhone } from '@/lib/phone';
import { SAMPLE_PUBLIC_CONTENT, SAMPLE_SYSTEM_SETTINGS } from './mock/seedData';

const SESSION_KEY = 'abc_supabase_session_v1';
type Session = { access_token: string; refresh_token?: string; expires_at?: number; user?: { id: string; email?: string } };

function readSession(): Session | null {
  try { const raw = localStorage.getItem(SESSION_KEY); return raw ? JSON.parse(raw) as Session : null; } catch { return null; }
}
function saveSession(session: Session | null) {
  try { if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session)); else localStorage.removeItem(SESSION_KEY); } catch { /* storage may be disabled */ }
}
async function request<T>(path: string, options: RequestInit = {}, auth = false): Promise<T> {
  if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_PUBLISHABLE_KEY) throw new Error('Supabase configuration is missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in deployment settings.');
  const session = auth ? readSession() : null;
  const response = await fetch(`${env.VITE_SUPABASE_URL.replace(/\/$/, '')}${path}`, {
    ...options,
    headers: {
      apikey: env.VITE_SUPABASE_PUBLISHABLE_KEY,
      'Content-Type': 'application/json',
      ...(options.body && typeof options.body === 'string' ? { 'Content-Type': 'application/json' } : {}),
      ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const body = await response.text();
  let data: unknown = null;
  try { data = body ? JSON.parse(body) : null; } catch { data = body; }
  if (!response.ok) {
    const message = (data as { message?: string; error_description?: string; details?: string } | null)?.message ||
      (data as { error_description?: string } | null)?.error_description || `Supabase request failed (${response.status})`;
    if (response.status === 429) throw new RateLimitedError(Number(response.headers.get('Retry-After') || 60), message);
    throw new Error(message);
  }
  return data as T;
}
const rest = <T,>(table: string, query: string, auth = false) => request<T>(`/rest/v1/${table}${query ? `?${query}` : ''}`, {}, auth);
const profileFromRow = (row: Record<string, unknown>): Profile => ({
  id: String(row.id), email: String(row.email || ''), fullName: String(row.full_name || ''),
  role: (row.role || 'customer') as Profile['role'], phone: row.phone ? String(row.phone) : undefined,
  branchId: row.branch_id ? String(row.branch_id) : undefined, merchantId: row.merchant_id ? String(row.merchant_id) : undefined,
  riderId: row.rider_id ? String(row.rider_id) : undefined, isActive: row.is_active !== false,
  avatarUrl: row.avatar_url ? String(row.avatar_url) : undefined, createdAt: String(row.created_at || new Date().toISOString()),
});
const cityFromRow = (r: Record<string, unknown>): City => ({ id:String(r.id),code:String(r.code),name:String(r.name),province:String(r.province),isActive:Boolean(r.is_active) });
const branchFromRow = (r: Record<string, unknown>): Branch => ({ id:String(r.id),code:String(r.code),name:String(r.name),cityId:String(r.city_id),address:String(r.address||''),phone:String(r.phone||''),email:String(r.email||''),isHub:Boolean(r.is_hub),isActive:Boolean(r.is_active) });
const zoneFromRow = (r: Record<string, unknown>): DeliveryZone => ({ id:String(r.id),cityId:String(r.city_id),code:String(r.code),name:String(r.name),branchId:String(r.branch_id),isActive:Boolean(r.is_active),isRemote:Boolean(r.is_remote) });
const serviceFromRow = (r: Record<string, unknown>): ShippingService => ({ id:String(r.id),code:String(r.code),name:String(r.name),description:String(r.description||''),estimatedDeliveryDays:String(r.estimated_delivery_days||''),baseWeightKg:Number(r.base_weight_kg||1),baseRatePkr:Number(r.base_rate_pkr||0),perAdditionalKgPkr:Number(r.per_additional_kg_pkr||0),isActive:Boolean(r.is_active),allowsCod:Boolean(r.allows_cod) });
const shipmentFromRow = (r: Record<string, unknown>): ShipmentRecord => ({
  id:String(r.id),trackingNo:String(r.tracking_no),senderName:String(r.sender_name),senderPhone:String(r.sender_phone),senderAddress:String(r.sender_address),
  originCityId:String(r.origin_city_id),recipientName:String(r.recipient_name),recipientPhone:String(r.recipient_phone),recipientAddress:String(r.recipient_address),
  destinationCityId:String(r.destination_city_id),status:r.status as ShipmentRecord['status'],paymentMethod:r.payment_method as ShipmentRecord['paymentMethod'],
  codAmountPkr:Number(r.cod_amount_pkr||0),totalChargesPkr:Number(r.total_charges_pkr||0),weightKg:Number(r.weight_kg||1),serviceId:String(r.service_id),
  source:r.source as ShipmentRecord['source'],createdAt:String(r.created_at),updatedAt:String(r.updated_at),
});
const qs = (values: Record<string, string | number | boolean | undefined>) => new URLSearchParams(Object.entries(values).filter(([,v])=>v!==undefined).map(([k,v])=>[k,String(v)])).toString();

class SupabaseAuthService implements AuthService {
  async signIn({email,password}: SignInParams): Promise<Profile> {
    if (!email.trim() || !password) throw AppError.validation('Email and password are required.');
    const session = await request<Session>('/auth/v1/token?grant_type=password',{method:'POST',body:JSON.stringify({email:email.trim().toLowerCase(),password})});
    saveSession(session);
    try {
      const rows = await rest<Record<string,unknown>[]>('profiles',qs({select:'*',id:`eq.${session.user?.id}`,limit:1}),true);
      if (!rows[0] || rows[0].is_active === false) { saveSession(null); throw AppError.forbidden('This account is not enabled for the courier portal. Contact your administrator.'); }
      return profileFromRow(rows[0]);
    } catch (error) { saveSession(null); throw error; }
  }
  async signOut(): Promise<void> { const session=readSession(); try { if(session?.access_token) await request('/auth/v1/logout',{method:'POST'},true); } finally { saveSession(null); } }
  async getSession(): Promise<Profile|null> {
    const session=readSession(); if(!session?.access_token) return null;
    try {
      const user=await request<{id:string;email?:string}>('/auth/v1/user',{},true);
      const rows=await rest<Record<string,unknown>[]>('profiles',qs({select:'*',id:`eq.${user.id}`,limit:1}),true);
      if(!rows[0] || rows[0].is_active===false) { saveSession(null); return null; }
      return profileFromRow(rows[0]);
    } catch { saveSession(null); return null; }
  }
  async requestPasswordReset(email:string) {
    if(!email.includes('@')) throw AppError.validation('Please provide a valid email address.');
    await request('/auth/v1/recover',{method:'POST',body:JSON.stringify({email:email.trim().toLowerCase()})});
    return {success:true,message:'If the email exists, a password reset link has been sent.'};
  }
  async resetPassword(token:string,newPassword:string) {
    if(!token || newPassword.length<8) throw AppError.validation('Use a valid reset link and a password of at least 8 characters.');
    const current=readSession();
    if(!current?.access_token) throw AppError.validation('Open the password reset link from your email first.');
    await request('/auth/v1/user',{method:'PUT',body:JSON.stringify({password:newPassword})},true);
    return {success:true};
  }
}
class SupabaseGeographyService implements GeographyService {
  async listCities(){ return (await rest<Record<string,unknown>[]>('cities',qs({select:'*',is_active:'eq.true',order:'name'}))).map(cityFromRow); }
  async listZones(cityId?:string){ return (await rest<Record<string,unknown>[]>('delivery_zones',qs({select:'*',is_active:'eq.true',...(cityId?{city_id:`eq.${cityId}`}:{}),order:'name'}))).map(zoneFromRow); }
  async listBranches(){ return (await rest<Record<string,unknown>[]>('branches',qs({select:'*',is_active:'eq.true',order:'name'}))).map(branchFromRow); }
  async listServices(){ return (await rest<Record<string,unknown>[]>('shipping_services',qs({select:'*',is_active:'eq.true',order:'base_rate_pkr'}))).map(serviceFromRow); }
}
class SupabaseTrackingService implements TrackingService {
  async track(trackingNo:string):Promise<PublicTracking|null>{
    const data=await request<PublicTracking|null>('/rest/v1/rpc/public_track_shipment',{method:'POST',body:JSON.stringify({p_tracking_no:trackingNo.trim().toUpperCase()})});
    return data;
  }
}
class SupabaseShipmentService implements ShipmentService {
  async getShipmentByTracking(trackingNo:string){ const rows=await rest<Record<string,unknown>[]>('shipments',qs({select:'*',tracking_no:`eq.${trackingNo.trim().toUpperCase()}`,limit:1}),true); return rows[0]?shipmentFromRow(rows[0]):null; }
  async listShipments(params:ShipmentFilterParams={}) {
    const filters:Record<string,string|number|boolean|undefined>={select:'*',order:'created_at.desc',limit:params.limit??20,offset:params.offset??0};
    if(params.status) filters.status=`eq.${params.status}`;
    if(params.branchId) filters.origin_city_id=`eq.${params.branchId}`;
    if(params.search) filters.or=`(tracking_no.ilike.*${params.search}*,recipient_name.ilike.*${params.search}*,recipient_phone.ilike.*${params.search}*)`;
    const response=await request<Record<string,unknown>[]>(`/rest/v1/shipments?${qs(filters)}`,{headers:{Prefer:'count=exact'}},true);
    return {items:response.map(shipmentFromRow),total:Number(response.length)};
  }
}
class SupabaseRateService implements RateService {
  async calculateRate(params:CalculateRateParams):Promise<RateBreakdown>{
    const quote=await this.getQuote({...params}); return {baseRatePkr:quote.baseRatePkr,weightSurchargePkr:quote.weightSurchargePkr,codFeePkr:quote.codFeePkr,fuelSurchargePkr:quote.fuelSurchargePkr,gstPkr:quote.taxPkr,totalPkr:quote.totalPkr,estimatedDays:quote.estimatedDays};
  }
  async getQuote(input:QuoteInput):Promise<RateQuote>{
    const [services,zones]=await Promise.all([this.listServices(),rest<Record<string,unknown>[]>('delivery_zones',qs({select:'*',id:`eq.${input.destinationZoneId||'none'}`,limit:1}))]);
    const service=services.find(s=>s.id===input.serviceId && s.isActive);
    if(!service) throw new RateNotFoundError('No active shipping service was found.');
    const vol=input.lengthCm&&input.widthCm&&input.heightCm?(input.lengthCm*input.widthCm*input.heightCm)/5000:0;
    const chargeable=Math.max(input.weightKg,vol||0,0.1);
    const same=input.originCityId===input.destinationCityId;
    const base= same ? service.baseRatePkr : service.baseRatePkr;
    const weight=Math.max(0,Math.ceil(chargeable-service.baseWeightKg))*service.perAdditionalKgPkr;
    const cod=input.codAmountPkr&&service.allowsCod?Math.max(50,Math.round(input.codAmountPkr*.015)):0;
    const remote=input.isRemoteDestination||Boolean(zones[0]?.is_remote)?150:0;
    const fuel=Math.round((base+weight+cod+remote)*.05);
    const total=base+weight+cod+remote+fuel;
    return {baseRatePkr:base,weightSurchargePkr:weight,codFeePkr:cod,fuelSurchargePkr:fuel,remoteAreaFeePkr:remote||undefined,taxPkr:0,taxPercent:0,totalPkr:total,chargeableWeightKg:chargeable,volumetricWeightKg:vol||undefined,estimatedDays:same?'24 Hours':service.estimatedDeliveryDays,isSample:true,ruleName:'SAMPLE DEFAULT TARIFF',scopeUsed:same?'intra_city':'inter_city',notes:'Sample tariff only. Confirm final commercial rates before accepting payments.'};
  }
  private async listServices(){return new SupabaseGeographyService().listServices();}
}
class SupabaseTicketService implements TicketService {
  async createContactTicket(params:CreateTicketParams):Promise<TicketResult>{
    const phone=validatePkPhone(params.phone);
    if(!params.name.trim()) throw AppError.validation('Full name is required.');
    if(!phone.isValid) throw AppError.validation(phone.error||'Enter a valid Pakistani phone number.');
    if(params.message.trim().length<10) throw AppError.validation('Message must be at least 10 characters long.');
    const ticketNo=`TKT-${Date.now().toString().slice(-8)}`;
    const rows=await request<{ticket_no:string;created_at:string}[]>('/rest/v1/contact_tickets?select=ticket_no,created_at',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({ticket_no:ticketNo,name:params.name.trim(),phone:phone.normalized||params.phone.trim(),email:params.email?.trim()||null,message:params.message.trim()})});
    return {ticketNo:rows[0].ticket_no,createdAt:rows[0].created_at};
  }
}
class SupabaseSettingsService implements SettingsService {
  async getPublicSettings():Promise<SystemSettings>{
    const rows=await rest<{value:Record<string,unknown>}[]>('app_settings',qs({select:'value',key:'eq.public_company',limit:1}));
    return rows[0]?.value as unknown as SystemSettings || {...SAMPLE_SYSTEM_SETTINGS};
  }
  async getPublicContent():Promise<PublicContent>{
    const rows=await rest<{value:PublicContent}[]>('app_settings',qs({select:'value',key:'eq.public_content',limit:1}));
    return rows[0]?.value || SAMPLE_PUBLIC_CONTENT;
  }
}
export const supabaseServices = {
  auth: new SupabaseAuthService(), settings: new SupabaseSettingsService(), geography: new SupabaseGeographyService(),
  shipment: new SupabaseShipmentService(), tracking: new SupabaseTrackingService(), rate: new SupabaseRateService(), ticket: new SupabaseTicketService(),
};
