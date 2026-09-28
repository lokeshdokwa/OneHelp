import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { authOptional } from '../middleware/auth';
import { prisma } from '../config/database';
import { logger } from '../config/logger';

const router = Router();

const greenCorridorSchema = z.object({
  body: z.object({
    id: z.string().uuid(),
    ambulancePlate: z.string(),
    patientCondition: z.string(),
    originHospital: z.string(),
    destinationHospital: z.string(),
    currentLat: z.number(),
    currentLng: z.number(),
    destLat: z.number(),
    destLng: z.number(),
    etaMinutes: z.number(),
    routeSummary: z.string(),
  }),
});

router.post('/green-corridor', authOptional, validate(greenCorridorSchema), async (req, res, next) => {
  try {
    const data = req.body;
    
    // Idempotency check
    let request = await prisma.greenCorridorRequest.findUnique({ where: { id: data.id } });
    if (!request) {
      request = await prisma.greenCorridorRequest.create({
        data: {
          id: data.id,
          ambulancePlate: data.ambulancePlate,
          patientCondition: data.patientCondition,
          originHospital: data.originHospital,
          destinationHospital: data.destinationHospital,
          currentLat: data.currentLat,
          currentLng: data.currentLng,
          destLat: data.destLat,
          destLng: data.destLng,
          etaMinutes: data.etaMinutes,
          routeSummary: data.routeSummary,
          // DEMO: store as REQUESTED — no real traffic integration configured
          status: 'REQUESTED',
        }
      });
      logger.info({ corridorId: request.id }, '[DEMO] Green corridor request stored — no real traffic signal provider connected');
    }

    // DEMO mode: simulate provider response clearly labeled
    return res.json({
      success: true,
      corridorId: request.id,
      signalsClearedCount: 0,
      status: 'REQUESTED',
      // Clearly label this as demo — no real traffic integration
      message: 'Green corridor request registered. [DEMO MODE — No real traffic signal provider connected. Integrate TrafficSignalProvider for production.]',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
