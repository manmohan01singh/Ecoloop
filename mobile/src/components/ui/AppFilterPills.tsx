import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useAppTheme } from '../../design-system/theme/theme';
import { AppText } from './AppText';
import { AppIcon, IconName } from './AppIcon';

export interface FilterPillItem {
  id: string;
  label: string;
  icon?: IconName;
  count?: number;
}

export interface AppFilterPillsProps {
  items: FilterPillItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  scrollable?: boolean;
  activeColor?: string;
  containerStyle?: ViewStyle;
}

export const AppFilterPills: React.FC<AppFilterPillsProps> = ({
  items,
  selectedId,
  onSelect,
  scrollable = true,
  activeColor,
  containerStyle,
}) => {
  const theme = useAppTheme();
  const effectiveActiveColor = activeColor || theme.colors.tint;

  const renderPill = (item: FilterPillItem) => {
    const isSelected = selectedId === item.id;

    return (
      <TouchableOpacity
        key={item.id}
        accessibilityRole="button"
        accessibilityState={{ selected: isSelected }}
        accessibilityLabel={`${item.label} filter`}
        activeOpacity={0.7}
        onPress={() => onSelect(item.id)}
        style={[
          styles.pill,
          {
            backgroundColor: isSelected
              ? effectiveActiveColor
              : theme.colors.secondaryBackground,
            borderColor: isSelected
              ? effectiveActiveColor
              : theme.colors.separator,
            borderWidth: theme.hairlineWidth,
            borderRadius: theme.radii.full,
          },
        ]}
      >
        {item.icon ? (
          <AppIcon
            name={item.icon}
            size={14}
            color={isSelected ? (theme.isDark ? '#000000' : '#FFFFFF') : theme.colors.labelSecondary}
            style={{ marginRight: 5 }}
          />
        ) : null}

        <AppText
          variant="footnote"
          weight={isSelected ? '600' : '500'}
          customColor={isSelected ? (theme.isDark ? '#000000' : '#FFFFFF') : theme.colors.labelPrimary}
        >
          {item.label}
        </AppText>

        {typeof item.count === 'number' ? (
          <View
            style={[
              styles.countBadge,
              {
                backgroundColor: isSelected
                  ? theme.isDark
                    ? 'rgba(0, 0, 0, 0.15)'
                    : 'rgba(255, 255, 255, 0.25)'
                  : theme.colors.fill,
              },
            ]}
          >
            <AppText
              variant="caption2"
              weight="600"
              customColor={isSelected ? (theme.isDark ? '#000000' : '#FFFFFF') : theme.colors.labelSecondary}
            >
              {item.count}
            </AppText>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };

  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContainer, containerStyle]}
      >
        {items.map(renderPill)}
      </ScrollView>
    );
  }

  return (
    <View style={[styles.wrapContainer, containerStyle]}>
      {items.map(renderPill)}
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  wrapContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    paddingVertical: 7,
  },
  countBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
});
