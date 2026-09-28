import React, { useState } from 'react';
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
import { useAppStore } from '../store';
import { lightColors, darkColors, seniorTypography, normalTypography, spacing, borderRadius } from '../theme';
import { t } from '../i18n';
import { Button, Card, Badge, PinModal } from '../components';
import { SosEngine } from '../services/sos';
import { SOSStepState } from '../types';

export const ActiveSosScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { settings, activeSosSession, fakeSosCancelled } = useAppStore();
  const [pinModalVisible, setPinModalVisible] = useState(false);

  const isDark = settings.themeMode !== 'light';
  const colors = isDark ? darkColors : lightColors;
  const typo = settings.seniorMode ? seniorTypography : normalTypography;

  const handleOpenCancel = () => {
    setPinModalVisible(true);
  };

  const handlePinVerified = async (isDuress: boolean) => {
    setPinModalVisible(false);
    if (!activeSosSession) return;

    await SosEngine.cancelSOS(activeSosSession.id, isDuress);

    if (!isDuress) {
      // Normal cancellation - return home
      Alert.alert('SOS Cancelled', 'Emergency broadcast has been terminated.');
      navigation.navigate('HomeTab');
    }
    // If duress, fakeSosCancelled will become true in store, rendering the deceptive screen below!
  };

  const getStepIcon = (state: SOSStepState) => {
    switch (state) {
      case 'success':
        return <Ionicons name="checkmark-circle" size={24} color="#10B981" />;
      case 'in_progress':
        return <Ionicons name="sync-circle" size={24} color="#3B82F6" />;
      case 'failed':
        return <Ionicons name="close-circle" size={24} color="#EF4444" />;
      case 'skipped':
        return <Ionicons name="remove-circle" size={24} color="#64748B" />;
      default:
        return <Ionicons name="ellipse-outline" size={24} color="#94A3B8" />;
    }
  };

  const getStepBadge = (state: SOSStepState) => {
    switch (state) {
      case 'success':
        return <Badge label="DELIVERED" variant="success" />;
      case 'in_progress':
        return <Badge label="DISPATCHING" variant="info" />;
      case 'failed':
        return <Badge label="FALLBACK CASCADED" variant="danger" />;
      case 'skipped':
        return <Badge label="SKIPPED" variant="neutral" />;
      default:
        return <Badge label="QUEUED" variant="neutral" />;
    }
  };

  // If DURESS was triggered, render the DECEPTIVE "SOS CANCELLED" SCREEN!
  // Aggressor sees this and believes the victim cancelled it, while the silent broadcast continues!
  if (fakeSosCancelled) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.fakeCancelledContainer}>
          <View style={[styles.fakeIconCircle, { backgroundColor: '#064E3B' }]}>
            <Ionicons name="checkmark-done-circle" size={72} color="#34D399" />
          </View>
          <Text style={[styles.fakeCancelledTitle, { color: colors.text, fontSize: typo.h1.fontSize }]}>
            Emergency SOS Cancelled
          </Text>
          <Text style={[styles.fakeCancelledSub, { color: colors.textSecondary, fontSize: typo.body.fontSize }]}>
            All emergency responder dispatches and SMS alerts have been successfully recalled. Device standing down.
          </Text>
          <Button
            title="Return to Dashboard"
            variant="secondary"
            onPress={() => navigation.navigate('HomeTab')}
            style={{ width: '80%', marginTop: spacing.xl }}
          />
        </View>
      </SafeAreaView>
    );
  }

  const results = activeSosSession?.channelResults || {
    internet: 'idle',
    sms: 'idle',
    ble: 'idle',
    localQueue: 'idle',
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Pulsing Emergency Alarm Header */}
        <View style={[styles.emergencyBanner, { backgroundColor: colors.danger }]}>
          <Ionicons name="warning" size={32} color="#FFFFFF" />
          <View style={styles.bannerTextContainer}>
            <Text style={styles.bannerTitle}>
              {t('sosActiveTitle', settings.language)}
            </Text>
            <Text style={styles.bannerSub}>
              Trigger: {activeSosSession?.payload.triggerType || 'MANUAL'} • Cascading multi-channel broadcast
            </Text>
          </View>
        </View>

        {/* Audio Evidence Auto-Recording Indicator */}
        {settings.autoRecordAudio ? (
          <View style={[styles.audioNotice, { backgroundColor: colors.surfaceSubtle }]}>
            <View style={styles.pulsingDot} />
            <Text style={[styles.audioNoticeText, { color: colors.text, fontSize: typo.caption.fontSize }]}>
              {t('silentRecordingNotice', settings.language)}
            </Text>
          </View>
        ) : null}

        {/* Live Channel Fallback Status Card */}
        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: typo.h3.fontSize }]}>
          Multi-Channel Fallback Status
        </Text>

        {/* Channel 1: Internet Cloud Dispatch */}
        <Card style={styles.channelCard}>
          <View style={styles.channelRow}>
            {getStepIcon(results.internet)}
            <View style={styles.channelDetails}>
              <Text style={[styles.channelTitle, { color: colors.text }]}>
                1. {t('sosChannelInternet', settings.language)}
              </Text>
              <Text style={[styles.channelDesc, { color: colors.textSecondary }]}>
                Central Disaster Command (NDRF/112 API)
              </Text>
            </View>
            {getStepBadge(results.internet)}
          </View>
        </Card>

        {/* Channel 2: SMS to Trusted Contacts */}
        <Card style={styles.channelCard}>
          <View style={styles.channelRow}>
            {getStepIcon(results.sms)}
            <View style={styles.channelDetails}>
              <Text style={[styles.channelTitle, { color: colors.text }]}>
                2. {t('sosChannelSms', settings.language)}
              </Text>
              <Text style={[styles.channelDesc, { color: colors.textSecondary }]}>
                Coordinates link sent to trusted contacts
              </Text>
            </View>
            {getStepBadge(results.sms)}
          </View>
        </Card>

        {/* Channel 3: BLE Mesh Peer Relay */}
        <Card style={styles.channelCard}>
          <View style={styles.channelRow}>
            {getStepIcon(results.ble)}
            <View style={styles.channelDetails}>
              <Text style={[styles.channelTitle, { color: colors.text }]}>
                3. {t('sosChannelBle', settings.language)}
              </Text>
              <Text style={[styles.channelDesc, { color: colors.textSecondary }]}>
                Offline peer rebroadcast without cell/wifi
              </Text>
            </View>
            {getStepBadge(results.ble)}
          </View>
        </Card>

        {/* Channel 4: Local Queue with Auto-Retry */}
        <Card style={styles.channelCard}>
          <View style={styles.channelRow}>
            {getStepIcon(results.localQueue)}
            <View style={styles.channelDetails}>
              <Text style={[styles.channelTitle, { color: colors.text }]}>
                4. {t('sosChannelQueue', settings.language)}
              </Text>
              <Text style={[styles.channelDesc, { color: colors.textSecondary }]}>
                SQLite persistent vault auto-retry on reconnect
              </Text>
            </View>
            {getStepBadge(results.localQueue)}
          </View>
        </Card>

        {/* Real-time Broadcast Activity Log */}
        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: typo.h3.fontSize }]}>
          Incident Transmission Log
        </Text>
        <Card style={styles.logCard}>
          {activeSosSession?.log && activeSosSession.log.length > 0 ? (
            activeSosSession.log.map((entry, index) => (
              <Text key={index} style={[styles.logText, { color: colors.textSecondary }]}>
                {entry}
              </Text>
            ))
          ) : (
            <Text style={[styles.logText, { color: colors.textMuted }]}>
              Initializing transmission channels...
            </Text>
          )}
        </Card>

        {/* Secure Cancel Button */}
        <View style={styles.actionSection}>
          <Button
            title={t('sosCancelButton', settings.language)}
            variant="outline"
            onPress={handleOpenCancel}
            icon={<Ionicons name="lock-closed" size={18} color={colors.text} />}
            style={styles.cancelBtn}
          />
        </View>
      </ScrollView>

      {/* Security PIN Validation Modal */}
      <PinModal
        visible={pinModalVisible}
        title="Enter Security PIN"
        subtitle={t('sosEnterPinPrompt', settings.language)}
        onClose={() => setPinModalVisible(false)}
        onSuccess={handlePinVerified}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl + 20,
  },
  emergencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  bannerTextContainer: {
    marginLeft: spacing.md,
    flex: 1,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  bannerSub: {
    color: '#FEE2E2',
    fontSize: 12,
    marginTop: 2,
  },
  audioNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm + 2,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  pulsingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
    marginRight: 8,
  },
  audioNoticeText: {
    flex: 1,
    fontWeight: '500',
  },
  sectionTitle: {
    fontWeight: '700',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  channelCard: {
    marginVertical: 4,
    padding: spacing.md,
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  channelDetails: {
    flex: 1,
    marginLeft: spacing.md,
    marginRight: spacing.sm,
  },
  channelTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  channelDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  logCard: {
    padding: spacing.md,
    marginVertical: 4,
  },
  logText: {
    fontSize: 11,
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  actionSection: {
    marginTop: spacing.xl,
  },
  cancelBtn: {
    width: '100%',
  },
  fakeCancelledContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  fakeIconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  fakeCancelledTitle: {
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  fakeCancelledSub: {
    textAlign: 'center',
    lineHeight: 22,
  },
});
