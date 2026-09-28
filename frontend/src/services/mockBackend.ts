import {
  SOSPayload,
  SOSSession,
  TrustedContact,
  HazardReport,
  ResponderStatus,
  GreenCorridorRequest,
} from '../types';

// Helper to simulate network latency
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class MockBackendService {
  private static responders: ResponderStatus[] = [
    {
      responderId: 'resp_108_delhi',
      name: 'Ambulance DL-1R-4421',
      callSign: 'LifeLine-1',
      role: 'PARAMEDIC',
      latitude: 28.6139,
      longitude: 77.2090,
      etaMinutes: 6,
      status: 'DISPATCHED',
      phone: '+919876543210',
      updatedAt: Date.now(),
    },
    {
      responderId: 'resp_police_pcr',
      name: 'PCR Van Eagle-4',
      callSign: 'Eagle-4',
      role: 'POLICE_OFFICER',
      latitude: 28.6145,
      longitude: 77.2110,
      etaMinutes: 4,
      status: 'EN_ROUTE',
      phone: '+911123456789',
      updatedAt: Date.now(),
    },
  ];

  private static hazards: HazardReport[] = [
    {
      id: 'haz_1',
      type: 'FLOOD',
      title: 'Waterlogging under Railway Underpass',
      description: 'Severe water accumulation > 3 feet, impassable for light vehicles.',
      latitude: 28.6120,
      longitude: 77.2150,
      radiusMeters: 250,
      severity: 'HIGH',
      reportedAt: Date.now() - 3600000,
      synced: true,
    },
    {
      id: 'haz_2',
      type: 'FIRE',
      title: 'Electrical Transformer Spark Fire',
      description: 'Short circuit fire near market lane. Fire brigade dispatched.',
      latitude: 28.6180,
      longitude: 77.2050,
      radiusMeters: 150,
      severity: 'CRITICAL',
      reportedAt: Date.now() - 1800000,
      synced: true,
    },
    {
      id: 'haz_3',
      type: 'ROAD_BLOCK',
      title: 'Fallen Tree Blocking 2 Lanes',
      description: 'Storm damage, traffic diversion active.',
      latitude: 28.6080,
      longitude: 77.2020,
      radiusMeters: 100,
      severity: 'MEDIUM',
      reportedAt: Date.now() - 7200000,
      synced: true,
    },
  ];

  static async sendSOS(payload: SOSPayload): Promise<{ success: boolean; dispatchId: string; message: string; responderEtaMinutes: number }> {
    await delay(700);
    return {
      success: true,
      dispatchId: `disp_${Date.now()}`,
      message: 'SOS successfully registered at State Disaster Emergency Center (NDRF / 112)',
      responderEtaMinutes: 5,
    };
  }

  static async cancelSOS(sosId: string, isDuress: boolean): Promise<{ success: boolean; message: string }> {
    await delay(400);
    if (isDuress) {
      // Duress: silently log silent panic alarm on backend while returning standard success to caller
      return {
        success: true,
        message: 'Alert acknowledged. Dispatch state updated.',
      };
    }
    return {
      success: true,
      message: 'SOS successfully cancelled by authenticated user.',
    };
  }

  static async syncContacts(contacts: TrustedContact[]): Promise<{ success: boolean; syncedCount: number }> {
    await delay(300);
    return {
      success: true,
      syncedCount: contacts.length,
    };
  }

  static async fetchHazards(latitude: number, longitude: number, radiusKm: number): Promise<HazardReport[]> {
    await delay(500);
    return [...this.hazards];
  }

  static async reportHazard(hazard: HazardReport): Promise<{ success: boolean; id: string }> {
    await delay(600);
    const newHazard = { ...hazard, synced: true };
    this.hazards.unshift(newHazard);
    return {
      success: true,
      id: newHazard.id,
    };
  }

  static async fetchResponderStatus(sosId: string, currentLat?: number, currentLng?: number): Promise<ResponderStatus | null> {
    await delay(400);
    const responder = this.responders[0];
    if (!responder) return null;

    // Simulate responder approaching user if user location given
    if (currentLat && currentLng) {
      const stepFactor = 0.05;
      const newLat = responder.latitude + (currentLat - responder.latitude) * stepFactor;
      const newLng = responder.longitude + (currentLng - responder.longitude) * stepFactor;
      const newEta = Math.max(1, responder.etaMinutes - 0.2);

      const updated: ResponderStatus = {
        ...responder,
        latitude: newLat,
        longitude: newLng,
        etaMinutes: Math.round(newEta * 10) / 10,
        status: newEta < 2 ? 'ON_SCENE' : 'EN_ROUTE',
        updatedAt: Date.now(),
      };
      this.responders[0] = updated;
      return updated;
    }

    return responder;
  }

  static async sendGreenCorridor(request: GreenCorridorRequest): Promise<{ success: boolean; corridorId: string; signalsClearedCount: number; message: string }> {
    await delay(800);
    return {
      success: true,
      corridorId: `corridor_${Date.now()}`,
      signalsClearedCount: 8,
      message: 'Green Corridor broadcast received by Traffic Police Command Center. 8 automated signals preempted.',
    };
  }
}
