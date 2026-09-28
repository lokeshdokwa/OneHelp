import {
  SOSPayload,
  SOSSession,
  SOSStepState,
  TrustedContact,
  GeoLocation,
} from '../types';
import { ApiService } from './api';
import { sendEmergencySms } from './sms';
import { BleMesh } from './bleRelay';
import { getCurrentOrLastKnownLocation } from './location';
import * as db from '../db';
import { useAppStore } from '../store';

export class SosEngine {
  private static isEmergencyActive: boolean = false;

  public static isSosRunning(): boolean {
    return this.isEmergencyActive;
  }

  /**
   * Execute the full emergency SOS cascade:
   * 1. Acquire GPS/cached coordinates
   * 2. Internet HTTP -> 3. SMS to Contacts -> 4. BLE Mesh Relay -> 5. SQLite Offline Queue
   */
  public static async triggerSOS(
    triggerType: SOSPayload['triggerType'] = 'MANUAL_BUTTON',
    customNote?: string,
    isSilent: boolean = false
  ): Promise<SOSSession> {
    this.isEmergencyActive = true;
    const store = useAppStore.getState();

    // 1. Fetch location
    const location: GeoLocation | null = await getCurrentOrLastKnownLocation();
    if (location) {
      store.setLocation(location);
    }

    const sosId = `sos_${Date.now()}`;
    const payload: SOSPayload = {
      sosId,
      userId: 'onehelp_local_user',
      timestamp: Date.now(),
      location: location || store.lastKnownLocation,
      medicalSummary: store.medicalProfile
        ? {
            bloodGroup: store.medicalProfile.bloodGroup,
            allergies: store.medicalProfile.allergies,
            conditions: store.medicalProfile.conditions,
          }
        : undefined,
      triggerType,
      isSilent,
      duressActive: false,
      messageText: customNote,
    };

    const session: SOSSession = {
      id: sosId,
      payload,
      status: 'ACTIVE',
      startedAt: Date.now(),
      channelResults: {
        internet: 'in_progress',
        sms: 'idle',
        ble: 'idle',
        localQueue: 'in_progress',
      },
      log: [`[${new Date().toLocaleTimeString()}] SOS initiated via ${triggerType}`],
    };

    store.setActiveSosSession(session);
    store.setFakeSosCancelled(false);

    // Save initial session to SQLite
    await db.insertSOSSession(session);

    // Automatically enqueue to offline retry queue to guarantee delivery
    try {
      await db.enqueueOfflineItem({
        id: `queue_${sosId}`,
        type: 'SOS_DISPATCH',
        payloadJson: JSON.stringify(payload),
        createdAt: Date.now(),
      });
      store.updateSosSessionChannel('localQueue', 'success', 'Stored in persistent offline retry vault');
    } catch (qErr) {
      console.warn('[SosEngine] Failed to save to local queue:', qErr);
      store.updateSosSessionChannel('localQueue', 'failed', 'Local storage error');
    }

    // Step 1: Internet HTTP Cascade
    try {
      store.updateSosSessionChannel('internet', 'in_progress', 'Contacting State Emergency Cloud (NDRF/112)...');
      const apiResult = await ApiService.sendSOS(payload);
      if (apiResult.success) {
        store.updateSosSessionChannel('internet', 'success', `Cloud dispatch confirmed: ${apiResult.message}`);
      } else {
        throw new Error('API dispatch failed');
      }
    } catch (err: any) {
      console.warn('[SosEngine] Internet dispatch failed, triggering offline fallback chain:', err.message);
      store.updateSosSessionChannel('internet', 'failed', 'Cloud unavailable. Cascading to SMS broadcast...');
    }

    // Step 2: SMS Cascade to all trusted contacts
    const contacts: TrustedContact[] = store.contacts;
    if (contacts.length > 0) {
      store.updateSosSessionChannel('sms', 'in_progress', `Preparing SMS to ${contacts.length} trusted contacts...`);
      const smsResult = await sendEmergencySms(contacts, payload.location || null, customNote);
      if (smsResult.success) {
        store.updateSosSessionChannel('sms', 'success', smsResult.message);
      } else {
        store.updateSosSessionChannel('sms', 'failed', smsResult.message);
      }
    } else {
      store.updateSosSessionChannel('sms', 'skipped', 'No trusted contacts added; skipped SMS');
    }

    // Step 3: BLE Mesh Relay Broadcast
    if (store.settings.bleRelayEnabled) {
      store.updateSosSessionChannel('ble', 'in_progress', 'Broadcasting packet over Bluetooth Mesh P2P...');
      try {
        const bleResult = await BleMesh.broadcastSosPacket(payload);
        store.updateSosSessionChannel('ble', 'success', `Relayed to ${bleResult.relayedToCount} nearby emergency nodes`);
      } catch (bleErr) {
        store.updateSosSessionChannel('ble', 'failed', 'Bluetooth relay failed');
      }
    } else {
      store.updateSosSessionChannel('ble', 'skipped', 'BLE Relay disabled in settings');
    }

    return useAppStore.getState().activeSosSession || session;
  }

  /**
   * Cancel SOS. Handles both normal cancellation and silent duress cancellation.
   */
  public static async cancelSOS(sosId: string, isDuress: boolean): Promise<void> {
    const store = useAppStore.getState();

    if (isDuress) {
      // DURESS MODE: Fake cancel to deceive aggressor
      // App shows "Cancelled" screen, but SOS continues silently in background!
      console.warn('[SosEngine] DURESS PIN entered! Triggering silent emergency alarm mode.');
      store.setFakeSosCancelled(true);

      // Silently alert backend of duress status
      try {
        await ApiService.cancelSOS(sosId, true);
      } catch (err) {
        console.warn('[SosEngine] Duress report error:', err);
      }

      // Log internally without showing on fake cancellation screen
      if (store.activeSosSession) {
        const duressSession: SOSSession = {
          ...store.activeSosSession,
          status: 'DURESS_CANCELLED',
          log: [...store.activeSosSession.log, `[${new Date().toLocaleTimeString()}] DURESS PIN ENTERED - SILENT MONITORING ACTIVE`],
        };
        await db.insertSOSSession(duressSession);
      }
      return;
    }

    // NORMAL CANCELLATION
    this.isEmergencyActive = false;
    store.setFakeSosCancelled(false);

    try {
      await ApiService.cancelSOS(sosId, false);
    } catch (err) {
      console.warn('[SosEngine] Cancel error:', err);
    }

    if (store.activeSosSession) {
      const resolvedSession: SOSSession = {
        ...store.activeSosSession,
        status: 'CANCELLED',
        resolvedAt: Date.now(),
        log: [...store.activeSosSession.log, `[${new Date().toLocaleTimeString()}] SOS cancelled with verified PIN`],
      };
      store.setActiveSosSession(null);
      await db.insertSOSSession(resolvedSession);
    }
  }
}
