import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  AuthUser,
  AuthSession,
  SignInParams,
  SignUpParams,
  signInUser,
  signUpUser,
  signOutUser,
  restoreSession,
  requestPasswordReset,
  updateUserProfile,
  updateUserPassword,
} from './authService';
import { UserProfile, subscribeToDataChanges, getStoredSessionUser } from '../storage/localPersistence';

export interface AuthContextValue {
  user: AuthUser | null;
  profile: UserProfile | null;
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (params: SignInParams) => Promise<{ success: boolean; error?: string }>;
  signUp: (params: SignUpParams) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (
    updates: Partial<Pick<UserProfile, 'displayName' | 'bio' | 'city' | 'avatarUrl' | 'preferences'>>
  ) => Promise<UserProfile | null>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(() => getStoredSessionUser());
  const [isLoading, setIsLoading] = useState<boolean>(() => !getStoredSessionUser());

  const syncSession = useCallback(async () => {
    try {
      const active = await restoreSession();
      setSession(active);
    } catch {
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    syncSession();

    // Subscribe to external changes (e.g. storage updates or other tabs)
    const unsubscribe = subscribeToDataChanges((type) => {
      if (type === 'auth') {
        syncSession();
      }
    });

    return unsubscribe;
  }, [syncSession]);

  const signIn = useCallback(async (params: SignInParams) => {
    setIsLoading(true);
    try {
      const result = await signInUser(params);
      if (result.session) {
        setSession(result.session);
        return { success: true };
      }
      return { success: false, error: result.error || 'Failed to sign in.' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signUp = useCallback(async (params: SignUpParams) => {
    setIsLoading(true);
    try {
      const result = await signUpUser(params);
      if (result.session) {
        setSession(result.session);
        return { success: true };
      }
      return { success: false, error: result.error || 'Failed to create account.' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      await signOutUser();
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    return requestPasswordReset(email);
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    return updateUserPassword(newPassword);
  }, []);

  const updateProfile = useCallback(
    async (
      updates: Partial<Pick<UserProfile, 'displayName' | 'bio' | 'city' | 'avatarUrl' | 'preferences'>>
    ) => {
      if (!session?.user?.id) return null;
      const updated = await updateUserProfile(session.user.id, updates);
      if (updated) {
        setSession((prev) => (prev ? { ...prev, profile: updated } : null));
      }
      return updated;
    },
    [session?.user?.id]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user || null,
      profile: session?.profile || null,
      session,
      isLoading,
      isAuthenticated: Boolean(session?.user),
      signIn,
      signUp,
      signOut,
      resetPassword,
      updatePassword,
      updateProfile,
      refreshSession: syncSession,
    }),
    [session, isLoading, signIn, signUp, signOut, resetPassword, updatePassword, updateProfile, syncSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      profile: null,
      session: null,
      isLoading: false,
      isAuthenticated: false,
      signIn: async () => ({ success: false, error: 'Auth context not mounted' }),
      signUp: async () => ({ success: false, error: 'Auth context not mounted' }),
      signOut: async () => {},
      resetPassword: async () => ({ success: false, message: '', error: 'Auth context not mounted' }),
      updatePassword: async () => ({ success: false, error: 'Auth context not mounted' }),
      updateProfile: async () => null,
      refreshSession: async () => {},
    };
  }
  return context;
};
