import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppTheme } from '../../../design-system/theme/theme';
import { AppText } from '../../../components/ui/AppText';
import { AppIcon } from '../../../components/ui/AppIcon';

export interface WelcomeSectionProps {
  onOpenRescueEngine?: () => void;
}

export const WelcomeSection: React.FC<WelcomeSectionProps> = ({
  onOpenRescueEngine,
}) => {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      {/* Dynamic Island Style Status Pill */}
      <View
        style={[
          styles.pillBadge,
          {
            backgroundColor: theme.colors.fill,
            borderColor: theme.colors.separator,
            borderWidth: theme.hairlineWidth,
          },
        ]}
      >
        <View style={[styles.liveBeacon, { backgroundColor: theme.colors.tint }]} />
        <AppText
          variant="caption1"
          weight="700"
          customColor={theme.colors.labelPrimary}
          style={{ letterSpacing: 0.2 }}
        >
          Live Circular Hub • 1,420+ devices rescued this week
        </AppText>
      </View>

      {/* Main Title - Apple Large Display Heading */}
      <AppText
        variant="title1"
        weight="800"
        color="primary"
        style={styles.mainTitle}
      >
        Your device has more than one future.
      </AppText>

      {/* Sub-Headline & Supporting Editorial Copy */}
      <AppText
        variant="subheadline"
        weight="700"
        customColor={theme.colors.labelPrimary}
        style={{ marginBottom: 4 }}
      >
        Give your devices a second life.
      </AppText>

      <AppText
        variant="footnote"
        color="secondary"
        weight="400"
        style={styles.supportingCopy}
      >
        Repair it. • Resell it. • Recycle it. Find trusted repairs, compare offers, reuse what still works, and make better decisions about every device.
      </AppText>

      {/* Primary Signature Hero Card: The Rescue Engine */}
      <View
        style={[
          styles.heroCard,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.separator,
            borderWidth: theme.hairlineWidth,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: theme.isDark ? 0.3 : 0.05,
            shadowRadius: 12,
            elevation: 2,
          },
        ]}
      >
        <View style={styles.heroCardHeader}>
          <View
            style={[
              styles.rescueTag,
              {
                backgroundColor: theme.colors.fill,
              },
            ]}
          >
            <AppIcon name="sparkles" size={12} color={theme.colors.labelPrimary} style={{ marginRight: 4 }} />
            <AppText variant="caption2" weight="800" color="primary" style={{ letterSpacing: 0.5 }}>
              SIGNATURE EXPERIENCE
            </AppText>
          </View>
          <View
            style={[
              styles.evidenceTag,
              {
                backgroundColor: theme.colors.fillSecondary,
              },
            ]}
          >
            <AppText variant="caption2" weight="600" color="tertiary">
              4-STEP ENGINE
            </AppText>
          </View>
        </View>

        <AppText variant="title3" weight="800" color="primary" style={styles.heroTitle}>
          Find My Device's Best Future
        </AppText>

        <AppText variant="footnote" color="secondary" style={styles.heroDescription}>
          One assessment generates competing quotes across 5 circular pathways—repair, resell as-is, refurbish, harvest parts, or zero-landfill recycle.
        </AppText>

        {/* Primary CTA Button */}
        <TouchableOpacity
          onPress={onOpenRescueEngine}
          activeOpacity={0.84}
          style={[
            styles.heroCtaButton,
            {
              backgroundColor: theme.colors.tint,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: theme.isDark ? 0.3 : 0.1,
              shadowRadius: 8,
              elevation: 2,
            },
          ]}
        >
          <AppIcon name="compass" size={18} color={theme.isDark ? '#000000' : '#FFFFFF'} style={{ marginRight: 8 }} />
          <AppText variant="headline" weight="700" customColor={theme.isDark ? '#000000' : '#FFFFFF'}>
            Find My Device's Best Future
          </AppText>
          <AppIcon name="chevron-forward" size={18} color={theme.isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.8)'} style={{ marginLeft: 6 }} />
        </TouchableOpacity>

        {/* 3 Value Pillars */}
        <View style={styles.heroPillars}>
          <View style={styles.pillarItem}>
            <AppIcon name="checkmark-circle" size={13} color={theme.colors.tint} style={{ marginRight: 4 }} />
            <AppText variant="caption2" weight="600" color="secondary">
              Real Quotes
            </AppText>
          </View>
          <View style={styles.pillarDivider} />
          <View style={styles.pillarItem}>
            <AppIcon name="shield-checkmark" size={13} color={theme.colors.tint} style={{ marginRight: 4 }} />
            <AppText variant="caption2" weight="600" color="secondary">
              Truth Report
            </AppText>
          </View>
          <View style={styles.pillarDivider} />
          <View style={styles.pillarItem}>
            <AppIcon name="leaf" size={13} color={theme.colors.tint} style={{ marginRight: 4 }} />
            <AppText variant="caption2" weight="600" color="secondary">
              Zero Landfill
            </AppText>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    marginBottom: 12,
  },
  liveBeacon: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 6,
  },
  mainTitle: {
    fontSize: 28,
    lineHeight: 34,
    marginBottom: 8,
    letterSpacing: -0.6,
  },
  supportingCopy: {
    lineHeight: 22,
    marginBottom: 16,
    letterSpacing: -0.2,
  },
  heroCard: {
    borderRadius: 22,
    padding: 18,
    marginTop: 4,
  },
  heroCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  rescueTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  evidenceTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  heroTitle: {
    fontSize: 20,
    lineHeight: 25,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  heroDescription: {
    lineHeight: 20,
    marginBottom: 16,
  },
  heroCtaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    marginBottom: 14,
  },
  heroPillars: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  pillarItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillarDivider: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(120, 120, 128, 0.4)',
  },
});
