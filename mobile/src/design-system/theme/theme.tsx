import React, { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react';
import { useColorScheme, StyleSheet } from 'react-native';
import {
  ColorPalette,
  lightColors,
  darkColors,
  typography,
  TypographyTokens,
  spacing,
  Spacing,
  radii,
  Radii,
  shadows,
  ShadowTokens,
  GlowType,
  getGlowStyle,
} from '../tokens';
import {
  ThemeMode,
  getStoredThemeMode,
  setStoredThemeMode,
  subscribeToThemeMode,
} from './themeStorage';

export type { ThemeMode } from './themeStorage';
export { getStoredThemeMode, setStoredThemeMode } from './themeStorage';
export type { GlowType } from '../tokens';

export interface AppTheme {
  isDark: boolean;
  themeMode: ThemeMode;
  resolvedScheme: 'light' | 'dark';
  setThemeMode: (mode: ThemeMode) => void;
  colors: ColorPalette;
  typography: TypographyTokens;
  spacing: Spacing;
  radii: Radii;
  shadows: ShadowTokens;
  hairlineWidth: number;
  getGlow: (type: GlowType, active?: boolean) => import('react-native').ViewStyle;
}

const ThemeContext = createContext<AppTheme | null>(null);

export interface ThemeProviderProps {
  children?: React.ReactNode;
  forceScheme?: 'light' | 'dark';
  initialMode?: ThemeMode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  forceScheme,
  initialMode,
}) => {
  const systemScheme = useColorScheme();
  const [themeMode, setInternalThemeMode] = useState<ThemeMode>(
    () => initialMode || getStoredThemeMode()
  );

  useEffect(() => {
    const unsubscribe = subscribeToThemeMode((newMode) => {
      setInternalThemeMode(newMode);
    });
    return unsubscribe;
  }, []);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setInternalThemeMode(mode);
    setStoredThemeMode(mode);
  }, []);

  const resolvedScheme: 'light' | 'dark' = useMemo(() => {
    if (forceScheme) return forceScheme;
    if (themeMode === 'light') return 'light';
    if (themeMode === 'dark') return 'dark';
    return systemScheme === 'dark' ? 'dark' : 'light';
  }, [forceScheme, themeMode, systemScheme]);

  const isDark = resolvedScheme === 'dark';

  const theme = useMemo<AppTheme>(() => {
    const baseTheme = {
      isDark,
      themeMode,
      resolvedScheme,
      setThemeMode,
      colors: isDark ? darkColors : lightColors,
      typography,
      spacing,
      radii,
      shadows,
      hairlineWidth: StyleSheet.hairlineWidth || 0.5,
    };
    return {
      ...baseTheme,
      getGlow: (type: GlowType, active?: boolean) => getGlowStyle({ ...baseTheme, getGlow: () => ({}) }, type, active),
    };
  }, [isDark, themeMode, resolvedScheme, setThemeMode]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};

export const useAppTheme = (): AppTheme => {
  const context = useContext(ThemeContext);
  if (!context) {
    // Default fallback to system/light theme if outside provider
    const fallbackTheme = {
      isDark: false,
      themeMode: 'system' as ThemeMode,
      resolvedScheme: 'light' as const,
      setThemeMode: () => {},
      colors: lightColors,
      typography,
      spacing,
      radii,
      shadows,
      hairlineWidth: StyleSheet.hairlineWidth || 0.5,
    };
    return {
      ...fallbackTheme,
      getGlow: (type: GlowType, active?: boolean) => getGlowStyle({ ...fallbackTheme, getGlow: () => ({}) }, type, active),
    };
  }
  return context;
};
