import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
  Vibration,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store';
import { seniorTypography, normalTypography } from '../theme';
import { t } from '../i18n';

interface SosButtonProps {
  onTrigger: () => void;
  disabled?: boolean;
}

const HOLD_DURATION_MS = 3000;

export const SosButton: React.FC<SosButtonProps> = ({ onTrigger, disabled = false }) => {
  const { settings } = useAppStore();
  const [isPressing, setIsPressing] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(3);

  const holdProgress = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const typo = settings.seniorMode ? seniorTypography : normalTypography;

  // Ambient pulsing animation when idle
  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [pulseAnim]);

  const handlePressIn = () => {
    if (disabled) return;
    setIsPressing(true);
    setSecondsRemaining(3);

    if (settings.hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    // Start progress animation
    holdProgress.setValue(0);
    Animated.timing(holdProgress, {
      toValue: 1,
      duration: HOLD_DURATION_MS,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();

    let timeLeft = 3;
    countdownIntervalRef.current = setInterval(() => {
      timeLeft -= 1;
      if (timeLeft >= 0) {
        setSecondsRemaining(timeLeft);
        if (settings.hapticFeedback) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
      }
    }, 1000);

    pressTimerRef.current = setTimeout(() => {
      handleComplete();
    }, HOLD_DURATION_MS);
  };

  const handlePressOut = () => {
    if (disabled || !isPressing) return;
    cleanupTimers();
    setIsPressing(false);
    holdProgress.setValue(0);
    setSecondsRemaining(3);

    if (settings.hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const cleanupTimers = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  };

  const handleComplete = () => {
    cleanupTimers();
    setIsPressing(false);
    holdProgress.setValue(0);
    setSecondsRemaining(3);

    if (settings.hapticFeedback) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Vibration.vibrate([0, 400, 200, 400]);
    }
    onTrigger();
  };

  useEffect(() => {
    return () => cleanupTimers();
  }, []);

  const buttonSize = settings.seniorMode ? 220 : 180;
  const progressBorderWidth = holdProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [4, 14],
  });

  return (
    <View style={styles.container}>
      {/* Outer ambient glow ring */}
      <Animated.View
        style={[
          styles.glowRing,
          {
            width: buttonSize + 36,
            height: buttonSize + 36,
            borderRadius: (buttonSize + 36) / 2,
            transform: [{ scale: isPressing ? 1.15 : pulseAnim }],
            opacity: isPressing ? 0.8 : 0.35,
          },
        ]}
      />

      {/* Main SOS button */}
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel="Emergency SOS button. Hold for 3 seconds to trigger."
        style={({ pressed }) => [
          styles.sosButton,
          {
            width: buttonSize,
            height: buttonSize,
            borderRadius: buttonSize / 2,
            transform: [{ scale: pressed ? 0.96 : 1 }],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.animatedBorder,
            {
              borderRadius: buttonSize / 2,
              borderWidth: progressBorderWidth,
              borderColor: isPressing ? '#FFFFFF' : '#FCA5A5',
            },
          ]}
        >
          <View style={styles.innerContent}>
            <Ionicons name="warning" size={settings.seniorMode ? 44 : 36} color="#FFFFFF" />
            <Text
              style={[
                styles.sosText,
                {
                  fontSize: typo.sosButton.fontSize,
                  lineHeight: typo.sosButton.lineHeight,
                },
              ]}
            >
              SOS
            </Text>
            {isPressing ? (
              <Text style={styles.countdownBadge}>
                {secondsRemaining > 0 ? `HOLD: ${secondsRemaining}s` : 'DISPATCHING!'}
              </Text>
            ) : (
              <Text style={styles.holdText}>HOLD 3 SEC</Text>
            )}
          </View>
        </Animated.View>
      </Pressable>

      <Text style={styles.instructionText}>
        {isPressing
          ? t('sosReleasingCancel', settings.language)
          : t('sosButtonLabel', settings.language)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 18,
  },
  glowRing: {
    position: 'absolute',
    backgroundColor: '#DC2626',
  },
  sosButton: {
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 12,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
  },
  animatedBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosText: {
    color: '#FFFFFF',
    fontWeight: '900',
    letterSpacing: 2,
    marginTop: 2,
  },
  holdText: {
    color: '#FEE2E2',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 4,
  },
  countdownBadge: {
    color: '#FEF08A',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 4,
  },
  instructionText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 14,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});
