import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Linking,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../store';
import { lightColors, darkColors, seniorTypography, normalTypography, spacing, borderRadius } from '../theme';
import { Header, Card, Badge, Button } from '../components';
import { ResponderStatus } from '../types';
import { ApiService } from '../services/api';

export const ResponderTrackingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { settings, currentLocation, activeSosSession } = useAppStore();
  const [responder, setResponder] = useState<ResponderStatus | null>(null);

  const markerAnim = useRef(new Animated.Value(0)).current;
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isDark = settings.themeMode !== 'light';
  const colors = isDark ? darkColors : lightColors;
  const typo = settings.seniorMode ? seniorTypography : normalTypography;

  useEffect(() => {
    fetchStatus();

    // Start movement simulation loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(markerAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(markerAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    ).start();

    // Poll every 3 seconds for updated responder coordinates
    pollTimerRef.current = setInterval(fetchStatus, 3000);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [currentLocation]);

  const fetchStatus = async () => {
    const sosId = activeSosSession?.id || 'sos_active';
    const lat = currentLocation?.latitude || 28.6139;
    const lng = currentLocation?.longitude || 77.2090;

    const data = await ApiService.fetchResponderStatus(sosId, lat, lng);
    if (data) {
      setResponder(data);
    }
  };

  const handleCallResponder = () => {
    if (responder?.phone) {
      Linking.openURL(`tel:${responder.phone}`);
    }
  };

  const eta = responder ? `${responder.etaMinutes.toFixed(1)} mins` : 'Calculating...';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Live First Responder Tracking"
        subtitle="GPS telemetry tracking dispatched emergency rescue unit"
        onBack={() => navigation.goBack()}
      />

      <View style={styles.content}>
        {/* Radar / Tactical Tracking Canvas */}
        <View style={[styles.trackingCanvas, { backgroundColor: isDark ? '#0F172A' : '#1E293B' }]}>
          {/* Radar Circles */}
          <View style={[styles.radarCircle, { width: 140, height: 140, borderRadius: 70 }]} />
          <View style={[styles.radarCircle, { width: 240, height: 240, borderRadius: 120 }]} />
          <View style={[styles.radarCircle, { width: 340, height: 340, borderRadius: 170 }]} />

          {/* User Location Center Marker */}
          <View style={styles.userCenterMarker}>
            <View style={styles.userDot}>
              <Ionicons name="person" size={14} color="#FFFFFF" />
            </View>
            <Text style={styles.markerLabel}>Your Position</Text>
          </View>

          {/* Dispatched Vehicle Marker Moving Towards User */}
          <Animated.View
            style={[
              styles.vehicleMarker,
              {
                transform: [
                  { translateX: markerAnim.interpolate({ inputRange: [0, 1], outputRange: [90, 80] }) },
                  { translateY: markerAnim.interpolate({ inputRange: [0, 1], outputRange: [-100, -85] }) },
                ],
              },
            ]}
          >
            <View style={[styles.vehicleIconCircle, { backgroundColor: '#10B981' }]}>
              <Ionicons name="car" size={18} color="#FFFFFF" />
            </View>
            <View style={styles.vehicleCallSignTag}>
              <Text style={styles.callSignText}>{responder?.callSign || 'LifeLine-1'}</Text>
            </View>
          </Animated.View>

          {/* Top Floating ETA Badge */}
          <View style={styles.floatingEtaCard}>
            <Ionicons name="time" size={16} color="#34D399" />
            <Text style={styles.floatingEtaText}>ETA: {eta}</Text>
          </View>
        </View>

        {/* Dispatched Unit Information Card */}
        {responder ? (
          <Card style={styles.responderCard}>
            <View style={styles.responderHeader}>
              <View style={[styles.roleAvatar, { backgroundColor: '#10B98120' }]}>
                <Ionicons name="medical" size={28} color="#10B981" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[styles.responderName, { color: colors.text, fontSize: typo.h3.fontSize }]}>
                    {responder.name}
                  </Text>
                  <Badge label={responder.status} variant="success" style={{ marginLeft: 8 }} />
                </View>
                <Text style={[styles.responderRole, { color: colors.textSecondary }]}>
                  {responder.role.replace('_', ' ')} • Call Sign: {responder.callSign}
                </Text>
              </View>
            </View>

            <View style={[styles.telemetryRow, { backgroundColor: colors.surfaceSubtle }]}>
              <View style={styles.telemetryItem}>
                <Text style={[styles.telValue, { color: colors.text }]}>{responder.etaMinutes.toFixed(1)}m</Text>
                <Text style={[styles.telLabel, { color: colors.textSecondary }]}>Estimated Arrival</Text>
              </View>
              <View style={styles.telemetryDivider} />
              <View style={styles.telemetryItem}>
                <Text style={[styles.telValue, { color: colors.text }]}>1.4 km</Text>
                <Text style={[styles.telLabel, { color: colors.textSecondary }]}>Distance</Text>
              </View>
              <View style={styles.telemetryDivider} />
              <View style={styles.telemetryItem}>
                <Text style={[styles.telValue, { color: '#10B981' }]}>EN ROUTE</Text>
                <Text style={[styles.telLabel, { color: colors.textSecondary }]}>Dispatch State</Text>
              </View>
            </View>

            <Button
              title={`Call Responder (${responder.phone})`}
              variant="success"
              size="lg"
              onPress={handleCallResponder}
              icon={<Ionicons name="call" size={20} color="#FFFFFF" />}
              style={{ marginTop: spacing.md }}
            />
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
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  trackingCanvas: {
    height: 340,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  radarCircle: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#33415550',
  },
  userCenterMarker: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  userDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
  },
  vehicleMarker: {
    position: 'absolute',
    alignItems: 'center',
  },
  vehicleIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  vehicleCallSignTag: {
    backgroundColor: '#059669',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  callSignText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  floatingEtaCard: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172ACC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: '#34D399',
  },
  floatingEtaText: {
    color: '#34D399',
    fontWeight: '800',
    fontSize: 12,
    marginLeft: 6,
  },
  responderCard: {
    padding: spacing.md,
  },
  responderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  responderName: {
    fontWeight: '800',
  },
  responderRole: {
    fontSize: 12,
    marginTop: 2,
  },
  telemetryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  telemetryItem: {
    alignItems: 'center',
  },
  telValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  telLabel: {
    fontSize: 10,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  telemetryDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#47556940',
  },
});
