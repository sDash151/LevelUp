import fs from 'fs';
import path from 'path';

function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

const embsPath = path.resolve(process.cwd(), 'src', 'data', 'exercise_embeddings.json');
const embeddings = JSON.parse(fs.readFileSync(embsPath, 'utf8'));

// Take the first vector as a test (e.g., 3/4 sit-up)
const keys = Object.keys(embeddings);
const testVec = embeddings['bench-press']; // if exists
if (testVec) {
  let bestScore = -1;
  let bestMatch = '';
  for (const key of keys) {
    if (key === 'bench-press') continue;
    const score = cosineSimilarity(testVec, embeddings[key]);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = key;
    }
  }
  console.log('Bench press matches best with:', bestMatch, bestScore);
} else {
  console.log("No bench-press in embeddings map.");
  // Let's just compare the first two
  console.log("Similarity between", keys[0], "and", keys[1], "is", cosineSimilarity(embeddings[keys[0]], embeddings[keys[1]]));
}
