import React from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../../design-system/theme/theme';
import { AppText } from '../../../components/ui/AppText';
import { AppIcon } from '../../../components/ui/AppIcon';

export interface RegionPickerSheetProps {
  visible: boolean;
  currentRegion: string;
  onSelect: (region: string) => void;
  onClose: () => void;
}

const REGIONS = [
  'Metro Vancouver',
  'Victoria & Island',
  'Seattle & Puget Sound',
  'Calgary Metro',
  'Toronto & GTA',
  'All Circular Regions',
];

export const RegionPickerSheet: React.FC<RegionPickerSheetProps> = ({
  visible,
  currentRegion,
  onSelect,
  onClose,
}) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

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
          {/* Grabber */}
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
            <View>
              <AppText variant="title2" weight="700">
                Select Service Area
              </AppText>
              <AppText variant="caption1" color="secondary" style={{ marginTop: 2 }}>
                Filters certified hubs and peer listings
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

          {/* Region list */}
          <View style={styles.list}>
            {REGIONS.map((region, index) => {
              const isSelected = region === currentRegion;
              const isLast = index === REGIONS.length - 1;

              return (
                <React.Fragment key={region}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      onSelect(region);
                      onClose();
                    }}
                    style={styles.regionRow}
                  >
                    <View style={styles.regionTextGroup}>
                      <AppText
                        variant="body"
                        weight={isSelected ? '600' : '400'}
                        customColor={
                          isSelected ? theme.colors.tint : theme.colors.labelPrimary
                        }
                      >
                        {region}
                      </AppText>
                      {isSelected && (
                        <AppText variant="caption2" color="secondary">
                          Active Region
                        </AppText>
                      )}
                    </View>

                    {isSelected && (
                      <AppIcon
                        name="checkmark"
                        size={20}
                        color={theme.colors.tint}
                      />
                    )}
                  </TouchableOpacity>

                  {!isLast && (
                    <View
                      style={[
                        styles.separator,
                        { backgroundColor: theme.colors.separator },
                      ]}
                    />
                  )}
                </React.Fragment>
              );
            })}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginBottom: 8,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    marginTop: 6,
    marginBottom: 10,
  },
  regionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  regionTextGroup: {
    flex: 1,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
  },
});
