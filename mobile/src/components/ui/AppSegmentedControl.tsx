import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useAppTheme } from '../../design-system/theme/theme';
import { AppText } from './AppText';
import { AppIcon, IconName } from './AppIcon';

export interface SegmentOption<T extends string = string> {
  value: T;
  label: string;
  icon?: IconName;
  badge?: string;
  activeColor?: string;
}

export interface AppSegmentedControlProps<T extends string = string> {
  options: SegmentOption<T>[];
  selectedValue: T;
  onChange: (value: T) => void;
  containerStyle?: ViewStyle;
}

export function AppSegmentedControl<T extends string = string>({
  options,
  selectedValue,
  onChange,
  containerStyle,
}: AppSegmentedControlProps<T>) {
  const theme = useAppTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.fill,
          borderRadius: theme.radii.md,
        },
        containerStyle,
      ]}
    >
      {options.map((option) => {
        const isSelected = selectedValue === option.value;
        const activeBg = option.activeColor || theme.colors.cardElevated;

        return (
          <TouchableOpacity
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={option.label}
            activeOpacity={0.8}
            onPress={() => onChange(option.value)}
            style={[
              styles.segment,
              {
                borderRadius: theme.radii.sm,
                backgroundColor: isSelected ? activeBg : 'transparent',
                ...(isSelected ? theme.shadows.card : {}),
              },
            ]}
          >
            {option.icon ? (
              <AppIcon
                name={option.icon}
                size={16}
                color={
                  isSelected
                    ? option.activeColor
                      ? '#FFFFFF'
                      : theme.colors.tint
                    : theme.colors.labelSecondary
                }
                style={{ marginRight: 6 }}
              />
            ) : null}

            <AppText
              variant="subheadline"
              weight={isSelected ? '600' : '500'}
              customColor={
                isSelected
                  ? option.activeColor
                    ? '#FFFFFF'
                    : theme.colors.labelPrimary
                  : theme.colors.labelSecondary
              }
            >
              {option.label}
            </AppText>

            {option.badge ? (
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: isSelected
                      ? 'rgba(255, 255, 255, 0.25)'
                      : theme.colors.fillSecondary,
                  },
                ]}
              >
                <AppText
                  variant="caption2"
                  weight="600"
                  customColor={
                    isSelected ? '#FFFFFF' : theme.colors.labelTertiary
                  }
                >
                  {option.badge}
                </AppText>
              </View>
            ) : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 3,
    alignItems: 'center',
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  badge: {
    marginLeft: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
});
