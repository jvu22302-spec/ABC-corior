import { AuthService, SignInParams } from '../contracts/auth.contract';
import { Profile } from '@/types/domain';
import { AppError } from '@/lib/errors';
import { DEMO_PASSWORD } from '@/config/constants';
import { SAMPLE_USERS } from './seedData';

const SESSION_STORAGE_KEY = 'abc_auth_session_user_id';

// Helper to simulate realistic network latency (200-400ms)
const simulateLatency = (min = 200, max = 350) =>
  new Promise((resolve) => setTimeout(resolve, Math.floor(Math.random() * (max - min + 1)) + min));

export class MockAuthService implements AuthService {
  private currentSession: Profile | null = null;

  constructor() {
    // Restore mock session ID if present
    try {
      const storedId = localStorage.getItem(SESSION_STORAGE_KEY);
      if (storedId) {
        const found = SAMPLE_USERS.find((u) => u.id === storedId && u.isActive);
        if (found) {
          this.currentSession = found;
        }
      }
    } catch {
      // Fallback silently if localStorage is restricted
    }
  }

  async signIn({ email, password }: SignInParams): Promise<Profile> {
    await simulateLatency();

    if (!email || !password) {
      throw AppError.validation('Email and password are required.');
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = SAMPLE_USERS.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      throw AppError.validation('Invalid email or password.');
    }

    if (!user.isActive) {
      throw AppError.forbidden('This account has been deactivated. Please contact support.');
    }

    if (password !== DEMO_PASSWORD) {
      throw AppError.validation('Invalid email or password.');
    }

    this.currentSession = user;
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, user.id);
    } catch {
      // Ignore localStorage errors
    }

    return user;
  }

  async signOut(): Promise<void> {
    await simulateLatency(100, 200);
    this.currentSession = null;
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // Ignore
    }
  }

  async getSession(): Promise<Profile | null> {
    await simulateLatency(100, 200);
    if (this.currentSession) return this.currentSession;

    try {
      const storedId = localStorage.getItem(SESSION_STORAGE_KEY);
      if (storedId) {
        const found = SAMPLE_USERS.find((u) => u.id === storedId && u.isActive);
        if (found) {
          this.currentSession = found;
          return found;
        }
      }
    } catch {
      // Ignore
    }

    return null;
  }

  async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    await simulateLatency();
    if (!email || !email.includes('@')) {
      throw AppError.validation('Please provide a valid email address.');
    }

    // Always return generic message to prevent email enumeration
    return {
      success: true,
      message: 'If the email exists, a reset link has been sent.',
    };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean }> {
    await simulateLatency();
    if (!token) {
      throw AppError.validation('Invalid or expired password reset token.');
    }
    if (!newPassword || newPassword.length < 8) {
      throw AppError.validation('Password must be at least 8 characters long.');
    }

    return { success: true };
  }
}
