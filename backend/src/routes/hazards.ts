import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { authOptional } from '../middleware/auth';
import { prisma } from '../config/database';
import { logger } from '../config/logger';

const router = Router();

const reportHazardSchema = z.object({
  body: z.object({
    id: z.string().uuid(),
    type: z.enum(['FLOOD', 'FIRE', 'ROAD_BLOCK', 'LANDSLIDE', 'GAS_LEAK', 'BUILDING_COLLAPSE', 'OTHER']),
    title: z.string().min(3).max(200),
    description: z.string().min(3).max(1000),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    radiusMeters: z.number().optional().default(50),
    severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    photoUri: z.string().optional(),
    reportedAt: z.union([z.string().datetime(), z.number()]),
  }),
});

router.post('/report', authOptional, validate(reportHazardSchema), async (req, res, next) => {
  try {
    const data = req.body;
    
    // Idempotency: don't double-create the same report
    let hazard = await prisma.hazard.findUnique({ where: { id: data.id } });
    if (!hazard) {
      hazard = await prisma.hazard.create({
        data: {
          id: data.id,
          type: data.type,
          title: data.title,
          description: data.description,
          latitude: data.latitude,
          longitude: data.longitude,
          severity: data.severity,
          photoUri: data.photoUri,
          reportedAt: typeof data.reportedAt === 'number' ? new Date(data.reportedAt) : new Date(data.reportedAt),
          radiusMeters: data.radiusMeters ?? 50,
          // Crowdsourced reports start as PENDING_REVIEW — never auto-verify
          status: 'PENDING_REVIEW',
        }
      });
      logger.info({ hazardId: hazard.id }, 'Hazard reported (PENDING_REVIEW)');
    }

    return res.status(201).json({
      success: true,
      id: hazard.id,
    });
  } catch (error) {
    next(error);
  }
});

const getHazardsSchema = z.object({
  query: z.object({
    lat: z.coerce.number().min(-90).max(90),
    lng: z.coerce.number().min(-180).max(180),
    radiusKm: z.coerce.number().optional().default(25),
  }),
});

router.get('/', validate(getHazardsSchema), async (req, res, next) => {
  try {
    const { lat, lng, radiusKm } = req.query as unknown as { lat: number, lng: number, radiusKm: number };

    // Bounding box pre-filter to reduce DB scan
    const latDelta = radiusKm / 111.32;
    const lonDelta = radiusKm / (111.32 * Math.cos(lat * (Math.PI / 180)));

    const hazards = await prisma.hazard.findMany({
      where: {
        // Only return verified AND pending_review hazards (not rejected/resolved)
        status: { in: ['VERIFIED', 'PENDING_REVIEW'] },
        latitude: { gte: lat - latDelta, lte: lat + latDelta },
        longitude: { gte: lng - lonDelta, lte: lng + lonDelta },
      },
      take: 50,
      orderBy: { reportedAt: 'desc' },
    });

    // Haversine post-filter for accurate circle
    const filtered = hazards.filter(h => haversineKm(lat, lng, h.latitude, h.longitude) <= radiusKm);

    return res.json(filtered);
  } catch (error) {
    next(error);
  }
});

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 +
            Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

export default router;
