import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useAppTheme } from '../../../design-system/theme/theme';
import { AppText } from '../../../components/ui/AppText';
import { AppIcon } from '../../../components/ui/AppIcon';

export interface CircularToolsSectionProps {
  onOpenDecisionEngine: () => void;
  onOpenPassport: () => void;
  onOpenHandover: () => void;
  onOpenWorkspaceSwitcher: () => void;
}

export const CircularToolsSection: React.FC<CircularToolsSectionProps> = ({
  onOpenDecisionEngine,
  onOpenPassport,
  onOpenHandover,
  onOpenWorkspaceSwitcher,
}) => {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <AppText variant="title3" weight="700">
          Circular Trust & Tools
        </AppText>
        <AppText variant="caption1" color="secondary" style={{ marginTop: 2 }}>
          Scientific diagnosis, lifecycle passports & safe custody
        </AppText>
      </View>

      {/* Hero Decision Engine Card with selective glow */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onOpenDecisionEngine}
        style={[
          styles.heroDecisionCard,
          {
            backgroundColor: theme.colors.secondaryBackground,
            borderColor: theme.isDark ? theme.colors.tint : theme.colors.separator,
            borderWidth: theme.isDark ? 1.5 : theme.hairlineWidth,
            ...theme.shadows.card,
          },
        ]}
      >
        <View style={styles.heroDecisionContent}>
          <View
            style={[
              styles.sparkleIconBox,
              {
                backgroundColor: theme.isDark ? 'rgba(16, 185, 129, 0.22)' : 'rgba(0, 122, 94, 0.12)',
              },
            ]}
          >
            <AppIcon name="sparkles" size={22} color={theme.colors.tint} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <AppText variant="headline" weight="700">
                Circular Decision Engine
              </AppText>
              <View style={[styles.newBadge, { backgroundColor: theme.colors.tint }]}>
                <AppText variant="caption2" weight="700" customColor="#ffffff">
                  SMART
                </AppText>
              </View>
            </View>
            <AppText variant="footnote" color="secondary" style={{ marginTop: 2 }}>
              Don't know what to do with a device? Compare repair cost vs resale value vs certified recycling.
            </AppText>
          </View>
        </View>

        <View style={[styles.cardCtaRow, { borderTopColor: theme.colors.separator, borderTopWidth: theme.hairlineWidth }]}>
          <AppText variant="caption1" weight="600" customColor={theme.colors.tint}>
            Diagnose Device Now
          </AppText>
          <AppIcon name="chevron-forward" size={14} color={theme.colors.tint} />
        </View>
      </TouchableOpacity>

      {/* Grid of Secondary Circular Utilities */}
      <View style={styles.toolsGrid}>
        {/* Device Passport */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onOpenPassport}
          style={[
            styles.toolTile,
            {
              backgroundColor: theme.colors.secondaryBackground,
              borderColor: theme.colors.separator,
              borderWidth: theme.hairlineWidth,
              ...theme.shadows.card,
            },
          ]}
        >
          <View style={[styles.tileIcon, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
            <AppIcon name="shield-checkmark" size={18} color="#3b82f6" />
          </View>
          <AppText variant="subheadline" weight="700" style={{ marginTop: 8 }}>
            Device Passport
          </AppText>
          <AppText variant="caption2" color="secondary" style={{ marginTop: 2 }}>
            Verify IMEI history & replaced OEM parts
          </AppText>
        </TouchableOpacity>

        {/* Safe Handover */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onOpenHandover}
          style={[
            styles.toolTile,
            {
              backgroundColor: theme.colors.secondaryBackground,
              borderColor: theme.colors.separator,
              borderWidth: theme.hairlineWidth,
              ...theme.shadows.card,
            },
          ]}
        >
          <View style={[styles.tileIcon, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
            <AppIcon name="lock-closed" size={18} color="#f59e0b" />
          </View>
          <AppText variant="subheadline" weight="700" style={{ marginTop: 8 }}>
            Safe Handover
          </AppText>
          <AppText variant="caption2" color="secondary" style={{ marginTop: 2 }}>
            6-step cryptographic wipe & safety check
          </AppText>
        </TouchableOpacity>
      </View>

      {/* Workspace Switcher Entry Banner */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onOpenWorkspaceSwitcher}
        style={[
          styles.workspaceBanner,
          {
            backgroundColor: theme.isDark ? 'rgba(16, 185, 129, 0.08)' : 'rgba(0, 122, 94, 0.06)',
            borderColor: theme.colors.tint,
            borderWidth: theme.hairlineWidth,
          },
        ]}
      >
        <AppIcon name="business" size={20} color={theme.colors.tint} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <AppText variant="caption1" weight="700">
            Switch Operational Workspace
          </AppText>
          <AppText variant="caption2" color="secondary">
            Access Repair Specialist, Recycler, or Business Inventory
          </AppText>
        </View>
        <AppIcon name="chevron-forward" size={16} color={theme.colors.tint} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 8,
  },
  sectionHeader: {
    marginBottom: 10,
  },
  heroDecisionCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  heroDecisionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  sparkleIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  cardCtaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  toolsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  toolTile: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
  },
  tileIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workspaceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
  },
});
