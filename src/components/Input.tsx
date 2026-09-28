import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useAppStore } from '../store';
import { lightColors, darkColors, seniorTypography, normalTypography, borderRadius, spacing } from '../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  inputStyle,
  icon,
  ...props
}) => {
  const { settings } = useAppStore();
  const isDark = settings.themeMode !== 'light';
  const colors = isDark ? darkColors : lightColors;
  const typo = settings.seniorMode ? seniorTypography : normalTypography;

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Text
          style={[
            styles.label,
            {
              color: colors.textSecondary,
              fontSize: typo.caption.fontSize,
            },
          ]}
        >
          {label}
        </Text>
      ) : null}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.surfaceSubtle,
            borderColor: error ? colors.danger : colors.border,
            height: settings.seniorMode ? 56 : 46,
            borderRadius: borderRadius.md,
          },
        ]}
      >
        {icon ? <View style={styles.iconContainer}>{icon}</View> : null}
        <TextInput
          placeholderTextColor={colors.textMuted}
          style={[
            styles.input,
            {
              color: colors.text,
              fontSize: typo.body.fontSize,
            },
            inputStyle,
          ]}
          {...props}
        />
      </View>
      {error ? (
        <Text
          style={[
            styles.errorText,
            {
              color: colors.danger,
              fontSize: typo.caption.fontSize - 1,
            },
          ]}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.xs + 2,
  },
  label: {
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: spacing.md,
  },
  iconContainer: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: 8,
  },
  errorText: {
    marginTop: 4,
    fontWeight: '500',
  },
});
