/**
 * Validated Environment Variables
 */
import { z } from 'zod';

const envSchema = z.object({
  VITE_DATA_SOURCE: z.enum(['mock', 'supabase']).default('mock'),
  VITE_APP_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  VITE_SUPABASE_URL: z.string().optional().default(''),
  VITE_SUPABASE_PUBLISHABLE_KEY: z.string().optional().default(''),
  VITE_TURNSTILE_SITE_KEY: z.string().optional().default(''),
});

const parsed = envSchema.safeParse({
  VITE_DATA_SOURCE: import.meta.env.VITE_DATA_SOURCE || 'mock',
  VITE_APP_ENV: import.meta.env.VITE_APP_ENV || 'development',
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '',
  VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
  VITE_TURNSTILE_SITE_KEY: import.meta.env.VITE_TURNSTILE_SITE_KEY || '',
});

if (!parsed.success) {
  console.warn('Invalid environment configuration:', parsed.error.format());
}

export const env = parsed.success
  ? parsed.data
  : {
      VITE_DATA_SOURCE: 'mock' as const,
      VITE_APP_ENV: 'development' as const,
      VITE_SUPABASE_URL: '',
      VITE_SUPABASE_PUBLISHABLE_KEY: '',
      VITE_TURNSTILE_SITE_KEY: '',
    };
