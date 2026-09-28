import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store';
import { lightColors, darkColors, seniorTypography, normalTypography, spacing } from '../theme';
import { Button } from './Button';

interface EmptyStateProps {
  iconName?: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  iconName = 'alert-circle-outline',
  title,
  description,
  actionLabel,
  onAction,
  style,
}) => {
  const { settings } = useAppStore();
  const isDark = settings.themeMode !== 'light';
  const colors = isDark ? darkColors : lightColors;
  const typo = settings.seniorMode ? seniorTypography : normalTypography;

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.iconCircle, { backgroundColor: colors.surfaceSubtle }]}>
        <Ionicons name={iconName} size={48} color={colors.textSecondary} />
      </View>
      <Text
        style={[
          styles.title,
          {
            color: colors.text,
            fontSize: typo.h3.fontSize,
            fontWeight: typo.h3.fontWeight,
          },
        ]}
      >
        {title}
      </Text>
      <Text
        style={[
          styles.description,
          {
            color: colors.textSecondary,
            fontSize: typo.body.fontSize,
          },
        ]}
      >
        {description}
      </Text>
      {actionLabel && onAction ? (
        <Button
          title={actionLabel}
          onPress={onAction}
          variant="secondary"
          style={styles.actionButton}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    marginVertical: spacing.lg,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  description: {
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  actionButton: {
    minWidth: 160,
  },
});
