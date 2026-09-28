import { expect, test, beforeAll, afterAll } from 'vitest';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as ioc } from 'socket.io-client';
import type { Socket as ClientSocket } from 'socket.io-client';
import { initializeSocket } from '../src/config/socket';
import app from '../src/app';

let io: Server;
let clientSocket: ClientSocket;
let serverSocket: any;
const port = 3099;

beforeAll(() => new Promise<void>((resolve) => {
  const httpServer = createServer(app);
  io = initializeSocket(httpServer);

  io.on('connection', (socket) => {
    serverSocket = socket;
  });

  httpServer.listen(port, () => {
    clientSocket = ioc(`http://localhost:${port}`);
    clientSocket.on('connect', () => resolve());
  });
}));

afterAll(() => {
  io.close();
  clientSocket.disconnect();
});

test('Socket.IO: Client can join a named room via joinRoom event', () => new Promise<void>((resolve) => {
  const testUserId = 'user-test-1234';

  // Wait for server to process the join, then check membership
  clientSocket.emit('joinRoom', testUserId);
  
  setTimeout(() => {
    expect(serverSocket.rooms.has(testUserId)).toBe(true);
    resolve();
  }, 100);
}));

test('Socket.IO: Server can emit incidentStatusUpdate to a room that client receives', () => new Promise<void>((resolve) => {
  const testIncidentId = 'incident-abc';
  const testRoom = 'user-test-1234';

  clientSocket.once('incidentStatusUpdate', (data) => {
    expect(data.incidentId).toBe(testIncidentId);
    expect(data.status).toBe('RESPONDER_ASSIGNED');
    resolve();
  });

  io.to(testRoom).emit('incidentStatusUpdate', {
    incidentId: testIncidentId,
    status: 'RESPONDER_ASSIGNED',
  });
}));

test('Socket.IO: Server can emit responderLocationUpdate to room', () => new Promise<void>((resolve) => {
  const testRoom = 'user-test-1234';

  clientSocket.once('responderLocationUpdate', (data) => {
    expect(data.latitude).toBe(28.61);
    expect(data.responderId).toBe('r-1');
    resolve();
  });

  io.to(testRoom).emit('responderLocationUpdate', {
    latitude: 28.61,
    longitude: 77.20,
    responderId: 'r-1',
  });
}));
