import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store';
import { lightColors, darkColors, seniorTypography, normalTypography, spacing } from '../theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  style?: ViewStyle;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onBack,
  rightAction,
  style,
}) => {
  const { settings } = useAppStore();
  const isDark = settings.themeMode !== 'light';
  const colors = isDark ? darkColors : lightColors;
  const typo = settings.seniorMode ? seniorTypography : normalTypography;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
        },
        style,
      ]}
    >
      <View style={styles.leftRow}>
        {onBack ? (
          <TouchableOpacity
            onPress={onBack}
            style={styles.backButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={settings.seniorMode ? 28 : 24} color={colors.text} />
          </TouchableOpacity>
        ) : null}
        <View style={styles.titleContainer}>
          <Text
            numberOfLines={1}
            style={[
              styles.title,
              {
                color: colors.text,
                fontSize: typo.h2.fontSize,
                fontWeight: typo.h2.fontWeight,
              },
            ]}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              numberOfLines={1}
              style={[
                styles.subtitle,
                {
                  color: colors.textSecondary,
                  fontSize: typo.caption.fontSize,
                },
              ]}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      {rightAction ? <View style={styles.rightAction}>{rightAction}</View> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: spacing.md,
    padding: 4,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: 2,
  },
  rightAction: {
    marginLeft: spacing.md,
  },
});
