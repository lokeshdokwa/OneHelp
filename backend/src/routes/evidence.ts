import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { authOptional } from '../middleware/auth';
import { prisma } from '../config/database';

const router = Router();

const initiateEvidenceSchema = z.object({
  body: z.object({
    incidentId: z.string().uuid().optional(),
    fileType: z.string(),
    sizeBytes: z.number(),
  }),
});

router.post('/initiate', authOptional, validate(initiateEvidenceSchema), async (req, res, next) => {
  try {
    const { incidentId, fileType, sizeBytes } = req.body;

    const evidence = await prisma.evidence.create({
      data: {
        incidentId,
        fileType,
        sizeBytes,
        storageKey: `evidence/${Date.now()}-${Math.random().toString(36).substring(7)}`,
      }
    });

    return res.json({
      success: true,
      evidenceId: evidence.id,
      uploadUrl: `http://localhost:3000/api/v1/evidence/upload/${evidence.id}`, // Mock presigned URL
    });
  } catch (error) {
    next(error);
  }
});

const completeEvidenceSchema = z.object({
  body: z.object({
    evidenceId: z.string().uuid(),
    checksum: z.string().optional(),
  }),
});

router.post('/complete', authOptional, validate(completeEvidenceSchema), async (req, res, next) => {
  try {
    const { evidenceId, checksum } = req.body;

    await prisma.evidence.update({
      where: { id: evidenceId },
      data: { checksum },
    });

    return res.json({
      success: true,
      message: 'Evidence upload completed successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
