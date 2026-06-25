import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import { v2 as cloudinary } from 'cloudinary';

// Parse the dedicated URL explicitly
const urlRegex = /cloudinary:\/\/([^:]+):([^@]+)@(.+)/;
const match = (process.env.EXERCISES_CLOUDINARY_URL || "").match(urlRegex);
if (match) {
  cloudinary.config({
    api_key: match[1],
    api_secret: match[2],
    cloud_name: match[3]
  });
} else {
  console.error("Invalid or missing EXERCISES_CLOUDINARY_URL in .env");
  process.exit(1);
}

const prisma = new PrismaClient();

async function run() {
  const jsonPath = path.join(__dirname, '../exercises_preview.json');
  const rawData = await fs.readFile(jsonPath, 'utf8');
  const exercises = JSON.parse(rawData);
  
  console.log(`Loaded ${exercises.length} exercises from JSON.`);

  // Test mode: change to false to process all
  const TEST_MODE = false;
  const exercisesToProcess = TEST_MODE ? exercises.slice(0, 3) : exercises;

  for (const ex of exercisesToProcess) {
    if (!ex.images || ex.images.length === 0) continue;

    console.log(`\nProcessing: ${ex.name} (${ex.images.length} images)`);
    const newImageUrls = [];

    for (const imagePath of ex.images) {
      const githubUrl = `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${imagePath}`;
      
      try {
        // Upload directly from the GitHub URL to Cloudinary
        const result = await cloudinary.uploader.upload(githubUrl, {
          folder: "level_up_exercises"
        });
        newImageUrls.push(result.secure_url);
        console.log(`  -> Uploaded successfully: ${result.secure_url}`);
      } catch (err) {
        console.error(`  -> Failed to upload ${githubUrl}:`, err.message);
      }
    }

    const slug = ex.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    if (newImageUrls.length > 0) {
      try {
        await prisma.exerciseCatalog.update({
          where: { slug },
          data: { images: newImageUrls }
        });
        console.log(`  -> DB Updated successfully for ${ex.name}.`);
      } catch (dbErr) {
        console.error(`  -> DB Update Failed for ${ex.name}:`, dbErr.message);
      }
    }
  }

  console.log('\nUpload process completed.');
  await prisma.$disconnect();
}

run();
