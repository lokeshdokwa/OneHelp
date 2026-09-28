import express from 'express';
import { prisma } from '../config/database';
import { requireAuth } from '../middleware/auth';
import { z } from 'zod';

const router = express.Router();

const createCircleSchema = z.object({
  name: z.string().min(1),
});

// Create a safety circle
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name } = createCircleSchema.parse(req.body);
    const userId = req.user!.userId;

    const circle = await prisma.safetyCircle.create({
      data: {
        name,
        ownerId: userId,
        members: {
          create: {
            userId,
            role: 'OWNER',
          },
        },
      },
      include: {
        members: true,
      },
    });

    res.status(201).json({ success: true, circle });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid circle name' },
      });
    }
    console.error('Create circle error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to create safety circle' },
    });
  }
});

// List safety circles the authenticated user belongs to
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.userId;

    const circles = await prisma.safetyCircle.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      include: {
        members: {
          select: {
            userId: true,
            role: true,
            createdAt: true,
          }
        },
      },
    });

    res.json({ success: true, circles });
  } catch (error) {
    console.error('List circles error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to fetch safety circles' },
    });
  }
});

const addMemberSchema = z.object({
  userIdToAdd: z.string().min(1),
  role: z.enum(['ADMIN', 'MEMBER']).default('MEMBER'),
});

// Add member to safety circle (Owner/Admin only)
router.post('/:circleId/members', requireAuth, async (req, res) => {
  try {
    const { circleId } = req.params;
    const { userIdToAdd, role } = addMemberSchema.parse(req.body);
    const requestingUserId = req.user!.userId;

    // Verify requester is Owner or Admin
    const membership = await prisma.safetyCircleMember.findUnique({
      where: {
        circleId_userId: {
          circleId,
          userId: requestingUserId,
        },
      },
    });

    if (!membership || (membership.role !== 'OWNER' && membership.role !== 'ADMIN')) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not authorized to add members to this circle' },
      });
    }

    const newMember = await prisma.safetyCircleMember.create({
      data: {
        circleId,
        userId: userIdToAdd,
        role,
      },
    });

    res.status(201).json({ success: true, member: newMember });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid data' },
      });
    }
    // Prisma unique constraint violation
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        error: { code: 'ALREADY_EXISTS', message: 'User is already a member of this circle' },
      });
    }
    console.error('Add circle member error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to add member' },
    });
  }
});

// Remove member from circle (Owner only)
router.delete('/:circleId/members/:userId', requireAuth, async (req, res) => {
  try {
    const { circleId, userId: targetUserId } = req.params;
    const requestingUserId = req.user!.userId;

    // Verify requester is Owner
    const membership = await prisma.safetyCircleMember.findUnique({
      where: {
        circleId_userId: {
          circleId,
          userId: requestingUserId,
        },
      },
    });

    if (!membership || membership.role !== 'OWNER') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only the circle owner can remove members' },
      });
    }

    // Cannot remove the owner themselves
    if (targetUserId === requestingUserId) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_OPERATION', message: 'Owner cannot be removed from the circle' },
      });
    }

    await prisma.safetyCircleMember.delete({
      where: {
        circleId_userId: {
          circleId,
          userId: targetUserId,
        },
      },
    });

    res.json({ success: true, message: 'Member removed' });
  } catch (error) {
    console.error('Remove circle member error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to remove member' },
    });
  }
});

export default router;
