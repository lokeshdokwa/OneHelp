export type ThemeMode = 'dark' | 'light' | 'system';
export type AppLanguage = 'en' | 'hi';
export type ConnectivityStatus = 'ONLINE' | 'SMS_ONLY' | 'OFFLINE';

export interface TrustedContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
  createdAt: number;
}

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'Unknown';

export interface MedicalProfile {
  id: string;
  fullName: string;
  age: number | null;
  gender: string;
  bloodGroup: BloodGroup;
  allergies: string;
  conditions: string;
  medications: string;
  organDonor: boolean;
  emergencyNotes: string;
  updatedAt: number;
}

export interface AppSettings {
  themeMode: ThemeMode;
  language: AppLanguage;
  seniorMode: boolean;
  normalPin: string; // e.g. "1234"
  duressPin: string; // e.g. "9999"
  shakeToSosEnabled: boolean;
  shakeSensitivity: 'low' | 'medium' | 'high'; // low: 2.2g, med: 1.8g, high: 1.4g
  voiceSosEnabled: boolean;
  acousticDetectionEnabled: boolean; // gunshot / glass break
  voiceStressEnabled: boolean;
  bleRelayEnabled: boolean;
  autoRecordAudio: boolean;
  hapticFeedback: boolean;
  offlineTilesDownloaded: boolean;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  altitude?: number | null;
  heading?: number | null;
  speed?: number | null;
  timestamp: number;
  address?: string;
}

export type SOSChannel = 'INTERNET' | 'SMS' | 'BLE_MESH' | 'LOCAL_QUEUE';

export type SOSStepState = 'idle' | 'in_progress' | 'success' | 'failed' | 'skipped';

export interface SOSChannelStatus {
  channel: SOSChannel;
  state: SOSStepState;
  message?: string;
  timestamp?: number;
}

export interface SOSPayload {
  sosId: string;
  userId: string;
  timestamp: number;
  location: GeoLocation | null;
  medicalSummary?: {
    bloodGroup?: string;
    allergies?: string;
    conditions?: string;
  };
  triggerType: 'MANUAL_BUTTON' | 'SHAKE' | 'VOICE_KEYWORD' | 'GUNSHOT_ACOUSTIC' | 'VOICE_STRESS' | 'FALL';
  batteryLevel?: number;
  isSilent: boolean;
  duressActive?: boolean;
  messageText?: string;
  evidenceUri?: string;
  audioUri?: string;
}

export interface SOSSession {
  id: string;
  payload: SOSPayload;
  status: 'ACTIVE' | 'RESOLVED' | 'CANCELLED' | 'DURESS_CANCELLED';
  startedAt: number;
  resolvedAt?: number;
  channelResults: {
    internet: SOSStepState;
    sms: SOSStepState;
    ble: SOSStepState;
    localQueue: SOSStepState;
  };
  log: string[];
}

export interface OfflineQueueItem {
  id: string;
  type: 'SOS_DISPATCH' | 'HAZARD_REPORT' | 'CHAT_MESSAGE' | 'GREEN_CORRIDOR';
  payloadJson: string;
  attempts: number;
  createdAt: number;
  lastAttemptAt?: number;
  status: 'PENDING' | 'SENDING' | 'FAILED' | 'SENT';
}

export type HazardType = 'FLOOD' | 'FIRE' | 'ROAD_BLOCK' | 'LANDSLIDE' | 'GAS_LEAK' | 'BUILDING_COLLAPSE' | 'OTHER';

export interface HazardReport {
  id: string;
  type: HazardType;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  photoUri?: string;
  reportedAt: number;
  reportedBy?: string;
  synced: boolean;
}

export interface EmergencyHelpline {
  id: string;
  name: string;
  nameHi: string;
  number: string;
  category: 'ALL_IN_ONE' | 'POLICE' | 'FIRE' | 'AMBULANCE' | 'WOMEN' | 'CHILD' | 'CYBER' | 'DISASTER';
  description: string;
  descriptionHi: string;
}

export interface OfflineGuideStep {
  stepNumber: number;
  title: string;
  titleHi: string;
  instruction: string;
  instructionHi: string;
}

export interface OfflineGuide {
  id: string;
  category: 'FIRST_AID' | 'NATURAL_DISASTER' | 'ACCIDENT' | 'SURVIVAL';
  title: string;
  titleHi: string;
  shortDescription: string;
  shortDescriptionHi: string;
  urgency: 'HIGH' | 'CRITICAL' | 'MODERATE';
  icon: string;
  steps: OfflineGuideStep[];
  dos: string[];
  dosHi: string[];
  donts: string[];
  dontsHi: string[];
}

export interface ResponderStatus {
  responderId: string;
  name: string;
  callSign: string;
  role: 'PARAMEDIC' | 'POLICE_OFFICER' | 'FIRE_RESCUE' | 'DISASTER_UNIT';
  latitude: number;
  longitude: number;
  etaMinutes: number;
  status: 'DISPATCHED' | 'EN_ROUTE' | 'ON_SCENE';
  phone: string;
  updatedAt: number;
}

export interface AudioEvidenceRecord {
  id: string;
  sosId?: string;
  fileName: string;
  filePath: string;
  durationSeconds: number;
  recordedAt: number;
  fileSizeBytes: number;
  isEncrypted: boolean;
  notes?: string;
}

export interface MeshPacket {
  packetId: string;
  originNodeId: string;
  senderNodeId: string;
  ttl: number; // hop limit
  payloadType: 'SOS' | 'CHAT' | 'HAZARD' | 'GREEN_CORRIDOR';
  payloadJson: string;
  timestamp: number;
}

export interface MeshRelayNode {
  id: string;
  name: string;
  rssi: number;
  lastSeen: number;
  hopsAway: number;
}

export interface GreenCorridorRequest {
  id: string;
  ambulancePlate: string;
  patientCondition: 'CRITICAL_CARDIAC' | 'TRAUMA' | 'STROKE' | 'RESPIRATORY';
  originHospital: string;
  destinationHospital: string;
  currentLat: number;
  currentLng: number;
  destLat: number;
  destLng: number;
  etaMinutes: number;
  routeSummary: string;
  status: 'REQUESTED' | 'ACTIVE' | 'CLEARED' | 'COMPLETED';
}

export interface MissingChildProfile {
  id: string;
  name: string;
  age: number;
  gender: string;
  lastSeenLocation: string;
  lastSeenDate: string;
  photoUri: string;
  faceEmbedding?: number[]; // simulated or extracted vector
  contactPhone: string;
  reportedAt: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  recipientContactId?: string;
  messageText: string;
  timestamp: number;
  status: 'PENDING' | 'SENT_SMS' | 'SENT_BLE' | 'DELIVERED';
  isEmergencyAlert?: boolean;
}

export interface PermissionStatus {
  location: boolean;
  backgroundLocation: boolean;
  sms: boolean;
  microphone: boolean;
  camera: boolean;
  bluetooth: boolean;
  notifications: boolean;
}
