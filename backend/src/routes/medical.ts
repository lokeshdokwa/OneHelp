import express from 'express';
import { prisma } from '../config/database';
import { requireAuth } from '../middleware/auth';
import { z } from 'zod';

const router = express.Router();

const medicalProfileSchema = z.object({
  bloodGroup: z.string().optional(),
  allergies: z.string().optional(),
  conditions: z.string().optional(),
  medications: z.string().optional(),
  emergencyNotes: z.string().optional(),
});

// Update or create medical profile (cloud sync)
router.post('/sync', requireAuth, async (req, res) => {
  try {
    const validatedData = medicalProfileSchema.parse(req.body);
    const userId = req.user!.userId;

    // Audit: log sync event (without logging the data itself)
    await prisma.auditLog.create({
      data: {
        actor: userId,
        action: 'MEDICAL_PROFILE_SYNC',
        resource: 'MedicalProfile',
        resourceId: userId,
      }
    });

    const profile = await prisma.medicalProfile.upsert({
      where: { userId },
      update: validatedData,
      create: {
        userId,
        ...validatedData,
      },
    });

    res.json({ success: true, profile });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input data' },
      });
    }
    console.error('Medical profile sync error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to sync medical profile' },
    });
  }
});

// Get own medical profile (auth required, audit logged)
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.userId;

    // Audit: log access (not the content)
    await prisma.auditLog.create({
      data: {
        actor: userId,
        action: 'MEDICAL_PROFILE_ACCESS',
        resource: 'MedicalProfile',
        resourceId: userId,
      }
    });

    const profile = await prisma.medicalProfile.findUnique({
      where: { userId },
    });

    res.json({ success: true, profile: profile || {} });
  } catch (error) {
    console.error('Medical profile fetch error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to retrieve medical profile' },
    });
  }
});

export default router;
