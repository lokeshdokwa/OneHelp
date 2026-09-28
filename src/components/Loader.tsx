import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { useAppStore } from '../store';
import { lightColors, darkColors, seniorTypography, normalTypography, spacing } from '../theme';

interface LoaderProps {
  message?: string;
  style?: ViewStyle;
}

export const Loader: React.FC<LoaderProps> = ({ message, style }) => {
  const { settings } = useAppStore();
  const isDark = settings.themeMode !== 'light';
  const colors = isDark ? darkColors : lightColors;
  const typo = settings.seniorMode ? seniorTypography : normalTypography;

  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size="large" color={colors.primary} />
      {message ? (
        <Text
          style={[
            styles.message,
            {
              color: colors.textSecondary,
              fontSize: typo.body.fontSize,
            },
          ]}
        >
          {message}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  message: {
    marginTop: spacing.md,
    textAlign: 'center',
  },
});
