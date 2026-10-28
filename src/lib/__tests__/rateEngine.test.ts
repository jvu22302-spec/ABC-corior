import { describe, it, expect } from 'vitest';
import { buildBreakdownRows, formToQuoteInput, calculateVolumetricWeight } from '../rateEngine';
import { RateQuote } from '@/services/contracts/rate.contract';

describe('rateEngine: buildBreakdownRows', () => {
  const baseQuote: RateQuote = {
    baseRatePkr: 250,
    weightSurchargePkr: 0,
    codFeePkr: 0,
    fuelSurchargePkr: 13,
    taxPkr: 0,
    taxPercent: 0,
    totalPkr: 263,
    chargeableWeightKg: 1,
    estimatedDays: '2 - 3 Days',
    isSample: true,
    ruleId: 'RULE-123',
    ruleName: 'STD-INTER',
    scopeUsed: 'inter_city',
    notes: 'Internal secret notes',
  };

  it('always includes Base Courier Tariff even when surcharges are zero', () => {
    const rows = buildBreakdownRows(baseQuote);
    expect(rows.some((r) => r.key === 'base' && r.amountPkr === 250)).toBe(true);
  });

  it('hides zero rows except base tariff (e.g. weight surcharge, cod fee, tax)', () => {
    const rows = buildBreakdownRows(baseQuote);
    expect(rows.some((r) => r.key === 'weight_surcharge')).toBe(false);
    expect(rows.some((r) => r.key === 'cod_fee')).toBe(false);
    expect(rows.some((r) => r.key === 'tax')).toBe(false);
    // Base and fuel are present
    expect(rows.map((r) => r.key)).toEqual(['base', 'fuel_surcharge']);
  });

  it('shows tax row only if tax > 0', () => {
    const quoteWithTax: RateQuote = {
      ...baseQuote,
      taxPkr: 45,
      taxPercent: 16,
      totalPkr: 308,
    };
    const rowsWithTax = buildBreakdownRows(quoteWithTax);
    const taxRow = rowsWithTax.find((r) => r.key === 'tax');
    expect(taxRow).toBeDefined();
    expect(taxRow?.amountPkr).toBe(45);
    expect(taxRow?.label).toContain('16%');

    // Without tax
    const rowsNoTax = buildBreakdownRows(baseQuote);
    expect(rowsNoTax.some((r) => r.key === 'tax')).toBe(false);
  });

  it('ensures total equals sum of shown rows', () => {
    const fullQuote: RateQuote = {
      baseRatePkr: 350,
      weightSurchargePkr: 250,
      codFeePkr: 75,
      remoteAreaFeePkr: 150,
      fuelSurchargePkr: 41,
      taxPkr: 0,
      taxPercent: 0,
      totalPkr: 866,
      chargeableWeightKg: 2,
      estimatedDays: 'Next Business Day',
      isSample: true,
    };

    const rows = buildBreakdownRows(fullQuote);
    const sum = rows.reduce((acc, row) => acc + row.amountPkr, 0);
    expect(sum).toBe(fullQuote.totalPkr);
  });

  it('does not leak internal fields (ruleId, ruleName, scopeUsed, notes) into output rows', () => {
    const rows = buildBreakdownRows(baseQuote);
    const serialized = JSON.stringify(rows).toLowerCase();
    expect(serialized).not.toContain('ruleid');
    expect(serialized).not.toContain('rulename');
    expect(serialized).not.toContain('scopeused');
    expect(serialized).not.toContain('internal secret notes');
    expect(serialized).not.toContain('notes');
  });
});

describe('rateEngine: formToQuoteInput', () => {
  const sampleZones = [
    { id: 'z1', name: 'Metro Sector', isRemote: false },
    { id: 'z2', name: 'Rural Mountain Area', isRemote: true },
  ];

  it('sets isRemoteDestination when destination zone is remote', () => {
    const input = formToQuoteInput(
      {
        originCityId: 'city-khi',
        destinationCityId: 'city-isb',
        destinationZoneId: 'z2',
        serviceId: 'srv-std',
        weightKg: 2,
      },
      sampleZones
    );

    expect(input.isRemoteDestination).toBe(true);
    expect(input.destinationZoneId).toBe('z2');
  });

  it('does not set isRemoteDestination when destination zone is non-remote', () => {
    const input = formToQuoteInput(
      {
        originCityId: 'city-khi',
        destinationCityId: 'city-isb',
        destinationZoneId: 'z1',
        serviceId: 'srv-std',
        weightKg: 2,
      },
      sampleZones
    );

    expect(input.isRemoteDestination).toBeUndefined();
  });

  it('omits empty optional fields (dimensions, cod, zone)', () => {
    const input = formToQuoteInput({
      originCityId: 'city-khi',
      destinationCityId: 'city-lhe',
      serviceId: 'srv-std',
      weightKg: '1.5',
      destinationZoneId: '',
      isCod: false,
      codAmountPkr: '',
      lengthCm: '',
      widthCm: '',
      heightCm: '',
    });

    expect(input.destinationZoneId).toBeUndefined();
    expect(input.isRemoteDestination).toBeUndefined();
    expect(input.codAmountPkr).toBeUndefined();
    expect(input.lengthCm).toBeUndefined();
    expect(input.widthCm).toBeUndefined();
    expect(input.heightCm).toBeUndefined();
    expect(input.weightKg).toBe(1.5);
  });

  it('omits incomplete dimensions (if any dimension is missing or zero)', () => {
    const input = formToQuoteInput({
      originCityId: 'city-khi',
      destinationCityId: 'city-lhe',
      serviceId: 'srv-std',
      weightKg: 2,
      lengthCm: 20,
      widthCm: 15,
      heightCm: 0, // Incomplete
    });

    expect(input.lengthCm).toBeUndefined();
    expect(input.widthCm).toBeUndefined();
    expect(input.heightCm).toBeUndefined();
  });

  it('includes complete valid dimensions and cod amount when active', () => {
    const input = formToQuoteInput({
      originCityId: 'city-khi',
      destinationCityId: 'city-lhe',
      serviceId: 'srv-std',
      weightKg: 3,
      isCod: true,
      codAmountPkr: 5000,
      lengthCm: 30,
      widthCm: 20,
      heightCm: 15,
    });

    expect(input.codAmountPkr).toBe(5000);
    expect(input.lengthCm).toBe(30);
    expect(input.widthCm).toBe(20);
    expect(input.heightCm).toBe(15);
  });
});

describe('rateEngine: calculateVolumetricWeight', () => {
  it('computes (L x W x H) / 5000 rounded to 1 decimal place', () => {
    // 50 x 40 x 30 = 60,000 / 5,000 = 12.0 kg
    expect(calculateVolumetricWeight(50, 40, 30)).toBe(12.0);
    // 25 x 20 x 15 = 7,500 / 5,000 = 1.5 kg
    expect(calculateVolumetricWeight(25, 20, 15)).toBe(1.5);
  });

  it('returns 0 if any dimension is missing or invalid', () => {
    expect(calculateVolumetricWeight(undefined, 20, 15)).toBe(0);
    expect(calculateVolumetricWeight(25, 0, 15)).toBe(0);
    expect(calculateVolumetricWeight(-5, 20, 15)).toBe(0);
  });
});
