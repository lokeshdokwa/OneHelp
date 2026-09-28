import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../store';
import { lightColors, darkColors, seniorTypography, normalTypography, spacing, borderRadius } from '../theme';
import { t } from '../i18n';
import { Header, Card, Badge } from '../components';

interface ToolItem {
  id: string;
  screen: string;
  titleKey: string;
  descKey: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  badge?: string;
  badgeVariant?: 'primary' | 'success' | 'warning' | 'info' | 'danger';
}

export const ToolsHubScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { settings } = useAppStore();

  const isDark = settings.themeMode !== 'light';
  const colors = isDark ? darkColors : lightColors;
  const typo = settings.seniorMode ? seniorTypography : normalTypography;

  const toolSections: { title: string; tools: ToolItem[] }[] = [
    {
      title: 'Immediate Threat & Signaling',
      tools: [
        {
          id: 'siren',
          screen: 'Siren',
          titleKey: 'siren',
          descKey: 'sirenDesc',
          icon: 'volume-high',
          color: '#DC2626',
          badge: 'LOUD ALARM',
          badgeVariant: 'danger',
        },
        {
          id: 'fake_call',
          screen: 'FakeCall',
          titleKey: 'fakeCall',
          descKey: 'fakeCallDesc',
          icon: 'call',
          color: '#2563EB',
          badge: 'ESCAPE',
          badgeVariant: 'info',
        },
        {
          id: 'morse',
          screen: 'MorseSos',
          titleKey: 'morseSos',
          descKey: 'morseSosDesc',
          icon: 'flash',
          color: '#F59E0B',
          badge: 'VISUAL SOS',
          badgeVariant: 'warning',
        },
      ],
    },
    {
      title: 'Disaster Map & First Responders',
      tools: [
        {
          id: 'hazard_map',
          screen: 'HazardMap',
          titleKey: 'hazardMap',
          descKey: 'hazardMapDesc',
          icon: 'map',
          color: '#059669',
          badge: 'OFFLINE TILES',
          badgeVariant: 'success',
        },
        {
          id: 'responder',
          screen: 'ResponderTracking',
          titleKey: 'responderTracker',
          descKey: 'responderTrackerDesc',
          icon: 'navigate',
          color: '#0284C7',
          badge: 'LIVE ETA',
          badgeVariant: 'info',
        },
        {
          id: 'green_corridor',
          screen: 'GreenCorridor',
          titleKey: 'greenCorridor',
          descKey: 'greenCorridorDesc',
          icon: 'car',
          color: '#10B981',
          badge: 'TRAFFIC PREEMPT',
          badgeVariant: 'success',
        },
      ],
    },
    {
      title: 'Local Security & Evidence',
      tools: [
        {
          id: 'evidence',
          screen: 'AudioEvidence',
          titleKey: 'audioEvidence',
          descKey: 'audioEvidenceDesc',
          icon: 'mic-circle',
          color: '#9333EA',
          badge: 'ENCRYPTED',
          badgeVariant: 'primary',
        },
        {
          id: 'dossier',
          screen: 'MedicalDossier',
          titleKey: 'medicalDossier',
          descKey: 'medicalDossierDesc',
          icon: 'qr-code',
          color: '#7C3AED',
          badge: 'PARAMEDIC QR',
          badgeVariant: 'primary',
        },
        {
          id: 'chat',
          screen: 'EmergencyChat',
          titleKey: 'emergencyChat',
          descKey: 'emergencyChatDesc',
          icon: 'chatbubbles',
          color: '#0891B2',
          badge: 'BLE / SMS',
          badgeVariant: 'info',
        },
        {
          id: 'video_relay',
          screen: 'VideoRelay',
          titleKey: 'Sign-Language Video Relay',
          descKey: 'Record silent emergency video message queued for offline transmission',
          icon: 'videocam',
          color: '#D97706',
          badge: 'ACCESSIBLE',
          badgeVariant: 'warning',
        },
      ],
    },
    {
      title: 'Mesh & AI Edge Detectors',
      tools: [
        {
          id: 'ble_mesh',
          screen: 'BleMesh',
          titleKey: 'Bluetooth Mesh Relay',
          descKey: 'Peer-to-peer offline packet hop routing without mobile towers',
          icon: 'bluetooth',
          color: '#3B82F6',
          badge: 'HOP RELAY',
          badgeVariant: 'info',
        },
        {
          id: 'lost_child',
          screen: 'LostChild',
          titleKey: 'lostChildMatching',
          descKey: 'lostChildDesc',
          icon: 'person-add',
          color: '#E11D48',
          badge: 'ON-DEVICE AI',
          badgeVariant: 'danger',
        },
        {
          id: 'voice_sos',
          screen: 'VoiceSos',
          titleKey: 'voiceSos',
          descKey: 'Hands-free emergency keyword listener ("Bachao", "Help")',
          icon: 'megaphone',
          color: '#16A34A',
          badge: 'VOICE TRIGGER',
          badgeVariant: 'success',
        },
        {
          id: 'voice_stress',
          screen: 'VoiceStress',
          titleKey: 'Voice Stress Monitor',
          descKey: 'Audio amplitude & pitch stress variance monitoring with auto-SOS',
          icon: 'pulse',
          color: '#8B5CF6',
          badge: 'STRESS AI',
          badgeVariant: 'primary',
        },
        {
          id: 'acoustic',
          screen: 'AcousticGunshot',
          titleKey: 'acousticDetection',
          descKey: 'Instant impulse detector for gunshots and shattered glass',
          icon: 'radio',
          color: '#C026D3',
          badge: 'IMPULSE ACOUSTIC',
          badgeVariant: 'danger',
        },
        {
          id: 'satellite',
          screen: 'SatelliteBridge',
          titleKey: 'Satellite Emergency Bulletin',
          descKey: 'Ultra-compact <160 char payload encoder for low-orbit satellites',
          icon: 'planet',
          color: '#4F46E5',
          badge: 'SATELLITE',
          badgeVariant: 'info',
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={t('toolsTitle', settings.language)}
        subtitle="Full suite of on-device safety, mesh & disaster response tools"
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {toolSections.map((section, sIndex) => (
          <View key={sIndex} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontSize: typo.h3.fontSize }]}>
              {section.title}
            </Text>

            {section.tools.map((tool) => {
              const toolTitle = (t as any)(tool.titleKey, settings.language) || tool.titleKey;
              const toolDesc = (t as any)(tool.descKey, settings.language) || tool.descKey;

              return (
                <TouchableOpacity
                  key={tool.id}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate(tool.screen)}
                >
                  <Card style={styles.toolCard}>
                    <View style={styles.cardRow}>
                      <View style={[styles.iconBox, { backgroundColor: `${tool.color}20` }]}>
                        <Ionicons name={tool.icon} size={28} color={tool.color} />
                      </View>

                      <View style={styles.textContainer}>
                        <View style={styles.titleRow}>
                          <Text
                            style={[
                              styles.toolTitle,
                              { color: colors.text, fontSize: typo.bodyLarge.fontSize },
                            ]}
                          >
                            {toolTitle}
                          </Text>
                          {tool.badge ? (
                            <Badge
                              label={tool.badge}
                              variant={tool.badgeVariant || 'neutral'}
                              style={{ marginLeft: 6 }}
                            />
                          ) : null}
                        </View>
                        <Text
                          style={[
                            styles.toolDesc,
                            { color: colors.textSecondary, fontSize: typo.caption.fontSize },
                          ]}
                          numberOfLines={2}
                        >
                          {toolDesc}
                        </Text>
                      </View>

                      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
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
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontWeight: '800',
    marginBottom: spacing.xs,
    letterSpacing: 0.2,
  },
  toolCard: {
    marginVertical: 4,
    padding: spacing.md,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
    marginRight: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 2,
  },
  toolTitle: {
    fontWeight: '700',
  },
  toolDesc: {
    lineHeight: 16,
    marginTop: 2,
  },
});
