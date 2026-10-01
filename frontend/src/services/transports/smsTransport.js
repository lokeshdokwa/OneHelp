/**
 * OneHelp Emergency Communication Layer
 * Transport 2: SMS / Cellular Fallback Transport
 * 
 * Android Permissions required in AndroidManifest.xml for React Native:
 * <uses-permission android:name="android.permission.SEND_SMS" />
 * <uses-permission android:name="android.permission.READ_PHONE_STATE" />
 */

import { DELIVERY_STATES } from '../emergencyPacket.js';

export async function sendViaSms(packet, options = {}) {
  try {
    if (options.isSmsAvailable === false) {
      throw new Error('SMS Cellular channel unavailable');
    }

    const recipientNumbers = packet.contacts.map(c => c.phone).join(',');
    const mapsLink = `https://maps.google.com/?q=${packet.latitude},${packet.longitude}`;
    const smsMessage = `[OneHelp SOS] ${packet.userIdentifier} needs EMERGENCY help! Type: ${packet.emergencyType}. Location: ${mapsLink} (Time: ${new Date(packet.timestamp).toLocaleTimeString()})`;

    const encodedBody = encodeURIComponent(smsMessage);
    const smsUri = `sms:${recipientNumbers}?body=${encodedBody}`;

    return {
      success: true,
      transport: 'SMS',
      status: DELIVERY_STATES.DELIVERED,
      packetId: packet.messageId,
      recipients: packet.contacts.map(c => `${c.name} (${c.phone})`),
      smsBody: smsMessage,
      smsUri: smsUri,
      detail: `Distress SMS queued & broadcasted to ${packet.contacts.length} trusted contacts via cellular network.`
    };
  } catch (error) {
    return {
      success: false,
      transport: 'SMS',
      status: DELIVERY_STATES.FAILED,
      packetId: packet.messageId,
      error: error.message || 'SMS Transport Error'
    };
  }
}
