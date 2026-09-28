import * as SQLite from 'expo-sqlite';
import {
  TrustedContact,
  MedicalProfile,
  AppSettings,
  OfflineQueueItem,
  HazardReport,
  AudioEvidenceRecord,
  SOSSession,
  ChatMessage,
} from '../types';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync('onehelp_emergency.db');
    await initDatabase(dbInstance);
  }
  return dbInstance;
}

export async function initDatabase(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS trusted_contacts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      relationship TEXT,
      is_primary INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS medical_profile (
      id TEXT PRIMARY KEY,
      full_name TEXT,
      age INTEGER,
      gender TEXT,
      blood_group TEXT,
      allergies TEXT,
      conditions TEXT,
      medications TEXT,
      organ_donor INTEGER DEFAULT 0,
      emergency_notes TEXT,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sos_logs (
      id TEXT PRIMARY KEY,
      trigger_type TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      latitude REAL,
      longitude REAL,
      status TEXT NOT NULL,
      is_silent INTEGER DEFAULT 0,
      channel_results TEXT NOT NULL,
      log_entries TEXT NOT NULL,
      resolved_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS offline_queue (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      attempts INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      last_attempt_at INTEGER,
      status TEXT DEFAULT 'PENDING'
    );

    CREATE TABLE IF NOT EXISTS hazard_reports (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      radius_meters REAL NOT NULL,
      severity TEXT NOT NULL,
      photo_uri TEXT,
      reported_at INTEGER NOT NULL,
      synced INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS evidence_files (
      id TEXT PRIMARY KEY,
      sos_id TEXT,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      duration_seconds INTEGER DEFAULT 0,
      recorded_at INTEGER NOT NULL,
      file_size_bytes INTEGER DEFAULT 0,
      is_encrypted INTEGER DEFAULT 1,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      sender_id TEXT NOT NULL,
      sender_name TEXT NOT NULL,
      recipient_contact_id TEXT,
      message_text TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      status TEXT NOT NULL,
      is_emergency_alert INTEGER DEFAULT 0
    );
  `);
}

// ================= CONTACTS CRUD =================
export async function getContacts(): Promise<TrustedContact[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    id: string;
    name: string;
    phone: string;
    relationship: string;
    is_primary: number;
    created_at: number;
  }>('SELECT * FROM trusted_contacts ORDER BY is_primary DESC, name ASC;');

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    phone: r.phone,
    relationship: r.relationship,
    isPrimary: r.is_primary === 1,
    createdAt: r.created_at,
  }));
}

export async function insertContact(contact: TrustedContact): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT OR REPLACE INTO trusted_contacts (id, name, phone, relationship, is_primary, created_at) VALUES (?, ?, ?, ?, ?, ?);',
    [contact.id, contact.name, contact.phone, contact.relationship, contact.isPrimary ? 1 : 0, contact.createdAt]
  );
}

export async function updateContact(contact: TrustedContact): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE trusted_contacts SET name = ?, phone = ?, relationship = ?, is_primary = ? WHERE id = ?;',
    [contact.name, contact.phone, contact.relationship, contact.isPrimary ? 1 : 0, contact.id]
  );
}

export async function deleteContact(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM trusted_contacts WHERE id = ?;', [id]);
}

// ================= MEDICAL PROFILE CRUD =================
export async function getMedicalProfile(): Promise<MedicalProfile | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{
    id: string;
    full_name: string;
    age: number | null;
    gender: string;
    blood_group: string;
    allergies: string;
    conditions: string;
    medications: string;
    organ_donor: number;
    emergency_notes: string;
    updated_at: number;
  }>('SELECT * FROM medical_profile LIMIT 1;');

  if (!row) return null;

  return {
    id: row.id,
    fullName: row.full_name || '',
    age: row.age,
    gender: row.gender || '',
    bloodGroup: (row.blood_group as MedicalProfile['bloodGroup']) || 'Unknown',
    allergies: row.allergies || '',
    conditions: row.conditions || '',
    medications: row.medications || '',
    organDonor: row.organ_donor === 1,
    emergencyNotes: row.emergency_notes || '',
    updatedAt: row.updated_at,
  };
}

export async function saveMedicalProfile(profile: MedicalProfile): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO medical_profile 
      (id, full_name, age, gender, blood_group, allergies, conditions, medications, organ_donor, emergency_notes, updated_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      profile.id,
      profile.fullName,
      profile.age,
      profile.gender,
      profile.bloodGroup,
      profile.allergies,
      profile.conditions,
      profile.medications,
      profile.organDonor ? 1 : 0,
      profile.emergencyNotes,
      profile.updatedAt,
    ]
  );
}

// ================= SETTINGS STORAGE =================
export async function getSetting<T>(key: string, defaultValue: T): Promise<T> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM app_settings WHERE key = ?;', [key]);
  if (!row) return defaultValue;
  try {
    return JSON.parse(row.value) as T;
  } catch {
    return defaultValue;
  }
}

export async function setSetting<T>(key: string, value: T): Promise<void> {
  const db = await getDatabase();
  const serialized = JSON.stringify(value);
  await db.runAsync('INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?);', [key, serialized]);
}

// ================= SOS LOGGING =================
export async function insertSOSSession(session: SOSSession): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO sos_logs 
      (id, trigger_type, timestamp, latitude, longitude, status, is_silent, channel_results, log_entries, resolved_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      session.id,
      session.payload.triggerType,
      session.startedAt,
      session.payload.location?.latitude ?? null,
      session.payload.location?.longitude ?? null,
      session.status,
      session.payload.isSilent ? 1 : 0,
      JSON.stringify(session.channelResults),
      JSON.stringify(session.log),
      session.resolvedAt ?? null,
    ]
  );
}

export async function getSOSLogs(): Promise<SOSSession[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    id: string;
    trigger_type: string;
    timestamp: number;
    latitude: number | null;
    longitude: number | null;
    status: string;
    is_silent: number;
    channel_results: string;
    log_entries: string;
    resolved_at: number | null;
  }>('SELECT * FROM sos_logs ORDER BY timestamp DESC LIMIT 50;');

  return rows.map((r) => ({
    id: r.id,
    payload: {
      sosId: r.id,
      userId: 'user_local',
      timestamp: r.timestamp,
      location: r.latitude && r.longitude ? { latitude: r.latitude, longitude: r.longitude, timestamp: r.timestamp } : null,
      triggerType: r.trigger_type as SOSSession['payload']['triggerType'],
      isSilent: r.is_silent === 1,
    },
    status: r.status as SOSSession['status'],
    startedAt: r.timestamp,
    resolvedAt: r.resolved_at ?? undefined,
    channelResults: JSON.parse(r.channel_results || '{}'),
    log: JSON.parse(r.log_entries || '[]'),
  }));
}

// ================= OFFLINE QUEUE =================
export async function enqueueOfflineItem(item: Omit<OfflineQueueItem, 'attempts' | 'status'>): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT OR REPLACE INTO offline_queue (id, type, payload_json, attempts, created_at, status) VALUES (?, ?, ?, 0, ?, ?);',
    [item.id, item.type, item.payloadJson, item.createdAt, 'PENDING']
  );
}

export async function getPendingQueueItems(): Promise<OfflineQueueItem[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    id: string;
    type: string;
    payload_json: string;
    attempts: number;
    created_at: number;
    last_attempt_at: number | null;
    status: string;
  }>("SELECT * FROM offline_queue WHERE status = 'PENDING' ORDER BY created_at ASC;");

  return rows.map((r) => ({
    id: r.id,
    type: r.type as OfflineQueueItem['type'],
    payloadJson: r.payload_json,
    attempts: r.attempts,
    createdAt: r.created_at,
    lastAttemptAt: r.last_attempt_at ?? undefined,
    status: r.status as OfflineQueueItem['status'],
  }));
}

export async function markQueueItemCompleted(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync("UPDATE offline_queue SET status = 'SENT' WHERE id = ?;", [id]);
}

export async function markQueueItemFailed(id: string, attempts: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    "UPDATE offline_queue SET attempts = ?, last_attempt_at = ?, status = CASE WHEN ? >= 5 THEN 'FAILED' ELSE 'PENDING' END WHERE id = ?;",
    [attempts, Date.now(), attempts, id]
  );
}

// ================= HAZARDS =================
export async function getHazardReports(): Promise<HazardReport[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    id: string;
    type: string;
    title: string;
    description: string;
    latitude: number;
    longitude: number;
    radius_meters: number;
    severity: string;
    photo_uri: string | null;
    reported_at: number;
    synced: number;
  }>('SELECT * FROM hazard_reports ORDER BY reported_at DESC;');

  return rows.map((r) => ({
    id: r.id,
    type: r.type as HazardReport['type'],
    title: r.title,
    description: r.description,
    latitude: r.latitude,
    longitude: r.longitude,
    radiusMeters: r.radius_meters,
    severity: r.severity as HazardReport['severity'],
    photoUri: r.photo_uri ?? undefined,
    reportedAt: r.reported_at,
    synced: r.synced === 1,
  }));
}

export async function insertHazardReport(hazard: HazardReport): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO hazard_reports 
      (id, type, title, description, latitude, longitude, radius_meters, severity, photo_uri, reported_at, synced)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      hazard.id,
      hazard.type,
      hazard.title,
      hazard.description,
      hazard.latitude,
      hazard.longitude,
      hazard.radiusMeters,
      hazard.severity,
      hazard.photoUri ?? null,
      hazard.reportedAt,
      hazard.synced ? 1 : 0,
    ]
  );
}

// ================= EVIDENCE FILES =================
export async function insertEvidenceRecord(record: AudioEvidenceRecord): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO evidence_files 
      (id, sos_id, file_name, file_path, duration_seconds, recorded_at, file_size_bytes, is_encrypted, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      record.id,
      record.sosId ?? null,
      record.fileName,
      record.filePath,
      record.durationSeconds,
      record.recordedAt,
      record.fileSizeBytes,
      record.isEncrypted ? 1 : 0,
      record.notes ?? null,
    ]
  );
}

export async function getEvidenceRecords(): Promise<AudioEvidenceRecord[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    id: string;
    sos_id: string | null;
    file_name: string;
    file_path: string;
    duration_seconds: number;
    recorded_at: number;
    file_size_bytes: number;
    is_encrypted: number;
    notes: string | null;
  }>('SELECT * FROM evidence_files ORDER BY recorded_at DESC;');

  return rows.map((r) => ({
    id: r.id,
    sosId: r.sos_id ?? undefined,
    fileName: r.file_name,
    filePath: r.file_path,
    durationSeconds: r.duration_seconds,
    recordedAt: r.recorded_at,
    fileSizeBytes: r.file_size_bytes,
    isEncrypted: r.is_encrypted === 1,
    notes: r.notes ?? undefined,
  }));
}

// ================= CHAT MESSAGES =================
export async function insertChatMessage(msg: ChatMessage): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO chat_messages 
      (id, sender_id, sender_name, recipient_contact_id, message_text, timestamp, status, is_emergency_alert)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      msg.id,
      msg.senderId,
      msg.senderName,
      msg.recipientContactId ?? null,
      msg.messageText,
      msg.timestamp,
      msg.status,
      msg.isEmergencyAlert ? 1 : 0,
    ]
  );
}

export async function getChatMessages(): Promise<ChatMessage[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    id: string;
    sender_id: string;
    sender_name: string;
    recipient_contact_id: string | null;
    message_text: string;
    timestamp: number;
    status: string;
    is_emergency_alert: number;
  }>('SELECT * FROM chat_messages ORDER BY timestamp ASC;');

  return rows.map((r) => ({
    id: r.id,
    senderId: r.sender_id,
    senderName: r.sender_name,
    recipientContactId: r.recipient_contact_id ?? undefined,
    messageText: r.message_text,
    timestamp: r.timestamp,
    status: r.status as ChatMessage['status'],
    isEmergencyAlert: r.is_emergency_alert === 1,
  }));
}
