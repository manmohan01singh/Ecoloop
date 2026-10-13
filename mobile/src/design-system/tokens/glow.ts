import { ViewStyle, Platform } from 'react-native';
import { AppTheme } from '../theme/theme';

export type GlowType = 'primaryAction' | 'selectedPathway' | 'unreadIndicator' | 'successCelebration';

export interface GlowConfig {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
  borderColor?: string;
  borderWidth?: number;
}

/**
 * Returns a calibrated, restrained lighting style adhering to Apple HIG.
 * In Dark mode: soft emerald halo with ambient edge highlight.
 * In Light mode: delicate tinted edge and subtle accent shadow.
 */
export function getGlowStyle(theme: AppTheme, type: GlowType, active: boolean = true): ViewStyle {
  if (!active) {
    return {};
  }

  const isDark = theme.isDark;

  switch (type) {
    case 'primaryAction':
      return Platform.select({
        ios: {
          shadowColor: isDark ? '#10B981' : '#007A5E',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0.38 : 0.22,
          shadowRadius: isDark ? 14 : 10,
        },
        android: {
          elevation: isDark ? 6 : 4,
        },
        default: {
          shadowColor: isDark ? '#10B981' : '#007A5E',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0.38 : 0.22,
          shadowRadius: isDark ? 14 : 10,
        },
      }) as ViewStyle;

    case 'selectedPathway':
      return Platform.select({
        ios: {
          shadowColor: isDark ? '#10B981' : '#007A5E',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.32 : 0.16,
          shadowRadius: isDark ? 10 : 6,
          borderColor: isDark ? 'rgba(16, 185, 129, 0.45)' : 'rgba(0, 122, 94, 0.30)',
          borderWidth: 1.5,
        },
        android: {
          elevation: 3,
          borderColor: isDark ? 'rgba(16, 185, 129, 0.45)' : 'rgba(0, 122, 94, 0.30)',
          borderWidth: 1.5,
        },
        default: {
          shadowColor: isDark ? '#10B981' : '#007A5E',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.32 : 0.16,
          shadowRadius: isDark ? 10 : 6,
          borderColor: isDark ? 'rgba(16, 185, 129, 0.45)' : 'rgba(0, 122, 94, 0.30)',
          borderWidth: 1.5,
        },
      }) as ViewStyle;

    case 'unreadIndicator':
      return Platform.select({
        ios: {
          shadowColor: isDark ? '#10B981' : '#007A5E',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: isDark ? 0.75 : 0.45,
          shadowRadius: isDark ? 6 : 4,
        },
        android: {
          elevation: 2,
        },
        default: {
          shadowColor: isDark ? '#10B981' : '#007A5E',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: isDark ? 0.75 : 0.45,
          shadowRadius: isDark ? 6 : 4,
        },
      }) as ViewStyle;

    case 'successCelebration':
      return Platform.select({
        ios: {
          shadowColor: isDark ? '#10B981' : '#34C759',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: isDark ? 0.45 : 0.28,
          shadowRadius: isDark ? 20 : 14,
          borderColor: isDark ? 'rgba(16, 185, 129, 0.50)' : 'rgba(52, 199, 89, 0.35)',
          borderWidth: 2,
        },
        android: {
          elevation: 8,
          borderColor: isDark ? 'rgba(16, 185, 129, 0.50)' : 'rgba(52, 199, 89, 0.35)',
          borderWidth: 2,
        },
        default: {
          shadowColor: isDark ? '#10B981' : '#34C759',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: isDark ? 0.45 : 0.28,
          shadowRadius: isDark ? 20 : 14,
          borderColor: isDark ? 'rgba(16, 185, 129, 0.50)' : 'rgba(52, 199, 89, 0.35)',
          borderWidth: 2,
        },
      }) as ViewStyle;

    default:
      return {};
  }
}
