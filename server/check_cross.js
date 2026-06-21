import { habitsRepository } from './src/modules/habits/habits.repository.js';
import { fitnessService } from './src/modules/fitness/fitness.service.js';
import { financeService } from './src/modules/finance/finance.service.js';
import { dsaService } from './src/modules/dsa/dsa.service.js';
import { jobsRepository } from './src/modules/jobs/jobs.repository.js';
import { reflectionsService } from './src/modules/reflections/reflections.service.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return console.log('No user');
    const userId = user.id;

    const habitData = await habitsRepository.getRichStats(userId).catch(()=>({}));
    const fitnessData = await fitnessService.getOverview(userId).catch(()=>({}));
    const financeData = await financeService.getOverview(userId).catch(()=>({}));
    const dsaData = await dsaService.getDashboard(userId).catch(()=>({}));
    const jobData = await jobsRepository.getStats(userId).catch(()=>({}));
    const refData = await reflectionsService.getStats(userId).catch(()=>({}));

    console.log('habits:', Object.keys(habitData));
    console.log('fitness:', Object.keys(fitnessData));
    console.log('finance:', Object.keys(financeData), 'finance.kpis:', Object.keys(financeData.kpis || {}));
    console.log('dsa:', Object.keys(dsaData));
    console.log('jobs:', Object.keys(jobData));
    console.log('reflections:', Object.keys(refData));

  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
