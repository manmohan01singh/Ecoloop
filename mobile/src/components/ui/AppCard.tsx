import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { useAppTheme } from '../../design-system/theme/theme';

export interface AppCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  variant?: 'grouped' | 'elevated' | 'tinted' | 'flat';
  tintBackground?: string;
  padding?: number;
  borderRadius?: number;
}

export const AppCard: React.FC<AppCardProps> = ({
  children,
  onPress,
  style,
  variant = 'grouped',
  tintBackground,
  padding,
  borderRadius,
}) => {
  const theme = useAppTheme();

  const getCardStyle = (): ViewStyle => {
    const base: ViewStyle = {
      borderRadius: borderRadius ?? theme.radii.lg,
      padding: padding ?? theme.spacing.cardPadding,
      borderWidth: theme.hairlineWidth,
      borderColor: theme.colors.separator,
    };

    switch (variant) {
      case 'grouped':
        base.backgroundColor = theme.colors.secondaryBackground;
        Object.assign(base, theme.shadows.subtle);
        break;
      case 'elevated':
        base.backgroundColor = theme.colors.cardElevated;
        Object.assign(base, theme.shadows.card);
        break;
      case 'tinted':
        base.backgroundColor =
          tintBackground ||
          (theme.isDark ? 'rgba(16, 185, 129, 0.12)' : theme.colors.tintLight);
        base.borderColor = theme.isDark
          ? 'rgba(16, 185, 129, 0.24)'
          : 'rgba(0, 122, 94, 0.15)';
        break;
      case 'flat':
        base.backgroundColor = theme.colors.fill;
        base.borderWidth = 0;
        break;
    }

    return base;
  };

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.72}
        onPress={onPress}
        style={[getCardStyle(), style]}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[getCardStyle(), style]}>{children}</View>;
};
