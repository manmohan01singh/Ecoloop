import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useAppTheme } from '../../../design-system/theme/theme';
import { AppText } from '../../../components/ui/AppText';
import { AppIcon } from '../../../components/ui/AppIcon';

export const WelcomeSection: React.FC = () => {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      {/* Category Tagline Badge */}
      <View
        style={[
          styles.pillBadge,
          {
            backgroundColor: theme.isDark
              ? 'rgba(16, 185, 129, 0.16)'
              : 'rgba(0, 122, 94, 0.08)',
          },
        ]}
      >
        <AppIcon
          name="sparkles"
          size={12}
          color={theme.colors.tint}
          style={{ marginRight: 5 }}
        />
        <AppText
          variant="caption1"
          weight="600"
          customColor={theme.colors.tint}
        >
          Circular Electronics Hub
        </AppText>
      </View>

      {/* Main Title - Apple Large Display Heading */}
      <AppText
        variant="title1"
        weight="800"
        color="primary"
        style={styles.mainTitle}
      >
        Give your devices a second life.
      </AppText>

      {/* Supporting Copy */}
      <View style={styles.subRow}>
        <AppText
          variant="subheadline"
          color="secondary"
          weight="500"
          style={styles.supportingCopy}
        >
          Repair it.{'  '}•{'  '}Resell it.{'  '}•{'  '}Recycle it.
        </AppText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 10,
  },
  mainTitle: {
    fontSize: 26,
    lineHeight: 32,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  supportingCopy: {
    letterSpacing: -0.2,
  },
});
