import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { authOptional } from '../middleware/auth';
import { prisma } from '../config/database';
import { logger } from '../config/logger';

const router = Router();

const sendSOSSchema = z.object({
  body: z.object({
    sosId: z.string().uuid(),
    userId: z.string().optional(),
    triggerType: z.enum(['MANUAL_BUTTON', 'SHAKE', 'VOICE_KEYWORD', 'GUNSHOT_ACOUSTIC', 'VOICE_STRESS', 'FALL']),
    timestamp: z.number().optional(),
    location: z.object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
      accuracy: z.number().optional(),
      altitude: z.number().optional(),
      address: z.string().optional(),
    }),
    medicalSummary: z.object({
      bloodGroup: z.string().optional(),
      allergies: z.string().optional(),
      conditions: z.string().optional(),
    }).optional(),
    priority: z.number().optional().default(1),
    batteryLevel: z.number().min(0).max(100).optional(),
    isSilent: z.boolean().optional().default(false),
    duressActive: z.boolean().optional().default(false),
    messageText: z.string().optional(),
  }),
});

router.post('/dispatch', authOptional, validate(sendSOSSchema), async (req, res, next) => {
  try {
    const { sosId, triggerType, location, priority, batteryLevel, isSilent, messageText } = req.body;
    
    // Idempotency: check if incident already exists
    let incident = await prisma.sosIncident.findUnique({ where: { id: sosId } });

    // Support both authenticated and anonymous emergency mode
    const userId = req.user?.userId;
    
    if (!incident) {
      // Find or create user
      let user;
      if (userId) {
        user = await prisma.user.findUnique({ where: { id: userId } });
      }
      // If user not found (anonymous emergency), create one
      if (!user) {
        user = await prisma.user.create({ data: {} });
      }

      incident = await prisma.sosIncident.create({
        data: {
          id: sosId,
          userId: user.id,
          status: 'DISPATCHING',
          triggerType,
          priority: priority ?? 1,
          batteryLevel,
          isSilent: isSilent ?? false,
          messageText,
          locations: {
            create: {
              latitude: location.latitude,
              longitude: location.longitude,
              accuracy: location.accuracy,
              altitude: location.altitude,
              address: location.address,
              timestamp: new Date(),
            }
          },
          events: {
            create: {
              eventType: 'SOS_CREATED',
              details: `Trigger: ${triggerType}`,
            }
          }
        },
      });

      // Audit log
      await prisma.auditLog.create({
        data: {
          actor: userId || 'anonymous',
          action: 'SOS_CREATED',
          resource: 'SosIncident',
          resourceId: sosId,
          requestId: String(req.id),
        }
      });
      
      // Assign nearest available responder
      const availableResponders = await prisma.responder.findMany({
        where: { status: 'AVAILABLE' }
      });
      
      let etaMinutes = 10; // default ETA
      if (availableResponders.length > 0) {
        // Find nearest responder by Haversine distance
        let nearest = availableResponders[0];
        let minDist = Infinity;
        for (const r of availableResponders) {
          if (r.latitude && r.longitude) {
            const dist = haversineKm(location.latitude, location.longitude, r.latitude, r.longitude);
            if (dist < minDist) {
              minDist = dist;
              nearest = r;
            }
          }
        }

        await prisma.responderAssignment.create({
          data: {
            incidentId: sosId,
            responderId: nearest.id,
            status: 'ASSIGNED',
          }
        });

        await prisma.responder.update({
          where: { id: nearest.id },
          data: { status: 'DISPATCHED' }
        });

        await prisma.sosIncident.update({
          where: { id: incident.id },
          data: { status: 'RESPONDER_ASSIGNED' }
        });
        
        await prisma.sosEvent.create({
          data: {
            incidentId: sosId,
            eventType: 'RESPONDER_ASSIGNED',
            details: `Demo responder ${nearest.callSign} assigned (simulation only — no real dispatch).`,
          }
        });

        // ETA estimate: ~2 min/km at emergency speed
        const distKm = (nearest.latitude && nearest.longitude)
          ? haversineKm(location.latitude, location.longitude, nearest.latitude, nearest.longitude)
          : 5;
        etaMinutes = Math.max(1, Math.round(distKm * 2));
      }

      incident = await prisma.sosIncident.findUnique({ where: { id: sosId } }) as any;
      logger.info({ sosId, userId: user.id }, 'SOS Incident created');

      return res.json({
        success: true,
        dispatchId: incident!.id,
        responderEtaMinutes: etaMinutes,
        message: 'SOS registered. Emergency response initiated. [DEMO MODE — No real dispatch performed]',
      });
    } else {
      // Idempotent retry: update location only
      await prisma.sosLocation.create({
        data: {
          incidentId: sosId,
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          timestamp: new Date(),
        }
      });
      logger.info({ sosId }, 'SOS Incident location updated (idempotent retry)');

      return res.json({
        success: true,
        dispatchId: incident.id,
        responderEtaMinutes: 5,
        message: 'SOS already registered. Location updated.',
      });
    }
  } catch (error) {
    next(error);
  }
});

