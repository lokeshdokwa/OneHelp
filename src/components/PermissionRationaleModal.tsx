import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store';
import { lightColors, darkColors, seniorTypography, normalTypography, spacing, borderRadius } from '../theme';
import { Button } from './Button';

export interface PermissionRationaleConfig {
  permissionType: 'location' | 'microphone' | 'camera' | 'sms' | 'bluetooth' | 'notifications';
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  impactIfDenied: string;
}

interface PermissionRationaleModalProps {
  visible: boolean;
  config: PermissionRationaleConfig | null;
  onGrant: () => void;
  onDeny: () => void;
}

export const PermissionRationaleModal: React.FC<PermissionRationaleModalProps> = ({
  visible,
  config,
  onGrant,
  onDeny,
}) => {
  const { settings } = useAppStore();
  const isDark = settings.themeMode !== 'light';
  const colors = isDark ? darkColors : lightColors;
  const typo = settings.seniorMode ? seniorTypography : normalTypography;

  if (!config) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <SafeAreaView style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          <View style={[styles.iconBadge, { backgroundColor: colors.primaryMuted }]}>
            <Ionicons name={config.icon} size={36} color={colors.primary} />
          </View>

          <Text style={[styles.title, { color: colors.text, fontSize: typo.h2.fontSize }]}>
            {config.title}
          </Text>

          <Text style={[styles.description, { color: colors.textSecondary, fontSize: typo.body.fontSize }]}>
            {config.description}
          </Text>

          <View style={[styles.warningBox, { backgroundColor: colors.warningSurface, borderColor: colors.warning }]}>
            <Ionicons name="information-circle-outline" size={20} color={colors.warning} style={{ marginRight: 8 }} />
            <Text style={[styles.warningText, { color: colors.text, fontSize: typo.caption.fontSize }]}>
              {config.impactIfDenied}
            </Text>
          </View>

          <View style={styles.buttonRow}>
            <Button
              title="Not Now"
              variant="outline"
              onPress={onDeny}
              style={{ flex: 1, marginRight: spacing.sm }}
            />
            <Button
              title="Grant Access"
              variant="primary"
              onPress={onGrant}
              style={{ flex: 1.2 }}
            />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  container: {
    width: '100%',
    maxWidth: 380,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  iconBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  description: {
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.xl,
    width: '100%',
  },
  warningText: {
    flex: 1,
    lineHeight: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
  },
});
