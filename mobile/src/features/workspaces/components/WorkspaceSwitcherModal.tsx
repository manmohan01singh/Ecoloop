import React, { useState } from 'react';
import {
  View,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../../design-system/theme/theme';
import { AppText } from '../../../components/ui/AppText';
import { AppIcon } from '../../../components/ui/AppIcon';
import { AppButton } from '../../../components/ui/AppButton';
import { AppSeparator } from '../../../components/ui/AppSeparator';
import {
  WORKSPACE_DEFINITIONS,
  WorkspaceOption,
  getUserRoles,
  switchActiveWorkspace,
} from '../../../services/auth/permissionsService';
import { WorkspaceKey } from '../../../services/storage/localPersistence';
import { useAuth } from '../../../services/auth/AuthContext';
import { ProviderApplicationModal } from './ProviderApplicationModal';

export interface WorkspaceSwitcherModalProps {
  visible: boolean;
  onClose: () => void;
  onWorkspaceSelected: (key: WorkspaceKey) => void;
}

export const WorkspaceSwitcherModal: React.FC<WorkspaceSwitcherModalProps> = ({
  visible,
  onClose,
  onWorkspaceSelected,
}) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuth();

  const [providerModalVisible, setProviderModalVisible] = useState(false);
  const [providerInitialType, setProviderInitialType] = useState<'repair_pro' | 'recycler' | 'business'>('repair_pro');

  const activeKey: WorkspaceKey = profile?.activeWorkspace || 'consumer';
  const userRoles = getUserRoles(profile);

  const handleSelectWorkspace = (ws: WorkspaceOption) => {
    // Consumer Hub is open to all users and visitors
    if (ws.key === 'consumer') {
      if (profile) {
        switchActiveWorkspace(profile, 'consumer');
      }
      onWorkspaceSelected('consumer');
      onClose();
      return;
    }

    // Specialized operational workspaces require authentication and capability
    const isAuthorized = userRoles.includes(ws.key as any);

    if (isAuthorized && profile) {
      switchActiveWorkspace(profile, ws.key);
      onWorkspaceSelected(ws.key);
      onClose();
    } else if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to access specialized operational workspaces.');
    } else {
      // Prompt application
      if (ws.key === 'repair_pro' || ws.key === 'recycler' || ws.key === 'business') {
        setProviderInitialType(ws.key);
        setProviderModalVisible(true);
      } else {
        Alert.alert(
          'Restricted Workspace',
          `The ${ws.title} workspace is restricted to authorized platform personnel. Contact operations for credential assignment.`
        );
      }
    }
  };

  return (
    <>
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
                Workspace Switcher
              </AppText>
              <AppText variant="caption2" color="secondary">
                One Platform • Multiple Roles
              </AppText>
            </View>
            <View style={{ width: 44 }} />
          </View>

          <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}>
            <View style={styles.introBox}>
              <AppText variant="title3" weight="700">
                Active Operational Workspace
              </AppText>
              <AppText variant="footnote" color="secondary" style={{ marginTop: 2 }}>
                Seamlessly transition between consumer discovery, commercial repair management, and platform compliance.
              </AppText>
            </View>

            <View style={{ marginTop: 14 }}>
              {Object.values(WORKSPACE_DEFINITIONS).map((ws) => {
                const isActive = activeKey === ws.key;
                const isAuthorized = ws.key === 'consumer' || userRoles.includes(ws.key as any);

                return (
                  <TouchableOpacity
                    key={ws.key}
                    activeOpacity={0.8}
                    onPress={() => handleSelectWorkspace(ws)}
                    style={[
                      styles.workspaceCard,
                      {
                        backgroundColor: theme.colors.secondaryBackground,
                        borderColor: isActive ? theme.colors.tint : theme.colors.separator,
                        borderWidth: isActive ? 2 : theme.hairlineWidth,
                        ...theme.shadows.card,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.workspaceIconCircle,
                        {
                          backgroundColor: isActive
                            ? theme.colors.fillSecondary
                            : theme.colors.fill,
                          borderColor: isActive ? theme.colors.tint : 'transparent',
                          borderWidth: isActive ? 1 : 0,
                        },
                      ]}
                    >
                      <AppIcon
                        name={ws.icon as any}
                        size={24}
                        color={isActive ? theme.colors.tint : theme.colors.labelSecondary}
                      />
                    </View>

                    <View style={{ flex: 1, marginLeft: 14 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <AppText variant="headline" weight="700" color={isActive ? 'tint' : 'primary'}>
                          {ws.title}
                        </AppText>
                        {ws.badge && (
                          <View
                            style={[
                              styles.roleBadge,
                              {
                                backgroundColor: isAuthorized ? theme.colors.fillSecondary : theme.colors.fill,
                              },
                            ]}
                          >
                            <AppText
                              variant="caption2"
                              weight="700"
                              color={isAuthorized ? 'primary' : 'secondary'}
                            >
                              {ws.badge}
                            </AppText>
                          </View>
                        )}
                      </View>

                      <AppText variant="caption1" color="secondary" style={{ marginTop: 2 }}>
                        {ws.subtitle}
                      </AppText>
                    </View>

                    {isActive ? (
                      <View style={[styles.activePill, { backgroundColor: theme.colors.tint }]}>
                        <AppText variant="caption2" weight="700" customColor={theme.isDark ? '#000000' : '#ffffff'}>
                          ACTIVE
                        </AppText>
                      </View>
                    ) : !isAuthorized ? (
                      <View style={styles.lockPill}>
                        <AppIcon name="lock-closed" size={14} color={theme.colors.labelTertiary} />
                        <AppText variant="caption2" color="secondary" style={{ marginLeft: 3 }}>
                          Apply
                        </AppText>
                      </View>
                    ) : (
                      <AppIcon name="chevron-forward" size={18} color={theme.colors.labelTertiary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <AppSeparator verticalMargin={20} />

            {/* Become a Provider CTA */}
            <View
              style={[
                styles.partnerCard,
                {
                  backgroundColor: theme.colors.secondaryBackground,
                  borderColor: theme.colors.separator,
                  borderWidth: theme.hairlineWidth,
                },
              ]}
            >
              <AppIcon name="shield-checkmark" size={28} color={theme.colors.tint} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <AppText variant="subheadline" weight="700">
                  Are you a repair shop or recycler?
                </AppText>
                <AppText variant="caption2" color="secondary" style={{ marginTop: 2 }}>
                  Submit business credentials to unlock client queues, quotation tools, and bulk inventory exchange.
                </AppText>
              </View>
              <TouchableOpacity
                onPress={() => setProviderModalVisible(true)}
                style={[styles.applyBtn, { backgroundColor: theme.colors.tint }]}
              >
                <AppText variant="caption1" weight="700" customColor={theme.isDark ? '#000000' : '#FFFFFF'}>
                  Apply Now
                </AppText>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <ProviderApplicationModal
        visible={providerModalVisible}
        onClose={() => setProviderModalVisible(false)}
        initialType={providerInitialType}
      />
    </>
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
  introBox: {
    marginBottom: 6,
  },
  workspaceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
  },
  workspaceIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  activePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  lockPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  partnerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
  },
  applyBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
});
