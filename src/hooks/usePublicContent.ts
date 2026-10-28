import { useQuery } from '@tanstack/react-query';
import { settingsService } from '@/services';
import { PublicContent } from '@/types/domain';

export function usePublicContent() {
  return useQuery<PublicContent>({
    queryKey: ['settings', 'content'],
    queryFn: () => settingsService.getPublicContent(),
    staleTime: 1000 * 60 * 10,
  });
}
