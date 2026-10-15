import React, { useState } from 'react';
import {
  View,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../../design-system/theme/theme';
import { AppText } from '../../../components/ui/AppText';
import { AppIcon } from '../../../components/ui/AppIcon';
import { AppButton } from '../../../components/ui/AppButton';
import { AppSeparator } from '../../../components/ui/AppSeparator';
import { saveActivityEvent } from '../../../services/storage/localPersistence';
import { useAuth } from '../../../services/auth/AuthContext';

export interface SafeHandoverModalProps {
  visible: boolean;
  onClose: () => void;
  deviceTitle?: string;
}

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  actionHint: string;
  riskIfSkipped: string;
}

const HANDOVER_STEPS: ChecklistItem[] = [
  {
    id: 'backup',
    title: '1. Complete Full Cloud / Local Backup',
    description: 'Archive all photos, contacts, credentials, and app data to iCloud, Google Drive, or an encrypted local drive.',
    actionHint: 'Settings > [Your Name] > iCloud Backup > Back Up Now',
    riskIfSkipped: 'Permanent loss of personal files and media.',
  },
  {
    id: 'cloud_unlink',
    title: '2. Sign Out of Cloud Accounts & Disable Find My',
    description: 'Deactivate Activation Lock (iCloud / Google FRP). If lock is enabled, recipient cannot use the device.',
    actionHint: 'Settings > Apple ID > Sign Out (turn off Find My Device)',
    riskIfSkipped: 'Device becomes an unusable paperweight / refund dispute.',
  },
  {
    id: 'factory_wipe',
    title: '3. Cryptographic Factory Data Reset',
    description: 'Erase all device content and settings. On modern iOS/Android, this destroys the cryptographic key enclave.',
    actionHint: 'Settings > General > Transfer or Reset > Erase All Content',
    riskIfSkipped: 'Private banking and personal accounts exposed.',
  },
  {
    id: 'sim_removal',
    title: '4. Remove Physical SIM & MicroSD Cards',
    description: 'Eject the SIM tray using a pin. Remove external memory cards to protect your mobile carrier identity.',
    actionHint: 'Use SIM eject tool on side tray of the chassis',
    riskIfSkipped: 'Unauthorized cellular carrier usage and identity theft.',
  },
  {
    id: 'battery_check',
    title: '5. Battery Expansion & Safety Inspection',
    description: 'Inspect display and rear glass for bulging or separation caused by swollen battery cells.',
    actionHint: 'Check if screen or rear panel is lifting or curved',
    riskIfSkipped: 'Fire / thermal hazard during transit.',
  },
  {
    id: 'receipt',
    title: '6. Obtain Signed Handover or Drop-Off Receipt',
    description: 'Always request an official tracking number, bill of lading, or digital drop-off receipt from the carrier or shop.',
    actionHint: 'Save tracking confirmation number in Circuvio',
    riskIfSkipped: 'Inability to prove custody transfer if lost in transit.',
  },
];

