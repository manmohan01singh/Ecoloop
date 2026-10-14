import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../design-system/theme/theme';
import { AppText } from '../ui/AppText';
import { AppIcon, IconName } from '../ui/AppIcon';

export type TabKey = 'home' | 'explore' | 'community' | 'post' | 'activity' | 'profile';

export interface TabItem {
  key: TabKey;
  label: string;
  activeIcon: IconName;
  inactiveIcon: IconName;
  isAction?: boolean;
}

const TABS: TabItem[] = [
  {
    key: 'home',
    label: 'Home',
    activeIcon: 'home',
    inactiveIcon: 'home-outline',
  },
  {
    key: 'explore',
    label: 'Explore',
    activeIcon: 'compass',
    inactiveIcon: 'compass-outline',
  },
  {
    key: 'community',
    label: 'Community',
    activeIcon: 'chatbubbles',
    inactiveIcon: 'chatbubbles-outline',
  },
  {
    key: 'activity',
    label: 'Activity',
    activeIcon: 'pulse',
    inactiveIcon: 'pulse-outline',
  },
  {
    key: 'profile',
    label: 'Profile',
    activeIcon: 'person',
    inactiveIcon: 'person-outline',
  },
];

export interface AppTabBarProps {
  activeTab: TabKey;
  onTabPress: (tab: TabKey) => void;
  onPostPress?: () => void;
  unreadActivityCount?: number;
}

export const AppTabBar: React.FC<AppTabBarProps> = ({
  activeTab,
  onTabPress,
  onPostPress,
  unreadActivityCount = 0,
}) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  const handlePress = (tab: TabItem) => {
    if (tab.key === 'post' && onPostPress) {
      onPostPress();
      return;
    }
    onTabPress(tab.key);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.secondaryBackground,
          borderTopColor: theme.colors.separator,
          borderTopWidth: theme.hairlineWidth,
          paddingBottom: Math.max(insets.bottom, 12),
        },
      ]}
    >
      <View style={styles.tabRow}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;

          if (tab.isAction) {
            return (
              <TouchableOpacity
                key={tab.key}
                accessibilityRole="button"
                accessibilityLabel="Post a device"
                activeOpacity={0.82}
                onPress={() => handlePress(tab)}
                style={styles.actionTabItem}
              >
                <View
                  style={[
                    styles.actionIconCircle,
                    {
                      backgroundColor: theme.colors.tint,
                      ...theme.getGlow('primaryAction'),
                    },
                  ]}
                >
                  <AppIcon name="add" size={24} color="#FFFFFF" />
                </View>
                <AppText
                  variant="caption2"
                  weight={isActive ? '600' : '500'}
                  customColor={isActive ? theme.colors.tint : theme.colors.labelSecondary}
                  style={styles.actionLabel}
                >
                  {tab.label}
                </AppText>
              </TouchableOpacity>
            );
          }

          const hasUnread = tab.key === 'activity' && unreadActivityCount > 0;

          return (
            <TouchableOpacity
              key={tab.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={hasUnread ? `${tab.label}, unread events` : tab.label}
              activeOpacity={0.7}
              onPress={() => handlePress(tab)}
              style={styles.tabItem}
            >
              <View style={styles.iconWrapper}>
                <AppIcon
                  name={isActive ? tab.activeIcon : tab.inactiveIcon}
                  size={22}
                  color={isActive ? theme.colors.tint : theme.colors.labelTertiary}
                />
                {hasUnread ? (
                  <View
                    style={[
                      styles.tabUnreadBadge,
                      {
                        backgroundColor: theme.colors.tint,
                        ...theme.getGlow('unreadIndicator'),
                      },
                    ]}
                  />
                ) : null}
              </View>
              <AppText
                variant="caption2"
                weight={isActive ? '600' : '500'}
                customColor={isActive ? theme.colors.tint : theme.colors.labelTertiary}
                style={styles.tabLabel}
              >
                {tab.label}
              </AppText>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  tabRow: {
    flexDirection: 'row',
    height: 52,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  tabLabel: {
    marginTop: 3,
    fontSize: 10.5,
  },
  iconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabUnreadBadge: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  actionTabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  actionIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    marginTop: 2,
    fontSize: 10,
  },
});
