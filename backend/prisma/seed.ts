import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Seed demo responders
  const responders = [
    {
      id: 'resp-001',
      name: 'Ambulance Delhi-01',
      callSign: 'AMBU-DL-01',
      role: 'PARAMEDIC',
      phone: '+911120000001',
      status: 'AVAILABLE',
      latitude: 28.6139,
      longitude: 77.2090,
    },
    {
      id: 'resp-002',
      name: 'Police PCR Delhi-02',
      callSign: 'PCR-DL-02',
      role: 'POLICE_OFFICER',
      phone: '+911120000002',
      status: 'AVAILABLE',
      latitude: 28.6350,
      longitude: 77.2200,
    },
    {
      id: 'resp-003',
      name: 'Fire Brigade Delhi-03',
      callSign: 'FIRE-DL-03',
      role: 'FIRE_RESCUE',
      phone: '+911120000003',
      status: 'AVAILABLE',
      latitude: 28.5900,
      longitude: 77.1800,
    },
  ];

  for (const r of responders) {
    await prisma.responder.upsert({
      where: { id: r.id },
      update: {},
      create: r,
    });
  }

  // Seed demo hazards
  const hazards = [
    {
      id: 'hazard-001',
      type: 'FLOOD',
      title: 'Waterlogging at Minto Road Underpass',
      description: 'Severe waterlogging, 2.5 feet water. Road blocked.',
      latitude: 28.6350,
      longitude: 77.2200,
      radiusMeters: 300,
      severity: 'HIGH',
      status: 'VERIFIED',
      reportedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: 'hazard-002',
      type: 'ROAD_BLOCK',
      title: 'Road Block at India Gate',
      description: 'VIP movement. Road closed to public.',
      latitude: 28.6129,
      longitude: 77.2295,
      radiusMeters: 500,
      severity: 'MEDIUM',
      status: 'VERIFIED',
      reportedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    },
    {
      id: 'hazard-003',
      type: 'FIRE',
      title: 'Fire at Sarojini Nagar Market',
      description: 'Electrical fire, shops affected. Fire brigade on site.',
      latitude: 28.5744,
      longitude: 77.1993,
      radiusMeters: 200,
      severity: 'CRITICAL',
      status: 'PENDING_REVIEW',
      reportedAt: new Date(Date.now() - 30 * 60 * 1000),
    },
  ];

  for (const h of hazards) {
    await prisma.hazard.upsert({
      where: { id: h.id },
      update: {},
      create: h,
    });
  }

  console.log('Seed complete: 3 demo responders, 3 demo hazards.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
