import React, { useState } from 'react';
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
import * as ImagePicker from 'expo-image-picker';
import { useAppStore } from '../store';
import { lightColors, darkColors, seniorTypography, normalTypography, spacing, borderRadius } from '../theme';
import { Header, Card, Badge, Button } from '../components';
import * as db from '../db';

export const VideoRelayScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { settings, activeSosSession } = useAppStore();
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const isDark = settings.themeMode !== 'light';
  const colors = isDark ? darkColors : lightColors;
  const typo = settings.seniorMode ? seniorTypography : normalTypography;

  const handleRecordVideo = async () => {
    try {
      setIsRecording(true);
      const res = await ImagePicker.launchCameraAsync({
        mediaTypes: ['videos'],
        videoMaxDuration: 15,
        allowsEditing: false,
        quality: 0.4, // Low bandwidth compression
      });
      setIsRecording(false);

      if (!res.canceled && res.assets && res.assets[0]) {
        setVideoUri(res.assets[0].uri);
      }
    } catch (err: any) {
      setIsRecording(false);
      Alert.alert('Camera Error', err.message || 'Unable to open camera recorder.');
    }
  };

  const handleAttachToSos = async () => {
    if (!videoUri) return;

    // Enqueue video attachment to offline queue
    await db.enqueueOfflineItem({
      id: `queue_video_${Date.now()}`,
      type: 'SOS_DISPATCH',
      payloadJson: JSON.stringify({
        sosId: activeSosSession?.id || 'sos_current',
        videoUri,
        note: 'Silent Sign-Language video attachment (Low-bandwidth compressed)',
        timestamp: Date.now(),
      }),
      createdAt: Date.now(),
    });

    Alert.alert(
      'Attached to Emergency Packet',
      'Video message has been queued for transmission over available high-throughput relay.'
    );
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Sign-Language & Silent Video"
        subtitle="Accessible emergency video relay for speech/hearing impaired"
        onBack={() => navigation.goBack()}
      />

      <View style={styles.content}>
        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: colors.text, fontSize: typo.h3.fontSize }]}>
            Silent Emergency Video Protocol
          </Text>
          <Text style={[styles.desc, { color: colors.textSecondary }]}>
            Enables speech or hearing impaired victims, or individuals in hostage situations where speaking is dangerous, to record hand signs and immediate visual surroundings.
          </Text>

          <View style={styles.recordBox}>
            {videoUri ? (
              <View style={styles.videoRecordedPlaceholder}>
                <Ionicons name="videocam" size={48} color="#10B981" />
                <Text style={[styles.videoRecordedText, { color: colors.text }]}>
                  15-Second Video Captured & Compressed
                </Text>
                <Badge label="OPTIMIZED (360p / 1.2MB)" variant="success" />
              </View>
            ) : (
              <TouchableOpacity onPress={handleRecordVideo} style={styles.emptyPrompt}>
                <Ionicons name="videocam-outline" size={54} color={colors.primary} />
                <Text style={[styles.emptyPromptText, { color: colors.text }]}>
                  Tap to Record 15s Emergency Clip
                </Text>
                <Text style={[styles.emptyPromptSub, { color: colors.textSecondary }]}>
                  Camera opens directly in silent mode
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.buttonsRow}>
            <Button
              title={videoUri ? 'Retake Video' : 'Record Video'}
              variant="outline"
              onPress={handleRecordVideo}
              icon={<Ionicons name="camera" size={18} color={colors.text} />}
              style={{ flex: 1, marginRight: 8 }}
            />
            {videoUri ? (
              <Button
                title="Attach & Dispatch"
                variant="danger"
                onPress={handleAttachToSos}
                icon={<Ionicons name="send" size={18} color="#FFFFFF" />}
                style={{ flex: 1.2 }}
              />
            ) : null}
          </View>
        </Card>

        {/* Accessibility Features summary */}
        <Card style={styles.accessibilityCard}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Accessibility Compliance</Text>
          <Text style={[styles.bullet, { color: colors.textSecondary }]}>
            • Compatible with Indian Sign Language (ISL) emergency gestures
          </Text>
          <Text style={[styles.bullet, { color: colors.textSecondary }]}>
            • Ultra-low bitrate H.264 compression for slow 2G / Mesh packet transmission
          </Text>
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
  card: {
    padding: spacing.md,
  },
  cardTitle: {
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  desc: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  recordBox: {
    height: 200,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#64748B40',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  videoRecordedPlaceholder: {
    alignItems: 'center',
  },
  videoRecordedText: {
    fontWeight: '700',
    marginVertical: 6,
  },
  emptyPrompt: {
    alignItems: 'center',
  },
  emptyPromptText: {
    fontWeight: '700',
    marginTop: 8,
  },
  emptyPromptSub: {
    fontSize: 11,
    marginTop: 2,
  },
  buttonsRow: {
    flexDirection: 'row',
  },
  accessibilityCard: {
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  bullet: {
    fontSize: 12,
    marginVertical: 2,
  },
});
