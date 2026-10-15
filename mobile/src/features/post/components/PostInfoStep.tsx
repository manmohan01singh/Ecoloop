import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useAppTheme } from '../../../design-system/theme/theme';
import { AppText } from '../../../components/ui/AppText';
import { AppIcon, IconName } from '../../../components/ui/AppIcon';
import { AppTextInput } from '../../../components/ui/AppTextInput';
import { AppButton } from '../../../components/ui/AppButton';
import { PostFormData, PostFormErrors } from '../types/post.types';
import { ExploreCategory, DeviceCondition } from '../../explore/types/explore.types';

export interface PostInfoStepProps {
  formData: PostFormData;
  errors: PostFormErrors;
  onChangeField: <K extends keyof PostFormData>(field: K, value: PostFormData[K]) => void;
  onNext: () => void;
}

const CATEGORY_CHOICES: { id: ExploreCategory; label: string; icon: IconName }[] = [
  { id: 'smartphone', label: 'Smartphone', icon: 'phone-portrait-outline' },
  { id: 'laptop', label: 'Laptop', icon: 'laptop-outline' },
  { id: 'tablet', label: 'Tablet', icon: 'tablet-portrait-outline' },
  { id: 'audio', label: 'Audio', icon: 'headset-outline' },
  { id: 'gaming', label: 'Gaming', icon: 'game-controller-outline' },
  { id: 'parts', label: 'Components', icon: 'hardware-chip-outline' },
  { id: 'wearable', label: 'Wearable', icon: 'watch-outline' },
  { id: 'other', label: 'Other', icon: 'cube-outline' },
];

const CONDITION_CHOICES: {
  id: DeviceCondition;
  title: string;
  detail: string;
}[] = [
  {
    id: 'like_new',
    title: 'Like New (Pristine)',
    detail: 'Flawless condition, original performance, zero scratches.',
  },
  {
    id: 'good',
    title: 'Good (Minor wear)',
    detail: 'Fully operational, light chassis scuffs or hairline glass marks.',
  },
  {
    id: 'fair',
    title: 'Fair (Visible wear)',
    detail: 'Works fine, noticeable scratches, worn buttons or battery drain.',
  },
  {
    id: 'for_parts',
    title: 'For Parts / Damaged',
    detail: 'Cracked display, non-booting logic board, or material salvage.',
  },
];

