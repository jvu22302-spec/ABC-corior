import { RateQuote, QuoteInput } from '@/services/contracts/rate.contract';

export interface BreakdownRow {
  key: string;
  label: string;
  amountPkr: number;
}

/**
 * Builds displayable tariff breakdown rows from a RateQuote.
 * Rules:
 * - Base Courier Tariff is always shown.
 * - Zero rows are hidden except Base (e.g. if surcharge is 0, do not display).
 * - Tax row is shown only if tax > 0.
 * - Total equals sum of shown rows.
 * - No internal fields (ruleId, ruleName, scopeUsed, notes are strictly excluded).
 */
export function buildBreakdownRows(quote: RateQuote): BreakdownRow[] {
  const rows: BreakdownRow[] = [];

  // Base Courier Tariff (always displayed)
  rows.push({
    key: 'base',
    label: 'Base Courier Tariff',
    amountPkr: quote.baseRatePkr,
  });

  // Weight surcharge (only if > 0)
  if (quote.weightSurchargePkr > 0) {
    rows.push({
      key: 'weight_surcharge',
      label: 'Weight Surcharge',
      amountPkr: quote.weightSurchargePkr,
    });
  }

  // COD Handling Fee (only if > 0)
  if (quote.codFeePkr > 0) {
    rows.push({
      key: 'cod_fee',
      label: 'COD Handling Fee',
      amountPkr: quote.codFeePkr,
    });
  }

  // Remote Area Surcharge (only if > 0)
  if (quote.remoteAreaFeePkr && quote.remoteAreaFeePkr > 0) {
    rows.push({
      key: 'remote_fee',
      label: 'Remote Area Surcharge',
      amountPkr: quote.remoteAreaFeePkr,
    });
  }

  // Fuel Surcharge (only if > 0)
  if (quote.fuelSurchargePkr > 0) {
    rows.push({
      key: 'fuel_surcharge',
      label: 'Fuel Surcharge (5%)',
      amountPkr: quote.fuelSurchargePkr,
    });
  }

  // Sales Tax / GST (only if > 0)
  if (quote.taxPkr > 0) {
    rows.push({
      key: 'tax',
      label: `Sales Tax / GST (${quote.taxPercent}%)`,
      amountPkr: quote.taxPkr,
    });
  }

  return rows;
}

export interface RateFormValues {
  originCityId: string;
  destinationCityId: string;
  destinationZoneId?: string;
  isRemoteDestination?: boolean;
  serviceId: string;
  weightKg: number | string;
  lengthCm?: number | string;
  widthCm?: number | string;
  heightCm?: number | string;
  isCod?: boolean;
  codAmountPkr?: number | string;
}

/**
 * Converts user form input into a sanitized QuoteInput DTO.
 * Rules:
 * - Remote zone sets isRemoteDestination = true.
 * - Empty optional fields are omitted.
 * - Non-COD ignores codAmount.
 * - Incomplete dimensions are omitted.
 */
export function formToQuoteInput(
  form: RateFormValues,
  zones?: { id: string; isRemote?: boolean }[]
): QuoteInput {
  const isRemote =
    Boolean(form.isRemoteDestination) ||
    Boolean(form.destinationZoneId && zones?.find((z) => z.id === form.destinationZoneId)?.isRemote);

  const length = form.lengthCm ? Number(form.lengthCm) : undefined;
  const width = form.widthCm ? Number(form.widthCm) : undefined;
  const height = form.heightCm ? Number(form.heightCm) : undefined;

  const hasCompleteDimensions =
    length !== undefined &&
    length > 0 &&
    width !== undefined &&
    width > 0 &&
    height !== undefined &&
    height > 0;

  const cod =
    form.isCod && form.codAmountPkr ? Number(form.codAmountPkr) : undefined;

  const input: QuoteInput = {
    originCityId: form.originCityId,
    destinationCityId: form.destinationCityId,
    serviceId: form.serviceId,
    weightKg: Number(form.weightKg) > 0 ? Number(form.weightKg) : 1,
  };

  if (form.destinationZoneId && form.destinationZoneId.trim() !== '') {
    input.destinationZoneId = form.destinationZoneId;
  }

  if (isRemote) {
    input.isRemoteDestination = true;
  }

  if (hasCompleteDimensions) {
    input.lengthCm = length;
    input.widthCm = width;
    input.heightCm = height;
  }

  if (cod !== undefined && cod > 0) {
    input.codAmountPkr = cod;
  }

  return input;
}

/**
 * Calculates volumetric weight in KG: (L x W x H in cm) / divisor.
 * Standard domestic courier divisor is 5000.
 */
export function calculateVolumetricWeight(
  lengthCm?: number,
  widthCm?: number,
  heightCm?: number,
  divisor = 5000
): number {
  if (!lengthCm || !widthCm || !heightCm || lengthCm <= 0 || widthCm <= 0 || heightCm <= 0) {
    return 0;
  }
  return Math.round(((lengthCm * widthCm * heightCm) / divisor) * 10) / 10;
}
