import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useAppTheme } from '../../design-system/theme/theme';

export interface AppSeparatorProps {
  insetLeft?: number;
  insetRight?: number;
  verticalMargin?: number;
  style?: ViewStyle;
}

export const AppSeparator: React.FC<AppSeparatorProps> = ({
  insetLeft = 0,
  insetRight = 0,
  verticalMargin = 0,
  style,
}) => {
  const theme = useAppTheme();

  return (
    <View
      style={[
        {
          height: theme.hairlineWidth,
          backgroundColor: theme.colors.separator,
          marginLeft: insetLeft,
          marginRight: insetRight,
          marginVertical: verticalMargin,
        },
        style,
      ]}
    />
  );
};
