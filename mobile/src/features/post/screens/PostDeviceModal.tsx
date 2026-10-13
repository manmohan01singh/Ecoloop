import React, { useState } from 'react';
import {
  Modal,
  View,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../../design-system/theme/theme';
import { PostProgressHeader } from '../components/PostProgressHeader';
import { PostPhotoStep } from '../components/PostPhotoStep';
import { PostInfoStep } from '../components/PostInfoStep';
import { PostActionStep } from '../components/PostActionStep';
import { PostReviewStep } from '../components/PostReviewStep';
import { PostSuccessStep } from '../components/PostSuccessStep';
import { PostFormData, PostStep, PostFormErrors, DeviceActionType } from '../types/post.types';
import { submitPostDevice } from '../services/postDeviceService';
import { useAuth } from '../../../services/auth/AuthContext';
import { AuthModal } from '../../auth/components/AuthModal';

export interface PostDeviceModalProps {
  visible: boolean;
  onClose: () => void;
  onNavigateToExplore?: () => void;
  initialAction?: DeviceActionType;
  initialData?: Partial<PostFormData>;
}

const INITIAL_FORM_DATA: PostFormData = {
  photos: [],
  title: '',
  category: 'smartphone',
  brand: '',
  model: '',
  condition: 'good',
  description: '',
  city: 'Metro Vancouver',
  action: 'sell',
  price: '',
  isFree: false,
  originalPrice: '',
  pickupType: 'both',
  warrantyDays: '14',
  issueType: 'Cracked Screen / OLED',
  issueDetails: '',
  repairUrgency: 'standard',
  preferredService: 'depot',
  disposalReason: 'End of hardware operating life',
  certificateRequested: false,
  hasSwollenBattery: false,
  dropoffPreference: 'depot',
  confirmedAccurate: false,
};

export const PostDeviceModal: React.FC<PostDeviceModalProps> = ({
  visible,
  onClose,
  onNavigateToExplore,
  initialAction,
  initialData,
}) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuth();

  const [step, setStep] = useState<PostStep>(1);
  const [formData, setFormData] = useState<PostFormData>({
    ...INITIAL_FORM_DATA,
    action: initialAction || 'sell',
    ...(initialData || {}),
  });
  const [errors, setErrors] = useState<PostFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [authModalVisible, setAuthModalVisible] = useState(false);

  // Sync initial action and device metadata when opened
  React.useEffect(() => {
    if (visible) {
      setFormData((prev) => ({
        ...prev,
        ...(initialAction ? { action: initialAction } : {}),
        ...(initialData || {}),
      }));
    }
  }, [visible, initialAction, initialData]);

  const handleFieldChange = <K extends keyof PostFormData>(field: K, value: PostFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleCancel = () => {
    // If user entered details, confirm before abandoning
    if (formData.photos.length > 0 || formData.title.trim().length > 0) {
      Alert.alert(
        'Discard Posting?',
        'You have unsaved changes. Discarding will clear your selected photos and entered specifications.',
        [
          { text: 'Keep Editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              setFormData(INITIAL_FORM_DATA);
              setStep(1);
              setErrors({});
              onClose();
            },
          },
        ]
      );
    } else {
      setStep(1);
      onClose();
    }
  };

  // Step 1 -> Step 2 validation
  const handleNextFromPhotos = () => {
    if (formData.photos.length === 0) {
      Alert.alert('Photo Required', 'Please photograph your device or select at least one photo to proceed.');
      return;
    }
    setStep(2);
  };

  // Step 2 -> Step 3 validation
  const handleNextFromInfo = () => {
    const newErrors: PostFormErrors = {};
    if (!formData.title.trim() || formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters.';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'Location city is required.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setStep(3);
  };

  // Step 3 -> Step 4 validation
  const handleNextFromAction = () => {
    const newErrors: PostFormErrors = {};

    if (formData.action === 'sell' && !formData.isFree) {
      const p = parseFloat(formData.price);
      if (isNaN(p) || p <= 0) {
        newErrors.price = 'Please enter a valid selling price or toggle Free.';
      }
    }

    if (formData.action === 'repair' && !formData.issueDetails.trim()) {
      newErrors.issueDetails = 'Please provide details about the hardware symptoms.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setStep(4);
  };

  // Step 4: Submission
  const handleSubmit = async () => {
    if (submitting) return;

    if (!user) {
      Alert.alert(
        'Sign In Required',
        'You must have an active EcoLoop account to list a device. Your entered photos and specifications will be preserved.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign In / Register',
            onPress: () => setAuthModalVisible(true),
          },
        ]
      );
      return;
    }

    if (!formData.confirmedAccurate) {
      setErrors({ confirmedAccurate: 'You must confirm ownership and accuracy to proceed.' });
      return;
    }

    setSubmitting(true);
    const result = await submitPostDevice(formData, user, profile);
    setSubmitting(false);

    if (result.success) {
      setStep(5);
    } else {
      Alert.alert('Submission Error', result.error || 'Failed to submit device. Please try again.');
    }
  };

  const handleFinishExplore = () => {
    setFormData(INITIAL_FORM_DATA);
    setStep(1);
    setErrors({});
    onClose();
    onNavigateToExplore?.();
  };

  const handleFinishDone = () => {
    setFormData(INITIAL_FORM_DATA);
    setStep(1);
    setErrors({});
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleCancel}
    >
      <View style={styles.backdrop}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={[
            styles.sheetContainer,
            {
              backgroundColor: theme.colors.cardElevated,
              paddingTop: 8,
              paddingBottom: Math.max(insets.bottom, 16),
              borderTopLeftRadius: theme.radii.xxl,
              borderTopRightRadius: theme.radii.xxl,
              borderColor: theme.colors.separator,
              borderWidth: theme.hairlineWidth,
              ...theme.shadows.modal,
            },
          ]}
        >
          {/* Progress Header */}
          <PostProgressHeader
            currentStep={step}
            totalSteps={4}
            onBack={() => setStep((prev) => (Math.max(prev - 1, 1) as PostStep))}
            onCancel={handleCancel}
          />

          {/* Current Step Component */}
          <View style={styles.content}>
            {step === 1 && (
              <PostPhotoStep
                photos={formData.photos}
                onPhotosChange={(p) => handleFieldChange('photos', p)}
                onNext={handleNextFromPhotos}
              />
            )}

            {step === 2 && (
              <PostInfoStep
                formData={formData}
                errors={errors}
                onChangeField={handleFieldChange}
                onNext={handleNextFromInfo}
              />
            )}

            {step === 3 && (
              <PostActionStep
                formData={formData}
                errors={errors}
                onChangeField={handleFieldChange}
                onNext={handleNextFromAction}
              />
            )}

            {step === 4 && (
              <PostReviewStep
                formData={formData}
                submitting={submitting}
                errors={errors}
                onChangeField={handleFieldChange}
                onSubmit={handleSubmit}
                onBack={() => setStep(3)}
              />
            )}

            {step === 5 && (
              <PostSuccessStep
                formData={formData}
                onViewInExplore={handleFinishExplore}
                onDone={handleFinishDone}
              />
            )}
          </View>
        </KeyboardAvoidingView>
      </View>

      {/* In-situ Auth Modal preserving post draft state */}
      <AuthModal
        visible={authModalVisible}
        onClose={() => setAuthModalVisible(false)}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    height: '92%',
    maxHeight: '94%',
  },
  content: {
    flex: 1,
  },
});
