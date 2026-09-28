import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../store';
import { lightColors, darkColors, seniorTypography, normalTypography, spacing, borderRadius } from '../theme';
import { t } from '../i18n';
import { Card, Badge, Input, Header, EmptyState } from '../components';
import { OFFLINE_GUIDES } from '../data/guides';
import { OfflineGuide } from '../types';

export const OfflineGuidesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { settings } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const isDark = settings.themeMode !== 'light';
  const colors = isDark ? darkColors : lightColors;
  const typo = settings.seniorMode ? seniorTypography : normalTypography;

  const categories = [
    { key: 'ALL', label: 'All' },
    { key: 'FIRST_AID', label: 'First Aid' },
    { key: 'NATURAL_DISASTER', label: 'Disasters' },
    { key: 'ACCIDENT', label: 'Accidents' },
  ];

  const filteredGuides = useMemo(() => {
    return OFFLINE_GUIDES.filter((guide) => {
      const matchesCategory = selectedCategory === 'ALL' || guide.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        guide.title.toLowerCase().includes(q) ||
        guide.titleHi.toLowerCase().includes(q) ||
        guide.shortDescription.toLowerCase().includes(q) ||
        guide.shortDescriptionHi.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const renderItem = ({ item }: { item: OfflineGuide }) => {
    const isHindi = settings.language === 'hi';
    const displayTitle = isHindi ? item.titleHi : item.title;
    const displayDesc = isHindi ? item.shortDescriptionHi : item.shortDescription;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.navigate('GuideDetail', { guideId: item.id })}
      >
        <Card style={styles.guideCard}>
          <View style={styles.cardRow}>
            <View
              style={[
                styles.iconBox,
                {
                  backgroundColor:
                    item.urgency === 'CRITICAL' ? colors.primaryMuted : colors.surfaceSubtle,
                },
              ]}
            >
              <Ionicons
                name={item.icon as any}
                size={28}
                color={item.urgency === 'CRITICAL' ? colors.primary : colors.info}
              />
            </View>

            <View style={styles.textContainer}>
              <View style={styles.badgeRow}>
                <Badge
                  label={item.urgency}
                  variant={item.urgency === 'CRITICAL' ? 'danger' : 'warning'}
                />
                <Text style={[styles.categoryTag, { color: colors.textMuted }]}>
                  {item.category.replace('_', ' ')}
                </Text>
              </View>

              <Text
                style={[
                  styles.guideTitle,
                  {
                    color: colors.text,
                    fontSize: typo.h3.fontSize,
                  },
                ]}
              >
                {displayTitle}
              </Text>
              <Text
                numberOfLines={2}
                style={[
                  styles.guideDesc,
                  {
                    color: colors.textSecondary,
                    fontSize: typo.body.fontSize - 1,
                  },
                ]}
              >
                {displayDesc}
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={t('guidesTitle', settings.language)}
        subtitle="100% Offline emergency protocols & first-aid procedures"
      />

      <View style={styles.searchContainer}>
        <Input
          placeholder={t('search', settings.language)}
          value={searchQuery}
          onChangeText={setSearchQuery}
          icon={<Ionicons name="search" size={20} color={colors.textMuted} />}
        />
      </View>

      {/* Category Filter Chips */}
      <View style={styles.categoriesRow}>
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.key;
          return (
            <TouchableOpacity
              key={cat.key}
              onPress={() => setSelectedCategory(cat.key)}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: isSelected ? colors.primary : colors.surfaceSubtle,
                  borderColor: isSelected ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  {
                    color: isSelected ? '#FFFFFF' : colors.text,
                    fontWeight: isSelected ? '700' : '500',
                  },
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={filteredGuides}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            iconName="book-outline"
            title="No Guides Found"
            description={`No emergency guides matching "${searchQuery}".`}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
  },
  categoriesRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 12,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl + 20,
  },
  guideCard: {
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
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryTag: {
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  guideTitle: {
    fontWeight: '700',
    marginBottom: 2,
  },
  guideDesc: {
    lineHeight: 18,
  },
});
