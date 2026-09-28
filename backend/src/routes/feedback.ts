import express from 'express';
import { prisma } from '../config/database';
import { requireAuth } from '../middleware/auth';
import { z } from 'zod';

const router = express.Router();

const feedbackSchema = z.object({
  incidentId: z.string().min(1),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

// Submit feedback for an incident
router.post('/', requireAuth, async (req, res) => {
  try {
    const validatedData = feedbackSchema.parse(req.body);
    const { incidentId, rating, comment } = validatedData;
    const userId = req.user!.userId;

    // Check if incident exists
    const incident = await prisma.sosIncident.findUnique({
      where: { id: incidentId },
    });

    if (!incident) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Incident not found' },
      });
    }

    // Upsert feedback (one per user per incident)
    const feedback = await prisma.feedback.upsert({
      where: {
        userId_incidentId: {
          userId,
          incidentId,
        },
      },
      update: { rating, comment },
      create: {
        userId,
        incidentId,
        rating,
        comment,
      },
    });

    res.status(201).json({ success: true, feedback });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input data' },
      });
    }
    console.error('Submit feedback error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to submit feedback' },
    });
  }
});

// Get feedback for an incident (own feedback only)
router.get('/:incidentId', requireAuth, async (req, res) => {
  try {
    const { incidentId } = req.params;
    const userId = req.user!.userId;

    const feedback = await prisma.feedback.findUnique({
      where: {
        userId_incidentId: {
          userId,
          incidentId,
        },
      },
    });

    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Feedback not found' },
      });
    }

    res.json({ success: true, feedback });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to retrieve feedback' },
    });
  }
});

export default router;
