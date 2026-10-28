import { useQuery } from '@tanstack/react-query';
import { settingsService } from '@/services';
import { SystemSettings } from '@/types/domain';

export function useSettings() {
  return useQuery<SystemSettings>({
    queryKey: ['settings', 'public'],
    queryFn: () => settingsService.getPublicSettings(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
