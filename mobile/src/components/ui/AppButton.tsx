import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import { useAppTheme } from '../../design-system/theme/theme';
import { AppText, TextColor } from './AppText';
import { AppIcon, IconName } from './AppIcon';

export type ButtonVariant = 'filled' | 'tinted' | 'gray' | 'plain' | 'primary' | 'secondary' | 'destructive';
export type ButtonSize = 'large' | 'medium' | 'small';

export interface AppButtonProps extends TouchableOpacityProps {
  label?: string;
  title?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
  tintColor?: string;
  style?: ViewStyle;
}

export const AppButton: React.FC<AppButtonProps> = ({
  label,
  title,
  variant = 'filled',
  size = 'medium',
  icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  tintColor,
  disabled,
  style,
  ...rest
}) => {
  const theme = useAppTheme();
  const effectiveLabel = label || title || '';
  let resolvedVariant = variant;
  let customTint = tintColor;
  if (variant === 'primary') resolvedVariant = 'filled';
  else if (variant === 'secondary') resolvedVariant = 'tinted';
  else if (variant === 'destructive') {
    resolvedVariant = 'tinted';
    customTint = theme.colors.destructive;
  }
  const effectiveTint = customTint || theme.colors.tint;

  // Background and border styles
  const getContainerStyle = (): ViewStyle => {
    const base: ViewStyle = {
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      opacity: disabled ? 0.45 : 1,
    };

    // Sizes
    if (size === 'large') {
      base.minHeight = 50;
      base.paddingHorizontal = theme.spacing.lg;
      base.borderRadius = theme.radii.lg;
    } else if (size === 'medium') {
      base.minHeight = 44; // Apple HIG 44pt touch minimum
      base.paddingHorizontal = theme.spacing.base;
      base.borderRadius = theme.radii.md;
    } else {
      base.minHeight = 34;
      base.paddingHorizontal = theme.spacing.md;
      base.borderRadius = theme.radii.sm;
    }

    if (fullWidth) {
      base.width = '100%';
    }

    // Variants
    switch (resolvedVariant) {
      case 'filled':
        base.backgroundColor = effectiveTint;
        break;
      case 'tinted':
        base.backgroundColor = theme.colors.tintLight;
        break;
      case 'gray':
        base.backgroundColor = theme.colors.fill;
        break;
      case 'plain':
        base.backgroundColor = 'transparent';
        base.paddingHorizontal = theme.spacing.xs;
        break;
    }

    return base;
  };

  const getTextColor = (): { colorName: TextColor; custom?: string } => {
    switch (resolvedVariant) {
      case 'filled':
        return { colorName: 'custom', custom: theme.isDark ? '#000000' : '#FFFFFF' };
      case 'tinted':
        return { colorName: 'custom', custom: theme.colors.labelPrimary };
      case 'gray':
        return { colorName: 'primary' };
      case 'plain':
        return { colorName: 'custom', custom: effectiveTint };
      default:
        return { colorName: 'custom', custom: theme.isDark ? '#000000' : '#FFFFFF' };
    }
  };

  const textConfig = getTextColor();
  const iconSize = size === 'large' ? 20 : size === 'medium' ? 18 : 15;
  const iconColor =
    resolvedVariant === 'filled'
      ? theme.isDark ? '#000000' : '#FFFFFF'
      : textConfig.custom || theme.colors.labelPrimary;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.72}
      disabled={disabled || loading}
      style={[getContainerStyle(), style]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={resolvedVariant === 'filled' ? (theme.isDark ? '#000000' : '#FFFFFF') : effectiveTint}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <View style={{ marginRight: theme.spacing.sm }}>
              <AppIcon name={icon} size={iconSize} color={iconColor} />
            </View>
          )}

          <AppText
            variant={size === 'large' ? 'headline' : size === 'medium' ? 'callout' : 'subheadline'}
            color={textConfig.colorName}
            customColor={textConfig.custom}
            weight="600"
          >
            {effectiveLabel}
          </AppText>

          {icon && iconPosition === 'right' && (
            <View style={{ marginLeft: theme.spacing.sm }}>
              <AppIcon name={icon} size={iconSize} color={iconColor} />
            </View>
          )}
        </>
      )}
    </TouchableOpacity>
  );
};
