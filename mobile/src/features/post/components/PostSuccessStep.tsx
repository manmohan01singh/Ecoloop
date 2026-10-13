import React from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import { useAppTheme } from '../../../design-system/theme/theme';
import { AppText } from '../../../components/ui/AppText';
import { AppIcon } from '../../../components/ui/AppIcon';
import { AppButton } from '../../../components/ui/AppButton';
import { PostFormData } from '../types/post.types';

export interface PostSuccessStepProps {
  formData: PostFormData;
  onViewInExplore: () => void;
  onDone: () => void;
}

export const PostSuccessStep: React.FC<PostSuccessStepProps> = ({
  formData,
  onViewInExplore,
  onDone,
}) => {
  const theme = useAppTheme();

  const getActionSummary = () => {
    switch (formData.action) {
      case 'repair':
        return {
          title: 'Repair Request Submitted!',
          desc: 'Your diagnostic request has been logged into the EcoLoop network. Certified repairers will contact you with diagnostic quotes.',
          badge: 'TICKET ACTIVE',
        };
      case 'recycle':
        return {
          title: 'Recycling Manifest Generated!',
          desc: 'Your zero-landfill e-waste recovery manifest has been logged. Deliver your hardware to any registered depot in ' + (formData.city || 'your area') + '.',
          badge: 'MANIFEST GENERATED',
        };
      case 'sell':
      default:
        return {
          title: 'Device Listed on Marketplace!',
          desc: 'Your listing is now live in the Explore Marketplace for verified community buyers to discover.',
          badge: 'LISTING PUBLISHED',
        };
    }
  };

  const summary = getActionSummary();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.secondaryBackground,
            borderColor: theme.colors.separator,
            borderWidth: theme.hairlineWidth,
            borderRadius: theme.radii.xl,
            ...theme.shadows.card,
          },
        ]}
      >
        {/* Success Icon Circle */}
        <View
          style={[
            styles.iconCircle,
            {
              backgroundColor: theme.colors.tintLight,
              ...theme.getGlow('successCelebration'),
            },
          ]}
        >
          <AppIcon name="checkmark-circle" size={54} color={theme.colors.tint} />
        </View>

        {/* Status Badge */}
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: theme.isDark
                ? 'rgba(16, 185, 129, 0.20)'
                : 'rgba(0, 122, 94, 0.10)',
            },
          ]}
        >
          <AppText variant="caption2" weight="700" customColor={theme.colors.tint}>
            {summary.badge}
          </AppText>
        </View>

        <AppText variant="title2" weight="700" align="center" style={styles.title}>
          {summary.title}
        </AppText>

        <AppText
          variant="subheadline"
          color="secondary"
          align="center"
          style={styles.description}
        >
          {summary.desc}
        </AppText>

        {/* EcoKarma Points Card */}
        <View
          style={[
            styles.karmaCard,
            {
              backgroundColor: theme.colors.fillSecondary,
              borderRadius: theme.radii.md,
            },
          ]}
        >
          <AppIcon name="sparkles" size={20} color={theme.colors.tint} style={{ marginRight: 8 }} />
          <View style={{ flex: 1 }}>
            <AppText variant="subheadline" weight="700" customColor={theme.colors.tint}>
              +50 EcoKarma Points Earned
            </AppText>
            <AppText variant="caption2" color="secondary">
              Credited for keeping circular technology in active circulation.
            </AppText>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.buttonStack}>
          <AppButton
            label="View in Explore Marketplace"
            variant="filled"
            size="large"
            fullWidth
            icon="compass-outline"
            onPress={onViewInExplore}
            style={{ marginBottom: 10 }}
          />

          <AppButton
            label="Done & Return Home"
            variant="gray"
            size="large"
            fullWidth
            icon="home-outline"
            onPress={onDone}
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
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  card: {
    padding: 24,
    alignItems: 'center',
  },
  iconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 10,
  },
  title: {
    marginBottom: 8,
  },
  description: {
    lineHeight: 20,
    marginBottom: 20,
  },
  karmaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    width: '100%',
    marginBottom: 24,
  },
  buttonStack: {
    width: '100%',
  },
});
