import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useAppTheme } from '../../../design-system/theme/theme';
import { AppText } from '../../../components/ui/AppText';
import { AppIcon } from '../../../components/ui/AppIcon';
import { PostStep } from '../types/post.types';

export interface PostProgressHeaderProps {
  currentStep: PostStep;
  totalSteps?: number;
  onBack: () => void;
  onCancel: () => void;
}

export const PostProgressHeader: React.FC<PostProgressHeaderProps> = ({
  currentStep,
  totalSteps = 4,
  onBack,
  onCancel,
}) => {
  const theme = useAppTheme();

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Step 1: Device Photos';
      case 2:
        return 'Step 2: Specifications';
      case 3:
        return 'Step 3: Circular Pathway';
      case 4:
        return 'Step 4: Review & Submit';
      case 5:
        return 'Success';
      default:
        return 'Post Device';
    }
  };

  if (currentStep === 5) {
    return null; // Header hidden on success celebration
  }

  return (
    <View style={styles.container}>
      {/* iOS Grabber */}
      <View style={styles.grabberContainer}>
        <View
          style={[
            styles.grabber,
            { backgroundColor: theme.colors.labelQuaternary },
          ]}
        />
      </View>

      {/* Nav row */}
      <View style={styles.navRow}>
        {currentStep > 1 ? (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Previous step"
            activeOpacity={0.7}
            onPress={onBack}
            style={styles.navButton}
          >
            <AppIcon
              name="chevron-back"
              size={22}
              color={theme.colors.tint}
            />
            <AppText variant="body" weight="500" customColor={theme.colors.tint}>
              Back
            </AppText>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Cancel posting"
            activeOpacity={0.7}
            onPress={onCancel}
            style={styles.navButton}
          >
            <AppText variant="body" color="secondary">
              Cancel
            </AppText>
          </TouchableOpacity>
        )}

        <View style={styles.titleContainer}>
          <AppText variant="subheadline" weight="700" align="center">
            {getStepTitle()}
          </AppText>
          <AppText variant="caption2" color="tertiary" align="center">
            {currentStep} of {totalSteps}
          </AppText>
        </View>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Close"
          activeOpacity={0.7}
          onPress={onCancel}
          style={[styles.closeCircle, { backgroundColor: theme.colors.fill }]}
        >
          <AppIcon name="close" size={16} color={theme.colors.labelPrimary} />
        </TouchableOpacity>
      </View>

      {/* 4-Segment Progress Bar */}
      <View style={styles.progressBarRow}>
        {[1, 2, 3, 4].map((stepNum) => {
          const isDone = currentStep >= stepNum;
          const isCurrent = currentStep === stepNum;

          return (
            <View
              key={stepNum}
              style={[
                styles.progressSegment,
                {
                  backgroundColor: isDone
                    ? theme.colors.tint
                    : theme.colors.fill,
                  opacity: isCurrent ? 1 : isDone ? 0.8 : 0.4,
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 10,
  },
  grabberContainer: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  grabber: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 60,
  },
  titleContainer: {
    alignItems: 'center',
  },
  closeCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  progressSegment: {
    flex: 1,
    height: 3.5,
    borderRadius: 2,
  },
});
