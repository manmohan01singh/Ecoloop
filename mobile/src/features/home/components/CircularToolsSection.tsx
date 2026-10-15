import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useAppTheme } from '../../../design-system/theme/theme';
import { AppText } from '../../../components/ui/AppText';
import { AppIcon, IconName } from '../../../components/ui/AppIcon';

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

  const tools: Array<{
    id: string;
    title: string;
    subtitle: string;
    icon: IconName;
    badge?: string;
    onPress: () => void;
  }> = [
    {
      id: 'passport',
      title: 'Device Passport',
      subtitle: 'IMEI history & replaced OEM parts',
      icon: 'shield-checkmark',
      onPress: onOpenPassport,
    },
    {
      id: 'handover',
      title: 'Safe Handover',
      subtitle: 'Cryptographic data wipe & custody check',
      icon: 'lock-closed',
      onPress: onOpenHandover,
    },
    {
      id: 'decision',
      title: 'Circular Advisor',
      subtitle: 'Compare repair, resell & recycle routes',
      icon: 'sparkles',
      badge: 'SMART',
      onPress: onOpenDecisionEngine,
    },
    {
      id: 'workspace',
      title: 'Operational Workspaces',
      subtitle: 'Access Repair Pro, Recycler & Business',
      icon: 'business',
      onPress: onOpenWorkspaceSwitcher,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <AppText variant="title3" weight="700">
          Trust & Security
        </AppText>
        <AppText variant="caption1" color="secondary" style={{ marginTop: 2 }}>
          Hardware verification, data protection & custody tools
        </AppText>
      </View>

      <View style={styles.grid}>
        {tools.map((tool) => (
          <TouchableOpacity
            key={tool.id}
            accessibilityRole="button"
            accessibilityLabel={`${tool.title}, ${tool.subtitle}`}
            activeOpacity={0.75}
            onPress={tool.onPress}
            style={[
              styles.tile,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.separator,
                borderWidth: theme.hairlineWidth,
                borderRadius: theme.radii.lg,
                ...theme.shadows.card,
              },
            ]}
          >
            <View style={styles.tileTop}>
              <View style={[styles.tileIcon, { backgroundColor: theme.colors.fillSecondary }]}>
                <AppIcon name={tool.icon} size={18} color={theme.colors.labelPrimary} />
              </View>
              {tool.badge ? (
                <View style={[styles.tileBadge, { backgroundColor: theme.colors.fill }]}>
                  <AppText variant="caption2" weight="700" color="primary">
                    {tool.badge}
                  </AppText>
                </View>
              ) : (
                <AppIcon name="chevron-forward" size={14} color={theme.colors.labelTertiary} />
              )}
            </View>

            <AppText variant="subheadline" weight="700" style={styles.tileTitle} numberOfLines={1}>
              {tool.title}
            </AppText>
            <AppText variant="caption2" color="secondary" numberOfLines={2} style={styles.tileSubtitle}>
              {tool.subtitle}
            </AppText>
          </TouchableOpacity>
        ))}
      </View>
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
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tile: {
    width: '48.5%',
    padding: 13,
    minHeight: 110,
    justifyContent: 'space-between',
  },
  tileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tileIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tileTitle: {
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  tileSubtitle: {
    lineHeight: 15,
  },
});
