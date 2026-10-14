import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useAppTheme } from './src/design-system/theme/theme';
import { AppTabBar, TabKey } from './src/components/navigation/AppTabBar';
import { HomeScreen } from './src/features/home/screens/HomeScreen';
import { ExploreScreen } from './src/features/explore/screens/ExploreScreen';
import { PostDeviceModal } from './src/features/post/screens/PostDeviceModal';
import { ActivityScreen } from './src/features/activity/screens/ActivityScreen';
import { CommunityScreen } from './src/features/community';
import { ProfileScreen } from './src/features/profile';
import { DeferredTabPlaceholder } from './src/components/navigation/DeferredTabPlaceholder';
import { DeviceActionType } from './src/features/post/types/post.types';
import { AuthProvider, useAuth } from './src/services/auth/AuthContext';
import { AuthModal } from './src/features/auth/components/AuthModal';
import { getUnreadActivityCount } from './src/services/database/activityRepository';
import {
  subscribeToDataChanges,
  WorkspaceKey,
} from './src/services/storage/localPersistence';
import { WorkspaceSwitcherModal } from './src/features/workspaces/components/WorkspaceSwitcherModal';
import { RepairProWorkspace } from './src/features/workspaces/screens/RepairProWorkspace';
import { RecyclerWorkspace } from './src/features/workspaces/screens/RecyclerWorkspace';
import { BusinessWorkspace } from './src/features/workspaces/screens/BusinessWorkspace';
import { ModeratorWorkspace } from './src/features/workspaces/screens/ModeratorWorkspace';
import { AdminWorkspace } from './src/features/workspaces/screens/AdminWorkspace';

