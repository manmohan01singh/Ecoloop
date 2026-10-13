import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useAppTheme } from '../../design-system/theme/theme';
import { AppText } from './AppText';
import { AppIcon, IconName } from './AppIcon';

export type BadgeVariant =
  | 'tint'
  | 'success'
  | 'warning'
  | 'info'
  | 'neutral'
  | 'custom';

export interface AppBadgeProps {
  label: string;
  variant?: BadgeVariant;
  icon?: IconName;
  customBg?: string;
  customColor?: string;
  size?: 'small' | 'medium';
  style?: ViewStyle;
}

export const AppBadge: React.FC<AppBadgeProps> = ({
  label,
  variant = 'tint',
  icon,
  customBg,
  customColor,
  size = 'small',
  style,
}) => {
  const theme = useAppTheme();

  const getColors = (): { bg: string; text: string } => {
    if (customBg && customColor) {
      return { bg: customBg, text: customColor };
    }

    switch (variant) {
      case 'tint':
        return {
          bg: theme.isDark ? 'rgba(16, 185, 129, 0.16)' : theme.colors.tintLight,
          text: theme.colors.tint,
        };
      case 'success':
        return {
          bg: theme.isDark ? 'rgba(48, 209, 88, 0.16)' : 'rgba(52, 199, 89, 0.12)',
          text: theme.colors.success,
        };
      case 'warning':
        return {
          bg: theme.isDark ? 'rgba(255, 159, 10, 0.16)' : 'rgba(255, 149, 0, 0.12)',
          text: theme.colors.warning,
        };
      case 'info':
        return {
          bg: theme.isDark ? 'rgba(10, 132, 255, 0.16)' : 'rgba(0, 122, 255, 0.12)',
          text: theme.colors.info,
        };
      case 'neutral':
      default:
        return {
          bg: theme.colors.fill,
          text: theme.colors.labelSecondary,
        };
    }
  };

  const { bg, text } = getColors();
  const isSmall = size === 'small';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bg,
          paddingVertical: isSmall ? 3 : 5,
          paddingHorizontal: isSmall ? 8 : 10,
          borderRadius: theme.radii.full,
        },
        style,
      ]}
    >
      {icon && (
        <View style={{ marginRight: 4 }}>
          <AppIcon name={icon} size={isSmall ? 11 : 13} color={text} />
        </View>
      )}
      <AppText
        variant={isSmall ? 'caption2' : 'caption1'}
        weight="600"
        customColor={text}
      >
        {label}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
});
