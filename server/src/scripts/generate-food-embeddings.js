// ══════════════════════════════════════════════════════════════
// Food Embeddings Generator
// ──────────────────────────────────────────────────────────────
// Reads all FoodCatalog items from NeonDB, generates 768-dim
// Gemini text embeddings, and saves them to:
//   server/src/data/food_embeddings.json.gz
//
// Features:
//   - Batch size: 90 items per API call (Gemini batchEmbedContents)
//   - API key rotation on 429 / 503
//   - Incremental: skips items already embedded
//   - _meta tag with version + generatedAt for stale cache detection
//   - Compresses output with Node's built-in zlib (gzip)
//   - Saves intermediate progress every batch (safe to resume)
//
// Usage:
//   node src/scripts/generate-food-embeddings.js
// ══════════════════════════════════════════════════════════════

import fs from 'fs';
import zlib from 'zlib';
import path from 'path';
import { promisify } from 'util';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();
const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

// ── Constants ──────────────────────────────────────────────
const BATCH_SIZE = 90;                // Gemini batchEmbedContents limit
const COOLDOWN_MS = 5000;            // Wait 5s between batches to be safe
const RATE_LIMIT_COOLDOWN_MS = 15000; // Wait 15s when all keys exhausted
const EMBEDDING_MODEL = 'models/gemini-embedding-2';
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const TARGET_DIR = path.resolve(process.cwd(), 'src', 'data');
const TARGET_FILE = path.join(TARGET_DIR, 'food_embeddings.json.gz');
const CURRENT_VERSION = 1;

// ── API Key Management ─────────────────────────────────────
function loadApiKeys() {
  const keyString = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '';
  const keys = keyString.split(',').map(k => k.trim()).filter(Boolean);
  if (keys.length === 0) {
    console.error('[Embeddings] No API keys found. Set GEMINI_API_KEYS or GEMINI_API_KEY in .env');
    process.exit(1);
  }
  console.log(`[Embeddings] Loaded ${keys.length} API key(s).`);
  return keys;
}

// ── Format the embedding text for a food item ──────────────
// This is the "semantic fingerprint" text sent to Gemini.
// Format must be consistent between seeding and query time.
function formatEmbeddingText(food) {
  const aliasList = (food.aliases || []).join(', ') || 'none';
  const mealList = (food.mealTypes || []).join(', ') || 'any meal';
  return [
    `Food: ${food.name}`,
    `Aliases: ${aliasList}`,
    `Category: ${food.category}`,
    `Meals: ${mealList}`,
    `Macros per ${food.servingSize}${food.servingUnit}: ${food.calories} kcal, ${food.protein}g protein, ${food.carbs}g carbs, ${food.fats}g fat`,
  ].join('\n');
}

// ── Load existing embeddings from .gz file ─────────────────
async function loadExistingEmbeddings() {
  if (!fs.existsSync(TARGET_FILE)) {
    console.log('[Embeddings] No existing embeddings file found. Starting fresh.');
    return {};
  }
  try {
    const compressed = fs.readFileSync(TARGET_FILE);
    const decompressed = await gunzip(compressed);
    const parsed = JSON.parse(decompressed.toString('utf8'));
    const count = Object.keys(parsed).filter(k => k !== '_meta').length;
    console.log(`[Embeddings] Loaded ${count} existing embeddings (version: ${parsed._meta?.version ?? 'unknown'}).`);
    return parsed;
  } catch (err) {
    console.warn('[Embeddings] Could not read existing file, starting fresh:', err.message);
    return {};
  }
}

// ── Save embeddings map to .gz file ───────────────────────
async function saveEmbeddings(embeddingsMap) {
  if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
  }
  const json = JSON.stringify(embeddingsMap);
  const compressed = await gzip(json);
  fs.writeFileSync(TARGET_FILE, compressed);
  const sizeMB = (compressed.length / 1024 / 1024).toFixed(2);
  console.log(`[Embeddings] Saved to ${TARGET_FILE} (${sizeMB} MB compressed, ${Object.keys(embeddingsMap).filter(k => k !== '_meta').length} items).`);
}

