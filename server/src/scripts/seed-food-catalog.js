// ══════════════════════════════════════════════════════════════
// Semantic Food Catalog Seed Script
// Populates FoodCatalog table with normalizedName, slug, aliases,
// mealTypes, unitGramMap, and isVerified flags.
// ══════════════════════════════════════════════════════════════

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

// ── Utility helpers ──────────────────────────────────────────
function toSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')    // remove special chars
    .replace(/\s+/g, '-')             // spaces to hyphens
    .replace(/-+/g, '-')              // collapse multiple hyphens
    .replace(/^-|-$/g, '');           // trim leading/trailing hyphens
}

function toNormalizedName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')    // replace special chars with space
    .replace(/\s+/g, ' ')             // collapse whitespace
    .trim();
}

// ── Curated Food Database ────────────────────────────────────
// Fields:
//   name            - Display name
//   aliases         - Alternative names users might say
//   category        - macronutrient category
//   mealTypes       - which meals this food fits
//   servingUnit     - primary unit (g, ml, piece, bowl, etc.)
//   servingSize     - grams per 1 unit of servingUnit
//   unitGramMap     - maps unit names to grams for quantity scaling
//   calories/protein/carbs/fats/fiber - per servingSize grams
//   source          - data origin
//   isVerified      - true = curated, trusted macro data
//   -- Legacy business fields (preserved for existing AI planner) --
//   estimatedPricePerServing, priceTier, availabilityScore,
//   cookingDifficulty, dietType

