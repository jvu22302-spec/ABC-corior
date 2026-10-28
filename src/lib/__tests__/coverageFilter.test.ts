import { describe, it, expect } from 'vitest';
import { City } from '@/types/domain';

export function filterCoverageCities(cities: City[], query: string): City[] {
  if (!query.trim()) return cities;
  const q = query.toLowerCase().trim();
  return cities.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.province.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q)
  );
}

describe('Coverage Search Filter', () => {
  const sampleCities: City[] = [
    { id: '1', code: 'KHI', name: 'Karachi', province: 'Sindh', isActive: true },
    { id: '2', code: 'LHE', name: 'Lahore', province: 'Punjab', isActive: true },
    { id: '3', code: 'ISB', name: 'Islamabad', province: 'Islamabad Capital Territory', isActive: true },
    { id: '4', code: 'RWP', name: 'Rawalpindi', province: 'Punjab', isActive: true },
    { id: '5', code: 'FSD', name: 'Faisalabad', province: 'Punjab', isActive: true },
  ];

  it('returns all cities when query is empty or whitespace', () => {
    expect(filterCoverageCities(sampleCities, '')).toHaveLength(5);
    expect(filterCoverageCities(sampleCities, '   ')).toHaveLength(5);
  });

  it('filters cities by city name case-insensitively', () => {
    const res = filterCoverageCities(sampleCities, 'karachi');
    expect(res).toHaveLength(1);
    expect(res[0].code).toBe('KHI');
  });

  it('filters cities by province name', () => {
    const punjabCities = filterCoverageCities(sampleCities, 'punjab');
    expect(punjabCities).toHaveLength(3); // Lahore, Rawalpindi, Faisalabad
  });

  it('filters cities by airport / station code', () => {
    const isb = filterCoverageCities(sampleCities, 'ISB');
    expect(isb).toHaveLength(1);
    expect(isb[0].name).toBe('Islamabad');
  });

  it('returns empty array when no matches exist', () => {
    expect(filterCoverageCities(sampleCities, 'Peshawar')).toHaveLength(0);
  });
});
