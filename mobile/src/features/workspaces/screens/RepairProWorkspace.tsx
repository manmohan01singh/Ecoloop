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
  getRepairRequests,
  submitRepairQuote,
  updateRepairStatus,
} from '../../../services/database/workspaceRepositories';
import {
  RepairRequest,
  subscribeToDataChanges,
} from '../../../services/storage/localPersistence';
import { useAuth } from '../../../services/auth/AuthContext';
import { canQuoteRepairs } from '../../../services/auth/permissionsService';

export interface RepairProWorkspaceProps {
  onReturnToConsumer: () => void;
  onOpenWorkspaceSwitcher: () => void;
}

export const RepairProWorkspace: React.FC<RepairProWorkspaceProps> = ({
  onReturnToConsumer,
  onOpenWorkspaceSwitcher,
}) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuth();

  const [activeTab, setActiveTab] = useState<'queue' | 'active' | 'history'>('queue');
  const [requests, setRequests] = useState<RepairRequest[]>(() => getRepairRequests());

  // Quote Builder Modal State
  const [quoteModalVisible, setQuoteModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RepairRequest | null>(null);
  const [partsCost, setPartsCost] = useState('85');
  const [laborCost, setLaborCost] = useState('65');
  const [diagFee, setDiagFee] = useState('0');
  const [turnaroundDays, setTurnaroundDays] = useState('2');
  const [warrantyDays, setWarrantyDays] = useState('180');
  const [quoteNotes, setQuoteNotes] = useState('OEM grade parts. Free ultrasonic cleaning & thermal renewal included.');

  useEffect(() => {
    const unsub = subscribeToDataChanges((type) => {
      if (type === 'repairs') {
        setRequests(getRepairRequests());
      }
    });
    return unsub;
  }, []);

  if (!canQuoteRepairs(profile)) {
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
        <AppIcon name="construct-outline" size={54} color={theme.colors.tint} />
        <AppText variant="title2" weight="700" style={{ marginTop: 16 }}>
          Repair Specialist Access Required
        </AppText>
        <AppText
          variant="subheadline"
          color="secondary"
          style={{ textAlign: 'center', marginTop: 8, marginBottom: 24 }}
        >
          Please submit a verified Repair Professional application or switch back to Consumer Hub.
        </AppText>
        <AppButton label="Return to Consumer Hub" variant="filled" onPress={onReturnToConsumer} />
      </SafeAreaView>
    );
  }

  const queueItems = requests.filter((r) => r.status === 'submitted' || r.status === 'quoted');
  const activeJobs = requests.filter((r) => r.status === 'accepted' || r.status === 'scheduled' || r.status === 'in_progress');
  const completedJobs = requests.filter((r) => r.status === 'completed');

  const handleOpenQuote = (req: RepairRequest) => {
    setSelectedRequest(req);
    setQuoteModalVisible(true);
  };

  const handleSubmitQuote = () => {
    if (!selectedRequest) return;

    const res = submitRepairQuote({
      repairRequestId: selectedRequest.id,
      providerId: user?.id || 'pro-default',
      providerName: profile?.displayName || 'Apex Micro-Soldering Pro',
      partsCost: parseFloat(partsCost) || 0,
      laborCost: parseFloat(laborCost) || 0,
      diagnosticFee: parseFloat(diagFee) || 0,
      estimatedTurnaroundDays: parseInt(turnaroundDays, 10) || 2,
      warrantyDays: parseInt(warrantyDays, 10) || 90,
      notes: quoteNotes,
    });

    if (res.success) {
      setQuoteModalVisible(false);
      Alert.alert('Quote Broadcasted', 'Itemized quote sent to customer. Status updated to Quoted.');
    } else {
      Alert.alert('Error', res.error || 'Failed to submit quote.');
    }
  };

  const handleAdvanceStatus = (req: RepairRequest) => {
    let nextStatus: RepairRequest['status'] = 'in_progress';
    if (req.status === 'accepted') nextStatus = 'scheduled';
    else if (req.status === 'scheduled') nextStatus = 'in_progress';
    else if (req.status === 'in_progress') nextStatus = 'completed';

    const res = updateRepairStatus(user?.id || 'pro-default', req.id, nextStatus as any, 'Status advanced by technician.');
    if (res.success) {
      if (nextStatus === 'completed') {
        Alert.alert('Job Completed', 'Repair certified. Customer notified and Device Passport event generated.');
      }
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Workspace App Bar */}
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
          <View style={[styles.proIcon, { backgroundColor: theme.colors.fillSecondary }]}>
            <AppIcon name="construct" size={16} color={theme.colors.tint} />
          </View>
          <View style={{ marginLeft: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <AppText variant="caption1" weight="700">
                Repair Specialist
              </AppText>
              <AppIcon name="chevron-down" size={14} color={theme.colors.labelSecondary} style={{ marginLeft: 4 }} />
            </View>
            <AppText variant="caption2" color="secondary">
              Apex Labs • Verified Pro
            </AppText>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={onReturnToConsumer} style={[styles.exitBtn, { backgroundColor: theme.colors.fill }]}>
          <AppText variant="caption1" weight="600" customColor={theme.colors.tint}>
            Consumer Hub
          </AppText>
        </TouchableOpacity>
      </View>

      {/* Metrics Bar */}
      <View style={[styles.metricsBanner, { backgroundColor: theme.colors.secondaryBackground }]}>
        <View style={styles.metricCol}>
          <AppText variant="headline" weight="700" customColor={theme.colors.tint}>
            {queueItems.length}
          </AppText>
          <AppText variant="caption2" color="secondary">
            Triage Queue
          </AppText>
        </View>
        <View style={[styles.metricDivider, { backgroundColor: theme.colors.separator }]} />
        <View style={styles.metricCol}>
          <AppText variant="headline" weight="700" color="primary">
            {activeJobs.length}
          </AppText>
          <AppText variant="caption2" color="secondary">
            Active Repairs
          </AppText>
        </View>
        <View style={[styles.metricDivider, { backgroundColor: theme.colors.separator }]} />
        <View style={styles.metricCol}>
          <AppText variant="headline" weight="700" color="primary">
            4.9★
          </AppText>
          <AppText variant="caption2" color="secondary">
            Shop Rating
          </AppText>
        </View>
      </View>

      {/* Workspace Segmented Tabs */}
      <View style={styles.tabsRow}>
        {[
          { key: 'queue', label: `Queue (${queueItems.length})` },
          { key: 'active', label: `Active (${activeJobs.length})` },
          { key: 'history', label: `Completed (${completedJobs.length})` },
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
        {/* TAB 1: TRIAGE QUEUE */}
        {activeTab === 'queue' && (
          <View>
            {queueItems.length === 0 ? (
              <View style={styles.emptyView}>
                <AppIcon name="checkmark-circle-outline" size={40} color={theme.colors.labelSecondary} />
                <AppText variant="subheadline" color="secondary" style={{ marginTop: 8 }}>
                  Queue is clear. No unquoted customer requests.
                </AppText>
              </View>
            ) : (
              queueItems.map((req) => (
                <View
                  key={req.id}
                  style={[
                    styles.ticketCard,
                    {
                      backgroundColor: theme.colors.card,
                      borderColor: theme.colors.separator,
                      borderWidth: theme.hairlineWidth,
                      ...theme.shadows.card,
                    },
                  ]}
                >
                  <View style={styles.ticketTop}>
                    <View style={styles.ticketBadgeRow}>
                      <View style={[styles.urgencyPill, { backgroundColor: req.urgency === 'express' ? theme.colors.fill : theme.colors.fillSecondary }]}>
                        <AppText variant="caption2" weight="700" customColor={req.urgency === 'express' ? theme.colors.labelPrimary : theme.colors.labelSecondary}>
                          {req.urgency.toUpperCase()}
                        </AppText>
                      </View>
                      <AppText variant="caption2" color="secondary" style={{ marginLeft: 8 }}>
                        {req.city} • {req.preferredServiceType}
                      </AppText>
                    </View>
                    <AppText variant="caption2" color="secondary">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </AppText>
                  </View>

                  <AppText variant="headline" weight="700" style={{ marginTop: 6 }}>
                    {req.brand} {req.model}
                  </AppText>
                  <AppText variant="footnote" weight="600" customColor={theme.colors.tint} style={{ marginTop: 2 }}>
                    Issue: {req.issueType}
                  </AppText>

                  <AppText variant="footnote" color="secondary" style={{ marginTop: 4 }}>
                    Symptoms: "{req.symptoms}"
                  </AppText>

                  <AppSeparator verticalMargin={10} />

                  <View style={styles.ticketFooter}>
                    <AppText variant="caption1" color="secondary">
                      Customer: {req.customerName}
                    </AppText>
                    <AppButton
                      title={req.status === 'quoted' ? 'Update Quote' : 'Prepare Quote'}
                      variant="primary"
                      size="small"
                      onPress={() => handleOpenQuote(req)}
                    />
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* TAB 2: ACTIVE REPAIRS */}
        {activeTab === 'active' && (
          <View>
            {activeJobs.length === 0 ? (
              <View style={styles.emptyView}>
                <AppIcon name="construct-outline" size={40} color={theme.colors.labelSecondary} />
                <AppText variant="subheadline" color="secondary" style={{ marginTop: 8 }}>
                  No active repair jobs in progress.
                </AppText>
              </View>
            ) : (
              activeJobs.map((req) => (
                <View
                  key={req.id}
                  style={[
                    styles.ticketCard,
                    {
                      backgroundColor: theme.colors.card,
                      borderColor: theme.colors.separator,
                      borderWidth: theme.hairlineWidth,
                      ...theme.shadows.card,
                    },
                  ]}
                >
                  <View style={styles.ticketTop}>
                    <View style={[styles.urgencyPill, { backgroundColor: theme.colors.fillSecondary }]}>
                      <AppText variant="caption2" weight="700" customColor={theme.colors.tint}>
                        {req.status.replace('_', ' ').toUpperCase()}
                      </AppText>
                    </View>
                    <AppText variant="caption2" color="secondary" mono>
                      Ticket #{req.id.slice(-6)}
                    </AppText>
                  </View>

                  <AppText variant="headline" weight="700" style={{ marginTop: 6 }}>
                    {req.brand} {req.model}
                  </AppText>
                  <AppText variant="footnote" color="secondary" style={{ marginTop: 2 }}>
                    {req.issueType} • Customer: {req.customerName}
                  </AppText>

                  <AppSeparator verticalMargin={10} />

                  <View style={styles.ticketFooter}>
                    <AppText variant="caption1" color="secondary">
                      Step:{' '}
                      {req.status === 'accepted'
                        ? '1/3 Awaiting Schedule'
                        : req.status === 'scheduled'
                        ? '2/3 Scheduled'
                        : '3/3 On Bench'}
                    </AppText>
                    <AppButton
                      title={
                        req.status === 'accepted'
                          ? 'Schedule Handover'
                          : req.status === 'scheduled'
                          ? 'Start Repair'
                          : 'Mark Completed'
                      }
                      size="small"
                      onPress={() => handleAdvanceStatus(req)}
                    />
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* TAB 3: COMPLETED */}
        {activeTab === 'history' && (
          <View>
            {completedJobs.map((req) => (
              <View
                key={req.id}
                style={[
                  styles.ticketCard,
                  {
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.separator,
                    borderWidth: theme.hairlineWidth,
                  },
                ]}
              >
                <View style={styles.ticketTop}>
                  <View style={[styles.urgencyPill, { backgroundColor: theme.colors.fill }]}>
                    <AppText variant="caption2" weight="700" customColor={theme.colors.tint}>
                      CERTIFIED COMPLETE
                    </AppText>
                  </View>
                  <AppText variant="caption2" color="secondary">
                    {new Date(req.updatedAt).toLocaleDateString()}
                  </AppText>
                </View>
                <AppText variant="headline" weight="700" style={{ marginTop: 6 }}>
                  {req.brand} {req.model}
                </AppText>
                <AppText variant="caption1" color="secondary" style={{ marginTop: 2 }}>
                  {req.issueType} • Replaced parts recorded to Device Passport
                </AppText>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Quote Builder Modal */}
      <Modal visible={quoteModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.colors.cardElevated }]}>
            <AppText variant="title3" weight="700">
              Itemized Quote Builder
            </AppText>
            <AppText variant="caption1" color="secondary" style={{ marginTop: 2 }}>
              {selectedRequest?.brand} {selectedRequest?.model} • {selectedRequest?.issueType}
            </AppText>

            <View style={{ marginTop: 14 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <AppTextInput label="Parts ($ CAD)" value={partsCost} onChangeText={setPartsCost} keyboardType="numeric" />
                </View>
                <View style={{ flex: 1 }}>
                  <AppTextInput label="Labor ($ CAD)" value={laborCost} onChangeText={setLaborCost} keyboardType="numeric" />
                </View>
              </View>

              <View style={{ height: 10 }} />

              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <AppTextInput label="Turnaround (Days)" value={turnaroundDays} onChangeText={setTurnaroundDays} keyboardType="numeric" />
                </View>
                <View style={{ flex: 1 }}>
                  <AppTextInput label="Warranty (Days)" value={warrantyDays} onChangeText={setWarrantyDays} keyboardType="numeric" />
                </View>
              </View>

              <View style={{ height: 10 }} />
              <AppTextInput label="Specialist Notes" value={quoteNotes} onChangeText={setQuoteNotes} />

              <View style={styles.totalBox}>
                <AppText variant="subheadline" weight="600" color="secondary">
                  Total Quote to Customer:
                </AppText>
                <AppText variant="title2" weight="700" customColor={theme.colors.tint}>
                  ${(parseFloat(partsCost) || 0) + (parseFloat(laborCost) || 0)} CAD
                </AppText>
              </View>
            </View>

            <View style={styles.modalBtnRow}>
              <AppButton
                title="Cancel"
                variant="secondary"
                onPress={() => setQuoteModalVisible(false)}
                style={{ flex: 1, marginRight: 8 }}
              />
              <AppButton title="Broadcast Quote" onPress={handleSubmitQuote} style={{ flex: 1 }} />
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
  proIcon: {
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
  ticketBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  urgencyPill: {
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
  totalBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(150, 150, 150, 0.2)',
  },
  modalBtnRow: {
    flexDirection: 'row',
    marginTop: 20,
  },
});