const FOODS = [
  // ═══ INDIAN STAPLES ═══
  {
    name: 'Roti (Whole Wheat)', aliases: ['chapati', 'phulka', 'wheat roti', 'atta roti'],
    category: 'carb', mealTypes: ['breakfast', 'lunch', 'dinner'],
    servingUnit: 'piece', servingSize: 40, unitGramMap: { piece: 40, roti: 40 },
    calories: 97, protein: 3.5, carbs: 18, fats: 1, fiber: 2.5,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 3, priceTier: 'budget', availabilityScore: 10, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'],
  },
  {
    name: 'Rice (Cooked)', aliases: ['steamed rice', 'boiled rice', 'chawal', 'plain rice', 'white rice'],
    category: 'carb', mealTypes: ['lunch', 'dinner'],
    servingUnit: 'cup', servingSize: 200, unitGramMap: { cup: 200, bowl: 200, plate: 400, g: 1 },
    calories: 260, protein: 5.4, carbs: 56, fats: 0.6, fiber: 0.6,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 5, priceTier: 'budget', availabilityScore: 10, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'],
  },
  {
    name: 'Dal (Toor/Arhar)', aliases: ['toor dal', 'arhar dal', 'yellow dal', 'split pigeon peas'],
    category: 'protein', mealTypes: ['lunch', 'dinner'],
    servingUnit: 'bowl', servingSize: 150, unitGramMap: { bowl: 150, cup: 150, g: 1 },
    calories: 165, protein: 11.25, carbs: 27, fats: 1.5, fiber: 4,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 8, priceTier: 'budget', availabilityScore: 10, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'],
  },
  {
    name: 'Moong Dal', aliases: ['moong daal', 'split moong', 'green gram dal', 'yellow moong'],
    category: 'protein', mealTypes: ['lunch', 'dinner', 'snack'],
    servingUnit: 'bowl', servingSize: 150, unitGramMap: { bowl: 150, cup: 150, g: 1 },
    calories: 150, protein: 12, carbs: 24, fats: 0.75, fiber: 3,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 8, priceTier: 'budget', availabilityScore: 9, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'],
  },
  {
    name: 'Paneer', aliases: ['cottage cheese', 'indian cottage cheese', 'panir'],
    category: 'protein', mealTypes: ['breakfast', 'lunch', 'dinner', 'snack'],
    servingUnit: 'g', servingSize: 100, unitGramMap: { g: 1, piece: 30, cube: 20, bowl: 150 },
    calories: 265, protein: 18, carbs: 3.6, fats: 20, fiber: 0,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 30, priceTier: 'medium', availabilityScore: 9, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg'],
  },
  {
    name: 'Curd (Dahi)', aliases: ['yogurt', 'dahi', 'curd', 'plain yogurt', 'homemade curd'],
    category: 'dairy', mealTypes: ['breakfast', 'lunch', 'dinner', 'snack'],
    servingUnit: 'bowl', servingSize: 150, unitGramMap: { bowl: 150, cup: 150, g: 1 },
    calories: 90, protein: 4.5, carbs: 7.5, fats: 4.5, fiber: 0,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 8, priceTier: 'budget', availabilityScore: 10, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg'],
  },
  {
    name: 'Poha', aliases: ['flattened rice', 'beaten rice', 'chira', 'aval'],
    category: 'carb', mealTypes: ['breakfast', 'snack'],
    servingUnit: 'bowl', servingSize: 150, unitGramMap: { bowl: 150, plate: 200, g: 1 },
    calories: 165, protein: 3.75, carbs: 34.5, fats: 1.5, fiber: 1.5,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 6, priceTier: 'budget', availabilityScore: 9, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'],
  },
  {
    name: 'Upma', aliases: ['semolina upma', 'rava upma', 'suji upma'],
    category: 'carb', mealTypes: ['breakfast'],
    servingUnit: 'bowl', servingSize: 150, unitGramMap: { bowl: 150, plate: 200, g: 1 },
    calories: 203, protein: 4.5, carbs: 33, fats: 6, fiber: 2,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 7, priceTier: 'budget', availabilityScore: 9, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'],
  },
  {
    name: 'Idli', aliases: ['idly', 'steamed rice cake', 'south indian idli'],
    category: 'carb', mealTypes: ['breakfast'],
    servingUnit: 'piece', servingSize: 40, unitGramMap: { piece: 40, idli: 40 },
    calories: 65, protein: 2, carbs: 13, fats: 0.5, fiber: 0.5,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 4, priceTier: 'budget', availabilityScore: 8, cookingDifficulty: 'full', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'],
  },
  {
    name: 'Dosa (Plain)', aliases: ['plain dosa', 'crispy dosa', 'rice crepe', 'dosai'],
    category: 'carb', mealTypes: ['breakfast'],
    servingUnit: 'piece', servingSize: 100, unitGramMap: { piece: 100, dosa: 100 },
    calories: 170, protein: 4, carbs: 28, fats: 5, fiber: 1,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 8, priceTier: 'budget', availabilityScore: 8, cookingDifficulty: 'full', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'],
  },
  {
    name: 'Paratha (Plain)', aliases: ['plain paratha', 'tawa paratha', 'wheat paratha', 'layered flatbread'],
    category: 'carb', mealTypes: ['breakfast', 'lunch'],
    servingUnit: 'piece', servingSize: 60, unitGramMap: { piece: 60, paratha: 60 },
    calories: 180, protein: 4, carbs: 24, fats: 8, fiber: 2,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 6, priceTier: 'budget', availabilityScore: 10, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'],
  },
  {
    name: 'Rajma (Kidney Beans)', aliases: ['rajma', 'red kidney beans', 'rajma dal'],
    category: 'protein', mealTypes: ['lunch', 'dinner'],
    servingUnit: 'bowl', servingSize: 150, unitGramMap: { bowl: 150, cup: 150, g: 1 },
    calories: 191, protein: 13, carbs: 33, fats: 0.75, fiber: 8,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 10, priceTier: 'budget', availabilityScore: 9, cookingDifficulty: 'full', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'],
  },
  {
    name: 'Chole (Chickpea Curry)', aliases: ['chana masala', 'chole masala', 'chickpea curry', 'kabuli chana'],
    category: 'protein', mealTypes: ['lunch', 'dinner'],
    servingUnit: 'bowl', servingSize: 150, unitGramMap: { bowl: 150, cup: 150, g: 1 },
    calories: 203, protein: 10.5, carbs: 30, fats: 4.5, fiber: 7,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 10, priceTier: 'budget', availabilityScore: 9, cookingDifficulty: 'full', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'],
  },
  {
    name: 'Aloo Gobi', aliases: ['potato cauliflower curry', 'aloo phool gobi', 'dry aloo gobi'],
    category: 'mixed-meal', mealTypes: ['lunch', 'dinner'],
    servingUnit: 'bowl', servingSize: 150, unitGramMap: { bowl: 150, plate: 200, g: 1 },
    calories: 150, protein: 3.75, carbs: 18, fats: 7.5, fiber: 4,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 8, priceTier: 'budget', availabilityScore: 9, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'],
  },
  {
    name: 'Sambar', aliases: ['south indian sambar', 'vegetable sambar', 'lentil stew'],
    category: 'protein', mealTypes: ['breakfast', 'lunch', 'dinner'],
    servingUnit: 'bowl', servingSize: 150, unitGramMap: { bowl: 150, cup: 150, g: 1 },
    calories: 120, protein: 6, carbs: 18, fats: 3, fiber: 4,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 7, priceTier: 'budget', availabilityScore: 8, cookingDifficulty: 'full', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'],
  },
  {
    name: 'Raita', aliases: ['cucumber raita', 'boondi raita', 'curd dip', 'yogurt dip'],
    category: 'dairy', mealTypes: ['lunch', 'dinner'],
    servingUnit: 'bowl', servingSize: 100, unitGramMap: { bowl: 100, cup: 100, g: 1 },
    calories: 55, protein: 3, carbs: 5, fats: 3, fiber: 0.5,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 6, priceTier: 'budget', availabilityScore: 10, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg'],
  },
  {
    name: 'Palak Paneer', aliases: ['spinach cottage cheese', 'palak panir', 'saag paneer'],
    category: 'protein', mealTypes: ['lunch', 'dinner'],
    servingUnit: 'bowl', servingSize: 150, unitGramMap: { bowl: 150, plate: 200, g: 1 },
    calories: 285, protein: 15, carbs: 9, fats: 21, fiber: 3,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 25, priceTier: 'medium', availabilityScore: 8, cookingDifficulty: 'full', dietType: ['veg', 'eggetarian', 'non_veg'],
  },
  {
    name: 'Mixed Vegetable Curry', aliases: ['veg curry', 'sabzi', 'mixed sabzi', 'vegetable curry'],
    category: 'mixed-meal', mealTypes: ['lunch', 'dinner'],
    servingUnit: 'bowl', servingSize: 150, unitGramMap: { bowl: 150, plate: 200, g: 1 },
    calories: 128, protein: 4.5, carbs: 15, fats: 6, fiber: 4,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 10, priceTier: 'budget', availabilityScore: 9, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'],
  },
  {
    name: 'Khichdi', aliases: ['kitchdi', 'rice dal khichdi', 'moong khichdi', 'comfort khichdi'],
    category: 'mixed-meal', mealTypes: ['lunch', 'dinner'],
    servingUnit: 'bowl', servingSize: 200, unitGramMap: { bowl: 200, plate: 300, g: 1 },
    calories: 260, protein: 10, carbs: 48, fats: 4, fiber: 4,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 6, priceTier: 'budget', availabilityScore: 10, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'],
  },
  {
    name: 'Chapati (Multigrain)', aliases: ['multigrain roti', 'mixed flour chapati', 'multi grain chapati'],
    category: 'carb', mealTypes: ['breakfast', 'lunch', 'dinner'],
    servingUnit: 'piece', servingSize: 40, unitGramMap: { piece: 40, roti: 40, chapati: 40 },
    calories: 100, protein: 4, carbs: 17, fats: 2, fiber: 3,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 5, priceTier: 'budget', availabilityScore: 8, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'],
  },
  {
    name: 'Besan Chilla', aliases: ['chickpea flour crepe', 'besan chila', 'gram flour pancake', 'chilla'],
    category: 'protein', mealTypes: ['breakfast', 'snack'],
    servingUnit: 'piece', servingSize: 60, unitGramMap: { piece: 60, chilla: 60 },
    calories: 130, protein: 7, carbs: 15, fats: 5, fiber: 2.5,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 5, priceTier: 'budget', availabilityScore: 8, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'],
  },
  {
    name: 'Lassi (Sweet)', aliases: ['sweet lassi', 'mango lassi', 'yogurt drink', 'dahi lassi'],
    category: 'dairy', mealTypes: ['breakfast', 'snack'],
    servingUnit: 'glass', servingSize: 200, unitGramMap: { glass: 200, ml: 1, cup: 200 },
    calories: 135, protein: 5, carbs: 20, fats: 4, fiber: 0,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 15, priceTier: 'budget', availabilityScore: 9, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg'],
  },
  {
    name: 'Buttermilk (Chaas)', aliases: ['chaas', 'masala chaas', 'salted lassi', 'diluted curd'],
    category: 'dairy', mealTypes: ['lunch', 'snack'],
    servingUnit: 'glass', servingSize: 200, unitGramMap: { glass: 200, ml: 1, cup: 200 },
    calories: 30, protein: 2, carbs: 4, fats: 1, fiber: 0,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 5, priceTier: 'budget', availabilityScore: 9, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg'],
  },
  {
    name: 'Masoor Dal', aliases: ['red lentil', 'red dal', 'masur dal', 'pink lentil'],
    category: 'protein', mealTypes: ['lunch', 'dinner'],
    servingUnit: 'bowl', servingSize: 150, unitGramMap: { bowl: 150, cup: 150, g: 1 },
    calories: 158, protein: 13.5, carbs: 22.5, fats: 1.2, fiber: 5,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 7, priceTier: 'budget', availabilityScore: 10, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'],
  },
  {
    name: 'Chana Dal', aliases: ['split chickpea dal', 'bengal gram dal', 'yellow split peas'],
    category: 'protein', mealTypes: ['lunch', 'dinner'],
    servingUnit: 'bowl', servingSize: 150, unitGramMap: { bowl: 150, cup: 150, g: 1 },
    calories: 195, protein: 12, carbs: 30, fats: 3, fiber: 6,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 7, priceTier: 'budget', availabilityScore: 9, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'],
  },
  {
    name: 'Egg Bhurji', aliases: ['scrambled eggs indian style', 'anda bhurji', 'masala scrambled eggs'],
    category: 'protein', mealTypes: ['breakfast', 'dinner', 'snack'],
    servingUnit: 'plate', servingSize: 100, unitGramMap: { plate: 100, g: 1, bowl: 100 },
    calories: 150, protein: 12, carbs: 3, fats: 10, fiber: 0.5,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 15, priceTier: 'budget', availabilityScore: 9, cookingDifficulty: 'basic', dietType: ['eggetarian', 'non_veg'],
  },
  {
    name: 'Egg Curry', aliases: ['anda curry', 'egg masala', 'anda masala', 'boiled egg curry'],
    category: 'protein', mealTypes: ['lunch', 'dinner'],
    servingUnit: 'bowl', servingSize: 150, unitGramMap: { bowl: 150, plate: 200, g: 1 },
    calories: 195, protein: 15, carbs: 7.5, fats: 12, fiber: 1,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 15, priceTier: 'budget', availabilityScore: 9, cookingDifficulty: 'basic', dietType: ['eggetarian', 'non_veg'],
  },
  {
    name: 'Paneer Tikka', aliases: ['tandoori paneer', 'grilled paneer', 'paneer tikka starter'],
    category: 'protein', mealTypes: ['snack', 'dinner'],
    servingUnit: 'g', servingSize: 100, unitGramMap: { g: 1, piece: 30, plate: 150 },
    calories: 220, protein: 15, carbs: 5, fats: 16, fiber: 1,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 30, priceTier: 'medium', availabilityScore: 7, cookingDifficulty: 'full', dietType: ['veg', 'eggetarian', 'non_veg'],
  },

  // ═══ FITNESS FOODS ═══
  {
    name: 'Chicken Breast (Grilled)', aliases: ['grilled chicken', 'chicken breast', 'boneless chicken', 'lean chicken'],
    category: 'protein', mealTypes: ['lunch', 'dinner'],
    servingUnit: 'g', servingSize: 100, unitGramMap: { g: 1, piece: 120, breast: 150 },
    calories: 165, protein: 31, carbs: 0, fats: 3.6, fiber: 0,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 25, priceTier: 'medium', availabilityScore: 8, cookingDifficulty: 'basic', dietType: ['non_veg', 'eggetarian'],
  },
  {
    name: 'Eggs (Whole Boiled)', aliases: ['boiled egg', 'hard boiled egg', 'anda', 'whole egg'],
    category: 'protein', mealTypes: ['breakfast', 'snack'],
    servingUnit: 'piece', servingSize: 50, unitGramMap: { piece: 50, egg: 50 },
    calories: 70, protein: 6, carbs: 0.6, fats: 5, fiber: 0,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 8, priceTier: 'budget', availabilityScore: 10, cookingDifficulty: 'basic', dietType: ['eggetarian', 'non_veg'],
  },
  {
    name: 'Egg Whites', aliases: ['egg white', 'albumen', 'white of egg'],
    category: 'protein', mealTypes: ['breakfast', 'snack'],
    servingUnit: 'g', servingSize: 100, unitGramMap: { g: 1, piece: 33 },
    calories: 52, protein: 11, carbs: 0.7, fats: 0.2, fiber: 0,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 12, priceTier: 'budget', availabilityScore: 10, cookingDifficulty: 'basic', dietType: ['eggetarian', 'non_veg'],
  },
  {
    name: 'Oats', aliases: ['rolled oats', 'oatmeal', 'quaker oats', 'porridge oats', 'oat flakes'],
    category: 'carb', mealTypes: ['breakfast'],
    servingUnit: 'g', servingSize: 40, unitGramMap: { g: 1, cup: 40, bowl: 40 },
    calories: 156, protein: 5.2, carbs: 26.4, fats: 2.8, fiber: 4,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 8, priceTier: 'budget', availabilityScore: 9, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'],
  },
  {
    name: 'Whey Protein Scoop', aliases: ['whey protein', 'protein powder', 'whey shake', 'protein shake'],
    category: 'protein', mealTypes: ['breakfast', 'snack'],
    servingUnit: 'scoop', servingSize: 30, unitGramMap: { scoop: 30, g: 1 },
    calories: 120, protein: 24, carbs: 3, fats: 1, fiber: 0,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 35, priceTier: 'premium', availabilityScore: 7, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg'],
  },
  {
    name: 'Peanut Butter', aliases: ['groundnut butter', 'peanut butter spread', 'pb'],
    category: 'fat', mealTypes: ['breakfast', 'snack'],
    servingUnit: 'tbsp', servingSize: 32, unitGramMap: { tbsp: 16, g: 1, spoon: 16 },
    calories: 188, protein: 8, carbs: 6.4, fats: 16, fiber: 1.9,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 12, priceTier: 'medium', availabilityScore: 9, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'],
  },
  {
    name: 'Tofu', aliases: ['soy paneer', 'bean curd', 'firm tofu', 'tofu block'],
    category: 'protein', mealTypes: ['lunch', 'dinner'],
    servingUnit: 'g', servingSize: 100, unitGramMap: { g: 1, piece: 80, bowl: 150 },
    calories: 76, protein: 8, carbs: 2, fats: 4, fiber: 0.3,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 18, priceTier: 'medium', availabilityScore: 7, cookingDifficulty: 'basic', dietType: ['veg', 'vegan', 'eggetarian', 'non_veg'],
  },
  {
    name: 'Greek Yogurt', aliases: ['thick yogurt', 'strained yogurt', 'greek curd'],
    category: 'dairy', mealTypes: ['breakfast', 'snack'],
    servingUnit: 'bowl', servingSize: 150, unitGramMap: { bowl: 150, cup: 150, g: 1 },
    calories: 110, protein: 15, carbs: 9, fats: 1, fiber: 0,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 25, priceTier: 'premium', availabilityScore: 6, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg'],
  },
  {
    name: 'Chicken Thigh (Grilled)', aliases: ['grilled chicken thigh', 'boneless thigh', 'chicken leg'],
    category: 'protein', mealTypes: ['lunch', 'dinner'],
    servingUnit: 'g', servingSize: 100, unitGramMap: { g: 1, piece: 120 },
    calories: 177, protein: 26, carbs: 0, fats: 8, fiber: 0,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 20, priceTier: 'medium', availabilityScore: 8, cookingDifficulty: 'basic', dietType: ['non_veg'],
  },
  {
    name: 'Salmon', aliases: ['atlantic salmon', 'salmon fillet', 'grilled salmon'],
    category: 'protein', mealTypes: ['lunch', 'dinner'],
    servingUnit: 'g', servingSize: 100, unitGramMap: { g: 1, fillet: 150, piece: 150 },
    calories: 208, protein: 20, carbs: 0, fats: 13, fiber: 0,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 80, priceTier: 'premium', availabilityScore: 4, cookingDifficulty: 'basic', dietType: ['non_veg'],
  },
  {
    name: 'Tuna (Canned)', aliases: ['canned tuna', 'tuna fish', 'tuna in water'],
    category: 'protein', mealTypes: ['lunch', 'snack'],
    servingUnit: 'g', servingSize: 100, unitGramMap: { g: 1, can: 185 },
    calories: 116, protein: 26, carbs: 0, fats: 1, fiber: 0,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 50, priceTier: 'premium', availabilityScore: 5, cookingDifficulty: 'none', dietType: ['non_veg'],
  },
  {
    name: 'Brown Rice', aliases: ['whole grain rice', 'unpolished rice', 'bran rice'],
    category: 'carb', mealTypes: ['lunch', 'dinner'],
    servingUnit: 'cup', servingSize: 200, unitGramMap: { cup: 200, bowl: 200, plate: 400, g: 1 },
    calories: 246, protein: 6, carbs: 50, fats: 2, fiber: 3.2,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 7, priceTier: 'budget', availabilityScore: 8, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'],
  },
  {
    name: 'Sweet Potato', aliases: ['shakarkand', 'yam', 'sweet potato boiled', 'shakarkandi'],
    category: 'carb', mealTypes: ['breakfast', 'snack', 'lunch'],
    servingUnit: 'g', servingSize: 100, unitGramMap: { g: 1, piece: 130, medium: 130 },
    calories: 86, protein: 1.6, carbs: 20, fats: 0.1, fiber: 3,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 5, priceTier: 'budget', availabilityScore: 9, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'],
  },
  {
    name: 'Chicken Curry (Homemade)', aliases: ['murgh curry', 'chicken gravy', 'home made chicken curry'],
    category: 'mixed-meal', mealTypes: ['lunch', 'dinner'],
    servingUnit: 'bowl', servingSize: 150, unitGramMap: { bowl: 150, plate: 200, g: 1 },
    calories: 203, protein: 21, carbs: 6, fats: 10.5, fiber: 1,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 22, priceTier: 'medium', availabilityScore: 8, cookingDifficulty: 'full', dietType: ['non_veg'],
  },
  {
    name: 'Mutton Curry', aliases: ['lamb curry', 'gosht curry', 'mutton gravy', 'goat curry'],
    category: 'mixed-meal', mealTypes: ['lunch', 'dinner'],
    servingUnit: 'bowl', servingSize: 150, unitGramMap: { bowl: 150, plate: 200, g: 1 },
    calories: 270, protein: 24, carbs: 4.5, fats: 18, fiber: 0.5,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 50, priceTier: 'premium', availabilityScore: 6, cookingDifficulty: 'full', dietType: ['non_veg'],
  },

  // ═══ EASY ACCESS FOODS ═══
  {
    name: 'Soybean (Cooked)', aliases: ['soy beans', 'edamame', 'cooked soy', 'boiled soybean'],
    category: 'protein', mealTypes: ['lunch', 'dinner', 'snack'],
    servingUnit: 'bowl', servingSize: 100, unitGramMap: { bowl: 100, cup: 100, g: 1 },
    calories: 173, protein: 16, carbs: 10, fats: 9, fiber: 6,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 6, priceTier: 'budget', availabilityScore: 9, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'],
  },
  {
    name: 'Sprouts (Moong)', aliases: ['moong sprouts', 'green gram sprouts', 'bean sprouts', 'ankurit moong'],
    category: 'protein', mealTypes: ['breakfast', 'snack'],
    servingUnit: 'bowl', servingSize: 100, unitGramMap: { bowl: 100, cup: 100, g: 1 },
    calories: 100, protein: 7, carbs: 17, fats: 0.5, fiber: 4,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 5, priceTier: 'budget', availabilityScore: 9, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'],
  },
  {
    name: 'Chana (Roasted)', aliases: ['roasted chickpea', 'bhuna chana', 'dry roasted chana', 'chana jor garam'],
    category: 'protein', mealTypes: ['snack'],
    servingUnit: 'handful', servingSize: 30, unitGramMap: { handful: 30, g: 1, cup: 80 },
    calories: 54, protein: 3, carbs: 8.1, fats: 0.9, fiber: 2,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 5, priceTier: 'budget', availabilityScore: 10, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'],
  },
  {
    name: 'Sattu', aliases: ['roasted gram flour', 'sattu powder', 'sattu drink', 'chana sattu'],
    category: 'protein', mealTypes: ['breakfast', 'snack'],
    servingUnit: 'tbsp', servingSize: 30, unitGramMap: { tbsp: 15, g: 1, glass: 30 },
    calories: 122, protein: 6, carbs: 18, fats: 2.1, fiber: 5,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 8, priceTier: 'budget', availabilityScore: 7, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'],
  },
  {
    name: 'Milk (Toned)', aliases: ['low fat milk', 'toned milk', 'doodh', 'dairy milk'],
    category: 'dairy', mealTypes: ['breakfast', 'snack'],
    servingUnit: 'glass', servingSize: 250, unitGramMap: { glass: 250, ml: 1, cup: 200 },
    calories: 150, protein: 7.5, carbs: 12.5, fats: 7.5, fiber: 0,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 5, priceTier: 'budget', availabilityScore: 10, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg'],
  },
  {
    name: 'Milk (Full Cream)', aliases: ['whole milk', 'full fat milk', 'full cream doodh', 'buffalo milk'],
    category: 'dairy', mealTypes: ['breakfast', 'snack'],
    servingUnit: 'glass', servingSize: 250, unitGramMap: { glass: 250, ml: 1, cup: 200 },
    calories: 168, protein: 8, carbs: 12, fats: 15, fiber: 0,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 6, priceTier: 'budget', availabilityScore: 10, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg'],
  },
  {
    name: 'Peanuts (Raw)', aliases: ['groundnuts', 'mungfali', 'raw peanuts', 'moongphali'],
    category: 'fat', mealTypes: ['snack'],
    servingUnit: 'handful', servingSize: 30, unitGramMap: { handful: 30, g: 1, cup: 145 },
    calories: 170, protein: 7.8, carbs: 4.8, fats: 14.7, fiber: 2.4,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 8, priceTier: 'budget', availabilityScore: 10, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'],
  },
  {
    name: 'Banana', aliases: ['kela', 'ripe banana', 'yellow banana', 'banana fruit'],
    category: 'fruit', mealTypes: ['breakfast', 'snack'],
    servingUnit: 'piece', servingSize: 120, unitGramMap: { piece: 120, medium: 120, large: 150, small: 90 },
    calories: 107, protein: 1.3, carbs: 27.6, fats: 0.4, fiber: 3.1,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 5, priceTier: 'budget', availabilityScore: 10, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'],
  },
  {
    name: 'Apple', aliases: ['red apple', 'green apple', 'seb', 'apple fruit'],
    category: 'fruit', mealTypes: ['snack'],
    servingUnit: 'piece', servingSize: 150, unitGramMap: { piece: 150, medium: 150, large: 200, small: 100 },
    calories: 78, protein: 0.45, carbs: 21, fats: 0.3, fiber: 3.3,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 12, priceTier: 'budget', availabilityScore: 9, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'],
  },
  {
    name: 'Almonds', aliases: ['badam', 'soaked almonds', 'raw almonds', 'almond nuts'],
    category: 'fat', mealTypes: ['snack', 'breakfast'],
    servingUnit: 'handful', servingSize: 28, unitGramMap: { handful: 28, g: 1, piece: 1 },
    calories: 162, protein: 5.9, carbs: 6.2, fats: 13.7, fiber: 3.5,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 15, priceTier: 'medium', availabilityScore: 9, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'],
  },
  {
    name: 'Dates (Khajoor)', aliases: ['khajoor', 'dried dates', 'medjool dates', 'date fruit'],
    category: 'carb', mealTypes: ['snack', 'breakfast'],
    servingUnit: 'piece', servingSize: 24, unitGramMap: { piece: 24, date: 24, g: 1 },
    calories: 67.7, protein: 0.5, carbs: 18, fats: 0.1, fiber: 1.6,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 10, priceTier: 'budget', availabilityScore: 9, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'],
  },
  {
    name: 'Whole Wheat Bread', aliases: ['brown bread', 'wheat bread', 'atta bread', 'multigrain bread'],
    category: 'carb', mealTypes: ['breakfast', 'snack'],
    servingUnit: 'slice', servingSize: 30, unitGramMap: { slice: 30, piece: 30, g: 1 },
    calories: 74, protein: 2.4, carbs: 12.9, fats: 0.9, fiber: 1.5,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 5, priceTier: 'budget', availabilityScore: 10, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'],
  },
  {
    name: 'Banana', aliases: ['kela', 'ripe banana', 'yellow banana'], // deduplicated by slug
    category: 'fruit', mealTypes: ['breakfast', 'snack'],
    servingUnit: 'piece', servingSize: 120, unitGramMap: { piece: 120, medium: 120 },
    calories: 107, protein: 1.3, carbs: 27.6, fats: 0.4, fiber: 3.1,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 5, priceTier: 'budget', availabilityScore: 10, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'],
  },

  // ═══ GYM-GOER STAPLES ═══
  {
    name: 'Soya Chunks (Cooked)', aliases: ['soya nuggets', 'textured soy protein', 'soy chunks', 'nutrela'],
    category: 'protein', mealTypes: ['lunch', 'dinner'],
    servingUnit: 'bowl', servingSize: 100, unitGramMap: { bowl: 100, cup: 100, g: 1 },
    calories: 345, protein: 52, carbs: 33, fats: 0.5, fiber: 13,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 8, priceTier: 'budget', availabilityScore: 9, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'],
  },
  {
    name: 'Boiled Chicken Breast', aliases: ['plain boiled chicken', 'steamed chicken', 'boiled chicken'],
    category: 'protein', mealTypes: ['lunch', 'dinner'],
    servingUnit: 'g', servingSize: 100, unitGramMap: { g: 1, breast: 150, piece: 100 },
    calories: 150, protein: 30, carbs: 0, fats: 3, fiber: 0,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 22, priceTier: 'medium', availabilityScore: 8, cookingDifficulty: 'basic', dietType: ['non_veg'],
  },
  {
    name: 'Tandoori Chicken', aliases: ['tandoori murgh', 'clay oven chicken', 'tandoor chicken'],
    category: 'protein', mealTypes: ['lunch', 'dinner'],
    servingUnit: 'g', servingSize: 100, unitGramMap: { g: 1, piece: 120, leg: 150 },
    calories: 165, protein: 25, carbs: 3, fats: 6, fiber: 0.5,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 30, priceTier: 'medium', availabilityScore: 7, cookingDifficulty: 'full', dietType: ['non_veg'],
  },

  // ═══ EASY ACCESS + COMMON ═══
  {
    name: 'Egg Omelette', aliases: ['omelette', 'omelet', 'anda omelette', 'french omelette'],
    category: 'protein', mealTypes: ['breakfast', 'snack'],
    servingUnit: 'piece', servingSize: 80, unitGramMap: { piece: 80, plate: 120, g: 1 },
    calories: 130, protein: 10, carbs: 1, fats: 10, fiber: 0,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 10, priceTier: 'budget', availabilityScore: 10, cookingDifficulty: 'basic', dietType: ['eggetarian', 'non_veg'],
  },
  {
    name: 'Maggi Noodles', aliases: ['maggi', 'instant noodles', '2 minute noodles', 'masala noodles'],
    category: 'carb', mealTypes: ['snack'],
    servingUnit: 'packet', servingSize: 70, unitGramMap: { packet: 70, g: 1 },
    calories: 200, protein: 4, carbs: 30, fats: 7, fiber: 1,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 14, priceTier: 'budget', availabilityScore: 10, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg'],
  },
  {
    name: 'Bread Omelette', aliases: ['egg toast', 'omelette with bread', 'anda bread'],
    category: 'mixed-meal', mealTypes: ['breakfast'],
    servingUnit: 'piece', servingSize: 120, unitGramMap: { piece: 120, plate: 120, g: 1 },
    calories: 240, protein: 12, carbs: 22, fats: 12, fiber: 1.5,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 15, priceTier: 'budget', availabilityScore: 10, cookingDifficulty: 'basic', dietType: ['eggetarian', 'non_veg'],
  },
  {
    name: 'Curd Rice', aliases: ['mosaranna', 'thayir sadam', 'dahi chawal', 'yogurt rice'],
    category: 'mixed-meal', mealTypes: ['lunch', 'dinner'],
    servingUnit: 'bowl', servingSize: 200, unitGramMap: { bowl: 200, plate: 300, g: 1 },
    calories: 290, protein: 10, carbs: 50, fats: 6, fiber: 1,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 8, priceTier: 'budget', availabilityScore: 10, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg'],
  },
  {
    name: 'Cornflakes with Milk', aliases: ['cornflakes', 'cereal with milk', 'kelloggs cornflakes'],
    category: 'mixed-meal', mealTypes: ['breakfast'],
    servingUnit: 'bowl', servingSize: 150, unitGramMap: { bowl: 150, g: 1 },
    calories: 175, protein: 5, carbs: 32, fats: 3, fiber: 1,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 12, priceTier: 'budget', availabilityScore: 9, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg'],
  },

  // ═══ HIGH FIBRE / HEALTH FOODS ═══
  {
    name: 'Spinach (Palak)', aliases: ['palak', 'baby spinach', 'spinach leaves'],
    category: 'vegetable', mealTypes: ['lunch', 'dinner'],
    servingUnit: 'bowl', servingSize: 100, unitGramMap: { bowl: 100, cup: 100, g: 1 },
    calories: 23, protein: 2.9, carbs: 3.6, fats: 0.4, fiber: 2.2,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 4, priceTier: 'budget', availabilityScore: 10, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'],
  },
  {
    name: 'Broccoli', aliases: ['green broccoli', 'steamed broccoli', 'broccoli florets'],
    category: 'vegetable', mealTypes: ['lunch', 'dinner', 'snack'],
    servingUnit: 'g', servingSize: 100, unitGramMap: { g: 1, cup: 90, bowl: 90 },
    calories: 34, protein: 2.8, carbs: 7, fats: 0.4, fiber: 2.6,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 15, priceTier: 'medium', availabilityScore: 7, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'],
  },
  {
    name: 'Coconut Water', aliases: ['nariyal pani', 'tender coconut water', 'naariyal paani'],
    category: 'beverage', mealTypes: ['snack', 'breakfast'],
    servingUnit: 'glass', servingSize: 240, unitGramMap: { glass: 240, ml: 1, coconut: 240 },
    calories: 46, protein: 1.7, carbs: 9.6, fats: 0.5, fiber: 0,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 15, priceTier: 'budget', availabilityScore: 9, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'],
  },
  {
    name: 'Black Coffee', aliases: ['americano', 'plain coffee', 'coffee without milk', 'filter coffee black'],
    category: 'beverage', mealTypes: ['breakfast', 'snack'],
    servingUnit: 'cup', servingSize: 240, unitGramMap: { cup: 240, ml: 1, glass: 240 },
    calories: 5, protein: 0.3, carbs: 0, fats: 0, fiber: 0,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 5, priceTier: 'budget', availabilityScore: 10, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'],
  },
  {
    name: 'Green Tea', aliases: ['green tea bag', 'plain green tea', 'sugarless green tea'],
    category: 'beverage', mealTypes: ['breakfast', 'snack'],
    servingUnit: 'cup', servingSize: 240, unitGramMap: { cup: 240, ml: 1, glass: 240 },
    calories: 2, protein: 0, carbs: 0, fats: 0, fiber: 0,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 5, priceTier: 'budget', availabilityScore: 9, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'],
  },
  {
    name: 'Ghee', aliases: ['clarified butter', 'desi ghee', 'cow ghee', 'pure ghee'],
    category: 'fat', mealTypes: ['breakfast', 'lunch', 'dinner'],
    servingUnit: 'tsp', servingSize: 5, unitGramMap: { tsp: 5, tbsp: 15, g: 1 },
    calories: 45, protein: 0, carbs: 0, fats: 5, fiber: 0,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 8, priceTier: 'medium', availabilityScore: 10, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg'],
  },
  {
    name: 'Oats (Overnight)', aliases: ['overnight oats', 'cold oats', 'soaked oats'],
    category: 'carb', mealTypes: ['breakfast'],
    servingUnit: 'bowl', servingSize: 200, unitGramMap: { bowl: 200, jar: 200, g: 1 },
    calories: 300, protein: 10, carbs: 45, fats: 8, fiber: 7,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 15, priceTier: 'budget', availabilityScore: 8, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg'],
  },
  {
    name: 'Casein Protein', aliases: ['casein shake', 'slow release protein', 'night protein', 'casein powder'],
    category: 'protein', mealTypes: ['snack'],
    servingUnit: 'scoop', servingSize: 30, unitGramMap: { scoop: 30, g: 1 },
    calories: 120, protein: 24, carbs: 3, fats: 1, fiber: 0,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 40, priceTier: 'premium', availabilityScore: 5, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg'],
  },
  {
    name: 'Quinoa (Cooked)', aliases: ['quinoa grain', 'cooked quinoa', 'white quinoa'],
    category: 'carb', mealTypes: ['lunch', 'dinner'],
    servingUnit: 'bowl', servingSize: 185, unitGramMap: { bowl: 185, cup: 185, g: 1 },
    calories: 222, protein: 8.1, carbs: 38.9, fats: 3.5, fiber: 5,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 20, priceTier: 'premium', availabilityScore: 5, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'],
  },
  {
    name: 'Fish (Rohu)', aliases: ['rohu fish', 'rohu', 'freshwater fish', 'bengali fish'],
    category: 'protein', mealTypes: ['lunch', 'dinner'],
    servingUnit: 'g', servingSize: 100, unitGramMap: { g: 1, piece: 80 },
    calories: 90, protein: 18, carbs: 0, fats: 2, fiber: 0,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 30, priceTier: 'medium', availabilityScore: 7, cookingDifficulty: 'full', dietType: ['non_veg'],
  },
  {
    name: 'Cottage Cheese (Paneer Low Fat)', aliases: ['low fat paneer', 'skimmed milk paneer', 'diet paneer'],
    category: 'protein', mealTypes: ['breakfast', 'snack'],
    servingUnit: 'g', servingSize: 100, unitGramMap: { g: 1, bowl: 150 },
    calories: 180, protein: 20, carbs: 3, fats: 10, fiber: 0,
    source: 'levelup_seed', isVerified: true,
    estimatedPricePerServing: 30, priceTier: 'medium', availabilityScore: 7, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg'],
  },
];

