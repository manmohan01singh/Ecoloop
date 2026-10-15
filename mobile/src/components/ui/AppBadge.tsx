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
          bg: theme.colors.fill,
          text: theme.colors.labelPrimary,
        };
      case 'success':
        return {
          bg: theme.colors.fill,
          text: theme.colors.labelPrimary,
        };
      case 'warning':
        return {
          bg: theme.colors.fill,
          text: theme.colors.labelSecondary,
        };
      case 'info':
        return {
          bg: theme.colors.fill,
          text: theme.colors.labelPrimary,
        };
      case 'neutral':
      default:
        return {
          bg: theme.colors.fillSecondary,
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
