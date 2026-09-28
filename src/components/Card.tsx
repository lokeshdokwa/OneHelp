import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useAppStore } from '../store';
import { lightColors, darkColors, borderRadius, spacing } from '../theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'elevated' | 'outlined' | 'subtle';
}

export const Card: React.FC<CardProps> = ({ children, style, variant = 'outlined' }) => {
  const { settings } = useAppStore();
  const isDark = settings.themeMode !== 'light';
  const colors = isDark ? darkColors : lightColors;

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: variant === 'subtle' ? colors.surfaceSubtle : colors.card,
          borderColor: colors.cardBorder,
          borderWidth: variant === 'outlined' ? 1 : 0,
        },
        variant === 'elevated' && styles.elevation,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginVertical: spacing.xs,
  },
  elevation: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
});
