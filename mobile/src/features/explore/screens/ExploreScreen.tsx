import React from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../../design-system/theme/theme';
import { AppText } from '../../../components/ui/AppText';
import { AppIcon } from '../../../components/ui/AppIcon';
import { AppButton } from '../../../components/ui/AppButton';
import { AppFilterPills } from '../../../components/ui/AppFilterPills';
import { ExploreHeader } from '../components/ExploreHeader';
import { ExploreProductCard } from '../components/ExploreProductCard';
import { DeviceDetailModal } from '../components/DeviceDetailModal';
import { ExploreFilterModal } from '../components/ExploreFilterModal';
import { useExploreData } from '../hooks/useExploreData';
import { ExploreItem } from '../types/explore.types';

export interface ExploreScreenProps {
  onReturnHome?: () => void;
  onOpenPostSheet?: (initialAction?: string) => void;
  initialCategory?: string;
}

export const ExploreScreen: React.FC<ExploreScreenProps> = ({
  onReturnHome,
  onOpenPostSheet,
  initialCategory = 'all',
}) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  const {
    items,
    allItemsCount,
    totalCo2SavedInView,
    filters,
    categoryPills,
    activeFiltersCount,
    selectedItem,
    setSelectedItem,
    filterModalVisible,
    setFilterModalVisible,
    refreshing,
    onRefresh,
    setQuery,
    setCategory,
    setCondition,
    setAction,
    setSort,
    setOnlyFree,
    resetFilters,
  } = useExploreData(initialCategory as any);

  const handleApplyModalFilters = (newFilters: any) => {
    if (newFilters.action !== undefined) setAction(newFilters.action);
    if (newFilters.condition !== undefined) setCondition(newFilters.condition);
    if (newFilters.sort !== undefined) setSort(newFilters.sort);
    if (newFilters.onlyFree !== undefined) setOnlyFree(newFilters.onlyFree);
  };

  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor: theme.colors.background,
          paddingTop: Math.max(insets.top, 10),
        },
      ]}
    >
      {/* Header with Search and Filter Button */}
      <ExploreHeader
        query={filters.query}
        onChangeQuery={setQuery}
        activeFiltersCount={activeFiltersCount}
        onOpenFilterModal={() => setFilterModalVisible(true)}
        totalItems={items.length}
      />

      {/* Horizontal Category Filter Pills */}
      <View style={styles.pillsWrapper}>
        <AppFilterPills
          items={categoryPills}
          selectedId={filters.category}
          onSelect={setCategory}
        />
      </View>

      {/* Impact Telemetry Ribbon */}
      <View
        style={[
          styles.ribbon,
          {
            backgroundColor: theme.colors.secondaryBackground,
            borderBottomColor: theme.colors.separator,
            borderBottomWidth: theme.hairlineWidth,
          },
        ]}
      >
        <AppText variant="caption1" color="secondary">
          Showing <AppText variant="caption1" weight="700">{items.length}</AppText> of{' '}
          {allItemsCount} devices
        </AppText>

        <View style={styles.co2Summary}>
          <AppIcon
            name="leaf"
            size={12}
            color={theme.colors.tint}
            style={{ marginRight: 4 }}
          />
          <AppText
            variant="caption1"
            weight="600"
            customColor={theme.colors.tint}
          >
            {totalCo2SavedInView} kg CO₂ divertible
          </AppText>
        </View>
      </View>

      {/* Dedicated Hubs for Repair Requests & Recycler Intake */}
      <View style={styles.serviceHubsRow}>
        <TouchableOpacity
          onPress={() => onOpenPostSheet?.('repair')}
          activeOpacity={0.8}
          style={[
            styles.serviceHubCard,
            {
              backgroundColor: theme.isDark ? 'rgba(0, 113, 227, 0.12)' : 'rgba(0, 113, 227, 0.06)',
              borderColor: theme.isDark ? 'rgba(0, 113, 227, 0.28)' : 'rgba(0, 113, 227, 0.16)',
              borderWidth: theme.hairlineWidth,
            },
          ]}
        >
          <View style={[styles.hubIconBox, { backgroundColor: 'rgba(0, 113, 227, 0.12)' }]}>
            <AppIcon name="construct" size={15} color="#0071E3" />
          </View>
          <View style={{ flex: 1 }}>
            <AppText variant="caption1" weight="800" customColor="#0071E3">
              Repair Hub
            </AppText>
            <AppText variant="caption2" color="secondary" numberOfLines={1}>
              Quotes from 48+ shops
            </AppText>
          </View>
          <AppIcon name="chevron-forward" size={13} color="#0071E3" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onOpenPostSheet?.('recycle')}
          activeOpacity={0.8}
          style={[
            styles.serviceHubCard,
            {
              backgroundColor: theme.isDark ? 'rgba(0, 122, 94, 0.12)' : 'rgba(0, 122, 94, 0.06)',
              borderColor: theme.isDark ? 'rgba(0, 122, 94, 0.28)' : 'rgba(0, 122, 94, 0.16)',
              borderWidth: theme.hairlineWidth,
            },
          ]}
        >
          <View style={[styles.hubIconBox, { backgroundColor: 'rgba(0, 122, 94, 0.12)' }]}>
            <AppIcon name="leaf" size={15} color="#007A5E" />
          </View>
          <View style={{ flex: 1 }}>
            <AppText variant="caption1" weight="800" customColor="#007A5E">
              Recycle Hub
            </AppText>
            <AppText variant="caption2" color="secondary" numberOfLines={1}>
              Free zero-landfill depots
            </AppText>
          </View>
          <AppIcon name="chevron-forward" size={13} color="#007A5E" />
        </TouchableOpacity>
      </View>

      {/* Main List / ScrollView */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: insets.bottom + 90, // safe clearance above bottom tab bar
          },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.tint}
            colors={[theme.colors.tint]}
          />
        }
      >
        {items.length === 0 ? (
          /* Thoughtful Empty State */
          <View
            style={[
              styles.emptyStateCard,
              {
                backgroundColor: theme.colors.secondaryBackground,
                borderColor: theme.colors.separator,
                borderWidth: theme.hairlineWidth,
                borderRadius: theme.radii.xl,
                ...theme.shadows.card,
              },
            ]}
          >
            <View
              style={[
                styles.emptyIconCircle,
                { backgroundColor: theme.colors.fill },
              ]}
            >
              <AppIcon
                name="search-outline"
                size={34}
                color={theme.colors.labelTertiary}
              />
            </View>

            <AppText variant="title3" weight="700" align="center" style={styles.emptyTitle}>
              No matching devices found
            </AppText>

            <AppText
              variant="subheadline"
              color="secondary"
              align="center"
              style={styles.emptyDesc}
            >
              {filters.query
                ? `We couldn't find any circular tech matching "${filters.query}". Try adjusting keywords or clear filters.`
                : filters.category !== 'all'
                ? `No devices currently available in category "${filters.category}". Try clearing filters or post your device.`
                : 'No devices match your active filters. Try clearing filters or list your device.'}
            </AppText>

            <View style={styles.emptyActions}>
              <AppButton
                label="Clear Filters"
                variant="gray"
                size="medium"
                onPress={resetFilters}
                style={{ marginRight: 8 }}
              />

              {onOpenPostSheet ? (
                <AppButton
                  label="Post a Device"
                  variant="filled"
                  size="medium"
                  icon="add"
                  onPress={() => onOpenPostSheet()}
                />
              ) : null}
            </View>
          </View>
        ) : (
          /* Product Cards */
          <View style={styles.cardsList}>
            {items.map((item) => (
              <ExploreProductCard
                key={item.id}
                item={item}
                onPress={(selected) => setSelectedItem(selected)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Detail Modal */}
      <DeviceDetailModal
        item={selectedItem}
        visible={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
      />

      {/* Filter Modal */}
      <ExploreFilterModal
        visible={filterModalVisible}
        filters={filters}
        onApplyFilters={handleApplyModalFilters}
        onResetFilters={resetFilters}
        onClose={() => setFilterModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  pillsWrapper: {
    paddingBottom: 4,
  },
  ribbon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  serviceHubsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 10,
  },
  serviceHubCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 14,
  },
  hubIconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  co2Summary: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollContent: {
    paddingTop: 12,
  },
  cardsList: {
    width: '100%',
  },
  emptyStateCard: {
    marginHorizontal: 20,
    marginTop: 32,
    padding: 24,
    alignItems: 'center',
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    marginBottom: 8,
  },
  emptyDesc: {
    lineHeight: 20,
    marginBottom: 20,
  },
  emptyActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
