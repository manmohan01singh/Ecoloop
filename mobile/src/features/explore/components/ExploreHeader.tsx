import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useAppTheme } from '../../../design-system/theme/theme';
import { AppText } from '../../../components/ui/AppText';
import { AppIcon } from '../../../components/ui/AppIcon';
import { AppTextInput } from '../../../components/ui/AppTextInput';

export interface ExploreHeaderProps {
  query: string;
  onChangeQuery: (text: string) => void;
  activeFiltersCount: number;
  onOpenFilterModal: () => void;
  totalItems: number;
}

export const ExploreHeader: React.FC<ExploreHeaderProps> = ({
  query,
  onChangeQuery,
  activeFiltersCount,
  onOpenFilterModal,
  totalItems,
}) => {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      {/* Editorial Title */}
      <View style={styles.titleRow}>
        <View style={{ flex: 1 }}>
          <AppText variant="largeTitle" weight="700">
            Marketplace
          </AppText>
          <AppText variant="subheadline" color="secondary" style={styles.subtitle}>
            Discover second-life hardware, parts & repairs
          </AppText>
        </View>

        {/* Filter Button */}
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Open filters"
          activeOpacity={0.7}
          onPress={onOpenFilterModal}
          style={[
            styles.filterButton,
            {
              backgroundColor: activeFiltersCount > 0
                ? theme.colors.tintLight
                : theme.colors.fill,
              borderColor: activeFiltersCount > 0
                ? theme.colors.tint
                : theme.colors.separator,
              borderWidth: theme.hairlineWidth,
            },
          ]}
        >
          <AppIcon
            name="options-outline"
            size={18}
            color={activeFiltersCount > 0 ? theme.colors.tint : theme.colors.labelPrimary}
          />
          {activeFiltersCount > 0 ? (
            <View
              style={[
                styles.filterBadge,
                { backgroundColor: theme.colors.tint },
              ]}
            >
              <AppText variant="caption2" weight="700" customColor="#FFFFFF">
                {activeFiltersCount}
              </AppText>
            </View>
          ) : null}
        </TouchableOpacity>
      </View>

      {/* iOS Search Bar */}
      <View style={styles.searchRow}>
        <AppTextInput
          value={query}
          onChangeText={onChangeQuery}
          placeholder="Search devices, brands, models..."
          showClearButton
          containerStyle={{ marginBottom: 0 }}
          prefix="🔍"
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  subtitle: {
    marginTop: 2,
  },
  filterButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginLeft: 12,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  searchRow: {
    marginTop: 2,
  },
});
