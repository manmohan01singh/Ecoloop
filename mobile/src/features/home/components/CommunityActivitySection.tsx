import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useAppTheme } from '../../../design-system/theme/theme';
import { AppText } from '../../../components/ui/AppText';
import { AppIcon } from '../../../components/ui/AppIcon';
import { AppBadge } from '../../../components/ui/AppBadge';
import { CommunityHubItem, CircularStatItem } from '../types/home.types';

export interface CommunityActivitySectionProps {
  hubs: CommunityHubItem[];
  stats: CircularStatItem[];
  onHubPress?: (hub: CommunityHubItem) => void;
  onViewAll?: () => void;
}

export const CommunityActivitySection: React.FC<CommunityActivitySectionProps> = ({
  hubs,
  stats,
  onHubPress,
  onViewAll,
}) => {
  const theme = useAppTheme();
  const [activeTab, setActiveTab] = useState<'hubs' | 'impact'>('hubs');

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <View>
          <AppText variant="footnote" weight="600" color="secondary" style={styles.sectionTitle}>
            COMMUNITY & IMPACT
          </AppText>
          <AppText variant="title3" weight="700">
            Around You
          </AppText>
        </View>

        {/* Segmented Control Pill */}
        <View
          style={[
            styles.segmentContainer,
            {
              backgroundColor: theme.colors.fill,
              borderRadius: theme.radii.sm,
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setActiveTab('hubs')}
            style={[
              styles.segmentItem,
              activeTab === 'hubs' && {
                backgroundColor: theme.colors.secondaryBackground,
                borderRadius: theme.radii.xs + 2,
                ...theme.shadows.subtle,
              },
            ]}
          >
            <AppText
              variant="caption2"
              weight={activeTab === 'hubs' ? '700' : '500'}
              color={activeTab === 'hubs' ? 'primary' : 'secondary'}
            >
              Verified Hubs
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setActiveTab('impact')}
            style={[
              styles.segmentItem,
              activeTab === 'impact' && {
                backgroundColor: theme.colors.secondaryBackground,
                borderRadius: theme.radii.xs + 2,
                ...theme.shadows.subtle,
              },
            ]}
          >
            <AppText
              variant="caption2"
              weight={activeTab === 'impact' ? '700' : '500'}
              color={activeTab === 'impact' ? 'primary' : 'secondary'}
            >
              Metrics
            </AppText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content depending on active segment */}
      {activeTab === 'hubs' ? (
        hubs.length > 0 ? (
          <View
            style={[
              styles.groupedCard,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.separator,
                borderWidth: theme.hairlineWidth,
                borderRadius: theme.radii.lg,
                ...theme.shadows.subtle,
              },
            ]}
          >
            {hubs.map((hub, index) => {
            const isLast = index === hubs.length - 1;
            return (
              <React.Fragment key={hub.id}>
                <TouchableOpacity
                  activeOpacity={0.72}
                  onPress={() => onHubPress?.(hub)}
                  style={styles.hubRow}
                >
                  <View
                    style={[
                      styles.hubIconCircle,
                      {
                        backgroundColor:
                          hub.type === 'Repair Cafe'
                            ? theme.colors.actionRepair.background
                            : hub.type === 'Drop-off Depot'
                            ? theme.colors.actionRecycle.background
                            : theme.colors.fill,
                      },
                    ]}
                  >
                    <AppIcon
                      name={
                        hub.type === 'Repair Cafe'
                          ? 'build'
                          : hub.type === 'Drop-off Depot'
                          ? 'trash-bin'
                          : 'business'
                      }
                      size={18}
                      color={
                        hub.type === 'Repair Cafe'
                          ? theme.colors.actionRepair.tint
                          : hub.type === 'Drop-off Depot'
                          ? theme.colors.actionRecycle.tint
                          : theme.colors.tint
                      }
                    />
                  </View>

                  <View style={styles.hubDetails}>
                    <View style={styles.hubTitleRow}>
                      <AppText
                        variant="subheadline"
                        weight="600"
                        numberOfLines={1}
                        style={{ flex: 1, marginRight: 6 }}
                      >
                        {hub.name}
                      </AppText>
                      {hub.verified && (
                        <AppIcon
                          name="checkmark-circle"
                          size={15}
                          color={theme.colors.tint}
                        />
                      )}
                    </View>

                    <View style={styles.hubSubRow}>
                      <AppText variant="caption2" color="secondary">
                        {hub.distance}
                      </AppText>
                      <AppText variant="caption2" color="tertiary" style={{ marginHorizontal: 4 }}>
                        •
                      </AppText>
                      <AppText variant="caption2" color="secondary">
                        {hub.type}
                      </AppText>
                    </View>
                  </View>

                  <AppIcon
                    name="chevron-forward"
                    size={16}
                    color={theme.colors.labelTertiary}
                  />
                </TouchableOpacity>

                {!isLast && (
                  <View
                    style={[
                      styles.separator,
                      {
                        backgroundColor: theme.colors.separator,
                        marginLeft: 54,
                      },
                    ]}
                  />
                )}
              </React.Fragment>
            );
          })}
        </View>
      ) : (
        <View
          style={[
            styles.emptyHubCard,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.separator,
              borderWidth: theme.hairlineWidth,
              borderRadius: theme.radii.lg,
              ...theme.shadows.subtle,
            },
          ]}
        >
          <View style={[styles.emptyIconCircle, { backgroundColor: theme.colors.fill }]}>
            <AppIcon name="location-outline" size={26} color={theme.colors.labelSecondary} />
          </View>
          <AppText variant="headline" weight="600" align="center" style={{ marginBottom: 4 }}>
            Expanding Verified Hubs
          </AppText>
          <AppText variant="footnote" color="secondary" align="center" style={styles.emptyText}>
            Certified repair cafes and municipal electronics drop-offs are being verified for this region.
          </AppText>
        </View>
      )) : (
        /* Impact Metrics View */
        <View style={styles.statsGrid}>
          {stats.map((stat) => (
            <View
              key={stat.id}
              style={[
                styles.statCard,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.separator,
                  borderWidth: theme.hairlineWidth,
                  borderRadius: theme.radii.lg,
                  ...theme.shadows.subtle,
                },
              ]}
            >
              <View
                style={[
                  styles.statIconBadge,
                  {
                    backgroundColor: theme.colors.fillSecondary,
                  },
                ]}
              >
                <AppIcon name={stat.icon} size={16} color={theme.colors.tint} />
              </View>
              <AppText variant="headline" weight="700" style={{ marginTop: 6 }}>
                {stat.value}
              </AppText>
              <AppText variant="caption1" weight="600" color="secondary">
                {stat.label}
              </AppText>
              <AppText
                variant="caption2"
                color="tertiary"
                numberOfLines={2}
                style={{ marginTop: 3, lineHeight: 14 }}
              >
                {stat.detail}
              </AppText>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 26,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  segmentContainer: {
    flexDirection: 'row',
    padding: 2,
  },
  segmentItem: {
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  groupedCard: {
    overflow: 'hidden',
  },
  hubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  hubIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  hubDetails: {
    flex: 1,
    marginRight: 8,
  },
  hubTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hubSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    padding: 12,
  },
  statIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyHubCard: {
    padding: 22,
    alignItems: 'center',
  },
  emptyIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  emptyText: {
    lineHeight: 18,
    maxWidth: 290,
  },
});
