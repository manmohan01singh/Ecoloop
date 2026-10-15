import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
} from 'react-native';
import { useAppTheme } from '../../../design-system/theme/theme';
import { AppText } from '../../../components/ui/AppText';
import { AppIcon, IconName } from '../../../components/ui/AppIcon';
import { AppTextInput } from '../../../components/ui/AppTextInput';
import { AppButton } from '../../../components/ui/AppButton';
import { PostFormData, PostFormErrors, DeviceActionType } from '../types/post.types';

export interface PostActionStepProps {
  formData: PostFormData;
  errors: PostFormErrors;
  onChangeField: <K extends keyof PostFormData>(field: K, value: PostFormData[K]) => void;
  onNext: () => void;
}

const ACTION_TABS: {
  id: DeviceActionType;
  title: string;
  tagline: string;
  icon: IconName;
  tintKey: 'actionSell' | 'actionRepair' | 'actionRecycle';
}[] = [
  {
    id: 'sell',
    title: 'Sell',
    tagline: 'Marketplace Resale',
    icon: 'pricetag',
    tintKey: 'actionSell',
  },
  {
    id: 'repair',
    title: 'Repair',
    tagline: 'Specialist Diagnostics',
    icon: 'construct',
    tintKey: 'actionRepair',
  },
  {
    id: 'recycle',
    title: 'Recycle',
    tagline: 'Clean E-Waste Recovery',
    icon: 'sync',
    tintKey: 'actionRecycle',
  },
];

const REPAIR_ISSUES = [
  'Cracked Screen / OLED',
  'Rapid Battery Drain',
  'Charging Port / No Power',
  'Liquid / Water Ingress',
  'Logic Board / Boot Loop',
  'Microphone / Speaker Failure',
  'Other Functional Issue',
];

const RECYCLE_REASONS = [
  'End of hardware operating life',
  'Severe unrepairable board failure',
  'Component salvage only',
  'Obsolete outdated standard',
];

