import React, { useState } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../../design-system/theme/theme';
import { HomeHeader } from '../components/HomeHeader';
import { WelcomeSection } from '../components/WelcomeSection';
import { CupertinoValuationTerminal } from '../components/CupertinoValuationTerminal';
import { CircularLifecycleVisual } from '../components/CircularLifecycleVisual';
import { CoreActions } from '../components/CoreActions';
import { PostDeviceBanner } from '../components/PostDeviceBanner';
import { CircularToolsSection } from '../components/CircularToolsSection';
import { CommunityActivitySection } from '../components/CommunityActivitySection';
import { RecentDevicesSection } from '../components/RecentDevicesSection';
import { PostDeviceModal } from '../../post/screens/PostDeviceModal';
import { ActionDetailSheet } from '../components/ActionDetailSheet';
import { RegionPickerSheet } from '../components/RegionPickerSheet';
import { CircularDecisionModal } from '../../decision/screens/CircularDecisionModal';
import { DevicePassportModal } from '../../passport/screens/DevicePassportModal';
import { SafeHandoverModal } from '../../passport/screens/SafeHandoverModal';
import { WorkspaceSwitcherModal } from '../../workspaces/components/WorkspaceSwitcherModal';
import { useHomeData } from '../hooks/useHomeData';
import { CoreActionConfig, RecentDeviceItem, CommunityHubItem } from '../types/home.types';
import { WorkspaceKey } from '../../../services/storage/localPersistence';

