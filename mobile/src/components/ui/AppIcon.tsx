import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../design-system/theme/theme';

export type IconName = keyof typeof Ionicons.glyphMap;

export interface AppIconProps {
  name: IconName;
  size?: number;
  color?: string;
  useThemeColor?: 'primary' | 'secondary' | 'tertiary' | 'tint' | 'white';
  style?: ViewStyle;
}

export const AppIcon: React.FC<AppIconProps> = ({
  name,
  size = 20,
  color,
  useThemeColor,
  style,
}) => {
  const theme = useAppTheme();

  const resolveColor = (): string => {
    if (color) return color;
    switch (useThemeColor) {
      case 'primary':
        return theme.colors.labelPrimary;
      case 'secondary':
        return theme.colors.labelSecondary;
      case 'tertiary':
        return theme.colors.labelTertiary;
      case 'tint':
        return theme.colors.tint;
      case 'white':
        return '#FFFFFF';
      default:
        return theme.colors.labelPrimary;
    }
  };

  return (
    <View style={[styles.container, style]}>
      <Ionicons name={name} size={size} color={resolveColor()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
