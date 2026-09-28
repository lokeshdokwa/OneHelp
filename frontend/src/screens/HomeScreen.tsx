import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../store';
import { lightColors, darkColors, seniorTypography, normalTypography, spacing, borderRadius } from '../theme';
import { t } from '../i18n';
import { Badge, Card, SosButton } from '../components';
import { SosEngine } from '../services/sos';
import { checkConnectivity } from '../services/network';
import { getCurrentOrLastKnownLocation, requestLocationPermissions } from '../services/location';
import { startShakeDetection, stopShakeDetection } from '../services/shake';

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {
    settings,
    connectivity,
    setConnectivity,
    currentLocation,
    setLocation,
    contacts,
    activeSosSession,
    meshPeerCount,
  } = useAppStore();

  const [refreshingLoc, setRefreshingLoc] = useState(false);
  const isDark = settings.themeMode !== 'light';
  const colors = isDark ? darkColors : lightColors;
  const typo = settings.seniorMode ? seniorTypography : normalTypography;

  // Poll connectivity and location on mount
  useEffect(() => {
    let isMounted = true;

    const initNetwork = async () => {
      const net = await checkConnectivity();
      if (isMounted) setConnectivity(net);
    };

    const initLoc = async () => {
      const granted = await requestLocationPermissions();
      if (granted && isMounted) {
        const loc = await getCurrentOrLastKnownLocation();
        if (loc && isMounted) setLocation(loc);
      }
    };

    initNetwork();
    initLoc();

    const netInterval = setInterval(initNetwork, 10000);
    return () => {
      isMounted = false;
      clearInterval(netInterval);
    };
  }, []);

  // Shake to SOS listener
  useEffect(() => {
    if (settings.shakeToSosEnabled) {
      startShakeDetection(settings.shakeSensitivity, () => {
        handleTriggerSos('SHAKE');
      });
    } else {
      stopShakeDetection();
    }
    return () => stopShakeDetection();
  }, [settings.shakeToSosEnabled, settings.shakeSensitivity]);

  const handleRefreshLocation = async () => {
    setRefreshingLoc(true);
    const loc = await getCurrentOrLastKnownLocation();
    if (loc) setLocation(loc);
    setRefreshingLoc(false);
  };

  const handleTriggerSos = async (triggerType: 'MANUAL_BUTTON' | 'SHAKE' = 'MANUAL_BUTTON') => {
    try {
      await SosEngine.triggerSOS(triggerType);
      navigation.navigate('ActiveSos');
    } catch (err: any) {
      Alert.alert('SOS Error', err.message || 'Failed to dispatch SOS alert');
    }
  };

  const getConnectivityBadge = () => {
    switch (connectivity) {
      case 'ONLINE':
        return {
          label: t('online', settings.language),
          variant: 'success' as const,
          icon: <Ionicons name="cloud-done" size={14} color="#34D399" />,
        };
      case 'SMS_ONLY':
        return {
          label: t('smsOnly', settings.language),
          variant: 'warning' as const,
          icon: <Ionicons name="chatbox-ellipses" size={14} color="#FBBF24" />,
        };
      case 'OFFLINE':
      default:
        return {
          label: t('offline', settings.language),
          variant: 'danger' as const,
          icon: <Ionicons name="cloud-offline" size={14} color="#F87171" />,
        };
    }
  };

  const connBadge = getConnectivityBadge();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Header & Connectivity Row */}
      <View style={styles.topHeader}>
        <View>
          <Text style={[styles.appTitle, { color: colors.text, fontSize: typo.h1.fontSize }]}>
            {t('appName', settings.language)}
          </Text>
          <Text style={[styles.appSubtitle, { color: colors.textSecondary, fontSize: typo.caption.fontSize }]}>
            {t('tagline', settings.language)}
          </Text>
        </View>
        <Badge
          label={connBadge.label}
          variant={connBadge.variant}
          icon={connBadge.icon}
        />
      </View>

      {/* Mesh Nodes Peer Count Indicator */}
      <View style={[styles.meshStatusRow, { backgroundColor: colors.surfaceSubtle }]}>
        <Ionicons name="bluetooth" size={16} color={colors.info} />
        <Text style={[styles.meshText, { color: colors.textSecondary, fontSize: typo.caption.fontSize }]}>
          {t('connectedPeers', settings.language)}: <Text style={{ color: colors.info, fontWeight: '700' }}>{meshPeerCount + 2} active</Text>
        </Text>
      </View>

      {/* Primary SOS Interactive Button */}
      <SosButton onTrigger={() => handleTriggerSos('MANUAL_BUTTON')} />

      {/* Active SOS Banner if running */}
      {activeSosSession ? (
        <TouchableOpacity
          onPress={() => navigation.navigate('ActiveSos')}
          style={[styles.activeBanner, { backgroundColor: colors.danger }]}
        >
          <Ionicons name="alert-circle" size={24} color="#FFFFFF" style={{ marginRight: 8 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.activeBannerTitle}>EMERGENCY SOS IS ACTIVE</Text>
            <Text style={styles.activeBannerSub}>Tap to view broadcast status or cancel</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      ) : null}

      {/* Current Geo Location Card */}
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="location" size={20} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={[styles.cardTitle, { color: colors.text, fontSize: typo.h3.fontSize }]}>
              {t('currentLocation', settings.language)}
            </Text>
          </View>
          <TouchableOpacity onPress={handleRefreshLocation} disabled={refreshingLoc}>
            <Ionicons
              name="refresh"
              size={20}
              color={refreshingLoc ? colors.textMuted : colors.primary}
            />
          </TouchableOpacity>
        </View>

        {currentLocation ? (
          <View style={styles.locationDetails}>
            {currentLocation.address ? (
              <Text style={[styles.locAddress, { color: colors.text, fontSize: typo.body.fontSize }]}>
                {currentLocation.address}
              </Text>
            ) : null}
            <Text style={[styles.locCoords, { color: colors.textSecondary, fontSize: typo.caption.fontSize }]}>
              {currentLocation.latitude.toFixed(5)}, {currentLocation.longitude.toFixed(5)}
              {currentLocation.accuracy ? ` (±${Math.round(currentLocation.accuracy)}m)` : ''}
            </Text>
          </View>
        ) : (
          <Text style={[styles.locCoords, { color: colors.textMuted, fontSize: typo.caption.fontSize }]}>
            {t('locationUnavailable', settings.language)}
          </Text>
        )}
      </Card>

      {/* Trusted Contacts Alert Summary Card */}
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="people" size={20} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={[styles.cardTitle, { color: colors.text, fontSize: typo.h3.fontSize }]}>
              {t('trustedContactsSummary', settings.language)}
            </Text>
          </View>
          <Badge
            label={`${contacts.length} ADDED`}
            variant={contacts.length > 0 ? 'success' : 'warning'}
          />
        </View>

        {contacts.length > 0 ? (
          <View style={styles.contactsRow}>
            {contacts.slice(0, 3).map((c) => (
              <View key={c.id} style={[styles.contactChip, { backgroundColor: colors.surfaceSubtle }]}>
                <Ionicons name="person-circle-outline" size={16} color={colors.primary} />
                <Text numberOfLines={1} style={[styles.contactChipText, { color: colors.text }]}>
                  {c.name}
                </Text>
              </View>
            ))}
            {contacts.length > 3 ? (
              <Text style={[styles.moreText, { color: colors.textSecondary }]}>+{contacts.length - 3} more</Text>
            ) : null}
          </View>
        ) : (
          <TouchableOpacity onPress={() => navigation.navigate('ContactsTab')}>
            <Text style={[styles.emptyContactsText, { color: colors.primary }]}>
              {t('noContactsYet', settings.language)}
            </Text>
          </TouchableOpacity>
        )}
      </Card>

      {/* Emergency Quick Action Grid */}
      <Text style={[styles.sectionHeading, { color: colors.text, fontSize: typo.h3.fontSize }]}>
        {t('quickActions', settings.language)}
      </Text>

      <View style={styles.quickGrid}>
        <TouchableOpacity
          style={[styles.quickTile, { backgroundColor: colors.surfaceSubtle }]}
          onPress={() => navigation.navigate('Helplines')}
        >
          <View style={[styles.tileIconCircle, { backgroundColor: '#DC2626' }]}>
            <Ionicons name="call" size={22} color="#FFFFFF" />
          </View>
          <Text style={[styles.tileLabel, { color: colors.text }]}>112 Helplines</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickTile, { backgroundColor: colors.surfaceSubtle }]}
          onPress={() => navigation.navigate('GuidesTab')}
        >
          <View style={[styles.tileIconCircle, { backgroundColor: '#2563EB' }]}>
            <Ionicons name="book" size={22} color="#FFFFFF" />
          </View>
          <Text style={[styles.tileLabel, { color: colors.text }]}>Offline Guides</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickTile, { backgroundColor: colors.surfaceSubtle }]}
          onPress={() => navigation.navigate('ToolsTab', { screen: 'Siren' })}
        >
          <View style={[styles.tileIconCircle, { backgroundColor: '#EA580C' }]}>
            <Ionicons name="volume-high" size={22} color="#FFFFFF" />
          </View>
          <Text style={[styles.tileLabel, { color: colors.text }]}>Loud Siren</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickTile, { backgroundColor: colors.surfaceSubtle }]}
          onPress={() => navigation.navigate('MedicalProfile')}
        >
          <View style={[styles.tileIconCircle, { backgroundColor: '#7C3AED' }]}>
            <Ionicons name="medkit" size={22} color="#FFFFFF" />
          </View>
          <Text style={[styles.tileLabel, { color: colors.text }]}>Medical ID</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl + 20,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  appTitle: {
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontWeight: '500',
    marginTop: 2,
  },
  meshStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  meshText: {
    marginLeft: 6,
  },
  activeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginVertical: spacing.sm,
  },
  activeBannerTitle: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  activeBannerSub: {
    color: '#FEE2E2',
    fontSize: 12,
  },
  card: {
    marginVertical: spacing.xs + 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontWeight: '700',
  },
  locationDetails: {
    marginTop: spacing.sm,
  },
  locAddress: {
    fontWeight: '500',
    marginBottom: 4,
  },
  locCoords: {
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  contactsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
  },
  contactChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    marginRight: 6,
    marginVertical: 3,
  },
  contactChipText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    maxWidth: 90,
  },
  moreText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyContactsText: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: spacing.sm,
    textDecorationLine: 'underline',
  },
  sectionHeading: {
    fontWeight: '700',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  quickGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  quickTile: {
    width: '48%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  tileIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  tileLabel: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
