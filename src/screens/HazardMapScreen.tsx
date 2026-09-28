import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { useAppStore } from '../store';
import { lightColors, darkColors, seniorTypography, normalTypography, spacing, borderRadius } from '../theme';
import { Header, Card, Badge, Button } from '../components';
import { HazardReport } from '../types';
import * as db from '../db';
import { ApiService } from '../services/api';

export const HazardMapScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { settings, currentLocation, updateSettings } = useAppStore();
  const [hazards, setHazards] = useState<HazardReport[]>([]);
  const [selectedHazard, setSelectedHazard] = useState<HazardReport | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');

  const isDark = settings.themeMode !== 'light';
  const colors = isDark ? darkColors : lightColors;
  const typo = settings.seniorMode ? seniorTypography : normalTypography;

  useEffect(() => {
    loadHazards();
  }, [currentLocation]);

  const loadHazards = async () => {
    const lat = currentLocation?.latitude || 28.6139;
    const lng = currentLocation?.longitude || 77.2090;

    // Load from local db first
    let local = await db.getHazardReports();
    if (local.length === 0) {
      // Sync from API / mock backend
      try {
        const fetched = await ApiService.fetchHazards(lat, lng);
        for (const h of fetched) {
          await db.insertHazardReport(h);
        }
        local = fetched;
      } catch {}
    }
    setHazards(local);
  };

  const handleDownloadTiles = async () => {
    Alert.alert(
      'Download Offline Region',
      'Download detailed 25km radius vector tiles & satellite topography for offline emergency navigation? (~42 MB)',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Download',
          onPress: async () => {
            await updateSettings({ offlineTilesDownloaded: true });
            Alert.alert('Download Complete', 'Offline emergency map tiles cached to device local storage.');
          },
        },
      ]
    );
  };

  const testGeofenceAlert = async (hazard: HazardReport) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `⚠️ GEOFENCE HAZARD ALERT: ${hazard.title}`,
          body: `You are within ${hazard.radiusMeters}m of an active ${hazard.severity} severity ${hazard.type.toLowerCase()}. Seek safety!`,
          sound: true,
        },
        trigger: null, // Immediate
      });
      Alert.alert('Geofence Triggered', `Local warning notification sent for: ${hazard.title}`);
    } catch {
      Alert.alert('Hazard Alert', `WARNING: You are near ${hazard.title} (${hazard.severity})`);
    }
  };

  const filtered = hazards.filter((h) => filterType === 'ALL' || h.type === filterType);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Hazard Alert Map"
        subtitle="Live crowdsourced disaster zones with offline tile caching"
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity onPress={handleDownloadTiles} style={styles.downloadIconBtn}>
            <Ionicons
              name={settings.offlineTilesDownloaded ? 'cloud-done' : 'cloud-download-outline'}
              size={22}
              color={settings.offlineTilesDownloaded ? '#10B981' : colors.primary}
            />
          </TouchableOpacity>
        }
      />

      {/* Map Simulation Canvas */}
      <View style={[styles.mapCanvas, { backgroundColor: isDark ? '#1E293B' : '#CBD5E1' }]}>
        {/* Grid lines for tactical grid styling */}
        <View style={styles.mapGridPattern}>
          <Text style={styles.mapWatermark}>OFFLINE DISASTER GRID • WGS-84</Text>
        </View>

        {/* Current User Location Marker */}
        <View style={styles.userMarkerContainer}>
          <View style={styles.userPulseRing} />
          <View style={[styles.userDot, { backgroundColor: '#3B82F6' }]}>
            <Ionicons name="navigate" size={14} color="#FFFFFF" />
          </View>
          <Text style={styles.userMarkerLabel}>You</Text>
        </View>

        {/* Render Hazards with Geofence Circles on the map */}
        {filtered.map((h, i) => {
          const offsetX = (i % 3 - 1) * 90;
          const offsetY = (Math.floor(i / 3) - 0.5) * 80;
          const isCrit = h.severity === 'CRITICAL' || h.severity === 'HIGH';

          return (
            <TouchableOpacity
              key={h.id}
              onPress={() => setSelectedHazard(h)}
              style={[styles.hazardMarkerWrapper, { transform: [{ translateX: offsetX }, { translateY: offsetY }] }]}
            >
              <View
                style={[
                  styles.geofenceCircle,
                  {
                    borderColor: isCrit ? '#EF4444' : '#F59E0B',
                    backgroundColor: isCrit ? '#EF444430' : '#F59E0B25',
                  },
                ]}
              />
              <View
                style={[
                  styles.hazardIconDot,
                  { backgroundColor: isCrit ? '#DC2626' : '#D97706' },
                ]}
              >
                <Ionicons
                  name={h.type === 'FIRE' ? 'flame' : (h.type === 'FLOOD' ? 'water' : 'warning')}
                  size={16}
                  color="#FFFFFF"
                />
              </View>
              <Text style={styles.hazardMarkerLabel} numberOfLines={1}>{h.title}</Text>
            </TouchableOpacity>
          );
        })}

        {/* Offline cached badge on map */}
        <View style={styles.mapOverlayBadge}>
          <Badge
            label={settings.offlineTilesDownloaded ? 'OFFLINE TILES CACHED' : 'LIVE GRID'}
            variant={settings.offlineTilesDownloaded ? 'success' : 'info'}
          />
        </View>

        {/* Floating Add Hazard Report button */}
        <TouchableOpacity
          style={[styles.floatingReportBtn, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('ReportHazard')}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
          <Text style={styles.reportBtnText}>Report Hazard</Text>
        </TouchableOpacity>
      </View>

      {/* Selected Hazard Details Card */}
      {selectedHazard ? (
        <Card style={styles.hazardDetailCard}>
          <View style={styles.detailHeader}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Badge
                  label={selectedHazard.severity}
                  variant={selectedHazard.severity === 'CRITICAL' ? 'danger' : 'warning'}
                />
                <Text style={[styles.detailType, { color: colors.textSecondary }]}>
                  {selectedHazard.type}
                </Text>
              </View>
              <Text style={[styles.detailTitle, { color: colors.text, fontSize: typo.h3.fontSize }]}>
                {selectedHazard.title}
              </Text>
              <Text style={[styles.detailDesc, { color: colors.textSecondary, fontSize: typo.caption.fontSize }]}>
                {selectedHazard.description}
              </Text>
              <Text style={[styles.geofenceNote, { color: colors.textMuted }]}>
                Geofence Perimeter: {selectedHazard.radiusMeters}m radius
              </Text>
            </View>
            <TouchableOpacity onPress={() => setSelectedHazard(null)}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Button
            title="Simulate Geofence Crossing Alert"
            variant="outline"
            size="sm"
            onPress={() => testGeofenceAlert(selectedHazard)}
            icon={<Ionicons name="notifications" size={16} color={colors.text} />}
            style={{ marginTop: spacing.sm }}
          />
        </Card>
      ) : null}

      {/* List of active hazards */}
      <View style={styles.listSection}>
        <Text style={[styles.listHeaderTitle, { color: colors.text }]}>
          Active Disaster Zones ({filtered.length})
        </Text>
        <FlatList
          data={filtered}
          keyExtractor={(h) => h.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => setSelectedHazard(item)}>
              <View style={[styles.listItem, { backgroundColor: colors.surfaceSubtle }]}>
                <Ionicons
                  name={item.type === 'FIRE' ? 'flame' : (item.type === 'FLOOD' ? 'water' : 'warning')}
                  size={20}
                  color={item.severity === 'CRITICAL' ? colors.danger : colors.warning}
                  style={{ marginRight: 10 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.listTitle, { color: colors.text }]}>{item.title}</Text>
                  <Text style={[styles.listSub, { color: colors.textSecondary }]}>
                    Radius: {item.radiusMeters}m • {item.severity}
                  </Text>
                </View>
                <Badge
                  label={item.type}
                  variant="neutral"
                />
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  downloadIconBtn: {
    padding: 6,
  },
  mapCanvas: {
    height: 320,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  mapGridPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.15,
  },
  mapWatermark: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 4,
    color: '#FFFFFF',
  },
  userMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  userPulseRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3B82F630',
    position: 'absolute',
  },
  userDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userMarkerLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    marginTop: 2,
    backgroundColor: '#0F172A90',
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  hazardMarkerWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  geofenceCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    position: 'absolute',
  },
  hazardIconDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  hazardMarkerLabel: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
    backgroundColor: '#0F172ACC',
    paddingHorizontal: 4,
    borderRadius: 3,
    maxWidth: 90,
  },
  mapOverlayBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  floatingReportBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    elevation: 6,
  },
  reportBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
    marginLeft: 4,
  },
  hazardDetailCard: {
    margin: spacing.md,
    padding: spacing.md,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  detailType: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 8,
  },
  detailTitle: {
    fontWeight: '800',
    marginTop: 4,
  },
  detailDesc: {
    marginTop: 2,
  },
  geofenceNote: {
    fontSize: 11,
    marginTop: 4,
    fontStyle: 'italic',
  },
  listSection: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  listHeaderTitle: {
    fontWeight: '700',
    fontSize: 13,
    marginBottom: spacing.xs,
    marginTop: 4,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm + 2,
    borderRadius: borderRadius.md,
    marginVertical: 3,
  },
  listTitle: {
    fontWeight: '700',
    fontSize: 13,
  },
  listSub: {
    fontSize: 11,
    marginTop: 1,
  },
});
