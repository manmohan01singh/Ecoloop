import React from 'react';
import {
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Switch,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useAppTheme } from '../../../design-system/theme/theme';
import { AppText } from '../../../components/ui/AppText';
import { AppIcon } from '../../../components/ui/AppIcon';
import { AppButton } from '../../../components/ui/AppButton';
import { AppSeparator } from '../../../components/ui/AppSeparator';
import { PostFormData, PostFormErrors } from '../types/post.types';
import { calculateEstimatedCo2 } from '../services/postDeviceService';

export interface PostReviewStepProps {
  formData: PostFormData;
  submitting: boolean;
  errors: PostFormErrors;
  onChangeField: <K extends keyof PostFormData>(field: K, value: PostFormData[K]) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export const PostReviewStep: React.FC<PostReviewStepProps> = ({
  formData,
  submitting,
  errors,
  onChangeField,
  onSubmit,
  onBack,
}) => {
  const theme = useAppTheme();
  const estimatedCo2 = calculateEstimatedCo2(formData.category, formData.action);

  const getActionTheme = () => {
    switch (formData.action) {
      case 'repair':
        return {
          tint: theme.colors.actionRepair.tint,
          bg: theme.colors.actionRepair.background,
          label: 'Repair Diagnostics',
        };
      case 'recycle':
        return {
          tint: theme.colors.actionRecycle.tint,
          bg: theme.colors.actionRecycle.background,
          label: 'E-Waste Recovery',
        };
      case 'sell':
      default:
        return {
          tint: theme.colors.actionSell.tint,
          bg: theme.colors.actionSell.background,
          label: 'Marketplace Resale',
        };
    }
  };

  const actionTheme = getActionTheme();
  const primaryPhoto = formData.photos[0]?.uri;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.headerTextGroup}>
          <AppText variant="title3" weight="700">
            Review your posting
          </AppText>
          <AppText variant="subheadline" color="secondary" style={styles.subtitle}>
            Verify specifications before publishing to the Circuvio circular network.
          </AppText>
        </View>

        {/* Overview Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.secondaryBackground,
              borderColor: theme.colors.separator,
              borderWidth: theme.hairlineWidth,
              borderRadius: theme.radii.lg,
              ...theme.shadows.card,
            },
          ]}
        >
          {/* Photos row */}
          {primaryPhoto ? (
            <View style={styles.photoRow}>
              <Image source={{ uri: primaryPhoto }} style={styles.primaryThumb} />
              <View style={styles.photosMeta}>
                <AppText variant="subheadline" weight="600">
                  {formData.photos.length} Photo{formData.photos.length > 1 ? 's' : ''} Attached
                </AppText>
                <AppText variant="caption1" color="secondary" style={{ marginTop: 2 }}>
                  Primary cover selected
                </AppText>
              </View>
            </View>
          ) : null}

          <AppSeparator verticalMargin={12} />

          {/* Pathway Pill */}
          <View style={styles.pathwayRow}>
            <View
              style={[
                styles.actionBadge,
                { backgroundColor: actionTheme.bg },
              ]}
            >
              <AppText
                variant="caption2"
                weight="700"
                customColor={actionTheme.tint}
              >
                {actionTheme.label.toUpperCase()}
              </AppText>
            </View>

            <AppText variant="caption1" color="secondary">
              📍 {formData.city || 'Metro Vancouver'}
            </AppText>
          </View>

          {/* Title & Condition */}
          <AppText variant="title3" weight="700" style={styles.title}>
            {formData.title}
          </AppText>

