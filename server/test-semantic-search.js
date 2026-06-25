import { PrismaClient } from '@prisma/client';
import { fitnessService } from './src/modules/fitness/fitness.service.js';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function runTest() {
  const user = await prisma.user.findFirst();
  if (!user) return console.log("No user found");
  
  const text = "I went to the gym, then I did some warm up. Then I did bench press with 50 KG for 12 reps. Then again I did one more set with 55 KG for 10 reps. Then again I did one more set with 60 KG for 10 reps. Then I shifted to peck deck fly. There I did 69 KG weight for 12 reps. Then I did one more set with 75 KG for 10 reps, and then the last set with 80 KG for eight reps, then I did incline bench press with 25 KG for 12 reps. Then I did one more set with 27.5 KG for 10 reps, and then I did the last set with 30 KG for 10 reps, then I did Lat pull down with 40 KG for 15 reps. Then I did one more set with 45 KG for 12 reps. Then I did the last set with 50 KG for 10 reps. Then I did barbell bent over rows with 35 KG for 15 reps, then I did one more set with 40 KG for 12 reps. Then I did one more set with 45 KG for 10 reps. Then I did close grip lat pull down with 40 KG for 15 reps. Then I did one more set with 45 KG for 12 reps, and then the last set with 50 KG for 10 reps. Then I did bicep workout. I did bicep curl with 10 KG dumbbells for 15 reps, then I did one more set with 12.5 KG for 12 reps, and then I did one More set with 15 KG for 10 reps. Then I did hammer curls. I did hammer curls with 12.5 KG dumbbells for 15 reps. Then I did with 15 KG dumbbells for 12 ribs, and then I did with 17.5 KG dumbbells for 10 reps, then, I did shrugs with 25 KG dumbbell for 15 reps, and then I did one. More set with 30 KG dumbbell for 12 reps, and then I did with 35 KG dumbbells for 10 reps. The net. Last I did some cardio walking on the treadmill at an inclination of 15% with speed 3 km/h for 15 minutes.";
  
  console.log("Parsing text...");
  try {
    const result = await fitnessService.smartLogWorkout(user.id, text);
    console.log("RESULT EXERCISES:");
    result.exercises.forEach(e => console.log(`- AI Extracted Name: "${e.name}" => Mapped to: "${e.catalogMatch}"`));
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

runTest();
