import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Modal,
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
  getRecyclingRequests,
  acceptRecyclingRequest,
  recordCollectionReceipt,
} from '../../../services/database/workspaceRepositories';
import {
  RecyclingRequest,
  getStoredCollectionEvents,
  CollectionEvent,
  subscribeToDataChanges,
} from '../../../services/storage/localPersistence';
import { useAuth } from '../../../services/auth/AuthContext';
import { canProcessRecycling } from '../../../services/auth/permissionsService';

export interface RecyclerWorkspaceProps {
  onReturnToConsumer: () => void;
  onOpenWorkspaceSwitcher: () => void;
}

export const RecyclerWorkspace: React.FC<RecyclerWorkspaceProps> = ({
  onReturnToConsumer,
  onOpenWorkspaceSwitcher,
}) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuth();

  const [activeTab, setActiveTab] = useState<'requests' | 'intake' | 'certs'>('requests');
  const [requests, setRequests] = useState<RecyclingRequest[]>(() => getRecyclingRequests());
  const [certs, setCerts] = useState<CollectionEvent[]>(() => getStoredCollectionEvents());

  // Intake & Scale Weight Modal
  const [intakeModalVisible, setIntakeModalVisible] = useState(false);
  const [selectedReq, setSelectedReq] = useState<RecyclingRequest | null>(null);
  const [scaleWeight, setScaleWeight] = useState('2.4');
  const [procStage, setProcStage] = useState<'dismantled' | 'materials_recovered' | 'certified_destruction'>('materials_recovered');
  const [dispNotes, setDispNotes] = useState('Hydrometallurgical copper & rare earth recovery. Circuit boards dismantled.');
  const [hazardNotes, setHazardNotes] = useState('');

  useEffect(() => {
    const unsub = subscribeToDataChanges((type) => {
      if (type === 'recycling') {
        setRequests(getRecyclingRequests());
        setCerts(getStoredCollectionEvents());
      }
    });
    return unsub;
  }, []);

  if (!canProcessRecycling(profile)) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.background,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24,
          },
        ]}
      >
        <AppIcon name="leaf-outline" size={54} color={theme.colors.tint} />
        <AppText variant="title2" weight="700" style={{ marginTop: 16 }}>
          Certified Recycler Access Required
        </AppText>
        <AppText
          variant="subheadline"
          color="secondary"
          style={{ textAlign: 'center', marginTop: 8, marginBottom: 24 }}
        >
          Please submit a verified Recycler application or switch back to Consumer Hub.
        </AppText>
        <AppButton label="Return to Consumer Hub" variant="filled" onPress={onReturnToConsumer} />
      </SafeAreaView>
    );
  }

  const pendingRequests = requests.filter((r) => r.status === 'requested');
  const acceptedQueue = requests.filter((r) => r.status === 'accepted' || r.status === 'scheduled');
  const totalVerifiedWeightKg = certs.reduce((acc, c) => acc + (c.verifiedWeightKg || 0), 0);

  const handleAccept = (req: RecyclingRequest) => {
    const res = acceptRecyclingRequest(
      user?.id || 'rec-default',
      profile?.displayName || 'Pacific Rim Circular Metals',
      req.id
    );
    if (res.success) {
      Alert.alert('Request Accepted', 'Customer notified. Device added to intake queue.');
    }
  };

  const handleOpenIntake = (req: RecyclingRequest) => {
    setSelectedReq(req);
    setScaleWeight(req.estimatedWeightKg ? req.estimatedWeightKg.toString() : '1.5');
    setHazardNotes(req.hasHazardousBattery ? 'Swollen battery contained in fire-retardant chamber.' : '');
    setIntakeModalVisible(true);
  };

  const handleConfirmIntake = () => {
    if (!selectedReq) return;
    const weightNum = parseFloat(scaleWeight);
    if (isNaN(weightNum) || weightNum <= 0) {
      Alert.alert('Invalid Weight', 'Please enter a valid scale weight greater than 0 kg.');
      return;
    }

    const res = recordCollectionReceipt({
      requestId: selectedReq.id,
      recyclerId: user?.id || 'rec-default',
      recyclerName: profile?.displayName || 'Pacific Rim Circular Metals',
      verifiedWeightKg: weightNum,
      hazardousNotes: hazardNotes,
      processingStage: procStage,
      dispositionSummary: dispNotes,
    });

    if (res.success) {
      setIntakeModalVisible(false);
      Alert.alert(
        'Certificate Issued! 🌱',
        `Official Certificate #${res.collectionEvent?.certificateNumber} generated. Measured weight of ${weightNum} kg credited to circular diversion.`
      );
    } else {
      Alert.alert('Error', res.error || 'Failed to record receipt.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* App Bar */}
      <View
        style={[
          styles.appBar,
          {
            backgroundColor: theme.colors.secondaryBackground,
            borderBottomColor: theme.colors.separator,
            borderBottomWidth: theme.hairlineWidth,
            paddingTop: Math.max(insets.top, 8),
          },
        ]}
      >
        <TouchableOpacity onPress={onOpenWorkspaceSwitcher} style={styles.workspacePill}>
          <View style={[styles.recIcon, { backgroundColor: 'rgba(16, 185, 129, 0.20)' }]}>
            <AppIcon name="leaf" size={16} color={theme.colors.tint} />
          </View>
          <View style={{ marginLeft: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <AppText variant="caption1" weight="700">
                Certified Recycler
              </AppText>
              <AppIcon name="chevron-down" size={14} color={theme.colors.labelSecondary} style={{ marginLeft: 4 }} />
            </View>
            <AppText variant="caption2" color="secondary">
              Pacific Metals • R2v3 Certified
            </AppText>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={onReturnToConsumer} style={[styles.exitBtn, { backgroundColor: theme.colors.fill }]}>
          <AppText variant="caption1" weight="600" customColor={theme.colors.tint}>
            Consumer Hub
          </AppText>
        </TouchableOpacity>
      </View>

      {/* Metrics Banner */}
      <View style={[styles.metricsBanner, { backgroundColor: theme.colors.secondaryBackground }]}>
        <View style={styles.metricCol}>
          <AppText variant="headline" weight="700" customColor={theme.colors.tint}>
            {totalVerifiedWeightKg.toFixed(1)} kg
          </AppText>
          <AppText variant="caption2" color="secondary">
            Verified Weight
          </AppText>
        </View>
        <View style={[styles.metricDivider, { backgroundColor: theme.colors.separator }]} />
        <View style={styles.metricCol}>
          <AppText variant="headline" weight="700" color="primary">
            {certs.length}
          </AppText>
          <AppText variant="caption2" color="secondary">
            Certificates Issued
          </AppText>
        </View>
        <View style={[styles.metricDivider, { backgroundColor: theme.colors.separator }]} />
        <View style={styles.metricCol}>
          <AppText variant="headline" weight="700" color="primary">
            {pendingRequests.length}
          </AppText>
          <AppText variant="caption2" color="secondary">
            Pending Queue
          </AppText>
        </View>
      </View>

      {/* Segmented Tabs */}
      <View style={styles.tabsRow}>
        {[
          { key: 'requests', label: `Pending (${pendingRequests.length})` },
          { key: 'intake', label: `Intake (${acceptedQueue.length})` },
          { key: 'certs', label: `Certificates (${certs.length})` },
        ].map((t) => {
          const isSel = activeTab === t.key;
          return (
            <TouchableOpacity
              key={t.key}
              onPress={() => setActiveTab(t.key as any)}
              style={[
                styles.tabBtn,
                {
                  borderBottomColor: isSel ? theme.colors.tint : 'transparent',
                  borderBottomWidth: isSel ? 2.5 : 0,
                },
              ]}
            >
              <AppText variant="subheadline" weight={isSel ? '700' : '500'} color={isSel ? 'tint' : 'secondary'}>
                {t.label}
              </AppText>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 90 }]}>
        {/* TAB 1: PENDING REQUESTS */}
        {activeTab === 'requests' && (
          <View>
            {pendingRequests.length === 0 ? (
              <View style={styles.emptyView}>
                <AppIcon name="checkmark-circle-outline" size={40} color={theme.colors.labelSecondary} />
                <AppText variant="subheadline" color="secondary" style={{ marginTop: 8 }}>
                  No pending collection requests.
                </AppText>
              </View>
            ) : (
              pendingRequests.map((req) => (
                <View
                  key={req.id}
                  style={[
                    styles.ticketCard,
                    {
                      backgroundColor: theme.colors.secondaryBackground,
                      borderColor: theme.colors.separator,
                      borderWidth: theme.hairlineWidth,
                      ...theme.shadows.card,
                    },
                  ]}
                >
                  <View style={styles.ticketTop}>
                    <View style={styles.badgeRow}>
                      <View style={[styles.catPill, { backgroundColor: theme.colors.fill }]}>
                        <AppText variant="caption2" weight="700" customColor={theme.colors.tint}>
                          {req.deviceCategory.toUpperCase()}
                        </AppText>
                      </View>
                      {req.hasHazardousBattery && (
                        <View style={[styles.hazardPill, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                          <AppText variant="caption2" weight="700" customColor="#ef4444">
                            ⚠️ HAZARDOUS BATTERY
                          </AppText>
                        </View>
                      )}
                    </View>
                    <AppText variant="caption2" color="secondary">
                      {req.city}
                    </AppText>
                  </View>

                  <AppText variant="headline" weight="700" style={{ marginTop: 6 }}>
                    {req.quantity}x {req.brand} {req.model}
                  </AppText>
                  <AppText variant="footnote" color="secondary" style={{ marginTop: 2 }}>
                    Est. Weight: ~{req.estimatedWeightKg} kg • Handover: {req.collectionType}
                  </AppText>

                  <AppSeparator verticalMargin={10} />

                  <View style={styles.ticketFooter}>
                    <AppText variant="caption1" color="secondary">
                      User: {req.userName}
                    </AppText>
                    <AppButton title="Accept Request" size="small" onPress={() => handleAccept(req)} />
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* TAB 2: INTAKE & SCALE WEIGHING */}
        {activeTab === 'intake' && (
          <View>
            {acceptedQueue.length === 0 ? (
              <View style={styles.emptyView}>
                <AppIcon name="scale-outline" size={40} color={theme.colors.labelSecondary} />
                <AppText variant="subheadline" color="secondary" style={{ marginTop: 8 }}>
                  No items currently awaiting scale weighing.
                </AppText>
              </View>
            ) : (
              acceptedQueue.map((req) => (
                <View
                  key={req.id}
                  style={[
                    styles.ticketCard,
                    {
                      backgroundColor: theme.colors.secondaryBackground,
                      borderColor: theme.colors.separator,
                      borderWidth: theme.hairlineWidth,
                      ...theme.shadows.card,
                    },
                  ]}
                >
                  <View style={styles.ticketTop}>
                    <View style={[styles.catPill, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                      <AppText variant="caption2" weight="700" customColor={theme.colors.tint}>
                        READY FOR SCALE INTAKE
                      </AppText>
                    </View>
                    <AppText variant="caption2" color="secondary">
                      {req.city}
                    </AppText>
                  </View>

                  <AppText variant="headline" weight="700" style={{ marginTop: 6 }}>
                    {req.quantity}x {req.brand} {req.model}
                  </AppText>
                  <AppText variant="footnote" color="secondary" style={{ marginTop: 2 }}>
                    User: {req.userName} • Condition: {req.condition}
                  </AppText>

                  <AppSeparator verticalMargin={10} />

                  <View style={styles.ticketFooter}>
                    <AppText variant="caption1" color="secondary">
                      Est: {req.estimatedWeightKg} kg
                    </AppText>
                    <AppButton title="Weigh & Issue Certificate" size="small" onPress={() => handleOpenIntake(req)} />
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* TAB 3: CERTIFICATES ISSUED */}
        {activeTab === 'certs' && (
          <View>
            {certs.map((c) => (
              <View
                key={c.id}
                style={[
                  styles.ticketCard,
                  {
                    backgroundColor: theme.colors.secondaryBackground,
                    borderColor: theme.colors.separator,
                    borderWidth: theme.hairlineWidth,
                  },
                ]}
              >
                <View style={styles.ticketTop}>
                  <View style={[styles.catPill, { backgroundColor: theme.colors.fill }]}>
                    <AppText variant="caption2" weight="700" customColor={theme.colors.tint}>
                      {c.certificateNumber}
                    </AppText>
                  </View>
                  <AppText variant="caption2" color="secondary">
                    {new Date(c.recordedAt).toLocaleDateString()}
                  </AppText>
                </View>

                <AppText variant="headline" weight="700" style={{ marginTop: 6 }}>
                  {c.verifiedWeightKg} kg Measured Scale Weight
                </AppText>
                <AppText variant="footnote" color="secondary" style={{ marginTop: 2 }}>
                  Stage: {c.processingStage.replace('_', ' ').toUpperCase()} • {c.dispositionSummary}
                </AppText>

                {c.hazardousNotes && (
                  <AppText variant="caption2" customColor="#ef4444" style={{ marginTop: 4 }}>
                    Hazard: {c.hazardousNotes}
                  </AppText>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Scale Weighing & Certificate Issuance Modal */}
      <Modal visible={intakeModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.colors.secondaryBackground }]}>
            <AppText variant="title3" weight="700">
              Verified Scale Intake & Certificate
            </AppText>
            <AppText variant="caption1" color="secondary" style={{ marginTop: 2 }}>
              {selectedReq?.quantity}x {selectedReq?.brand} {selectedReq?.model}
            </AppText>

            <View style={{ marginTop: 14 }}>
              <AppTextInput
                label="Verified Measured Scale Weight (kg)"
                value={scaleWeight}
                onChangeText={setScaleWeight}
                keyboardType="numeric"
              />

              <AppText variant="caption1" weight="600" color="secondary" style={{ marginTop: 12, marginBottom: 6 }}>
                Processing Stage
              </AppText>
              <View style={styles.stageRow}>
                {[
                  { id: 'dismantled', label: 'Dismantled' },
                  { id: 'materials_recovered', label: 'Materials Recovered' },
                  { id: 'certified_destruction', label: 'Data Destruction' },
                ].map((s) => (
                  <TouchableOpacity
                    key={s.id}
                    onPress={() => setProcStage(s.id as any)}
                    style={[
                      styles.stagePill,
                      {
                        backgroundColor: procStage === s.id ? theme.colors.fill : theme.colors.background,
                        borderColor: procStage === s.id ? theme.colors.tint : theme.colors.separator,
                        borderWidth: procStage === s.id ? 1.5 : theme.hairlineWidth,
                      },
                    ]}
                  >
                    <AppText variant="caption2" weight={procStage === s.id ? '700' : '500'}>
                      {s.label}
                    </AppText>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={{ height: 10 }} />
              <AppTextInput label="Disposition Summary" value={dispNotes} onChangeText={setDispNotes} />
              <View style={{ height: 10 }} />
              <AppTextInput label="Hazardous Battery Handling Notes" value={hazardNotes} onChangeText={setHazardNotes} />
            </View>

            <View style={styles.modalBtnRow}>
              <AppButton
                title="Cancel"
                variant="secondary"
                onPress={() => setIntakeModalVisible(false)}
                style={{ flex: 1, marginRight: 8 }}
              />
              <AppButton title="Issue Certificate" onPress={handleConfirmIntake} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  appBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  workspacePill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exitBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  metricsBanner: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  metricCol: {
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    height: 24,
  },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  emptyView: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  ticketCard: {
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
  },
  ticketTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  catPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  hazardPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    padding: 20,
    borderRadius: 18,
  },
  stageRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  stagePill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  modalBtnRow: {
    flexDirection: 'row',
    marginTop: 20,
  },
});
