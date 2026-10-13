import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../design-system/theme/theme';
import { AppText } from '../ui/AppText';
import { AppIcon, IconName } from '../ui/AppIcon';
import { AppButton } from '../ui/AppButton';
import { TabKey } from './AppTabBar';

export interface DeferredTabPlaceholderProps {
  tabKey: TabKey;
  onReturnHome: () => void;
}

export const DeferredTabPlaceholder: React.FC<DeferredTabPlaceholderProps> = ({
  tabKey,
  onReturnHome,
}) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  const getTabInfo = (): { title: string; desc: string; icon: IconName; phase: string } => {
    switch (tabKey) {
      case 'explore':
        return {
          title: 'Explore & Marketplace',
          desc: 'Comprehensive filtered directory of second-life hardware, verified drop-offs, and localized circular initiatives.',
          icon: 'compass',
          phase: 'Phase 2 Architecture',
        };
      case 'activity':
        return {
          title: 'Community Activity & EcoKarma',
          desc: 'Real-time telemetry on kilograms of diverted e-waste, carbon offsets, and earned community repair badges.',
          icon: 'pulse',
          phase: 'Phase 3 Architecture',
        };
      case 'profile':
        return {
          title: 'User Profile & Inventory',
          desc: 'Device lifecycle registry, active repair tickets, listed devices, and authenticated business roles.',
          icon: 'person',
          phase: 'Phase 2 Architecture',
        };
      default:
        return {
          title: 'Section In Development',
          desc: 'This pathway is intentionally scheduled for an upcoming phase.',
          icon: 'hammer',
          phase: 'Upcoming Phase',
        };
    }
  };

  const info = getTabInfo();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          paddingTop: Math.max(insets.top, 20),
          paddingBottom: insets.bottom + 72,
        },
      ]}
    >
      <View
        style={[
          styles.contentCard,
          {
            backgroundColor: theme.colors.secondaryBackground,
            borderColor: theme.colors.separator,
            borderWidth: theme.hairlineWidth,
            borderRadius: theme.radii.xl,
            ...theme.shadows.card,
          },
        ]}
      >
        <View
          style={[
            styles.iconCircle,
            {
              backgroundColor: theme.isDark
                ? 'rgba(16, 185, 129, 0.20)'
                : 'rgba(0, 122, 94, 0.12)',
            },
          ]}
        >
          <AppIcon name={info.icon} size={32} color={theme.colors.tint} />
        </View>

        <View
          style={[
            styles.phaseBadge,
            {
              backgroundColor: theme.colors.fill,
            },
          ]}
        >
          <AppText variant="caption2" weight="700" customColor={theme.colors.tint}>
            {info.phase.toUpperCase()}
          </AppText>
        </View>

        <AppText variant="title2" weight="700" align="center" style={styles.title}>
          {info.title}
        </AppText>

        <AppText
          variant="subheadline"
          color="secondary"
          align="center"
          style={styles.description}
        >
          {info.desc}
        </AppText>

        <View style={styles.buttonWrapper}>
          <AppButton
            label="Return to Home"
            variant="filled"
            size="medium"
            icon="home-outline"
            onPress={onReturnHome}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  contentCard: {
    padding: 24,
    alignItems: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  phaseBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
  },
  title: {
    marginBottom: 8,
  },
  description: {
    lineHeight: 20,
    marginBottom: 24,
  },
  buttonWrapper: {
    width: '100%',
    alignItems: 'center',
  },
});
