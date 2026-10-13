import React from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../../design-system/theme/theme';
import { AppText } from '../../../components/ui/AppText';
import { AppIcon } from '../../../components/ui/AppIcon';
import { AppButton } from '../../../components/ui/AppButton';

export interface PostDeviceSheetProps {
  visible: boolean;
  onClose: () => void;
}

export const PostDeviceSheet: React.FC<PostDeviceSheetProps> = ({
  visible,
  onClose,
}) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  const steps = [
    {
      step: '1',
      title: 'Take or Upload Device Photos',
      desc: 'Capture clear shots of the front, back, and any visible screen or chassis wear.',
      icon: 'camera-outline' as const,
    },
    {
      step: '2',
      title: 'Select Intended Pathway',
      desc: 'Choose whether you want to request repair, list for resale, or recycle responsibly.',
      icon: 'git-branch-outline' as const,
    },
    {
      step: '3',
      title: 'Verify Specifications & Condition',
      desc: 'Automatic hardware category recognition with battery and operational assessment.',
      icon: 'hardware-chip-outline' as const,
    },
    {
      step: '4',
      title: 'Local Circular Match',
      desc: 'Instantly connect with certified repairers, vetted buyers, or municipal drop-offs.',
      icon: 'paper-plane-outline' as const,
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <TouchableOpacity
          style={styles.backdropTouch}
          activeOpacity={1}
          onPress={onClose}
        />

        <View
          style={[
            styles.sheetContainer,
            {
              backgroundColor: theme.colors.cardElevated,
              paddingBottom: Math.max(insets.bottom, 20),
              borderTopLeftRadius: theme.radii.xxl,
              borderTopRightRadius: theme.radii.xxl,
              borderColor: theme.colors.separator,
              borderWidth: theme.hairlineWidth,
              ...theme.shadows.modal,
            },
          ]}
        >
          {/* iOS Grabber */}
          <View style={styles.grabberContainer}>
            <View
              style={[
                styles.grabber,
                { backgroundColor: theme.colors.labelQuaternary },
              ]}
            />
          </View>

          {/* Header */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.titleRow}>
                <AppText variant="title2" weight="700">
                  Post a Device
                </AppText>
                <View
                  style={[
                    styles.phaseBadge,
                    {
                      backgroundColor: theme.isDark
                        ? 'rgba(16, 185, 129, 0.20)'
                        : 'rgba(0, 122, 94, 0.10)',
                    },
                  ]}
                >
                  <AppText
                    variant="caption2"
                    weight="700"
                    customColor={theme.colors.tint}
                  >
                    PHASE 1 PREVIEW
                  </AppText>
                </View>
              </View>
              <AppText variant="subheadline" color="secondary" style={{ marginTop: 2 }}>
                The circular posting workflow for second-life tech.
              </AppText>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onClose}
              style={[
                styles.closeButton,
                { backgroundColor: theme.colors.fill },
              ]}
            >
              <AppIcon name="close" size={18} color={theme.colors.labelPrimary} />
            </TouchableOpacity>
          </View>

          {/* Steps List */}
          <ScrollView style={styles.bodyList} showsVerticalScrollIndicator={false}>
            {steps.map((item, index) => (
              <View key={item.step} style={styles.stepItem}>
                <View
                  style={[
                    styles.stepBadge,
                    {
                      backgroundColor: theme.isDark
                        ? 'rgba(16, 185, 129, 0.16)'
                        : 'rgba(0, 122, 94, 0.08)',
                    },
                  ]}
                >
                  <AppIcon name={item.icon} size={18} color={theme.colors.tint} />
                </View>

                <View style={styles.stepContent}>
                  <AppText variant="headline" weight="600" style={styles.stepTitle}>
                    {item.step}. {item.title}
                  </AppText>
                  <AppText variant="footnote" color="secondary" style={styles.stepDesc}>
                    {item.desc}
                  </AppText>
                </View>
              </View>
            ))}

            <View
              style={[
                styles.noticeBox,
                {
                  backgroundColor: theme.colors.fillSecondary,
                  borderRadius: theme.radii.md,
                },
              ]}
            >
              <AppIcon
                name="information-circle-outline"
                size={18}
                color={theme.colors.tint}
                style={{ marginRight: 8, marginTop: 1 }}
              />
              <AppText
                variant="footnote"
                color="secondary"
                style={{ flex: 1, lineHeight: 18 }}
              >
                In accordance with Phase 1 scope, camera diagnosis and full form submission are intentionally previewed here and scheduled for Phase 2 implementation.
              </AppText>
            </View>
          </ScrollView>

          {/* Footer Action */}
          <View style={styles.footerAction}>
            <AppButton
              label="Got It"
              variant="filled"
              size="large"
              fullWidth
              onPress={onClose}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  backdropTouch: {
    flex: 1,
  },
  sheetContainer: {
    maxHeight: '85%',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  grabberContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  grabber: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  phaseBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  bodyList: {
    marginTop: 8,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    marginBottom: 3,
  },
  stepDesc: {
    lineHeight: 18,
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    marginTop: 4,
    marginBottom: 16,
  },
  footerAction: {
    marginTop: 10,
  },
});
