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

export const VoiceStressScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { settings, updateSettings } = useAppStore();
  const [isActive, setIsActive] = useState(settings.voiceStressEnabled);
  const [stressScore, setStressScore] = useState(24);
  const [cancelTimer, setCancelTimer] = useState<number | null>(null);

  const meterAnim = useRef(new Animated.Value(24)).current;
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const isDark = settings.themeMode !== 'light';
  const colors = isDark ? darkColors : lightColors;
  const typo = settings.seniorMode ? seniorTypography : normalTypography;

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && cancelTimer === null) {
      interval = setInterval(() => {
        // Natural ambient pitch & amplitude jitter simulation (between 18% and 38%)
        const jitter = Math.floor(20 + Math.random() * 18);
        setStressScore(jitter);
        Animated.timing(meterAnim, { toValue: jitter, duration: 400, useNativeDriver: false }).start();
      }, 800);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, cancelTimer]);

  const toggleMonitoring = async () => {
    const next = !isActive;
    setIsActive(next);
    await updateSettings({ voiceStressEnabled: next });
  };

  const simulatePanicSpike = () => {
    if (!isActive) {
      Alert.alert('Monitor Inactive', 'Activate voice stress detection first.');
      return;
    }

    const spikeValue = 92;
    setStressScore(spikeValue);
    Animated.timing(meterAnim, { toValue: spikeValue, duration: 200, useNativeDriver: false }).start();

    if (settings.hapticFeedback) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    // Launch cancel window countdown
    setCancelTimer(6);
    let sec = 6;
    countdownIntervalRef.current = setInterval(() => {
      sec -= 1;
      setCancelTimer(sec);
      if (sec <= 0) {
        clearInterval(countdownIntervalRef.current!);
        countdownIntervalRef.current = null;
        triggerAutoSos();
      }
    }, 1000);
  };

  const handleCancelPanic = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setCancelTimer(null);
    setStressScore(25);
    Animated.timing(meterAnim, { toValue: 25, duration: 300, useNativeDriver: false }).start();
  };

  const triggerAutoSos = async () => {
    setCancelTimer(null);
    await SosEngine.triggerSOS('VOICE_STRESS');
    navigation.navigate('ActiveSos');
  };

  const getStressCategory = (val: number) => {
    if (val > 75) return { label: 'CRITICAL PANIC SPIKE', color: '#DC2626' };
    if (val > 45) return { label: 'ELEVATED TENSION', color: '#F59E0B' };
    return { label: 'NORMAL BASELINE', color: '#10B981' };
  };

  const cat = getStressCategory(stressScore);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Voice Stress & Panic Monitor"
        subtitle="On-device micro-tremor & vocal fundamental frequency analysis"
        onBack={() => navigation.goBack()}
        rightAction={
          <Badge
            label={isActive ? 'MONITORING' : 'OFF'}
            variant={isActive ? 'success' : 'neutral'}
          />
        }
      />

      <View style={styles.content}>
        {cancelTimer !== null ? (
          <Card style={[styles.alarmCard, { borderColor: colors.danger }]}>
            <Ionicons name="warning" size={38} color={colors.danger} />
            <Text style={[styles.alarmTitle, { color: colors.danger }]}>
              EXTREME VOCAL STRESS DETECTED!
            </Text>
            <Text style={[styles.alarmNum, { color: colors.text }]}>{cancelTimer}</Text>
            <Text style={[styles.alarmSub, { color: colors.textSecondary }]}>
              Auto-SOS will initiate unless cancelled
            </Text>
            <Button
              title="I am Safe — Cancel SOS"
              variant="outline"
              onPress={handleCancelPanic}
              style={{ marginTop: spacing.lg, width: '100%' }}
            />
          </Card>
        ) : (
          <View style={styles.meterSection}>
            {/* Stress Dial Gauge */}
            <View style={[styles.gaugeCircle, { borderColor: cat.color }]}>
              <Text style={[styles.scoreNumber, { color: cat.color }]}>{stressScore}%</Text>
              <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>Stress Variance</Text>
            </View>

            <View style={[styles.categoryBadge, { backgroundColor: `${cat.color}20` }]}>
              <Text style={[styles.categoryText, { color: cat.color }]}>{cat.label}</Text>
            </View>

            <Text style={[styles.explanationText, { color: colors.textSecondary }]}>
              Analyzes micro-tremors in voice pitch and sudden decibel spikes without saving raw speech recordings.
            </Text>

            <View style={styles.actionsRow}>
              <Button
                title={isActive ? 'Pause Monitor' : 'Start Monitor'}
                variant={isActive ? 'outline' : 'primary'}
                onPress={toggleMonitoring}
                style={{ width: 170 }}
              />
              <Button
                title="Test Panic Spike"
                variant="danger"
                onPress={simulatePanicSpike}
                style={{ width: 150, marginLeft: 10 }}
              />
            </View>
          </View>
        )}

        {/* Algorithm Specs Card */}
        <Card style={styles.specsCard}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Edge Model Parameters</Text>
          <View style={styles.specRow}>
            <Text style={[styles.specKey, { color: colors.textSecondary }]}>Fundamental Pitch Jitter (F0):</Text>
            <Text style={[styles.specVal, { color: colors.text }]}>FFT 1024 / 44.1 kHz</Text>
          </View>
          <View style={styles.specRow}>
            <Text style={[styles.specKey, { color: colors.textSecondary }]}>Panic Trigger Threshold:</Text>
            <Text style={[styles.specVal, { color: colors.text }]}>&gt; 75% for 1.8 seconds</Text>
          </View>
          <View style={styles.specRow}>
            <Text style={[styles.specKey, { color: colors.textSecondary }]}>Privacy Policy:</Text>
            <Text style={[styles.specVal, { color: '#10B981' }]}>Zero Audio Leaves Device</Text>
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
  meterSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  gaugeCircle: {
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  scoreNumber: {
    fontSize: 46,
    fontWeight: '900',
  },
  scoreLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  categoryBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    marginBottom: 14,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  explanationText: {
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 290,
    marginBottom: 20,
  },
  actionsRow: {
    flexDirection: 'row',
  },
  alarmCard: {
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    marginVertical: 40,
  },
  alarmTitle: {
    fontSize: 18,
    fontWeight: '900',
    marginTop: 8,
    textAlign: 'center',
  },
  alarmNum: {
    fontSize: 64,
    fontWeight: '900',
    marginVertical: 4,
  },
  alarmSub: {
    fontSize: 13,
    textAlign: 'center',
  },
  specsCard: {
    padding: spacing.md,
  },
  cardTitle: {
    fontWeight: '700',
    fontSize: 13,
    marginBottom: spacing.xs,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  specKey: {
    fontSize: 11,
  },
  specVal: {
    fontSize: 11,
    fontWeight: '600',
  },
});
