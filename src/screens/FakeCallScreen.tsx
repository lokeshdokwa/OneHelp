import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Vibration,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { setAudioModeAsync, createAudioPlayer, AudioPlayer } from 'expo-audio';
import { useAppStore } from '../store';
import { lightColors, darkColors, seniorTypography, normalTypography, spacing, borderRadius } from '../theme';
import { Header, Card, Input, Button } from '../components';

type CallState = 'CONFIG' | 'COUNTDOWN' | 'RINGING' | 'IN_CALL';

export const FakeCallScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { settings } = useAppStore();

  const [callerName, setCallerName] = useState('Papa (Home)');
  const [callerNumber, setCallerNumber] = useState('+91 98112 34567');
  const [delaySeconds, setDelaySeconds] = useState(5);
  const [countdownRemaining, setCountdownRemaining] = useState(0);
  const [callState, setCallState] = useState<CallState>('CONFIG');
  const [callDuration, setCallDuration] = useState(0);

  const ringAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const ringtonePlayerRef = useRef<AudioPlayer | null>(null);

  const isDark = settings.themeMode !== 'light';
  const colors = isDark ? darkColors : lightColors;
  const typo = settings.seniorMode ? seniorTypography : normalTypography;

  // Ring animation & ringtone audio playback
  useEffect(() => {
    let animLoop: Animated.CompositeAnimation | null = null;
    if (callState === 'RINGING') {
      Vibration.vibrate([0, 1000, 800, 1000, 800, 1000], true);
      animLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(ringAnim, { toValue: 1.15, duration: 600, useNativeDriver: true }),
          Animated.timing(ringAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      );
      animLoop.start();

      // Start incoming ringtone using expo-audio
      setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
      try {
        const player = createAudioPlayer({
          uri: 'https://actions.google.com/sounds/v1/telephones/telephone_ring.ogg',
        });
        player.loop = true;
        player.play();
        ringtonePlayerRef.current = player;
      } catch (e) {
        console.warn('[FakeCall] Ringtone audio error:', e);
      }
    } else {
      Vibration.cancel();
      ringAnim.setValue(1);
      if (ringtonePlayerRef.current) {
        try {
          ringtonePlayerRef.current.pause();
        } catch {}
        ringtonePlayerRef.current = null;
      }
    }
    return () => {
      Vibration.cancel();
      animLoop?.stop();
      if (ringtonePlayerRef.current) {
        try {
          ringtonePlayerRef.current.pause();
        } catch {}
        ringtonePlayerRef.current = null;
      }
    };
  }, [callState]);

  // Duration timer during in-call
  useEffect(() => {
    if (callState === 'IN_CALL') {
      durationTimerRef.current = setInterval(() => {
        setCallDuration((d) => d + 1);
      }, 1000);
    } else {
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
      setCallDuration(0);
    }
    return () => {
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    };
  }, [callState]);

  const handleStartFakeCall = () => {
    if (delaySeconds === 0) {
      setCallState('RINGING');
      return;
    }

    setCountdownRemaining(delaySeconds);
    setCallState('COUNTDOWN');

    let count = delaySeconds;
    timerRef.current = setInterval(() => {
      count -= 1;
      setCountdownRemaining(count);
      if (count <= 0) {
        clearInterval(timerRef.current!);
        setCallState('RINGING');
      }
    }, 1000);
  };

  const handleCancelCountdown = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCallState('CONFIG');
  };

  const handleAcceptCall = () => {
    Vibration.cancel();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCallState('IN_CALL');
  };

  const handleDeclineCall = () => {
    Vibration.cancel();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setCallState('CONFIG');
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // FULL SCREEN RINGING INTERFACE
  if (callState === 'RINGING') {
    return (
      <View style={styles.ringingFullScreen}>
        <View style={styles.ringingTopSection}>
          <Text style={styles.incomingLabel}>INCOMING CALL</Text>
          <Animated.View style={[styles.ringingAvatar, { transform: [{ scale: ringAnim }] }]}>
            <Ionicons name="person" size={54} color="#FFFFFF" />
          </Animated.View>
          <Text style={styles.ringingName}>{callerName}</Text>
          <Text style={styles.ringingNumber}>{callerNumber}</Text>
        </View>

        <View style={styles.ringingActionsRow}>
          {/* Decline Button */}
          <TouchableOpacity
            onPress={handleDeclineCall}
            style={[styles.callCircleBtn, { backgroundColor: '#DC2626' }]}
            accessibilityLabel="Decline fake call"
          >
            <Ionicons name="call" size={32} color="#FFFFFF" style={{ transform: [{ rotate: '135deg' }] }} />
            <Text style={styles.callActionLabel}>Decline</Text>
          </TouchableOpacity>

          {/* Accept Button */}
          <TouchableOpacity
            onPress={handleAcceptCall}
            style={[styles.callCircleBtn, { backgroundColor: '#10B981' }]}
            accessibilityLabel="Accept fake call"
          >
            <Ionicons name="call" size={32} color="#FFFFFF" />
            <Text style={styles.callActionLabel}>Accept</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ACTIVE IN-CALL INTERFACE
  if (callState === 'IN_CALL') {
    return (
      <View style={styles.ringingFullScreen}>
        <View style={styles.ringingTopSection}>
          <Text style={styles.inCallDuration}>{formatSeconds(callDuration)}</Text>
          <View style={styles.inCallAvatar}>
            <Ionicons name="person" size={54} color="#FFFFFF" />
          </View>
          <Text style={styles.ringingName}>{callerName}</Text>
          <Text style={styles.ringingNumber}>{callerNumber}</Text>
          <Text style={styles.audioPlayingText}>
            Audio: "Where are you? We are standing right outside with the car!"
          </Text>
        </View>

        <View style={styles.inCallControlsGrid}>
          <View style={styles.controlIconBtn}>
            <Ionicons name="mic-off" size={26} color="#FFFFFF" />
            <Text style={styles.controlLabel}>Mute</Text>
          </View>
          <View style={styles.controlIconBtn}>
            <Ionicons name="keypad" size={26} color="#FFFFFF" />
            <Text style={styles.controlLabel}>Keypad</Text>
          </View>
          <View style={styles.controlIconBtn}>
            <Ionicons name="volume-high" size={26} color="#FFFFFF" />
            <Text style={styles.controlLabel}>Speaker</Text>
          </View>
        </View>

        <View style={styles.endCallContainer}>
          <TouchableOpacity
            onPress={handleDeclineCall}
            style={[styles.callCircleBtn, { backgroundColor: '#DC2626' }]}
            accessibilityLabel="End call"
          >
            <Ionicons name="call" size={32} color="#FFFFFF" style={{ transform: [{ rotate: '135deg' }] }} />
            <Text style={styles.callActionLabel}>End</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // COUNTDOWN SCREEN
  if (callState === 'COUNTDOWN') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Fake Call Scheduled" onBack={handleCancelCountdown} />
        <View style={styles.countdownCenter}>
          <View style={[styles.timerCircle, { borderColor: colors.primary }]}>
            <Text style={[styles.timerBigNum, { color: colors.primary }]}>{countdownRemaining}</Text>
            <Text style={[styles.timerUnit, { color: colors.textSecondary }]}>seconds</Text>
          </View>
          <Text style={[styles.countdownText, { color: colors.text, fontSize: typo.h3.fontSize }]}>
            Phone will ring as "{callerName}"
          </Text>
          <Text style={[styles.countdownSub, { color: colors.textSecondary }]}>
            You can lock your phone or leave it face up on the table to escape safely.
          </Text>
          <Button
            title="Cancel Call"
            variant="outline"
            onPress={handleCancelCountdown}
            style={{ marginTop: spacing.xl, width: 200 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  // CONFIGURATION SCREEN
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Fake Incoming Call"
        subtitle="Simulate realistic emergency call to exit unsafe scenarios"
        onBack={() => navigation.goBack()}
      />

      <View style={styles.configContent}>
        <Card style={styles.configCard}>
          <Input
            label="Caller Name"
            placeholder="e.g. Police Station, Dad, Officer Verma"
            value={callerName}
            onChangeText={setCallerName}
          />
          <Input
            label="Phone Number"
            placeholder="e.g. +91 98112 34567"
            keyboardType="phone-pad"
            value={callerNumber}
            onChangeText={setCallerNumber}
          />

          <Text style={[styles.delayLabel, { color: colors.textSecondary, fontSize: typo.caption.fontSize }]}>
            RING DELAY TIMER
          </Text>
          <View style={styles.delayButtonsRow}>
            {[
              { label: 'Now', sec: 0 },
              { label: '5 sec', sec: 5 },
              { label: '15 sec', sec: 15 },
              { label: '30 sec', sec: 30 },
              { label: '1 min', sec: 60 },
            ].map((item) => (
              <TouchableOpacity
                key={item.sec}
                onPress={() => setDelaySeconds(item.sec)}
                style={[
                  styles.delayBtn,
                  {
                    backgroundColor: delaySeconds === item.sec ? colors.primary : colors.surfaceSubtle,
                    borderColor: delaySeconds === item.sec ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.delayBtnText,
                    { color: delaySeconds === item.sec ? '#FFFFFF' : colors.text },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button
            title={delaySeconds === 0 ? 'Trigger Call Now' : `Schedule Call (${delaySeconds}s)`}
            variant="primary"
            onPress={handleStartFakeCall}
            icon={<Ionicons name="call" size={20} color="#FFFFFF" />}
            style={{ marginTop: spacing.xl }}
          />
        </Card>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  configContent: {
    padding: spacing.lg,
  },
  configCard: {
    padding: spacing.lg,
  },
  delayLabel: {
    fontWeight: '700',
    marginTop: spacing.md,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  delayButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  delayBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  delayBtnText: {
    fontWeight: '700',
    fontSize: 12,
  },
  countdownCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  timerCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  timerBigNum: {
    fontSize: 52,
    fontWeight: '900',
  },
  timerUnit: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  countdownText: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  countdownSub: {
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  // Ringing Screen Styles
  ringingFullScreen: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'space-between',
    paddingVertical: 60,
    paddingHorizontal: 30,
  },
  ringingTopSection: {
    alignItems: 'center',
    marginTop: 30,
  },
  incomingLabel: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 20,
  },
  inCallDuration: {
    color: '#34D399',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 20,
  },
  ringingAvatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  inCallAvatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  ringingName: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 4,
  },
  ringingNumber: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '500',
  },
  audioPlayingText: {
    color: '#FCD34D',
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  ringingActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  callCircleBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callActionLabel: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  inCallControlsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  controlIconBtn: {
    alignItems: 'center',
  },
  controlLabel: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 6,
  },
  endCallContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
});
