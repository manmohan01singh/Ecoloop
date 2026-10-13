import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Custom storage adapter compatible with React Native Web, Expo, and Node test environments
const customStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch {
      // In-memory or sandbox fallback
    }
    return (memoryStorage as Record<string, string>)[key] || null;
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch {
      // In-memory fallback
    }
    (memoryStorage as Record<string, string>)[key] = value;
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
        return;
      }
    } catch {
      // In-memory fallback
    }
    delete (memoryStorage as Record<string, string>)[key];
  },
};

const memoryStorage: Record<string, string> = {};

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(SUPABASE_URL) &&
    Boolean(SUPABASE_ANON_KEY) &&
    !SUPABASE_URL.includes('your-project-id') &&
    SUPABASE_URL.startsWith('http')
  );
};

let clientInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient => {
  if (clientInstance) {
    return clientInstance;
  }

  // If not configured, instantiate with dummy URL for schema-safe calls or fallback
  const url = isSupabaseConfigured() ? SUPABASE_URL : 'https://ecoloop-placeholder.supabase.co';
  const anonKey = isSupabaseConfigured() ? SUPABASE_ANON_KEY : 'ecoloop_placeholder_anon_key';

  clientInstance = createClient(url, anonKey, {
    auth: {
      storage: customStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });

  return clientInstance;
};

export const supabase = getSupabaseClient();
