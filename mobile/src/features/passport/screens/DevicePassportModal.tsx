import React, { useState, useEffect } from 'react';
import {
  View,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../../design-system/theme/theme';
import { AppText } from '../../../components/ui/AppText';
import { AppIcon } from '../../../components/ui/AppIcon';
import { AppButton } from '../../../components/ui/AppButton';
import { AppSeparator } from '../../../components/ui/AppSeparator';
import { AppTextInput } from '../../../components/ui/AppTextInput';
import {
  getPassportEventsForDevice,
  recordPassportEvent,
} from '../../../services/database/workspaceRepositories';
import { DevicePassportEvent, subscribeToDataChanges } from '../../../services/storage/localPersistence';
import { useAuth } from '../../../services/auth/AuthContext';
import { hasRole } from '../../../services/auth/permissionsService';

export interface DevicePassportModalProps {
  visible: boolean;
  initialIdentifier?: string;
  onClose: () => void;
}

export const DevicePassportModal: React.FC<DevicePassportModalProps> = ({
  visible,
  initialIdentifier = 'IMEI-358921094819201',
  onClose,
}) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuth();

  const [searchQuery, setSearchQuery] = useState(initialIdentifier);
  const [events, setEvents] = useState<DevicePassportEvent[]>(() =>
    getPassportEventsForDevice(initialIdentifier)
  );

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [summary, setSummary] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [eventType, setEventType] = useState<DevicePassportEvent['eventType']>('reported_repair');

  useEffect(() => {
    setEvents(getPassportEventsForDevice(searchQuery));
  }, [searchQuery]);

  useEffect(() => {
    const unsub = subscribeToDataChanges((type) => {
      if (type === 'passport') {
        setEvents(getPassportEventsForDevice(searchQuery));
      }
    });
    return unsub;
  }, [searchQuery]);

  const handleRecordNewEvent = () => {
    if (!searchQuery.trim()) {
      Alert.alert('Device Identifier Required', 'Please provide a valid device identifier (IMEI, Serial # or Model ID).');
      return;
    }
    if (!summary.trim()) {
      Alert.alert('Summary Required', 'Please provide a summary describing this lifecycle event.');
      return;
    }

    const verificationTier: DevicePassportEvent['verificationTier'] = hasRole(profile, 'admin')
      ? 'certified'
      : hasRole(profile, 'repair_pro')
      ? 'evidence_backed'
      : hasRole(profile, 'recycler')
      ? 'certified'
      : 'user_reported';

    recordPassportEvent({
      deviceIdentifier: searchQuery.trim(),
      eventType,
      actorId: user?.id || 'anon',
      actorRole: profile?.activeWorkspace || (user ? 'consumer' : 'guest'),
      actorName: profile?.displayName || 'Circuvio User',
      verificationTier,
      summary: summary.trim(),
      evidenceUrl: evidenceUrl.trim() || undefined,
    });

    setSummary('');
    setEvidenceUrl('');
    setAddModalVisible(false);
  };

  const getTierColor = (tier: DevicePassportEvent['verificationTier']) => {
    switch (tier) {
      case 'certified':
        return '#10b981';
      case 'evidence_backed':
        return '#f59e0b';
      case 'provider_reported':
        return '#8b5cf6';
      default:
        return '#3b82f6';
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              borderBottomColor: theme.colors.separator,
              borderBottomWidth: theme.hairlineWidth,
              backgroundColor: theme.colors.secondaryBackground,
            },
          ]}
        >
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <AppIcon name="close" size={22} color={theme.colors.labelSecondary} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <AppText variant="headline" weight="700">
              Circular Device Passport
            </AppText>
            <AppText variant="caption2" color="secondary">
              Immutable Lifecycle Ledger
            </AppText>
          </View>
          <TouchableOpacity onPress={() => setAddModalVisible(true)} style={styles.addBtn}>
            <AppIcon name="add" size={22} color={theme.colors.tint} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}>
          {/* Search Box */}
          <View
            style={[
              styles.searchBar,
              {
                backgroundColor: theme.colors.secondaryBackground,
                borderColor: theme.colors.separator,
                borderWidth: theme.hairlineWidth,
              },
            ]}
          >
            <AppIcon name="search-outline" size={18} color={theme.colors.labelSecondary} />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.labelPrimary }]}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by IMEI, Serial, or Listing ID..."
              placeholderTextColor={theme.colors.labelTertiary}
              autoCapitalize="characters"
            />
          </View>

          {/* Device Overview Banner */}
          <View
            style={[
              styles.deviceCard,
              {
                backgroundColor: theme.colors.secondaryBackground,
                borderColor: theme.colors.separator,
                borderWidth: theme.hairlineWidth,
                ...theme.shadows.card,
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={[
                  styles.deviceAvatar,
                  {
                    backgroundColor: theme.isDark ? 'rgba(16, 185, 129, 0.20)' : 'rgba(0, 122, 94, 0.12)',
                  },
                ]}
              >
                <AppIcon name="shield-checkmark" size={24} color={theme.colors.tint} />
              </View>
              <View style={{ marginLeft: 12, flex: 1 }}>
                <AppText variant="subheadline" weight="700">
                  {searchQuery || 'Unregistered Hardware'}
                </AppText>
                <AppText variant="caption2" color="secondary">
                  {events.length} lifecycle events recorded • Zero tampering
                </AppText>
              </View>
            </View>

            <View style={styles.tierLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.dot, { backgroundColor: '#3b82f6' }]} />
                <AppText variant="caption2" color="secondary">
                  User Reported
                </AppText>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.dot, { backgroundColor: '#f59e0b' }]} />
                <AppText variant="caption2" color="secondary">
                  Evidence Backed
                </AppText>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.dot, { backgroundColor: '#10b981' }]} />
                <AppText variant="caption2" color="secondary">
                  Certified
                </AppText>
              </View>
            </View>
          </View>

          {/* Timeline of Events */}
          <AppText variant="headline" weight="700" style={{ marginTop: 24, marginBottom: 12 }}>
            Lifecycle Timeline
          </AppText>

          {events.length === 0 ? (
            <View style={styles.emptyContainer}>
              <AppIcon name="document-text-outline" size={36} color={theme.colors.labelSecondary} />
              <AppText variant="subheadline" color="secondary" style={{ marginTop: 8 }}>
                No verified lifecycle records for this identifier yet.
              </AppText>
            </View>
          ) : (
            events.map((evt, idx) => {
              const tierColor = getTierColor(evt.verificationTier);
              const isLast = idx === events.length - 1;

              return (
                <View key={evt.id} style={styles.timelineRow}>
                  {/* Left Spine */}
                  <View style={styles.timelineSpine}>
                    <View style={[styles.timelineNode, { backgroundColor: tierColor }]} />
                    {!isLast && <View style={[styles.timelineLine, { backgroundColor: theme.colors.separator }]} />}
                  </View>

                  {/* Event Card */}
                  <View
                    style={[
                      styles.eventCard,
                      {
                        backgroundColor: theme.colors.secondaryBackground,
                        borderColor: theme.colors.separator,
                        borderWidth: theme.hairlineWidth,
                      },
                    ]}
                  >
                    <View style={styles.eventTopRow}>
                      <View style={[styles.tierPill, { backgroundColor: `${tierColor}20` }]}>
                        <AppText variant="caption2" weight="700" customColor={tierColor}>
                          {evt.verificationTier.replace('_', ' ').toUpperCase()}
                        </AppText>
                      </View>
                      <AppText variant="caption2" color="secondary">
                        {new Date(evt.createdAt).toLocaleDateString()}
                      </AppText>
                    </View>

                    <AppText variant="subheadline" weight="700" style={{ marginTop: 6 }}>
                      {evt.eventType.replace('_', ' ').toUpperCase()}
                    </AppText>
                    <AppText variant="footnote" color="secondary" style={{ marginTop: 2 }}>
                      {evt.summary}
                    </AppText>

                    <AppSeparator verticalMargin={8} />

                    <View style={styles.actorRow}>
                      <AppIcon name="person-circle-outline" size={14} color={theme.colors.labelSecondary} />
                      <AppText variant="caption2" color="secondary" style={{ marginLeft: 4 }}>
                        Recorded by: {evt.actorName} ({evt.actorRole})
                      </AppText>
                    </View>

                    {evt.evidenceUrl && (
                      <View style={[styles.evidenceBadge, { backgroundColor: theme.colors.fill }]}>
                        <AppIcon name="link-outline" size={12} color={theme.colors.tint} />
                        <AppText variant="caption2" customColor={theme.colors.tint} style={{ marginLeft: 4 }}>
                          Verified Diagnostic Report Attached
                        </AppText>
                      </View>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>

        {/* Add Record Modal */}
        <Modal visible={addModalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { backgroundColor: theme.colors.secondaryBackground }]}>
              <AppText variant="title3" weight="700">
                Log Passport Event
              </AppText>
              <AppText variant="caption1" color="secondary" style={{ marginTop: 2 }}>
                Target: {searchQuery}
              </AppText>

              <View style={{ marginTop: 14 }}>
                <AppText variant="caption1" weight="600" color="secondary" style={{ marginBottom: 6 }}>
                  Event Type
                </AppText>
                <View style={styles.eventTypeGrid}>
                  {(['reported_repair', 'parts_replaced', 'refurbishment_inspection', 'ownership_transfer'] as const).map(
                    (t) => (
                      <TouchableOpacity
                        key={t}
                        onPress={() => setEventType(t)}
                        style={[
                          styles.eventPill,
                          {
                            backgroundColor: eventType === t ? theme.colors.fill : theme.colors.background,
                            borderColor: eventType === t ? theme.colors.tint : theme.colors.separator,
                            borderWidth: eventType === t ? 1.5 : theme.hairlineWidth,
                          },
                        ]}
                      >
                        <AppText variant="caption2" weight={eventType === t ? '700' : '500'}>
                          {t.replace('_', ' ')}
                        </AppText>
                      </TouchableOpacity>
                    )
                  )}
                </View>

                <View style={{ height: 12 }} />
                <AppTextInput
                  label="Event Summary"
                  value={summary}
                  onChangeText={setSummary}
                  placeholder="e.g. Battery swapped with genuine OEM part"
                />
                <View style={{ height: 12 }} />
                <AppTextInput
                  label="Evidence Document / URL (Optional)"
                  value={evidenceUrl}
                  onChangeText={setEvidenceUrl}
                  placeholder="https://..."
                />
              </View>

              <View style={styles.modalBtnRow}>
                <AppButton
                  title="Cancel"
                  variant="secondary"
                  onPress={() => setAddModalVisible(false)}
                  style={{ flex: 1, marginRight: 8 }}
                />
                <AppButton title="Record Event" onPress={handleRecordNewEvent} style={{ flex: 1 }} />
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeBtn: {
    padding: 6,
  },
  addBtn: {
    padding: 6,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
  deviceCard: {
    padding: 16,
    borderRadius: 16,
    marginTop: 14,
  },
  deviceAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(150, 150, 150, 0.2)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineSpine: {
    width: 28,
    alignItems: 'center',
  },
  timelineNode: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginTop: 6,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
  eventCard: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    marginLeft: 8,
  },
  eventTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tierPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  actorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  evidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    borderRadius: 18,
    padding: 20,
  },
  eventTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  eventPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  modalBtnRow: {
    flexDirection: 'row',
    marginTop: 20,
  },
});
