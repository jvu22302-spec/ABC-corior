import { SettingsService } from '../contracts/settings.contract';
import { SystemSettings, PublicContent } from '@/types/domain';
import { SAMPLE_SYSTEM_SETTINGS, SAMPLE_PUBLIC_CONTENT } from './seedData';

const simulateLatency = (min = 150, max = 300) =>
  new Promise((resolve) => setTimeout(resolve, Math.floor(Math.random() * (max - min + 1)) + min));

export class MockSettingsService implements SettingsService {
  async getPublicSettings(): Promise<SystemSettings> {
    await simulateLatency();
    return { ...SAMPLE_SYSTEM_SETTINGS };
  }

  async getPublicContent(): Promise<PublicContent> {
    await simulateLatency();
    return JSON.parse(JSON.stringify(SAMPLE_PUBLIC_CONTENT));
  }
}