          <View style={styles.metaChipsRow}>
            <View
              style={[
                styles.specChip,
                { backgroundColor: theme.colors.fillSecondary },
              ]}
            >
              <AppText variant="caption2" weight="600" color="secondary">
                Category: {formData.category.toUpperCase()}
              </AppText>
            </View>
            <View
              style={[
                styles.specChip,
                { backgroundColor: theme.colors.fillSecondary },
              ]}
            >
              <AppText variant="caption2" weight="600" color="secondary">
                Condition: {formData.condition.toUpperCase()}
              </AppText>
            </View>
            {formData.brand ? (
              <View
                style={[
                  styles.specChip,
                  { backgroundColor: theme.colors.fillSecondary },
                ]}
              >
                <AppText variant="caption2" weight="600" color="secondary">
                  Brand: {formData.brand}
                </AppText>
              </View>
            ) : null}
            {formData.model ? (
              <View
                style={[
                  styles.specChip,
                  { backgroundColor: theme.colors.fillSecondary },
                ]}
              >
                <AppText variant="caption2" weight="600" color="secondary">
                  Model: {formData.model}
                </AppText>
              </View>
            ) : null}
          </View>

          {/* Action Specific Summary Details */}
          <AppSeparator verticalMargin={12} />

          {formData.action === 'sell' ? (
            <View style={styles.actionDetailsList}>
              <View style={styles.detailRow}>
                <AppText variant="subheadline" color="secondary">
                  Listing Price:
                </AppText>
                <AppText variant="headline" weight="700" customColor={theme.colors.tint}>
                  {formData.isFree ? 'Free Giveaway ($0)' : `$${formData.price}`}
                </AppText>
              </View>
              <View style={[styles.detailRow, { marginTop: 6 }]}>
                <AppText variant="subheadline" color="secondary">
                  Pickup / Delivery:
                </AppText>
                <AppText variant="subheadline" weight="600">
                  {formData.pickupType === 'both' ? 'Pickup & Meetup' : formData.pickupType === 'pickup' ? 'Local Pickup' : 'Shipping'}
                </AppText>
              </View>
              {formData.warrantyDays ? (
                <View style={[styles.detailRow, { marginTop: 6 }]}>
                  <AppText variant="subheadline" color="secondary">
                    Verification Guarantee:
                  </AppText>
                  <AppText variant="subheadline" weight="600">
                    {formData.warrantyDays} Days
                  </AppText>
                </View>
              ) : null}
            </View>
          ) : formData.action === 'repair' ? (
            <View style={styles.actionDetailsList}>
              <View style={styles.detailRow}>
                <AppText variant="subheadline" color="secondary">
                  Issue Category:
                </AppText>
                <AppText variant="subheadline" weight="600" customColor={theme.colors.actionRepair.tint}>
                  {formData.issueType}
                </AppText>
              </View>
              <View style={[styles.detailRow, { marginTop: 6 }]}>
                <AppText variant="subheadline" color="secondary">
                  Service Urgency:
                </AppText>
                <AppText variant="subheadline" weight="600">
                  {formData.repairUrgency === 'urgent' ? 'Urgent (24-48h)' : 'Standard (3-5 days)'}
                </AppText>
              </View>
              {formData.issueDetails ? (
                <View style={{ marginTop: 6 }}>
                  <AppText variant="caption1" color="secondary">
                    Symptoms: {formData.issueDetails}
                  </AppText>
                </View>
              ) : null}
            </View>
          ) : (
            <View style={styles.actionDetailsList}>
              <View style={styles.detailRow}>
                <AppText variant="subheadline" color="secondary">
                  Recovery Disposition:
                </AppText>
                <AppText variant="subheadline" weight="600" customColor={theme.colors.actionRecycle.tint}>
                  {formData.disposalReason}
                </AppText>
              </View>
              <View style={[styles.detailRow, { marginTop: 6 }]}>
                <AppText variant="subheadline" color="secondary">
                  Data Destruction:
                </AppText>
                <AppText variant="subheadline" weight="600">
                  {formData.certificateRequested ? 'Certificate Requested' : 'Standard Wipe'}
                </AppText>
              </View>
              {formData.hasSwollenBattery ? (
                <View style={[styles.detailRow, { marginTop: 6 }]}>
                  <AppText variant="subheadline" customColor={theme.colors.warning}>
                    Battery Warning:
                  </AppText>
                  <AppText variant="subheadline" weight="700" customColor={theme.colors.warning}>
                    Hazard Container Required
                  </AppText>
                </View>
              ) : null}
            </View>
          )}

