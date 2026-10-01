/**
 * OneHelp Emergency Communication Layer
 * Emergency Packet Data Model & State Definitions
 */

export const DELIVERY_STATES = {
  PENDING: 'PENDING',
  SENDING: 'SENDING',
  DELIVERED: 'DELIVERED',
  RELAYED: 'RELAYED',
  QUEUED: 'QUEUED',
  FAILED: 'FAILED'
};

export const EMERGENCY_TYPES = {
  SOS_PRESS: 'SOS_PRESS',
  SHAKE_GESTURE: 'SHAKE_GESTURE',
  VOICE_TRIGGER: 'VOICE_TRIGGER',
  DURESS_PIN: 'DURESS_PIN',
  MANUAL_ALERT: 'MANUAL_ALERT'
};

/**
 * Generate a unique deterministic/random message ID for duplicate protection
 */
export function generateMessageId(userId, timestamp) {
  const rand = Math.random().toString(36).substring(2, 9);
  const ts = timestamp || Date.now();
  return `msg_${userId ? userId.replace(/\s+/g, '_').toLowerCase() : 'anon'}_${ts}_${rand}`;
}

/**
 * Creates a standardized OneHelp Emergency SOS Packet
 */
export function createEmergencyPacket(options = {}) {
  const timestamp = new Date().toISOString();
  const userId = options.userIdentifier || 'Aman Choudhary';
  
  return {
    messageId: options.messageId || generateMessageId(userId, Date.now()),
    emergencyType: options.emergencyType || EMERGENCY_TYPES.SOS_PRESS,
    userIdentifier: userId,
    latitude: options.latitude ?? 26.9124,
    longitude: options.longitude ?? 75.7873,
    accuracy: options.accuracy || 10,
    timestamp: options.timestamp || timestamp,
    message: options.message || 'EMERGENCY DISTRESS: Immediate Assistance Required!',
    deliveryStatus: options.deliveryStatus || DELIVERY_STATES.PENDING,
    deliveryMethod: options.deliveryMethod || null, // 'HTTP' | 'SMS' | 'BLE_P2P' | 'LOCAL_QUEUE'
    contacts: options.contacts || [
      { name: 'Rajesh Sharma', phone: '+919876543210', role: 'Spouse/ICE' },
      { name: '112 ERSS Control', phone: '112', role: 'National Emergency' }
    ],
    hops: options.hops || 0,
    maxHops: options.maxHops || 5,
    relayHistory: options.relayHistory || ['node_origin_device'],
    metadata: {
      batteryLevel: options.batteryLevel || 85,
      medicalSummary: options.medicalSummary || 'Blood Group: O+ | Allergy: Penicillin'
    }
  };
}
