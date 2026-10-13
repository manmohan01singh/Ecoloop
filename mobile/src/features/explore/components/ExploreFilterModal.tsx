import React from 'react';
import {
  Modal,
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../../design-system/theme/theme';
import { AppText } from '../../../components/ui/AppText';
import { AppIcon } from '../../../components/ui/AppIcon';
import { AppButton } from '../../../components/ui/AppButton';
import { AppSeparator } from '../../../components/ui/AppSeparator';
import {
  ExploreFilters,
  ExploreAction,
  DeviceCondition,
  ExploreSort,
} from '../types/explore.types';

export interface ExploreFilterModalProps {
  visible: boolean;
  filters: ExploreFilters;
  onApplyFilters: (newFilters: Partial<ExploreFilters>) => void;
  onResetFilters: () => void;
  onClose: () => void;
}

export const ExploreFilterModal: React.FC<ExploreFilterModalProps> = ({
  visible,
  filters,
  onApplyFilters,
  onResetFilters,
  onClose,
}) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  const [tempAction, setTempAction] = React.useState<ExploreAction>(filters.action);
  const [tempCondition, setTempCondition] = React.useState<'all' | DeviceCondition>(filters.condition);
  const [tempSort, setTempSort] = React.useState<ExploreSort>(filters.sort);
  const [tempOnlyFree, setTempOnlyFree] = React.useState<boolean>(filters.onlyFree);

  // Sync state when opened
  React.useEffect(() => {
    if (visible) {
      setTempAction(filters.action);
      setTempCondition(filters.condition);
      setTempSort(filters.sort);
      setTempOnlyFree(filters.onlyFree);
    }
  }, [visible, filters]);

  const handleApply = () => {
    onApplyFilters({
      action: tempAction,
      condition: tempCondition,
      sort: tempSort,
      onlyFree: tempOnlyFree,
    });
    onClose();
  };

  const handleReset = () => {
    onResetFilters();
    onClose();
  };

  const actionOptions: { id: ExploreAction; label: string }[] = [
    { id: 'all', label: 'All Pathways' },
    { id: 'sell', label: 'Buy & Sell' },
    { id: 'repair', label: 'Needs Repair' },
    { id: 'recycle', label: 'Recycle / Salvage' },
  ];

  const conditionOptions: { id: 'all' | DeviceCondition; label: string }[] = [
    { id: 'all', label: 'Any Condition' },
    { id: 'like_new', label: 'Like New (Pristine)' },
    { id: 'good', label: 'Good (Minor wear)' },
    { id: 'fair', label: 'Fair (Visible wear)' },
    { id: 'for_parts', label: 'For Parts / E-Waste' },
  ];

  const sortOptions: { id: ExploreSort; label: string }[] = [
    { id: 'nearest', label: 'Nearest Distance' },
    { id: 'co2', label: 'Most CO₂ Diverted' },
    { id: 'price_asc', label: 'Price: Low to High' },
    { id: 'price_desc', label: 'Price: High to Low' },
    { id: 'newest', label: 'Newest Listed' },
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
            <AppText variant="title2" weight="700">
              Filter & Sort
            </AppText>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Close filters modal"
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

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Pathway Section */}
            <View style={styles.section}>
              <AppText variant="headline" weight="600" style={styles.sectionTitle}>
                Pathway & Intent
              </AppText>
              <View style={styles.chipRow}>
                {actionOptions.map((opt) => {
                  const selected = tempAction === opt.id;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      activeOpacity={0.75}
                      onPress={() => setTempAction(opt.id)}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: selected
                            ? theme.colors.tint
                            : theme.colors.secondaryBackground,
                          borderColor: selected
                            ? theme.colors.tint
                            : theme.colors.separator,
                          borderWidth: theme.hairlineWidth,
                          borderRadius: theme.radii.full,
                        },
                      ]}
                    >
                      <AppText
                        variant="footnote"
                        weight={selected ? '600' : '500'}
                        customColor={selected ? '#FFFFFF' : theme.colors.labelPrimary}
                      >
                        {opt.label}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <AppSeparator verticalMargin={14} />

            {/* Condition Section */}
            <View style={styles.section}>
              <AppText variant="headline" weight="600" style={styles.sectionTitle}>
                Hardware Condition
              </AppText>
              <View style={styles.chipRow}>
                {conditionOptions.map((opt) => {
                  const selected = tempCondition === opt.id;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      activeOpacity={0.75}
                      onPress={() => setTempCondition(opt.id)}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: selected
                            ? theme.colors.tint
                            : theme.colors.secondaryBackground,
                          borderColor: selected
                            ? theme.colors.tint
                            : theme.colors.separator,
                          borderWidth: theme.hairlineWidth,
                          borderRadius: theme.radii.full,
                        },
                      ]}
                    >
                      <AppText
                        variant="footnote"
                        weight={selected ? '600' : '500'}
                        customColor={selected ? '#FFFFFF' : theme.colors.labelPrimary}
                      >
                        {opt.label}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <AppSeparator verticalMargin={14} />

            {/* Sort Section */}
            <View style={styles.section}>
              <AppText variant="headline" weight="600" style={styles.sectionTitle}>
                Sort By
              </AppText>
              <View style={styles.chipRow}>
                {sortOptions.map((opt) => {
                  const selected = tempSort === opt.id;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      activeOpacity={0.75}
                      onPress={() => setTempSort(opt.id)}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: selected
                            ? theme.colors.tint
                            : theme.colors.secondaryBackground,
                          borderColor: selected
                            ? theme.colors.tint
                            : theme.colors.separator,
                          borderWidth: theme.hairlineWidth,
                          borderRadius: theme.radii.full,
                        },
                      ]}
                    >
                      <AppText
                        variant="footnote"
                        weight={selected ? '600' : '500'}
                        customColor={selected ? '#FFFFFF' : theme.colors.labelPrimary}
                      >
                        {opt.label}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <AppSeparator verticalMargin={14} />

            {/* Free items toggle */}
            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <AppText variant="headline" weight="600">
                  Only Free / Community Giveaways
                </AppText>
                <AppText variant="caption1" color="secondary">
                  Filter for e-waste drop-offs and $0 items
                </AppText>
              </View>
              <Switch
                value={tempOnlyFree}
                onValueChange={setTempOnlyFree}
                trackColor={{ false: theme.colors.fill, true: theme.colors.tint }}
                thumbColor="#FFFFFF"
              />
            </View>
          </ScrollView>

          {/* Action buttons */}
          <View style={styles.footerRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <AppButton
                label="Reset All"
                variant="gray"
                size="large"
                fullWidth
                onPress={handleReset}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <AppButton
                label="Apply"
                variant="filled"
                size="large"
                fullWidth
                onPress={handleApply}
              />
            </View>
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
    paddingVertical: 6,
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
    marginBottom: 6,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    marginTop: 6,
  },
  section: {
    marginBottom: 4,
  },
  sectionTitle: {
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    marginBottom: 16,
  },
  footerRow: {
    flexDirection: 'row',
    paddingTop: 12,
  },
});
