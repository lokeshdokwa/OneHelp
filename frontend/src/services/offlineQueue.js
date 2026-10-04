/**
 * OneHelp Emergency Communication Layer
 * Transport 4: Local Storage Offline Queue & Retry Manager
 * 
 * Provides persistence using localStorage / IndexedDB (SQLite contract compatible).
 */

import { DELIVERY_STATES } from './emergencyPacket.js';

const QUEUE_STORAGE_KEY = 'onehelp_offline_emergency_queue';

class OfflineQueue {
  constructor() {
    this.memoryQueue = this.loadFromStorage();
  }

  loadFromStorage() {
    if (typeof window === 'undefined' || !window.localStorage) {
      return [];
    }
    try {
      const data = localStorage.getItem(QUEUE_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load emergency queue from storage:', e);
      return [];
    }
  }

  saveToStorage() {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.memoryQueue));
    } catch (e) {
      console.error('Failed to save emergency queue to storage:', e);
    }
  }

  enqueue(packet) {
    const existingIndex = this.memoryQueue.findIndex(p => p.messageId === packet.messageId);
    
    const queuedPacket = {
      ...packet,
      deliveryStatus: DELIVERY_STATES.QUEUED,
      deliveryMethod: 'LOCAL_QUEUE',
      queuedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      this.memoryQueue[existingIndex] = queuedPacket;
    } else {
      this.memoryQueue.push(queuedPacket);
    }

    this.saveToStorage();

    return {
      success: true,
      transport: 'LOCAL_QUEUE',
      status: DELIVERY_STATES.QUEUED,
      packetId: packet.messageId,
      detail: `Packet queued locally in persistent storage. Total queued: ${this.memoryQueue.length}`
    };
  }

  getPendingPackets() {
    return [...this.memoryQueue];
  }

  remove(packetId) {
    this.memoryQueue = this.memoryQueue.filter(p => p.messageId !== packetId);
    this.saveToStorage();
  }

  clear() {
    this.memoryQueue = [];
    this.saveToStorage();
  }
}

export const offlineQueue = new OfflineQueue();
export default offlineQueue;
