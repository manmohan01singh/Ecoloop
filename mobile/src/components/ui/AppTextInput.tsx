import React, { useState } from 'react';
import {
  View,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useAppTheme } from '../../design-system/theme/theme';
import { AppText } from './AppText';
import { AppIcon } from './AppIcon';

export interface AppTextInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  prefix?: string;
  suffix?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  showClearButton?: boolean;
  required?: boolean;
}

export const AppTextInput: React.FC<AppTextInputProps> = ({
  label,
  helperText,
  errorMessage,
  prefix,
  suffix,
  containerStyle,
  inputStyle,
  showClearButton = false,
  required = false,
  value,
  onChangeText,
  placeholder,
  editable = true,
  multiline = false,
  numberOfLines,
  ...rest
}) => {
  const theme = useAppTheme();
  const [isFocused, setIsFocused] = useState(false);

  const hasError = Boolean(errorMessage);

  const handleClear = () => {
    if (onChangeText) {
      onChangeText('');
    }
  };

  const getBorderColor = () => {
    if (hasError) return theme.colors.destructive;
    if (isFocused) return theme.colors.tint;
    return theme.colors.separator;
  };

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? (
        <View style={styles.labelRow}>
          <AppText variant="subheadline" weight="600" color="primary">
            {label}
          </AppText>
          {required ? (
            <AppText
              variant="subheadline"
              weight="600"
              customColor={theme.colors.destructive}
              style={{ marginLeft: 3 }}
            >
              *
            </AppText>
          ) : null}
        </View>
      ) : null}

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: editable ? theme.colors.fillSecondary : theme.colors.fill,
            borderColor: getBorderColor(),
            borderWidth: isFocused || hasError ? 1.5 : theme.hairlineWidth,
            borderRadius: theme.radii.md,
            minHeight: multiline ? 88 : 46,
            alignItems: multiline ? 'flex-start' : 'center',
            paddingVertical: multiline ? 10 : 0,
          },
        ]}
      >
        {prefix ? (
          <AppText
            variant="body"
            weight="500"
            color="secondary"
            style={[styles.prefixText, multiline ? { marginTop: 4 } : undefined]}
          >
            {prefix}
          </AppText>
        ) : null}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.labelTertiary}
          editable={editable}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[
            styles.nativeInput,
            {
              color: theme.colors.labelPrimary,
              fontSize: 16,
            },
            multiline && styles.multilineInput,
            inputStyle,
          ]}
          {...rest}
        />

        {showClearButton && value && value.length > 0 && editable && !multiline ? (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Clear input"
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={handleClear}
            style={styles.clearButton}
          >
            <AppIcon
              name="close-circle"
              size={18}
              color={theme.colors.labelTertiary}
            />
          </TouchableOpacity>
        ) : null}

        {suffix ? (
          <AppText
            variant="footnote"
            weight="500"
            color="secondary"
            style={[styles.suffixText, multiline ? { marginTop: 4 } : undefined]}
          >
            {suffix}
          </AppText>
        ) : null}
      </View>

      {hasError ? (
        <View style={styles.messageRow}>
          <AppIcon
            name="alert-circle"
            size={13}
            color={theme.colors.destructive}
            style={{ marginRight: 4 }}
          />
          <AppText
            variant="caption1"
            weight="500"
            customColor={theme.colors.destructive}
          >
            {errorMessage}
          </AppText>
        </View>
      ) : helperText ? (
        <AppText variant="caption1" color="secondary" style={styles.helperText}>
          {helperText}
        </AppText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: 14,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
  },
  nativeInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  multilineInput: {
    textAlignVertical: 'top',
    minHeight: 68,
  },
  prefixText: {
    marginRight: 4,
  },
  suffixText: {
    marginLeft: 6,
  },
  clearButton: {
    padding: 4,
    marginLeft: 4,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingHorizontal: 2,
  },
  helperText: {
    marginTop: 4,
    paddingHorizontal: 2,
  },
});
