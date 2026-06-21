import { PrismaClient } from '@prisma/client';
import { subDays, format } from 'date-fns';

const prisma = new PrismaClient();
const EMAIL = 'souravdilu78090@gmail.com';
const DAYS = 120; // Huge amount of data spanning 4 months

async function main() {
  console.log(`Starting dynamic high-diversity seed for ${EMAIL}...`);

  let user = await prisma.user.findUnique({ where: { email: EMAIL } });
  if (!user) {
    user = await prisma.user.create({ data: { name: 'Sourav Dash', email: EMAIL, passwordHash: '$2a$12$PLACEHOLDER' } });
  }

  console.log('Cleaning existing fitness data...');
  await prisma.fitnessProfile.deleteMany({ where: { userId: user.id } });
  await prisma.workoutSession.deleteMany({ where: { userId: user.id } });
  await prisma.workoutPlan.deleteMany({ where: { userId: user.id } });
  await prisma.workoutMemory.deleteMany({ where: { userId: user.id } });
  await prisma.mealLog.deleteMany({ where: { userId: user.id } });
  await prisma.waterLog.deleteMany({ where: { userId: user.id } });
  await prisma.bodyMetric.deleteMany({ where: { userId: user.id } });
  await prisma.bodyMeasurement.deleteMany({ where: { userId: user.id } });
  await prisma.progressPhoto.deleteMany({ where: { userId: user.id } });
  await prisma.fitnessMilestone.deleteMany({ where: { userId: user.id } });
  
  // STRICLY NOT GENERATING AI DATA:
  await prisma.fitnessInsight.deleteMany({ where: { userId: user.id } });

  console.log('Creating Profile & Plan...');
  await prisma.fitnessProfile.create({
    data: {
      userId: user.id, height: 175, weight: 70.5, bodyFat: 14.5, goal: 'hypertrophy',
      trainingDays: 5, splitType: 'push_pull_legs', experienceLevel: 'advanced',
      dailyCalorieGoal: 2850, dailyProteinGoal: 160, dailyCarbsGoal: 320, dailyFatsGoal: 85, dailyWaterGoal: 3.5,
    }
  });

  const staticSchedule = [
    { day: 'monday', type: 'rest', name: 'Rest Day', estimatedVolume: 0, isRest: true, muscleGroups: [], exercises: [] },
    { day: 'tuesday', type: 'strength', name: 'Pull Day', estimatedVolume: 9500, isRest: false, muscleGroups: ['back', 'biceps', 'rear_delts'], exercises: [{name: 'Pull Ups', sets: 4}, {name: 'Barbell Row', sets: 4}, {name: 'Lat Pulldown', sets: 3}, {name: 'Face Pulls', sets: 3}, {name: 'Bicep Curls', sets: 3}, {name: 'Hammer Curls', sets: 3}] },
    { day: 'wednesday', type: 'strength', name: 'Leg Day', estimatedVolume: 14500, isRest: false, muscleGroups: ['quadriceps', 'hamstrings', 'glutes'], exercises: [{name: 'Squats', sets: 4}, {name: 'Leg Press', sets: 3}, {name: 'Calf Raises', sets: 4}, {name: 'Leg Extensions', sets: 3}, {name: 'Hamstring Curls', sets: 3}] },
    { day: 'thursday', type: 'rest', name: 'Rest Day', estimatedVolume: 0, isRest: true, muscleGroups: [], exercises: [] },
    { day: 'friday', type: 'strength', name: 'Upper Body', estimatedVolume: 10500, isRest: false, muscleGroups: ['chest', 'back', 'shoulders', 'arms'], exercises: [{name: 'Incline DB Press', sets: 3}, {name: 'Lat Pulldown', sets: 3}, {name: 'Overhead Press', sets: 3}, {name: 'Face Pulls', sets: 3}, {name: 'Bicep Curls', sets: 3}, {name: 'Tricep Extensions', sets: 3}] },
    { day: 'saturday', type: 'strength', name: 'Lower Body', estimatedVolume: 15500, isRest: false, muscleGroups: ['quadriceps', 'hamstrings', 'calves'], exercises: [{name: 'Deadlift', sets: 3}, {name: 'Leg Press', sets: 3}, {name: 'Leg Extensions', sets: 3}, {name: 'Calf Raises', sets: 3}, {name: 'Lunges', sets: 3}] },
    { day: 'sunday', type: 'strength', name: 'Push Day', estimatedVolume: 8700, isRest: false, muscleGroups: ['chest', 'shoulders', 'triceps'], exercises: [{name: 'Bench Press', sets: 4}, {name: 'Overhead Press', sets: 3}, {name: 'Incline DB Press', sets: 3}, {name: 'Lateral Raises', sets: 4}, {name: 'Tricep Extensions', sets: 3}, {name: 'Cable Crossovers', sets: 3}] },
  ];

  await prisma.workoutPlan.create({
    data: {
      userId: user.id, name: 'Strength Building', phase: 'hypertrophy', weekNumber: 4, totalWeeks: 12, isActive: true,
      schedule: staticSchedule
    }
  });

  console.log('Generating exactly ' + DAYS + ' days of intense diverse history...');
  
  const today = new Date();
  const workoutsToInsert = [];
  const mealsToInsert = [];
  const waterToInsert = [];
  const metricsToInsert = [];

  // Track lift progression specifically
  let bench = 60, squat = 80, deadlift = 100, pullups = 8, row = 50, latpulldown = 45;

  for (let i = DAYS; i >= 0; i--) {
    const d = subDays(today, i);
    const dayOfWeek = format(d, 'EEEE').toLowerCase();
    
    // Very slow steady progression
    if (i % 14 === 0) {
      bench += 2.5; squat += 5; deadlift += 5; pullups += 1; row += 2.5; latpulldown += 2.5;
    }

    const scheduledWorkout = staticSchedule.find(s => s.day === dayOfWeek);

    // Occasional skipped workout to make it realistic (10% chance)
    const missedWorkout = Math.random() < 0.1;

    if (!scheduledWorkout.isRest && !missedWorkout) {
      let duration = Math.floor(Math.random() * 25) + 45; // 45 to 70 mins
      let caloriesBurned = Math.floor(Math.random() * 150) + 300; // 300 to 450 kcal
      let volVariance = Math.floor(Math.random() * 2000) - 1000;
      let totalVolume = scheduledWorkout.estimatedVolume + volVariance;

      let exercises = [];
      if (scheduledWorkout.name === 'Push Day' || scheduledWorkout.name === 'Upper Body') {
        exercises = [
          { name: 'Bench Press', m: 'chest', v: bench * 25, s: [{r: 8, w: bench}, {r: 8, w: bench}, {r: 7, w: bench}] },
          { name: 'Overhead Press', m: 'shoulders', v: 2000, s: [{r: 8, w: 45}, {r: 8, w: 45}] }
        ];
      } else if (scheduledWorkout.name === 'Pull Day') {
        exercises = [
          { name: 'Deadlift', m: 'back', v: deadlift * 15, s: [{r: 5, w: deadlift}, {r: 5, w: deadlift}, {r: 5, w: deadlift}] },
          { name: 'Pull Ups', m: 'back', v: pullups * 250, s: [{r: pullups, w: 0}, {r: pullups-1, w: 0}] },
          { name: 'Barbell Row', m: 'back', v: row * 24, s: [{r: 8, w: row}, {r: 8, w: row}, {r: 8, w: row}] },
          { name: 'Lat Pulldown', m: 'back', v: latpulldown * 30, s: [{r: 10, w: latpulldown}, {r: 10, w: latpulldown}, {r: 10, w: latpulldown}] }
        ];
      } else if (scheduledWorkout.name === 'Leg Day' || scheduledWorkout.name === 'Lower Body') {
        exercises = [
          { name: 'Squats', m: 'legs', v: squat * 24, s: [{r: 8, w: squat}, {r: 8, w: squat}, {r: 8, w: squat}] },
          { name: 'Leg Press', m: 'legs', v: 4000, s: [{r: 10, w: 120}, {r: 10, w: 120}] }
        ];
      }

      workoutsToInsert.push({
        userId: user.id,
        name: scheduledWorkout.name,
        type: scheduledWorkout.type,
        duration,
        caloriesBurned,
        totalVolume,
        muscleGroups: scheduledWorkout.muscleGroups,
        date: d,
        completedAt: new Date(d.setHours(18, 0, 0, 0)),
        exercisesData: exercises
      });
    }

    // Diverse Meals
    const bfastOptions = [
      { n: 'Oats with Whey', c: 450, p: 35, cb: 50, f: 10 },
      { n: 'Eggs and Toast', c: 420, p: 25, cb: 35, f: 18 },
      { n: 'Greek Yogurt & Berries', c: 350, p: 22, cb: 40, f: 5 }
    ];
    const lunchOptions = [
      { n: 'Grilled Chicken Bowl', c: 750, p: 50, cb: 80, f: 15 },
      { n: 'Turkey Wrap', c: 600, p: 40, cb: 65, f: 20 },
      { n: 'Steak and Rice', c: 850, p: 45, cb: 90, f: 25 }
    ];
    const dinnerOptions = [
      { n: 'Salmon & Sweet Potato', c: 680, p: 40, cb: 55, f: 22 },
      { n: 'Pasta with Ground Beef', c: 800, p: 45, cb: 95, f: 20 },
      { n: 'Chicken Salad', c: 500, p: 45, cb: 20, f: 25 }
    ];
    
    const b = bfastOptions[Math.floor(Math.random()*bfastOptions.length)];
    const l = lunchOptions[Math.floor(Math.random()*lunchOptions.length)];
    const dn = dinnerOptions[Math.floor(Math.random()*dinnerOptions.length)];

    mealsToInsert.push({
      userId: user.id, mealType: 'breakfast', totalCalories: b.c, totalProtein: b.p, totalCarbs: b.cb, totalFats: b.f,
      date: d, time: '08:00 AM', foodItems: [{ name: b.n, calories: b.c, protein: b.p, carbs: b.cb, fats: b.f }]
    });
    mealsToInsert.push({
      userId: user.id, mealType: 'lunch', totalCalories: l.c, totalProtein: l.p, totalCarbs: l.cb, totalFats: l.f,
      date: d, time: '01:30 PM', foodItems: [{ name: l.n, calories: l.c, protein: l.p, carbs: l.cb, fats: l.f }]
    });
    mealsToInsert.push({
      userId: user.id, mealType: 'dinner', totalCalories: dn.c, totalProtein: dn.p, totalCarbs: dn.cb, totalFats: dn.f,
      date: d, time: '08:00 PM', foodItems: [{ name: dn.n, calories: dn.c, protein: dn.p, carbs: dn.cb, fats: dn.f }]
    });

    // Water
    for(let w=0; w<(Math.floor(Math.random()*3)+3); w++) {
      waterToInsert.push({ userId: user.id, amount: 0.6, createdAt: new Date(d.setHours(9 + w*3, 0, 0, 0)) });
    }

    // Body Metrics every week
    if (i % 7 === 0) {
      metricsToInsert.push({
        userId: user.id, date: d, weight: 75 - ((DAYS-i)/DAYS)*4.5, bodyFat: 18 - ((DAYS-i)/DAYS)*3.5, muscleMass: 55 + ((DAYS-i)/DAYS)*3
      });
    }
  }

  // Insert Workouts
  for (const w of workoutsToInsert) {
    await prisma.workoutSession.create({
      data: {
        userId: w.userId, name: w.name, type: w.type, duration: w.duration, caloriesBurned: w.caloriesBurned,
        totalVolume: w.totalVolume, muscleGroups: w.muscleGroups, date: w.date, completedAt: w.completedAt,
        exercises: {
          create: w.exercisesData.map(e => ({ name: e.name, muscleGroup: e.m, totalVolume: e.v, sets: e.s }))
        }
      }
    });
  }

  // Insert Arrays directly
  await prisma.mealLog.createMany({ data: mealsToInsert.map(m => ({ ...m, foodItems: m.foodItems })) });
  await prisma.waterLog.createMany({ data: waterToInsert });
  await prisma.bodyMetric.createMany({ data: metricsToInsert });

  // Memories
  await prisma.workoutMemory.createMany({
    data: [
      { userId: user.id, exerciseName: 'Bench Press', lastWeight: bench, lastReps: 7, bestWeight: bench, bestReps: 8, lastDate: today, bestDate: today },
      { userId: user.id, exerciseName: 'Squats', lastWeight: squat, lastReps: 8, bestWeight: squat, bestReps: 8, lastDate: today, bestDate: today },
      { userId: user.id, exerciseName: 'Pull Ups', lastWeight: 0, lastReps: pullups, bestWeight: 0, bestReps: pullups, lastDate: today, bestDate: today },
      { userId: user.id, exerciseName: 'Barbell Row', lastWeight: row, lastReps: 8, bestWeight: row, bestReps: 8, lastDate: today, bestDate: today },
      { userId: user.id, exerciseName: 'Lat Pulldown', lastWeight: latpulldown, lastReps: 10, bestWeight: latpulldown, bestReps: 10, lastDate: today, bestDate: today }
    ]
  });

  console.log('✅ Diverse Seeding complete! Database is fully populated with rich realistic history. AI fields left strictly empty.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
