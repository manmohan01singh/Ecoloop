import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../../design-system/theme/theme';
import { AppText } from '../../../components/ui/AppText';
import { AppIcon, IconName } from '../../../components/ui/AppIcon';
import { AppButton } from '../../../components/ui/AppButton';
import { AppSeparator } from '../../../components/ui/AppSeparator';
import { useAuth } from '../../../services/auth/AuthContext';
import {
  fetchUserActivities,
  markActivityAsRead,
  markAllActivitiesAsRead,
  ACTIVITY_CATEGORIES,
} from '../../../services/database/activityRepository';
import {
  ActivityEventRecord,
  subscribeToDataChanges,
  getActivitiesForRecipient,
} from '../../../services/storage/localPersistence';

export interface ActivityScreenProps {
  onReturnHome?: () => void;
  onOpenExplore?: () => void;
  onOpenPostSheet?: () => void;
  onOpenAuthModal?: () => void;
}

function formatRelativeTime(isoString: string): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(isoString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return 'Recent';
  }
}

export const ActivityScreen: React.FC<ActivityScreenProps> = ({
  onReturnHome,
  onOpenExplore,
  onOpenPostSheet,
  onOpenAuthModal,
}) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated } = useAuth();

  const [activities, setActivities] = useState<ActivityEventRecord[]>(() =>
    user?.id ? getActivitiesForRecipient(user.id) : []
  );
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'listings' | 'account' | 'system'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(15);
  const [selectedEvent, setSelectedEvent] = useState<ActivityEventRecord | null>(null);

  const loadActivities = useCallback(async () => {
    if (!user?.id) {
      setActivities([]);
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchUserActivities(user.id);
      setActivities(data);
    } catch (err: any) {
      setLoadError(err?.message || 'Failed to load activity ledger.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadActivities();

    const unsubscribe = subscribeToDataChanges((type) => {
      if (type === 'activities') {
        loadActivities();
      }
    });

    return unsubscribe;
  }, [loadActivities]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadActivities();
    setRefreshing(false);
  }, [loadActivities]);

  const handleMarkAllRead = async () => {
    if (!user?.id) return;
    await markAllActivitiesAsRead(user.id);
    await loadActivities();
  };

  const handleItemPress = async (item: ActivityEventRecord) => {
    setSelectedEvent(item);
    if (!item.readAt && user?.id) {
      await markActivityAsRead(item.id, user.id);
      await loadActivities();
    }
  };

  // Filter activities by selected category
  const filteredActivities = useMemo(() => {
    if (selectedCategory === 'all') return activities;
    return activities.filter((item) => {
      if (selectedCategory === 'listings') {
        return item.eventType === 'listing_created' || item.eventType === 'listing_status_changed';
      }
      if (selectedCategory === 'account') {
        return item.eventType === 'account_created' || item.eventType === 'karma_earned';
      }
      if (selectedCategory === 'system') {
        return item.eventType === 'system_notice';
      }
      return true;
    });
  }, [activities, selectedCategory]);

  const unreadCount = useMemo(() => {
    return activities.filter((a) => !a.readAt).length;
  }, [activities]);

  // Paginated activities for incremental loading
  const paginatedActivities = useMemo(() => {
    return filteredActivities.slice(0, visibleCount);
  }, [filteredActivities, visibleCount]);

  // Group into Recent (< 24h) and Earlier
  const { recentGroup, earlierGroup } = useMemo(() => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const recent: ActivityEventRecord[] = [];
    const earlier: ActivityEventRecord[] = [];

    paginatedActivities.forEach((item) => {
      const itemTime = new Date(item.createdAt).getTime();
      if (now - itemTime < oneDay) {
        recent.push(item);
      } else {
        earlier.push(item);
      }
    });

    return { recentGroup: recent, earlierGroup: earlier };
  }, [paginatedActivities]);

  const getEventIcon = (eventType: string): { icon: IconName; color: string; bg: string } => {
    switch (eventType) {
      case 'listing_created':
        return {
          icon: 'leaf',
          color: theme.colors.tint,
          bg: theme.colors.fillSecondary,
        };
      case 'account_created':
        return {
          icon: 'shield-checkmark',
          color: theme.colors.tint,
          bg: theme.colors.fillSecondary,
        };
      case 'karma_earned':
        return {
          icon: 'flame',
          color: theme.colors.tint,
          bg: theme.colors.fillSecondary,
        };
      default:
        return {
          icon: 'notifications',
          color: theme.colors.labelSecondary,
          bg: theme.colors.fillSecondary,
        };
    }
  };

  const renderEventItem = (item: ActivityEventRecord, isLast: boolean) => {
    const isUnread = !item.readAt;
    const { icon, color, bg } = getEventIcon(item.eventType);

    return (
      <React.Fragment key={item.id}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`${item.title}. ${isUnread ? 'Unread.' : 'Read.'} ${item.description}`}
          activeOpacity={0.75}
          onPress={() => handleItemPress(item)}
          style={[
            styles.eventRow,
            {
              backgroundColor: isUnread
                ? (theme.isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)')
                : 'transparent',
            },
          ]}
        >
          {/* Icon Circle */}
          <View style={[styles.eventIconCircle, { backgroundColor: bg }]}>
            <AppIcon name={icon} size={20} color={color} />
          </View>

          {/* Event Content */}
          <View style={styles.eventTextContainer}>
            <View style={styles.eventTitleRow}>
              <AppText
                variant="subheadline"
                weight={isUnread ? '700' : '600'}
                color="primary"
                style={styles.eventTitle}
                numberOfLines={1}
              >
                {item.title}
              </AppText>

              <AppText variant="caption2" color="tertiary" style={styles.eventTime}>
                {formatRelativeTime(item.createdAt)}
              </AppText>
            </View>

            <AppText
              variant="footnote"
              color={isUnread ? 'primary' : 'secondary'}
              style={styles.eventDescription}
              numberOfLines={2}
            >
              {item.description}
            </AppText>
          </View>

          {/* Unread Indicator */}
          {isUnread ? (
            <View
              style={[
                styles.unreadDot,
                {
                  backgroundColor: theme.colors.tint,
                },
              ]}
            />
          ) : null}
        </TouchableOpacity>

        {!isLast ? (
          <View
            style={[
              styles.rowSeparator,
              {
                backgroundColor: theme.colors.separator,
                marginLeft: 62,
              },
            ]}
          />
        ) : null}
      </React.Fragment>
    );
  };

  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor: theme.colors.background,
          paddingTop: Math.max(insets.top, 12),
        },
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 90 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.tint}
          />
        }
      >
        {/* Navigation & Header */}
        <View style={styles.headerArea}>
          <View style={styles.headerTopRow}>
            <View style={styles.titleGroup}>
              <AppText variant="largeTitle" weight="700">
                Activity
              </AppText>
              {unreadCount > 0 ? (
                <View
                  style={[
                    styles.unreadBadgePill,
                    {
                      backgroundColor: theme.colors.tint,
                    },
                  ]}
                >
                  <AppText variant="caption2" weight="700" customColor={theme.isDark ? '#000000' : '#FFFFFF'}>
                    {unreadCount} NEW
                  </AppText>
                </View>
              ) : null}
            </View>

            {unreadCount > 0 ? (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Mark all activities as read"
                activeOpacity={0.7}
                onPress={handleMarkAllRead}
                style={styles.markAllButton}
              >
                <AppText variant="footnote" weight="600" customColor={theme.colors.tint}>
                  Mark all read
                </AppText>
              </TouchableOpacity>
            ) : null}
          </View>

          <AppText variant="subheadline" color="secondary" style={styles.headerSubtitle}>
            Live environmental audit ledger, active listings & badges
          </AppText>
        </View>

        {/* Load Error Notice */}
        {loadError ? (
          <View
            style={[
              styles.errorCard,
              {
                backgroundColor: theme.colors.fill,
                borderColor: theme.colors.destructive,
              },
            ]}
          >
            <View style={{ flex: 1, marginRight: 10 }}>
              <AppText variant="subheadline" weight="600" customColor={theme.colors.destructive}>
                Unable to load activity ledger
              </AppText>
              <AppText variant="caption1" color="secondary" style={{ marginTop: 2 }}>
                {loadError}
              </AppText>
            </View>
            <AppButton
              label="Retry"
              variant="gray"
              size="small"
              onPress={loadActivities}
            />
          </View>
        ) : null}

        {/* Loading Spinner */}
        {loading && activities.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.tint} />
            <AppText variant="footnote" color="secondary" style={{ marginTop: 8 }}>
              Synchronizing circular ledger...
            </AppText>
          </View>
        ) : null}

        {/* Signed Out Banner / Card */}
        {!isAuthenticated ? (
          <View
            style={[
              styles.authPromptCard,
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
                styles.promptIconCircle,
                {
                  backgroundColor: theme.colors.fillSecondary,
                },
              ]}
            >
              <AppIcon name="shield-outline" size={28} color={theme.colors.tint} />
            </View>
            <AppText variant="title3" weight="700" align="center" style={{ marginBottom: 6 }}>
              Sign In to View Activity
            </AppText>
            <AppText
              variant="subheadline"
              color="secondary"
              align="center"
              style={{ marginBottom: 18, lineHeight: 20 }}
            >
              Create an account or sign in to track live device listings, earn EcoKarma points, and monitor community impact.
            </AppText>
            <AppButton
              label="Sign In or Register"
              variant="filled"
              size="medium"
              icon="person-outline"
              fullWidth
              onPress={onOpenAuthModal}
            />
          </View>
        ) : (
          <>
            {/* Filter Pills */}
            <View style={styles.filterPillsRow}>
              {ACTIVITY_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Filter ${cat.label}`}
                    activeOpacity={0.7}
                    onPress={() => setSelectedCategory(cat.id)}
                    style={[
                      styles.filterPill,
                      {
                        backgroundColor: isSelected
                          ? theme.colors.tint
                          : theme.colors.fill,
                        borderColor: isSelected
                          ? theme.colors.tint
                          : 'transparent',
                      },
                    ]}
                  >
                    <AppText
                      variant="subheadline"
                      weight={isSelected ? '600' : '500'}
                      customColor={isSelected ? (theme.isDark ? '#000000' : '#FFFFFF') : theme.colors.labelSecondary}
                    >
                      {cat.label}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Empty State */}
            {filteredActivities.length === 0 ? (
              <View
                style={[
                  styles.emptyCard,
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
                    {
                      backgroundColor: theme.colors.fillSecondary,
                    },
                  ]}
                >
                  <AppIcon name="pulse" size={32} color={theme.colors.tint} />
                </View>

                <AppText variant="title3" weight="700" align="center" style={{ marginBottom: 6 }}>
                  No Activity Yet
                </AppText>
                <AppText
                  variant="subheadline"
                  color="secondary"
                  align="center"
                  style={{ marginBottom: 20, lineHeight: 20, maxWidth: 280 }}
                >
                  Post a device or participate in circular programs to see your verified environmental ledger here.
                </AppText>

                <View style={styles.emptyButtonRow}>
                  <AppButton
                    label="Post a Device"
                    variant="filled"
                    size="medium"
                    icon="add-circle-outline"
                    onPress={onOpenPostSheet || (() => {})}
                  />
                  {onOpenExplore ? (
                    <View style={{ marginTop: 10, width: '100%' }}>
                      <AppButton
                        label="Explore Marketplace"
                        variant="gray"
                        size="medium"
                        icon="compass-outline"
                        onPress={onOpenExplore}
                      />
                    </View>
                  ) : null}
                </View>
              </View>
            ) : (
              <>
                {/* Recent Group */}
                {recentGroup.length > 0 ? (
                  <View style={styles.groupContainer}>
                    <AppText
                      variant="footnote"
                      weight="600"
                      color="secondary"
                      style={styles.groupTitle}
                    >
                      RECENT ACTIVITY
                    </AppText>

                    <View
                      style={[
                        styles.groupedCard,
                        {
                          backgroundColor: theme.colors.secondaryBackground,
                          borderColor: theme.colors.separator,
                          borderWidth: theme.hairlineWidth,
                          borderRadius: theme.radii.xl,
                          ...theme.shadows.card,
                        },
                      ]}
                    >
                      {recentGroup.map((item, index) =>
                        renderEventItem(item, index === recentGroup.length - 1)
                      )}
                    </View>
                  </View>
                ) : null}

                {/* Earlier Group */}
                {earlierGroup.length > 0 ? (
                  <View style={styles.groupContainer}>
                    <AppText
                      variant="footnote"
                      weight="600"
                      color="secondary"
                      style={styles.groupTitle}
                    >
                      EARLIER
                    </AppText>

                    <View
                      style={[
                        styles.groupedCard,
                        {
                          backgroundColor: theme.colors.secondaryBackground,
                          borderColor: theme.colors.separator,
                          borderWidth: theme.hairlineWidth,
                          borderRadius: theme.radii.xl,
                          ...theme.shadows.card,
                        },
                      ]}
                    >
                      {earlierGroup.map((item, index) =>
                        renderEventItem(item, index === earlierGroup.length - 1)
                      )}
                    </View>
                  </View>
                ) : null}

                {/* Pagination / Incremental Load CTA */}
                {filteredActivities.length > visibleCount ? (
                  <View style={styles.paginationRow}>
                    <AppButton
                      label={`Load earlier activity (${filteredActivities.length - visibleCount} remaining)`}
                      variant="gray"
                      size="medium"
                      fullWidth
                      onPress={() => setVisibleCount((prev) => prev + 15)}
                    />
                  </View>
                ) : null}
              </>
            )}
          </>
        )}
      </ScrollView>

      {/* Activity Event Detail Inspection Modal */}
      <Modal
        visible={Boolean(selectedEvent)}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedEvent(null)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setSelectedEvent(null)}
          />
          <View
            style={[
              styles.detailCard,
              {
                backgroundColor: theme.colors.cardElevated,
                borderColor: theme.colors.separator,
                borderWidth: theme.hairlineWidth,
                borderTopLeftRadius: theme.radii.xxl,
                borderTopRightRadius: theme.radii.xxl,
                paddingBottom: Math.max(insets.bottom, 24),
              },
            ]}
          >
            {/* Grabber */}
            <View style={styles.modalGrabberRow}>
              <View style={[styles.modalGrabber, { backgroundColor: theme.colors.labelQuaternary }]} />
            </View>

            {selectedEvent ? (
              <View style={styles.modalBody}>
                <View style={styles.modalHeaderRow}>
                  <View
                    style={[
                      styles.modalIconCircle,
                      { backgroundColor: getEventIcon(selectedEvent.eventType).bg },
                    ]}
                  >
                    <AppIcon
                      name={getEventIcon(selectedEvent.eventType).icon}
                      size={24}
                      color={getEventIcon(selectedEvent.eventType).color}
                    />
                  </View>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <AppText variant="caption2" weight="700" customColor={getEventIcon(selectedEvent.eventType).color}>
                      {selectedEvent.eventType.replace('_', ' ').toUpperCase()}
                    </AppText>
                    <AppText variant="caption2" color="tertiary">
                      {formatRelativeTime(selectedEvent.createdAt)}
                    </AppText>
                  </View>
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel="Close event detail"
                    onPress={() => setSelectedEvent(null)}
                    style={[styles.modalCloseButton, { backgroundColor: theme.colors.fill }]}
                  >
                    <AppIcon name="close" size={18} color={theme.colors.labelSecondary} />
                  </TouchableOpacity>
                </View>

                <AppText variant="title3" weight="700" style={{ marginTop: 12, marginBottom: 8 }}>
                  {selectedEvent.title}
                </AppText>

                <AppText variant="subheadline" color="secondary" style={{ lineHeight: 22, marginBottom: 16 }}>
                  {selectedEvent.description}
                </AppText>

                {/* Metadata Chips */}
                {selectedEvent.metadata && Object.keys(selectedEvent.metadata).length > 0 ? (
                  <View style={styles.metaChipsRow}>
                    {selectedEvent.metadata.co2SavedKg ? (
                      <View style={[styles.metaChip, { backgroundColor: theme.colors.fill }]}>
                        <AppIcon name="leaf" size={12} color={theme.colors.tint} style={{ marginRight: 4 }} />
                        <AppText variant="caption1" weight="600" customColor={theme.colors.tint}>
                          {selectedEvent.metadata.co2SavedKg} kg CO₂ Diverted
                        </AppText>
                      </View>
                    ) : null}
                    {selectedEvent.metadata.pathway ? (
                      <View style={[styles.metaChip, { backgroundColor: theme.colors.fill }]}>
                        <AppText variant="caption1" weight="600" color="primary">
                          Pathway: {String(selectedEvent.metadata.pathway).toUpperCase()}
                        </AppText>
                      </View>
                    ) : null}
                    {selectedEvent.metadata.price !== undefined && selectedEvent.metadata.price > 0 ? (
                      <View style={[styles.metaChip, { backgroundColor: theme.colors.fill }]}>
                        <AppText variant="caption1" weight="600" color="primary">
                          ${selectedEvent.metadata.price}
                        </AppText>
                      </View>
                    ) : null}
                  </View>
                ) : null}

                {/* Actions */}
                <View style={styles.modalActionRow}>
                  {selectedEvent.entityType === 'device_listing' && onOpenExplore ? (
                    <View style={{ marginBottom: 10 }}>
                      <AppButton
                        label="View in Explore Marketplace"
                        variant="filled"
                        size="medium"
                        icon="compass-outline"
                        fullWidth
                        onPress={() => {
                          setSelectedEvent(null);
                          onOpenExplore();
                        }}
                      />
                    </View>
                  ) : null}
                  <AppButton
                    label="Done"
                    variant="tinted"
                    size="medium"
                    fullWidth
                    onPress={() => setSelectedEvent(null)}
                  />
                </View>
              </View>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerArea: {
    marginBottom: 16,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unreadBadgePill: {
    marginLeft: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  markAllButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  headerSubtitle: {
    marginTop: 4,
  },
  filterPillsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    marginRight: 8,
  },
  authPromptCard: {
    padding: 24,
    alignItems: 'center',
    marginVertical: 12,
  },
  promptIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
    marginTop: 12,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyButtonRow: {
    width: '100%',
    maxWidth: 260,
    alignItems: 'center',
  },
  groupContainer: {
    marginBottom: 20,
  },
  groupTitle: {
    letterSpacing: 0.8,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  groupedCard: {
    overflow: 'hidden',
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  eventIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  eventTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  eventTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  eventTitle: {
    flex: 1,
    marginRight: 8,
  },
  eventTime: {
    fontSize: 12,
  },
  eventDescription: {
    lineHeight: 18,
  },
  unreadDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    marginLeft: 6,
  },
  rowSeparator: {
    height: StyleSheet.hairlineWidth,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  paginationRow: {
    marginTop: 12,
    marginBottom: 20,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  detailCard: {
    maxHeight: '85%',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  modalGrabberRow: {
    alignItems: 'center',
    marginBottom: 14,
  },
  modalGrabber: {
    width: 38,
    height: 4.5,
    borderRadius: 3,
  },
  modalBody: {
    paddingBottom: 8,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  modalActionRow: {
    marginTop: 8,
  },
});
