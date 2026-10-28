import { describe, it, expect } from 'vitest';
import {
  serializeRatesToSearchParams,
  parseRatesFromSearchParams,
  RatesCarryOver,
} from '../bookingCarryOver';

describe('bookingCarryOver: serializeRatesToSearchParams and parseRatesFromSearchParams', () => {
  it('round-trips full carry-over state correctly', () => {
    const original: RatesCarryOver = {
      originCityId: 'city-khi',
      destinationCityId: 'city-lhe',
      destinationZoneId: 'zone-lhe-1',
      serviceId: 'srv-exp',
      weightKg: 3.5,
      lengthCm: 25,
      widthCm: 20,
      heightCm: 15,
      isCod: true,
      codAmountPkr: 4500,
    };

    const params = serializeRatesToSearchParams(original);
    const parsed = parseRatesFromSearchParams(params);

    expect(parsed.originCityId).toBe('city-khi');
    expect(parsed.destinationCityId).toBe('city-lhe');
    expect(parsed.destinationZoneId).toBe('zone-lhe-1');
    expect(parsed.serviceId).toBe('srv-exp');
    expect(parsed.weightKg).toBe(3.5);
    expect(parsed.lengthCm).toBe(25);
    expect(parsed.widthCm).toBe(20);
    expect(parsed.heightCm).toBe(15);
    expect(parsed.isCod).toBe(true);
    expect(parsed.codAmountPkr).toBe(4500);
  });

  it('handles minimal parameters with empty optionals', () => {
    const minimal: RatesCarryOver = {
      originCityId: 'city-isb',
      destinationCityId: 'city-rwp',
      serviceId: 'srv-std',
      weightKg: 1,
    };

    const params = serializeRatesToSearchParams(minimal);
    const parsed = parseRatesFromSearchParams(params);

    expect(parsed.originCityId).toBe('city-isb');
    expect(parsed.destinationCityId).toBe('city-rwp');
    expect(parsed.serviceId).toBe('srv-std');
    expect(parsed.weightKg).toBe(1);
    expect(parsed.destinationZoneId).toBeUndefined();
    expect(parsed.isCod).toBeUndefined();
    expect(parsed.codAmountPkr).toBeUndefined();
    expect(parsed.lengthCm).toBeUndefined();
  });

  it('safely handles empty or corrupted search params', () => {
    const emptyParams = new URLSearchParams('');
    const parsed = parseRatesFromSearchParams(emptyParams);

    expect(parsed).toEqual({});

    const corruptedParams = new URLSearchParams('weight=invalid&cod=abc&l=-10');
    const parsedCorrupted = parseRatesFromSearchParams(corruptedParams);
    expect(parsedCorrupted.weightKg).toBeUndefined();
    expect(parsedCorrupted.codAmountPkr).toBeUndefined();
    expect(parsedCorrupted.lengthCm).toBeUndefined();
  });
});