const cancelSOSSchema = z.object({
  body: z.object({
    sosId: z.string().uuid(),
    reason: z.string().optional(),
    isDuress: z.boolean().optional().default(false),
  }),
});

router.post('/cancel', authOptional, validate(cancelSOSSchema), async (req, res, next) => {
  try {
    const { sosId, reason, isDuress } = req.body;

    const incident = await prisma.sosIncident.findUnique({ where: { id: sosId } });
    if (!incident) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'SOS incident not found' }, requestId: req.id });
    }

    if (isDuress) {
      // DURESS: Do NOT cancel — keep active, mark duress, raise priority
      await prisma.sosIncident.update({
        where: { id: sosId },
        data: {
          isDuress: true,
          priority: Math.min((incident.priority || 1) + 2, 5),
        },
      });
      await prisma.sosEvent.create({
        data: {
          incidentId: sosId,
          eventType: 'DURESS_TRIGGERED',
          details: reason || 'Duress cancellation detected',
        }
      });
      await prisma.auditLog.create({
        data: {
          actor: req.user?.userId || 'anonymous',
          action: 'DURESS_TRIGGERED',
          resource: 'SosIncident',
          resourceId: sosId,
          requestId: String(req.id),
          details: 'Duress signal — incident remains ACTIVE',
        }
      });
      // DEMO_MODE: log provider call
      logger.warn({ sosId }, '[DURESS] Incident remains active — provider notification would be sent here');
      
      // Return a SAFE fake-cancel response to the attacker/coercer
      return res.json({
        success: true,
        message: 'SOS status updated successfully.',
      });
    }

    // Validate state machine: cannot cancel RESOLVED
    if (incident.status === 'RESOLVED') {
      return res.status(409).json({ success: false, error: { code: 'INVALID_STATE', message: 'Cannot cancel a resolved incident' }, requestId: req.id });
    }

    await prisma.sosIncident.update({
      where: { id: sosId },
      data: {
        status: 'CANCELLED',
        resolvedAt: new Date(),
      },
    });
    
    await prisma.sosEvent.create({
      data: {
        incidentId: sosId,
        eventType: 'SOS_CANCELLED',
        details: reason,
      }
    });

    await prisma.auditLog.create({
      data: {
        actor: req.user?.userId || 'anonymous',
        action: 'SOS_CANCELLED',
        resource: 'SosIncident',
        resourceId: sosId,
        requestId: String(req.id),
      }
    });

    return res.json({
      success: true,
      message: 'SOS status updated successfully.',
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:sosId/responder', authOptional, async (req, res, next) => {
  try {
    const { sosId } = req.params;
    
    const assignment = await prisma.responderAssignment.findFirst({
      where: { incidentId: sosId },
      include: { responder: true },
      orderBy: { assignedAt: 'desc' },
    });

    if (!assignment) {
      return res.status(404).json({ success: false, error: { message: 'No responder assigned yet' }, requestId: req.id });
    }

    return res.json({
      responderId: assignment.responder.id,
      name: assignment.responder.name,
      callSign: assignment.responder.callSign,
      role: assignment.responder.role,
      latitude: assignment.responder.latitude ?? 28.6185,
      longitude: assignment.responder.longitude ?? 77.2120,
      etaMinutes: 5,
      status: assignment.status,
      phone: assignment.responder.phone ?? '+919876543210',
      updatedAt: assignment.responder.updatedAt.getTime(),
    });
  } catch (error) {
    next(error);
  }
});

// Haversine distance in km
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 +
            Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

export default router;
