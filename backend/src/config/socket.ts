import { Server } from 'socket.io';
import { createServer, Server as HttpServer } from 'http';
import app from '../app';
import { logger } from './logger';

export function initializeSocket(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
    }
  });

  io.on('connection', (socket) => {
    logger.info({ socketId: socket.id }, 'Socket connected');

    // Join a user's private room by userId (for targeted SOS/status events)
    socket.on('join', (room: string) => {
      socket.join(room);
      logger.info({ socketId: socket.id, room }, 'Socket joined room');
    });

    // Also support 'joinRoom' alias for frontend compatibility
    socket.on('joinRoom', (room: string) => {
      socket.join(room);
      logger.info({ socketId: socket.id, room }, 'Socket joined room (joinRoom)');
    });

    socket.on('disconnect', () => {
      logger.info({ socketId: socket.id }, 'Socket disconnected');
    });
  });

  return io;
}