export const PostActionStep: React.FC<PostActionStepProps> = ({
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
            Select intended pathway
          </AppText>
          <AppText variant="subheadline" color="secondary" style={styles.subtitle}>
            Choose whether to sell, request professional repairs, or responsibly recycle this device.
          </AppText>
        </View>

        {/* 3 Pathway Cards */}
        <View style={styles.actionCardsRow}>
          {ACTION_TABS.map((tab) => {
            const isSelected = formData.action === tab.id;
            const actionColor = theme.colors[tab.tintKey];

            return (
              <TouchableOpacity
                key={tab.id}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={tab.title}
                activeOpacity={0.8}
                onPress={() => onChangeField('action', tab.id)}
                style={[
                  styles.actionCard,
                  {
                    backgroundColor: isSelected
                      ? actionColor.background
                      : theme.colors.secondaryBackground,
                    borderColor: isSelected
                      ? actionColor.tint
                      : theme.colors.separator,
                    borderWidth: isSelected ? 2 : theme.hairlineWidth,
                    borderRadius: theme.radii.lg,
                    ...(isSelected
                      ? theme.shadows.subtle
                      : theme.shadows.card),
                  },
                ]}
              >
                <View
                  style={[
                    styles.actionIconCircle,
                    {
                      backgroundColor: isSelected
                        ? actionColor.tint
                        : theme.colors.fill,
                    },
                  ]}
                >
                  <AppIcon
                    name={tab.icon}
                    size={20}
                    color={isSelected ? (theme.isDark ? '#000000' : '#FFFFFF') : theme.colors.labelSecondary}
                  />
                </View>

                <AppText
                  variant="headline"
                  weight="700"
                  customColor={isSelected ? actionColor.badgeText : theme.colors.labelPrimary}
                  style={{ marginTop: 6 }}
                >
                  {tab.title}
                </AppText>

                <AppText
                  variant="caption2"
                  color="secondary"
                  align="center"
                  style={{ marginTop: 2 }}
                >
                  {tab.tagline}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ---------------- PATHWAY A: SELL ---------------- */}
        {formData.action === 'sell' ? (
          <View
            style={[
              styles.specificsBox,
              {
                backgroundColor: theme.colors.secondaryBackground,
                borderColor: theme.colors.separator,
                borderWidth: theme.hairlineWidth,
                borderRadius: theme.radii.lg,
                ...theme.shadows.card,
              },
            ]}
          >
            <View style={styles.pathwayHeaderRow}>
              <View
                style={[
                  styles.pathwayBadge,
                  { backgroundColor: theme.colors.actionSell.background },
                ]}
              >
                <AppText
                  variant="caption2"
                  weight="700"
                  customColor={theme.colors.actionSell.tint}
                >
                  RESALE CONFIGURATION
                </AppText>
              </View>
            </View>

            {/* Free giveaway toggle */}
            <View style={styles.toggleRow}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <AppText variant="headline" weight="600">
                  Community Giveaway / Free
                </AppText>
                <AppText variant="caption1" color="secondary">
                  Pass working gear forward without charge
                </AppText>
              </View>
              <Switch
                value={formData.isFree}
                onValueChange={(val) => {
                  onChangeField('isFree', val);
                  if (val) {
                    onChangeField('price', '0');
                  } else if (formData.price === '0') {
                    onChangeField('price', '');
                  }
                }}
                trackColor={{ false: theme.colors.fill, true: theme.colors.tint }}
                thumbColor="#FFFFFF"
              />
            </View>

            {!formData.isFree ? (
              <View style={styles.twoColumnRow}>
                <View style={{ flex: 1, marginRight: 6 }}>
                  <AppTextInput
                    label="Asking Price"
                    required
                    placeholder="e.g. 350"
                    value={formData.price}
                    onChangeText={(val) => onChangeField('price', val)}
                    keyboardType="numeric"
                    prefix="$"
                    errorMessage={errors.price}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 6 }}>
                  <AppTextInput
                    label="Original MSRP"
                    placeholder="e.g. 899"
                    value={formData.originalPrice}
                    onChangeText={(val) => onChangeField('originalPrice', val)}
                    keyboardType="numeric"
                    prefix="$"
                    helperText="Optional reference"
                  />
                </View>
              </View>
            ) : null}

            {/* Pickup Format */}
            <View style={styles.fieldSection}>
              <AppText variant="subheadline" weight="600" style={styles.fieldLabel}>
                Delivery / Pickup Method
              </AppText>
              <View style={styles.radioChipsRow}>
                {(['both', 'pickup', 'shipping'] as const).map((method) => {
                  const sel = formData.pickupType === method;
                  return (
                    <TouchableOpacity
                      key={method}
                      activeOpacity={0.75}
                      onPress={() => onChangeField('pickupType', method)}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: sel
                            ? theme.colors.actionSell.tint
                            : theme.colors.fill,
                          borderRadius: theme.radii.full,
                        },
                      ]}
                    >
                      <AppText
                        variant="footnote"
                        weight={sel ? '600' : '500'}
                        customColor={sel ? (theme.isDark ? '#000000' : '#FFFFFF') : theme.colors.labelPrimary}
                      >
                        {method === 'both' ? 'Both Pickup & Meetup' : method === 'pickup' ? 'Local Pickup Only' : 'Shipping'}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <AppTextInput
              label="Testing / Inspection Guarantee (Days)"
              placeholder="e.g. 14, 30"
              value={formData.warrantyDays}
              onChangeText={(val) => onChangeField('warrantyDays', val)}
              keyboardType="numeric"
              suffix="days"
              helperText="Offers buyer peace of mind for functional verification"
            />
          </View>
        ) : null}

        {/* ---------------- PATHWAY B: REPAIR ---------------- */}
        {formData.action === 'repair' ? (
          <View
            style={[
              styles.specificsBox,
              {
                backgroundColor: theme.colors.secondaryBackground,
                borderColor: theme.colors.separator,
                borderWidth: theme.hairlineWidth,
                borderRadius: theme.radii.lg,
                ...theme.shadows.card,
              },
            ]}
          >
            <View style={styles.pathwayHeaderRow}>
              <View
                style={[
                  styles.pathwayBadge,
                  { backgroundColor: theme.colors.actionRepair.background },
                ]}
              >
                <AppText
                  variant="caption2"
                  weight="700"
                  customColor={theme.colors.actionRepair.tint}
                >
                  DIAGNOSTIC SERVICE REQUEST
                </AppText>
              </View>
            </View>

            {/* Issue Category Chips */}
            <View style={styles.fieldSection}>
              <AppText variant="subheadline" weight="600" style={styles.fieldLabel}>
                Primary Fault Category *
              </AppText>
              <View style={styles.radioChipsRow}>
                {REPAIR_ISSUES.map((issue) => {
                  const sel = formData.issueType === issue;
                  return (
                    <TouchableOpacity
                      key={issue}
                      activeOpacity={0.75}
                      onPress={() => onChangeField('issueType', issue)}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: sel
                            ? theme.colors.actionRepair.tint
                            : theme.colors.fill,
                          borderRadius: theme.radii.full,
                        },
                      ]}
                    >
                      <AppText
                        variant="footnote"
                        weight={sel ? '600' : '500'}
                        customColor={sel ? (theme.isDark ? '#000000' : '#FFFFFF') : theme.colors.labelPrimary}
                      >
                        {issue}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <AppTextInput
              label="Diagnostic Symptoms & Fault History"
              required
              placeholder="Describe when the issue started, whether liquid was spilled, or error messages displayed..."
              value={formData.issueDetails}
              onChangeText={(val) => onChangeField('issueDetails', val)}
              multiline
              numberOfLines={3}
              errorMessage={errors.issueDetails}
            />

            {/* Repair Urgency */}
            <View style={styles.fieldSection}>
              <AppText variant="subheadline" weight="600" style={styles.fieldLabel}>
                Service Urgency
              </AppText>
              <View style={styles.radioChipsRow}>
                {[
                  { id: 'standard', label: 'Standard (3-5 Business Days)' },
                  { id: 'urgent', label: 'Urgent (24-48 Hours Priority)' },
                ].map((u) => {
                  const sel = formData.repairUrgency === u.id;
                  return (
                    <TouchableOpacity
                      key={u.id}
                      activeOpacity={0.75}
                      onPress={() => onChangeField('repairUrgency', u.id as any)}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: sel
                            ? theme.colors.actionRepair.tint
                            : theme.colors.fill,
                          borderRadius: theme.radii.full,
                        },
                      ]}
                    >
                      <AppText
                        variant="footnote"
                        weight={sel ? '600' : '500'}
                        customColor={sel ? (theme.isDark ? '#000000' : '#FFFFFF') : theme.colors.labelPrimary}
                      >
                        {u.label}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        ) : null}

        {/* ---------------- PATHWAY C: RECYCLE ---------------- */}
        {formData.action === 'recycle' ? (
          <View
            style={[
              styles.specificsBox,
              {
                backgroundColor: theme.colors.secondaryBackground,
                borderColor: theme.colors.separator,
                borderWidth: theme.hairlineWidth,
                borderRadius: theme.radii.lg,
                ...theme.shadows.card,
              },
            ]}
          >
            <View style={styles.pathwayHeaderRow}>
              <View
                style={[
                  styles.pathwayBadge,
                  { backgroundColor: theme.colors.actionRecycle.background },
                ]}
              >
                <AppText
                  variant="caption2"
                  weight="700"
                  customColor={theme.colors.actionRecycle.tint}
                >
                  RESPONSIBLE E-WASTE RECOVERY
                </AppText>
              </View>
            </View>

            {/* Recycle Reason */}
            <View style={styles.fieldSection}>
              <AppText variant="subheadline" weight="600" style={styles.fieldLabel}>
                Recovery Disposition
              </AppText>
              <View style={styles.radioChipsRow}>
                {RECYCLE_REASONS.map((reason) => {
                  const sel = formData.disposalReason === reason;
                  return (
                    <TouchableOpacity
                      key={reason}
                      activeOpacity={0.75}
                      onPress={() => onChangeField('disposalReason', reason)}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: sel
                            ? theme.colors.actionRecycle.tint
                            : theme.colors.fill,
                          borderRadius: theme.radii.full,
                        },
                      ]}
                    >
                      <AppText
                        variant="footnote"
                        weight={sel ? '600' : '500'}
                        customColor={sel ? (theme.isDark ? '#000000' : '#FFFFFF') : theme.colors.labelPrimary}
                      >
                        {reason}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Certified Data Destruction Toggle */}
            <View style={styles.toggleRow}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <AppText variant="headline" weight="600">
                  Certified Data Destruction
                </AppText>
                <AppText variant="caption1" color="secondary">
                  Request digital certificate of secure storage wipe/destruction
                </AppText>
              </View>
              <Switch
                value={formData.certificateRequested}
                onValueChange={(val) => onChangeField('certificateRequested', val)}
                trackColor={{ false: theme.colors.fill, true: theme.colors.tint }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Swollen battery safety flag */}
            <View style={styles.toggleRow}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <AppText variant="headline" weight="600" customColor={theme.colors.warning}>
                  Swollen / Damaged Lithium Battery
                </AppText>
                <AppText variant="caption1" color="secondary">
                  Flags hazardous material container requirement at depot
                </AppText>
              </View>
              <Switch
                value={formData.hasSwollenBattery}
                onValueChange={(val) => onChangeField('hasSwollenBattery', val)}
                trackColor={{ false: theme.colors.fill, true: theme.colors.warning }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        ) : null}
      </ScrollView>

      {/* Footer Next Button */}
      <View style={styles.footer}>
        <AppButton
          label="Next: Review Listing"
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
  actionCardsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  actionCard: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  specificsBox: {
    padding: 16,
    marginBottom: 16,
  },
  pathwayHeaderRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  pathwayBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginBottom: 12,
  },
  twoColumnRow: {
    flexDirection: 'row',
  },
  fieldSection: {
    marginBottom: 14,
  },
  fieldLabel: {
    marginBottom: 8,
  },
  radioChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  footer: {
    paddingVertical: 12,
  },
});
