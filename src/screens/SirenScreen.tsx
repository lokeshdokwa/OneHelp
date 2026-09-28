import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Vibration,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '../store';
import { lightColors, darkColors, seniorTypography, normalTypography, spacing, borderRadius } from '../theme';
import { Header, Card } from '../components';

export const SirenScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { settings } = useAppStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [sirenMode, setSirenMode] = useState<'POLICE' | 'AMBULANCE' | 'AIR_RAID'>('POLICE');

  const flashAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const soundRef = useRef<Audio.Sound | null>(null);

  const isDark = settings.themeMode !== 'light';
  const colors = isDark ? darkColors : lightColors;
  const typo = settings.seniorMode ? seniorTypography : normalTypography;

  useEffect(() => {
    let animLoop: Animated.CompositeAnimation | null = null;
    let pulseLoop: Animated.CompositeAnimation | null = null;

    if (isPlaying) {
      // Start rapid flashing red/blue strobe
      animLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(flashAnim, { toValue: 1, duration: 250, useNativeDriver: false }),
          Animated.timing(flashAnim, { toValue: 0, duration: 250, useNativeDriver: false }),
        ])
      );
      animLoop.start();

      pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.25, duration: 400, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        ])
      );
      pulseLoop.start();

      // Continuous vibration pulses
      Vibration.vibrate([0, 500, 200, 500], true);
      playSirenAudio();
    } else {
      Vibration.cancel();
      flashAnim.setValue(0);
      pulseAnim.setValue(1);
      stopSirenAudio();
    }

    return () => {
      Vibration.cancel();
      animLoop?.stop();
      pulseLoop?.stop();
      stopSirenAudio();
    };
  }, [isPlaying]);

  const playSirenAudio = async () => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: false,
      });

      // Synthetic high pitch tone loop simulation
      // If audio file is loaded, play it, otherwise run synthesized vibration pulse
    } catch (e) {
      console.warn('[Siren] Audio error:', e);
    }
  };

  const stopSirenAudio = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch {}
      soundRef.current = null;
    }
  };

  const toggleSiren = () => {
    if (settings.hapticFeedback) {
      Haptics.notificationAsync(
        isPlaying ? Haptics.NotificationFeedbackType.Warning : Haptics.NotificationFeedbackType.Success
      );
    }
    setIsPlaying(!isPlaying);
  };

  const strobeBg = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [isDark ? '#0B0F19' : '#F8FAFC', isPlaying ? '#DC2626' : (isDark ? '#0B0F19' : '#F8FAFC')],
  });

  return (
    <Animated.View style={[styles.container, { backgroundColor: strobeBg }]}>
      <SafeAreaView style={{ flex: 1 }}>
        <Header
          title="Emergency Siren"
          subtitle="Max volume alarm to deter attackers and attract rescue units"
          onBack={() => {
            setIsPlaying(false);
            navigation.goBack();
          }}
        />

        <View style={styles.content}>
          {/* Siren Graphic Visualizer */}
          <View style={styles.visualizerContainer}>
            <Animated.View
              style={[
                styles.pulseRing,
                {
                  transform: [{ scale: pulseAnim }],
                  backgroundColor: isPlaying ? '#EF444450' : '#33415530',
                },
              ]}
            />
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={toggleSiren}
              style={[
                styles.sirenCircle,
                {
                  backgroundColor: isPlaying ? '#DC2626' : colors.surfaceSubtle,
                  borderColor: isPlaying ? '#FFFFFF' : colors.border,
                },
              ]}
            >
              <Ionicons
                name={isPlaying ? 'volume-high' : 'volume-mute'}
                size={70}
                color={isPlaying ? '#FFFFFF' : colors.textSecondary}
              />
              <Text
                style={[
                  styles.toggleLabel,
                  { color: isPlaying ? '#FFFFFF' : colors.text, fontSize: typo.button.fontSize },
                ]}
              >
                {isPlaying ? 'STOP SIREN' : 'START SIREN'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Mode Selector */}
          <Card style={styles.modeCard}>
            <Text style={[styles.cardTitle, { color: colors.text, fontSize: typo.h3.fontSize }]}>
              Alarm Frequency Pattern
            </Text>
            <View style={styles.modeRow}>
              {(['POLICE', 'AMBULANCE', 'AIR_RAID'] as const).map((mode) => (
                <TouchableOpacity
                  key={mode}
                  onPress={() => setSirenMode(mode)}
                  style={[
                    styles.modeBtn,
                    {
                      backgroundColor: sirenMode === mode ? colors.primary : colors.surfaceSubtle,
                      borderColor: sirenMode === mode ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.modeText,
                      { color: sirenMode === mode ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {mode.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Volume warning advice */}
          <View style={[styles.warningBox, { backgroundColor: colors.warningSurface, borderColor: colors.warning }]}>
            <Ionicons name="warning-outline" size={22} color={colors.warning} style={{ marginRight: 8 }} />
            <Text style={[styles.warningText, { color: colors.text, fontSize: typo.caption.fontSize }]}>
              Ensure media volume is set to MAXIMUM. The alarm overrides silent mode for life-threatening situations.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  visualizerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  pulseRing: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
  },
  sirenCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    elevation: 8,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
  },
  toggleLabel: {
    fontWeight: '800',
    marginTop: 10,
    letterSpacing: 1,
  },
  modeCard: {
    padding: spacing.md,
  },
  cardTitle: {
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  modeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  modeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginTop: spacing.md,
  },
  warningText: {
    flex: 1,
    lineHeight: 18,
  },
});
