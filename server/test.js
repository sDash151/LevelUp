import { analyticsService } from './src/modules/analytics/analytics.service.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  try {
    const u = await prisma.user.findFirst();
    const metrics = await analyticsService.getHeroMetrics(u.id);
    console.log("HERO METRICS:", metrics);
    
    const radar = await analyticsService.getLifeRadar(u.id);
    console.log("RADAR:", radar);
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
