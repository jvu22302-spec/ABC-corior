import { PublicTracking } from '@/types/domain';

export class RateLimitedError extends Error {
  readonly retryAfterSeconds: number;

  constructor(retryAfterSeconds = 60, message?: string) {
    super(message || `Rate limit exceeded. Please retry in ${retryAfterSeconds} seconds.`);
    this.name = 'RateLimitedError';
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export interface TrackingService {
  track(trackingNo: string, skipDelay?: boolean): Promise<PublicTracking | null>;
}
