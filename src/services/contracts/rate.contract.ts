export interface CalculateRateParams {
  originCityId: string;
  destinationCityId: string;
  weightKg: number;
  serviceId: string;
  codAmountPkr?: number;
}

export interface RateBreakdown {
  baseRatePkr: number;
  weightSurchargePkr: number;
  codFeePkr: number;
  fuelSurchargePkr: number;
  gstPkr: number;
  totalPkr: number;
  estimatedDays: string;
}

export class RateNotFoundError extends Error {
  constructor(message = 'No tariff rule found for this route and service.') {
    super(message);
    this.name = 'RateNotFoundError';
  }
}

export interface QuoteInput {
  originCityId: string;
  destinationCityId: string;
  destinationZoneId?: string;
  isRemoteDestination?: boolean;
  serviceId: string;
  weightKg: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  codAmountPkr?: number;
}

export interface RateQuote {
  baseRatePkr: number;
  weightSurchargePkr: number;
  codFeePkr: number;
  fuelSurchargePkr: number;
  remoteAreaFeePkr?: number;
  taxPkr: number;
  taxPercent: number;
  totalPkr: number;
  chargeableWeightKg: number;
  volumetricWeightKg?: number;
  estimatedDays: string;
  isSample: boolean;
  ruleId?: string;
  ruleName?: string;
  scopeUsed?: string;
  notes?: string;
}

export interface RateService {
  /**
   * @deprecated Use getQuote instead. Kept for legacy compatibility.
   */
  calculateRate(params: CalculateRateParams): Promise<RateBreakdown>;
  getQuote(input: QuoteInput): Promise<RateQuote>;
}
