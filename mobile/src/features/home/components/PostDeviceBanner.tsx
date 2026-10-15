import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useAppTheme } from '../../../design-system/theme/theme';
import { AppText } from '../../../components/ui/AppText';
import { AppIcon } from '../../../components/ui/AppIcon';

export interface PostDeviceBannerProps {
  onPostPress: () => void;
}

export const PostDeviceBanner: React.FC<PostDeviceBannerProps> = ({
  onPostPress,
}) => {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Post a device. Have something to repair, sell, or recycle? Start with a photo."
        activeOpacity={0.88}
        onPress={onPostPress}
        style={[
          styles.bannerCard,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.separator,
            borderWidth: theme.hairlineWidth,
            borderRadius: theme.radii.xl,
            ...theme.shadows.card,
          },
        ]}
      >
        <View style={styles.innerContent}>
          {/* Left Icon Hub */}
          <View
            style={[
              styles.iconHub,
              {
                backgroundColor: theme.colors.tint,
              },
            ]}
          >
            <AppIcon name="camera" size={24} color={theme.isDark ? '#000000' : '#FFFFFF'} />
          </View>

          {/* Center Text Area */}
          <View style={styles.textContainer}>
            <View style={styles.headerRow}>
              <AppText variant="headline" weight="700">
                Post a Device
              </AppText>
              <View
                style={[
                  styles.quickPill,
                  {
                    backgroundColor: theme.colors.fill,
                  },
                ]}
              >
                <AppText
                  variant="caption2"
                  weight="700"
                  color="primary"
                >
                  NEW
                </AppText>
              </View>
            </View>

            <AppText
              variant="subheadline"
              color="secondary"
              weight="400"
              style={styles.subtitle}
            >
              Have something to repair, sell, or recycle? Start with a photo.
            </AppText>

            {/* Quick Action Visual CTA Indicator (avoids nested Touchable collision) */}
            <View style={styles.ctaRow}>
              <View
                style={[
                  styles.ctaButton,
                  {
                    backgroundColor: theme.colors.tint,
                    borderRadius: theme.radii.sm,
                  },
                ]}
              >
                <AppIcon name="camera-outline" size={15} color={theme.isDark ? '#000000' : '#FFFFFF'} style={{ marginRight: 6 }} />
                <AppText variant="subheadline" weight="600" customColor={theme.isDark ? '#000000' : '#FFFFFF'}>
                  Snap & Classify
                </AppText>
              </View>
              <AppText
                variant="caption2"
                color="tertiary"
                style={{ marginLeft: 10 }}
              >
                Instant circular match
              </AppText>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 26,
  },
  bannerCard: {
    padding: 16,
  },
  innerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconHub: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  quickPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  subtitle: {
    lineHeight: 18,
    marginBottom: 12,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
});
