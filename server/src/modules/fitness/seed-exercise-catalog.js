import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

function mapMuscleGroup(primaryMuscles) {
  const m = primaryMuscles[0] || '';
  if (['chest'].includes(m)) return 'chest';
  if (['lats', 'middle back', 'lower back'].includes(m)) return 'back';
  if (['quadriceps', 'hamstrings', 'calves', 'glutes', 'adductors', 'abductors'].includes(m)) return 'legs';
  if (['shoulders', 'traps', 'neck'].includes(m)) return 'shoulders';
  if (['biceps', 'triceps', 'forearms'].includes(m)) return 'arms';
  if (['abdominals'].includes(m)) return 'core';
  return 'full_body';
}

function mapEquipment(eq) {
  if (!eq) return null;
  const e = eq.toLowerCase();
  if (e === 'body only') return 'bodyweight';
  if (e === 'kettlebells') return 'dumbbell';
  if (e === 'other') return null;
  if (['barbell', 'dumbbell', 'machine', 'cable', 'bands', 'foam roll', 'medicine ball', 'exercise ball', 'e-z curl bar'].includes(e)) return e;
  return null; // fallback
}

function mapCategory(d) {
  if (d.category === 'cardio') return 'cardio';
  if (d.category === 'stretching') return 'flexibility';
  if (d.category === 'plyometrics') return 'plyometric';
  if (d.mechanic === 'isolation') return 'isolation';
  return 'compound';
}

export async function seedExerciseCatalog() {
  console.log('[Seed] Seeding Exercise Catalog...');
  try {
    const jsonPath = path.resolve(process.cwd(), 'exercises_preview.json');
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

    let created = 0;
    
    // We process in chunks to avoid overwhelming the connection pool
    for (const d of data) {
      if (!d.name) continue;
      
      const slug = d.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const mg = mapMuscleGroup(d.primaryMuscles || []);
      const cat = mapCategory(d);
      
      await prisma.exerciseCatalog.upsert({
        where: { slug },
        update: {
          name: d.name,
          muscleGroup: mg,
          category: cat,
          isCompound: d.mechanic === 'compound',
          equipmentType: mapEquipment(d.equipment),
          difficulty: d.level || 'intermediate',
          primaryMuscles: d.primaryMuscles || [],
          secondaryMuscles: d.secondaryMuscles || [],
          instructions: d.instructions || []
        },
        create: {
          name: d.name,
          slug,
          muscleGroup: mg,
          category: cat,
          isCompound: d.mechanic === 'compound',
          equipmentType: mapEquipment(d.equipment),
          difficulty: d.level || 'intermediate',
          primaryMuscles: d.primaryMuscles || [],
          secondaryMuscles: d.secondaryMuscles || [],
          instructions: d.instructions || []
        }
      });
      created++;
      if (created % 100 === 0) console.log(`[Seed] Progress: ${created} / ${data.length}`);
    }
    
    console.log(`[Seed] Successfully seeded ${created} exercises!`);
  } catch (error) {
    console.error('[Seed] Error seeding exercises:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Allow running directly
if (process.argv[1] && process.argv[1].endsWith('seed-exercise-catalog.js')) {
  seedExerciseCatalog();
}
