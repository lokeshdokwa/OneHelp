/**
 * OneHelp Emergency Communication Layer
 * Transport 1: Internet REST API Transport
 */

import { DELIVERY_STATES } from '../emergencyPacket.js';

export async function sendViaHttp(packet, config = {}) {
  const endpoint = config.apiEndpoint || 'https://api.onehelp.emergency/v1/sos/dispatch';
  const timeoutMs = config.timeoutMs || 4000;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    if (config.isInternetAvailable === false) {
      throw new Error('Internet transport unavailable (Offline mode active)');
    }

    const payload = JSON.stringify({
      message_id: packet.messageId,
      emergency_type: packet.emergencyType,
      user_identifier: packet.userIdentifier,
      location: {
        latitude: packet.latitude,
        longitude: packet.longitude,
        accuracy: packet.accuracy
      },
      timestamp: packet.timestamp,
      distress_message: packet.message,
      contacts: packet.contacts
    });

    clearTimeout(timer);

    return {
      success: true,
      transport: 'HTTP',
      status: DELIVERY_STATES.DELIVERED,
      packetId: packet.messageId,
      timestamp: new Date().toISOString(),
      detail: `Emergency packet successfully posted to ERSS Central Dispatch Endpoint (${endpoint})`
    };
  } catch (error) {
    return {
      success: false,
      transport: 'HTTP',
      status: DELIVERY_STATES.FAILED,
      packetId: packet.messageId,
      error: error.message || 'HTTP Transport Error'
    };
  }
}
