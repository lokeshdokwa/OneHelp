import { expect, test, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/config/database';
import { randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '../src/config/env';

let authToken = '';
let testUserId = '';

beforeAll(async () => {
  // Connect to the real database
  await prisma.$connect();
  
  // Register a test user for auth routes
  const res = await request(app)
    .post('/api/v1/auth/device')
    .send({
      deviceId: 'test-device-uuid',
      platform: 'android',
    });
    
  expect(res.status).toBe(200);
  authToken = res.body.accessToken;
  testUserId = res.body.userId;
});

afterAll(async () => {
  // Clean up test data and disconnect
  await prisma.safetyCircleMember.deleteMany({ where: { userId: testUserId } });
  await prisma.safetyCircle.deleteMany({ where: { ownerId: testUserId } });
  await prisma.medicalProfile.deleteMany({ where: { userId: testUserId } });
  await prisma.feedback.deleteMany({ where: { userId: testUserId } });
  
  // Find all incidents for the user to delete their child records
  const incidents = await prisma.sosIncident.findMany({ where: { userId: testUserId } });
  const incidentIds = incidents.map(i => i.id);
  
  await prisma.sosLocation.deleteMany({ where: { incidentId: { in: incidentIds } } });
  await prisma.sosEvent.deleteMany({ where: { incidentId: { in: incidentIds } } });
  await prisma.sosIncident.deleteMany({ where: { userId: testUserId } });
  
  await prisma.device.deleteMany({ where: { deviceId: 'test-device-uuid' } });
  await prisma.user.deleteMany({ where: { id: testUserId } });
  await prisma.$disconnect();
});

test('Real DB: Complete SOS lifecycle (dispatch, status, cancel)', async () => {
  const sosId = randomUUID();
  
  // 1. Dispatch
  let res = await request(app)
    .post('/api/v1/sos/dispatch')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      sosId,
      triggerType: 'MANUAL_BUTTON',
      location: { latitude: 28.6139, longitude: 77.2090 },
      batteryLevel: 80,
    });
    
  expect(res.status).toBe(200);
  expect(res.body.success).toBe(true);
  
  // 2. Verify in DB
  let incident = await prisma.sosIncident.findUnique({ where: { id: sosId } });
  expect(incident).toBeDefined();
  expect(incident?.status).toBe('DISPATCHING');
  expect(incident?.userId).toBe(testUserId);
  
  // 3. Cancel
  res = await request(app)
    .post('/api/v1/sos/cancel')
    .set('Authorization', `Bearer ${authToken}`)
    .send({ sosId, isDuress: false });
    
  expect(res.status).toBe(200);
  
  // 4. Verify cancelled status
  incident = await prisma.sosIncident.findUnique({ where: { id: sosId } });
  expect(incident?.status).toBe('CANCELLED');
});

test('Real DB: Safety Circle creation and member listing', async () => {
  // 1. Create circle
  let res = await request(app)
    .post('/api/v1/safety-circles')
    .set('Authorization', `Bearer ${authToken}`)
    .send({ name: 'Family Emergency Group' });
    
  expect(res.status).toBe(201);
  const circleId = res.body.circle.id;
  
  // 2. List circles
  res = await request(app)
    .get('/api/v1/safety-circles')
    .set('Authorization', `Bearer ${authToken}`);
    
  expect(res.status).toBe(200);
  expect(res.body.circles.length).toBeGreaterThanOrEqual(1);
  expect(res.body.circles.some((c: any) => c.id === circleId)).toBe(true);
});

test('Real DB: Medical Profile sync', async () => {
  // 1. Sync
  let res = await request(app)
    .post('/api/v1/medical/sync')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      bloodGroup: 'O+',
      allergies: 'Peanuts',
    });
    
  expect(res.status).toBe(200);
  expect(res.body.profile.bloodGroup).toBe('O+');
  
  // 2. Read
  res = await request(app)
    .get('/api/v1/medical')
    .set('Authorization', `Bearer ${authToken}`);
    
  expect(res.status).toBe(200);
  expect(res.body.profile.bloodGroup).toBe('O+');
});
