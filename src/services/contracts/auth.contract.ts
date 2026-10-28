import { Profile } from '@/types/domain';

export interface SignInParams {
  email: string;
  password: string;
}

export interface PasswordResetParams {
  email: string;
}

export interface AuthService {
  signIn(params: SignInParams): Promise<Profile>;
  signOut(): Promise<void>;
  getSession(): Promise<Profile | null>;
  requestPasswordReset(email: string): Promise<{ success: boolean; message: string }>;
  resetPassword(token: string, newPassword: string): Promise<{ success: boolean }>;
}
