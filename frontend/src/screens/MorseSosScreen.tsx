import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useAppStore } from '../store';
import { lightColors, darkColors, seniorTypography, normalTypography, spacing, borderRadius } from '../theme';
import { Header, Card, Button } from '../components';

// SOS Morse timings in milliseconds
// S = dot dot dot (200, 200, 200, 200, 200)
// O = dash dash dash (600, 200, 600, 200, 600)
// S = dot dot dot (200, 200, 200, 200, 200)
const MORSE_PATTERN = [
  // S (...)
  { on: true, dur: 200, label: '·' },
  { on: false, dur: 200, label: '' },
  { on: true, dur: 200, label: '·' },
  { on: false, dur: 200, label: '' },
  { on: true, dur: 200, label: '·' },
  { on: false, dur: 600, label: '' }, // Letter pause

  // O (---)
  { on: true, dur: 600, label: '—' },
  { on: false, dur: 200, label: '' },
  { on: true, dur: 600, label: '—' },
  { on: false, dur: 200, label: '' },
  { on: true, dur: 600, label: '—' },
  { on: false, dur: 600, label: '' }, // Letter pause

  // S (...)
  { on: true, dur: 200, label: '·' },
  { on: false, dur: 200, label: '' },
  { on: true, dur: 200, label: '·' },
  { on: false, dur: 200, label: '' },
  { on: true, dur: 200, label: '·' },
  { on: false, dur: 1400, label: '' }, // Word repeat pause
];

export const MorseSosScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { settings } = useAppStore();
  const [isActive, setIsActive] = useState(false);
  const [isLightOn, setIsLightOn] = useState(false);
  const [currentSymbol, setCurrentSymbol] = useState('...');

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const stepIndexRef = useRef(0);

  const isDark = settings.themeMode !== 'light';
  const colors = isDark ? darkColors : lightColors;
  const typo = settings.seniorMode ? seniorTypography : normalTypography;

  useEffect(() => {
    if (isActive) {
      activateKeepAwakeAsync();
      stepIndexRef.current = 0;
      runMorseStep();
    } else {
      deactivateKeepAwake();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setIsLightOn(false);
    }

    return () => {
      deactivateKeepAwake();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isActive]);

  const runMorseStep = () => {
    const step = MORSE_PATTERN[stepIndexRef.current];
    setIsLightOn(step.on);
    if (step.label) setCurrentSymbol(step.label);

    stepIndexRef.current = (stepIndexRef.current + 1) % MORSE_PATTERN.length;

    timeoutRef.current = setTimeout(() => {
      runMorseStep();
    }, step.dur);
  };

  const toggleMorse = () => {
    setIsActive(!isActive);
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isLightOn ? '#FFFFFF' : (isDark ? '#0F172A' : '#F8FAFC') },
      ]}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <Header
          title="Morse SOS Optical Beacon"
          subtitle="International optical rescue beacon (... --- ...)"
          onBack={() => {
            setIsActive(false);
            navigation.goBack();
          }}
        />

        <View style={styles.content}>
          {/* Main Visual Strobe Area */}
          <View style={styles.strobeBox}>
            <View
              style={[
                styles.bulbCircle,
                {
                  backgroundColor: isLightOn ? '#FBBF24' : '#1E293B',
                  borderColor: isLightOn ? '#FFFFFF' : '#334155',
                },
              ]}
            >
              <Ionicons
                name="flash"
                size={80}
                color={isLightOn ? '#FFFFFF' : '#64748B'}
              />
            </View>

            <Text
              style={[
                styles.morseSymbolText,
                { color: isLightOn ? '#000000' : colors.text, fontSize: 36 },
              ]}
            >
              {isActive ? (isLightOn ? currentSymbol : ' ') : '· · ·  — — —  · · ·'}
            </Text>
            <Text
              style={[
                styles.morseStatus,
                { color: isLightOn ? '#334155' : colors.textSecondary },
              ]}
            >
              {isActive
                ? isLightOn
                  ? 'TRANSMITTING LIGHT'
                  : 'PAUSE'
                : 'BEACON STANDBY'}
            </Text>
          </View>

          {/* Explanation Card */}
          <Card style={styles.infoCard}>
            <Text style={[styles.infoTitle, { color: colors.text }]}>Optical SOS Protocol</Text>
            <Text style={[styles.infoDesc, { color: colors.textSecondary }]}>
              Flashing visible up to 5 km at night. Point screen toward search planes, drone rescue teams, or coast guard boats.
            </Text>
          </Card>

          {/* Toggle Button */}
          <Button
            title={isActive ? 'Turn Off Beacon' : 'Activate Morse Beacon'}
            variant={isActive ? 'danger' : 'primary'}
            size="lg"
            onPress={toggleMorse}
            icon={<Ionicons name={isActive ? 'stop' : 'play'} size={24} color="#FFFFFF" />}
            style={{ width: '100%', marginBottom: spacing.lg }}
          />
        </View>
      </SafeAreaView>
    </View>
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
  strobeBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  bulbCircle: {
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    elevation: 8,
  },
  morseSymbolText: {
    fontWeight: '900',
    letterSpacing: 6,
    height: 44,
  },
  morseStatus: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 4,
  },
  infoCard: {
    padding: spacing.md,
  },
  infoTitle: {
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 4,
  },
  infoDesc: {
    fontSize: 12,
    lineHeight: 18,
  },
});
