import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../store';
import { lightColors, darkColors, seniorTypography, normalTypography, spacing, borderRadius } from '../theme';
import { Header, Input, Badge } from '../components';
import { ChatMessage } from '../types';
import * as db from '../db';

const QUICK_CHIPS = [
  'I am safe now.',
  'Need immediate medical help!',
  'Trapped in room / building.',
  'Road is completely blocked.',
  'Water level rising fast!',
];

export const EmergencyChatScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { settings, connectivity } = useAppStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');

  const isDark = settings.themeMode !== 'light';
  const colors = isDark ? darkColors : lightColors;
  const typo = settings.seniorMode ? seniorTypography : normalTypography;

  useEffect(() => {
    loadChat();
  }, []);

  const loadChat = async () => {
    const list = await db.getChatMessages();
    if (list.length === 0) {
      // Initial greeting / status
      const seedMsg: ChatMessage = {
        id: 'msg_welcome',
        senderId: 'system_node',
        senderName: 'OneHelp Mesh Dispatch',
        messageText: 'Low-bandwidth peer channel established. Messages are compressed and forwarded via SMS or Bluetooth Mesh peers.',
        timestamp: Date.now() - 300000,
        status: 'DELIVERED',
      };
      await db.insertChatMessage(seedMsg);
      setMessages([seedMsg]);
    } else {
      setMessages(list);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const deliveryStatus = connectivity === 'ONLINE' ? 'DELIVERED' : (connectivity === 'SMS_ONLY' ? 'SENT_SMS' : 'SENT_BLE');

    const newMsg: ChatMessage = {
      id: `chat_${Date.now()}`,
      senderId: 'me',
      senderName: 'Me',
      messageText: text,
      timestamp: Date.now(),
      status: deliveryStatus,
    };

    setInputText('');
    setMessages((prev) => [...prev, newMsg]);
    await db.insertChatMessage(newMsg);

    // If offline, also enqueue to offline retry queue
    if (connectivity === 'OFFLINE') {
      await db.enqueueOfflineItem({
        id: `queue_chat_${newMsg.id}`,
        type: 'CHAT_MESSAGE',
        payloadJson: JSON.stringify(newMsg),
        createdAt: Date.now(),
      });
    }
  };

  const getStatusBadge = (status: ChatMessage['status']) => {
    switch (status) {
      case 'DELIVERED':
        return <Badge label="INTERNET" variant="success" />;
      case 'SENT_SMS':
        return <Badge label="SMS" variant="warning" />;
      case 'SENT_BLE':
        return <Badge label="BLE MESH" variant="info" />;
      default:
        return <Badge label="QUEUED" variant="neutral" />;
    }
  };

  const renderItem = ({ item }: { item: ChatMessage }) => {
    const isMe = item.senderId === 'me';
    return (
      <View style={[styles.messageBubbleContainer, isMe ? styles.myMsgContainer : styles.peerMsgContainer]}>
        <View
          style={[
            styles.messageBubble,
            {
              backgroundColor: isMe ? colors.primary : colors.surfaceSubtle,
              borderColor: colors.border,
            },
          ]}
        >
          {!isMe ? (
            <Text style={[styles.senderName, { color: colors.primary }]}>{item.senderName}</Text>
          ) : null}
          <Text style={[styles.msgText, { color: isMe ? '#FFFFFF' : colors.text, fontSize: typo.body.fontSize }]}>
            {item.messageText}
          </Text>
          <View style={styles.bubbleFooter}>
            <Text style={[styles.timestampText, { color: isMe ? '#FEE2E2' : colors.textMuted }]}>
              {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            {isMe ? <View style={{ marginLeft: 6 }}>{getStatusBadge(item.status)}</View> : null}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Emergency Mesh Chat"
        subtitle="Compressed low-overhead text relayed via BLE or SMS"
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />

        {/* Quick Response Chips */}
        <View style={styles.chipsScroll}>
          {QUICK_CHIPS.map((chip, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => handleSend(chip)}
              style={[styles.quickChip, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}
            >
              <Text style={[styles.quickChipText, { color: colors.text }]}>{chip}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Text Input Row */}
        <View style={[styles.inputRow, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <Input
            placeholder="Type short emergency message..."
            value={inputText}
            onChangeText={setInputText}
            containerStyle={{ flex: 1, marginVertical: 0 }}
          />
          <TouchableOpacity
            onPress={() => handleSend()}
            style={[styles.sendBtn, { backgroundColor: colors.primary }]}
            accessibilityLabel="Send message"
          >
            <Ionicons name="send" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: spacing.md,
  },
  messageBubbleContainer: {
    marginVertical: 4,
    width: '100%',
    flexDirection: 'row',
  },
  myMsgContainer: {
    justifyContent: 'flex-end',
  },
  peerMsgContainer: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '82%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  senderName: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  msgText: {
    lineHeight: 20,
  },
  bubbleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 6,
  },
  timestampText: {
    fontSize: 10,
  },
  chipsScroll: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  quickChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    marginRight: 6,
    marginBottom: 6,
  },
  quickChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderTopWidth: 1,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
});
