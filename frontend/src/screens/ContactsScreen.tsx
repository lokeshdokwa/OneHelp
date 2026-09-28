import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Alert,
  Linking,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store';
import { lightColors, darkColors, seniorTypography, normalTypography, spacing, borderRadius } from '../theme';
import { t } from '../i18n';
import { Button, Card, Badge, Input, EmptyState, Header } from '../components';
import { TrustedContact } from '../types';

export const ContactsScreen: React.FC = () => {
  const { settings, contacts, addContact, updateContact, deleteContact } = useAppStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  const isDark = settings.themeMode !== 'light';
  const colors = isDark ? darkColors : lightColors;
  const typo = settings.seniorMode ? seniorTypography : normalTypography;

  const openAddModal = () => {
    setEditingId(null);
    setName('');
    setPhone('');
    setRelationship('');
    setIsPrimary(contacts.length === 0);
    setErrors({});
    setModalVisible(true);
  };

  const openEditModal = (contact: TrustedContact) => {
    setEditingId(contact.id);
    setName(contact.name);
    setPhone(contact.phone);
    setRelationship(contact.relationship);
    setIsPrimary(contact.isPrimary);
    setErrors({});
    setModalVisible(true);
  };

  const validate = (): boolean => {
    const errs: { name?: string; phone?: string } = {};
    if (!name.trim()) errs.name = 'Contact name is required';
    if (!phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (phone.trim().length < 8) {
      errs.phone = 'Enter a valid phone number';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    if (editingId) {
      await updateContact({
        id: editingId,
        name: name.trim(),
        phone: phone.trim(),
        relationship: relationship.trim(),
        isPrimary,
        createdAt: Date.now(),
      });
    } else {
      await addContact({
        id: `contact_${Date.now()}`,
        name: name.trim(),
        phone: phone.trim(),
        relationship: relationship.trim(),
        isPrimary,
        createdAt: Date.now(),
      });
    }

    setModalVisible(false);
  };

  const handleDelete = (contact: TrustedContact) => {
    Alert.alert(
      'Delete Contact',
      `Are you sure you want to remove ${contact.name} from emergency contacts?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteContact(contact.id);
          },
        },
      ]
    );
  };

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const renderItem = ({ item }: { item: TrustedContact }) => (
    <Card style={styles.contactCard}>
      <View style={styles.cardMainRow}>
        <View style={[styles.avatarCircle, { backgroundColor: colors.primaryMuted }]}>
          <Text style={[styles.avatarText, { color: colors.primary }]}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.contactDetails}>
          <View style={styles.nameRow}>
            <Text style={[styles.contactName, { color: colors.text, fontSize: typo.h3.fontSize }]}>
              {item.name}
            </Text>
            {item.isPrimary ? (
              <Badge label="PRIMARY" variant="danger" style={{ marginLeft: 6 }} />
            ) : null}
          </View>
          <Text style={[styles.contactPhone, { color: colors.textSecondary, fontSize: typo.body.fontSize }]}>
            {item.phone}
          </Text>
          {item.relationship ? (
            <Text style={[styles.contactRel, { color: colors.textMuted, fontSize: typo.caption.fontSize }]}>
              {item.relationship}
            </Text>
          ) : null}
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            onPress={() => handleCall(item.phone)}
            style={[styles.actionIconBtn, { backgroundColor: '#065F46' }]}
            accessibilityLabel={`Call ${item.name}`}
          >
            <Ionicons name="call" size={18} color="#34D399" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => openEditModal(item)}
            style={[styles.actionIconBtn, { backgroundColor: colors.surfaceSubtle }]}
            accessibilityLabel={`Edit ${item.name}`}
          >
            <Ionicons name="create-outline" size={18} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDelete(item)}
            style={[styles.actionIconBtn, { backgroundColor: colors.surfaceSubtle }]}
            accessibilityLabel={`Delete ${item.name}`}
          >
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={t('contactsTitle', settings.language)}
        subtitle="Will receive automated SMS & location link on SOS"
        rightAction={
          <Button
            title="Add"
            variant="primary"
            size="sm"
            onPress={openAddModal}
            icon={<Ionicons name="add" size={18} color="#FFFFFF" />}
          />
        }
      />

      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            iconName="people-outline"
            title={t('noContactsEmptyTitle', settings.language)}
            description={t('noContactsEmptySubtitle', settings.language)}
            actionLabel={t('addContact', settings.language)}
            onAction={openAddModal}
          />
        }
      />

      {/* Add / Edit Contact Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <SafeAreaView style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text, fontSize: typo.h2.fontSize }]}>
                {editingId ? t('editContact', settings.language) : t('addContact', settings.language)}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Input
              label={t('contactName', settings.language)}
              placeholder="e.g. Papa, Sunita, Rahul"
              value={name}
              onChangeText={setName}
              error={errors.name}
            />

            <Input
              label={t('contactPhone', settings.language)}
              placeholder="e.g. +91 98765 43210"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              error={errors.phone}
            />

            <Input
              label={t('contactRelationship', settings.language)}
              placeholder="e.g. Father, Sister, Neighbor"
              value={relationship}
              onChangeText={setRelationship}
            />

            <TouchableOpacity
              style={styles.primaryToggleRow}
              onPress={() => setIsPrimary(!isPrimary)}
            >
              <Ionicons
                name={isPrimary ? 'checkbox' : 'square-outline'}
                size={22}
                color={isPrimary ? colors.primary : colors.textMuted}
              />
              <Text style={[styles.primaryToggleText, { color: colors.text, fontSize: typo.body.fontSize }]}>
                {t('isPrimaryContact', settings.language)}
              </Text>
            </TouchableOpacity>

            <View style={styles.modalButtons}>
              <Button
                title={t('cancel', settings.language)}
                variant="outline"
                onPress={() => setModalVisible(false)}
                style={{ flex: 1, marginRight: spacing.sm }}
              />
              <Button
                title={t('save', settings.language)}
                variant="primary"
                onPress={handleSave}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl + 20,
  },
  contactCard: {
    marginVertical: 4,
    padding: spacing.md,
  },
  cardMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
  },
  contactDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactName: {
    fontWeight: '700',
  },
  contactPhone: {
    fontWeight: '500',
    marginTop: 2,
  },
  contactRel: {
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontWeight: '700',
  },
  primaryToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  primaryToggleText: {
    marginLeft: 10,
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: spacing.md,
  },
});
