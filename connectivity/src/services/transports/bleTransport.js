/**
 * OneHelp Emergency Communication Layer
 * Transport 3: Bluetooth / P2P Mesh Relay Transport
 * 
 * Includes Duplicate Message Protection (Message Deduplication Filter)
 */

import { DELIVERY_STATES } from '../emergencyPacket.js';

const seenMessageIds = new Set();

export async function sendViaBluetoothP2P(packet, options = {}) {
  try {
    if (options.isBluetoothAvailable === false && options.peersAvailable === false) {
      throw new Error('Bluetooth / P2P network unavailable or no nearby peers detected');
    }

    if (seenMessageIds.has(packet.messageId)) {
      return {
        success: false,
        transport: 'BLE_P2P',
        status: DELIVERY_STATES.FAILED,
        isDuplicate: true,
        packetId: packet.messageId,
        error: `Duplicate packet rejected: Message ID [${packet.messageId}] already processed by this node.`
      };
    }

    const currentHops = packet.hops || 0;
    const maxHops = packet.maxHops || 5;

    if (currentHops >= maxHops) {
      return {
        success: false,
        transport: 'BLE_P2P',
        status: DELIVERY_STATES.FAILED,
        packetId: packet.messageId,
        error: `Max mesh hop limit (${maxHops}) reached for packet [${packet.messageId}]. Relay terminated.`
      };
    }

    seenMessageIds.add(packet.messageId);

    const relayedPacket = {
      ...packet,
      hops: currentHops + 1,
      relayHistory: [...(packet.relayHistory || []), `node_peer_${Math.floor(100 + Math.random() * 900)}`],
      deliveryStatus: DELIVERY_STATES.RELAYED
    };

    const targetPeerNode = options.peerNodeId || 'Node_04_NDRF_Peer';

    return {
      success: true,
      transport: 'BLE_P2P',
      status: DELIVERY_STATES.RELAYED,
      packetId: packet.messageId,
      relayedPacket: relayedPacket,
      targetPeer: targetPeerNode,
      hopsCompleted: relayedPacket.hops,
      detail: `Emergency packet relayed to peer [${targetPeerNode}] over Bluetooth P2P (Hop ${relayedPacket.hops}/${maxHops}).`
    };
  } catch (error) {
    return {
      success: false,
      transport: 'BLE_P2P',
      status: DELIVERY_STATES.FAILED,
      packetId: packet.messageId,
      error: error.message || 'Bluetooth P2P Relay Error'
    };
  }
}

export function clearSeenMessageIdsCache() {
  seenMessageIds.clear();
}
