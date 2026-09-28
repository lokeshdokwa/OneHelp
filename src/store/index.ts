import { create } from 'zustand';
import {
  AppSettings,
  ConnectivityStatus,
  GeoLocation,
  MedicalProfile,
  SOSSession,
  TrustedContact,
} from '../types';
import * as db from '../db';

export const DEFAULT_SETTINGS: AppSettings = {
  themeMode: 'dark',
  language: 'en',
  seniorMode: false,
  normalPin: '1234',
  duressPin: '9999',
  shakeToSosEnabled: true,
  shakeSensitivity: 'medium',
  voiceSosEnabled: false,
  acousticDetectionEnabled: false,
  voiceStressEnabled: false,
  bleRelayEnabled: true,
  autoRecordAudio: true,
  hapticFeedback: true,
  offlineTilesDownloaded: false,
};

interface AppState {
  // State variables
  isInitialized: boolean;
  settings: AppSettings;
  contacts: TrustedContact[];
  medicalProfile: MedicalProfile | null;
  connectivity: ConnectivityStatus;
  currentLocation: GeoLocation | null;
  lastKnownLocation: GeoLocation | null;
  activeSosSession: SOSSession | null;
  fakeSosCancelled: boolean; // Duress deception state
  meshPeerCount: number;

  // Actions
  initializeApp: () => Promise<void>;
  updateSettings: (partial: Partial<AppSettings>) => Promise<void>;
  setConnectivity: (status: ConnectivityStatus) => void;
  setLocation: (loc: GeoLocation | null) => void;
  setMeshPeerCount: (count: number) => void;

  // Contacts
  loadContacts: () => Promise<void>;
  addContact: (contact: TrustedContact) => Promise<void>;
  updateContact: (contact: TrustedContact) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;

  // Medical Profile
  loadMedicalProfile: () => Promise<void>;
  saveMedicalProfile: (profile: MedicalProfile) => Promise<void>;

  // SOS state
  setActiveSosSession: (session: SOSSession | null) => void;
  setFakeSosCancelled: (value: boolean) => void;
  updateSosSessionChannel: (channel: 'internet' | 'sms' | 'ble' | 'localQueue', state: SOSSession['channelResults']['internet'], logMessage?: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  isInitialized: false,
  settings: DEFAULT_SETTINGS,
  contacts: [],
  medicalProfile: null,
  connectivity: 'ONLINE',
  currentLocation: null,
  lastKnownLocation: null,
  activeSosSession: null,
  fakeSosCancelled: false,
  meshPeerCount: 0,

  initializeApp: async () => {
    try {
      await db.getDatabase();

      // Load settings
      const savedSettings = await db.getSetting<AppSettings>('app_settings', DEFAULT_SETTINGS);
      const mergedSettings = { ...DEFAULT_SETTINGS, ...savedSettings };

      // Load contacts & medical
      const contacts = await db.getContacts();
      const medicalProfile = await db.getMedicalProfile();

      set({
        isInitialized: true,
        settings: mergedSettings,
        contacts,
        medicalProfile,
      });
    } catch (err) {
      console.error('[Store] Failed to initialize from SQLite:', err);
      set({ isInitialized: true });
    }
  },

  updateSettings: async (partial: Partial<AppSettings>) => {
    const updated = { ...get().settings, ...partial };
    set({ settings: updated });
    await db.setSetting('app_settings', updated);
  },

  setConnectivity: (status: ConnectivityStatus) => {
    set({ connectivity: status });
  },

  setLocation: (loc: GeoLocation | null) => {
    if (loc) {
      set({ currentLocation: loc, lastKnownLocation: loc });
    } else {
      set({ currentLocation: null });
    }
  },

  setMeshPeerCount: (count: number) => {
    set({ meshPeerCount: count });
  },

  loadContacts: async () => {
    const contacts = await db.getContacts();
    set({ contacts });
  },

  addContact: async (contact: TrustedContact) => {
    await db.insertContact(contact);
    await get().loadContacts();
  },

  updateContact: async (contact: TrustedContact) => {
    await db.updateContact(contact);
    await get().loadContacts();
  },

  deleteContact: async (id: string) => {
    await db.deleteContact(id);
    await get().loadContacts();
  },

  loadMedicalProfile: async () => {
    const profile = await db.getMedicalProfile();
    set({ medicalProfile: profile });
  },

  saveMedicalProfile: async (profile: MedicalProfile) => {
    await db.saveMedicalProfile(profile);
    set({ medicalProfile: profile });
  },

  setActiveSosSession: (session: SOSSession | null) => {
    set({ activeSosSession: session });
  },

  setFakeSosCancelled: (value: boolean) => {
    set({ fakeSosCancelled: value });
  },

  updateSosSessionChannel: (channel, state, logMessage) => {
    const current = get().activeSosSession;
    if (!current) return;

    const newChannelResults = {
      ...current.channelResults,
      [channel]: state,
    };

    const newLog = logMessage ? [...current.log, `[${new Date().toLocaleTimeString()}] ${logMessage}`] : current.log;

    const updatedSession: SOSSession = {
      ...current,
      channelResults: newChannelResults,
      log: newLog,
    };

    set({ activeSosSession: updatedSession });
    // Persist to db
    db.insertSOSSession(updatedSession).catch((e) => console.warn('[Store] Failed to persist SOS log', e));
  },
}));
