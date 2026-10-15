import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useAppTheme, ThemeMode } from '../../../design-system/theme/theme';
import { AppText } from '../../../components/ui/AppText';
import { AppIcon } from '../../../components/ui/AppIcon';

export interface HomeHeaderProps {
  selectedRegion: string;
  onSelectRegion?: () => void;
  onNotificationPress?: () => void;
  onSearchPress?: () => void;
  onThemeTogglePress?: () => void;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  selectedRegion,
  onSelectRegion,
  onNotificationPress,
  onSearchPress,
  onThemeTogglePress,
}) => {
  const theme = useAppTheme();

  const handleToggleTheme = () => {
    if (onThemeTogglePress) {
      onThemeTogglePress();
      return;
    }
    const nextMode: ThemeMode =
      theme.themeMode === 'system'
        ? 'light'
        : theme.themeMode === 'light'
        ? 'dark'
        : 'system';
    theme.setThemeMode(nextMode);
  };

  return (
    <View style={styles.container}>
      {/* Brand & Subtitle */}
      <View style={styles.brandRow}>
        <View style={styles.brandGroup}>
          <View
            style={[
              styles.logoIconBadge,
              {
                backgroundColor: theme.colors.fill,
              },
            ]}
          >
            <AppIcon name="leaf" size={17} color={theme.colors.tint} />
          </View>
          <View>
            <AppText variant="headline" weight="800" style={{ letterSpacing: -0.4 }}>
              Circuvio
            </AppText>
            <AppText variant="caption2" color="secondary" weight="600" style={{ letterSpacing: 0.2 }}>
              Circular Tech
            </AppText>
          </View>
        </View>

        {/* Right side controls: Location Pill + Theme Toggle + Search + Notification */}
        <View style={styles.actionGroup}>
          {/* Location indicator pill */}
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={`Current location: ${selectedRegion}. Tap to change.`}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
            onPress={onSelectRegion}
            style={[
              styles.locationPill,
              {
                backgroundColor: theme.colors.fill,
                borderColor: theme.colors.separator,
                borderWidth: theme.hairlineWidth,
              },
            ]}
          >
            <AppIcon
              name="location-sharp"
              size={12}
              color={theme.colors.tint}
              style={{ marginRight: 4 }}
            />
            <AppText
              variant="caption2"
              weight="600"
              color="primary"
              numberOfLines={1}
              style={styles.locationText}
            >
              {selectedRegion}
            </AppText>
            <AppIcon
              name="chevron-down"
              size={10}
              color={theme.colors.labelTertiary}
              style={{ marginLeft: 3 }}
            />
          </TouchableOpacity>

          {/* Quick Appearance Toggle Button */}
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={`Appearance mode: ${theme.themeMode}. Tap to toggle between System, Light, and Dark mode.`}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
            onPress={handleToggleTheme}
            style={[
              styles.iconButton,
              {
                backgroundColor: theme.colors.fill,
              },
            ]}
          >
            <AppIcon
              name={theme.isDark ? 'sunny-outline' : 'moon-outline'}
              size={16}
              color={theme.colors.labelPrimary}
            />
          </TouchableOpacity>

          {/* Search Button */}
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Search listings"
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
            onPress={onSearchPress}
            style={[
              styles.iconButton,
              {
                backgroundColor: theme.colors.fill,
              },
            ]}
          >
            <AppIcon
              name="search"
              size={16}
              color={theme.colors.labelPrimary}
            />
          </TouchableOpacity>

          {/* Notifications Button with active badge */}
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
            onPress={onNotificationPress}
            style={[
              styles.iconButton,
              {
                backgroundColor: theme.colors.fill,
              },
            ]}
          >
            <AppIcon
              name="notifications-outline"
              size={17}
              color={theme.colors.labelPrimary}
            />
            <View
              style={[
                styles.badgeDot,
                {
                  backgroundColor: theme.colors.tint,
                  borderColor: theme.colors.card,
                },
              ]}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    marginRight: 6,
  },
  logoIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 14,
    maxWidth: 105,
  },
  locationText: {
    maxWidth: 62,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badgeDot: {
    position: 'absolute',
    top: 6,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    borderWidth: 1.5,
  },
});
