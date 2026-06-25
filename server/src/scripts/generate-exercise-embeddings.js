import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function generateEmbeddings() {
  console.log('[Embeddings] Resuming embeddings for Exercise Catalog...');
  const keyString = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY;
  const keys = keyString ? keyString.split(',').map(k => k.trim()).filter(Boolean) : [];
  
  if (keys.length === 0) {
    console.error('[Embeddings] No API keys found in environment variables.');
    process.exit(1);
  }

  try {
    const exercises = await prisma.exerciseCatalog.findMany({
      select: { name: true, slug: true }
    });

    const targetDir = path.resolve(process.cwd(), 'src', 'data');
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    const targetFile = path.join(targetDir, 'exercise_embeddings.json');
    
    let embeddingsMap = {};
    if (fs.existsSync(targetFile)) {
      embeddingsMap = JSON.parse(fs.readFileSync(targetFile, 'utf8'));
      console.log(`[Embeddings] Loaded ${Object.keys(embeddingsMap).length} existing embeddings.`);
    }

    const missingExercises = exercises.filter(ex => !embeddingsMap[ex.slug]);
    console.log(`[Embeddings] Found ${missingExercises.length} missing exercises. Processing...`);

    if (missingExercises.length === 0) {
       console.log('[Embeddings] All embeddings already exist. Exiting.');
       return;
    }

    const batchSize = 90;
    let keyIndex = 0;

    for (let i = 0; i < missingExercises.length; i += batchSize) {
      const batch = missingExercises.slice(i, i + batchSize);
      
      console.log(`[Embeddings] Embedding batch ${i / batchSize + 1} (${batch.length} items)... using key index ${keyIndex}`);
      
      const requests = batch.map(ex => ({
        model: 'models/gemini-embedding-2',
        content: { parts: [{ text: ex.name }] }
      }));

      let retryCount = 0;
      let success = false;
      while (!success && retryCount < keys.length * 2) {
        const apiKey = keys[keyIndex];
        try {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:batchEmbedContents?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requests })
          });
          
          if (!response.ok) {
             if (response.status === 429 || response.status === 503) {
                console.log(`[Embeddings] Rate limited on key ${keyIndex} (${response.status}). Switching key...`);
                keyIndex = (keyIndex + 1) % keys.length;
                retryCount++;
                continue;
             }
             const errData = await response.text();
             throw new Error(`API Error: ${response.status} ${errData}`);
          }

          const data = await response.json();
          if (data.embeddings && data.embeddings.length === batch.length) {
             data.embeddings.forEach((emb, idx) => {
                embeddingsMap[batch[idx].slug] = emb.values;
             });
             success = true;
          } else {
             console.log("Unexpected response format:", data);
             break;
          }
        } catch (e) {
          console.error(e.message);
          retryCount++;
          keyIndex = (keyIndex + 1) % keys.length;
          await new Promise(r => setTimeout(r, 2000));
        }
      }
      
      if (!success) {
         console.log("[Embeddings] Failed to embed batch after all retries.");
      }
      
      // Sleep a bit just to not slam even with multiple keys
      await new Promise(r => setTimeout(r, 5000));
    }

    fs.writeFileSync(targetFile, JSON.stringify(embeddingsMap));
    console.log(`[Embeddings] Successfully generated and saved ${Object.keys(embeddingsMap).length} embeddings to ${targetFile}`);

  } catch (error) {
    console.error('[Embeddings] Error generating embeddings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (process.argv[1] && process.argv[1].endsWith('generate-exercise-embeddings.js')) {
  generateEmbeddings();
}

export { generateEmbeddings };
