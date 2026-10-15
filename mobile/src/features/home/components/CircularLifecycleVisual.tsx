import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useAppTheme } from '../../../design-system/theme/theme';
import { AppText } from '../../../components/ui/AppText';
import { AppIcon, IconName } from '../../../components/ui/AppIcon';

export interface LifecycleStep {
  step: string;
  name: string;
  tagline: string;
  icon: IconName;
  tint: string;
  bgLight: string;
  bgDark: string;
  actionKey: string;
}

const STEPS: { step: string; name: string; tagline: string; icon: any; actionKey: string }[] = [
  {
    step: '01',
    name: 'Repair',
    tagline: 'Extend device lifespan with accredited technician fixes.',
    icon: 'construct-outline',
    actionKey: 'repair',
  },
  {
    step: '02',
    name: 'Reuse',
    tagline: 'Pass along or repurpose working hardware for secondary tasks.',
    icon: 'repeat-outline',
    actionKey: 'sell',
  },
  {
    step: '03',
    name: 'Resell',
    tagline: 'Verified buyers, doorstep pickup, and guaranteed NIST wipe.',
    icon: 'pricetag-outline',
    actionKey: 'sell',
  },
  {
    step: '04',
    name: 'Refurbish',
    tagline: 'Factory-grade restoration, battery calibration & warranty.',
    icon: 'sparkles-outline',
    actionKey: 'sell',
  },
  {
    step: '05',
    name: 'Recover',
    tagline: 'Harvest functional chips, displays & donor motherboards.',
    icon: 'hardware-chip-outline',
    actionKey: 'repair',
  },
  {
    step: '06',
    name: 'Recycle',
    tagline: 'Certified zero-landfill copper, gold & lithium reclamation.',
    icon: 'leaf-outline',
    actionKey: 'recycle',
  },
];

export interface CircularLifecycleVisualProps {
  onSelectStep?: (actionKey: string) => void;
}

export const CircularLifecycleVisual: React.FC<CircularLifecycleVisualProps> = ({
  onSelectStep,
}) => {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View style={styles.titleRow}>
          <AppIcon name="infinite-outline" size={16} color={theme.colors.tint} style={{ marginRight: 6 }} />
          <AppText variant="footnote" weight="700" color="secondary" style={styles.sectionTitle}>
            6-STEP CIRCULAR LIFECYCLE
          </AppText>
        </View>
        <AppText variant="caption2" color="tertiary" weight="600">
          ZERO-WASTE ECOSYSTEM
        </AppText>
      </View>

      {/* Horizontal Carousel of Cupertino Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {STEPS.map((step) => {
          return (
            <TouchableOpacity
              key={step.step}
              onPress={() => onSelectStep?.(step.actionKey)}
              activeOpacity={0.75}
              style={[
                styles.stepCard,
                {
                  backgroundColor: theme.colors.secondaryBackground,
                  borderColor: theme.colors.separator,
                  borderWidth: theme.hairlineWidth,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: theme.isDark ? 0.25 : 0.04,
                  shadowRadius: 8,
                  elevation: 2,
                },
              ]}
            >
              <View style={styles.topRow}>
                <View style={[styles.iconBox, { backgroundColor: theme.colors.fillSecondary }]}>
                  <AppIcon name={step.icon} size={18} color={theme.colors.tint} />
                </View>
                <AppText variant="caption2" weight="800" color="tertiary">
                  {step.step}
                </AppText>
              </View>

              <AppText variant="subheadline" weight="800" color="primary" style={styles.stepName}>
                {step.name}
              </AppText>
              <AppText variant="caption2" color="secondary" style={styles.tagline} numberOfLines={3}>
                {step.tagline}
              </AppText>

              <View style={styles.bottomArrow}>
                <AppText variant="caption2" weight="700" customColor={theme.colors.tint}>
                  Explore
                </AppText>
                <AppIcon name="chevron-forward" size={12} color={theme.colors.tint} style={{ marginLeft: 2 }} />
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    letterSpacing: 0.6,
  },
  scrollContainer: {
    gap: 12,
    paddingRight: 16,
    paddingVertical: 2,
  },
  stepCard: {
    width: 172,
    borderRadius: 18,
    padding: 14,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepName: {
    marginBottom: 4,
  },
  tagline: {
    lineHeight: 16,
    marginBottom: 12,
  },
  bottomArrow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
