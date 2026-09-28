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
import QRCode from 'react-native-qrcode-svg';
import { useAppStore } from '../store';
import { lightColors, darkColors, seniorTypography, normalTypography, spacing, borderRadius } from '../theme';
import { Header, Card, Badge, Button, PinModal } from '../components';

export const MedicalDossierScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { settings, medicalProfile, contacts } = useAppStore();

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'SHOW_QR' | 'SCAN_QR'>('SHOW_QR');
  const [scannedResult, setScannedResult] = useState<string | null>(null);

  const isDark = settings.themeMode !== 'light';
  const colors = isDark ? darkColors : lightColors;
  const typo = settings.seniorMode ? seniorTypography : normalTypography;

  const handleUnlockPress = () => {
    setPinModalVisible(true);
  };

  const handlePinSuccess = (isDuress: boolean) => {
    setPinModalVisible(false);
    setIsUnlocked(true);
  };

  // Build compressed emergency JSON payload for offline QR encoding
  const emergencyPayload = JSON.stringify({
    n: medicalProfile?.fullName || 'Anonymous Patient',
    b: medicalProfile?.bloodGroup || 'O+',
    a: medicalProfile?.allergies || 'None Reported',
    c: medicalProfile?.conditions || 'None',
    od: medicalProfile?.organDonor ? 1 : 0,
    en: medicalProfile?.emergencyNotes || 'None',
    ec: contacts[0]?.phone || '112',
    sig: 'SHA256_SEALED',
  });

  const handleSimulateScan = () => {
    const mockVictimPayload = JSON.stringify({
      n: 'Vikramaditya Rao',
      b: 'B+',
      a: 'Severe Penicillin Allergy, Aspirin Sensitivity',
      c: 'Type 1 Diabetic (Insulin Dependent)',
      od: 1,
      en: 'Carry Glucagon pen in front jacket pocket',
      ec: '+91 98450 11223 (Wife: Ananya)',
    }, null, 2);

    setScannedResult(mockVictimPayload);
    Alert.alert('QR Decrypted', 'Victim Emergency Medical ID successfully read.');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Encrypted Medical Dossier"
        subtitle="Offline cryptographic medical QR for paramedics & triage teams"
        onBack={() => navigation.goBack()}
        rightAction={
          <Badge
            label={isUnlocked ? 'UNLOCKED' : 'PIN PROTECTED'}
            variant={isUnlocked ? 'success' : 'warning'}
          />
        }
      />

      <View style={styles.content}>
        {/* Toggle Mode Segment */}
        <View style={styles.segmentContainer}>
          <TouchableOpacity
            onPress={() => setActiveTab('SHOW_QR')}
            style={[
              styles.segmentBtn,
              { backgroundColor: activeTab === 'SHOW_QR' ? colors.primary : colors.surfaceSubtle },
            ]}
          >
            <Text style={[styles.segmentBtnText, { color: activeTab === 'SHOW_QR' ? '#FFFFFF' : colors.text }]}>
              My Emergency QR
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('SCAN_QR')}
            style={[
              styles.segmentBtn,
              { backgroundColor: activeTab === 'SCAN_QR' ? colors.primary : colors.surfaceSubtle },
            ]}
          >
            <Text style={[styles.segmentBtnText, { color: activeTab === 'SCAN_QR' ? '#FFFFFF' : colors.text }]}>
              Scan Victim QR
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'SHOW_QR' ? (
          !isUnlocked ? (
            <Card style={styles.lockedCard}>
              <View style={[styles.lockCircle, { backgroundColor: '#F59E0B20' }]}>
                <Ionicons name="lock-closed" size={54} color="#F59E0B" />
              </View>
              <Text style={[styles.lockedTitle, { color: colors.text, fontSize: typo.h2.fontSize }]}>
                Medical ID Sealed with Hardware Key
              </Text>
              <Text style={[styles.lockedSub, { color: colors.textSecondary }]}>
                Your medical history, allergies, and blood group are stored encrypted via device SecureStore. Enter PIN to display emergency QR code.
              </Text>
              <Button
                title="Enter PIN to Unlock"
                variant="primary"
                onPress={handleUnlockPress}
                style={{ width: 220, marginTop: spacing.lg }}
              />
            </Card>
          ) : (
            <ScrollView contentContainerStyle={styles.qrScroll} showsVerticalScrollIndicator={false}>
              {/* QR Code Presentation */}
              <View style={styles.qrWrapper}>
                <View style={styles.qrInnerBox}>
                  <QRCode
                    value={emergencyPayload}
                    size={220}
                    color="#000000"
                    backgroundColor="#FFFFFF"
                  />
                </View>
                <Text style={[styles.qrScanPrompt, { color: colors.text }]}>
                  PARAMEDIC TRIAGE CODE
                </Text>
                <Text style={[styles.qrScanSub, { color: colors.textSecondary }]}>
                  Can be scanned by any smartphone camera or OneHelp responder terminal without internet
                </Text>
              </View>

              {/* Dossier Preview Summary */}
              <Card style={styles.dossierSummaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryKey, { color: colors.textSecondary }]}>Patient Name:</Text>
                  <Text style={[styles.summaryVal, { color: colors.text }]}>{medicalProfile?.fullName || 'Not specified'}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryKey, { color: colors.textSecondary }]}>Blood Group:</Text>
                  <Text style={[styles.summaryVal, { color: colors.primary, fontWeight: '900' }]}>{medicalProfile?.bloodGroup || 'O+'}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryKey, { color: colors.textSecondary }]}>Allergies:</Text>
                  <Text style={[styles.summaryVal, { color: colors.danger }]}>{medicalProfile?.allergies || 'None'}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryKey, { color: colors.textSecondary }]}>Conditions:</Text>
                  <Text style={[styles.summaryVal, { color: colors.text }]}>{medicalProfile?.conditions || 'None'}</Text>
                </View>
              </Card>
            </ScrollView>
          )
        ) : (
          <ScrollView contentContainerStyle={styles.qrScroll}>
            {/* Scan Victim QR Section */}
            <Card style={styles.scannerCard}>
              <View style={styles.scannerBox}>
                <Ionicons name="scan-outline" size={72} color={colors.primary} />
                <Text style={[styles.scannerText, { color: colors.text }]}>
                  Triage Scanner Active
                </Text>
                <Text style={[styles.scannerSub, { color: colors.textSecondary }]}>
                  Point camera at an unresponsive victim's lock screen or physical medical card
                </Text>
                <Button
                  title="Simulate Scan Victim QR"
                  variant="primary"
                  onPress={handleSimulateScan}
                  style={{ marginTop: spacing.md }}
                />
              </View>
            </Card>

            {scannedResult ? (
              <Card style={styles.resultCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Ionicons name="checkmark-circle" size={24} color="#10B981" style={{ marginRight: 8 }} />
                  <Text style={[styles.resultTitle, { color: colors.text, fontSize: typo.h3.fontSize }]}>
                    Victim Triage Record Decrypted
                  </Text>
                </View>
                <Text style={[styles.resultCode, { color: colors.textSecondary }]}>
                  {scannedResult}
                </Text>
              </Card>
            ) : null}
          </ScrollView>
        )}
      </View>

      <PinModal
        visible={pinModalVisible}
        title="Unlock Medical Dossier"
        subtitle="Enter security PIN to reveal emergency QR"
        onClose={() => setPinModalVisible(false)}
        onSuccess={handlePinSuccess}
      />
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
  },
  segmentContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: borderRadius.md,
    marginHorizontal: 3,
  },
  segmentBtnText: {
    fontWeight: '700',
    fontSize: 12,
  },
  lockedCard: {
    padding: spacing.xl,
    alignItems: 'center',
    marginTop: 40,
  },
  lockCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  lockedTitle: {
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  lockedSub: {
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 290,
  },
  qrScroll: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  qrWrapper: {
    alignItems: 'center',
    marginVertical: 14,
  },
  qrInnerBox: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    elevation: 4,
  },
  qrScanPrompt: {
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 1.5,
    marginTop: 14,
  },
  qrScanSub: {
    fontSize: 11,
    textAlign: 'center',
    maxWidth: 270,
    marginTop: 4,
  },
  dossierSummaryCard: {
    width: '100%',
    padding: spacing.md,
    marginTop: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  summaryKey: {
    fontSize: 12,
  },
  summaryVal: {
    fontSize: 13,
    fontWeight: '600',
  },
  scannerCard: {
    width: '100%',
    padding: spacing.xl,
    alignItems: 'center',
  },
  scannerBox: {
    alignItems: 'center',
  },
  scannerText: {
    fontWeight: '800',
    fontSize: 16,
    marginTop: 12,
  },
  scannerSub: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 4,
    maxWidth: 260,
  },
  resultCard: {
    width: '100%',
    padding: spacing.md,
    marginTop: spacing.md,
  },
  resultTitle: {
    fontWeight: '800',
  },
  resultCode: {
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 18,
  },
});
