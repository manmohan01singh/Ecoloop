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
  getModerationReports,
  takeModerationAction,
} from '../../../services/database/workspaceRepositories';
import {
  ModerationReport,
  getStoredModerationActions,
  ModerationAction,
  subscribeToDataChanges,
} from '../../../services/storage/localPersistence';
import { useAuth } from '../../../services/auth/AuthContext';
import { canModerate } from '../../../services/auth/permissionsService';

export interface ModeratorWorkspaceProps {
  onReturnToConsumer: () => void;
  onOpenWorkspaceSwitcher: () => void;
}

export const ModeratorWorkspace: React.FC<ModeratorWorkspaceProps> = ({
  onReturnToConsumer,
  onOpenWorkspaceSwitcher,
}) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();

  const [activeTab, setActiveTab] = useState<'queue' | 'actions'>('queue');
  const [reports, setReports] = useState<ModerationReport[]>(() => getModerationReports());
  const [actions, setActions] = useState<ModerationAction[]>(() => getStoredModerationActions());

  // Action Modal State
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ModerationReport | null>(null);
  const [selectedAction, setSelectedAction] = useState<ModerationAction['actionTaken']>('content_hidden');
  const [justification, setJustification] = useState('Safety violation - prohibited hazardous battery handling');

  useEffect(() => {
    const unsub = subscribeToDataChanges((type) => {
      if (type === 'moderation') {
        setReports(getModerationReports());
        setActions(getStoredModerationActions());
      }
    });
    return unsub;
  }, []);

  if (!canModerate(profile)) {
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
        <AppIcon name="shield-outline" size={54} color={theme.colors.tint} />
        <AppText variant="title2" weight="700" style={{ marginTop: 16 }}>
          Moderation Access Restricted
        </AppText>
        <AppText
          variant="subheadline"
          color="secondary"
          style={{ textAlign: 'center', marginTop: 8, marginBottom: 24 }}
        >
          This workspace requires community trust & safety moderation credentials.
        </AppText>
        <AppButton label="Return to Consumer Hub" variant="filled" onPress={onReturnToConsumer} />
      </SafeAreaView>
    );
  }

  const pendingReports = reports.filter((r) => r.status === 'new' || r.status === 'under_review');

  const handleOpenAction = (rep: ModerationReport) => {
    setSelectedReport(rep);
    if (rep.category === 'hazardous_item') {
      setSelectedAction('content_hidden');
      setJustification('Hazardous battery containment violation without certified carrier safety protocols.');
    } else if (rep.category === 'fraud') {
      setSelectedAction('content_removed');
      setJustification('Severe price anomaly and suspected off-platform payment solicitation.');
    } else {
      setSelectedAction('warning_issued');
      setJustification('Listing policy violation.');
    }
    setActionModalVisible(true);
  };

  const handleExecuteAction = () => {
    if (!selectedReport || !profile) return;
    if (!justification.trim()) {
      Alert.alert('Justification Required', 'A justification must be provided for audit compliance.');
      return;
    }

    const res = takeModerationAction(profile, {
      reportId: selectedReport.id,
      targetType: selectedReport.targetType,
      targetId: selectedReport.targetId,
      actionTaken: selectedAction,
      justification: justification.trim(),
    });

    if (res.success) {
      setActionModalVisible(false);
      Alert.alert(
        'Action Recorded',
        `Action "${selectedAction.replace('_', ' ').toUpperCase()}" applied. Audit trail recorded and item status updated.`
      );
    } else {
      Alert.alert('Error', res.error || 'Failed to record moderation action.');
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
          <View style={[styles.modIcon, { backgroundColor: theme.colors.fillSecondary }]}>
            <AppIcon name="shield-checkmark" size={16} color={theme.colors.tint} />
          </View>
          <View style={{ marginLeft: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <AppText variant="caption1" weight="700">
                Trust & Moderation
              </AppText>
              <AppIcon name="chevron-down" size={14} color={theme.colors.labelSecondary} style={{ marginLeft: 4 }} />
            </View>
            <AppText variant="caption2" color="secondary">
              Staff Portal • Safety Compliance
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
          <AppText variant="headline" weight="700" color="primary">
            {pendingReports.length}
          </AppText>
          <AppText variant="caption2" color="secondary">
            Pending Reports
          </AppText>
        </View>
        <View style={[styles.metricDivider, { backgroundColor: theme.colors.separator }]} />
        <View style={styles.metricCol}>
          <AppText variant="headline" weight="700" color="primary">
            {actions.length}
          </AppText>
          <AppText variant="caption2" color="secondary">
            Enforced Actions
          </AppText>
        </View>
        <View style={[styles.metricDivider, { backgroundColor: theme.colors.separator }]} />
        <View style={styles.metricCol}>
          <AppText variant="headline" weight="700" customColor={theme.colors.tint}>
            99.8%
          </AppText>
          <AppText variant="caption2" color="secondary">
            Safe Ecosystem SLA
          </AppText>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        {[
          { key: 'queue', label: `Flagged Queue (${pendingReports.length})` },
          { key: 'actions', label: `Action Log (${actions.length})` },
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
        {/* TAB 1: PENDING QUEUE */}
        {activeTab === 'queue' && (
          <View>
            {pendingReports.length === 0 ? (
              <View style={styles.emptyView}>
                <AppIcon name="shield-checkmark-outline" size={40} color={theme.colors.labelSecondary} />
                <AppText variant="subheadline" color="secondary" style={{ marginTop: 8 }}>
                  Triage queue clean. No reported items pending review.
                </AppText>
              </View>
            ) : (
              pendingReports.map((rep) => (
                <View
                  key={rep.id}
                  style={[
                    styles.reportCard,
                    {
                      backgroundColor: theme.colors.secondaryBackground,
                      borderColor: theme.colors.separator,
                      borderWidth: theme.hairlineWidth,
                      ...theme.shadows.card,
                    },
                  ]}
                >
                  <View style={styles.reportTop}>
                    <View
                      style={[
                        styles.catBadge,
                        {
                          backgroundColor: theme.colors.fill,
                        },
                      ]}
                    >
                      <AppText
                        variant="caption2"
                        weight="700"
                        color="primary"
                      >
                        {rep.category.replace('_', ' ').toUpperCase()}
                      </AppText>
                    </View>
                    <AppText variant="caption2" color="secondary">
                      {new Date(rep.createdAt).toLocaleDateString()}
                    </AppText>
                  </View>

                  <AppText variant="headline" weight="700" style={{ marginTop: 6 }}>
                    {rep.targetTitle}
                  </AppText>
                  <AppText variant="footnote" color="secondary" mono style={{ marginTop: 2 }}>
                    Reported by: {rep.reporterName} • Target: {rep.targetType} #{rep.targetId.slice(-6)}
                  </AppText>
                  <AppText variant="footnote" color="primary" style={{ marginTop: 4, fontStyle: 'italic' }}>
                    "{rep.description}"
                  </AppText>

                  <AppSeparator verticalMargin={10} />

                  <View style={styles.reportFooter}>
                    <AppText variant="caption1" color="secondary">
                      Status: {rep.status.toUpperCase()}
                    </AppText>
                    <AppButton title="Take Action" size="small" variant="secondary" onPress={() => handleOpenAction(rep)} />
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* TAB 2: AUDIT ACTION LOG */}
        {activeTab === 'actions' && (
          <View>
            {actions.map((act) => (
              <View
                key={act.id}
                style={[
                  styles.reportCard,
                  {
                    backgroundColor: theme.colors.secondaryBackground,
                    borderColor: theme.colors.separator,
                    borderWidth: theme.hairlineWidth,
                  },
                ]}
              >
                <View style={styles.reportTop}>
                  <View style={[styles.catBadge, { backgroundColor: theme.colors.fill }]}>
                    <AppText variant="caption2" weight="700" color="primary">
                      {act.actionTaken.replace('_', ' ').toUpperCase()}
                    </AppText>
                  </View>
                  <AppText variant="caption2" color="secondary">
                    {new Date(act.createdAt).toLocaleDateString()}
                  </AppText>
                </View>

                <AppText variant="footnote" weight="600" mono style={{ marginTop: 6 }}>
                  Target: {act.targetType} #{act.targetId.slice(-6)}
                </AppText>
                <AppText variant="caption1" color="secondary" style={{ marginTop: 2 }}>
                  Justification: "{act.justification}"
                </AppText>
                <AppText variant="caption2" color="secondary" style={{ marginTop: 4 }}>
                  Enforced by: {act.moderatorName}
                </AppText>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Action Enforcement Modal */}
      <Modal visible={actionModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.colors.cardElevated }]}>
            <AppText variant="title3" weight="700">
              Enforce Moderation Action
            </AppText>
            <AppText variant="caption1" color="secondary" style={{ marginTop: 2 }}>
              Target: {selectedReport?.targetTitle}
            </AppText>

            <View style={{ marginTop: 14 }}>
              <AppText variant="caption1" weight="600" color="secondary" style={{ marginBottom: 6 }}>
                Enforcement Type
              </AppText>
              <View style={styles.actionGrid}>
                {[
                  { id: 'warning_issued', label: 'Issue Warning' },
                  { id: 'content_hidden', label: 'Hide Content' },
                  { id: 'content_removed', label: 'Archive/Remove' },
                  { id: 'escalated_to_admin', label: 'Escalate to Admin' },
                  { id: 'dismissed', label: 'Dismiss Report' },
                ].map((a) => (
                  <TouchableOpacity
                    key={a.id}
                    onPress={() => setSelectedAction(a.id as any)}
                    style={[
                      styles.actionChoice,
                      {
                        backgroundColor: selectedAction === a.id ? theme.colors.fill : theme.colors.background,
                        borderColor: selectedAction === a.id ? theme.colors.tint : theme.colors.separator,
                        borderWidth: selectedAction === a.id ? 1.5 : theme.hairlineWidth,
                      },
                    ]}
                  >
                    <AppText variant="caption2" weight={selectedAction === a.id ? '700' : '500'}>
                      {a.label}
                    </AppText>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={{ height: 12 }} />
              <AppTextInput
                label="Compliance Audit Justification (Mandatory)"
                value={justification}
                onChangeText={setJustification}
                placeholder="Reason for action..."
              />
            </View>

            <View style={styles.modalBtnRow}>
              <AppButton
                title="Cancel"
                variant="secondary"
                onPress={() => setActionModalVisible(false)}
                style={{ flex: 1, marginRight: 8 }}
              />
              <AppButton title="Enforce Action" onPress={handleExecuteAction} style={{ flex: 1 }} />
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
  modIcon: {
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
  reportCard: {
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
  },
  reportTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  catBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  reportFooter: {
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
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  actionChoice: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  modalBtnRow: {
    flexDirection: 'row',
    marginTop: 20,
  },
});
