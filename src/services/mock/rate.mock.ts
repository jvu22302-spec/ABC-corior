import {
  CalculateRateParams,
  RateBreakdown,
  RateService,
  QuoteInput,
  RateQuote,
  RateNotFoundError,
} from '../contracts/rate.contract';
import { SAMPLE_SERVICES, SAMPLE_CITIES } from './seedData';

const simulateLatency = (min = 150, max = 300) =>
  new Promise((resolve) => setTimeout(resolve, Math.floor(Math.random() * (max - min + 1)) + min));

export class MockRateService implements RateService {
  /**
   * @deprecated Use getQuote instead. Kept for legacy compatibility.
   */
  async calculateRate(params: CalculateRateParams): Promise<RateBreakdown> {
    await simulateLatency();

    const isSameCity = params.originCityId === params.destinationCityId;
    const baseRate = isSameCity ? 200 : 350;
    const weight = Math.max(1, params.weightKg);
    const weightSurcharge = Math.ceil(weight - 1) * 150;
    const codFee = params.codAmountPkr ? Math.max(50, Math.round(params.codAmountPkr * 0.015)) : 0;
    const subtotal = baseRate + weightSurcharge + codFee;
    const fuelSurcharge = Math.round(subtotal * 0.05);
    // Tax comes from rule; default sample rule tax is 0%
    const gst = 0;
    const total = subtotal + fuelSurcharge + gst;

    return {
      baseRatePkr: baseRate,
      weightSurchargePkr: weightSurcharge,
      codFeePkr: codFee,
      fuelSurchargePkr: fuelSurcharge,
      gstPkr: gst,
      totalPkr: total,
      estimatedDays: isSameCity ? '24 Hours' : '2 - 3 Days',
    };
  }

  async getQuote(input: QuoteInput): Promise<RateQuote> {
    await simulateLatency();

    // Validate origin and destination cities
    const originValid = SAMPLE_CITIES.some((c) => c.id === input.originCityId);
    const destValid = SAMPLE_CITIES.some((c) => c.id === input.destinationCityId);
    const service = SAMPLE_SERVICES.find((s) => s.id === input.serviceId);

    if (!originValid || !destValid || !service || !service.isActive) {
      throw new RateNotFoundError(`No tariff rule available for route or service: ${input.serviceId}`);
    }

    // Volumetric weight: (L x W x H) / 5000
    let volumetricWeightKg: number | undefined;
    if (
      input.lengthCm &&
      input.lengthCm > 0 &&
      input.widthCm &&
      input.widthCm > 0 &&
      input.heightCm &&
      input.heightCm > 0
    ) {
      volumetricWeightKg = Math.round(((input.lengthCm * input.widthCm * input.heightCm) / 5000) * 10) / 10;
    }

    const physicalWeight = Math.max(0.1, input.weightKg);
    const chargeableWeightKg = volumetricWeightKg
      ? Math.max(physicalWeight, volumetricWeightKg)
      : physicalWeight;

    const isSameCity = input.originCityId === input.destinationCityId;

    // Base tariff
    const isExpress = service.code === 'EXP';
    const baseRate = isSameCity
      ? (isExpress ? 350 : 200)
      : (isExpress ? 450 : 250);

    // Weight surcharge: base weight is 1kg
    const additionalKg = Math.max(0, chargeableWeightKg - 1);
    const additionalKgRate = isExpress ? 250 : 150;
    const weightSurchargePkr = additionalKg > 0 ? Math.ceil(additionalKg) * additionalKgRate : 0;

    // COD Handling fee (if applicable)
    let codFeePkr = 0;
    if (input.codAmountPkr && input.codAmountPkr > 0 && service.allowsCod) {
      // 1.5% with minimum PKR 50
      codFeePkr = Math.max(50, Math.round(input.codAmountPkr * 0.015));
    }

    // Remote area fee
    const remoteAreaFeePkr = input.isRemoteDestination ? 150 : 0;

    // Subtotal & Surcharges
    const subtotal = baseRate + weightSurchargePkr + codFeePkr + remoteAreaFeePkr;
    const fuelSurchargePkr = Math.round(subtotal * 0.05);

    // Tax rule: tax comes ONLY from rule.taxPercent; default sample rules have taxPercent 0
    const ruleTaxPercent = 0; // default sample rule tax is 0%
    const taxPkr = ruleTaxPercent > 0 ? Math.round((subtotal + fuelSurchargePkr) * (ruleTaxPercent / 100)) : 0;

    const totalPkr = subtotal + fuelSurchargePkr + taxPkr;

    const estimatedDays = isSameCity
      ? (isExpress ? 'Same Day (12 hrs)' : '24 Hours')
      : (isExpress ? 'Next Business Day' : '2 - 3 Days');

    return {
      baseRatePkr: baseRate,
      weightSurchargePkr,
      codFeePkr,
      remoteAreaFeePkr: remoteAreaFeePkr > 0 ? remoteAreaFeePkr : undefined,
      fuelSurchargePkr,
      taxPkr,
      taxPercent: ruleTaxPercent,
      totalPkr,
      chargeableWeightKg,
      volumetricWeightKg,
      estimatedDays,
      isSample: true,
      ruleId: 'RULE-SAMPLE-001',
      ruleName: `${service.code}-${isSameCity ? 'INTRA' : 'INTER'}-STD`,
      scopeUsed: isSameCity ? 'intra_city' : 'inter_city',
      notes: 'Sample tariff rule applied',
    };
  }
}
