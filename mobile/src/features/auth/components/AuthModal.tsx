import React, { useState } from 'react';
import {
  View,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../../design-system/theme/theme';
import { AppText } from '../../../components/ui/AppText';
import { AppIcon } from '../../../components/ui/AppIcon';
import { AppButton } from '../../../components/ui/AppButton';
import { AppTextInput } from '../../../components/ui/AppTextInput';
import { useAuth } from '../../../services/auth/AuthContext';
import { validateEmail, validatePassword } from '../../../services/auth/authService';

export interface AuthModalProps {
  visible: boolean;
  initialMode?: 'signin' | 'signup';
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  visible,
  initialMode = 'signin',
  onClose,
  onSuccess,
}) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { signIn, signUp, resetPassword } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(initialMode);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setDisplayName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setErrorMessage(null);
    setSuccessNotice(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSwitchMode = (newMode: 'signin' | 'signup' | 'forgot') => {
    setMode(newMode);
    setErrorMessage(null);
    setSuccessNotice(null);
  };

  const handleSubmit = async () => {
    setErrorMessage(null);
    setSuccessNotice(null);

    const cleanEmail = email.trim();
    if (!validateEmail(cleanEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (mode === 'forgot') {
      setSubmitting(true);
      try {
        const res = await resetPassword(cleanEmail);
        if (res.success) {
          setSuccessNotice(res.message);
        } else {
          setErrorMessage(res.error || 'Failed to send reset email.');
        }
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (!password) {
      setErrorMessage('Password is required.');
      return;
    }

    if (mode === 'signup') {
      if (!displayName.trim()) {
        setErrorMessage('Display name is required.');
        return;
      }
      const passValidation = validatePassword(password);
      if (!passValidation.valid) {
        setErrorMessage(passValidation.reason || 'Invalid password.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match.');
        return;
      }

      setSubmitting(true);
      try {
        const res = await signUp({
          email: cleanEmail,
          password,
          displayName: displayName.trim(),
        });

        if (res.success) {
          resetForm();
          onClose();
          if (onSuccess) onSuccess();
        } else {
          setErrorMessage(res.error || 'Failed to create account.');
        }
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // Sign in mode
    setSubmitting(true);
    try {
      const res = await signIn({
        email: cleanEmail,
        password,
      });

      if (res.success) {
        resetForm();
        onClose();
        if (onSuccess) onSuccess();
      } else {
        setErrorMessage(res.error || 'Invalid credentials.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={handleClose}
          style={styles.backdrop}
        />

        <View
          style={[
            styles.sheetContainer,
            {
              backgroundColor: theme.colors.secondaryBackground,
              paddingTop: 16,
              paddingBottom: Math.max(insets.bottom, 24),
              borderTopColor: theme.colors.separator,
              borderTopWidth: theme.hairlineWidth,
            },
          ]}
        >
          {/* Grabber indicator */}
          <View style={styles.grabberRow}>
            <View style={[styles.grabber, { backgroundColor: theme.colors.labelQuaternary }]} />
          </View>

          {/* Modal Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitleGroup}>
              <View
                style={[
                  styles.brandBadge,
                  { backgroundColor: theme.colors.tintLight },
                ]}
              >
                <AppIcon name="shield-checkmark" size={14} color={theme.colors.tint} />
                <AppText
                  variant="caption2"
                  weight="700"
                  customColor={theme.colors.tint}
                  style={{ marginLeft: 4 }}
                >
                  SECURE ECOPASSPORT
                </AppText>
              </View>

              <AppText variant="title2" weight="700" style={styles.title}>
                {mode === 'signup'
                  ? 'Create Your Account'
                  : mode === 'forgot'
                  ? 'Reset Password'
                  : 'Welcome to Circuvio'}
              </AppText>

              <AppText variant="subheadline" color="secondary" style={styles.subtitle}>
                {mode === 'signup'
                  ? 'Join thousands diverting electronics from local landfills.'
                  : mode === 'forgot'
                  ? 'Enter your registered email to receive recovery instructions.'
                  : 'Sign in to manage your listings and tracked EcoKarma.'}
              </AppText>
            </View>

            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Close authentication"
              activeOpacity={0.7}
              onPress={handleClose}
              style={[styles.closeButton, { backgroundColor: theme.colors.fill }]}
            >
              <AppIcon name="close" size={20} color={theme.colors.labelSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollBody}
          >
            {/* Error Banner */}
            {errorMessage ? (
              <View
                style={[
                  styles.noticeBox,
                  {
                    backgroundColor: theme.colors.fill,
                    borderColor: theme.colors.destructive,
                  },
                ]}
              >
                <AppIcon
                  name="alert-circle"
                  size={18}
                  color={theme.colors.destructive}
                  style={{ marginRight: 8, marginTop: 1 }}
                />
                <AppText
                  variant="footnote"
                  weight="500"
                  customColor={theme.colors.destructive}
                  style={{ flex: 1, lineHeight: 18 }}
                >
                  {errorMessage}
                </AppText>
              </View>
            ) : null}

            {/* Success Banner */}
            {successNotice ? (
              <View
                style={[
                  styles.noticeBox,
                  {
                    backgroundColor: theme.colors.fillSecondary,
                    borderColor: theme.colors.separator,
                  },
                ]}
              >
                <AppIcon
                  name="checkmark-circle"
                  size={18}
                  color={theme.colors.tint}
                  style={{ marginRight: 8, marginTop: 1 }}
                />
                <AppText
                  variant="footnote"
                  weight="500"
                  customColor={theme.colors.tint}
                  style={{ flex: 1, lineHeight: 18 }}
                >
                  {successNotice}
                </AppText>
              </View>
            ) : null}

            {/* Form Fields */}
            {mode === 'signup' ? (
              <AppTextInput
                label="Full Name or Handle"
                placeholder="e.g. Alex Morgan"
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
                autoCorrect={false}
                required
              />
            ) : null}

            <AppTextInput
              label="Email Address"
              placeholder="alex@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              required
            />

            {mode !== 'forgot' ? (
              <View style={styles.passwordWrapper}>
                <AppTextInput
                  label="Password"
                  placeholder={mode === 'signup' ? 'Min. 8 characters' : 'Enter your password'}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  required
                  helperText={
                    mode === 'signup'
                      ? 'Include at least 8 characters and a number or symbol.'
                      : undefined
                  }
                />
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                  activeOpacity={0.7}
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeToggle}
                >
                  <AppIcon
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={theme.colors.labelTertiary}
                  />
                </TouchableOpacity>
              </View>
            ) : null}

            {mode === 'signup' ? (
              <AppTextInput
                label="Confirm Password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                required
              />
            ) : null}

            {/* Forgot password link */}
            {mode === 'signin' ? (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Forgot password link"
                activeOpacity={0.7}
                onPress={() => handleSwitchMode('forgot')}
                style={styles.forgotRow}
              >
                <AppText variant="footnote" weight="600" customColor={theme.colors.tint}>
                  Forgot Password?
                </AppText>
              </TouchableOpacity>
            ) : null}

            {/* Submit Action */}
            <View style={styles.submitWrapper}>
              <AppButton
                label={
                  submitting
                    ? 'Processing...'
                    : mode === 'signup'
                    ? 'Create Circuvio Account'
                    : mode === 'forgot'
                    ? 'Send Reset Link'
                    : 'Sign In'
                }
                variant="filled"
                size="large"
                fullWidth
                disabled={submitting}
                onPress={handleSubmit}
              />
            </View>

            {/* 1-Tap Quick Persona Testing */}
            {mode === 'signin' && (
              <View style={styles.demoPersonaContainer}>
                <AppText variant="caption2" weight="700" color="tertiary" style={styles.demoPersonaTitle}>
                  QUICK PERSONA TESTING
                </AppText>
                <View style={styles.demoPillsRow}>
                  {[
                    { label: 'Citizen', email: 'citizen@circuvio.com' },
                    { label: 'Repair Pro', email: 'repair@circuvio.com' },
                    { label: 'Recycler', email: 'recycler@circuvio.com' },
                    { label: 'Business', email: 'business@circuvio.com' },
                    { label: 'Admin', email: 'admin@circuvio.com' },
                  ].map((p) => (
                    <TouchableOpacity
                      key={p.label}
                      onPress={() => {
                        setEmail(p.email);
                        setPassword('Circuvio2026!');
                      }}
                      activeOpacity={0.7}
                      style={[styles.demoPill, { backgroundColor: theme.colors.fillSecondary }]}
                    >
                      <AppText variant="caption2" weight="600" color="secondary">
                        {p.label}
                      </AppText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Mode Switching Footer */}
            <View style={styles.footerRow}>
              {mode === 'signin' ? (
                <>
                  <AppText variant="footnote" color="secondary">
                    New to Circuvio?
                  </AppText>
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel="Switch to Create Account"
                    activeOpacity={0.7}
                    onPress={() => handleSwitchMode('signup')}
                    style={styles.switchButton}
                  >
                    <AppText variant="footnote" weight="700" customColor={theme.colors.tint}>
                      Create Account
                    </AppText>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <AppText variant="footnote" color="secondary">
                    Already have an account?
                  </AppText>
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel="Switch to Sign In"
                    activeOpacity={0.7}
                    onPress={() => handleSwitchMode('signin')}
                    style={styles.switchButton}
                  >
                    <AppText variant="footnote" weight="700" customColor={theme.colors.tint}>
                      Sign In
                    </AppText>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  sheetContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    paddingHorizontal: 20,
  },
  grabberRow: {
    alignItems: 'center',
    marginBottom: 12,
  },
  grabber: {
    width: 38,
    height: 4.5,
    borderRadius: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitleGroup: {
    flex: 1,
    marginRight: 12,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  title: {
    letterSpacing: -0.4,
  },
  subtitle: {
    marginTop: 4,
    lineHeight: 18,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    paddingBottom: 16,
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  passwordWrapper: {
    position: 'relative',
  },
  eyeToggle: {
    position: 'absolute',
    right: 12,
    top: 36,
    padding: 6,
    zIndex: 10,
  },
  forgotRow: {
    alignSelf: 'flex-end',
    marginTop: -4,
    marginBottom: 16,
    paddingVertical: 4,
  },
  submitWrapper: {
    marginTop: 6,
    marginBottom: 16,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  switchButton: {
    marginLeft: 6,
    paddingVertical: 4,
  },
  demoPersonaContainer: {
    marginBottom: 16,
    paddingTop: 4,
  },
  demoPersonaTitle: {
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  demoPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  demoPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
});
