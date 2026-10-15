export interface ColorPalette {
  background: string;
  secondaryBackground: string;
  tertiaryBackground: string;
  card: string;
  cardElevated: string;
  labelPrimary: string;
  labelSecondary: string;
  labelTertiary: string;
  labelQuaternary: string;
  separator: string;
  separatorOpaque: string;
  fill: string;
  fillSecondary: string;
  tint: string;
  tintLight: string;
  tintMuted: string;
  success: string;
  warning: string;
  destructive: string;
  info: string;
  // Specific action palette
  actionRepair: {
    tint: string;
    background: string;
    badgeText: string;
  };
  actionRecycle: {
    tint: string;
    background: string;
    badgeText: string;
  };
  actionSell: {
    tint: string;
    background: string;
    badgeText: string;
  };
  actionBuy: {
    tint: string;
    background: string;
    badgeText: string;
  };
}

export const lightColors: ColorPalette = {
  background: '#FFFFFF', // Pure Apple white canvas
  secondaryBackground: '#F5F5F7', // Apple System Grouped Neutral
  tertiaryBackground: '#E5E5EA',
  card: '#FFFFFF',
  cardElevated: '#FFFFFF',
  labelPrimary: '#000000', // Pure black
  labelSecondary: '#666668', // Neutral secondary (~4.8:1 contrast on white)
  labelTertiary: '#8E8E93',
  labelQuaternary: '#C7C7CC',
  separator: 'rgba(0, 0, 0, 0.08)',
  separatorOpaque: '#E5E5EA',
  fill: 'rgba(0, 0, 0, 0.05)',
  fillSecondary: 'rgba(0, 0, 0, 0.025)',
  tint: '#000000', // Monochrome primary tint (black)
  tintLight: '#F4F4F6',
  tintMuted: '#555558',
  success: '#1C1C1E',
  warning: '#52525B',
  destructive: '#1C1C1E',
  info: '#3A3A3C',
  actionRepair: {
    tint: '#0A0A0A',
    background: '#F4F4F6',
    badgeText: '#0A0A0A',
  },
  actionRecycle: {
    tint: '#27272A',
    background: '#EEEEF0',
    badgeText: '#27272A',
  },
  actionSell: {
    tint: '#4A4A4F',
    background: '#E8E8EC',
    badgeText: '#4A4A4F',
  },
  actionBuy: {
    tint: '#6E6E73',
    background: '#F0F0F2',
    badgeText: '#6E6E73',
  },
};

export const darkColors: ColorPalette = {
  background: '#000000', // Apple True OLED Black
  secondaryBackground: '#121214', // Subtle deep charcoal
  tertiaryBackground: '#1C1C1E',
  card: '#161618',
  cardElevated: '#1E1E20',
  labelPrimary: '#FFFFFF', // Pure white
  labelSecondary: '#A1A1A6', // Clean readable light neutral
  labelTertiary: '#71717A',
  labelQuaternary: '#3F3F46',
  separator: 'rgba(255, 255, 255, 0.12)',
  separatorOpaque: '#2C2C2E',
  fill: 'rgba(255, 255, 255, 0.08)',
  fillSecondary: 'rgba(255, 255, 255, 0.04)',
  tint: '#FFFFFF', // Monochrome primary tint (white)
  tintLight: 'rgba(255, 255, 255, 0.10)',
  tintMuted: '#A1A1AA',
  success: '#FFFFFF',
  warning: '#D4D4D8',
  destructive: '#FFFFFF',
  info: '#E4E4E7',
  actionRepair: {
    tint: '#FFFFFF',
    background: '#1C1C1E',
    badgeText: '#FFFFFF',
  },
  actionRecycle: {
    tint: '#E4E4E7',
    background: '#242426',
    badgeText: '#E4E4E7',
  },
  actionSell: {
    tint: '#C7C7CC',
    background: '#2C2C2E',
    badgeText: '#C7C7CC',
  },
  actionBuy: {
    tint: '#A1A1AA',
    background: '#343438',
    badgeText: '#A1A1AA',
  },
};
