import React, { useState } from 'react';
import {
  View,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../../design-system/theme/theme';
import { AppText } from '../../../components/ui/AppText';
import { AppIcon } from '../../../components/ui/AppIcon';
import { AppButton } from '../../../components/ui/AppButton';
import { AppTextInput } from '../../../components/ui/AppTextInput';
import { AppSeparator } from '../../../components/ui/AppSeparator';
import { submitProviderApplication } from '../../../services/database/workspaceRepositories';
import { useAuth } from '../../../services/auth/AuthContext';

export interface ProviderApplicationModalProps {
  visible: boolean;
  onClose: () => void;
  initialType?: 'repair_pro' | 'recycler' | 'business';
}

const CATEGORY_CHOICES = [
  { id: 'smartphone', label: 'Smartphones' },
  { id: 'laptop', label: 'Laptops & MacBooks' },
  { id: 'tablet', label: 'Tablets & iPads' },
  { id: 'audio', label: 'Audio & Headphones' },
  { id: 'gaming', label: 'Gaming Consoles' },
  { id: 'parts', label: 'Component Harvesting' },
];

export const ProviderApplicationModal: React.FC<ProviderApplicationModalProps> = ({
  visible,
  onClose,
  initialType = 'repair_pro',
}) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuth();

  const [appType, setAppType] = useState<'repair_pro' | 'recycler' | 'business'>(initialType);
  const [businessName, setBusinessName] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [serviceArea, setServiceArea] = useState('Metro Vancouver');
  const [selectedCats, setSelectedCats] = useState<string[]>(['smartphone', 'laptop']);
  const [docUrl, setDocUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const toggleCategory = (id: string) => {
    setSelectedCats((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    if (!user?.id) {
      Alert.alert('Sign In Required', 'Please sign in to submit a verified provider application.');
      return;
    }

    if (!businessName.trim() || !regNumber.trim()) {
      Alert.alert('Required Fields', 'Please enter your business legal name and registration/tax number.');
      return;
    }

    setIsSubmitting(true);
    const result = submitProviderApplication({
      userId: user.id,
      applicationType: appType,
      businessName: businessName.trim(),
      registrationNumber: regNumber.trim(),
      categories: selectedCats,
      serviceArea: serviceArea.trim(),
      documentationUrls: docUrl.trim() ? [docUrl.trim()] : [],
    });
    setIsSubmitting(false);

    if (result.success) {
      setIsSuccess(true);
    } else {
      Alert.alert('Submission Error', result.error || 'Could not submit application.');
    }
  };

  const handleCloseAndReset = () => {
    setIsSuccess(false);
    setBusinessName('');
    setRegNumber('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleCloseAndReset}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              borderBottomColor: theme.colors.separator,
              borderBottomWidth: theme.hairlineWidth,
              backgroundColor: theme.colors.secondaryBackground,
            },
          ]}
        >
          <TouchableOpacity onPress={handleCloseAndReset} style={styles.closeBtn}>
            <AppIcon name="close" size={22} color={theme.colors.labelSecondary} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <AppText variant="headline" weight="700">
              Become a Verified Partner
            </AppText>
            <AppText variant="caption2" color="secondary">
              Professional Onboarding
            </AppText>
          </View>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}>
          {isSuccess ? (
            <View style={styles.successContainer}>
              <View
                style={[
                  styles.successIconCircle,
                  {
                    backgroundColor: theme.isDark ? 'rgba(16, 185, 129, 0.20)' : 'rgba(0, 122, 94, 0.12)',
                  },
                ]}
              >
                <AppIcon name="checkmark-circle" size={48} color={theme.colors.tint} />
              </View>

              <AppText variant="title2" weight="700" style={{ marginTop: 16 }}>
                Application Submitted!
              </AppText>
              <AppText variant="subheadline" color="secondary" style={styles.successDesc}>
                Your application for <AppText weight="700">{businessName}</AppText> has been queued for verification review. You will receive an in-app notice once authorized.
              </AppText>

              <AppButton title="Done" onPress={handleCloseAndReset} style={{ marginTop: 24, width: '100%' }} />
            </View>
          ) : (
            <>
              {/* Type Selector */}
              <AppText variant="title3" weight="700">
                Choose Partner Track
              </AppText>
              <AppText variant="caption1" color="secondary" style={{ marginTop: 2 }}>
                Select the capability profile that fits your organization.
              </AppText>

              <View style={styles.trackRow}>
                {[
                  { id: 'repair_pro', title: 'Repair Pro', icon: 'construct-outline' },
                  { id: 'recycler', title: 'Recycler', icon: 'leaf-outline' },
                  { id: 'business', title: 'Seller', icon: 'briefcase-outline' },
                ].map((track) => {
                  const isSel = appType === track.id;
                  return (
                    <TouchableOpacity
                      key={track.id}
                      onPress={() => setAppType(track.id as any)}
                      style={[
                        styles.trackCard,
                        {
                          backgroundColor: isSel
                            ? theme.isDark
                              ? 'rgba(16, 185, 129, 0.20)'
                              : 'rgba(0, 122, 94, 0.12)'
                            : theme.colors.secondaryBackground,
                          borderColor: isSel ? theme.colors.tint : theme.colors.separator,
                          borderWidth: isSel ? 1.5 : theme.hairlineWidth,
                        },
                      ]}
                    >
                      <AppIcon name={track.icon as any} size={22} color={isSel ? theme.colors.tint : theme.colors.labelPrimary} />
                      <AppText variant="caption1" weight={isSel ? '700' : '500'} style={{ marginTop: 6 }}>
                        {track.title}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <AppSeparator verticalMargin={16} />

              {/* Form Fields */}
              <AppText variant="headline" weight="700">
                Organization Credentials
              </AppText>

              <View style={{ marginTop: 12 }}>
                <AppTextInput
                  label="Business Legal Name"
                  value={businessName}
                  onChangeText={setBusinessName}
                  placeholder="e.g. Apex Repair Solutions Ltd."
                />
                <View style={{ height: 12 }} />
                <AppTextInput
                  label="Registration / Tax ID"
                  value={regNumber}
                  onChangeText={setRegNumber}
                  placeholder="e.g. BC-1092842 or GST # 882910"
                />
                <View style={{ height: 12 }} />
                <AppTextInput
                  label="Service Region & Coverage"
                  value={serviceArea}
                  onChangeText={setServiceArea}
                  placeholder="e.g. Greater Vancouver, Richmond, Burnaby"
                />
                <View style={{ height: 12 }} />
                <AppTextInput
                  label="Supporting Document URL (Certification / License)"
                  value={docUrl}
                  onChangeText={setDocUrl}
                  placeholder="https://..."
                />
              </View>

              {/* Supported Categories */}
              <AppText variant="headline" weight="700" style={{ marginTop: 20 }}>
                Supported Device Categories
              </AppText>

              <View style={styles.catGrid}>
                {CATEGORY_CHOICES.map((c) => {
                  const isSel = selectedCats.includes(c.id);
                  return (
                    <TouchableOpacity
                      key={c.id}
                      onPress={() => toggleCategory(c.id)}
                      style={[
                        styles.catChoice,
                        {
                          backgroundColor: isSel ? theme.colors.fill : theme.colors.secondaryBackground,
                          borderColor: isSel ? theme.colors.tint : theme.colors.separator,
                          borderWidth: isSel ? 1.5 : theme.hairlineWidth,
                        },
                      ]}
                    >
                      <AppText variant="caption1" weight={isSel ? '700' : '500'} customColor={isSel ? theme.colors.tint : undefined}>
                        {c.label}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <AppButton
                title={isSubmitting ? 'Submitting...' : 'Submit Partner Application'}
                onPress={handleSubmit}
                disabled={isSubmitting}
                style={{ marginTop: 28 }}
              />
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeBtn: {
    padding: 6,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  trackRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  trackCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  catChoice: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successDesc: {
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
});
