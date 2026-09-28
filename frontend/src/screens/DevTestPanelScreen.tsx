import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { useAppStore } from '../store';
import { lightColors, darkColors, seniorTypography, normalTypography, spacing, borderRadius } from '../theme';
import { Header, Card, Badge, Button } from '../components';
import { SosEngine } from '../services/sos';
import { BleMesh } from '../services/bleRelay';

export const DevTestPanelScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {
    settings,
    connectivity,
    setConnectivity,
    activeSosSession,
    meshPeerCount,
    setMeshPeerCount,
  } = useAppStore();

  const isDark = settings.themeMode !== 'light';
  const colors = isDark ? darkColors : lightColors;
  const typo = settings.seniorMode ? seniorTypography : normalTypography;

  // 1. Fake Shake
  const handleFakeShake = async () => {
    Alert.alert('Simulating Shake', 'Injecting violent 3.2G acceleration event into detector...');
    await SosEngine.triggerSOS('SHAKE');
    navigation.navigate('ActiveSos');
  };

  // 2. Fake Gunshot Sound
  const handleFakeGunshot = () => {
    navigation.navigate('AcousticGunshot');
  };

  // 3. Fake Offline / Online Mode Toggle
  const handleToggleConnectivity = () => {
    if (connectivity === 'ONLINE') {
      setConnectivity('SMS_ONLY');
      Alert.alert('Network Changed', 'Switched to SMS_ONLY mode (No Data).');
    } else if (connectivity === 'SMS_ONLY') {
      setConnectivity('OFFLINE');
      Alert.alert('Network Changed', 'Switched to OFFLINE mode (Airplane / Zero Signal).');
    } else {
      setConnectivity('ONLINE');
      Alert.alert('Network Changed', 'Switched to ONLINE mode (Active Internet).');
    }
  };

  // 4. Fake BLE Peer Packet
  const handleFakeBlePacket = () => {
    const packet = {
      packetId: `pkt_sim_${Date.now()}`,
      originNodeId: 'node_delhi_relief_3',
      senderNodeId: 'node_neighbor_2',
      ttl: 3,
      payloadType: 'SOS' as const,
      payloadJson: JSON.stringify({
        sosId: 'sos_remote_88',
        message: 'Building collapse near Sector 14 market.',
      }),
      timestamp: Date.now(),
    };

    const res = BleMesh.handleIncomingPacket(packet);
    setMeshPeerCount(meshPeerCount + 1);
    Alert.alert('BLE Mesh Packet Ingested', `Packet ID: ${packet.packetId}\nAction: ${res.message}\nTTL remaining: ${packet.ttl - 1}`);
  };

  // 5. Fake Voice Stress Alert
  const handleFakeStress = () => {
    navigation.navigate('VoiceStress');
  };

  // 6. Fake Geofence Notification
  const handleFakeGeofenceNotice = async () => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🚨 DANGER ZONE ALERT: Severe Chemical Cloud',
          body: 'You have entered a 300m hazard perimeter! Evacuate upwind immediately.',
          sound: true,
        },
        trigger: null,
      });
      Alert.alert('Geofence Sent', 'Local notification fired.');
    } catch {
      Alert.alert('Notification', 'Hazard Geofence alert simulated.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Developer Simulation Panel"
        subtitle="Simulate hardware triggers, sensors & disaster states"
        onBack={() => navigation.goBack()}
        rightAction={<Badge label="DEV MODE" variant="primary" />}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Network state simulator */}
        <Card style={styles.card}>
          <View style={styles.headerRow}>
            <Ionicons name="wifi" size={22} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text, fontSize: typo.h3.fontSize }]}>
              Network Channel Simulation
            </Text>
          </View>
          <Text style={[styles.desc, { color: colors.textSecondary }]}>
            Current State: <Text style={{ color: colors.primary, fontWeight: '700' }}>{connectivity}</Text>
          </Text>
          <Button
            title={`Cycle Network: Next from ${connectivity}`}
            variant="outline"
            onPress={handleToggleConnectivity}
            style={{ marginTop: spacing.sm }}
          />
        </Card>

        {/* Sensor & Detector Simulation */}
        <Card style={styles.card}>
          <View style={styles.headerRow}>
            <Ionicons name="hardware-chip" size={22} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text, fontSize: typo.h3.fontSize }]}>
              Hardware Sensors & Acoustic Spikes
            </Text>
          </View>

          <Button
            title="Trigger Fake Shake-to-SOS (3.2G)"
            variant="danger"
            onPress={handleFakeShake}
            icon={<Ionicons name="phone-portrait" size={18} color="#FFFFFF" />}
            style={{ marginVertical: 4 }}
          />

          <Button
            title="Trigger Fake Gunshot Sound Spike (128 dB)"
            variant="secondary"
            onPress={handleFakeGunshot}
            icon={<Ionicons name="radio" size={18} color={colors.text} />}
            style={{ marginVertical: 4 }}
          />

          <Button
            title="Trigger Fake Voice Stress (95% Panic)"
            variant="secondary"
            onPress={handleFakeStress}
            icon={<Ionicons name="pulse" size={18} color={colors.text} />}
            style={{ marginVertical: 4 }}
          />
        </Card>

        {/* Mesh & Location Simulation */}
        <Card style={styles.card}>
          <View style={styles.headerRow}>
            <Ionicons name="bluetooth" size={22} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text, fontSize: typo.h3.fontSize }]}>
              BLE Mesh & Notifications
            </Text>
          </View>

          <Button
            title="Inject Incoming BLE Mesh Packet"
            variant="outline"
            onPress={handleFakeBlePacket}
            icon={<Ionicons name="git-network" size={18} color={colors.text} />}
            style={{ marginVertical: 4 }}
          />

          <Button
            title="Test Geofence Entry Push Notification"
            variant="outline"
            onPress={handleFakeGeofenceNotice}
            icon={<Ionicons name="notifications" size={18} color={colors.text} />}
            style={{ marginVertical: 4 }}
          />
        </Card>

        {/* Full SOS Engine Direct Fire */}
        <Card style={[styles.card, { borderColor: colors.danger, borderWidth: 1.5 }]}>
          <View style={styles.headerRow}>
            <Ionicons name="alert-circle" size={22} color={colors.danger} />
            <Text style={[styles.cardTitle, { color: colors.danger, fontSize: typo.h3.fontSize }]}>
              Direct Emergency Engine Trigger
            </Text>
          </View>
          <Text style={[styles.desc, { color: colors.textSecondary }]}>
            Fires full cascade: Internet (API) -&gt; SMS -&gt; BLE Relay -&gt; SQLite Queue
          </Text>

          <Button
            title="Trigger Full SOS Cascade Now"
            variant="danger"
            size="lg"
            onPress={() => {
              SosEngine.triggerSOS('MANUAL_BUTTON', 'Developer Test Panel Verification');
              navigation.navigate('ActiveSos');
            }}
            style={{ marginTop: spacing.md }}
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
  card: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    fontWeight: '800',
    marginLeft: 8,
  },
  desc: {
    fontSize: 12,
    marginBottom: spacing.sm,
  },
});
