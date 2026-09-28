import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { prisma } from '../config/database';
import { logger } from '../config/logger';

const router = Router();

const syncContactsSchema = z.object({
  body: z.object({
    contacts: z.array(z.object({
      id: z.string(),
      name: z.string(),
      phone: z.string(),
      relationship: z.string().optional(),
      isPrimary: z.boolean().optional(),
    }))
  })
});

router.post('/sync', validate(syncContactsSchema), async (req, res, next) => {
  try {
    const { contacts } = req.body;
    const userId = req.user?.userId || 'anonymous-user';

    // Create user if not exists
    let user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      await prisma.user.create({ data: { id: userId } });
    }

    // Upsert contacts
    const results = [];
    for (const contact of contacts) {
      const result = await prisma.trustedContact.upsert({
        where: { userId_phone: { userId, phone: contact.phone } },
        update: {
          name: contact.name,
          relationship: contact.relationship,
          isPrimary: contact.isPrimary,
        },
        create: {
          userId,
          name: contact.name,
          phone: contact.phone,
          relationship: contact.relationship,
          isPrimary: contact.isPrimary || false,
        }
      });
      results.push(result);
    }
    
    logger.info({ userId, count: contacts.length }, 'Synced trusted contacts');

    return res.json({
      success: true,
      syncedCount: results.length
    });
  } catch (error) {
    next(error);
  }
});

export default router;
