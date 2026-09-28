import { Router } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { validate } from '../middleware/validate';
import { env } from '../config/env';
import { prisma } from '../config/database';

const router = Router();

const deviceAuthSchema = z.object({
  body: z.object({
    deviceId: z.string(),
    platform: z.string(),
    appVersion: z.string().optional(),
    deviceLabel: z.string().optional(),
  }),
});

router.post('/device', validate(deviceAuthSchema), async (req, res, next) => {
  try {
    const { deviceId, platform, appVersion, deviceLabel } = req.body;

    let device = await prisma.device.findUnique({
      where: { deviceId },
      include: { user: true },
    });

    if (!device) {
      // Create user and device
      const user = await prisma.user.create({ data: {} });
      device = await prisma.device.create({
        data: {
          deviceId,
          platform,
          appVersion,
          deviceLabel,
          userId: user.id,
        },
        include: { user: true },
      });
    }

    const token = jwt.sign(
      { userId: device.user.id, deviceId: device.id },
      env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.json({
      success: true,
      accessToken: token,
      userId: device.user.id,
      expiresIn: env.JWT_EXPIRES_IN,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
