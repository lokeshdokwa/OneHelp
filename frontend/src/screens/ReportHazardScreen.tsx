import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useAppStore } from '../store';
import { lightColors, darkColors, seniorTypography, normalTypography, spacing, borderRadius } from '../theme';
import { Header, Card, Input, Button } from '../components';
import { HazardReport, HazardType } from '../types';
import * as db from '../db';
import { ApiService } from '../services/api';

const HAZARD_TYPES: { type: HazardType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { type: 'FLOOD', label: 'Flood / Waterlog', icon: 'water' },
  { type: 'FIRE', label: 'Fire Outbreak', icon: 'flame' },
  { type: 'ROAD_BLOCK', label: 'Road Block', icon: 'hand-left' },
  { type: 'LANDSLIDE', label: 'Landslide', icon: 'warning' },
  { type: 'GAS_LEAK', label: 'Gas Leak', icon: 'alert-circle' },
  { type: 'BUILDING_COLLAPSE', label: 'Building Collapse', icon: 'business' },
  { type: 'OTHER', label: 'Other Hazard', icon: 'alert' },
];

const SEVERITIES: HazardReport['severity'][] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const RADII = [50, 100, 250, 500, 1000];

export const ReportHazardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { settings, currentLocation } = useAppStore();

  const [selectedType, setSelectedType] = useState<HazardType>('FLOOD');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<HazardReport['severity']>('HIGH');
  const [radiusMeters, setRadiusMeters] = useState(250);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const isDark = settings.themeMode !== 'light';
  const colors = isDark ? darkColors : lightColors;
  const typo = settings.seniorMode ? seniorTypography : normalTypography;

  const handlePickPhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.6,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch {
      // Fallback to gallery
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 0.6,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhotoUri(result.assets[0].uri);
      }
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Missing Field', 'Please provide a short title for this hazard.');
      return;
    }

    const lat = currentLocation?.latitude || 28.6139;
    const lng = currentLocation?.longitude || 77.2090;

    const report: HazardReport = {
      id: `haz_local_${Date.now()}`,
      type: selectedType,
      title: title.trim(),
      description: description.trim() || `${selectedType} reported via OneHelp community network.`,
      latitude: lat,
      longitude: lng,
      radiusMeters,
      severity,
      photoUri: photoUri || undefined,
      reportedAt: Date.now(),
      synced: false,
    };

    // Save to local SQLite database
    await db.insertHazardReport(report);

    // Try syncing with API
    try {
      await ApiService.reportHazard(report);
    } catch {
      // If offline, save in retry queue
      await db.enqueueOfflineItem({
        id: `queue_hazard_${report.id}`,
        type: 'HAZARD_REPORT',
        payloadJson: JSON.stringify(report),
        createdAt: Date.now(),
      });
    }

    Alert.alert('Hazard Published', 'Disaster coordinates and geofence published to emergency map.');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Report Disaster Hazard"
        subtitle="Broadcast road blockages, fires and floods to nearby users"
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hazard Type Selector Chips */}
        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: typo.h3.fontSize }]}>
          Hazard Category
        </Text>
        <View style={styles.typesGrid}>
          {HAZARD_TYPES.map((item) => {
            const isSelected = selectedType === item.type;
            return (
              <TouchableOpacity
                key={item.type}
                onPress={() => setSelectedType(item.type)}
                style={[
                  styles.typeChip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surfaceSubtle,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
              >
                <Ionicons
                  name={item.icon}
                  size={18}
                  color={isSelected ? '#FFFFFF' : colors.text}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.typeText,
                    { color: isSelected ? '#FFFFFF' : colors.text },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Input
          label="Hazard Title"
          placeholder="e.g. Underpass Completely Flooded, Bridge Closed"
          value={title}
          onChangeText={setTitle}
        />

        <Input
          label="Detailed Description"
          placeholder="Describe water depth, lane obstruction, or smoke direction"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          inputStyle={{ minHeight: 70 }}
        />

        {/* Severity Selector */}
        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: typo.h3.fontSize }]}>
          Severity Level
        </Text>
        <View style={styles.segmentedRow}>
          {SEVERITIES.map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => setSeverity(s)}
              style={[
                styles.segmentBtn,
                {
                  backgroundColor: severity === s ? colors.primary : colors.surfaceSubtle,
                  borderColor: severity === s ? colors.primary : colors.border,
                },
              ]}
            >
              <Text style={[styles.segmentText, { color: severity === s ? '#FFFFFF' : colors.text }]}>
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Geofence Alert Radius */}
        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: typo.h3.fontSize }]}>
          Warning Perimeter Radius
        </Text>
        <View style={styles.segmentedRow}>
          {RADII.map((r) => (
            <TouchableOpacity
              key={r}
              onPress={() => setRadiusMeters(r)}
              style={[
                styles.segmentBtn,
                {
                  backgroundColor: radiusMeters === r ? colors.primary : colors.surfaceSubtle,
                  borderColor: radiusMeters === r ? colors.primary : colors.border,
                },
              ]}
            >
              <Text style={[styles.segmentText, { color: radiusMeters === r ? '#FFFFFF' : colors.text }]}>
                {r}m
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Photo Evidence Capture */}
        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: typo.h3.fontSize }]}>
          Photo Evidence
        </Text>
        <Card style={styles.photoCard}>
          {photoUri ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: photoUri }} style={styles.previewImage} />
              <TouchableOpacity
                onPress={() => setPhotoUri(null)}
                style={styles.removeImageBtn}
              >
                <Ionicons name="trash" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={handlePickPhoto} style={styles.photoPlaceholder}>
              <Ionicons name="camera" size={32} color={colors.primary} />
              <Text style={[styles.photoPrompt, { color: colors.textSecondary }]}>
                Capture Incident Photo (Camera / Gallery)
              </Text>
            </TouchableOpacity>
          )}
        </Card>

        {/* Coordinates indicator */}
        <Text style={[styles.coordNote, { color: colors.textMuted }]}>
          Auto-tagging coordinates: {currentLocation ? `${currentLocation.latitude.toFixed(5)}, ${currentLocation.longitude.toFixed(5)}` : 'GPS Acquiring (Defaulting to New Delhi)'}
        </Text>

        <Button
          title="Publish Hazard Warning"
          variant="danger"
          size="lg"
          onPress={handleSubmit}
          icon={<Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />}
          style={{ marginTop: spacing.lg }}
        />
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
  sectionTitle: {
    fontWeight: '700',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  typesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  segmentedRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    marginHorizontal: 3,
  },
  segmentText: {
    fontWeight: '700',
    fontSize: 12,
  },
  photoCard: {
    padding: spacing.md,
    marginVertical: 4,
  },
  photoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  photoPrompt: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
  imagePreviewContainer: {
    position: 'relative',
    height: 180,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#DC2626',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coordNote: {
    fontSize: 11,
    marginTop: 6,
    fontStyle: 'italic',
  },
});