export const PostInfoStep: React.FC<PostInfoStepProps> = ({
  formData,
  errors,
  onChangeField,
  onNext,
}) => {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerTextGroup}>
          <AppText variant="title3" weight="700">
            Device specifications
          </AppText>
          <AppText variant="subheadline" color="secondary" style={styles.subtitle}>
            Enter accurate details about the hardware model, cosmetic condition, and functional state.
          </AppText>
        </View>

        {/* Category Selector */}
        <View style={styles.fieldSection}>
          <AppText variant="subheadline" weight="600" style={styles.label}>
            Device Category *
          </AppText>
          <View style={styles.categoriesGrid}>
            {CATEGORY_CHOICES.map((cat) => {
              const selected = formData.category === cat.id;

              return (
                <TouchableOpacity
                  key={cat.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={cat.label}
                  activeOpacity={0.7}
                  onPress={() => onChangeField('category', cat.id)}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: selected
                        ? theme.colors.tint
                        : theme.colors.secondaryBackground,
                      borderColor: selected
                        ? theme.colors.tint
                        : theme.colors.separator,
                      borderWidth: theme.hairlineWidth,
                      borderRadius: theme.radii.md,
                    },
                  ]}
                >
                  <AppIcon
                    name={cat.icon}
                    size={16}
                    color={selected ? (theme.isDark ? '#000000' : '#FFFFFF') : theme.colors.labelSecondary}
                    style={{ marginRight: 6 }}
                  />
                  <AppText
                    variant="footnote"
                    weight={selected ? '600' : '500'}
                    customColor={selected ? (theme.isDark ? '#000000' : '#FFFFFF') : theme.colors.labelPrimary}
                  >
                    {cat.label}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Listing Title */}
        <AppTextInput
          label="Listing Title"
          required
          placeholder="e.g. iPhone 13 Pro 128GB Sierra Blue"
          value={formData.title}
          onChangeText={(val) => onChangeField('title', val)}
          errorMessage={errors.title}
          helperText="Include model and key specs for faster circular matching"
          showClearButton
        />

        {/* Brand & Model Row */}
        <View style={styles.twoColumnRow}>
          <View style={{ flex: 1, marginRight: 6 }}>
            <AppTextInput
              label="Brand / Manufacturer"
              placeholder="e.g. Apple, Dell"
              value={formData.brand}
              onChangeText={(val) => onChangeField('brand', val)}
            />
          </View>
          <View style={{ flex: 1, marginLeft: 6 }}>
            <AppTextInput
              label="Model Number / Year"
              placeholder="e.g. A2638 (2021)"
              value={formData.model}
              onChangeText={(val) => onChangeField('model', val)}
            />
          </View>
        </View>

        {/* Hardware Condition Selector */}
        <View style={styles.fieldSection}>
          <AppText variant="subheadline" weight="600" style={styles.label}>
            Hardware Condition *
          </AppText>
          <View style={styles.conditionsList}>
            {CONDITION_CHOICES.map((cond) => {
              const selected = formData.condition === cond.id;

              return (
                <TouchableOpacity
                  key={cond.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={cond.title}
                  activeOpacity={0.75}
                  onPress={() => onChangeField('condition', cond.id)}
                  style={[
                    styles.conditionOptionCard,
                    {
                      backgroundColor: selected
                        ? theme.colors.fillSecondary
                        : theme.colors.secondaryBackground,
                      borderColor: selected
                        ? theme.colors.tint
                        : theme.colors.separator,
                      borderWidth: selected ? 1.5 : theme.hairlineWidth,
                      borderRadius: theme.radii.md,
                    },
                  ]}
                >
                  <View style={styles.conditionRadio}>
                    <View
                      style={[
                        styles.radioOuter,
                        {
                          borderColor: selected
                            ? theme.colors.tint
                            : theme.colors.labelTertiary,
                        },
                      ]}
                    >
                      {selected ? (
                        <View
                          style={[
                            styles.radioInner,
                            { backgroundColor: theme.colors.tint },
                          ]}
                        />
                      ) : null}
                    </View>
                  </View>

                  <View style={{ flex: 1 }}>
                    <AppText
                      variant="subheadline"
                      weight="600"
                      customColor={selected ? theme.colors.tint : theme.colors.labelPrimary}
                    >
                      {cond.title}
                    </AppText>
                    <AppText
                      variant="caption1"
                      color="secondary"
                      style={{ marginTop: 2, lineHeight: 16 }}
                    >
                      {cond.detail}
                    </AppText>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Description */}
        <AppTextInput
          label="Detailed Description & Operational Notes"
          placeholder="Describe battery health, accessories included, original packaging, known cosmetic blemishes, or any functional issues..."
          value={formData.description}
          onChangeText={(val) => onChangeField('description', val)}
          multiline
          numberOfLines={4}
          helperText="Accurate descriptions prevent circular transaction disputes"
        />

        {/* City Location */}
        <AppTextInput
          label="Location / City"
          required
          placeholder="e.g. Vancouver, Burnaby"
          value={formData.city}
          onChangeText={(val) => onChangeField('city', val)}
          errorMessage={errors.city}
          prefix="📍"
        />
      </ScrollView>

      {/* Footer Next Button */}
      <View style={styles.footer}>
        <AppButton
          label="Next: Select Intended Action"
          variant="filled"
          size="large"
          fullWidth
          onPress={onNext}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scroll: {
    paddingBottom: 20,
  },
  headerTextGroup: {
    marginBottom: 16,
  },
  subtitle: {
    marginTop: 4,
    lineHeight: 20,
  },
  fieldSection: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  twoColumnRow: {
    flexDirection: 'row',
  },
  conditionsList: {
    gap: 8,
  },
  conditionOptionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
  },
  conditionRadio: {
    marginRight: 10,
    marginTop: 2,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  footer: {
    paddingVertical: 12,
  },
});