export const SafeHandoverModal: React.FC<SafeHandoverModalProps> = ({
  visible,
  onClose,
  deviceTitle = 'Electronic Device',
}) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({});
  const [completed, setCompleted] = useState(false);

  const toggleStep = (id: string) => {
    setCheckedSteps((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const completedCount = Object.values(checkedSteps).filter(Boolean).length;
  const progressPct = Math.round((completedCount / HANDOVER_STEPS.length) * 100);

  const handleFinish = () => {
    if (user?.id) {
      saveActivityEvent({
        id: `act-handover-${Date.now()}`,
        recipientId: user.id,
        eventType: 'system_notice',
        entityType: 'device_listing',
        title: 'Safe Handover Completed 🛡️',
        description: `You verified all 6 safety checklist steps for ${deviceTitle}. Device is securely prepped for transfer.`,
        metadata: { deviceTitle, progress: progressPct },
        readAt: null,
        createdAt: new Date().toISOString(),
      });
    }
    setCompleted(true);
    setTimeout(() => {
      setCompleted(false);
      onClose();
    }, 1200);
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
              Safe Handover Checklist
            </AppText>
            <AppText variant="caption2" color="secondary">
              Data Privacy & Hardware Protection
            </AppText>
          </View>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}>
          {/* Progress Card */}
          <View
            style={[
              styles.progressCard,
              {
                backgroundColor: theme.colors.secondaryBackground,
                borderColor: theme.colors.separator,
                borderWidth: theme.hairlineWidth,
                ...theme.shadows.card,
              },
            ]}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <AppText variant="subheadline" weight="700">
                Preparation Progress
              </AppText>
              <AppText variant="headline" weight="700" customColor={theme.colors.tint}>
                {completedCount} / {HANDOVER_STEPS.length}
              </AppText>
            </View>

            {/* Progress Bar Track */}
            <View style={[styles.progressTrack, { backgroundColor: theme.colors.fill }]}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${progressPct}%`,
                    backgroundColor: theme.colors.tint,
                  },
                ]}
              />
            </View>

            <AppText variant="caption1" color="secondary" style={{ marginTop: 8 }}>
              {progressPct === 100
                ? 'Device is 100% sanitized and ready for handover.'
                : 'Follow each protocol below before handing your device to a buyer, repair shop, or recycler.'}
            </AppText>
          </View>

          {/* Checklist Items */}
          <View style={{ marginTop: 20 }}>
            {HANDOVER_STEPS.map((step) => {
              const isChecked = !!checkedSteps[step.id];

              return (
                <TouchableOpacity
                  key={step.id}
                  activeOpacity={0.8}
                  onPress={() => toggleStep(step.id)}
                  style={[
                    styles.itemCard,
                    {
                      backgroundColor: theme.colors.secondaryBackground,
                      borderColor: isChecked ? theme.colors.tint : theme.colors.separator,
                      borderWidth: isChecked ? 1.5 : theme.hairlineWidth,
                      ...theme.shadows.card,
                    },
                  ]}
                >
                  <View style={styles.itemTopRow}>
                    <View
                      style={[
                        styles.checkbox,
                        {
                          backgroundColor: isChecked ? theme.colors.tint : 'transparent',
                          borderColor: isChecked ? theme.colors.tint : theme.colors.labelSecondary,
                        },
                      ]}
                    >
                      {isChecked && <AppIcon name="checkmark" size={14} color={theme.isDark ? '#000000' : '#FFFFFF'} />}
                    </View>

                    <AppText
                      variant="subheadline"
                      weight="700"
                      style={[styles.itemTitle, isChecked && { textDecorationLine: 'line-through', opacity: 0.7 }]}
                    >
                      {step.title}
                    </AppText>
                  </View>

                  <AppText variant="footnote" color="secondary" style={styles.itemDesc}>
                    {step.description}
                  </AppText>

                  <View
                    style={[
                      styles.hintBox,
                      {
                        backgroundColor: theme.colors.fill,
                      },
                    ]}
                  >
                    <AppIcon name="information-circle-outline" size={14} color={theme.colors.tint} />
                    <AppText variant="caption2" color="secondary" style={{ marginLeft: 6, flex: 1 }}>
                      {step.actionHint}
                    </AppText>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <AppButton
            title={completed ? 'Safety Verified! ✅' : progressPct === 100 ? 'Confirm Handover Complete' : 'Confirm Checked Steps'}
            variant={progressPct === 100 ? 'primary' : 'secondary'}
            onPress={handleFinish}
            style={{ marginTop: 24 }}
          />
        </ScrollView>
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
  headerTitleContainer: {
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  progressCard: {
    padding: 16,
    borderRadius: 16,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  itemCard: {
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
  },
  itemTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  itemTitle: {
    flex: 1,
  },
  itemDesc: {
    marginTop: 6,
    marginLeft: 32,
  },
  hintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
    marginLeft: 32,
  },
});
