import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Profile, AppRole } from '@/types/domain';
import { authService, SignInParams } from '@/services';
import { DEMO_USERS, DEMO_PASSWORD } from '@/config/constants';

interface AuthContextType {
  user: Profile | null;
  role: AppRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (params: SignInParams) => Promise<Profile>;
  signOut: () => Promise<void>;
  switchDemoRole: (role: AppRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session on mount
  useEffect(() => {
    let mounted = true;
    async function loadSession() {
      try {
        const session = await authService.getSession();
        if (mounted) {
          setUser(session);
        }
      } catch (err) {
        console.error('Failed to restore session:', err);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }
    loadSession();
    return () => {
      mounted = false;
    };
  }, []);

  const signIn = useCallback(async (params: SignInParams) => {
    setIsLoading(true);
    try {
      const profile = await authService.signIn(params);
      setUser(profile);
      return profile;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.signOut();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const switchDemoRole = useCallback(
    async (targetRole: AppRole) => {
      const demoUser = DEMO_USERS.find((u) => u.role === targetRole);
      if (demoUser) {
        await signIn({
          email: demoUser.email,
          password: DEMO_PASSWORD,
        });
      }
    },
    [signIn]
  );

  const value: AuthContextType = {
    user,
    role: user?.role ?? null,
    isAuthenticated: !!user,
    isLoading,
    signIn,
    signOut,
    switchDemoRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
