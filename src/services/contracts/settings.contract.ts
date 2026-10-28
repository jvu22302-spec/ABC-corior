import { SystemSettings, PublicContent } from '@/types/domain';

export interface SettingsService {
  getPublicSettings(): Promise<SystemSettings>;
  getPublicContent(): Promise<PublicContent>;
}