function MainAppShell() {
  const theme = useAppTheme();
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceKey>(() => profile?.activeWorkspace || 'consumer');
  const [workspaceSwitcherVisible, setWorkspaceSwitcherVisible] = useState(false);
  const [postSheetVisible, setPostSheetVisible] = useState(false);
  const [postInitialAction, setPostInitialAction] = useState<DeviceActionType>('sell');
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Sync workspace if profile changes
  useEffect(() => {
    if (profile?.activeWorkspace) {
      setActiveWorkspace(profile.activeWorkspace);
    }
  }, [profile?.activeWorkspace]);

  // Sync unread activity count
  useEffect(() => {
    const updateCount = () => {
      if (user?.id) {
        setUnreadCount(getUnreadActivityCount(user.id));
      } else {
        setUnreadCount(0);
      }
    };

    updateCount();
    const unsubscribe = subscribeToDataChanges((type) => {
      if (type === 'activities' || type === 'auth') {
        updateCount();
      }
    });

    return unsubscribe;
  }, [user?.id]);

  const handleTabPress = (tab: TabKey) => {
    setActiveTab(tab);
  };

  const handlePostPress = (action: string = 'sell') => {
    setPostInitialAction((action as DeviceActionType) || 'sell');
    setPostSheetVisible(true);
  };

  const handleWorkspaceSelected = (ws: WorkspaceKey) => {
    setActiveWorkspace(ws);
  };

  // Render specialized operational workspace if active workspace != consumer
  if (activeWorkspace === 'repair_pro') {
    return (
      <View style={[styles.shell, { backgroundColor: theme.colors.background }]}>
        <StatusBar style={theme.isDark ? 'light' : 'dark'} />
        <RepairProWorkspace
          onReturnToConsumer={() => setActiveWorkspace('consumer')}
          onOpenWorkspaceSwitcher={() => setWorkspaceSwitcherVisible(true)}
        />
        <WorkspaceSwitcherModal
          visible={workspaceSwitcherVisible}
          onClose={() => setWorkspaceSwitcherVisible(false)}
          onWorkspaceSelected={handleWorkspaceSelected}
        />
      </View>
    );
  }

  if (activeWorkspace === 'recycler') {
    return (
      <View style={[styles.shell, { backgroundColor: theme.colors.background }]}>
        <StatusBar style={theme.isDark ? 'light' : 'dark'} />
        <RecyclerWorkspace
          onReturnToConsumer={() => setActiveWorkspace('consumer')}
          onOpenWorkspaceSwitcher={() => setWorkspaceSwitcherVisible(true)}
        />
        <WorkspaceSwitcherModal
          visible={workspaceSwitcherVisible}
          onClose={() => setWorkspaceSwitcherVisible(false)}
          onWorkspaceSelected={handleWorkspaceSelected}
        />
      </View>
    );
  }

  if (activeWorkspace === 'business') {
    return (
      <View style={[styles.shell, { backgroundColor: theme.colors.background }]}>
        <StatusBar style={theme.isDark ? 'light' : 'dark'} />
        <BusinessWorkspace
          onReturnToConsumer={() => setActiveWorkspace('consumer')}
          onOpenWorkspaceSwitcher={() => setWorkspaceSwitcherVisible(true)}
        />
        <WorkspaceSwitcherModal
          visible={workspaceSwitcherVisible}
          onClose={() => setWorkspaceSwitcherVisible(false)}
          onWorkspaceSelected={handleWorkspaceSelected}
        />
      </View>
    );
  }

  if (activeWorkspace === 'moderator') {
    return (
      <View style={[styles.shell, { backgroundColor: theme.colors.background }]}>
        <StatusBar style={theme.isDark ? 'light' : 'dark'} />
        <ModeratorWorkspace
          onReturnToConsumer={() => setActiveWorkspace('consumer')}
          onOpenWorkspaceSwitcher={() => setWorkspaceSwitcherVisible(true)}
        />
        <WorkspaceSwitcherModal
          visible={workspaceSwitcherVisible}
          onClose={() => setWorkspaceSwitcherVisible(false)}
          onWorkspaceSelected={handleWorkspaceSelected}
        />
      </View>
    );
  }

  if (activeWorkspace === 'admin') {
    return (
      <View style={[styles.shell, { backgroundColor: theme.colors.background }]}>
        <StatusBar style={theme.isDark ? 'light' : 'dark'} />
        <AdminWorkspace
          onReturnToConsumer={() => setActiveWorkspace('consumer')}
          onOpenWorkspaceSwitcher={() => setWorkspaceSwitcherVisible(true)}
        />
        <WorkspaceSwitcherModal
          visible={workspaceSwitcherVisible}
          onClose={() => setWorkspaceSwitcherVisible(false)}
          onWorkspaceSelected={handleWorkspaceSelected}
        />
      </View>
    );
  }

  // Consumer Hub Workspace (Default)
  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeScreen
            onNavigateToTab={(tab) => setActiveTab(tab as TabKey)}
            onOpenPostSheet={handlePostPress}
            onOpenWorkspaceSwitcher={() => setWorkspaceSwitcherVisible(true)}
            onWorkspaceSelected={handleWorkspaceSelected}
          />
        );
      case 'explore':
        return (
          <ExploreScreen
            onReturnHome={() => setActiveTab('home')}
            onOpenPostSheet={() => handlePostPress('sell')}
          />
        );
      case 'community':
        return (
          <CommunityScreen
            onReturnHome={() => setActiveTab('home')}
            onNavigateToTab={(tab) => setActiveTab(tab as TabKey)}
          />
        );
      case 'activity':
        return (
          <ActivityScreen
            onReturnHome={() => setActiveTab('home')}
            onOpenExplore={() => setActiveTab('explore')}
            onOpenPostSheet={() => handlePostPress('sell')}
            onOpenAuthModal={() => setAuthModalVisible(true)}
          />
        );
      case 'profile':
        return (
          <ProfileScreen
            onReturnHome={() => setActiveTab('home')}
            onOpenPostSheet={() => handlePostPress('sell')}
            onOpenWorkspaceSwitcher={() => setWorkspaceSwitcherVisible(true)}
            onWorkspaceSelected={handleWorkspaceSelected}
          />
        );
      default:
        return (
          <DeferredTabPlaceholder
            tabKey={activeTab}
            onReturnHome={() => setActiveTab('home')}
          />
        );
    }
  };

  return (
    <View style={[styles.shell, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />

      {/* Screen Body */}
      <View style={styles.content}>
        {renderActiveScreen()}
      </View>

      {/* Native-feeling Apple Tab Bar with Selective Glow & Unread Indicator */}
      <AppTabBar
        activeTab={activeTab}
        onTabPress={handleTabPress}
        onPostPress={handlePostPress}
        unreadActivityCount={unreadCount}
      />

      {/* Complete Device-Posting Multi-Step Journey */}
      <PostDeviceModal
        visible={postSheetVisible}
        initialAction={postInitialAction}
        onClose={() => setPostSheetVisible(false)}
        onNavigateToExplore={() => {
          setPostSheetVisible(false);
          setActiveTab('explore');
        }}
      />

      {/* Global Auth Modal */}
      <AuthModal
        visible={authModalVisible}
        onClose={() => setAuthModalVisible(false)}
      />

      {/* Workspace Switcher Modal */}
      <WorkspaceSwitcherModal
        visible={workspaceSwitcherVisible}
        onClose={() => setWorkspaceSwitcherVisible(false)}
        onWorkspaceSelected={handleWorkspaceSelected}
      />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <MainAppShell />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