          {formData.description ? (
            <View style={{ marginTop: 10 }}>
              <AppText variant="caption1" color="secondary" numberOfLines={2}>
                "{formData.description}"
              </AppText>
            </View>
          ) : null}
        </View>

        {/* Environmental Impact Estimation Card */}
        <View
          style={[
            styles.co2Card,
            {
              backgroundColor: theme.colors.fillSecondary,
              borderColor: theme.colors.separator,
              borderWidth: theme.hairlineWidth,
              borderRadius: theme.radii.lg,
            },
          ]}
        >
          <View
            style={[
              styles.co2IconCircle,
              { backgroundColor: theme.colors.tint },
            ]}
          >
            <AppIcon name="leaf" size={20} color={theme.isDark ? '#000000' : '#FFFFFF'} />
          </View>
          <View style={{ flex: 1 }}>
            <AppText variant="subheadline" weight="700" customColor={theme.colors.tint}>
              Estimated Environmental Diversion
            </AppText>
            <AppText variant="title3" weight="700" style={{ marginTop: 2 }}>
              ~{estimatedCo2} kg CO₂ Prevented
            </AppText>
            <AppText variant="caption2" color="secondary" style={{ marginTop: 2, lineHeight: 16 }}>
              Circular reuse keeps toxic lithium and circuit e-waste out of municipal landfills.
            </AppText>
          </View>
        </View>

        {/* Legal & Accuracy Declaration Toggle */}
        <View
          style={[
            styles.declarationCard,
            {
              backgroundColor: theme.colors.secondaryBackground,
              borderColor: errors.confirmedAccurate
                ? theme.colors.destructive
                : theme.colors.separator,
              borderWidth: errors.confirmedAccurate ? 1.5 : theme.hairlineWidth,
              borderRadius: theme.radii.md,
            },
          ]}
        >
          <View style={styles.declarationRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <AppText variant="subheadline" weight="600">
                Confirm Ownership & Accuracy *
              </AppText>
              <AppText variant="caption2" color="secondary" style={{ marginTop: 2, lineHeight: 16 }}>
                I confirm I legally possess this device and all details, photos, and faults represent its real state.
              </AppText>
            </View>
            <Switch
              value={formData.confirmedAccurate}
              onValueChange={(val) => onChangeField('confirmedAccurate', val)}
              trackColor={{ false: theme.colors.fill, true: theme.colors.tint }}
              thumbColor="#FFFFFF"
            />
          </View>

          {errors.confirmedAccurate ? (
            <AppText
              variant="caption2"
              weight="600"
              customColor={theme.colors.destructive}
              style={{ marginTop: 6 }}
            >
              {errors.confirmedAccurate}
            </AppText>
          ) : null}
        </View>
      </ScrollView>

      {/* Footer Submit Button */}
      <View style={styles.footer}>
        <AppButton
          label={submitting ? 'Submitting to Circuvio...' : 'Confirm & Post Device'}
          variant="filled"
          size="large"
          fullWidth
          loading={submitting}
          disabled={submitting}
          icon="paper-plane-outline"
          iconPosition="right"
          onPress={onSubmit}
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
  card: {
    padding: 16,
    marginBottom: 14,
  },
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  primaryThumb: {
    width: 64,
    height: 64,
    borderRadius: 10,
    marginRight: 12,
  },
  photosMeta: {
    flex: 1,
  },
  pathwayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  actionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  title: {
    marginBottom: 8,
  },
  metaChipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  specChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionDetailsList: {
    width: '100%',
  },
  co2Card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    marginBottom: 14,
  },
  co2IconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  declarationCard: {
    padding: 14,
    marginBottom: 16,
  },
  declarationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footer: {
    paddingVertical: 12,
  },
});
