import React from 'react';
import {
  Modal,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../../design-system/theme/theme';
import { AppText } from '../../../components/ui/AppText';
import { AppIcon, IconName } from '../../../components/ui/AppIcon';
import { AppButton } from '../../../components/ui/AppButton';
import { AppSeparator } from '../../../components/ui/AppSeparator';
import { getCategoryFallbackImage } from '../../../services/storage/localPersistence';
import { ExploreItem } from '../types/explore.types';

export interface DeviceDetailModalProps {
  item: ExploreItem | null;
  visible: boolean;
  onClose: () => void;
}

export const DeviceDetailModal: React.FC<DeviceDetailModalProps> = ({
  item,
  visible,
  onClose,
}) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  const [modalImageSrc, setModalImageSrc] = React.useState<string>(() => {
    if (item?.imageUrl?.startsWith('blob:')) {
      return getCategoryFallbackImage(item.category);
    }
    return item?.imageUrl || '';
  });
  const [modalImageFailed, setModalImageFailed] = React.useState(false);

  React.useEffect(() => {
    if (item) {
      if (item.imageUrl?.startsWith('blob:')) {
        setModalImageSrc(getCategoryFallbackImage(item.category));
      } else {
        setModalImageSrc(item.imageUrl);
        setModalImageFailed(false);
      }
    }
  }, [item]);

  if (!item) return null;

  const handlePrimaryAction = () => {
    switch (item.action) {
      case 'sell':
      case 'buy':
        Alert.alert(
          'Connect with Seller',
          `Connect with ${item.sellerName || 'the owner'} to inspect or arrange pickup in ${item.city}.`,
          [{ text: 'Close', style: 'cancel' }]
        );
        break;
      case 'repair':
        Alert.alert(
          'Repair Diagnostics',
          `Review repair request for "${item.title}". A certified technician in ${item.city} can accept this service ticket.`,
          [{ text: 'Close', style: 'cancel' }]
        );
        break;
      case 'recycle':
        Alert.alert(
          'Recycling Depot Match',
          `This hardware has been slated for clean material recovery in ${item.city}. Claim component salvage or view registered municipal drop-off points.`,
          [{ text: 'Close', style: 'cancel' }]
        );
        break;
    }
  };

  const getActionColor = () => {
    switch (item.action) {
      case 'repair':
        return theme.colors.actionRepair.tint;
      case 'recycle':
        return theme.colors.actionRecycle.tint;
      case 'sell':
        return theme.colors.actionSell.tint;
      default:
        return theme.colors.actionBuy.tint;
    }
  };

  const primaryButtonLabel = () => {
    switch (item.action) {
      case 'repair':
        return 'Offer Repair Service';
      case 'recycle':
        return 'Claim Material Recovery';
      case 'sell':
        return item.price > 0 ? `Express Interest ($${item.price})` : 'Claim Free Item';
      case 'buy':
      default:
        return `Purchase Item ($${item.price})`;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <TouchableOpacity
          style={styles.backdropTouch}
          activeOpacity={1}
          onPress={onClose}
        />

        <View
          style={[
            styles.sheetContainer,
            {
              backgroundColor: theme.colors.cardElevated,
              paddingBottom: Math.max(insets.bottom, 20),
              borderTopLeftRadius: theme.radii.xxl,
              borderTopRightRadius: theme.radii.xxl,
              borderColor: theme.colors.separator,
              borderWidth: theme.hairlineWidth,
              ...theme.shadows.modal,
            },
          ]}
        >
          {/* iOS Grabber */}
          <View style={styles.grabberContainer}>
            <View
              style={[
                styles.grabber,
                { backgroundColor: theme.colors.labelQuaternary },
              ]}
            />
          </View>

          {/* Header Row */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <View style={styles.badgeRow}>
                <View
                  style={[
                    styles.actionBadge,
                    { backgroundColor: theme.colors.fill },
                  ]}
                >
                  <AppText
                    variant="caption2"
                    weight="700"
                    customColor={getActionColor()}
                  >
                    {item.actionLabel.toUpperCase()}
                  </AppText>
                </View>

                {item.isDevFixture ? (
                  <View
                    style={[
                      styles.fixtureTag,
                      { backgroundColor: theme.colors.fillSecondary },
                    ]}
                  >
                    <AppText
                      variant="caption2"
                      weight="600"
                      color="secondary"
                    >
                      DEMO FIXTURE
                    </AppText>
                  </View>
                ) : null}
              </View>

              <AppText variant="title2" weight="700" numberOfLines={2}>
                {item.title}
              </AppText>
            </View>

            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Close device details"
              activeOpacity={0.7}
              onPress={onClose}
              style={[
                styles.closeButton,
                { backgroundColor: theme.colors.fill },
              ]}
            >
              <AppIcon name="close" size={18} color={theme.colors.labelPrimary} />
            </TouchableOpacity>
          </View>

          {/* Scrollable Body */}
          <ScrollView showsVerticalScrollIndicator={false} style={styles.body}>
            {/* Main Image */}
            <View style={styles.mediaWrapper}>
              <Image
                source={{ uri: modalImageSrc || getCategoryFallbackImage(item.category) }}
                style={styles.mediaImage}
                resizeMode="cover"
                onError={() => {
                  if (!modalImageFailed) {
                    setModalImageFailed(true);
                    setModalImageSrc(getCategoryFallbackImage(item.category));
                  }
                }}
              />
            </View>

            {/* Price & Environmental Highlights Bar */}
            <View
              style={[
                styles.highlightCard,
                {
                  backgroundColor: theme.colors.fillSecondary,
                  borderRadius: theme.radii.md,
                },
              ]}
            >
              <View style={styles.highlightCol}>
                <AppText variant="caption1" color="secondary">
                  Listed Value
                </AppText>
                <AppText variant="title3" weight="700">
                  {item.isFree || item.price === 0 ? 'Free / Recovery' : `$${item.price}`}
                </AppText>
              </View>

              <View
                style={[
                  styles.dividerVert,
                  { backgroundColor: theme.colors.separator },
                ]}
              />

              <View style={styles.highlightCol}>
                <AppText variant="caption1" color="secondary">
                  CO₂ Diversion
                </AppText>
                <AppText
                  variant="title3"
                  weight="700"
                  customColor={theme.colors.tint}
                >
                  🌿 {item.co2SavedKg} kg
                </AppText>
              </View>

              <View
                style={[
                  styles.dividerVert,
                  { backgroundColor: theme.colors.separator },
                ]}
              />

              <View style={styles.highlightCol}>
                <AppText variant="caption1" color="secondary">
                  Condition
                </AppText>
                <AppText variant="subheadline" weight="600" numberOfLines={1}>
                  {item.conditionLabel}
                </AppText>
              </View>
            </View>

            {/* Description */}
            <View style={styles.section}>
              <AppText variant="headline" weight="600" style={styles.sectionTitle}>
                Device Details
              </AppText>
              <AppText variant="body" color="secondary" style={styles.descriptionText}>
                {item.description}
              </AppText>
            </View>

            {/* Specifications Grid */}
            {item.specs ? (
              <View style={styles.section}>
                <AppText variant="headline" weight="600" style={styles.sectionTitle}>
                  Hardware Specifications
                </AppText>
                <View
                  style={[
                    styles.specsCard,
                    {
                      backgroundColor: theme.colors.secondaryBackground,
                      borderColor: theme.colors.separator,
                      borderWidth: theme.hairlineWidth,
                      borderRadius: theme.radii.md,
                    },
                  ]}
                >
                  {Object.entries(item.specs).map(([key, val], idx, arr) => (
                    <View key={key}>
                      <View style={styles.specRow}>
                        <AppText variant="subheadline" color="secondary">
                          {key}
                        </AppText>
                        <AppText variant="subheadline" weight="600">
                          {val}
                        </AppText>
                      </View>
                      {idx < arr.length - 1 ? (
                        <AppSeparator verticalMargin={6} />
                      ) : null}
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {/* Location & Seller Info */}
            <View style={styles.section}>
              <AppText variant="headline" weight="600" style={styles.sectionTitle}>
                Location & Delivery
              </AppText>
              <View
                style={[
                  styles.locationCard,
                  {
                    backgroundColor: theme.colors.secondaryBackground,
                    borderColor: theme.colors.separator,
                    borderWidth: theme.hairlineWidth,
                    borderRadius: theme.radii.md,
                  },
                ]}
              >
                <View style={styles.locationItem}>
                  <AppIcon
                    name="location-outline"
                    size={18}
                    color={theme.colors.tint}
                    style={{ marginRight: 10 }}
                  />
                  <View style={{ flex: 1 }}>
                    <AppText variant="subheadline" weight="600">
                      {item.city} ({item.distanceKm} km away)
                    </AppText>
                    <AppText variant="caption1" color="secondary">
                      Supported pickup format: {item.pickupType.toUpperCase()}
                    </AppText>
                  </View>
                </View>

                {item.sellerName ? (
                  <>
                    <AppSeparator verticalMargin={8} />
                    <View style={styles.locationItem}>
                      <AppIcon
                        name="person-outline"
                        size={18}
                        color={theme.colors.labelSecondary}
                        style={{ marginRight: 10 }}
                      />
                      <View style={{ flex: 1 }}>
                        <AppText variant="subheadline" weight="600">
                          {item.sellerName}
                        </AppText>
                        {item.sellerRating ? (
                          <AppText variant="caption1" color="secondary">
                            Community Trust: {item.sellerRating} ★
                          </AppText>
                        ) : null}
                      </View>
                    </View>
                  </>
                ) : null}
              </View>
            </View>

            {/* Action disclaimer */}
            <View
              style={[
                styles.disclaimerBox,
                {
                  backgroundColor: theme.colors.fillSecondary,
                  borderRadius: theme.radii.sm,
                },
              ]}
            >
              <AppIcon
                name="shield-checkmark-outline"
                size={16}
                color={theme.colors.tint}
                style={{ marginRight: 8, marginTop: 1 }}
              />
              <AppText variant="caption1" color="secondary" style={{ flex: 1, lineHeight: 16 }}>
                EcoLoop verifies second-life transactions to maximize circular hardware recovery and eliminate electronics landfill waste.
              </AppText>
            </View>
          </ScrollView>

          {/* Footer CTA */}
          <View style={styles.footer}>
            <AppButton
              label={primaryButtonLabel()}
              variant="filled"
              size="large"
              fullWidth
              tintColor={getActionColor()}
              onPress={handlePrimaryAction}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  backdropTouch: {
    flex: 1,
  },
  sheetContainer: {
    maxHeight: '90%',
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  grabberContainer: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  grabber: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginBottom: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  actionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  fixtureTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    marginTop: 6,
  },
  mediaWrapper: {
    height: 200,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 14,
    backgroundColor: '#000000',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  highlightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  highlightCol: {
    flex: 1,
    alignItems: 'center',
  },
  dividerVert: {
    width: StyleSheet.hairlineWidth,
    height: '70%',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  descriptionText: {
    lineHeight: 22,
  },
  specsCard: {
    padding: 12,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  locationCard: {
    padding: 12,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    marginBottom: 20,
  },
  footer: {
    paddingTop: 10,
  },
});
