import React from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useAppTheme } from '../../../design-system/theme/theme';
import { AppText } from '../../../components/ui/AppText';
import { AppIcon } from '../../../components/ui/AppIcon';
import { CoreActionConfig } from '../types/home.types';

export interface ActionCardProps {
  action: CoreActionConfig;
  onPress: (action: CoreActionConfig) => void;
  style?: ViewStyle;
}

export const ActionCard: React.FC<ActionCardProps> = ({
  action,
  onPress,
  style,
}) => {
  const theme = useAppTheme();

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`${action.title}: ${action.description}`}
      accessibilityHint={`Navigates to ${action.title} services`}
      activeOpacity={0.72}
      onPress={() => onPress(action)}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.secondaryBackground,
          borderColor: theme.colors.separator,
          borderWidth: theme.hairlineWidth,
          borderRadius: theme.radii.xl,
          ...theme.shadows.card,
        },
        style,
      ]}
    >
      {/* Top Row: Icon Badge + Arrow */}
      <View style={styles.topRow}>
        <View
          style={[
            styles.iconBadge,
            {
              backgroundColor: action.bgColor,
            },
          ]}
        >
          <AppIcon name={action.icon} size={22} color={action.tintColor} />
        </View>

        <View
          style={[
            styles.arrowCircle,
            {
              backgroundColor: theme.colors.fillSecondary,
            },
          ]}
        >
          <AppIcon
            name="arrow-forward"
            size={13}
            color={theme.colors.labelTertiary}
          />
        </View>
      </View>

      {/* Title & Tagline */}
      <View style={styles.contentArea}>
        <AppText variant="headline" weight="700" style={styles.title}>
          {action.title}
        </AppText>
        <AppText
          variant="caption1"
          color="secondary"
          weight="400"
          numberOfLines={2}
          style={styles.description}
        >
          {action.description}
        </AppText>
      </View>

      {/* Bottom Sub-label / Stat */}
      <View
        style={[
          styles.footerPill,
          {
            backgroundColor: theme.colors.fillSecondary,
          },
        ]}
      >
        <View
          style={[
            styles.statusDot,
            {
              backgroundColor: action.tintColor,
            },
          ]}
        />
        <AppText
          variant="caption2"
          weight="600"
          color="secondary"
          numberOfLines={1}
        >
          {action.tagline}
        </AppText>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 14,
    justifyContent: 'space-between',
    minHeight: 164,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  iconBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentArea: {
    marginBottom: 10,
    flex: 1,
  },
  title: {
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  description: {
    lineHeight: 16,
  },
  footerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
});