// ── Main seed function ────────────────────────────────────────
async function seedFoodCatalog() {
  console.log('[Semantic Seed] Starting Food Catalog seed...');
  
  // Deduplicate FOODS array by slug before processing
  const seenSlugs = new Set();
  const uniqueFoods = FOODS.filter(food => {
    const slug = toSlug(food.name);
    if (seenSlugs.has(slug)) return false;
    seenSlugs.add(slug);
    return true;
  });

  console.log(`[Semantic Seed] Processing ${uniqueFoods.length} unique foods...`);
  
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const food of uniqueFoods) {
    const slug = toSlug(food.name);
    const normalizedName = toNormalizedName(food.name);
    const normalizedAliases = (food.aliases || []).map(toNormalizedName);

    // ── Validation guard ──────────────────────────────────────
    if (!food.name || !food.category) {
      console.warn(`[Semantic Seed] Skipping invalid food (missing name/category):`, food);
      skipped++;
      continue;
    }
    if ((food.servingSize ?? 0) <= 0) {
      console.warn(`[Semantic Seed] Skipping "${food.name}" — servingSize must be > 0.`);
      skipped++;
      continue;
    }
    if ((food.calories ?? -1) < 0 || (food.protein ?? -1) < 0 || (food.carbs ?? -1) < 0 || (food.fats ?? -1) < 0) {
      console.warn(`[Semantic Seed] Skipping "${food.name}" — macro values cannot be negative.`);
      skipped++;
      continue;
    }

    try {
      await prisma.foodCatalog.upsert({
        where: { normalizedName },
        update: {
          name: food.name,
          slug,
          aliases: normalizedAliases,
          category: food.category,
          mealTypes: food.mealTypes || [],
          servingUnit: food.servingUnit || 'g',
          servingSize: food.servingSize ?? 100,
          unitGramMap: food.unitGramMap || {},
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fats: food.fats,
          fiber: food.fiber ?? null,
          source: food.source || 'levelup_seed',
          isVerified: food.isVerified ?? true,
          confidence: food.confidence ?? null,
          varianceLow: food.varianceLow ?? null,
          varianceHigh: food.varianceHigh ?? null,
          // Legacy business fields
          estimatedPricePerServing: food.estimatedPricePerServing ?? null,
          priceTier: food.priceTier || 'medium',
          availabilityScore: food.availabilityScore ?? 5,
          cookingDifficulty: food.cookingDifficulty || 'basic',
          dietType: food.dietType || ['non_veg'],
        },
        create: {
          name: food.name,
          normalizedName,
          slug,
          aliases: normalizedAliases,
          category: food.category,
          mealTypes: food.mealTypes || [],
          servingUnit: food.servingUnit || 'g',
          servingSize: food.servingSize ?? 100,
          unitGramMap: food.unitGramMap || {},
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fats: food.fats,
          fiber: food.fiber ?? null,
          source: food.source || 'levelup_seed',
          isVerified: food.isVerified ?? true,
          confidence: food.confidence ?? null,
          varianceLow: food.varianceLow ?? null,
          varianceHigh: food.varianceHigh ?? null,
          imageUrl: food.imageUrl ?? null,
          // Legacy business fields
          estimatedPricePerServing: food.estimatedPricePerServing ?? null,
          priceTier: food.priceTier || 'medium',
          availabilityScore: food.availabilityScore ?? 5,
          cookingDifficulty: food.cookingDifficulty || 'basic',
          dietType: food.dietType || ['non_veg'],
        },
      });
      
      created++;
    } catch (err) {
      console.error(`[Semantic Seed] Error upserting "${food.name}" (slug: "${slug}"):`, err.message);
      skipped++;
    }
  }

  console.log(`[Semantic Seed] Done — ${created} upserted, ${skipped} failed.`);
}

// ── Run directly if invoked as a script ──────────────────────
const isMainModule = process.argv[1]?.replace(/\\/g, '/').includes('seed-food-catalog');
if (isMainModule) {
  seedFoodCatalog()
    .then(() => {
      console.log('[Semantic Seed] Complete!');
      process.exit(0);
    })
    .catch(err => {
      console.error('[Semantic Seed] Fatal error:', err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}

export { seedFoodCatalog, toSlug, toNormalizedName };