// ── Embed a batch via Gemini batchEmbedContents ────────────
async function embedBatch(batch, keys, keyIndexRef) {
  const requests = batch.map(food => ({
    model: EMBEDDING_MODEL,
    content: { parts: [{ text: formatEmbeddingText(food) }] },
  }));

  let retryCount = 0;
  const maxRetries = keys.length * 3;

  while (retryCount < maxRetries) {
    const apiKey = keys[keyIndexRef.index];
    const url = `${GEMINI_API_BASE}/${EMBEDDING_MODEL}:batchEmbedContents?key=${apiKey}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requests }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.embeddings && data.embeddings.length === batch.length) {
          return data.embeddings.map(emb => emb.values);
        }
        console.error('[Embeddings] Unexpected response shape:', JSON.stringify(data).slice(0, 200));
        return null;
      }

      const status = response.status;

      if (status === 429 || status === 503) {
        const reason = status === 429 ? 'rate limited' : 'unavailable';
        keyIndexRef.index = (keyIndexRef.index + 1) % keys.length;
        retryCount++;
        const isExhausted = retryCount % keys.length === 0;
        const waitMs = isExhausted ? RATE_LIMIT_COOLDOWN_MS : 2000;
        console.warn(`[Embeddings] Key ${keyIndexRef.index} ${reason}. Rotating. Waiting ${waitMs / 1000}s... (retry ${retryCount}/${maxRetries})`);
        await new Promise(r => setTimeout(r, waitMs));
        continue;
      }

      // Non-retryable error
      const errText = await response.text();
      console.error(`[Embeddings] Non-retryable API error (${status}):`, errText.slice(0, 300));
      return null;

    } catch (err) {
      retryCount++;
      keyIndexRef.index = (keyIndexRef.index + 1) % keys.length;
      console.error(`[Embeddings] Fetch error (retry ${retryCount}):`, err.message);
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  console.error(`[Embeddings] Batch failed after ${maxRetries} retries.`);
  return null;
}

// ── Main ──────────────────────────────────────────────────
async function generateFoodEmbeddings() {
  console.log('[Embeddings] Starting Food Embeddings generation...');
  const keys = loadApiKeys();
  const keyIndexRef = { index: 0 }; // Mutable ref so embedBatch can rotate keys

  // 1. Load all foods from DB
  const foods = await prisma.foodCatalog.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      aliases: true,
      category: true,
      mealTypes: true,
      servingSize: true,
      servingUnit: true,
      calories: true,
      protein: true,
      carbs: true,
      fats: true,
    },
    orderBy: { name: 'asc' },
  });

  console.log(`[Embeddings] Found ${foods.length} foods in database.`);

  if (foods.length === 0) {
    console.warn('[Embeddings] No foods found. Run seed-food-catalog.js first.');
    return;
  }

  // 2. Load existing embeddings (for incremental generation)
  const embeddingsMap = await loadExistingEmbeddings();

  // 3. Find foods that don't have embeddings yet
  const missing = foods.filter(f => !embeddingsMap[f.slug]);
  console.log(`[Embeddings] ${missing.length} foods need embeddings (${foods.length - missing.length} already done).`);

  if (missing.length === 0) {
    console.log('[Embeddings] All embeddings already exist. Nothing to do.');
    // Still update _meta timestamp
    embeddingsMap._meta = {
      version: CURRENT_VERSION,
      generatedAt: new Date().toISOString(),
      totalItems: foods.length,
    };
    await saveEmbeddings(embeddingsMap);
    return;
  }

  // 4. Process in batches
  let totalEmbedded = 0;
  const totalBatches = Math.ceil(missing.length / BATCH_SIZE);

  for (let i = 0; i < missing.length; i += BATCH_SIZE) {
    const batch = missing.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;

    console.log(`[Embeddings] Processing batch ${batchNum}/${totalBatches} (${batch.length} items)...`);

    const vectors = await embedBatch(batch, keys, keyIndexRef);

    if (vectors && vectors.length === batch.length) {
      // Store each embedding keyed by slug
      batch.forEach((food, idx) => {
        embeddingsMap[food.slug] = {
          id: food.id,
          name: food.name,
          vector: vectors[idx],
        };
      });
      totalEmbedded += batch.length;
      console.log(`[Embeddings] Batch ${batchNum} done. Total embedded so far: ${totalEmbedded}/${missing.length}`);
    } else {
      console.error(`[Embeddings] Batch ${batchNum} failed — skipping ${batch.length} foods.`);
    }

    // Save progress after every batch (safe to kill and resume)
    embeddingsMap._meta = {
      version: CURRENT_VERSION,
      generatedAt: new Date().toISOString(),
      totalItems: foods.length,
    };
    await saveEmbeddings(embeddingsMap);

    // Cooldown between batches (skip after last batch)
    if (i + BATCH_SIZE < missing.length) {
      console.log(`[Embeddings] Cooling down for ${COOLDOWN_MS / 1000}s before next batch...`);
      await new Promise(r => setTimeout(r, COOLDOWN_MS));
    }
  }

  console.log(`\n[Embeddings] ✅ Complete! ${totalEmbedded} new embeddings generated.`);
  console.log(`[Embeddings] Total in store: ${Object.keys(embeddingsMap).filter(k => k !== '_meta').length}`);
  console.log(`[Embeddings] File: ${TARGET_FILE}`);
}

// ── Entry point ───────────────────────────────────────────
const isMainModule = process.argv[1]?.replace(/\\/g, '/').includes('generate-food-embeddings');
if (isMainModule) {
  generateFoodEmbeddings()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('[Embeddings] Fatal error:', err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}

export { generateFoodEmbeddings, formatEmbeddingText, loadExistingEmbeddings };
