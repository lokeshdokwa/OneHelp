import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '../store';
import { lightColors, darkColors, seniorTypography, normalTypography, spacing, borderRadius } from '../theme';

interface PinModalProps {
  visible: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  onSuccess: (isDuress: boolean) => void;
}

export const PinModal: React.FC<PinModalProps> = ({
  visible,
  title,
  subtitle,
  onClose,
  onSuccess,
}) => {
  const { settings } = useAppStore();
  const [pin, setPin] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const isDark = settings.themeMode !== 'light';
  const colors = isDark ? darkColors : lightColors;
  const typo = settings.seniorMode ? seniorTypography : normalTypography;

  const handleKeyPress = (num: string) => {
    if (pin.length >= 4) return;
    if (settings.hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const newPin = pin + num;
    setPin(newPin);
    setErrorMessage('');

    if (newPin.length === 4) {
      // Validate PIN
      setTimeout(() => {
        if (newPin === settings.normalPin) {
          if (settings.hapticFeedback) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setPin('');
          onSuccess(false); // Normal cancellation
        } else if (newPin === settings.duressPin) {
          if (settings.hapticFeedback) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          setPin('');
          onSuccess(true); // Duress trigger
        } else {
          if (settings.hapticFeedback) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          setErrorMessage('Incorrect PIN. Please re-enter.');
          setPin('');
        }
      }, 100);
    }
  };

  const handleDelete = () => {
    if (settings.hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setPin(pin.slice(0, -1));
    setErrorMessage('');
  };

  const handleClose = () => {
    setPin('');
    setErrorMessage('');
    onClose();
  };

  const padNumbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <SafeAreaView style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          <Text style={[styles.title, { color: colors.text, fontSize: typo.h2.fontSize }]}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: colors.textSecondary, fontSize: typo.body.fontSize }]}>
              {subtitle}
            </Text>
          ) : null}

          {/* Dots Indicator */}
          <View style={styles.dotsRow}>
            {[0, 1, 2, 3].map((index) => {
              const isFilled = pin.length > index;
              return (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    {
                      backgroundColor: isFilled ? colors.primary : colors.surfaceSubtle,
                      borderColor: isFilled ? colors.primary : colors.border,
                    },
                  ]}
                />
              );
            })}
          </View>

          {errorMessage ? (
            <Text style={[styles.error, { color: colors.danger, fontSize: typo.caption.fontSize }]}>
              {errorMessage}
            </Text>
          ) : (
            <View style={{ height: 20 }} />
          )}

          {/* Numeric Keypad */}
          <View style={styles.keypad}>
            {padNumbers.map((key, i) => {
              if (key === '') {
                return <View key={i} style={styles.keyButtonPlaceholder} />;
              }
              if (key === 'del') {
                return (
                  <TouchableOpacity
                    key={i}
                    onPress={handleDelete}
                    style={[styles.keyButton, { backgroundColor: colors.surfaceSubtle }]}
                    accessibilityLabel="Delete digit"
                  >
                    <Ionicons name="backspace-outline" size={26} color={colors.text} />
                  </TouchableOpacity>
                );
              }
              return (
                <TouchableOpacity
                  key={i}
                  onPress={() => handleKeyPress(key)}
                  style={[styles.keyButton, { backgroundColor: colors.surfaceSubtle }]}
                  accessibilityLabel={`Key ${key}`}
                >
                  <Text style={[styles.keyText, { color: colors.text, fontSize: settings.seniorMode ? 28 : 22 }]}>
                    {key}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    padding: spacing.xs,
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: spacing.lg,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    marginHorizontal: 10,
  },
  error: {
    fontWeight: '600',
    height: 20,
    marginBottom: spacing.sm,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: 280,
    marginTop: spacing.sm,
  },
  keyButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 8,
  },
  keyButtonPlaceholder: {
    width: 72,
    height: 72,
    margin: 8,
  },
  keyText: {
    fontWeight: '600',
  },
});
