import { Router } from 'express';
import authRoutes from './auth';
import sosRoutes from './sos';
import hazardsRoutes from './hazards';
import contactsRoutes from './contacts';
import trafficRoutes from './traffic';
import chatRoutes from './chat';
import evidenceRoutes from './evidence';
import notificationsRoutes from './notifications';
import feedbackRoutes from './feedback';
import medicalRoutes from './medical';
import safetyCirclesRoutes from './safety-circles';
import { prisma } from '../config/database';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.get('/ready', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ready', database: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'not_ready', database: 'disconnected' });
  }
});

router.use('/auth', authRoutes);
router.use('/sos', sosRoutes);
router.use('/hazards', hazardsRoutes);
router.use('/contacts', contactsRoutes);
router.use('/traffic', trafficRoutes);
router.use('/chat', chatRoutes);
router.use('/evidence', evidenceRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/medical', medicalRoutes);
router.use('/safety-circles', safetyCirclesRoutes);

export default router;
