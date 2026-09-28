import { expect, test, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/config/database';

const SOS_UUID = '00000000-0000-0000-0000-000000000001';
const SOS_UUID2 = '00000000-0000-0000-0000-000000000002';
const HAZARD_UUID = '00000000-0000-0000-0000-100000000001';

vi.mock('../src/config/database', () => ({
  prisma: {
    sosIncident: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    sosLocation: { create: vi.fn() },
    sosEvent: { create: vi.fn() },
    responder: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
    responderAssignment: {
      create: vi.fn(),
      findFirst: vi.fn(),
    },
    hazard: {
      findUnique: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    auditLog: { create: vi.fn() },
    greenCorridorRequest: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    trustedContact: {
      upsert: vi.fn(),
    },
  }
}));

beforeEach(() => {
  vi.clearAllMocks();
});

// ===============================================================
// SOS DISPATCH TESTS
// ===============================================================

test('POST /api/v1/sos/dispatch — creates incident on first call', async () => {
  (prisma.sosIncident.findUnique as any)
    .mockResolvedValueOnce(null)            // initial check: not found
    .mockResolvedValueOnce({ id: SOS_UUID, status: 'RESPONDER_ASSIGNED' }); // final refetch
  (prisma.user.findUnique as any).mockResolvedValue(null);
  (prisma.user.create as any).mockResolvedValue({ id: 'u-auto' });
  (prisma.sosIncident.create as any).mockResolvedValue({ id: SOS_UUID, status: 'DISPATCHING' });
  (prisma.responder.findMany as any).mockResolvedValue([]);
  (prisma.auditLog.create as any).mockResolvedValue({});

  const res = await request(app)
    .post('/api/v1/sos/dispatch')
    .send({
      sosId: SOS_UUID,
      triggerType: 'MANUAL_BUTTON',
      location: { latitude: 28.6139, longitude: 77.2090, accuracy: 8.5 },
      batteryLevel: 84,
    });

  if (res.status !== 200) console.log('[dispatch success]', res.body);
  expect(res.status).toBe(200);
  expect(res.body.success).toBe(true);
  expect(res.body.dispatchId).toBe(SOS_UUID);
  expect(typeof res.body.responderEtaMinutes).toBe('number');
  expect(prisma.sosIncident.create).toHaveBeenCalledTimes(1);
});

test('POST /api/v1/sos/dispatch — IDEMPOTENCY: duplicate sosId does NOT create second incident', async () => {
  // Incident already exists
  (prisma.sosIncident.findUnique as any).mockResolvedValue({ id: SOS_UUID, status: 'DISPATCHING' });
  (prisma.sosLocation.create as any).mockResolvedValue({});

  const res = await request(app)
    .post('/api/v1/sos/dispatch')
    .send({
      sosId: SOS_UUID,
      triggerType: 'MANUAL_BUTTON',
      location: { latitude: 28.6139, longitude: 77.2090 },
    });

  expect(res.status).toBe(200);
  expect(res.body.success).toBe(true);
  // MUST NOT create a new incident
  expect(prisma.sosIncident.create).not.toHaveBeenCalled();
  // MUST update location
  expect(prisma.sosLocation.create).toHaveBeenCalledTimes(1);
});

test('POST /api/v1/sos/dispatch — validation rejects missing location', async () => {
  const res = await request(app)
    .post('/api/v1/sos/dispatch')
    .send({ sosId: SOS_UUID, triggerType: 'MANUAL_BUTTON' }); // no location
  expect(res.status).toBe(400);
  expect(res.body.success).toBe(false);
  expect(res.body.error.code).toBe('VALIDATION_ERROR');
});

test('POST /api/v1/sos/dispatch — validation rejects invalid trigger type', async () => {
  const res = await request(app)
    .post('/api/v1/sos/dispatch')
    .send({
      sosId: SOS_UUID,
      triggerType: 'INVALID_TRIGGER',
      location: { latitude: 28.6, longitude: 77.2 },
    });
  expect(res.status).toBe(400);
});

// ===============================================================
// SOS CANCEL TESTS
// ===============================================================

test('POST /api/v1/sos/cancel — normal cancellation updates status to CANCELLED', async () => {
  (prisma.sosIncident.findUnique as any).mockResolvedValue({ id: SOS_UUID, status: 'DISPATCHING', priority: 1 });
  (prisma.sosIncident.update as any).mockResolvedValue({});
  (prisma.sosEvent.create as any).mockResolvedValue({});
  (prisma.auditLog.create as any).mockResolvedValue({});

  const res = await request(app)
    .post('/api/v1/sos/cancel')
    .send({ sosId: SOS_UUID, isDuress: false });

  expect(res.status).toBe(200);
  expect(res.body.success).toBe(true);
  expect(prisma.sosIncident.update).toHaveBeenCalledWith(expect.objectContaining({
    data: expect.objectContaining({ status: 'CANCELLED' }),
  }));
});

test('POST /api/v1/sos/cancel — DURESS: incident must NOT be cancelled', async () => {
  (prisma.sosIncident.findUnique as any).mockResolvedValue({ id: SOS_UUID, status: 'DISPATCHING', priority: 1 });
  (prisma.sosIncident.update as any).mockResolvedValue({});
  (prisma.sosEvent.create as any).mockResolvedValue({});
  (prisma.auditLog.create as any).mockResolvedValue({});

  const res = await request(app)
    .post('/api/v1/sos/cancel')
    .send({ sosId: SOS_UUID, isDuress: true });

  expect(res.status).toBe(200);
  expect(res.body.success).toBe(true);
  // The update must mark isDuress=true, NOT status=CANCELLED
  expect(prisma.sosIncident.update).toHaveBeenCalledWith(expect.objectContaining({
    data: expect.objectContaining({ isDuress: true }),
  }));
  // The update must NOT set status to CANCELLED
  const updateCall = (prisma.sosIncident.update as any).mock.calls[0][0];
  expect(updateCall.data.status).toBeUndefined();
  // Duress event must be logged
  expect(prisma.sosEvent.create).toHaveBeenCalledWith(expect.objectContaining({
    data: expect.objectContaining({ eventType: 'DURESS_TRIGGERED' }),
  }));
});

test('POST /api/v1/sos/cancel — 404 for unknown SOS ID', async () => {
  (prisma.sosIncident.findUnique as any).mockResolvedValue(null);
  const res = await request(app)
    .post('/api/v1/sos/cancel')
    .send({ sosId: SOS_UUID2, isDuress: false });
  expect(res.status).toBe(404);
});

// ===============================================================
// HAZARDS TESTS
// ===============================================================

test('GET /api/v1/hazards — returns radius-filtered hazards', async () => {
  (prisma.hazard.findMany as any).mockResolvedValue([
    { id: 'h1', latitude: 28.614, longitude: 77.210, type: 'FLOOD', status: 'VERIFIED' },
    // far hazard should be filtered out by Haversine
    { id: 'h2', latitude: 29.0, longitude: 78.0, type: 'FIRE', status: 'VERIFIED' },
  ]);

  const res = await request(app)
    .get('/api/v1/hazards?lat=28.6139&lng=77.2090&radiusKm=5');

  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
  // Only the nearby hazard should pass Haversine filter
  expect(res.body.some((h: any) => h.id === 'h1')).toBe(true);
  expect(res.body.some((h: any) => h.id === 'h2')).toBe(false);
});

test('POST /api/v1/hazards/report — creates PENDING_REVIEW hazard', async () => {
  (prisma.hazard.findUnique as any).mockResolvedValue(null);
  (prisma.hazard.create as any).mockResolvedValue({ id: HAZARD_UUID });

  const res = await request(app)
    .post('/api/v1/hazards/report')
    .send({
      id: HAZARD_UUID,
      type: 'FIRE',
      title: 'Forest Fire near Ridge',
      description: 'Dense smoke moving toward highway',
      latitude: 28.62,
      longitude: 77.22,
      severity: 'CRITICAL',
      reportedAt: new Date().toISOString(),
    });

  expect(res.status).toBe(201);
  expect(res.body.success).toBe(true);
  expect(prisma.hazard.create).toHaveBeenCalledWith(expect.objectContaining({
    data: expect.objectContaining({ status: 'PENDING_REVIEW' }),
  }));
});

// ===============================================================
// GREEN CORRIDOR TESTS
// ===============================================================

test('POST /api/v1/traffic/green-corridor — stores request with REQUESTED status', async () => {
  const gcId = '00000000-0000-0000-0000-200000000001';
  (prisma.greenCorridorRequest.findUnique as any).mockResolvedValue(null);
  (prisma.greenCorridorRequest.create as any).mockResolvedValue({ id: gcId });

  const res = await request(app)
    .post('/api/v1/traffic/green-corridor')
    .send({
      id: gcId,
      ambulancePlate: 'DL-01-AB-1234',
      patientCondition: 'CRITICAL_CARDIAC',
      originHospital: 'Civil Hospital',
      destinationHospital: 'AIIMS',
      currentLat: 28.63,
      currentLng: 77.20,
      destLat: 28.56,
      destLng: 77.21,
      etaMinutes: 14,
      routeSummary: 'Ring Road via Barapullah',
    });

  expect(res.status).toBe(200);
  expect(res.body.success).toBe(true);
  // Must NOT claim real signals cleared
  expect(res.body.message).toContain('DEMO MODE');
  expect(prisma.greenCorridorRequest.create).toHaveBeenCalledWith(expect.objectContaining({
    data: expect.objectContaining({ status: 'REQUESTED' }),
  }));
});

// ===============================================================
// HEALTH ENDPOINTS
// ===============================================================

test('GET /api/v1/health — returns ok', async () => {
  const res = await request(app).get('/api/v1/health');
  expect(res.status).toBe(200);
  expect(res.body.status).toBe('ok');
});
