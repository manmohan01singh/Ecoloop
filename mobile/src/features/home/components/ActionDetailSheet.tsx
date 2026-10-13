import React from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../../design-system/theme/theme';
import { AppText } from '../../../components/ui/AppText';
import { AppIcon } from '../../../components/ui/AppIcon';
import { AppButton } from '../../../components/ui/AppButton';
import { CoreActionConfig } from '../types/home.types';

export interface ActionDetailSheetProps {
  action: CoreActionConfig | null;
  visible: boolean;
  onClose: () => void;
  onSelectAction?: (actionId: string) => void;
}

export const ActionDetailSheet: React.FC<ActionDetailSheetProps> = ({
  action,
  visible,
  onClose,
  onSelectAction,
}) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  if (!action) return null;

  const getActionDetails = () => {
    switch (action.id) {
      case 'repair':
        return {
          headline: 'Professional Diagnostics & Hardware Restoration',
          highlights: [
            'Certified local technicians for screens, batteries, boards, and ports',
            'Transparent quotes before work begins with repair escrow protection',
            'Saves up to 80% of the embodied carbon of buying new hardware',
          ],
          categories: ['Smartphones', 'Laptops', 'Audio & Headphones', 'Tablets', 'Consoles'],
          ctaText: 'Post a Device for Repair',
        };
      case 'recycle':
        return {
          headline: 'Zero-Landfill Certified Recovery & Material Extraction',
          highlights: [
            'Pre-vetted R2 & e-Stewards certified recycling facilities',
            'Responsible recovery of precious gold, copper, cobalt, and lithium',
            'Cryptographic certificate of data destruction upon drop-off',
          ],
          categories: ['Broken Devices', 'Lithium Batteries', 'Obsolete Cables', 'Monitors & Displays'],
          ctaText: 'Log Device for Recycling',
        };
      case 'sell':
        return {
          headline: 'Direct Peer-to-Peer & Business Tech Exchange',
          highlights: [
            'Instant price intelligence based on current circular market values',
            'Verified buyer profiles with community trust ratings and EcoKarma',
            'Keep working gadgets in active circulation for 3+ additional years',
          ],
          categories: ['Pre-owned Phones', 'MacBooks & Laptops', 'Audio Gear', 'Cameras'],
          ctaText: 'Post a Device for Sale',
        };
      case 'buy':
        return {
          headline: 'Vetted, Function-Tested Second-Life Hardware',
          highlights: [
            'All items include battery health ratings and cosmetic disclosures',
            'Save 40-70% compared to retail prices while supporting zero-waste',
            '30-day function verification backed by the EcoLoop community',
          ],
          categories: ['Inspected Smartphones', 'Productivity Laptops', 'Accessories', 'Displays'],
          ctaText: 'Browse Marketplace',
        };
    }
  };

  const details = getActionDetails();

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
          {/* Grabber */}
          <View style={styles.grabberContainer}>
            <View
              style={[
                styles.grabber,
                { backgroundColor: theme.colors.labelQuaternary },
              ]}
            />
          </View>

          {/* Top Bar with Icon and Title */}
          <View style={styles.headerRow}>
            <View style={styles.iconTitleRow}>
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: action.bgColor },
                ]}
              >
                <AppIcon name={action.icon} size={24} color={action.tintColor} />
              </View>
              <View>
                <AppText variant="title2" weight="700">
                  {action.title} Pathway
                </AppText>
                <AppText variant="caption1" customColor={action.tintColor} weight="600">
                  {action.tagline}
                </AppText>
              </View>
            </View>

            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Close action details"
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

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Headline */}
            <AppText variant="headline" weight="600" style={styles.headline}>
              {details.headline}
            </AppText>

            {/* Core Description */}
            <AppText variant="body" color="secondary" style={styles.mainDescription}>
              {action.description}
            </AppText>

            {/* Highlights List */}
            <View style={styles.highlightsContainer}>
              <AppText variant="footnote" weight="600" color="secondary" style={styles.sectionSubtitle}>
                KEY PRINCIPLES
              </AppText>
              {details.highlights.map((highlight, index) => (
                <View key={index} style={styles.highlightRow}>
                  <View
                    style={[
                      styles.bulletPoint,
                      { backgroundColor: action.tintColor },
                    ]}
                  />
                  <AppText variant="subheadline" color="primary" style={{ flex: 1, lineHeight: 20 }}>
                    {highlight}
                  </AppText>
                </View>
              ))}
            </View>

            {/* Categories */}
            <View style={styles.categoriesSection}>
              <AppText variant="footnote" weight="600" color="secondary" style={styles.sectionSubtitle}>
                ACCEPTED HARDWARE
              </AppText>
              <View style={styles.categoryPillsRow}>
                {details.categories.map((cat, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.categoryPill,
                      {
                        backgroundColor: theme.colors.fill,
                        borderColor: theme.colors.separator,
                        borderWidth: theme.hairlineWidth,
                      },
                    ]}
                  >
                    <AppText variant="caption2" weight="600" color="secondary">
                      {cat}
                    </AppText>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.footer}>
            <AppButton
              label={details.ctaText}
              variant="filled"
              size="large"
              fullWidth
              tintColor={action.tintColor}
              onPress={() => {
                onClose();
                onSelectAction?.(action.id);
              }}
              style={{ marginBottom: 8 }}
            />
            <AppButton
              label="Close"
              variant="gray"
              size="medium"
              fullWidth
              onPress={onClose}
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
    maxHeight: '82%',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  grabberContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  grabber: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginBottom: 6,
  },
  iconTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollArea: {
    marginTop: 8,
  },
  headline: {
    marginBottom: 6,
    lineHeight: 22,
  },
  mainDescription: {
    lineHeight: 22,
    marginBottom: 16,
  },
  highlightsContainer: {
    marginBottom: 16,
  },
  sectionSubtitle: {
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  bulletPoint: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 10,
    marginTop: 6,
  },
  categoriesSection: {
    marginBottom: 18,
  },
  categoryPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  footer: {
    marginTop: 10,
  },
});
