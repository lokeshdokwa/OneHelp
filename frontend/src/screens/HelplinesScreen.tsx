import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Linking,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../store';
import { lightColors, darkColors, seniorTypography, normalTypography, spacing, borderRadius } from '../theme';
import { t } from '../i18n';
import { Card, Badge, Input, Header, Button } from '../components';
import { EMERGENCY_HELPLINES } from '../data/helplines';
import { EmergencyHelpline } from '../types';

export const HelplinesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { settings } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');

  const isDark = settings.themeMode !== 'light';
  const colors = isDark ? darkColors : lightColors;
  const typo = settings.seniorMode ? seniorTypography : normalTypography;
  const isHindi = settings.language === 'hi';

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const filteredHelplines = EMERGENCY_HELPLINES.filter((h) => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      h.name.toLowerCase().includes(q) ||
      h.nameHi.toLowerCase().includes(q) ||
      h.number.includes(q) ||
      h.description.toLowerCase().includes(q)
    );
  });

  const getCategoryIcon = (category: EmergencyHelpline['category']): keyof typeof Ionicons.glyphMap => {
    switch (category) {
      case 'ALL_IN_ONE':
        return 'shield-checkmark';
      case 'POLICE':
        return 'shield';
      case 'FIRE':
        return 'flame';
      case 'AMBULANCE':
        return 'medical';
      case 'WOMEN':
        return 'female';
      case 'CHILD':
        return 'people';
      case 'CYBER':
        return 'laptop';
      case 'DISASTER':
        return 'warning';
      default:
        return 'call';
    }
  };

  const renderItem = ({ item }: { item: EmergencyHelpline }) => {
    const title = isHindi ? item.nameHi : item.name;
    const desc = isHindi ? item.descriptionHi : item.description;

    return (
      <Card style={styles.card}>
        <View style={styles.cardRow}>
          <View style={[styles.iconBox, { backgroundColor: colors.primaryMuted }]}>
            <Ionicons name={getCategoryIcon(item.category)} size={26} color={colors.primary} />
          </View>

          <View style={styles.infoContainer}>
            <View style={styles.numberRow}>
              <Text style={[styles.numberText, { color: colors.primary, fontSize: typo.h2.fontSize }]}>
                {item.number}
              </Text>
              <Badge label={item.category.replace('_', ' ')} variant="neutral" style={{ marginLeft: 8 }} />
            </View>
            <Text style={[styles.titleText, { color: colors.text, fontSize: typo.h3.fontSize }]}>
              {title}
            </Text>
            <Text style={[styles.descText, { color: colors.textSecondary, fontSize: typo.caption.fontSize }]}>
              {desc}
            </Text>
          </View>

          <Button
            title={t('callNow', settings.language)}
            variant="danger"
            size="sm"
            onPress={() => handleCall(item.number)}
            icon={<Ionicons name="call" size={16} color="#FFFFFF" />}
            style={styles.callButton}
          />
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={t('helplineTitle', settings.language)}
        subtitle="Free toll-free emergency response numbers in India"
        onBack={() => navigation.goBack()}
      />

      <View style={styles.searchBox}>
        <Input
          placeholder={t('search', settings.language)}
          value={searchQuery}
          onChangeText={setSearchQuery}
          icon={<Ionicons name="search" size={20} color={colors.textMuted} />}
        />
      </View>

      <FlatList
        data={filteredHelplines}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBox: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl + 20,
  },
  card: {
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
  infoContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  numberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  numberText: {
    fontWeight: '900',
    letterSpacing: 1,
  },
  titleText: {
    fontWeight: '700',
    marginTop: 2,
  },
  descText: {
    lineHeight: 16,
    marginTop: 2,
  },
  callButton: {
    minWidth: 80,
  },
});
