import React from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { useAppTheme } from '../../../design-system/theme/theme';
import { AppText } from '../../../components/ui/AppText';
import { AppIcon, IconName } from '../../../components/ui/AppIcon';
import { getCategoryFallbackImage } from '../../../services/storage/localPersistence';
import { ExploreItem } from '../types/explore.types';

export interface ExploreProductCardProps {
  item: ExploreItem;
  onPress: (item: ExploreItem) => void;
}

export const ExploreProductCard: React.FC<ExploreProductCardProps> = ({
  item,
  onPress,
}) => {
  const theme = useAppTheme();

  const [imageSrc, setImageSrc] = React.useState<string>(() => {
    if (item.imageUrl?.startsWith('blob:')) {
      return getCategoryFallbackImage(item.category);
    }
    return item.imageUrl;
  });
  const [imageFailed, setImageFailed] = React.useState(false);

  React.useEffect(() => {
    if (item.imageUrl?.startsWith('blob:')) {
      setImageSrc(getCategoryFallbackImage(item.category));
    } else {
      setImageSrc(item.imageUrl);
      setImageFailed(false);
    }
  }, [item.imageUrl, item.category]);

  // Resolve action pathway tint and label
  const getActionConfig = () => {
    switch (item.action) {
      case 'repair':
        return {
          tint: theme.colors.actionRepair.tint,
          bg: theme.colors.actionRepair.background,
          label: 'Repair Needed',
          icon: 'construct-outline' as IconName,
        };
      case 'recycle':
        return {
          tint: theme.colors.actionRecycle.tint,
          bg: theme.colors.actionRecycle.background,
          label: 'Recycle / Salvage',
          icon: 'sync-outline' as IconName,
        };
      case 'sell':
        return {
          tint: theme.colors.actionSell.tint,
          bg: theme.colors.actionSell.background,
          label: 'For Resale',
          icon: 'pricetag-outline' as IconName,
        };
      case 'buy':
      default:
        return {
          tint: theme.colors.actionBuy.tint,
          bg: theme.colors.actionBuy.background,
          label: 'Refurbished',
          icon: 'bag-check-outline' as IconName,
        };
    }
  };

  const actionCfg = getActionConfig();

  const getConditionColor = () => {
    switch (item.condition) {
      case 'like_new':
        return theme.colors.success;
      case 'good':
        return theme.colors.tint;
      case 'fair':
        return theme.colors.warning;
      case 'for_parts':
      default:
        return theme.colors.labelSecondary;
    }
  };

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`${item.title}, ${item.conditionLabel}, ${item.price ? '$' + item.price : 'Free'}`}
      activeOpacity={0.75}
      onPress={() => onPress(item)}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.secondaryBackground,
          borderColor: theme.colors.separator,
          borderWidth: theme.hairlineWidth,
          borderRadius: theme.radii.lg,
          ...theme.shadows.card,
        },
      ]}
    >
      {/* Top Media Container */}
      <View style={[styles.imageContainer, { backgroundColor: theme.colors.fill }]}>
        <Image
          source={{ uri: imageSrc }}
          style={styles.image}
          resizeMode="cover"
          onError={() => {
            if (!imageFailed) {
              setImageFailed(true);
              setImageSrc(getCategoryFallbackImage(item.category));
            }
          }}
        />

        {/* Condition Badge Overlay */}
        <View
          style={[
            styles.conditionBadge,
            {
              backgroundColor: theme.isDark
                ? 'rgba(0, 0, 0, 0.75)'
                : 'rgba(255, 255, 255, 0.90)',
              borderColor: theme.isDark
                ? 'rgba(255, 255, 255, 0.15)'
                : 'rgba(0, 0, 0, 0.08)',
              borderWidth: theme.hairlineWidth,
            },
          ]}
        >
          <View
            style={[
              styles.conditionDot,
              { backgroundColor: getConditionColor() },
            ]}
          />
          <AppText
            variant="caption2"
            weight="700"
            customColor={theme.isDark ? '#FFFFFF' : theme.colors.labelPrimary}
          >
            {item.conditionLabel}
          </AppText>
        </View>

        {/* Development Fixture Indicator Pill */}
        {item.isDevFixture ? (
          <View
            style={[
              styles.fixtureBadge,
              {
                backgroundColor: theme.isDark
                  ? 'rgba(0, 0, 0, 0.65)'
                  : 'rgba(255, 255, 255, 0.85)',
                borderColor: theme.isDark
                  ? 'rgba(255, 255, 255, 0.12)'
                  : 'rgba(0, 0, 0, 0.08)',
                borderWidth: theme.hairlineWidth,
              },
            ]}
          >
            <AppText
              variant="caption2"
              weight="600"
              customColor={theme.isDark ? 'rgba(255, 255, 255, 0.8)' : theme.colors.labelSecondary}
            >
              DEV FIXTURE
            </AppText>
          </View>
        ) : null}
      </View>

      {/* Card Content */}
      <View style={styles.content}>
        {/* Pathway Tag + Location */}
        <View style={styles.metadataRow}>
          <View
            style={[
              styles.pathwayPill,
              { backgroundColor: actionCfg.bg },
            ]}
          >
            <AppIcon
              name={actionCfg.icon}
              size={12}
              color={actionCfg.tint}
              style={{ marginRight: 4 }}
            />
            <AppText
              variant="caption2"
              weight="700"
              customColor={actionCfg.tint}
            >
              {actionCfg.label}
            </AppText>
          </View>

          <View style={styles.locationContainer}>
            <AppIcon
              name="location-outline"
              size={12}
              color={theme.colors.labelTertiary}
              style={{ marginRight: 2 }}
            />
            <AppText variant="caption2" color="tertiary">
              {item.city} • {item.distanceKm} km
            </AppText>
          </View>
        </View>

        {/* Title */}
        <AppText
          variant="headline"
          weight="600"
          numberOfLines={2}
          style={styles.title}
        >
          {item.title}
        </AppText>

        {/* Description snippet */}
        <AppText
          variant="footnote"
          color="secondary"
          numberOfLines={2}
          style={styles.description}
        >
          {item.description}
        </AppText>

        {/* Bottom Metrics: Price & CO2 Diversion */}
        <View style={[styles.bottomRow, { borderTopColor: theme.colors.separator }]}>
          <View style={styles.priceContainer}>
            {item.isFree || item.price === 0 ? (
              <AppText variant="title3" weight="700" customColor={theme.colors.tint}>
                Free / Recovery
              </AppText>
            ) : (
              <View style={styles.priceGroup}>
                <AppText variant="title3" weight="700">
                  ${item.price}
                </AppText>
                {item.originalPrice ? (
                  <AppText
                    variant="caption1"
                    color="tertiary"
                    style={styles.originalPrice}
                  >
                    ${item.originalPrice}
                  </AppText>
                ) : null}
              </View>
            )}
          </View>

          {/* Environmental Impact Pill */}
          <View
            style={[
              styles.co2Pill,
              {
                backgroundColor: theme.isDark
                  ? 'rgba(16, 185, 129, 0.16)'
                  : 'rgba(0, 122, 94, 0.08)',
              },
            ]}
          >
            <AppIcon
              name="leaf"
              size={12}
              color={theme.colors.tint}
              style={{ marginRight: 3 }}
            />
            <AppText
              variant="caption2"
              weight="600"
              customColor={theme.colors.tint}
            >
              {item.co2SavedKg} kg CO₂
            </AppText>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 14,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 170,
    width: '100%',
    position: 'relative',
    backgroundColor: '#000000',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  conditionBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  conditionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  fixtureBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  content: {
    padding: 14,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  pathwayPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    marginBottom: 4,
  },
  description: {
    marginBottom: 12,
    lineHeight: 18,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(120, 120, 128, 0.15)',
  },
  priceContainer: {
    flex: 1,
  },
  priceGroup: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  originalPrice: {
    marginLeft: 6,
    textDecorationLine: 'line-through',
  },
  co2Pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
});
