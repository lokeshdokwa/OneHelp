import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../store';
import { lightColors, darkColors, seniorTypography, normalTypography, spacing, borderRadius } from '../theme';
import { t } from '../i18n';
import { Button, Input, Header, Card } from '../components';
import { BloodGroup, MedicalProfile } from '../types';

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const MedicalProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { settings, medicalProfile, saveMedicalProfile } = useAppStore();

  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('Unknown');
  const [allergies, setAllergies] = useState('');
  const [conditions, setConditions] = useState('');
  const [medications, setMedications] = useState('');
  const [organDonor, setOrganDonor] = useState(false);
  const [emergencyNotes, setEmergencyNotes] = useState('');

  const isDark = settings.themeMode !== 'light';
  const colors = isDark ? darkColors : lightColors;
  const typo = settings.seniorMode ? seniorTypography : normalTypography;

  useEffect(() => {
    if (medicalProfile) {
      setFullName(medicalProfile.fullName || '');
      setAge(medicalProfile.age ? String(medicalProfile.age) : '');
      setGender(medicalProfile.gender || '');
      setBloodGroup(medicalProfile.bloodGroup || 'Unknown');
      setAllergies(medicalProfile.allergies || '');
      setConditions(medicalProfile.conditions || '');
      setMedications(medicalProfile.medications || '');
      setOrganDonor(medicalProfile.organDonor || false);
      setEmergencyNotes(medicalProfile.emergencyNotes || '');
    }
  }, [medicalProfile]);

  const handleSave = async () => {
    const profile: MedicalProfile = {
      id: medicalProfile?.id || 'med_user',
      fullName: fullName.trim(),
      age: age ? parseInt(age, 10) : null,
      gender: gender.trim(),
      bloodGroup,
      allergies: allergies.trim(),
      conditions: conditions.trim(),
      medications: medications.trim(),
      organDonor,
      emergencyNotes: emergencyNotes.trim(),
      updatedAt: Date.now(),
    };

    await saveMedicalProfile(profile);
    Alert.alert('Saved', 'Emergency Medical ID updated successfully.');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={t('medicalProfileTitle', settings.language)}
        subtitle="Shared with emergency dispatch and first responders"
        onBack={() => navigation.goBack()}
        rightAction={
          <Button
            title={t('save', settings.language)}
            variant="primary"
            size="sm"
            onPress={handleSave}
          />
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Important notice */}
        <Card style={styles.bannerCard}>
          <View style={styles.bannerRow}>
            <Ionicons name="medkit" size={24} color={colors.primary} />
            <Text style={[styles.bannerText, { color: colors.text, fontSize: typo.caption.fontSize }]}>
              This medical information is encoded into your SOS alert and offline medical QR code for paramedics.
            </Text>
          </View>
        </Card>

        {/* Basic Information */}
        <Input
          label={t('fullName', settings.language)}
          placeholder="e.g. Ramesh Chandra Sharma"
          value={fullName}
          onChangeText={setFullName}
        />

        <View style={styles.rowInputs}>
          <Input
            label={t('age', settings.language)}
            placeholder="e.g. 52"
            keyboardType="numeric"
            value={age}
            onChangeText={setAge}
            containerStyle={{ flex: 1, marginRight: spacing.sm }}
          />
          <Input
            label={t('gender', settings.language)}
            placeholder="e.g. Male / Female"
            value={gender}
            onChangeText={setGender}
            containerStyle={{ flex: 1 }}
          />
        </View>

        {/* Blood Group Picker Chips */}
        <Text style={[styles.label, { color: colors.textSecondary, fontSize: typo.caption.fontSize }]}>
          {t('bloodGroup', settings.language)}
        </Text>
        <View style={styles.bloodGroupGrid}>
          {BLOOD_GROUPS.map((bg) => {
            const isSelected = bloodGroup === bg;
            return (
              <TouchableOpacity
                key={bg}
                onPress={() => setBloodGroup(bg)}
                style={[
                  styles.bloodChip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surfaceSubtle,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.bloodChipText,
                    {
                      color: isSelected ? '#FFFFFF' : colors.text,
                      fontSize: typo.button.fontSize,
                    },
                  ]}
                >
                  {bg}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Clinical Data */}
        <Input
          label={t('allergies', settings.language)}
          placeholder="e.g. Penicillin, Peanuts, Dust"
          value={allergies}
          onChangeText={setAllergies}
        />

        <Input
          label={t('conditions', settings.language)}
          placeholder="e.g. Type 2 Diabetes, Severe Asthma, Pacemaker"
          value={conditions}
          onChangeText={setConditions}
        />

        <Input
          label={t('medications', settings.language)}
          placeholder="e.g. Insulin, Metformin 500mg, Inhaler"
          value={medications}
          onChangeText={setMedications}
        />

        {/* Organ Donor Toggle */}
        <TouchableOpacity
          style={styles.organDonorRow}
          onPress={() => setOrganDonor(!organDonor)}
        >
          <Ionicons
            name={organDonor ? 'heart' : 'heart-outline'}
            size={24}
            color={organDonor ? colors.primary : colors.textMuted}
          />
          <Text style={[styles.organDonorText, { color: colors.text, fontSize: typo.body.fontSize }]}>
            {t('organDonor', settings.language)}
          </Text>
        </TouchableOpacity>

        {/* Emergency instructions notes */}
        <Input
          label={t('emergencyNotes', settings.language)}
          placeholder="Special instructions for emergency crew (e.g. Inhaler in front backpack pocket)"
          value={emergencyNotes}
          onChangeText={setEmergencyNotes}
          multiline
          numberOfLines={3}
          inputStyle={{ minHeight: 70 }}
        />

        <Button
          title={t('save', settings.language)}
          variant="primary"
          onPress={handleSave}
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
    paddingBottom: spacing.xxl + 20,
  },
  bannerCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerText: {
    marginLeft: 10,
    flex: 1,
    lineHeight: 18,
  },
  rowInputs: {
    flexDirection: 'row',
  },
  label: {
    fontWeight: '600',
    marginTop: spacing.sm,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bloodGroupGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  bloodChip: {
    width: '22%',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginRight: '3%',
    marginBottom: 8,
  },
  bloodChipText: {
    fontWeight: '700',
  },
  organDonorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  organDonorText: {
    marginLeft: 10,
    fontWeight: '600',
  },
});
