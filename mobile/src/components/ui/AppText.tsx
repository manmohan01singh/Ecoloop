import React from 'react';
import { Text, TextProps, TextStyle, StyleSheet } from 'react-native';
import { useAppTheme } from '../../design-system/theme/theme';

export type TextVariant =
  | 'largeTitle'
  | 'title1'
  | 'title2'
  | 'title3'
  | 'headline'
  | 'body'
  | 'callout'
  | 'subheadline'
  | 'footnote'
  | 'caption1'
  | 'caption2';

export type TextColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'quaternary'
  | 'tint'
  | 'success'
  | 'warning'
  | 'destructive'
  | 'white'
  | 'custom';

export interface AppTextProps extends TextProps {
  variant?: TextVariant;
  color?: TextColor;
  customColor?: string;
  weight?: TextStyle['fontWeight'];
  align?: TextStyle['textAlign'];
  children: React.ReactNode;
}

export const AppText: React.FC<AppTextProps> = ({
  variant = 'body',
  color = 'primary',
  customColor,
  weight,
  align,
  style,
  children,
  ...rest
}) => {
  const theme = useAppTheme();

  const getColor = (): string => {
    if (customColor) return customColor;
    switch (color) {
      case 'primary':
        return theme.colors.labelPrimary;
      case 'secondary':
        return theme.colors.labelSecondary;
      case 'tertiary':
        return theme.colors.labelTertiary;
      case 'quaternary':
        return theme.colors.labelQuaternary;
      case 'tint':
        return theme.colors.tint;
      case 'success':
        return theme.colors.success;
      case 'warning':
        return theme.colors.warning;
      case 'destructive':
        return theme.colors.destructive;
      case 'white':
        return '#FFFFFF';
      default:
        return theme.colors.labelPrimary;
    }
  };

  const textStyle: TextStyle = {
    ...theme.typography[variant],
    color: getColor(),
    ...(weight ? { fontWeight: weight } : {}),
    ...(align ? { textAlign: align } : {}),
  };

  return (
    <Text style={[textStyle, style]} allowFontScaling {...rest}>
      {children}
    </Text>
  );
};
