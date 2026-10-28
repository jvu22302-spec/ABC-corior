import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { geographyService } from '@/services';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { AppImage } from '@/components/media/AppImage';
import { Search, MapPin, Building2, Phone, Mail, AlertTriangle, ShieldAlert } from 'lucide-react';

export function CoveragePage() {
  useDocumentTitle('Coverage & Hubs');

  const {
    data: cities,
    isLoading: citiesLoading,
    isError: citiesError,
    refetch: refetchCities,
  } = useQuery({
    queryKey: ['cities'],
    queryFn: () => geographyService.listCities(),
  });

  const { data: branches, isLoading: branchesLoading } = useQuery({
    queryKey: ['branches'],
    queryFn: () => geographyService.listBranches(),
  });

  const { data: zones } = useQuery({
    queryKey: ['zones'],
    queryFn: () => geographyService.listZones(),
  });

  const [searchInput, setSearchInput] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // 250ms debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchInput.trim());
    }, 250);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Filter cities by name case-insensitive
  const filteredCities = useMemo(() => {
    if (!cities) return [];
    if (!debouncedQuery) return cities;
    const q = debouncedQuery.toLowerCase();
    return cities.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.province.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [cities, debouncedQuery]);

  // Check if any zone in filtered cities is marked remote
  const hasRemoteZones = useMemo(() => {
    if (!zones) return false;
    const cityIds = new Set(filteredCities.map((c) => c.id));
    return zones.some((z) => cityIds.has(z.cityId) && z.isRemote);
  }, [zones, filteredCities]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-ink-900 tracking-tight">
          Branch & Hub Coverage Network
        </h1>
        <p className="text-xs sm:text-sm text-ink-600">
          Regional sorting facilities and active doorstep delivery sectors across Pakistan.
        </p>
      </div>

      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
        <span>SAMPLE COVERAGE DATA — Replace with actual operating branches and sectors before production launch.</span>
      </div>

      {/* Network Overview Visual via AppImage IMG-13 */}
      <div>
        <AppImage id="IMG-13" className="w-full shadow-md" />
      </div>

      {/* Primary Regional Gateways / Hubs */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-ink-900 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-brand-600" />
          <span>Regional Sorting Hubs & Branches</span>
        </h2>

        {branchesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-36 w-full" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {branches?.map((branch) => (
              <Card key={branch.id} className="border-t-2 border-t-brand-600">
                <div className="text-[11px] font-mono text-brand-600 font-semibold mb-1">
                  {branch.code} {branch.isHub && '· PRIMARY HUB'}
                </div>
                <h3 className="text-sm font-bold text-ink-900 mb-2">{branch.name}</h3>
                <div className="space-y-2 text-xs text-ink-600">
                  <p className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-ink-400 mt-0.5 shrink-0" />
                    <span>{branch.address}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-ink-400 shrink-0" />
                    <span>{branch.phone}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-ink-400 shrink-0" />
                    <span>{branch.email}</span>
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Cities and Delivery Sectors */}
      <div className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-ink-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-accent-500" />
              <span>Serviceable Cities & Delivery Sectors</span>
            </h2>
            <p className="text-xs text-ink-600 mt-0.5">
              Search by city name or province to explore delivery coverage
            </p>
          </div>

          {/* Search Box */}
          <div className="w-full sm:w-72 relative">
            <Search className="w-4 h-4 text-ink-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Filter cities..."
              aria-label="Filter cities by name"
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-surface border border-ink-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-600 text-ink-900 placeholder:text-ink-400 shadow-2xs"
            />
          </div>
        </div>

        {/* Note if any zone is remote */}
        {hasRemoteZones && (
          <div className="p-3 bg-amber-50/70 border border-amber-200 text-xs text-amber-900 rounded-md flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Note:</strong> Outskirts and remote sectors are marked. Surcharges may apply to deliveries in these designated zones.
            </span>
          </div>
        )}

        {/* Loading skeleton */}
        {citiesLoading && (
          <div className="space-y-4">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        )}

        {/* Error state */}
        {citiesError && (
          <ErrorState
            title="Unable to load cities"
            message="Failed to retrieve operational geography."
            onRetry={() => refetchCities()}
          />
        )}

        {/* Empty state */}
        {!citiesLoading && !citiesError && filteredCities.length === 0 && (
          <EmptyState
            title="No Matching Cities Found"
            description={`No delivery locations matched your search for "${debouncedQuery}".`}
            action={
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="text-xs font-semibold text-brand-600 hover:underline"
              >
                Clear filter
              </button>
            }
          />
        )}

        {/* City Cards with Zone Chips */}
        {!citiesLoading && !citiesError && filteredCities.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCities.map((city) => {
              const cityZones = zones?.filter((z) => z.cityId === city.id) || [];

              return (
                <Card key={city.id} className="p-5 border-ink-200 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-ink-100">
                    <div>
                      <h3 className="text-base font-bold text-ink-900">{city.name}</h3>
                      <span className="text-xs text-ink-500">{city.province}</span>
                    </div>
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-700">
                      {city.code}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider block mb-2">
                      Active Delivery Sectors ({cityZones.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {cityZones.map((z) => (
                        <span
                          key={z.id}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md border ${
                            z.isRemote
                              ? 'bg-amber-50 text-amber-900 border-amber-300 font-medium'
                              : 'bg-surface-muted text-ink-700 border-ink-200'
                          }`}
                        >
                          <span>{z.name}</span>
                          {z.isRemote && (
                            <span className="text-[9px] px-1 bg-amber-200 text-amber-900 rounded font-semibold uppercase">
                              Remote
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
