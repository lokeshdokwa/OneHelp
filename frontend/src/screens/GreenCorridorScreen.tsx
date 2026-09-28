import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../store';
import { lightColors, darkColors, seniorTypography, normalTypography, spacing, borderRadius } from '../theme';
import { Header, Card, Badge, Input, Button } from '../components';
import { GreenCorridorRequest } from '../types';
import { ApiService } from '../services/api';
import { BleMesh } from '../services/bleRelay';

export const GreenCorridorScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { settings, currentLocation } = useAppStore();

  const [ambulancePlate, setAmbulancePlate] = useState('DL-01-AB-1234');
  const [condition, setCondition] = useState<GreenCorridorRequest['patientCondition']>('CRITICAL_CARDIAC');
  const [originHospital, setOriginHospital] = useState('Civil Hospital Rohini');
  const [destHospital, setDestHospital] = useState('AIIMS Trauma Center, New Delhi');
  const [activeCorridor, setActiveCorridor] = useState<GreenCorridorRequest | null>(null);
  const [clearedSignals, setClearedSignals] = useState(0);

  const isDark = settings.themeMode !== 'light';
  const colors = isDark ? darkColors : lightColors;
  const typo = settings.seniorMode ? seniorTypography : normalTypography;

  const handleRequestCorridor = async () => {
    if (!ambulancePlate.trim() || !destHospital.trim()) {
      Alert.alert('Missing Field', 'Please provide ambulance plate and destination hospital.');
      return;
    }

    const lat = currentLocation?.latitude || 28.6300;
    const lng = currentLocation?.longitude || 77.2000;

    const request: GreenCorridorRequest = {
      id: `gc_${Date.now()}`,
      ambulancePlate: ambulancePlate.trim().toUpperCase(),
      patientCondition: condition,
      originHospital: originHospital.trim(),
      destinationHospital: destHospital.trim(),
      currentLat: lat,
      currentLng: lng,
      destLat: 28.5672,
      destLng: 77.2100,
      etaMinutes: 14,
      routeSummary: 'Ring Road via Barapullah Flyover (12.4 km)',
      status: 'ACTIVE',
    };

    try {
      const res = await ApiService.sendGreenCorridor(request);
      setActiveCorridor(request);
      setClearedSignals(res.signalsClearedCount || 8);

      // Rebroadcast over Bluetooth mesh to notify nearby citizen drivers to yield
      await BleMesh.broadcastSosPacket({
        sosId: request.id,
        userId: 'ambulance_unit',
        timestamp: Date.now(),
        location: currentLocation,
        triggerType: 'MANUAL_BUTTON',
        isSilent: false,
        messageText: `AMBULANCE GREEN CORRIDOR: ${request.ambulancePlate} approaching on ${request.routeSummary}. Please yield lane!`,
      });

      Alert.alert('Corridor Established', res.message);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to establish corridor');
    }
  };

  const handleClearCorridor = () => {
    setActiveCorridor(null);
    setClearedSignals(0);
    Alert.alert('Corridor Terminated', 'Traffic signal controls reverted to normal operation.');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Ambulance Green Corridor"
        subtitle="Automated smart traffic preemption & vehicle-to-vehicle lane clearance"
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeCorridor ? (
          <Card style={[styles.activeCard, { borderColor: '#10B981' }]}>
            <View style={styles.activeHeader}>
              <View style={[styles.activeIconCircle, { backgroundColor: '#10B981' }]}>
                <Ionicons name="car-sport" size={28} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[styles.activePlate, { color: colors.text, fontSize: typo.h3.fontSize }]}>
                    {activeCorridor.ambulancePlate}
                  </Text>
                  <Badge label="ACTIVE CORRIDOR" variant="success" style={{ marginLeft: 8 }} />
                </View>
                <Text style={[styles.activeRoute, { color: colors.textSecondary }]}>
                  {activeCorridor.routeSummary}
                </Text>
              </View>
            </View>

            <View style={[styles.signalsBox, { backgroundColor: colors.surfaceSubtle }]}>
              <View style={styles.signalStat}>
                <Text style={[styles.signalNum, { color: '#10B981' }]}>{clearedSignals}</Text>
                <Text style={[styles.signalLabel, { color: colors.textSecondary }]}>Signals Cleared Green</Text>
              </View>
              <View style={styles.signalStat}>
                <Text style={[styles.signalNum, { color: colors.primary }]}>{activeCorridor.etaMinutes}m</Text>
                <Text style={[styles.signalLabel, { color: colors.textSecondary }]}>Target ETA</Text>
              </View>
            </View>

            <Text style={[styles.broadcastNote, { color: colors.textSecondary }]}>
              Broadcasting lane clearance alert to all OneHelp mobile nodes within 1.5km via Bluetooth Low Energy mesh.
            </Text>

            <Button
              title="Patient Delivered / Terminate Corridor"
              variant="outline"
              onPress={handleClearCorridor}
              style={{ marginTop: spacing.md }}
            />
          </Card>
        ) : (
          <Card style={styles.card}>
            <Text style={[styles.cardTitle, { color: colors.text, fontSize: typo.h3.fontSize }]}>
              Request Emergency Traffic Preemption
            </Text>

            <Input
              label="Ambulance Vehicle Number"
              placeholder="e.g. DL-01-AB-1234"
              value={ambulancePlate}
              onChangeText={setAmbulancePlate}
            />

            <Text style={[styles.label, { color: colors.textSecondary, fontSize: typo.caption.fontSize }]}>
              PATIENT CLINICAL SEVERITY
            </Text>
            <View style={styles.conditionRow}>
              {[
                { key: 'CRITICAL_CARDIAC', label: 'Cardiac Arrest' },
                { key: 'TRAUMA', label: 'Polytrauma' },
                { key: 'STROKE', label: 'Stroke (CVA)' },
              ].map((c) => (
                <TouchableOpacity
                  key={c.key}
                  onPress={() => setCondition(c.key as any)}
                  style={[
                    styles.conditionBtn,
                    {
                      backgroundColor: condition === c.key ? colors.primary : colors.surfaceSubtle,
                      borderColor: condition === c.key ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.conditionBtnText, { color: condition === c.key ? '#FFFFFF' : colors.text }]}>
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Input
              label="Origin Hospital / Pickup Point"
              value={originHospital}
              onChangeText={setOriginHospital}
            />

            <Input
              label="Destination Trauma Center"
              value={destHospital}
              onChangeText={setDestHospital}
            />

            <Button
              title="Broadcast Green Corridor"
              variant="primary"
              size="lg"
              onPress={handleRequestCorridor}
              icon={<Ionicons name="navigate" size={20} color="#FFFFFF" />}
              style={{ marginTop: spacing.lg }}
            />
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl + 30,
  },
  card: {
    padding: spacing.md,
  },
  cardTitle: {
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  label: {
    fontWeight: '700',
    marginTop: spacing.sm,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  conditionRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  conditionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    marginHorizontal: 3,
  },
  conditionBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  activeCard: {
    padding: spacing.md,
    borderWidth: 2,
  },
  activeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activePlate: {
    fontWeight: '800',
  },
  activeRoute: {
    fontSize: 12,
    marginTop: 2,
  },
  signalsBox: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 14,
    borderRadius: borderRadius.md,
    marginVertical: spacing.md,
  },
  signalStat: {
    alignItems: 'center',
  },
  signalNum: {
    fontSize: 28,
    fontWeight: '900',
  },
  signalLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  broadcastNote: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
});
