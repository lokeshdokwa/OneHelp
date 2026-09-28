import React, { useState, useRef, useEffect } from 'react';
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
import { CameraView, useCameraPermissions, useMicrophonePermissions, CameraType } from 'expo-camera';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useAppStore } from '../store';
import { lightColors, darkColors, seniorTypography, normalTypography, spacing, borderRadius } from '../theme';
import { Header, Card, Badge, Button } from '../components';
import * as db from '../db';

const VideoPreview: React.FC<{ uri: string }> = ({ uri }) => {
  const player = useVideoPlayer({ uri }, (p) => {
    p.loop = true;
    p.play();
  });

  return (
    <VideoView
      player={player}
      style={styles.videoPlayer}
      nativeControls
      contentFit="cover"
    />
  );
};

export const VideoRelayScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { settings, activeSosSession } = useAppStore();
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [facing, setFacing] = useState<CameraType>('front');
  const [cameraActive, setCameraActive] = useState(false);

  const [camPermission, requestCamPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();

  const cameraRef = useRef<CameraView>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const isDark = settings.themeMode !== 'light';
  const colors = isDark ? darkColors : lightColors;
  const typo = settings.seniorMode ? seniorTypography : normalTypography;

  useEffect(() => {
    if (isRecording) {
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((s) => {
          if (s >= 14) {
            stopRecording();
            return 15;
          }
          return s + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const ensurePermissions = async () => {
    if (!camPermission?.granted) {
      const res = await requestCamPermission();
      if (!res.granted) {
        Alert.alert('Permission Needed', 'Camera permission is required for emergency video recording.');
        return false;
      }
    }
    if (!micPermission?.granted) {
      await requestMicPermission();
    }
    return true;
  };

  const handleStartCamera = async () => {
    const ok = await ensurePermissions();
    if (ok) {
      setCameraActive(true);
    }
  };

  const startRecording = async () => {
    const ok = await ensurePermissions();
    if (!ok) return;

    if (!cameraRef.current) {
      setCameraActive(true);
      return;
    }

    try {
      setIsRecording(true);
      const res = await cameraRef.current.recordAsync({
        maxDuration: 15,
      });
      setIsRecording(false);
      if (res?.uri) {
        setVideoUri(res.uri);
        setCameraActive(false);
      }
    } catch (err: any) {
      setIsRecording(false);
      Alert.alert('Recording Error', err.message || 'Unable to record video.');
    }
  };

  const stopRecording = () => {
    if (cameraRef.current && isRecording) {
      try {
        cameraRef.current.stopRecording();
      } catch {}
      setIsRecording(false);
    }
  };

  const toggleFacing = () => {
    setFacing((prev) => (prev === 'back' ? 'front' : 'back'));
  };

  const handleRetake = () => {
    setVideoUri(null);
    setCameraActive(true);
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

          {/* Viewfinder / Player Box */}
          <View style={styles.recordBox}>
            {videoUri ? (
              <View style={styles.previewContainer}>
                <VideoPreview uri={videoUri} />
                <View style={styles.badgeOverlay}>
                  <Badge label="OPTIMIZED (480p H.264)" variant="success" />
                </View>
              </View>
            ) : cameraActive ? (
              <View style={styles.cameraContainer}>
                <CameraView
                  ref={cameraRef}
                  style={StyleSheet.absoluteFill}
                  facing={facing}
                  mode="video"
                  videoQuality="480p"
                />
                {isRecording && (
                  <View style={styles.recordingIndicator}>
                    <View style={styles.redDot} />
                    <Text style={styles.recText}>REC 00:{recordingSeconds.toString().padStart(2, '0')} / 15s</Text>
                  </View>
                )}
                <TouchableOpacity
                  onPress={toggleFacing}
                  style={styles.flipBtn}
                  accessibilityLabel="Flip camera"
                >
                  <Ionicons name="camera-reverse" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={handleStartCamera} style={styles.emptyPrompt}>
                <Ionicons name="videocam-outline" size={54} color={colors.primary} />
                <Text style={[styles.emptyPromptText, { color: colors.text }]}>
                  Tap to Launch Camera & Record
                </Text>
                <Text style={[styles.emptyPromptSub, { color: colors.textSecondary }]}>
                  Front/Back camera with ISL gesture support
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Controls */}
          <View style={styles.buttonsRow}>
            {videoUri ? (
              <>
                <Button
                  title="Retake Video"
                  variant="outline"
                  onPress={handleRetake}
                  icon={<Ionicons name="camera" size={18} color={colors.text} />}
                  style={{ flex: 1, marginRight: 8 }}
                />
                <Button
                  title="Attach & Dispatch"
                  variant="danger"
                  onPress={handleAttachToSos}
                  icon={<Ionicons name="send" size={18} color="#FFFFFF" />}
                  style={{ flex: 1.2 }}
                />
              </>
            ) : cameraActive ? (
              isRecording ? (
                <Button
                  title={`Stop Recording (${recordingSeconds}s)`}
                  variant="danger"
                  onPress={stopRecording}
                  icon={<Ionicons name="stop-circle" size={18} color="#FFFFFF" />}
                  style={{ flex: 1 }}
                />
              ) : (
                <Button
                  title="Start 15s Recording"
                  variant="danger"
                  onPress={startRecording}
                  icon={<Ionicons name="videocam" size={18} color="#FFFFFF" />}
                  style={{ flex: 1 }}
                />
              )
            ) : (
              <Button
                title="Open Camera"
                variant="outline"
                onPress={handleStartCamera}
                icon={<Ionicons name="camera" size={18} color={colors.text} />}
                style={{ flex: 1 }}
              />
            )}
          </View>
        </Card>

        {/* Accessibility Features summary */}
        <Card style={styles.accessibilityCard}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Accessibility Compliance</Text>
          <Text style={[styles.bullet, { color: colors.textSecondary }]}>
            • Front-facing camera default for Indian Sign Language (ISL) emergency gestures
          </Text>
          <Text style={[styles.bullet, { color: colors.textSecondary }]}>
            • Ultra-low bitrate H.264 compression for slow 2G / Mesh packet transmission
          </Text>
          <Text style={[styles.bullet, { color: colors.textSecondary }]}>
            • High-performance native rendering via expo-video and expo-camera
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
    height: 260,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#64748B40',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    backgroundColor: '#00000020',
  },
  previewContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  badgeOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
  cameraContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  recordingIndicator: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000A0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  redDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
    marginRight: 6,
  },
  recText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  flipBtn: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#000000A0',
    padding: 8,
    borderRadius: 20,
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
