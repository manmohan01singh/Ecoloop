import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { useAppTheme } from '../../../design-system/theme/theme';
import { AppText } from '../../../components/ui/AppText';
import { AppIcon, IconName } from '../../../components/ui/AppIcon';
import { RecentDeviceItem } from '../types/home.types';

export interface RecentDevicesSectionProps {
  devices: RecentDeviceItem[];
  onDevicePress?: (device: RecentDeviceItem) => void;
  onExploreAll?: () => void;
}

const getCategoryFallbackIcon = (category: string): IconName => {
  switch (category) {
    case 'smartphone':
      return 'phone-portrait-outline';
    case 'laptop':
      return 'laptop-outline';
    case 'audio':
      return 'headset-outline';
    case 'tablet':
      return 'tablet-portrait-outline';
    default:
      return 'hardware-chip-outline';
  }
};

const DeviceCard: React.FC<{
  device: RecentDeviceItem;
  onPress?: () => void;
}> = ({ device, onPress }) => {
  const theme = useAppTheme();
  const [imageError, setImageError] = useState(false);

  const actionConfig =
    device.action === 'repair'
      ? theme.colors.actionRepair
      : device.action === 'recycle'
      ? theme.colors.actionRecycle
      : device.action === 'sell'
      ? theme.colors.actionSell
      : theme.colors.actionBuy;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`${device.title}, ${device.actionLabel}`}
      activeOpacity={0.78}
      onPress={onPress}
      style={[
        styles.deviceCard,
        {
          backgroundColor: theme.colors.secondaryBackground,
          borderColor: theme.colors.separator,
          borderWidth: theme.hairlineWidth,
          borderRadius: theme.radii.lg,
          ...theme.shadows.card,
        },
      ]}
    >
      {/* Device Image Preview with Fallback */}
      <View
        style={[
          styles.imageContainer,
          {
            backgroundColor: theme.colors.fill,
          },
        ]}
      >
        {!imageError && device.imageUrl ? (
          <Image
            source={{ uri: device.imageUrl }}
            style={styles.deviceImage}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={styles.fallbackIconContainer}>
            <AppIcon
              name={getCategoryFallbackIcon(device.category)}
              size={36}
              color={theme.colors.labelTertiary}
            />
          </View>
        )}

        {/* Action pill overlay */}
        <View
          style={[
            styles.actionOverlayBadge,
            {
              backgroundColor: actionConfig.background,
            },
          ]}
        >
          <AppText
            variant="caption2"
            weight="700"
            customColor={actionConfig.tint}
          >
            {device.action.toUpperCase()}
          </AppText>
        </View>
      </View>

      {/* Card Body */}
      <View style={styles.cardBody}>
        <AppText
          variant="headline"
          weight="600"
          numberOfLines={1}
          style={styles.deviceTitle}
        >
          {device.title}
        </AppText>

        <AppText
          variant="caption1"
          color="secondary"
          numberOfLines={1}
          style={styles.conditionText}
        >
          {device.conditionLabel}
        </AppText>

        {/* Footer with Price/Status + CO2 Saved */}
        <View style={styles.cardFooter}>
          <View>
            {device.price !== undefined ? (
              <AppText variant="subheadline" weight="700" color="primary">
                ${device.price}
              </AppText>
            ) : device.isFree ? (
              <AppText variant="subheadline" weight="700" customColor={theme.colors.tint}>
                Free Dropoff
              </AppText>
            ) : (
              <AppText variant="subheadline" weight="700" color="secondary">
                Needs Quote
              </AppText>
            )}
          </View>

          <View style={styles.ecoSavingPill}>
            <AppIcon name="leaf" size={11} color={theme.colors.tint} />
            <AppText
              variant="caption2"
              weight="600"
              customColor={theme.colors.tint}
              style={{ marginLeft: 3 }}
            >
              {device.co2SavedKg}kg CO₂
            </AppText>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const RecentDevicesSection: React.FC<RecentDevicesSectionProps> = ({
  devices,
  onDevicePress,
  onExploreAll,
}) => {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <AppText variant="footnote" weight="600" color="secondary" style={styles.sectionSubtitle}>
            CIRCULAR STREAM
          </AppText>
          <AppText variant="title3" weight="700">
            Devices Finding Their Next Life
          </AppText>
        </View>

        {devices.length > 0 && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Explore all listings"
            activeOpacity={0.7}
            onPress={onExploreAll}
            style={styles.seeAllBtn}
          >
            <AppText variant="subheadline" weight="600" customColor={theme.colors.tint}>
              See All
            </AppText>
            <AppIcon
              name="chevron-forward"
              size={14}
              color={theme.colors.tint}
              style={{ marginLeft: 2 }}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Content: Carousel when items exist, Apple HIG empty state when empty */}
      {devices.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          decelerationRate="fast"
          snapToInterval={240 + 12}
        >
          {devices.map((device) => (
            <DeviceCard
              key={device.id}
              device={device}
              onPress={() => onDevicePress?.(device)}
            />
          ))}
        </ScrollView>
      ) : (
        <View
          style={[
            styles.emptyCard,
            {
              backgroundColor: theme.colors.secondaryBackground,
              borderColor: theme.colors.separator,
              borderWidth: theme.hairlineWidth,
              borderRadius: theme.radii.lg,
              ...theme.shadows.subtle,
            },
          ]}
        >
          <View
            style={[
              styles.emptyIconCircle,
              {
                backgroundColor: theme.colors.fill,
              },
            ]}
          >
            <AppIcon name="cube-outline" size={26} color={theme.colors.labelSecondary} />
          </View>
          <AppText variant="headline" weight="600" align="center" style={{ marginBottom: 4 }}>
            No Active Listings in This Area
          </AppText>
          <AppText variant="footnote" color="secondary" align="center" style={styles.emptyDescription}>
            Second-life devices listed for repair, resale, or recovery will appear here. Start by posting an idle device.
          </AppText>
          {onExploreAll && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onExploreAll}
              style={[
                styles.emptyActionPill,
                {
                  backgroundColor: theme.colors.fill,
                },
              ]}
            >
              <AppText variant="caption1" weight="600" customColor={theme.colors.tint}>
                Explore Verified Hubs
              </AppText>
              <AppIcon name="chevron-forward" size={13} color={theme.colors.tint} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 28,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  sectionSubtitle: {
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  deviceCard: {
    width: 240,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 140,
    width: '100%',
    position: 'relative',
  },
  deviceImage: {
    width: '100%',
    height: '100%',
  },
  fallbackIconContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionOverlayBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cardBody: {
    padding: 12,
  },
  deviceTitle: {
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  conditionText: {
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  ecoSavingPill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyCard: {
    marginHorizontal: 16,
    padding: 20,
    alignItems: 'center',
  },
  emptyIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyDescription: {
    lineHeight: 18,
    marginBottom: 14,
    maxWidth: 280,
  },
  emptyActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
  },
});
