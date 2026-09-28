import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../store';
import { lightColors, darkColors, seniorTypography, normalTypography, spacing, borderRadius } from '../theme';
import { Header, Card, Badge, Button } from '../components';
import { BleMesh } from '../services/bleRelay';
import { MeshPacket, MeshRelayNode } from '../types';

export const BleMeshScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { settings } = useAppStore();
  const [nodes, setNodes] = useState<MeshRelayNode[]>([]);
  const [relayedPackets, setRelayedPackets] = useState<MeshPacket[]>([]);
  const [isScanning, setIsScanning] = useState(true);

  const isDark = settings.themeMode !== 'light';
  const colors = isDark ? darkColors : lightColors;
  const typo = settings.seniorMode ? seniorTypography : normalTypography;

  useEffect(() => {
    updateMeshState();
    const interval = setInterval(updateMeshState, 3000);
    return () => clearInterval(interval);
  }, []);

  const updateMeshState = () => {
    setNodes(BleMesh.getNearbyNodes());
    setRelayedPackets(BleMesh.getRelayedPackets());
  };

  const handleSimulateIncomingPacket = () => {
    const mockPacket: MeshPacket = {
      packetId: `pkt_external_${Date.now()}`,
      originNodeId: 'node_delhi_sector_6',
      senderNodeId: 'node_peer_alpha',
      ttl: 4,
      payloadType: 'SOS',
      payloadJson: JSON.stringify({
        sosId: 'sos_ext_99',
        triggerType: 'MANUAL_BUTTON',
        messageText: 'Flooding in basement! 3 people trapped.',
      }),
      timestamp: Date.now(),
    };

    const res = BleMesh.handleIncomingPacket(mockPacket);
    updateMeshState();
    Alert.alert(
      'Mesh Packet Ingested',
      `Received packet ${mockPacket.packetId}.\nDecision: ${res.message}`
    );
  };

  const handleTestLoopPrevention = () => {
    // Re-send the first packet to demonstrate duplicate detection
    if (relayedPackets.length > 0) {
      const duplicate = relayedPackets[0];
      const res = BleMesh.handleIncomingPacket(duplicate);
      Alert.alert('Loop Prevention Verified', `Result: ${res.message}`);
    } else {
      Alert.alert('Info', 'Generate an incoming packet first to test duplicate loop suppression.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Bluetooth Low Energy Mesh"
        subtitle="Zero-tower ad-hoc packet hop routing network"
        onBack={() => navigation.goBack()}
        rightAction={
          <Badge
            label={`${nodes.length} PEERS`}
            variant="info"
          />
        }
      />

      <View style={styles.content}>
        {/* Node status telemetry card */}
        <Card style={styles.telemetryCard}>
          <View style={styles.nodeHeaderRow}>
            <View style={[styles.nodeIconBox, { backgroundColor: '#3B82F620' }]}>
              <Ionicons name="bluetooth" size={24} color="#3B82F6" />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[styles.nodeTitle, { color: colors.text, fontSize: typo.h3.fontSize }]}>
                This Device: {BleMesh.getNodeId()}
              </Text>
              <Text style={[styles.nodeSub, { color: colors.textSecondary }]}>
                BLE Advertising: Active (Hop Limit TTL: 5)
              </Text>
            </View>
            <Badge label="NODE READY" variant="success" />
          </View>
        </Card>

        {/* Action testing row */}
        <View style={styles.testActionsRow}>
          <Button
            title="Simulate Peer Packet"
            variant="primary"
            size="sm"
            onPress={handleSimulateIncomingPacket}
            style={{ flex: 1, marginRight: 6 }}
          />
          <Button
            title="Test Loop Prevention"
            variant="outline"
            size="sm"
            onPress={handleTestLoopPrevention}
            style={{ flex: 1 }}
          />
        </View>

        {/* Nearby Mesh Peers */}
        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: typo.h3.fontSize }]}>
          Discovered Nearby Peer Nodes ({nodes.length})
        </Text>
        <View style={styles.nodesListContainer}>
          {nodes.map((node) => (
            <Card key={node.id} style={styles.peerCard}>
              <View style={styles.peerRow}>
                <Ionicons name="hardware-chip-outline" size={22} color={colors.primary} style={{ marginRight: 8 }} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.peerName, { color: colors.text }]}>{node.name}</Text>
                  <Text style={[styles.peerDetails, { color: colors.textSecondary }]}>
                    RSSI: {node.rssi} dBm • {node.hopsAway} hop away
                  </Text>
                </View>
                <Badge label="IN RANGE" variant="success" />
              </View>
            </Card>
          ))}
        </View>

        {/* Relayed Alert History FlatList */}
        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: typo.h3.fontSize, marginTop: 12 }]}>
          Relayed Emergency Packets Log ({relayedPackets.length})
        </Text>
        <FlatList
          data={relayedPackets}
          keyExtractor={(p) => p.packetId}
          renderItem={({ item }) => (
            <Card style={styles.packetCard}>
              <View style={styles.packetHeader}>
                <Text style={[styles.packetId, { color: colors.text }]}>{item.packetId}</Text>
                <Badge label={`TTL: ${item.ttl}`} variant="warning" />
              </View>
              <Text style={[styles.packetOrigin, { color: colors.textSecondary }]}>
                Origin: {item.originNodeId} • Relayed By: {item.senderNodeId}
              </Text>
              <Text numberOfLines={2} style={[styles.packetPayload, { color: colors.textMuted }]}>
                {item.payloadJson}
              </Text>
            </Card>
          )}
        />
      </View>
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
  telemetryCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  nodeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nodeIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeTitle: {
    fontWeight: '800',
  },
  nodeSub: {
    fontSize: 11,
    marginTop: 2,
  },
  testActionsRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  nodesListContainer: {
    marginBottom: spacing.xs,
  },
  peerCard: {
    marginVertical: 3,
    padding: spacing.sm + 2,
  },
  peerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  peerName: {
    fontWeight: '700',
    fontSize: 13,
  },
  peerDetails: {
    fontSize: 11,
    marginTop: 1,
  },
  packetCard: {
    marginVertical: 4,
    padding: spacing.md,
  },
  packetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  packetId: {
    fontWeight: '800',
    fontSize: 13,
  },
  packetOrigin: {
    fontSize: 11,
    marginTop: 2,
  },
  packetPayload: {
    fontSize: 10,
    fontFamily: 'monospace',
    marginTop: 4,
  },
});
