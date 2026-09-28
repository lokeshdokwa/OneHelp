import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { requireAuth, authOptional } from '../middleware/auth';
import { prisma } from '../config/database';

const router = Router();

const sendMessageSchema = z.object({
  body: z.object({
    id: z.string().uuid(),
    conversationId: z.string().optional(),
    recipientId: z.string().optional(),
    messageText: z.string(),
    isEmergencyAlert: z.boolean().optional(),
    timestamp: z.number(),
  }),
});

router.post('/messages', authOptional, validate(sendMessageSchema), async (req, res, next) => {
  try {
    const data = req.body;
    const userId = req.user?.userId || 'anonymous-user';

    // Ensure user exists
    let user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      await prisma.user.create({ data: { id: userId } });
    }

    const message = await prisma.chatMessage.create({
      data: {
        id: data.id,
        senderId: userId,
        senderName: 'User',
        recipientContactId: data.recipientId,
        messageText: data.messageText,
        isEmergencyAlert: data.isEmergencyAlert || false,
        timestamp: new Date(data.timestamp),
        status: 'DELIVERED', // Simulated instant delivery
      }
    });

    return res.json({
      success: true,
      messageId: message.id,
      status: 'DELIVERED',
    });
  } catch (error) {
    next(error);
  }
});

const getMessagesSchema = z.object({
  params: z.object({
    conversationId: z.string(),
  }),
});

router.get('/conversations/:conversationId/messages', requireAuth, validate(getMessagesSchema), async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    
    // In a real app we would filter by conversation ID or recipient. 
    // This is just a placeholder returning 0 messages for now.
    return res.json({
      success: true,
      messages: [],
    });
  } catch (error) {
    next(error);
  }
});

export default router;
