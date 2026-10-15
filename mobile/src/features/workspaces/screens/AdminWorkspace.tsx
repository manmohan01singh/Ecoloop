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
  getProviderApplications,
  reviewProviderApplication,
  getPlatformOperationalMetrics,
  getPlatformAuditLogs,
  PlatformOperationalMetrics,
} from '../../../services/database/workspaceRepositories';
import {
  ProviderApplication,
  AuditLogRecord,
  subscribeToDataChanges,
} from '../../../services/storage/localPersistence';
import { useAuth } from '../../../services/auth/AuthContext';
import { canAdminister } from '../../../services/auth/permissionsService';

export interface AdminWorkspaceProps {
  onReturnToConsumer: () => void;
  onOpenWorkspaceSwitcher: () => void;
}

export const AdminWorkspace: React.FC<AdminWorkspaceProps> = ({
  onReturnToConsumer,
  onOpenWorkspaceSwitcher,
}) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();

  const [activeTab, setActiveTab] = useState<'kpis' | 'applications' | 'audit'>('kpis');
  const [metrics, setMetrics] = useState<PlatformOperationalMetrics>(() => getPlatformOperationalMetrics());
  const [applications, setApplications] = useState<ProviderApplication[]>(() => getProviderApplications());
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>(() => getPlatformAuditLogs());

  // Review Application Modal
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedApp, setSelectedApp] = useState<ProviderApplication | null>(null);
  const [reviewNotes, setReviewNotes] = useState('Credentials verified with regional trade registry.');

  useEffect(() => {
    const unsub = subscribeToDataChanges((type) => {
      if (type === 'admin' || type === 'repairs' || type === 'recycling' || type === 'listings') {
        setMetrics(getPlatformOperationalMetrics());
        setApplications(getProviderApplications());
        setAuditLogs(getPlatformAuditLogs());
      }
    });
    return unsub;
  }, []);

  if (!canAdminister(profile)) {
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
        <AppIcon name="lock-closed" size={54} color={theme.colors.tint} />
        <AppText variant="title2" weight="700" style={{ marginTop: 16 }}>
          Administrative Access Restricted
        </AppText>
        <AppText
          variant="subheadline"
          color="secondary"
          style={{ textAlign: 'center', marginTop: 8, marginBottom: 24 }}
        >
          This workspace requires platform administrator credentials verified by operations.
        </AppText>
        <AppButton label="Return to Consumer Hub" variant="filled" onPress={onReturnToConsumer} />
      </SafeAreaView>
    );
  }

  const pendingApps = applications.filter((a) => a.status === 'submitted' || a.status === 'under_review');

  const handleOpenReview = (app: ProviderApplication) => {
    setSelectedApp(app);
    setReviewNotes('Credentials and registration checked against official registrar.');
    setReviewModalVisible(true);
  };

  const handleReviewDecision = (decision: 'approved' | 'rejected') => {
    if (!selectedApp || !profile) return;

    const res = reviewProviderApplication(profile, selectedApp.id, decision, reviewNotes);
    if (res.success) {
      setReviewModalVisible(false);
      Alert.alert(
        `Application ${decision === 'approved' ? 'Approved' : 'Rejected'}`,
        decision === 'approved'
          ? `Partner "${selectedApp.businessName}" is now authorized. Dedicated workspace access granted.`
          : 'Application rejected and applicant notified.'
      );
    } else {
      Alert.alert('Error', res.error || 'Failed to review application.');
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
          <View style={[styles.adminIcon, { backgroundColor: theme.colors.fillSecondary }]}>
            <AppIcon name="settings" size={16} color={theme.colors.tint} />
          </View>
          <View style={{ marginLeft: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <AppText variant="caption1" weight="700">
                Platform Operations
              </AppText>
              <AppIcon name="chevron-down" size={14} color={theme.colors.labelSecondary} style={{ marginLeft: 4 }} />
            </View>
            <AppText variant="caption2" color="secondary">
              Admin Console • Root Control
            </AppText>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={onReturnToConsumer} style={[styles.exitBtn, { backgroundColor: theme.colors.fill }]}>
          <AppText variant="caption1" weight="600" customColor={theme.colors.tint}>
            Consumer Hub
          </AppText>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        {[
          { key: 'kpis', label: 'Ecosystem KPIs' },
          { key: 'applications', label: `Applications (${pendingApps.length})` },
          { key: 'audit', label: `Audit Log (${auditLogs.length})` },
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
        {/* TAB 1: PLATFORM KPIS */}
        {activeTab === 'kpis' && (
          <View>
            <AppText variant="title3" weight="700">
              Live Circular Telemetry
            </AppText>
            <AppText variant="footnote" color="secondary" style={{ marginTop: 2 }}>
              Aggregated real-time metrics across all verified repairers, recyclers, and consumer listings.
            </AppText>

            <View style={styles.kpiGrid}>
              <View
                style={[
                  styles.kpiCard,
                  {
                    backgroundColor: theme.colors.secondaryBackground,
                    borderColor: theme.colors.separator,
                    borderWidth: theme.hairlineWidth,
                  },
                ]}
              >
                <AppText variant="title1" weight="700" customColor={theme.colors.tint}>
                  {metrics.totalCo2PreventedKg.toLocaleString()} kg
                </AppText>
                <AppText variant="subheadline" weight="600" color="primary" style={{ marginTop: 2 }}>
                  CO₂ Diverted
                </AppText>
                <AppText variant="caption2" color="secondary" style={{ marginTop: 2 }}>
                  Scientific embodied emissions baseline
                </AppText>
              </View>

              <View
                style={[
                  styles.kpiCard,
                  {
                    backgroundColor: theme.colors.secondaryBackground,
                    borderColor: theme.colors.separator,
                    borderWidth: theme.hairlineWidth,
                  },
                ]}
              >
                <AppText variant="title1" weight="700" color="primary">
                  {metrics.totalCircularDevices}
                </AppText>
                <AppText variant="subheadline" weight="600" color="primary" style={{ marginTop: 2 }}>
                  Devices In Loop
                </AppText>
                <AppText variant="caption2" color="secondary" style={{ marginTop: 2 }}>
                  Active listings, repairs & certified e-waste
                </AppText>
              </View>

              <View
                style={[
                  styles.kpiCard,
                  {
                    backgroundColor: theme.colors.secondaryBackground,
                    borderColor: theme.colors.separator,
                    borderWidth: theme.hairlineWidth,
                  },
                ]}
              >
                <AppText variant="title1" weight="700" color="primary">
                  {metrics.totalRecycledWeightKg} kg
                </AppText>
                <AppText variant="subheadline" weight="600" color="primary" style={{ marginTop: 2 }}>
                  E-Waste Weighed
                </AppText>
                <AppText variant="caption2" color="secondary" style={{ marginTop: 2 }}>
                  Certified industrial scale weight
                </AppText>
              </View>

              <View
                style={[
                  styles.kpiCard,
                  {
                    backgroundColor: theme.colors.secondaryBackground,
                    borderColor: theme.colors.separator,
                    borderWidth: theme.hairlineWidth,
                  },
                ]}
              >
                <AppText variant="title1" weight="700" color="primary">
                  {metrics.verifiedProvidersCount}
                </AppText>
                <AppText variant="subheadline" weight="600" color="primary" style={{ marginTop: 2 }}>
                  Verified Partners
                </AppText>
                <AppText variant="caption2" color="secondary" style={{ marginTop: 2 }}>
                  Repair shops, recyclers & businesses
                </AppText>
              </View>
            </View>
          </View>
        )}

        {/* TAB 2: APPLICATIONS REVIEW */}
        {activeTab === 'applications' && (
          <View>
            <AppText variant="title3" weight="700">
              Provider Application Queue
            </AppText>
            <AppText variant="footnote" color="secondary" style={{ marginTop: 2 }}>
              Inspect commercial credentials before granting elevated workspace access.
            </AppText>

            <View style={{ marginTop: 12 }}>
              {applications.length === 0 ? (
                <View style={styles.emptyView}>
                  <AppText variant="subheadline" color="secondary">
                    No partner applications found.
                  </AppText>
                </View>
              ) : (
                applications.map((app) => (
                  <View
                    key={app.id}
                    style={[
                      styles.appCard,
                      {
                        backgroundColor: theme.colors.secondaryBackground,
                        borderColor: theme.colors.separator,
                        borderWidth: theme.hairlineWidth,
                        ...theme.shadows.card,
                      },
                    ]}
                  >
                    <View style={styles.appCardTop}>
                      <View style={[styles.typePill, { backgroundColor: theme.colors.fill }]}>
                        <AppText variant="caption2" weight="700" customColor={theme.colors.tint}>
                          {app.applicationType.replace('_', ' ').toUpperCase()}
                        </AppText>
                      </View>
                      <View
                        style={[
                          styles.statusPill,
                          {
                            backgroundColor: theme.colors.fillSecondary,
                            borderColor: theme.colors.separator,
                            borderWidth: theme.hairlineWidth,
                          },
                        ]}
                      >
                        <AppText
                          variant="caption2"
                          weight="700"
                          color={app.status === 'approved' ? 'primary' : 'secondary'}
                        >
                          {app.status.toUpperCase()}
                        </AppText>
                      </View>
                    </View>

                    <AppText variant="headline" weight="700" style={{ marginTop: 6 }}>
                      {app.businessName}
                    </AppText>
                    <AppText variant="footnote" color="secondary" style={{ marginTop: 2 }}>
                      Registration: {app.registrationNumber} • Region: {app.serviceArea}
                    </AppText>
                    <AppText variant="caption1" color="secondary" style={{ marginTop: 4 }}>
                      Supported: {app.categories.join(', ')}
                    </AppText>

                    {app.reviewerNotes && (
                      <AppText variant="caption2" color="secondary" style={{ fontStyle: 'italic', marginTop: 4 }}>
                        Reviewer Note: "{app.reviewerNotes}"
                      </AppText>
                    )}

                    {app.status === 'submitted' || app.status === 'under_review' ? (
                      <>
                        <AppSeparator verticalMargin={10} />
                        <View style={styles.appFooter}>
                          <AppText variant="caption2" color="secondary">
                            Submitted: {new Date(app.submittedAt).toLocaleDateString()}
                          </AppText>
                          <AppButton title="Review & Decide" size="small" onPress={() => handleOpenReview(app)} />
                        </View>
                      </>
                    ) : null}
                  </View>
                ))
              )}
            </View>
          </View>
        )}

        {/* TAB 3: AUDIT TRAIL */}
        {activeTab === 'audit' && (
          <View>
            <AppText variant="title3" weight="700">
              Platform Security Audit Trail
            </AppText>
            <AppText variant="footnote" color="secondary" style={{ marginTop: 2 }}>
              Immutable operational records of all administrative decisions and role assignments.
            </AppText>

            <View style={{ marginTop: 12 }}>
              {auditLogs.map((log) => (
                <View
                  key={log.id}
                  style={[
                    styles.logCard,
                    {
                      backgroundColor: theme.colors.secondaryBackground,
                      borderColor: theme.colors.separator,
                      borderWidth: theme.hairlineWidth,
                    },
                  ]}
                >
                  <View style={styles.logTop}>
                    <View style={[styles.typePill, { backgroundColor: theme.colors.fill }]}>
                      <AppText variant="caption2" weight="700" customColor={theme.colors.tint}>
                        {log.action}
                      </AppText>
                    </View>
                    <AppText variant="caption2" color="secondary">
                      {new Date(log.createdAt).toLocaleString()}
                    </AppText>
                  </View>

                  <AppText variant="footnote" weight="600" style={{ marginTop: 6 }}>
                    Actor: {log.actorName} ({log.actorRole.toUpperCase()})
                  </AppText>
                  <AppText variant="caption1" color="secondary" mono style={{ marginTop: 2 }}>
                    Entity: {log.entityType} #{log.entityId.slice(-6)}
                  </AppText>
                  <AppText variant="caption2" color="secondary" style={{ marginTop: 4, fontFamily: 'monospace' }}>
                    {JSON.stringify(log.details)}
                  </AppText>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Review Modal */}
      <Modal visible={reviewModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.colors.cardElevated }]}>
            <AppText variant="title3" weight="700">
              Verify Partner Application
            </AppText>
            <AppText variant="caption1" color="secondary" style={{ marginTop: 2 }}>
              {selectedApp?.businessName} • {selectedApp?.applicationType}
            </AppText>

            <View style={{ marginTop: 14 }}>
              <AppTextInput
                label="Reviewer Verification Notes"
                value={reviewNotes}
                onChangeText={setReviewNotes}
                placeholder="Details of license verification..."
              />
            </View>

            <View style={styles.modalBtnRow}>
              <AppButton
                title="Reject"
                variant="destructive"
                onPress={() => handleReviewDecision('rejected')}
                style={{ flex: 1, marginRight: 8 }}
              />
              <AppButton title="Approve & Grant" onPress={() => handleReviewDecision('approved')} style={{ flex: 1.5 }} />
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
  adminIcon: {
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
  kpiGrid: {
    gap: 12,
    marginTop: 14,
  },
  kpiCard: {
    padding: 16,
    borderRadius: 16,
  },
  emptyView: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  appCard: {
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
  },
  appCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  appFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logCard: {
    padding: 12,
    borderRadius: 14,
    marginBottom: 10,
  },
  logTop: {
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
  modalBtnRow: {
    flexDirection: 'row',
    marginTop: 20,
  },
});
