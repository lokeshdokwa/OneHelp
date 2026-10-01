/**
 * OneHelp Emergency Communication Layer
 * Central Controller: Communication Manager
 * 
 * Manages the automatic fallback decision hierarchy:
 * Internet -> SMS/Cellular -> Bluetooth/P2P -> Local-only/Offline Queue
 */

import { createEmergencyPacket, DELIVERY_STATES } from './emergencyPacket.js';
import { connectivityDetector } from './connectivityDetector.js';
import { sendViaHttp } from './transports/httpTransport.js';
import { sendViaSms } from './transports/smsTransport.js';
import { sendViaBluetoothP2P } from './transports/bleTransport.js';
import { offlineQueue } from './offlineQueue.js';

class CommunicationManager {
  constructor() {
    this.deliveryLogs = [];
    this.subscribers = new Set();
    this.isProcessingQueue = false;
    this.queuePromise = null;

    connectivityDetector.subscribe((caps) => {
      if (caps.internet || caps.bluetooth) {
        this.processPendingQueue();
      }
    });
  }

  async dispatchEmergencySOS(options = {}) {
    const packet = createEmergencyPacket(options);
    const caps = connectivityDetector.getCapabilities();

    this.log(`Initiating emergency dispatch for packet [${packet.messageId}] via best available transport...`);

    // STEP 1: Internet REST API Transport
    if (caps.internet) {
      this.log(`[Attempt 1/4] Trying Internet HTTP transport...`);
      const httpResult = await sendViaHttp(packet, { isInternetAvailable: caps.internet });
      if (httpResult.success) {
        packet.deliveryStatus = DELIVERY_STATES.DELIVERED;
        packet.deliveryMethod = 'HTTP';
        this.log(`SUCCESS: Dispatched via Internet REST API!`, httpResult);
        this.notifySubscribers(packet, httpResult);
        return httpResult;
      }
      this.log(`Internet HTTP transport failed/unavailable. Falling back to SMS...`);
    } else {
      this.log(`Internet unavailable. Bypassing HTTP transport.`);
    }

    // STEP 2: SMS Cellular Fallback Transport
    if (caps.sms) {
      this.log(`[Attempt 2/4] Trying SMS Cellular fallback...`);
      const smsResult = await sendViaSms(packet, { isSmsAvailable: caps.sms });
      if (smsResult.success) {
        packet.deliveryStatus = DELIVERY_STATES.DELIVERED;
        packet.deliveryMethod = 'SMS';
        this.log(`SUCCESS: Dispatched via SMS Cellular network!`, smsResult);
        this.notifySubscribers(packet, smsResult);
        return smsResult;
      }
      this.log(`SMS fallback failed/unavailable. Falling back to Bluetooth P2P...`);
    } else {
      this.log(`SMS cellular network unavailable. Bypassing SMS transport.`);
    }

    // STEP 3: Bluetooth / P2P Mesh Relay Transport
    if (caps.bluetooth || caps.peersAvailable) {
      this.log(`[Attempt 3/4] Trying Bluetooth P2P Mesh relay...`);
      const bleResult = await sendViaBluetoothP2P(packet, {
        isBluetoothAvailable: caps.bluetooth,
        peersAvailable: caps.peersAvailable
      });
      if (bleResult.success) {
        packet.deliveryStatus = DELIVERY_STATES.RELAYED;
        packet.deliveryMethod = 'BLE_P2P';
        this.log(`SUCCESS: Relayed packet to nearby peer over Bluetooth P2P!`, bleResult);
        this.notifySubscribers(packet, bleResult);
        return bleResult;
      }
      this.log(`Bluetooth P2P Relay failed/unavailable: ${bleResult.error}. Falling back to Local Queue...`);
    } else {
      this.log(`Bluetooth / P2P unavailable. Bypassing BLE transport.`);
    }

    // STEP 4: Local Storage Offline Queue (All transports failed)
    this.log(`[Attempt 4/4] All active transports unavailable. Saving emergency packet to Local Offline Queue...`);
    const queueResult = offlineQueue.enqueue(packet);
    this.log(`SUCCESS: Emergency packet saved to Local Queue for auto-retry when connection returns.`, queueResult);
    this.notifySubscribers(packet, queueResult);
    return queueResult;
  }

  async processPendingQueue() {
    if (this.isProcessingQueue) {
      return this.queuePromise;
    }

    const pendingPackets = offlineQueue.getPendingPackets();
    if (pendingPackets.length === 0) return;

    this.isProcessingQueue = true;
    this.queuePromise = (async () => {
      this.log(`Connectivity restored! Draining ${pendingPackets.length} pending queued emergency packet(s)...`);

      for (const packet of pendingPackets) {
        const result = await this.dispatchEmergencySOS({
          ...packet,
          messageId: packet.messageId
        });

        if (result.status === DELIVERY_STATES.DELIVERED || result.status === DELIVERY_STATES.RELAYED) {
          offlineQueue.remove(packet.messageId);
          this.log(`Successfully delivered queued packet [${packet.messageId}] and removed from local queue.`);
        }
      }

      this.isProcessingQueue = false;
      this.queuePromise = null;
    })();

    return this.queuePromise;
  }

  log(msg, data = null) {
    const entry = { timestamp: new Date().toLocaleTimeString(), message: msg, data };
    this.deliveryLogs.unshift(entry);
    if (this.deliveryLogs.length > 50) this.deliveryLogs.pop();
  }

  getLogs() {
    return [...this.deliveryLogs];
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notifySubscribers(packet, result) {
    this.subscribers.forEach(fn => fn(packet, result));
  }
}

export const communicationManager = new CommunicationManager();
export default communicationManager;
