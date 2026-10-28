export interface RatesCarryOver {
  originCityId?: string;
  destinationCityId?: string;
  destinationZoneId?: string;
  serviceId?: string;
  weightKg?: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  isCod?: boolean;
  codAmountPkr?: number;
}

/**
 * Serializes rates calculator state into search parameters for /book
 */
export function serializeRatesToSearchParams(data: RatesCarryOver): URLSearchParams {
  const params = new URLSearchParams();
  if (data.originCityId) params.set('from', data.originCityId);
  if (data.destinationCityId) params.set('to', data.destinationCityId);
  if (data.destinationZoneId) params.set('zone', data.destinationZoneId);
  if (data.serviceId) params.set('service', data.serviceId);
  if (data.weightKg && data.weightKg > 0) params.set('weight', String(data.weightKg));
  if (data.lengthCm && data.lengthCm > 0) params.set('l', String(data.lengthCm));
  if (data.widthCm && data.widthCm > 0) params.set('w', String(data.widthCm));
  if (data.heightCm && data.heightCm > 0) params.set('h', String(data.heightCm));
  if (data.isCod && data.codAmountPkr && data.codAmountPkr > 0) {
    params.set('cod', String(data.codAmountPkr));
  }
  return params;
}

/**
 * Parses search parameters into carry-over data for /book
 */
export function parseRatesFromSearchParams(searchParams: URLSearchParams): RatesCarryOver {
  const result: RatesCarryOver = {};
  const from = searchParams.get('from');
  if (from) result.originCityId = from;

  const to = searchParams.get('to');
  if (to) result.destinationCityId = to;

  const zone = searchParams.get('zone');
  if (zone) result.destinationZoneId = zone;

  const service = searchParams.get('service');
  if (service) result.serviceId = service;

  const weight = searchParams.get('weight');
  if (weight && !isNaN(Number(weight)) && Number(weight) > 0) {
    result.weightKg = Number(weight);
  }

  const l = searchParams.get('l');
  if (l && !isNaN(Number(l)) && Number(l) > 0) {
    result.lengthCm = Number(l);
  }

  const w = searchParams.get('w');
  if (w && !isNaN(Number(w)) && Number(w) > 0) {
    result.widthCm = Number(w);
  }

  const h = searchParams.get('h');
  if (h && !isNaN(Number(h)) && Number(h) > 0) {
    result.heightCm = Number(h);
  }

  const cod = searchParams.get('cod');
  if (cod && !isNaN(Number(cod)) && Number(cod) > 0) {
    result.isCod = true;
    result.codAmountPkr = Number(cod);
  }

  return result;
}
