import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme, ThemeMode } from '../../../design-system/theme/theme';
import { AppText } from '../../../components/ui/AppText';
import { AppIcon, IconName } from '../../../components/ui/AppIcon';
import { AppButton } from '../../../components/ui/AppButton';
import { AppSeparator } from '../../../components/ui/AppSeparator';
import { useAuth } from '../../../services/auth/AuthContext';
import { AuthModal } from '../../auth/components/AuthModal';
import { getUserDeviceListings } from '../../../services/database/listingRepository';
import { subscribeToDataChanges, DeviceListingRecord, WorkspaceKey } from '../../../services/storage/localPersistence';
import { WorkspaceSwitcherModal } from '../../workspaces/components/WorkspaceSwitcherModal';
import { ProviderApplicationModal } from '../../workspaces/components/ProviderApplicationModal';
import { DevicePassportModal } from '../../passport/screens/DevicePassportModal';
import { SafeHandoverModal } from '../../passport/screens/SafeHandoverModal';

export interface ProfileScreenProps {
  onReturnHome?: () => void;
  onOpenPostSheet?: () => void;
  onOpenWorkspaceSwitcher?: () => void;
  onWorkspaceSelected?: (ws: WorkspaceKey) => void;
}

interface AppearanceOption {
  id: ThemeMode;
  title: string;
  subtitle: string;
  icon: IconName;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onReturnHome,
  onOpenPostSheet,
  onOpenWorkspaceSwitcher,
  onWorkspaceSelected,
}) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { user, profile, isAuthenticated, signOut } = useAuth();

  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'signin' | 'signup'>('signin');
  const [workspaceModalVisible, setWorkspaceModalVisible] = useState(false);
  const [providerModalVisible, setProviderModalVisible] = useState(false);
  const [passportModalVisible, setPassportModalVisible] = useState(false);
  const [handoverModalVisible, setHandoverModalVisible] = useState(false);

  const [userListings, setUserListings] = useState<DeviceListingRecord[]>(() =>
    user?.id ? getUserDeviceListings(user.id) : []
  );

  useEffect(() => {
    const syncListings = () => {
      if (user?.id) {
        setUserListings(getUserDeviceListings(user.id));
      } else {
        setUserListings([]);
      }
    };

    syncListings();
    const unsubscribe = subscribeToDataChanges((type) => {
      if (type === 'listings' || type === 'auth') {
        syncListings();
      }
    });
    return unsubscribe;
  }, [user?.id]);

  const handleOpenAuth = (mode: 'signin' | 'signup') => {
    setAuthInitialMode(mode);
    setAuthModalVisible(true);
  };

  const handleSignOutConfirm = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of Circuvio?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  const appearanceOptions: AppearanceOption[] = [
    {
      id: 'system',
      title: 'System',
      subtitle: `Follow device settings (currently ${theme.resolvedScheme === 'dark' ? 'Dark' : 'Light'})`,
      icon: 'phone-portrait-outline',
    },
    {
      id: 'light',
      title: 'Light',
      subtitle: 'Refined editorial bright mode with high-contrast surfaces',
      icon: 'sunny-outline',
    },
    {
      id: 'dark',
      title: 'Dark',
      subtitle: 'True OLED black with calibrated emerald accents',
      icon: 'moon-outline',
    },
  ];

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
          {
            paddingBottom: insets.bottom + 90,
          },
        ]}
      >
        {/* Header */}
        <View style={styles.headerArea}>
          <AppText variant="largeTitle" weight="700">
            Profile & Settings
          </AppText>
          <AppText variant="subheadline" color="secondary" style={styles.headerSubtitle}>
            Appearance preferences, credentials & circular activity
          </AppText>
        </View>

        {/* Member / Identity Card */}
        <View
          style={[
            styles.memberCard,
            {
              backgroundColor: theme.colors.secondaryBackground,
              borderColor: theme.colors.separator,
              borderWidth: theme.hairlineWidth,
              borderRadius: theme.radii.xl,
              ...theme.shadows.card,
            },
          ]}
        >
          <View style={styles.memberTopRow}>
            <View
              style={[
                styles.avatarCircle,
                {
                  backgroundColor: theme.isDark
                    ? 'rgba(16, 185, 129, 0.20)'
                    : 'rgba(0, 122, 94, 0.12)',
                },
              ]}
            >
              <AppIcon name="leaf" size={28} color={theme.colors.tint} />
            </View>

            <View style={styles.memberDetails}>
              <View style={styles.memberNameRow}>
                <AppText variant="title3" weight="700">
                  {isAuthenticated && profile ? profile.displayName : 'Guest Visitor'}
                </AppText>
                <View
                  style={[
                    styles.verifiedPill,
                    { backgroundColor: theme.colors.fill },
                  ]}
                >
                  <AppIcon
                    name={isAuthenticated ? 'checkmark-circle' : 'person-outline'}
                    size={12}
                    color={theme.colors.tint}
                    style={{ marginRight: 3 }}
                  />
                  <AppText variant="caption2" weight="600" customColor={theme.colors.tint}>
                    {isAuthenticated && profile ? profile.role.toUpperCase() : 'GUEST'}
                  </AppText>
                </View>
              </View>

              <AppText variant="caption1" color="secondary" style={{ marginTop: 2 }}>
                {isAuthenticated && profile
                  ? `${profile.email} • ${profile.city || 'Metro Vancouver'}`
                  : 'Sign in to activate your verified circular passport'}
              </AppText>
            </View>
          </View>

          <AppSeparator verticalMargin={14} />

          {/* Metrics Bar */}
          <View style={styles.metricsBar}>
            <View style={styles.metricItem}>
              <AppText variant="headline" weight="700" customColor={theme.colors.tint}>
                {isAuthenticated && profile ? `+${profile.karmaPoints}` : '0'}
              </AppText>
              <AppText variant="caption2" color="secondary">
                EcoKarma Points
              </AppText>
            </View>

            <View
              style={[
                styles.metricDivider,
                { backgroundColor: theme.colors.separator },
              ]}
            />

            <View style={styles.metricItem}>
              <AppText variant="headline" weight="700" color="primary">
                {isAuthenticated && profile ? `${profile.co2DivertedKg} kg` : '0.0 kg'}
              </AppText>
              <AppText variant="caption2" color="secondary">
                CO₂ Diverted
              </AppText>
            </View>

            <View
              style={[
                styles.metricDivider,
                { backgroundColor: theme.colors.separator },
              ]}
            />

            <View style={styles.metricItem}>
              <AppText variant="headline" weight="700" color="primary">
                {isAuthenticated ? userListings.length : 0}
              </AppText>
              <AppText variant="caption2" color="secondary">
                Active Listings
              </AppText>
            </View>
          </View>
        </View>

        {/* Guest Auth Prompt (when not logged in) */}
        {!isAuthenticated ? (
          <View
            style={[
              styles.guestCard,
              {
                backgroundColor: theme.colors.secondaryBackground,
                borderColor: theme.colors.separator,
                borderWidth: theme.hairlineWidth,
                borderRadius: theme.radii.xl,
                ...theme.shadows.card,
              },
            ]}
          >
            <AppText variant="subheadline" weight="600" style={{ marginBottom: 4 }}>
              Account & Sync
            </AppText>
            <AppText
              variant="footnote"
              color="secondary"
              style={{ marginBottom: 14, lineHeight: 18 }}
            >
              Sign in with your email to persist device listings across devices and access verified community credentials.
            </AppText>
            <View style={styles.guestButtonRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <AppButton
                  label="Sign In"
                  variant="filled"
                  size="medium"
                  onPress={() => handleOpenAuth('signin')}
                />
              </View>
              <View style={{ flex: 1 }}>
                <AppButton
                  label="Create Account"
                  variant="gray"
                  size="medium"
                  onPress={() => handleOpenAuth('signup')}
                />
              </View>
            </View>
          </View>
        ) : null}

        {/* SECTION: User Listed Hardware */}
        {isAuthenticated && userListings.length > 0 ? (
          <>
            <View style={styles.sectionHeader}>
              <AppText variant="footnote" weight="600" color="secondary" style={styles.sectionTitle}>
                YOUR ACTIVE LISTINGS ({userListings.length})
              </AppText>
            </View>

            <View
              style={[
                styles.groupedCard,
                {
                  backgroundColor: theme.colors.secondaryBackground,
                  borderColor: theme.colors.separator,
                  borderWidth: theme.hairlineWidth,
                  borderRadius: theme.radii.xl,
                  ...theme.shadows.card,
                  marginBottom: 20,
                },
              ]}
            >
              {userListings.map((item, idx) => (
                <React.Fragment key={item.id}>
                  <View style={styles.listingRow}>
                    <View
                      style={[
                        styles.listingIconCircle,
                        {
                          backgroundColor: theme.isDark
                            ? 'rgba(16, 185, 129, 0.16)'
                            : 'rgba(0, 122, 94, 0.08)',
                        },
                      ]}
                    >
                      <AppIcon name="phone-portrait" size={18} color={theme.colors.tint} />
                    </View>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <AppText variant="subheadline" weight="600" numberOfLines={1}>
                        {item.title}
                      </AppText>
                      <AppText variant="caption2" color="secondary">
                        {item.pathway.toUpperCase()} • {item.isFree ? 'FREE' : `$${item.price}`} • {item.co2SavedKg} kg CO₂
                      </AppText>
                    </View>
                    <View
                      style={[
                        styles.statusPill,
                        {
                          backgroundColor: theme.colors.fill,
                        },
                      ]}
                    >
                      <AppText variant="caption2" weight="600" customColor={theme.colors.tint}>
                        {item.status.toUpperCase()}
                      </AppText>
                    </View>
                  </View>
                  {idx < userListings.length - 1 ? (
                    <View style={[styles.rowSeparator, { backgroundColor: theme.colors.separator, marginLeft: 56 }]} />
                  ) : null}
                </React.Fragment>
              ))}
            </View>
          </>
        ) : null}

        {/* SECTION: Operational Workspaces & Platform Capabilities */}
        <View style={styles.sectionHeader}>
          <AppText variant="footnote" weight="600" color="secondary" style={styles.sectionTitle}>
            OPERATIONAL WORKSPACES & TRUST
          </AppText>
          <AppText variant="caption2" color="tertiary" weight="500">
            MULTI-ROLE CONTROL
          </AppText>
        </View>

        <View
          style={[
            styles.groupedCard,
            {
              backgroundColor: theme.colors.secondaryBackground,
              borderColor: theme.colors.separator,
              borderWidth: theme.hairlineWidth,
              borderRadius: theme.radii.xl,
              ...theme.shadows.card,
              marginBottom: 20,
              padding: 16,
            },
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <AppText variant="subheadline" weight="700">
                Active Workspace
              </AppText>
              <AppText variant="caption1" color="secondary" style={{ marginTop: 2 }}>
                {profile?.activeWorkspace ? profile.activeWorkspace.replace('_', ' ').toUpperCase() : 'CONSUMER HUB'}
              </AppText>
            </View>
            <TouchableOpacity
              onPress={() => setWorkspaceModalVisible(true)}
              style={{
                backgroundColor: theme.colors.fill,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
              }}
            >
              <AppText variant="caption1" weight="600" customColor={theme.colors.tint}>
                Switch Workspace
              </AppText>
            </TouchableOpacity>
          </View>

          <AppSeparator verticalMargin={12} />

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={() => setProviderModalVisible(true)}
              style={{
                flex: 1,
                backgroundColor: theme.colors.fill,
                paddingVertical: 10,
                borderRadius: 10,
                alignItems: 'center',
              }}
            >
              <AppText variant="caption1" weight="600">
                Partner Application
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setPassportModalVisible(true)}
              style={{
                flex: 1,
                backgroundColor: theme.colors.fill,
                paddingVertical: 10,
                borderRadius: 10,
                alignItems: 'center',
              }}
            >
              <AppText variant="caption1" weight="600">
                Device Passport
              </AppText>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => setHandoverModalVisible(true)}
            style={{
              marginTop: 8,
              backgroundColor: theme.colors.fill,
              paddingVertical: 10,
              borderRadius: 10,
              alignItems: 'center',
            }}
          >
            <AppText variant="caption1" weight="600">
              Safe Handover Checklist
            </AppText>
          </TouchableOpacity>
        </View>

        {/* SECTION: Appearance & Theme */}
        <View style={styles.sectionHeader}>
          <AppText variant="footnote" weight="600" color="secondary" style={styles.sectionTitle}>
            APPEARANCE & THEME
          </AppText>
          <AppText variant="caption2" color="tertiary" weight="500">
            PERSISTED SETTINGS
          </AppText>
        </View>

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
          {appearanceOptions.map((opt, index) => {
            const isSelected = theme.themeMode === opt.id;
            const isLast = index === appearanceOptions.length - 1;

            return (
              <React.Fragment key={opt.id}>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={`Appearance mode: ${opt.title}. ${isSelected ? 'Currently selected.' : 'Tap to select.'}`}
                  activeOpacity={0.7}
                  onPress={() => theme.setThemeMode(opt.id)}
                  style={styles.optionRow}
                >
                  <View
                    style={[
                      styles.optionIconCircle,
                      {
                        backgroundColor: isSelected
                          ? theme.isDark
                            ? 'rgba(16, 185, 129, 0.20)'
                            : 'rgba(0, 122, 94, 0.12)'
                          : theme.colors.fill,
                      },
                    ]}
                  >
                    <AppIcon
                      name={opt.icon}
                      size={20}
                      color={isSelected ? theme.colors.tint : theme.colors.labelSecondary}
                    />
                  </View>

                  <View style={styles.optionTextContainer}>
                    <View style={styles.optionTitleRow}>
                      <AppText
                        variant="subheadline"
                        weight={isSelected ? '700' : '600'}
                        customColor={isSelected ? theme.colors.tint : theme.colors.labelPrimary}
                      >
                        {opt.title}
                      </AppText>
                      {isSelected ? (
                        <View
                          style={[
                            styles.activeBadge,
                            {
                              backgroundColor: theme.isDark
                                ? 'rgba(16, 185, 129, 0.20)'
                                : 'rgba(0, 122, 94, 0.10)',
                            },
                          ]}
                        >
                          <AppText
                            variant="caption2"
                            weight="700"
                            customColor={theme.colors.tint}
                          >
                            ACTIVE
                          </AppText>
                        </View>
                      ) : null}
                    </View>

                    <AppText
                      variant="caption1"
                      color="secondary"
                      style={{ marginTop: 2, lineHeight: 16 }}
                    >
                      {opt.subtitle}
                    </AppText>
                  </View>

                  <View style={styles.radioIndicator}>
                    {isSelected ? (
                      <View
                        style={[
                          styles.checkCircle,
                          { backgroundColor: theme.colors.tint },
                        ]}
                      >
                        <AppIcon name="checkmark" size={14} color="#FFFFFF" />
                      </View>
                    ) : (
                      <View
                        style={[
                          styles.emptyCheckCircle,
                          { borderColor: theme.colors.labelTertiary },
                        ]}
                      />
                    )}
                  </View>
                </TouchableOpacity>

                {!isLast ? (
                  <View
                    style={[
                      styles.rowSeparator,
                      {
                        backgroundColor: theme.colors.separator,
                        marginLeft: 58,
                      },
                    ]}
                  />
                ) : null}
              </React.Fragment>
            );
          })}
        </View>

        {/* Informative Note */}
        <View style={styles.noteBox}>
          <AppIcon
            name="information-circle-outline"
            size={16}
            color={theme.colors.labelTertiary}
            style={{ marginRight: 6, marginTop: 1 }}
          />
          <AppText variant="caption1" color="tertiary" style={{ flex: 1, lineHeight: 16 }}>
            Theme choices are stored locally and restored on subsequent application launches. Active multi-step post workflows preserve all input data when switching modes.
          </AppText>
        </View>

        {/* SECTION: App Information */}
        <View style={styles.sectionHeader}>
          <AppText variant="footnote" weight="600" color="secondary" style={styles.sectionTitle}>
            APPLICATION SPECIFICATIONS
          </AppText>
        </View>

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
          <View style={styles.infoRow}>
            <AppText variant="subheadline" color="secondary">
              Product Version
            </AppText>
            <AppText variant="subheadline" weight="600">
              Circuvio Mobile 1.0.0
            </AppText>
          </View>

          <View style={[styles.rowSeparator, { backgroundColor: theme.colors.separator }]} />

          <View style={styles.infoRow}>
            <AppText variant="subheadline" color="secondary">
              Framework & Engine
            </AppText>
            <AppText variant="subheadline" weight="600">
              Expo SDK 57 • React 19
            </AppText>
          </View>

          <View style={[styles.rowSeparator, { backgroundColor: theme.colors.separator }]} />

          <View style={styles.infoRow}>
            <AppText variant="subheadline" color="secondary">
              Design Guidelines
            </AppText>
            <AppText variant="subheadline" weight="600" customColor={theme.colors.tint}>
              Apple HIG Semantic Spec
            </AppText>
          </View>

          <View style={[styles.rowSeparator, { backgroundColor: theme.colors.separator }]} />

          <View style={styles.infoRow}>
            <AppText variant="subheadline" color="secondary">
              Theme Engine State
            </AppText>
            <AppText variant="subheadline" weight="600">
              {theme.themeMode.toUpperCase()} ({theme.resolvedScheme.toUpperCase()})
            </AppText>
          </View>
        </View>

        {/* Sign Out Action */}
        {isAuthenticated ? (
          <View style={styles.signOutWrapper}>
            <AppButton
              label="Sign Out"
              variant="tinted"
              size="medium"
              icon="log-out-outline"
              fullWidth
              onPress={handleSignOutConfirm}
            />
          </View>
        ) : null}
      </ScrollView>

      {/* Embedded Auth Modal */}
      <AuthModal
        visible={authModalVisible}
        initialMode={authInitialMode}
        onClose={() => setAuthModalVisible(false)}
      />

      {/* Workspace Switcher Modal */}
      <WorkspaceSwitcherModal
        visible={workspaceModalVisible}
        onClose={() => setWorkspaceModalVisible(false)}
        onWorkspaceSelected={(ws) => {
          setWorkspaceModalVisible(false);
          onWorkspaceSelected?.(ws);
        }}
      />

      {/* Provider Application Modal */}
      <ProviderApplicationModal
        visible={providerModalVisible}
        onClose={() => setProviderModalVisible(false)}
      />

      {/* Device Passport Modal */}
      <DevicePassportModal
        visible={passportModalVisible}
        onClose={() => setPassportModalVisible(false)}
      />

      {/* Safe Handover Modal */}
      <SafeHandoverModal
        visible={handoverModalVisible}
        onClose={() => setHandoverModalVisible(false)}
      />
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
  headerSubtitle: {
    marginTop: 4,
  },
  memberCard: {
    padding: 18,
    marginBottom: 20,
  },
  guestCard: {
    padding: 20,
    marginBottom: 20,
  },
  guestButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  memberTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  memberDetails: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  metricsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 4,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricDivider: {
    width: StyleSheet.hairlineWidth,
    height: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    letterSpacing: 0.8,
  },
  groupedCard: {
    overflow: 'hidden',
    marginBottom: 14,
  },
  listingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  listingIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 64,
  },
  optionIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  optionTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  optionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeBadge: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  radioIndicator: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCheckCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  rowSeparator: {
    height: StyleSheet.hairlineWidth,
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 6,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  signOutWrapper: {
    marginTop: 12,
    marginBottom: 20,
  },
});
