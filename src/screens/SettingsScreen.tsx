import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../store';
import { lightColors, darkColors, seniorTypography, normalTypography, spacing, borderRadius } from '../theme';
import { t } from '../i18n';
import { Card, Header, Input, Button } from '../components';
import { AppLanguage, ThemeMode } from '../types';

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { settings, updateSettings } = useAppStore();

  const [normalPin, setNormalPin] = useState(settings.normalPin);
  const [duressPin, setDuressPin] = useState(settings.duressPin);

  const isDark = settings.themeMode !== 'light';
  const colors = isDark ? darkColors : lightColors;
  const typo = settings.seniorMode ? seniorTypography : normalTypography;

  const handleSavePins = async () => {
    if (normalPin.length !== 4 || !/^\d{4}$/.test(normalPin)) {
      Alert.alert('Invalid PIN', 'Normal PIN must be exactly 4 digits.');
      return;
    }
    if (duressPin.length !== 4 || !/^\d{4}$/.test(duressPin)) {
      Alert.alert('Invalid PIN', 'Duress PIN must be exactly 4 digits.');
      return;
    }
    if (normalPin === duressPin) {
      Alert.alert('PIN Conflict', 'Normal PIN and Duress PIN must be different.');
      return;
    }

    await updateSettings({ normalPin, duressPin });
    Alert.alert('PINs Updated', 'Security PINs saved successfully.');
  };

  const handleLanguageChange = (lang: AppLanguage) => {
    updateSettings({ language: lang });
  };

  const handleThemeChange = (mode: ThemeMode) => {
    updateSettings({ themeMode: mode });
  };

  const handleSensitivityChange = (sens: 'low' | 'medium' | 'high') => {
    updateSettings({ shakeSensitivity: sens });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={t('settingsTitle', settings.language)}
        subtitle="Security configurations, detectors & accessibility"
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Section: Display & Accessibility */}
        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: typo.h3.fontSize }]}>
          {t('sectionAppearance', settings.language)}
        </Text>

        <Card style={styles.card}>
          {/* Senior Mode Toggle */}
          <View style={styles.row}>
            <View style={styles.rowLabelGroup}>
              <View style={[styles.settingIcon, { backgroundColor: '#7C3AED20' }]}>
                <Ionicons name="eye" size={20} color="#8B5CF6" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemTitle, { color: colors.text, fontSize: typo.bodyLarge.fontSize }]}>
                  {t('seniorMode', settings.language)}
                </Text>
                <Text style={[styles.itemSub, { color: colors.textSecondary }]}>
                  Enlarges text & high-contrast tap targets
                </Text>
              </View>
            </View>
            <Switch
              value={settings.seniorMode}
              onValueChange={(val) => updateSettings({ seniorMode: val })}
              trackColor={{ false: '#475569', true: colors.primary }}
            />
          </View>

          {/* Language Selector */}
          <View style={[styles.row, styles.borderTop, { borderColor: colors.border }]}>
            <View style={styles.rowLabelGroup}>
              <View style={[styles.settingIcon, { backgroundColor: '#2563EB20' }]}>
                <Ionicons name="globe" size={20} color="#3B82F6" />
              </View>
              <View>
                <Text style={[styles.itemTitle, { color: colors.text, fontSize: typo.bodyLarge.fontSize }]}>
                  {t('language', settings.language)}
                </Text>
              </View>
            </View>
            <View style={styles.segmentedButtons}>
              <TouchableOpacity
                onPress={() => handleLanguageChange('en')}
                style={[
                  styles.segBtn,
                  { backgroundColor: settings.language === 'en' ? colors.primary : colors.surfaceSubtle },
                ]}
              >
                <Text style={[styles.segBtnText, { color: settings.language === 'en' ? '#FFFFFF' : colors.text }]}>
                  EN
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleLanguageChange('hi')}
                style={[
                  styles.segBtn,
                  { backgroundColor: settings.language === 'hi' ? colors.primary : colors.surfaceSubtle },
                ]}
              >
                <Text style={[styles.segBtnText, { color: settings.language === 'hi' ? '#FFFFFF' : colors.text }]}>
                  हिन्दी
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Theme Selector */}
          <View style={[styles.row, styles.borderTop, { borderColor: colors.border }]}>
            <View style={styles.rowLabelGroup}>
              <View style={[styles.settingIcon, { backgroundColor: '#F59E0B20' }]}>
                <Ionicons name={isDark ? 'moon' : 'sunny'} size={20} color="#F59E0B" />
              </View>
              <View>
                <Text style={[styles.itemTitle, { color: colors.text, fontSize: typo.bodyLarge.fontSize }]}>
                  {t('theme', settings.language)}
                </Text>
              </View>
            </View>
            <View style={styles.segmentedButtons}>
              <TouchableOpacity
                onPress={() => handleThemeChange('dark')}
                style={[
                  styles.segBtn,
                  { backgroundColor: settings.themeMode === 'dark' ? colors.primary : colors.surfaceSubtle },
                ]}
              >
                <Text style={[styles.segBtnText, { color: settings.themeMode === 'dark' ? '#FFFFFF' : colors.text }]}>
                  Dark
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleThemeChange('light')}
                style={[
                  styles.segBtn,
                  { backgroundColor: settings.themeMode === 'light' ? colors.primary : colors.surfaceSubtle },
                ]}
              >
                <Text style={[styles.segBtnText, { color: settings.themeMode === 'light' ? '#FFFFFF' : colors.text }]}>
                  Light
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Card>

        {/* Section: Automated Detectors */}
        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: typo.h3.fontSize }]}>
          {t('sectionSafetyDetectors', settings.language)}
        </Text>

        <Card style={styles.card}>
          {/* Shake to SOS */}
          <View style={styles.row}>
            <View style={styles.rowLabelGroup}>
              <View style={[styles.settingIcon, { backgroundColor: '#DC262620' }]}>
                <Ionicons name="phone-portrait" size={20} color="#DC2626" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemTitle, { color: colors.text, fontSize: typo.bodyLarge.fontSize }]}>
                  {t('shakeToSos', settings.language)}
                </Text>
                <Text style={[styles.itemSub, { color: colors.textSecondary }]}>
                  Rapid phone shaking triggers SOS
                </Text>
              </View>
            </View>
            <Switch
              value={settings.shakeToSosEnabled}
              onValueChange={(val) => updateSettings({ shakeToSosEnabled: val })}
              trackColor={{ false: '#475569', true: colors.primary }}
            />
          </View>

          {/* Shake Sensitivity */}
          {settings.shakeToSosEnabled ? (
            <View style={[styles.row, styles.borderTop, { borderColor: colors.border }]}>
              <Text style={[styles.itemSub, { color: colors.text }]}>Sensitivity:</Text>
              <View style={styles.segmentedButtons}>
                {(['low', 'medium', 'high'] as const).map((lvl) => (
                  <TouchableOpacity
                    key={lvl}
                    onPress={() => handleSensitivityChange(lvl)}
                    style={[
                      styles.segBtn,
                      {
                        backgroundColor:
                          settings.shakeSensitivity === lvl ? colors.primary : colors.surfaceSubtle,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.segBtnText,
                        { color: settings.shakeSensitivity === lvl ? '#FFFFFF' : colors.text },
                      ]}
                    >
                      {lvl.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : null}

          {/* Voice SOS */}
          <View style={[styles.row, styles.borderTop, { borderColor: colors.border }]}>
            <View style={styles.rowLabelGroup}>
              <View style={[styles.settingIcon, { backgroundColor: '#05966920' }]}>
                <Ionicons name="mic" size={20} color="#10B981" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemTitle, { color: colors.text, fontSize: typo.bodyLarge.fontSize }]}>
                  {t('voiceSos', settings.language)}
                </Text>
                <Text style={[styles.itemSub, { color: colors.textSecondary }]}>
                  Listens for "Bachao", "Help", "SOS"
                </Text>
              </View>
            </View>
            <Switch
              value={settings.voiceSosEnabled}
              onValueChange={(val) => updateSettings({ voiceSosEnabled: val })}
              trackColor={{ false: '#475569', true: colors.primary }}
            />
          </View>

          {/* Acoustic Gunshot Detection */}
          <View style={[styles.row, styles.borderTop, { borderColor: colors.border }]}>
            <View style={styles.rowLabelGroup}>
              <View style={[styles.settingIcon, { backgroundColor: '#EA580C20' }]}>
                <Ionicons name="radio" size={20} color="#EA580C" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemTitle, { color: colors.text, fontSize: typo.bodyLarge.fontSize }]}>
                  {t('acousticDetection', settings.language)}
                </Text>
                <Text style={[styles.itemSub, { color: colors.textSecondary }]}>
                  Impulse gunshot & shattered glass trigger
                </Text>
              </View>
            </View>
            <Switch
              value={settings.acousticDetectionEnabled}
              onValueChange={(val) => updateSettings({ acousticDetectionEnabled: val })}
              trackColor={{ false: '#475569', true: colors.primary }}
            />
          </View>

          {/* Voice Stress Detection */}
          <View style={[styles.row, styles.borderTop, { borderColor: colors.border }]}>
            <View style={styles.rowLabelGroup}>
              <View style={[styles.settingIcon, { backgroundColor: '#9333EA20' }]}>
                <Ionicons name="pulse" size={20} color="#A855F7" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemTitle, { color: colors.text, fontSize: typo.bodyLarge.fontSize }]}>
                  {t('voiceStress', settings.language)}
                </Text>
                <Text style={[styles.itemSub, { color: colors.textSecondary }]}>
                  Microphone panic audio spectrum analysis
                </Text>
              </View>
            </View>
            <Switch
              value={settings.voiceStressEnabled}
              onValueChange={(val) => updateSettings({ voiceStressEnabled: val })}
              trackColor={{ false: '#475569', true: colors.primary }}
            />
          </View>

          {/* BLE Mesh Relay */}
          <View style={[styles.row, styles.borderTop, { borderColor: colors.border }]}>
            <View style={styles.rowLabelGroup}>
              <View style={[styles.settingIcon, { backgroundColor: '#0284C720' }]}>
                <Ionicons name="bluetooth" size={20} color="#0EA5E9" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemTitle, { color: colors.text, fontSize: typo.bodyLarge.fontSize }]}>
                  {t('bleRelay', settings.language)}
                </Text>
                <Text style={[styles.itemSub, { color: colors.textSecondary }]}>
                  Relay SOS packets for nearby citizens
                </Text>
              </View>
            </View>
            <Switch
              value={settings.bleRelayEnabled}
              onValueChange={(val) => updateSettings({ bleRelayEnabled: val })}
              trackColor={{ false: '#475569', true: colors.primary }}
            />
          </View>

          {/* Auto Record Audio on SOS */}
          <View style={[styles.row, styles.borderTop, { borderColor: colors.border }]}>
            <View style={styles.rowLabelGroup}>
              <View style={[styles.settingIcon, { backgroundColor: '#DC262620' }]}>
                <Ionicons name="recording" size={20} color="#EF4444" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemTitle, { color: colors.text, fontSize: typo.bodyLarge.fontSize }]}>
                  {t('autoRecordAudio', settings.language)}
                </Text>
                <Text style={[styles.itemSub, { color: colors.textSecondary }]}>
                  Encrypt audio evidence during SOS
                </Text>
              </View>
            </View>
            <Switch
              value={settings.autoRecordAudio}
              onValueChange={(val) => updateSettings({ autoRecordAudio: val })}
              trackColor={{ false: '#475569', true: colors.primary }}
            />
          </View>
        </Card>

        {/* Section: Duress & Security PINs */}
        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: typo.h3.fontSize }]}>
          {t('sectionSecurity', settings.language)}
        </Text>

        <Card style={styles.card}>
          <Text style={[styles.duressExpl, { color: colors.textSecondary, fontSize: typo.caption.fontSize }]}>
            {t('duressExplanation', settings.language)}
          </Text>

          <Input
            label={t('normalPinTitle', settings.language)}
            placeholder="4 digits (e.g. 1234)"
            keyboardType="numeric"
            maxLength={4}
            secureTextEntry
            value={normalPin}
            onChangeText={setNormalPin}
          />

          <Input
            label={t('duressPinTitle', settings.language)}
            placeholder="4 digits (e.g. 9999)"
            keyboardType="numeric"
            maxLength={4}
            secureTextEntry
            value={duressPin}
            onChangeText={setDuressPin}
          />

          <Button
            title="Update Security PINs"
            variant="outline"
            size="sm"
            onPress={handleSavePins}
            style={{ marginTop: spacing.sm }}
          />
        </Card>

        {/* Developer Test Panel Entry */}
        <Card style={[styles.devPanelCard, { borderColor: '#7C3AED' }]}>
          <TouchableOpacity
            style={styles.devPanelRow}
            onPress={() => navigation.navigate('DevTestPanel')}
          >
            <View style={[styles.settingIcon, { backgroundColor: '#7C3AED' }]}>
              <Ionicons name="construct" size={20} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.itemTitle, { color: colors.text, fontSize: typo.bodyLarge.fontSize }]}>
                {t('devTestPanel', settings.language)}
              </Text>
              <Text style={[styles.itemSub, { color: colors.textSecondary }]}>
                Simulate shake, gunshot, offline state & BLE packets
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
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
    paddingBottom: spacing.xxl + 20,
  },
  sectionTitle: {
    fontWeight: '700',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  card: {
    marginVertical: 4,
    padding: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  borderTop: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  rowLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  itemTitle: {
    fontWeight: '600',
  },
  itemSub: {
    fontSize: 11,
    marginTop: 2,
  },
  segmentedButtons: {
    flexDirection: 'row',
  },
  segBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    marginLeft: 6,
  },
  segBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  duressExpl: {
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  devPanelCard: {
    marginTop: spacing.lg,
    borderWidth: 1.5,
    padding: spacing.md,
  },
  devPanelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
