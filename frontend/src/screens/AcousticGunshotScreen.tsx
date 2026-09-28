import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '../store';
import { lightColors, darkColors, seniorTypography, normalTypography, spacing, borderRadius } from '../theme';
import { Header, Card, Badge, Button } from '../components';
import { SosEngine } from '../services/sos';

export const AcousticGunshotScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { settings, updateSettings } = useAppStore();
  const [isActive, setIsActive] = useState(settings.acousticDetectionEnabled);
  const [lastIncident, setLastIncident] = useState<{ type: string; db: number; time: string } | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isDark = settings.themeMode !== 'light';
  const colors = isDark ? darkColors : lightColors;
  const typo = settings.seniorMode ? seniorTypography : normalTypography;

  const toggleAcoustic = async () => {
    const next = !isActive;
    setIsActive(next);
    await updateSettings({ acousticDetectionEnabled: next });
  };

  const simulateIncident = (type: 'GUNSHOT' | 'GLASS_BREAK') => {
    if (!isActive) {
      Alert.alert('Detector Off', 'Please enable acoustic impulse detection first.');
      return;
    }

    if (settings.hapticFeedback) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    const incidentData = {
      type: type === 'GUNSHOT' ? 'High-Velocity Gunshot Impulse' : 'High-Frequency Glass Fracture',
      db: type === 'GUNSHOT' ? 128 : 112,
      time: new Date().toLocaleTimeString(),
    };

    setLastIncident(incidentData);
    setCountdown(5);

    let sec = 5;
    countdownTimerRef.current = setInterval(() => {
      sec -= 1;
      setCountdown(sec);
      if (sec <= 0) {
        clearInterval(countdownTimerRef.current!);
        countdownTimerRef.current = null;
        triggerAcousticSos();
      }
    }, 1000);
  };

  const handleCancelCountdown = () => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setCountdown(null);
  };

  const triggerAcousticSos = async () => {
    setCountdown(null);
    await SosEngine.triggerSOS('GUNSHOT_ACOUSTIC');
    navigation.navigate('ActiveSos');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Gunshot & Glass-Break Detection"
        subtitle="Acoustic rise-time & high-frequency shockwave classification"
        onBack={() => navigation.goBack()}
        rightAction={
          <Badge
            label={isActive ? 'MONITORING' : 'OFF'}
            variant={isActive ? 'danger' : 'neutral'}
          />
        }
      />

      <View style={styles.content}>
        {countdown !== null ? (
          <Card style={[styles.countdownCard, { borderColor: colors.danger }]}>
            <Ionicons name="alert-circle" size={40} color={colors.danger} />
            <Text style={[styles.countdownTitle, { color: colors.danger }]}>
              {lastIncident?.type.toUpperCase()} DETECTED!
            </Text>
            <Text style={[styles.countdownNumber, { color: colors.text }]}>{countdown}</Text>
            <Text style={[styles.countdownDesc, { color: colors.textSecondary }]}>
              Decibel: {lastIncident?.db} dB • Automated emergency dispatch in progress
            </Text>
            <Button
              title="False Alarm — Cancel SOS"
              variant="outline"
              onPress={handleCancelCountdown}
              style={{ marginTop: spacing.md, width: '100%' }}
            />
          </Card>
        ) : (
          <View style={styles.sensorStatusBox}>
            <View style={[styles.radarCircle, { backgroundColor: isActive ? '#DC262620' : colors.surfaceSubtle }]}>
              <Ionicons
                name="radio"
                size={54}
                color={isActive ? colors.danger : colors.textMuted}
              />
            </View>

            <Text style={[styles.monitorStatusText, { color: colors.text, fontSize: typo.h3.fontSize }]}>
              {isActive ? 'Acoustic Shockwave Listener Armed' : 'Acoustic Sensor Inactive'}
            </Text>
            <Text style={[styles.monitorSub, { color: colors.textSecondary }]}>
              Monitors rise-time (&lt;5ms) and spectral decay characteristic of supersonic gunfire and window breach
            </Text>

            <Button
              title={isActive ? 'Disarm Acoustic Sensor' : 'Arm Acoustic Sensor'}
              variant={isActive ? 'outline' : 'danger'}
              onPress={toggleAcoustic}
              style={{ width: 220, marginTop: spacing.lg }}
            />
          </View>
        )}

        {/* Test Simulator Section */}
        <Card style={styles.testCard}>
          <Text style={[styles.testTitle, { color: colors.text, fontSize: typo.h3.fontSize }]}>
            Acoustic Test Simulation
          </Text>
          <Text style={[styles.testDesc, { color: colors.textSecondary }]}>
            Test detection algorithms without real firearms or property damage:
          </Text>

          <View style={styles.testButtonsRow}>
            <Button
              title="Test Gunshot Impulse"
              variant="danger"
              size="sm"
              onPress={() => simulateIncident('GUNSHOT')}
              icon={<Ionicons name="flash" size={16} color="#FFFFFF" />}
              style={{ flex: 1, marginRight: 6 }}
            />
            <Button
              title="Test Glass Fracture"
              variant="secondary"
              size="sm"
              onPress={() => simulateIncident('GLASS_BREAK')}
              icon={<Ionicons name="hammer" size={16} color={colors.text} />}
              style={{ flex: 1 }}
            />
          </View>
        </Card>

        {/* Last Incident Log */}
        {lastIncident ? (
          <Card style={styles.incidentCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="checkmark-done" size={20} color="#10B981" style={{ marginRight: 8 }} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.incidentText, { color: colors.text }]}>{lastIncident.type}</Text>
                <Text style={[styles.incidentMeta, { color: colors.textSecondary }]}>
                  {lastIncident.time} • Recorded Spike: {lastIncident.db} dB SPL
                </Text>
              </View>
            </View>
          </Card>
        ) : null}
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
  sensorStatusBox: {
    alignItems: 'center',
    marginVertical: 20,
  },
  radarCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  monitorStatusText: {
    fontWeight: '800',
    textAlign: 'center',
  },
  monitorSub: {
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 290,
    lineHeight: 18,
  },
  countdownCard: {
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    marginVertical: 40,
  },
  countdownTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 8,
    textAlign: 'center',
  },
  countdownNumber: {
    fontSize: 64,
    fontWeight: '900',
    marginVertical: 4,
  },
  countdownDesc: {
    fontSize: 12,
    textAlign: 'center',
  },
  testCard: {
    padding: spacing.md,
  },
  testTitle: {
    fontWeight: '700',
    marginBottom: 4,
  },
  testDesc: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: spacing.md,
  },
  testButtonsRow: {
    flexDirection: 'row',
  },
  incidentCard: {
    padding: spacing.md,
    marginTop: spacing.xs,
  },
  incidentText: {
    fontWeight: '700',
    fontSize: 13,
  },
  incidentMeta: {
    fontSize: 11,
    marginTop: 2,
  },
});
