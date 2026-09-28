import { Server } from 'socket.io';
import { createServer } from 'http';
import app from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { prisma } from './config/database';

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: env.CORS_ORIGINS === '*' ? '*' : env.CORS_ORIGINS.split(','),
  }
});

io.on('connection', (socket) => {
  logger.info({ socketId: socket.id }, 'Socket connected');
  
  socket.on('join', (room) => {
    socket.join(room);
  });

  socket.on('disconnect', () => {
    logger.info({ socketId: socket.id }, 'Socket disconnected');
  });
});

export { io };

const startServer = async () => {
  try {
    // Attempt database connection — fail hard in production, warn in development
    await prisma.$connect();
    logger.info('Connected to PostgreSQL database');
  } catch (error) {
    if (env.NODE_ENV === 'production') {
      logger.error({ error }, 'Cannot connect to database — exiting in production mode');
      process.exit(1);
    } else {
      logger.warn({ error }, '[DEV] PostgreSQL unavailable — server starting WITHOUT database. Most API routes will fail. Run PostgreSQL and restart.');
    }
  }

  server.listen(Number(env.PORT), env.HOST, () => {
    logger.info(`Server running on ${env.HOST}:${env.PORT} (${env.NODE_ENV})`);
    logger.info(`Backend API: http://${env.HOST === '0.0.0.0' ? '10.79.38.251' : env.HOST}:${env.PORT}/api/v1`);
  });
};

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

startServer();
