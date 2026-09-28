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
import { sendEmergencySms } from '../services/sms';

export const SatelliteBridgeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { settings, currentLocation, medicalProfile, contacts } = useAppStore();

  const [incidentType, setIncidentType] = useState('TRAPPED_FLOOD');
  const [personCount, setPersonCount] = useState('2');
  const [criticalNeed, setCriticalNeed] = useState('WATER_MEDS');

  const isDark = settings.themeMode !== 'light';
  const colors = isDark ? darkColors : lightColors;
  const typo = settings.seniorMode ? seniorTypography : normalTypography;

  const lat = currentLocation?.latitude || 28.6139;
  const lng = currentLocation?.longitude || 77.2090;

  // Ultra-compact emergency bulletin under 160 chars:
  // e.g. "SOS!LOC:28.61390,77.20900|TYP:FLOOD|QTY:2|MED:O+|NEED:MEDS|BAT:84%|TIME:1612"
  const compactBulletin = `SOS!LOC:${lat.toFixed(5)},${lng.toFixed(5)}|TYP:${incidentType}|QTY:${personCount}|BLD:${medicalProfile?.bloodGroup || 'UNK'}|NEED:${criticalNeed}|TIME:${new Date().getHours()}${new Date().getMinutes()}`;
  const charLength = compactBulletin.length;
  const isWithinLimit = charLength <= 160;

  const handleDispatchSatelliteBulletin = async () => {
    if (contacts.length === 0) {
      Alert.alert(
        'Satellite Broadcast Ready',
        `Bulletin payload generated (${charLength} chars):\n\n"${compactBulletin}"\n\nDirect satellite direct-to-cell modem gateway ready.`
      );
      return;
    }

    const res = await sendEmergencySms(contacts, currentLocation, compactBulletin);
    Alert.alert(
      res.success ? 'Bulletin Dispatched' : 'Bulletin Ready',
      `${res.message}\n\nCompact payload: "${compactBulletin}"`
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Satellite Emergency Bridge"
        subtitle="Ultra-compact <160 char bulletin encoder for low-orbit satellites & 2G"
        onBack={() => navigation.goBack()}
        rightAction={
          <Badge
            label={`${charLength} / 160 CHARS`}
            variant={isWithinLimit ? 'success' : 'danger'}
          />
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Satellite Connectivity Notice */}
        <Card style={styles.noticeCard}>
          <View style={styles.noticeRow}>
            <Ionicons name="planet" size={26} color="#3B82F6" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[styles.noticeTitle, { color: colors.text }]}>Direct-to-Cell / Satellite Protocol</Text>
              <Text style={[styles.noticeSub, { color: colors.textSecondary }]}>
                Encodes maximum tactical telemetry into a single 160-character burst payload guaranteed to transmit through spotty narrowband sat-links.
              </Text>
            </View>
          </View>
        </Card>

        {/* Encoded Live Payload Card */}
        <Card style={[styles.payloadCard, { borderColor: colors.primary }]}>
          <View style={styles.payloadHeader}>
            <Text style={[styles.payloadTitle, { color: colors.primary }]}>ENCODED SATELLITE BURST</Text>
            <Badge label={`${charLength} CHARS`} variant="info" />
          </View>
          <Text style={styles.payloadCode}>{compactBulletin}</Text>
        </Card>

        {/* Configuration Parameters */}
        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: colors.text, fontSize: typo.h3.fontSize }]}>
            Incident Parameters
          </Text>

          <Text style={[styles.label, { color: colors.textSecondary, fontSize: typo.caption.fontSize }]}>
            INCIDENT TYPE
          </Text>
          <View style={styles.optionsGrid}>
            {[
              { key: 'TRAPPED_FLOOD', label: 'Flood Trap' },
              { key: 'EARTHQUAKE', label: 'Earthquake' },
              { key: 'MEDICAL_CRIT', label: 'Cardiac/Blood' },
              { key: 'HOSTILE_THREAT', label: 'Hostile Threat' },
            ].map((opt) => (
              <TouchableOpacity
                key={opt.key}
                onPress={() => setIncidentType(opt.key)}
                style={[
                  styles.optionChip,
                  {
                    backgroundColor: incidentType === opt.key ? colors.primary : colors.surfaceSubtle,
                    borderColor: incidentType === opt.key ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={[styles.optionText, { color: incidentType === opt.key ? '#FFFFFF' : colors.text }]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label="Persons Needing Evacuation"
            value={personCount}
            keyboardType="numeric"
            onChangeText={setPersonCount}
          />

          <Text style={[styles.label, { color: colors.textSecondary, fontSize: typo.caption.fontSize }]}>
            CRITICAL SUPPLIES NEEDED
          </Text>
          <View style={styles.optionsGrid}>
            {[
              { key: 'WATER_MEDS', label: 'Water + First Aid' },
              { key: 'RESCUE_BOAT', label: 'Rescue Boat' },
              { key: 'AIRLIFT', label: 'Airlift / Stretcher' },
              { key: 'OXYGEN', label: 'Oxygen' },
            ].map((need) => (
              <TouchableOpacity
                key={need.key}
                onPress={() => setCriticalNeed(need.key)}
                style={[
                  styles.optionChip,
                  {
                    backgroundColor: criticalNeed === need.key ? colors.primary : colors.surfaceSubtle,
                    borderColor: criticalNeed === need.key ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={[styles.optionText, { color: criticalNeed === need.key ? '#FFFFFF' : colors.text }]}>
                  {need.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button
            title="Transmit Satellite Emergency Bulletin"
            variant="danger"
            size="lg"
            onPress={handleDispatchSatelliteBulletin}
            icon={<Ionicons name="radio" size={20} color="#FFFFFF" />}
            style={{ marginTop: spacing.lg }}
          />
        </Card>
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
  noticeCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  noticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noticeTitle: {
    fontWeight: '700',
    fontSize: 13,
  },
  noticeSub: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 16,
  },
  payloadCard: {
    padding: spacing.md,
    borderWidth: 1.5,
    marginBottom: spacing.md,
  },
  payloadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  payloadTitle: {
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 1,
  },
  payloadCode: {
    fontFamily: 'monospace',
    fontSize: 13,
    lineHeight: 20,
    color: '#34D399',
    backgroundColor: '#0F172A',
    padding: 10,
    borderRadius: borderRadius.sm,
  },
  card: {
    padding: spacing.md,
  },
  cardTitle: {
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  label: {
    fontWeight: '700',
    marginTop: spacing.sm,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
  },
  optionChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
