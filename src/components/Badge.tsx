import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { borderRadius, spacing } from '../theme';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  style,
  icon,
}) => {
  const getColors = () => {
    switch (variant) {
      case 'success':
        return { bg: '#064E3B', text: '#34D399', border: '#059669' };
      case 'warning':
        return { bg: '#451A03', text: '#FBBF24', border: '#D97706' };
      case 'danger':
        return { bg: '#450A0A', text: '#F87171', border: '#DC2626' };
      case 'info':
        return { bg: '#082F49', text: '#38BDF8', border: '#0284C7' };
      case 'primary':
        return { bg: '#450A0A', text: '#FCA5A5', border: '#EF4444' };
      default:
        return { bg: '#1E293B', text: '#94A3B8', border: '#334155' };
    }
  };

  const scheme = getColors();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: scheme.bg,
          borderColor: scheme.border,
        },
        style,
      ]}
    >
      {icon ? <View style={styles.iconContainer}>{icon}</View> : null}
      <Text style={[styles.text, { color: scheme.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  iconContainer: {
    marginRight: 4,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
