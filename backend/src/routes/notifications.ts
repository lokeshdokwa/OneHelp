import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';
import { prisma } from '../config/database';

const router = Router();

const deviceTokenSchema = z.object({
  body: z.object({
    token: z.string(),
    platform: z.string(),
  }),
});

router.post('/device-token', requireAuth, validate(deviceTokenSchema), async (req, res, next) => {
  try {
    const { token, platform } = req.body;
    const userId = req.user!.userId;

    await prisma.devicePushToken.upsert({
      where: { userId_token: { userId, token } },
      update: { lastSeen: new Date() },
      create: { userId, token, platform },
    });

    return res.json({
      success: true,
      message: 'Device token registered successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
