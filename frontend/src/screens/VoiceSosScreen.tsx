import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '../store';
import { lightColors, darkColors, seniorTypography, normalTypography, spacing, borderRadius } from '../theme';
import { Header, Card, Badge, Button } from '../components';
import { SosEngine } from '../services/sos';

export const VoiceSosScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { settings, updateSettings } = useAppStore();
  const [isListening, setIsListening] = useState(settings.voiceSosEnabled);
  const [detectedKeyword, setDetectedKeyword] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  const waveAnim1 = useRef(new Animated.Value(20)).current;
  const waveAnim2 = useRef(new Animated.Value(30)).current;
  const waveAnim3 = useRef(new Animated.Value(25)).current;
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isDark = settings.themeMode !== 'light';
  const colors = isDark ? darkColors : lightColors;
  const typo = settings.seniorMode ? seniorTypography : normalTypography;

  // Waveform animation
  useEffect(() => {
    let animLoop: Animated.CompositeAnimation | null = null;
    if (isListening) {
      animLoop = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(waveAnim1, { toValue: 70, duration: 300, useNativeDriver: false }),
            Animated.timing(waveAnim2, { toValue: 85, duration: 450, useNativeDriver: false }),
            Animated.timing(waveAnim3, { toValue: 60, duration: 380, useNativeDriver: false }),
          ]),
          Animated.parallel([
            Animated.timing(waveAnim1, { toValue: 15, duration: 300, useNativeDriver: false }),
            Animated.timing(waveAnim2, { toValue: 25, duration: 450, useNativeDriver: false }),
            Animated.timing(waveAnim3, { toValue: 20, duration: 380, useNativeDriver: false }),
          ]),
        ])
      );
      animLoop.start();
    } else {
      waveAnim1.setValue(20);
      waveAnim2.setValue(20);
      waveAnim3.setValue(20);
    }
    return () => animLoop?.stop();
  }, [isListening]);

  const toggleListening = async () => {
    const next = !isListening;
    setIsListening(next);
    await updateSettings({ voiceSosEnabled: next });
    if (settings.hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const simulateKeywordDetected = (word: string) => {
    if (!isListening) {
      Alert.alert('Listener Inactive', 'Please enable Voice SOS listening first.');
      return;
    }

    if (settings.hapticFeedback) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }

    setDetectedKeyword(word);
    setCountdown(5);

    let sec = 5;
    countdownTimerRef.current = setInterval(() => {
      sec -= 1;
      setCountdown(sec);
      if (sec <= 0) {
        clearInterval(countdownTimerRef.current!);
        countdownTimerRef.current = null;
        triggerVoiceSos();
      }
    }, 1000);
  };

  const handleCancelCountdown = () => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setCountdown(null);
    setDetectedKeyword(null);
    if (settings.hapticFeedback) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const triggerVoiceSos = async () => {
    setCountdown(null);
    setDetectedKeyword(null);
    await SosEngine.triggerSOS('VOICE_KEYWORD');
    navigation.navigate('ActiveSos');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Voice-Activated SOS"
        subtitle="Hands-free trigger via emergency spoken keywords"
        onBack={() => navigation.goBack()}
        rightAction={
          <Badge
            label={isListening ? 'LISTENING' : 'OFF'}
            variant={isListening ? 'success' : 'neutral'}
          />
        }
      />

      <View style={styles.content}>
        {/* Countdown warning overlay */}
        {countdown !== null ? (
          <Card style={[styles.countdownCard, { borderColor: colors.danger }]}>
            <Ionicons name="warning" size={32} color={colors.danger} />
            <Text style={[styles.detectedTitle, { color: colors.danger }]}>
              "{detectedKeyword}" DETECTED!
            </Text>
            <Text style={[styles.countdownNum, { color: colors.text }]}>{countdown}</Text>
            <Text style={[styles.countdownHelp, { color: colors.textSecondary }]}>
              SOS will automatically broadcast if not cancelled
            </Text>
            <Button
              title="Cancel Emergency"
              variant="outline"
              onPress={handleCancelCountdown}
              style={{ marginTop: spacing.md, width: '100%' }}
            />
          </Card>
        ) : (
          <View style={styles.visualizerArea}>
            <View style={[styles.micCircle, { backgroundColor: isListening ? colors.primaryMuted : colors.surfaceSubtle }]}>
              <Ionicons
                name={isListening ? 'mic' : 'mic-off'}
                size={54}
                color={isListening ? colors.primary : colors.textMuted}
              />
            </View>

            {/* Simulated Animated Audio Waveform */}
            <View style={styles.waveRow}>
              {[waveAnim1, waveAnim2, waveAnim3, waveAnim2, waveAnim1].map((anim, i) => (
                <Animated.View
                  key={i}
                  style={[
                    styles.waveBar,
                    {
                      height: anim,
                      backgroundColor: isListening ? colors.primary : colors.textMuted,
                    },
                  ]}
                />
              ))}
            </View>

            <Text style={[styles.statusText, { color: colors.text, fontSize: typo.h3.fontSize }]}>
              {isListening ? 'Listening for Emergency Keywords...' : 'Continuous Voice Monitor Inactive'}
            </Text>
            <Text style={[styles.statusSub, { color: colors.textSecondary, fontSize: typo.caption.fontSize }]}>
              Optimized low-power on-device acoustic keyword recognizer
            </Text>

            <Button
              title={isListening ? 'Pause Voice Monitor' : 'Start Voice Listening'}
              variant={isListening ? 'outline' : 'primary'}
              onPress={toggleListening}
              style={{ width: 220, marginTop: spacing.lg }}
            />
          </View>
        )}

        {/* Supported Keywords Card */}
        <Card style={styles.keywordsCard}>
          <Text style={[styles.cardTitle, { color: colors.text, fontSize: typo.h3.fontSize }]}>
            Trigger Keywords (Bilingual)
          </Text>

          <View style={styles.chipsWrap}>
            <TouchableOpacity onPress={() => simulateKeywordDetected('HELP')}>
              <View style={[styles.wordChip, { backgroundColor: colors.surfaceSubtle }]}>
                <Text style={[styles.wordText, { color: colors.text }]}>"Help!"</Text>
                <Text style={styles.testTag}>Tap to test</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => simulateKeywordDetected('BACHAO')}>
              <View style={[styles.wordChip, { backgroundColor: colors.surfaceSubtle }]}>
                <Text style={[styles.wordText, { color: colors.text }]}>"बचाओ!" (Bachao)</Text>
                <Text style={styles.testTag}>Tap to test</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => simulateKeywordDetected('SOS')}>
              <View style={[styles.wordChip, { backgroundColor: colors.surfaceSubtle }]}>
                <Text style={[styles.wordText, { color: colors.text }]}>"S.O.S"</Text>
                <Text style={styles.testTag}>Tap to test</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => simulateKeywordDetected('MADAD')}>
              <View style={[styles.wordChip, { backgroundColor: colors.surfaceSubtle }]}>
                <Text style={[styles.wordText, { color: colors.text }]}>"मदद करो!"</Text>
                <Text style={styles.testTag}>Tap to test</Text>
              </View>
            </TouchableOpacity>
          </View>
        </Card>
      </View>
    </SafeAreaView>
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
  visualizerArea: {
    alignItems: 'center',
    marginVertical: 20,
  },
  micCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  waveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 90,
    marginBottom: 10,
  },
  waveBar: {
    width: 6,
    borderRadius: 3,
    marginHorizontal: 4,
  },
  statusText: {
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 10,
  },
  statusSub: {
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 260,
  },
  countdownCard: {
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    marginVertical: 40,
  },
  detectedTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 8,
  },
  countdownNum: {
    fontSize: 64,
    fontWeight: '900',
    marginVertical: 4,
  },
  countdownHelp: {
    fontSize: 13,
    textAlign: 'center',
  },
  keywordsCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  wordChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    marginRight: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  wordText: {
    fontWeight: '700',
    fontSize: 14,
  },
  testTag: {
    fontSize: 10,
    color: '#3B82F6',
    marginTop: 2,
  },
});
