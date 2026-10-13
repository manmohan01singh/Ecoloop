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
  background: '#F2F2F7', // Apple System Grouped Background
  secondaryBackground: '#FFFFFF', // Secondary System Grouped Background
  tertiaryBackground: '#E5E5EA',
  card: '#FFFFFF',
  cardElevated: '#FFFFFF',
  labelPrimary: '#1D1D1F', // Apple Editorial Charcoal
  labelSecondary: '#6E6E73', // Apple System Secondary (~4.8:1 contrast on white)
  labelTertiary: '#8E8E93',
  labelQuaternary: '#BCBCC0',
  separator: 'rgba(60, 60, 67, 0.14)',
  separatorOpaque: '#C6C6C8',
  fill: 'rgba(120, 120, 128, 0.12)',
  fillSecondary: 'rgba(120, 120, 128, 0.08)',
  tint: '#007A5E', // EcoLoop Apple-calibrated Emerald
  tintLight: 'rgba(0, 122, 94, 0.09)',
  tintMuted: '#0D8A6C',
  success: '#34C759',
  warning: '#FF9500',
  destructive: '#FF3B30',
  info: '#007AFF',
  actionRepair: {
    tint: '#0071E3',
    background: '#EEF6FF',
    badgeText: '#005BB5',
  },
  actionRecycle: {
    tint: '#007A5E',
    background: '#E7F7F2',
    badgeText: '#00644D',
  },
  actionSell: {
    tint: '#D46B08',
    background: '#FFF7E6',
    badgeText: '#A65200',
  },
  actionBuy: {
    tint: '#5856D6',
    background: '#F1F0FF',
    badgeText: '#4644B2',
  },
};

export const darkColors: ColorPalette = {
  background: '#000000', // Apple Dark System Background
  secondaryBackground: '#1C1C1E', // Apple Dark Grouped Secondary
  tertiaryBackground: '#2C2C2E',
  card: '#1C1C1E',
  cardElevated: '#2C2C2E',
  labelPrimary: '#FFFFFF',
  labelSecondary: '#98989D', // Clean readable light neutral
  labelTertiary: '#636366',
  labelQuaternary: '#48484A',
  separator: 'rgba(84, 84, 88, 0.36)',
  separatorOpaque: '#38383A',
  fill: 'rgba(120, 120, 128, 0.24)',
  fillSecondary: 'rgba(120, 120, 128, 0.16)',
  tint: '#10B981', // Emerald for OLED dark mode
  tintLight: 'rgba(16, 185, 129, 0.16)',
  tintMuted: '#34D399',
  success: '#30D158',
  warning: '#FF9F0A',
  destructive: '#FF453A',
  info: '#0A84FF',
  actionRepair: {
    tint: '#0A84FF',
    background: 'rgba(10, 132, 255, 0.15)',
    badgeText: '#64D2FF',
  },
  actionRecycle: {
    tint: '#34D399',
    background: 'rgba(52, 211, 153, 0.15)',
    badgeText: '#6EE7B7',
  },
  actionSell: {
    tint: '#FF9F0A',
    background: 'rgba(255, 159, 10, 0.15)',
    badgeText: '#FFD60A',
  },
  actionBuy: {
    tint: '#5E5CE6',
    background: 'rgba(94, 92, 230, 0.15)',
    badgeText: '#BF5AF2',
  },
};
