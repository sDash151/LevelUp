import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const userId = 'cmqlkkv0t0000au6okbv1lu13'; // Fixed target user ID

  console.log('Cleaning up existing fitness data...');
  await prisma.fitnessInsight.deleteMany({ where: { userId } });
  await prisma.fitnessMilestone.deleteMany({ where: { userId } });
  await prisma.progressPhoto.deleteMany({ where: { userId } });
  await prisma.bodyMeasurement.deleteMany({ where: { userId } });
  await prisma.bodyMetric.deleteMany({ where: { userId } });
  await prisma.waterLog.deleteMany({ where: { userId } });
  await prisma.mealLog.deleteMany({ where: { userId } });
  await prisma.workoutMemory.deleteMany({ where: { userId } });
  await prisma.workoutSession.deleteMany({ where: { userId } });
  await prisma.workoutPlan.deleteMany({ where: { userId } });
  await prisma.fitnessProfile.deleteMany({ where: { userId } });

  console.log('Creating exact Fitness Profile...');
  await prisma.fitnessProfile.create({
    data: {
      userId,
      weight: 72.4,
      height: 175,
      bodyFat: 14.2,
      dailyCalorieGoal: 2100,
      dailyProteinGoal: 150,
      dailyCarbsGoal: 250,
      dailyFatsGoal: 70,
      dailyWaterGoal: 3.0,
      trainingDays: 6,
    }
  });

  // Calculate dates relative to today
  const today = new Date();
  
  const parseTime = (date, timeStr) => {
    const d = new Date(date);
    if (!timeStr) { d.setHours(12,0,0,0); return d; }
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    d.setHours(hours, minutes, 0, 0);
    return d;
  };

  const d = (offsetDays, timeStr = null) => {
    const date = new Date(today);
    date.setDate(date.getDate() + offsetDays);
    return parseTime(date, timeStr);
  };

  console.log('Creating exact Plan...');
  await prisma.workoutPlan.create({
    data: {
      userId,
      name: 'Strength Building',
      phase: 'Strength Building',
      weekNumber: 3,
      totalWeeks: 8,
      isActive: true,
      schedule: [
        { day: 'monday', type: 'strength', name: 'Push Day', estimatedVolume: 8720, isRest: false, muscleGroups: ['chest', 'shoulders', 'triceps'] },
        { day: 'tuesday', type: 'strength', name: 'Pull Day', estimatedVolume: 9650, isRest: false, muscleGroups: ['back', 'biceps', 'rear_delts'] },
        { day: 'wednesday', type: 'strength', name: 'Leg Day', estimatedVolume: 15230, isRest: false, muscleGroups: ['quadriceps', 'hamstrings', 'glutes'] },
        { day: 'thursday', type: 'rest', name: 'Rest Day', estimatedVolume: 0, isRest: true, muscleGroups: [] },
        { day: 'friday', type: 'strength', name: 'Upper Body', estimatedVolume: 10000, isRest: false, muscleGroups: ['chest', 'back', 'shoulders', 'arms'] },
        { day: 'saturday', type: 'strength', name: 'Lower Body', estimatedVolume: 16000, isRest: false, muscleGroups: ['quadriceps', 'hamstrings', 'calves'] },
        { day: 'sunday', type: 'rest', name: 'Rest Day', estimatedVolume: 0, isRest: true, muscleGroups: [] },
      ]
    }
  });

  console.log('Creating exact Workouts...');
  // As per Image 3, 1, and 5
  // Jun 20 is "Today", so offset 0.
  const specificWorkouts = [
    { offset: 0, name: 'Push Day', type: 'strength', dur: 58, cal: 312, vol: 8720, mg: ['chest', 'shoulders', 'triceps'], time: '10:15 AM',
      exs: [{ name: 'Chest Press', v: 1800, m: 'chest' }, { name: 'Shoulder Press', v: 1500, m: 'shoulders' }, { name: 'Tricep Extension', v: 500, m: 'arms' }] },
    { offset: -1, name: 'HIIT Cardio', type: 'cardio', dur: 32, cal: 289, vol: 0, mg: ['full_body'], time: '7:30 AM', exs: [] },
    { offset: -2, name: 'Leg Day', type: 'strength', dur: 65, cal: 456, vol: 15230, mg: ['quadriceps', 'hamstrings', 'glutes'], time: '6:45 PM',
      exs: [{ name: 'Squats', v: 2500, m: 'legs' }] },
    { offset: -3, name: 'Yoga Flow', type: 'mobility', dur: 45, cal: 185, vol: 0, mg: ['flexibility', 'core'], time: '8:00 AM',
      exs: [{ name: 'Core Work', v: 1000, m: 'core' }] },
    { offset: -4, name: 'Pull Day', type: 'strength', dur: 55, cal: 368, vol: 9650, mg: ['back', 'biceps', 'rear_delts'], time: '6:20 PM',
      exs: [{ name: 'Deadlift', v: 2200, m: 'back' }, { name: 'Bicep Curl', v: 500, m: 'arms' }] },
    // Injecting the 75 min Leg day on Jun 16 (offset -4) to satisfy the "Longest Workout" highlight
    { offset: -4, name: 'Leg Day', type: 'strength', dur: 75, cal: 450, vol: 14000, mg: ['quadriceps', 'hamstrings', 'glutes'], time: '4:00 PM', exs: [] },
    { offset: -5, name: 'Morning Run', type: 'cardio', dur: 40, cal: 342, vol: 0, mg: ['lower_body', 'endurance'], time: '6:10 AM', exs: [] },
  ];

  for (const w of specificWorkouts) {
    const sessionDate = d(w.offset, w.time);
    await prisma.workoutSession.create({
      data: {
        userId,
        name: w.name,
        type: w.type,
        duration: w.dur,
        caloriesBurned: w.cal,
        totalVolume: w.vol,
        muscleGroups: w.mg,
        date: sessionDate,
        completedAt: sessionDate,
        exercises: {
          create: w.exs.map(e => ({ name: e.name, totalVolume: e.v, muscleGroup: e.m, sets: [] }))
        }
      }
    });
  }

  // To reach Total Workouts: 48, Duration: 2538 (42h 18m), Calories: 18560, Volume: 124850
  // Current 7 workouts sum: Duration 370, Calories 2402, Volume 47600
  // Remaining 41 workouts: Duration 2168 (avg ~52), Calories 16158 (avg ~394), Volume 77250 (avg ~1884)
  console.log('Creating older workouts to match exact aggregates...');
  for (let i = 0; i < 41; i++) {
    const isLast = i === 40;
    const dur = isLast ? 2168 - (40 * 52) : 52;
    const cal = isLast ? 16158 - (40 * 394) : 394;
    const vol = isLast ? 77250 - (40 * 1884) : 1884;
    const sessionDate = d(-7 - (i*2), '12:00 PM'); 

    await prisma.workoutSession.create({
      data: {
        userId,
        name: 'General Training',
        type: 'strength',
        duration: dur,
        caloriesBurned: cal,
        totalVolume: vol,
        muscleGroups: ['chest', 'back', 'legs'],
        date: sessionDate,
        completedAt: sessionDate,
        exercises: { create: [{ name: 'Mixed', totalVolume: vol, muscleGroup: 'chest', sets: [] }] }
      }
    });
  }

  console.log('Creating exact Meals...');
  const meals = [
    { type: 'breakfast', time: '8:30 AM', offset: 0, cal: 450, p: 32, c: 45, f: 12, items: [{name: 'Banana', calories: 105, protein: 1, carbs: 27, fats: 0, time: '8:30 AM'}, {name: 'Whey Protein Shake', calories: 120, protein: 24, carbs: 3, fats: 1, time: '7:30 AM'}, {name: 'Oats', calories: 225, protein: 7, carbs: 15, fats: 11, time: '8:30 AM'}] },
    { type: 'lunch', time: '1:00 PM', offset: 0, cal: 520, p: 40, c: 55, f: 15, items: [{name: 'Grilled Chicken Breast', calories: 200, protein: 35, carbs: 0, fats: 4, time: '1:00 PM'}, {name: 'Brown Rice', calories: 150, protein: 3, carbs: 32, fats: 1, time: '1:00 PM'}, {name: 'Veggies', calories: 170, protein: 2, carbs: 23, fats: 10, time: '1:00 PM'}] },
    { type: 'pre_workout', time: '4:30 PM', offset: 0, cal: 200, p: 15, c: 25, f: 5, items: [{name: 'Protein Bar', calories: 200, protein: 15, carbs: 25, fats: 5, time: '4:30 PM'}] },
    { type: 'dinner', time: '8:00 PM', offset: 0, cal: 420, p: 30, c: 35, f: 16, items: [{name: 'Salmon', calories: 250, protein: 22, carbs: 0, fats: 12, time: '8:00 PM'}, {name: 'Quinoa', calories: 170, protein: 8, carbs: 35, fats: 4, time: '8:00 PM'}] },
    { type: 'snacks', time: 'Throughout day', offset: 0, cal: 55, p: 7, c: 10, f: 2, items: [{name: 'Almonds', calories: 55, protein: 7, carbs: 10, fats: 2, time: '2:00 PM'}] },
    // Yesterday's snack to populate "Greek Yogurt 10:30 AM" in Recent Foods without affecting Today
    { type: 'snacks', time: '10:30 AM', offset: -1, cal: 120, p: 12, c: 15, f: 0, items: [{name: 'Greek Yogurt', calories: 120, protein: 12, carbs: 15, fats: 0, time: '10:30 AM'}] },
  ];

  for (const m of meals) {
    await prisma.mealLog.create({
      data: {
        userId,
        mealType: m.type,
        time: m.time,
        date: d(m.offset, m.time !== 'Throughout day' ? m.time : '12:00 PM'),
        totalCalories: m.cal,
        totalProtein: m.p,
        totalCarbs: m.c,
        totalFats: m.f,
        totalFiber: m.type === 'breakfast' ? 8 : m.type === 'lunch' ? 6 : m.type === 'dinner' ? 4 : 0,
        totalSugar: m.type === 'breakfast' ? 18 : m.type === 'lunch' ? 12 : m.type === 'dinner' ? 12 : 0,
        totalSodium: 450,
        foodItems: m.items.map(i => ({ name: i.name, calories: i.calories, protein: i.protein, carbs: i.carbs, fats: i.fats }))
      }
    });
  }

  // Padding older meals to ensure Top Food Sources precisely matches the percentages in image 4
  // We need the top foods to be: Chicken Breast, Brown Rice, Oats, Banana, Almonds
  for (let i = 2; i <= 30; i++) {
    await prisma.mealLog.create({
      data: {
        userId,
        mealType: 'lunch',
        date: d(-i, '1:00 PM'),
        totalCalories: 1080,
        foodItems: [
          { name: 'Chicken Breast', calories: 320 },
          { name: 'Brown Rice', calories: 260 },
          { name: 'Oats', calories: 220 },
          { name: 'Banana', calories: 180 },
          { name: 'Almonds', calories: 100 }
        ]
      }
    });
  }

  console.log('Creating exact Water Logs...');
  await prisma.waterLog.create({
    data: {
      userId,
      amount: 2.1,
      createdAt: d(0),
    }
  });

  console.log('Creating exact Metrics...');
  await prisma.bodyMetric.createMany({
    data: [
      { userId, date: d(-90), weight: 73.0, bodyFat: 15.0, muscleMass: 56.5 },
      { userId, date: d(-60), weight: 72.8, bodyFat: 14.8, muscleMass: 57.0 },
      { userId, date: d(-30), weight: 71.8, bodyFat: 14.5, muscleMass: 57.5 },
      { userId, date: d(0), weight: 72.4, bodyFat: 14.2, muscleMass: 58.1 },
    ]
  });

  console.log('Creating exact Measurements...');
  await prisma.bodyMeasurement.createMany({
    data: [
      { userId, date: d(-30), chest: 100.8, waist: 82.0, arms: 33.2, thighs: 57.4 },
      { userId, date: d(0), chest: 102.0, waist: 81.0, arms: 34.0, thighs: 58.0 },
    ]
  });

  console.log('Creating exact Workout Memories (Top Lifts)...');
  const memories = [
    { name: 'Bench Press', lw: 70, lr: 8, bw: 75, br: 6, bDate: -15 },
    { name: 'Squat', lw: 100, lr: 5, bw: 110, br: 5, bDate: -12 },
    { name: 'Deadlift', lw: 120, lr: 5, bw: 140, br: 1, bDate: -2 }, // To match Performance Highlights "Deadlift 140 kg"
    { name: 'Pull Ups', lw: 10, lr: 6, bw: 12.5, br: 5, bDate: -5 },
    { name: 'Overhead Press', lw: 40, lr: 8, bw: 45, br: 6, bDate: -8 },
    { name: 'Pull-Ups', lw: 0, lr: 12, bw: 0, br: 14, bDate: -3 }, // To match My Plan "Pull Ups 12->14"
    { name: 'Barbell Row', lw: 60, lr: 8, bw: 65, br: 8, bDate: -3 },
    { name: 'Lat Pulldown', lw: 50, lr: 10, bw: 55, br: 10, bDate: -3 },
  ];
  for (const mem of memories) {
    await prisma.workoutMemory.create({
      data: {
        userId,
        exerciseName: mem.name,
        lastWeight: mem.lw,
        lastReps: mem.lr,
        bestWeight: mem.bw,
        bestReps: mem.br,
        lastDate: d(-2),
        bestDate: d(mem.bDate),
      }
    });
  }

  console.log('Creating exact Milestones...');
  await prisma.fitnessMilestone.createMany({
    data: [
      { userId, title: 'Weight below 75 kg', type: 'weight', isAchieved: true, achievedAt: d(-41) },
      { userId, title: 'Bench Press 70 kg', type: 'strength', isAchieved: true, achievedAt: d(-15) },
      { userId, title: '10% Body Fat', type: 'body_fat', isAchieved: false },
      { userId, title: 'Reach 12% Body Fat', type: 'body_fat', isAchieved: false },
    ]
  });

  console.log('Creating Photos...');
  const photos = [];
  for (let i=0; i<12; i++) {
    photos.push({ userId, publicId: 'dummy_'+i, secureUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=150', date: d(-i*2) });
  }
  await prisma.progressPhoto.createMany({ data: photos });

  console.log('Double Checked Exact Seed completed successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
