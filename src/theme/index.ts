export interface ColorPalette {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  primaryMuted: string;
  background: string;
  surface: string;
  surfaceSubtle: string;
  card: string;
  cardBorder: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  danger: string;
  dangerSurface: string;
  warning: string;
  warningSurface: string;
  success: string;
  successSurface: string;
  info: string;
  infoSurface: string;
  purple: string;
  overlay: string;
  white: string;
  black: string;
}

export const lightColors: ColorPalette = {
  primary: '#DC2626',
  primaryLight: '#EF4444',
  primaryDark: '#B91C1C',
  primaryMuted: '#FEE2E2',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceSubtle: '#F1F5F9',
  card: '#FFFFFF',
  cardBorder: '#E2E8F0',
  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  border: '#CBD5E1',
  danger: '#EF4444',
  dangerSurface: '#FEF2F2',
  warning: '#F59E0B',
  warningSurface: '#FFFBEB',
  success: '#10B981',
  successSurface: '#ECFDF5',
  info: '#3B82F6',
  infoSurface: '#EFF6FF',
  purple: '#8B5CF6',
  overlay: 'rgba(15, 23, 42, 0.65)',
  white: '#FFFFFF',
  black: '#000000',
};

export const darkColors: ColorPalette = {
  primary: '#EF4444',
  primaryLight: '#F87171',
  primaryDark: '#DC2626',
  primaryMuted: '#450A0A',
  background: '#0B0F19',
  surface: '#131B2E',
  surfaceSubtle: '#1E293B',
  card: '#151E33',
  cardBorder: '#27354E',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  border: '#1E293B',
  danger: '#F87171',
  dangerSurface: '#3A1317',
  warning: '#FBBF24',
  warningSurface: '#3E2A0A',
  success: '#34D399',
  successSurface: '#0B3629',
  info: '#60A5FA',
  infoSurface: '#122B4A',
  purple: '#A78BFA',
  overlay: 'rgba(0, 0, 0, 0.85)',
  white: '#FFFFFF',
  black: '#000000',
};

import { TextStyle } from 'react-native';

export interface TypographyTokens {
  h1: { fontSize: number; lineHeight: number; fontWeight: TextStyle['fontWeight'] };
  h2: { fontSize: number; lineHeight: number; fontWeight: TextStyle['fontWeight'] };
  h3: { fontSize: number; lineHeight: number; fontWeight: TextStyle['fontWeight'] };
  bodyLarge: { fontSize: number; lineHeight: number; fontWeight: TextStyle['fontWeight'] };
  body: { fontSize: number; lineHeight: number; fontWeight: TextStyle['fontWeight'] };
  caption: { fontSize: number; lineHeight: number; fontWeight: TextStyle['fontWeight'] };
  button: { fontSize: number; lineHeight: number; fontWeight: TextStyle['fontWeight'] };
  sosButton: { fontSize: number; lineHeight: number; fontWeight: TextStyle['fontWeight'] };
}

export const normalTypography: TypographyTokens = {
  h1: { fontSize: 26, lineHeight: 32, fontWeight: '800' },
  h2: { fontSize: 20, lineHeight: 26, fontWeight: '700' },
  h3: { fontSize: 17, lineHeight: 22, fontWeight: '600' },
  bodyLarge: { fontSize: 16, lineHeight: 22, fontWeight: '500' },
  body: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' },
  button: { fontSize: 15, lineHeight: 20, fontWeight: '600' },
  sosButton: { fontSize: 28, lineHeight: 34, fontWeight: '800' },
};

export const seniorTypography: TypographyTokens = {
  h1: { fontSize: 32, lineHeight: 40, fontWeight: '800' },
  h2: { fontSize: 26, lineHeight: 32, fontWeight: '800' },
  h3: { fontSize: 22, lineHeight: 28, fontWeight: '700' },
  bodyLarge: { fontSize: 20, lineHeight: 28, fontWeight: '600' },
  body: { fontSize: 18, lineHeight: 26, fontWeight: '500' },
  caption: { fontSize: 15, lineHeight: 20, fontWeight: '600' },
  button: { fontSize: 20, lineHeight: 26, fontWeight: '700' },
  sosButton: { fontSize: 36, lineHeight: 42, fontWeight: '800' },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  huge: 36,
};

export const borderRadius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 9999,
};
