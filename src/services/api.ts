import {
  SOSPayload,
  TrustedContact,
  HazardReport,
  ResponderStatus,
  GreenCorridorRequest,
} from '../types';
import { MockBackendService } from './mockBackend';

// ================= BACKEND CONFIGURATION =================
// Set USE_MOCK_BACKEND to false and provide real BASE_URL when deploying production backend
export const USE_MOCK_BACKEND = true;
export const BASE_URL = 'https://api.onehelp.emergency.gov.in/v1';

const REQUEST_TIMEOUT_MS = 6000;

async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...options, credentials: 'omit', signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const ApiService = {
  /**
   * Dispatch primary emergency SOS payload to central disaster management backend.
   * // TODO(backend): POST /api/v1/sos/dispatch
   */
  async sendSOS(payload: SOSPayload): Promise<{ success: boolean; dispatchId: string; message: string; responderEtaMinutes: number }> {
    if (USE_MOCK_BACKEND) {
      return MockBackendService.sendSOS(payload);
    }

    try {
      const response = await fetchWithTimeout(`${BASE_URL}/sos/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`SOS dispatch HTTP ${response.status}: ${await response.text()}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('[ApiService] sendSOS network failed:', error);
      throw error;
    }
  },

  /**
   * Cancel an active SOS alert. If duress PIN was entered, isDuress is true.
   * // TODO(backend): POST /api/v1/sos/cancel
   */
  async cancelSOS(sosId: string, isDuress: boolean): Promise<{ success: boolean; message: string }> {
    if (USE_MOCK_BACKEND) {
      return MockBackendService.cancelSOS(sosId, isDuress);
    }

    try {
      const response = await fetchWithTimeout(`${BASE_URL}/sos/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sosId, isDuress }),
      });

      if (!response.ok) {
        throw new Error(`SOS cancel HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('[ApiService] cancelSOS failed:', error);
      throw error;
    }
  },

  /**
   * Sync trusted contacts list with cloud server for SMS/Call gateway routing.
   * // TODO(backend): POST /api/v1/contacts/sync
   */
  async syncContacts(contacts: TrustedContact[]): Promise<{ success: boolean; syncedCount: number }> {
    if (USE_MOCK_BACKEND) {
      return MockBackendService.syncContacts(contacts);
    }

    try {
      const response = await fetchWithTimeout(`${BASE_URL}/contacts/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contacts }),
      });

      if (!response.ok) {
        throw new Error(`Sync contacts HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('[ApiService] syncContacts failed:', error);
      throw error;
    }
  },

  /**
   * Fetch active disaster hazards within geographic radius.
   * // TODO(backend): GET /api/v1/hazards?lat={lat}&lng={lng}&radiusKm={radiusKm}
   */
  async fetchHazards(latitude: number, longitude: number, radiusKm: number = 25): Promise<HazardReport[]> {
    if (USE_MOCK_BACKEND) {
      return MockBackendService.fetchHazards(latitude, longitude, radiusKm);
    }

    try {
      const response = await fetchWithTimeout(
        `${BASE_URL}/hazards?lat=${latitude}&lng=${longitude}&radiusKm=${radiusKm}`,
        { method: 'GET' }
      );

      if (!response.ok) {
        throw new Error(`Fetch hazards HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('[ApiService] fetchHazards failed:', error);
      throw error;
    }
  },

  /**
   * Report crowdsourced hazard with geo-coordinates, description and evidence photo.
   * // TODO(backend): POST /api/v1/hazards/report
   */
  async reportHazard(hazard: HazardReport): Promise<{ success: boolean; id: string }> {
    if (USE_MOCK_BACKEND) {
      return MockBackendService.reportHazard(hazard);
    }

    try {
      const response = await fetchWithTimeout(`${BASE_URL}/hazards/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hazard),
      });

      if (!response.ok) {
        throw new Error(`Report hazard HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('[ApiService] reportHazard failed:', error);
      throw error;
    }
  },

  /**
   * Poll live status and coordinates of dispatched first responder.
   * // TODO(backend): GET /api/v1/sos/:sosId/responder
   */
  async fetchResponderStatus(sosId: string, currentLat?: number, currentLng?: number): Promise<ResponderStatus | null> {
    if (USE_MOCK_BACKEND) {
      return MockBackendService.fetchResponderStatus(sosId, currentLat, currentLng);
    }

    try {
      const query = currentLat && currentLng ? `?lat=${currentLat}&lng=${currentLng}` : '';
      const response = await fetchWithTimeout(`${BASE_URL}/sos/${sosId}/responder${query}`, { method: 'GET' });

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Responder status HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('[ApiService] fetchResponderStatus failed:', error);
      return null;
    }
  },

  /**
   * Request Green Corridor preemption for an emergency ambulance transit.
   * // TODO(backend): POST /api/v1/traffic/green-corridor
   */
  async sendGreenCorridor(request: GreenCorridorRequest): Promise<{ success: boolean; corridorId: string; signalsClearedCount: number; message: string }> {
    if (USE_MOCK_BACKEND) {
      return MockBackendService.sendGreenCorridor(request);
    }

    try {
      const response = await fetchWithTimeout(`${BASE_URL}/traffic/green-corridor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Green Corridor HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('[ApiService] sendGreenCorridor failed:', error);
      throw error;
    }
  },
};
