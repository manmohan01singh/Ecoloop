export type ThemeMode = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'ecoloop_theme_mode_preference';

let memoryCache: ThemeMode = 'system';
const listeners = new Set<(mode: ThemeMode) => void>();

function isLocalStorageAvailable(): boolean {
  try {
    return (
      typeof window !== 'undefined' &&
      typeof window.localStorage !== 'undefined' &&
      window.localStorage !== null
    );
  } catch {
    return false;
  }
}

/**
 * Retrieve the saved appearance preference.
 * Defaults to 'system' if not explicitly configured.
 */
export function getStoredThemeMode(): ThemeMode {
  if (isLocalStorageAvailable()) {
    try {
      if (typeof window !== 'undefined' && window.location && window.location.search) {
        const params = new URLSearchParams(window.location.search);
        const modeParam = params.get('mode');
        if (modeParam === 'light' || modeParam === 'dark' || modeParam === 'system') {
          memoryCache = modeParam;
          return modeParam;
        }
      }
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        memoryCache = stored;
        return stored;
      }
    } catch {
      // Fallback to memoryCache
    }
  }
  return memoryCache;
}

/**
 * Persist the selected appearance preference and notify active subscribers.
 */
export function setStoredThemeMode(mode: ThemeMode): void {
  memoryCache = mode;
  if (isLocalStorageAvailable()) {
    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // Ignore quota or security errors in private browsing
    }
  }
  listeners.forEach((listener) => {
    try {
      listener(mode);
    } catch {
      // Prevent faulty listener from crashing notification loop
    }
  });
}

/**
 * Subscribe to runtime theme preference changes across screens.
 */
export function subscribeToThemeMode(callback: (mode: ThemeMode) => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}
