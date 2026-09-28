import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAppStore } from '../store';
import { lightColors, darkColors, seniorTypography, normalTypography, spacing, borderRadius } from '../theme';
import { Header, Card, Badge, Button } from '../components';
import { OFFLINE_GUIDES } from '../data/guides';

export const GuideDetailScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { settings } = useAppStore();
  const guideId = route.params?.guideId;

  const isDark = settings.themeMode !== 'light';
  const colors = isDark ? darkColors : lightColors;
  const typo = settings.seniorMode ? seniorTypography : normalTypography;
  const isHindi = settings.language === 'hi';

  const guide = OFFLINE_GUIDES.find((g) => g.id === guideId) || OFFLINE_GUIDES[0];

  const title = isHindi ? guide.titleHi : guide.title;
  const desc = isHindi ? guide.shortDescriptionHi : guide.shortDescription;
  const dos = isHindi ? guide.dosHi : guide.dos;
  const donts = isHindi ? guide.dontsHi : guide.donts;

  const handleCallEmergency = () => {
    Linking.openURL('tel:112');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={title}
        subtitle={guide.category.replace('_', ' ')}
        onBack={() => navigation.goBack()}
        rightAction={
          <Badge
            label={guide.urgency}
            variant={guide.urgency === 'CRITICAL' ? 'danger' : 'warning'}
          />
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Overview banner */}
        <Card style={styles.overviewCard}>
          <Text style={[styles.descText, { color: colors.text, fontSize: typo.bodyLarge.fontSize }]}>
            {desc}
          </Text>
        </Card>

        {/* Action Steps */}
        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: typo.h2.fontSize }]}>
          Step-by-Step Procedure
        </Text>

        {guide.steps.map((step) => {
          const stepTitle = isHindi ? step.titleHi : step.title;
          const stepInstruction = isHindi ? step.instructionHi : step.instruction;

          return (
            <Card key={step.stepNumber} style={styles.stepCard}>
              <View style={styles.stepHeader}>
                <View style={[styles.stepNumberBadge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.stepNumberText}>{step.stepNumber}</Text>
                </View>
                <Text style={[styles.stepTitle, { color: colors.text, fontSize: typo.h3.fontSize }]}>
                  {stepTitle}
                </Text>
              </View>
              <Text style={[styles.stepInstruction, { color: colors.textSecondary, fontSize: typo.body.fontSize }]}>
                {stepInstruction}
              </Text>
            </Card>
          );
        })}

        {/* DOs Section */}
        <Text style={[styles.sectionTitle, { color: '#10B981', fontSize: typo.h3.fontSize }]}>
          CRITICAL DOs
        </Text>
        <Card style={[styles.doCard, { borderColor: '#059669' }]}>
          {dos.map((item, idx) => (
            <View key={idx} style={styles.bulletRow}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" style={{ marginRight: 8, marginTop: 2 }} />
              <Text style={[styles.bulletText, { color: colors.text, fontSize: typo.body.fontSize }]}>
                {item}
              </Text>
            </View>
          ))}
        </Card>

        {/* DONTs Section */}
        <Text style={[styles.sectionTitle, { color: '#EF4444', fontSize: typo.h3.fontSize }]}>
          STRICT DONTs
        </Text>
        <Card style={[styles.dontCard, { borderColor: '#DC2626' }]}>
          {donts.map((item, idx) => (
            <View key={idx} style={styles.bulletRow}>
              <Ionicons name="close-circle" size={20} color="#EF4444" style={{ marginRight: 8, marginTop: 2 }} />
              <Text style={[styles.bulletText, { color: colors.text, fontSize: typo.body.fontSize }]}>
                {item}
              </Text>
            </View>
          ))}
        </Card>

        {/* Emergency Escalation Action */}
        <View style={styles.callSection}>
          <Button
            title="Call 112 Emergency Dispatch"
            variant="danger"
            onPress={handleCallEmergency}
            icon={<Ionicons name="call" size={20} color="#FFFFFF" />}
            style={{ width: '100%' }}
          />
        </View>
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
  overviewCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  descText: {
    fontWeight: '500',
    lineHeight: 22,
  },
  sectionTitle: {
    fontWeight: '800',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  stepCard: {
    marginVertical: 4,
    padding: spacing.md,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepNumberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  stepTitle: {
    fontWeight: '700',
    flex: 1,
  },
  stepInstruction: {
    lineHeight: 22,
    marginLeft: 38,
  },
  doCard: {
    backgroundColor: '#064E3B20',
    borderWidth: 1,
    marginVertical: 4,
    padding: spacing.md,
  },
  dontCard: {
    backgroundColor: '#450A0A20',
    borderWidth: 1,
    marginVertical: 4,
    padding: spacing.md,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 4,
  },
  bulletText: {
    flex: 1,
    lineHeight: 20,
  },
  callSection: {
    marginTop: spacing.xl,
  },
});