export interface HomeScreenProps {
  onNavigateToTab?: (tab: string) => void;
  onOpenPostSheet?: (initialAction?: string) => void;
  onOpenDecisionEngine?: () => void;
  onOpenPassport?: () => void;
  onOpenHandover?: () => void;
  onOpenWorkspaceSwitcher?: () => void;
  onWorkspaceSelected?: (ws: WorkspaceKey) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateToTab,
  onOpenPostSheet,
  onOpenDecisionEngine,
  onOpenPassport,
  onOpenHandover,
  onOpenWorkspaceSwitcher,
  onWorkspaceSelected,
}) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  const {
    coreActions,
    recentDevices,
    communityHubs,
    circularStats,
    refreshing,
    onRefresh,
    selectedRegion,
    setSelectedRegion,
  } = useHomeData();

  // Modal & Sheet States
  const [selectedAction, setSelectedAction] = useState<CoreActionConfig | null>(null);
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const [postSheetVisible, setPostSheetVisible] = useState(false);
  const [postInitialAction, setPostInitialAction] = useState<string>('sell');
  const [postInitialData, setPostInitialData] = useState<any>(undefined);
  const [regionPickerVisible, setRegionPickerVisible] = useState(false);

  // Internal Circular Modal fallbacks if callbacks not provided
  const [decisionModalVisible, setDecisionModalVisible] = useState(false);
  const [passportModalVisible, setPassportModalVisible] = useState(false);
  const [handoverModalVisible, setHandoverModalVisible] = useState(false);
  const [switcherModalVisible, setSwitcherModalVisible] = useState(false);

  const handleActionPress = (action: CoreActionConfig) => {
    setSelectedAction(action);
    setActionSheetVisible(true);
  };

  const handleSheetAction = (actionId: string) => {
    setActionSheetVisible(false);
    setSelectedAction(null);
    if (actionId === 'buy') {
      onNavigateToTab?.('explore');
    } else {
      setPostInitialAction(actionId);
      setPostInitialData(undefined);
      if (onOpenPostSheet) {
        onOpenPostSheet(actionId);
      } else {
        setPostSheetVisible(true);
      }
    }
  };

  const handleDevicePress = (device: RecentDeviceItem) => {
    Alert.alert(
      device.title,
      `${device.actionLabel}\nCondition: ${device.conditionLabel}\nDistance: ${device.distanceKm} km\nEstimated CO₂ Diversion: ${device.co2SavedKg} kg`,
      [
        { text: 'View in Explore', onPress: () => onNavigateToTab?.('explore') },
        { text: 'Close', style: 'cancel' },
      ]
    );
  };

  const handleHubPress = (hub: CommunityHubItem) => {
    Alert.alert(
      hub.name,
      `Category: ${hub.type}\nDistance: ${hub.distance}\nAddress: ${hub.address}\nTrust Rating: ${hub.rating} ★`,
      [{ text: 'Close', style: 'cancel' }]
    );
  };

  const triggerDecision = onOpenDecisionEngine || (() => setDecisionModalVisible(true));
  const triggerPassport = onOpenPassport || (() => setPassportModalVisible(true));
  const triggerHandover = onOpenHandover || (() => setHandoverModalVisible(true));
  const triggerSwitcher = onOpenWorkspaceSwitcher || (() => setSwitcherModalVisible(true));

  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor: theme.colors.background,
          paddingTop: Math.max(insets.top, 10),
        },
      ]}
    >
      {/* Section A: Header */}
      <HomeHeader
        selectedRegion={selectedRegion}
        onSelectRegion={() => setRegionPickerVisible(true)}
        onSearchPress={() => {
          if (onNavigateToTab) {
            onNavigateToTab('explore');
          } else {
            Alert.alert(
              'Search Circuvio',
              'Search devices, repairs, and recycling depots in ' + selectedRegion,
              [{ text: 'OK' }]
            );
          }
        }}
        onNotificationPress={() => {
          if (onNavigateToTab) {
            onNavigateToTab('activity');
          }
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: 110, // Safe clearance above bottom tab bar
          },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.tint}
            colors={[theme.colors.tint]}
          />
        }
      >
        {/* Section B: Apple Cupertino Editorial Heading & Hero Rescue Engine Card */}
        <WelcomeSection onOpenRescueEngine={triggerDecision} />

        {/* Section C: Interactive iOS Device Valuation Terminal */}
        <CupertinoValuationTerminal
          onAssessDevice={(_category, _condition) => {
            triggerDecision();
          }}
        />

        {/* Section D: 6-Step Circular Lifecycle Pathway Visual */}
        <CircularLifecycleVisual
          onSelectStep={(actionKey) => {
            handleSheetAction(actionKey);
          }}
        />

        {/* Section E: The 4 Core Actions (Repair, Recycle, Sell, Buy) */}
        <CoreActions
          actions={coreActions}
          onActionPress={handleActionPress}
        />

        {/* Section D: Primary Post Action Banner */}
        <PostDeviceBanner onPostPress={onOpenPostSheet || (() => setPostSheetVisible(true))} />

        {/* Section E: Circular Trust & Specialized Tools */}
        <CircularToolsSection
          onOpenDecisionEngine={triggerDecision}
          onOpenPassport={triggerPassport}
          onOpenHandover={triggerHandover}
          onOpenWorkspaceSwitcher={triggerSwitcher}
        />

        {/* Section F: Community Activity & Verified Hubs */}
        <CommunityActivitySection
          hubs={communityHubs}
          stats={circularStats}
          onHubPress={handleHubPress}
          onViewAll={() => onNavigateToTab?.('explore')}
        />

        {/* Section G: Devices Finding Their Next Life */}
        <RecentDevicesSection
          devices={recentDevices}
          onDevicePress={handleDevicePress}
          onExploreAll={() => onNavigateToTab?.('explore')}
        />
      </ScrollView>

      {/* Sheets & Modals */}
      <ActionDetailSheet
        action={selectedAction}
        visible={actionSheetVisible}
        onSelectAction={handleSheetAction}
        onClose={() => {
          setActionSheetVisible(false);
          setSelectedAction(null);
        }}
      />

      <PostDeviceModal
        visible={postSheetVisible}
        initialAction={postInitialAction as any}
        initialData={postInitialData}
        onClose={() => {
          setPostSheetVisible(false);
          setPostInitialData(undefined);
        }}
        onNavigateToExplore={() => {
          setPostSheetVisible(false);
          onNavigateToTab?.('explore');
        }}
      />

      <RegionPickerSheet
        visible={regionPickerVisible}
        currentRegion={selectedRegion}
        onSelect={(newRegion) => setSelectedRegion(newRegion)}
        onClose={() => setRegionPickerVisible(false)}
      />

      {/* Circular Decision Modal */}
      <CircularDecisionModal
        visible={decisionModalVisible}
        onClose={() => setDecisionModalVisible(false)}
        onSelectRoute={(route, deviceInfo) => {
          setDecisionModalVisible(false);
          const mappedAction = route === 'repair' ? 'repair' : route === 'certified_recycle' ? 'recycle' : 'sell';
          const prefill = {
            brand: deviceInfo.brand,
            model: deviceInfo.model,
            title: `${deviceInfo.brand} ${deviceInfo.model}`.trim(),
            category: (deviceInfo.category as any) || 'smartphone',
          };
          setPostInitialData(prefill);
          setPostInitialAction(mappedAction);
          if (onOpenPostSheet) {
            onOpenPostSheet(mappedAction);
          } else {
            setPostSheetVisible(true);
          }
        }}
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

      {/* Workspace Switcher Modal */}
      <WorkspaceSwitcherModal
        visible={switcherModalVisible}
        onClose={() => setSwitcherModalVisible(false)}
        onWorkspaceSelected={(ws) => {
          setSwitcherModalVisible(false);
          onWorkspaceSelected?.(ws);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
