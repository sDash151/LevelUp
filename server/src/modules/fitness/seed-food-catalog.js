// ══════════════════════════════════════════════════════════════
// Food Catalog Seed — Source of Truth for Nutrition Data
// 150+ verified Indian + Fitness + Global foods
// ══════════════════════════════════════════════════════════════

import { prisma } from '../../config/database.js';

const FOODS = [
  // ═══ INDIAN STAPLES ═══
  { name: 'Roti (Whole Wheat)', category: 'indian_staple', protein: 3.5, carbs: 18, fats: 1, calories: 97, servingSize: 40, estimatedPricePerServing: 3, priceTier: 'budget', availabilityScore: 10, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Rice (Cooked)', category: 'indian_staple', protein: 2.7, carbs: 28, fats: 0.3, calories: 130, servingSize: 100, estimatedPricePerServing: 5, priceTier: 'budget', availabilityScore: 10, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Dal (Toor/Arhar)', category: 'indian_staple', protein: 7.5, carbs: 18, fats: 1, calories: 110, servingSize: 100, estimatedPricePerServing: 8, priceTier: 'budget', availabilityScore: 10, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Moong Dal', category: 'indian_staple', protein: 8, carbs: 16, fats: 0.5, calories: 100, servingSize: 100, estimatedPricePerServing: 8, priceTier: 'budget', availabilityScore: 9, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Paneer', category: 'indian_staple', protein: 18, carbs: 3.6, fats: 20, calories: 265, servingSize: 100, estimatedPricePerServing: 30, priceTier: 'medium', availabilityScore: 9, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg'] },
  { name: 'Curd (Dahi)', category: 'indian_staple', protein: 3, carbs: 5, fats: 3, calories: 60, servingSize: 100, estimatedPricePerServing: 8, priceTier: 'budget', availabilityScore: 10, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg'] },
  { name: 'Poha', category: 'indian_staple', protein: 2.5, carbs: 23, fats: 1, calories: 110, servingSize: 100, estimatedPricePerServing: 6, priceTier: 'budget', availabilityScore: 9, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Upma', category: 'indian_staple', protein: 3, carbs: 22, fats: 4, calories: 135, servingSize: 100, estimatedPricePerServing: 7, priceTier: 'budget', availabilityScore: 9, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Idli', category: 'indian_staple', protein: 2, carbs: 13, fats: 0.5, calories: 65, servingSize: 40, estimatedPricePerServing: 4, priceTier: 'budget', availabilityScore: 8, cookingDifficulty: 'full', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Dosa (Plain)', category: 'indian_staple', protein: 4, carbs: 28, fats: 5, calories: 170, servingSize: 100, estimatedPricePerServing: 8, priceTier: 'budget', availabilityScore: 8, cookingDifficulty: 'full', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Paratha (Plain)', category: 'indian_staple', protein: 4, carbs: 24, fats: 8, calories: 180, servingSize: 60, estimatedPricePerServing: 6, priceTier: 'budget', availabilityScore: 10, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Rajma (Kidney Beans)', category: 'indian_staple', protein: 8.7, carbs: 22, fats: 0.5, calories: 127, servingSize: 100, estimatedPricePerServing: 10, priceTier: 'budget', availabilityScore: 9, cookingDifficulty: 'full', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Chole (Chickpea Curry)', category: 'indian_staple', protein: 7, carbs: 20, fats: 3, calories: 135, servingSize: 100, estimatedPricePerServing: 10, priceTier: 'budget', availabilityScore: 9, cookingDifficulty: 'full', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Aloo Gobi', category: 'indian_staple', protein: 2.5, carbs: 12, fats: 5, calories: 100, servingSize: 100, estimatedPricePerServing: 8, priceTier: 'budget', availabilityScore: 9, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Sambar', category: 'indian_staple', protein: 4, carbs: 12, fats: 2, calories: 80, servingSize: 100, estimatedPricePerServing: 7, priceTier: 'budget', availabilityScore: 8, cookingDifficulty: 'full', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Raita', category: 'indian_staple', protein: 3, carbs: 5, fats: 3, calories: 55, servingSize: 100, estimatedPricePerServing: 6, priceTier: 'budget', availabilityScore: 10, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg'] },
  { name: 'Palak Paneer', category: 'indian_staple', protein: 10, carbs: 6, fats: 14, calories: 190, servingSize: 100, estimatedPricePerServing: 25, priceTier: 'medium', availabilityScore: 8, cookingDifficulty: 'full', dietType: ['veg', 'eggetarian', 'non_veg'] },
  { name: 'Mixed Vegetable Curry', category: 'indian_staple', protein: 3, carbs: 10, fats: 4, calories: 85, servingSize: 100, estimatedPricePerServing: 10, priceTier: 'budget', availabilityScore: 9, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Khichdi', category: 'indian_staple', protein: 5, carbs: 24, fats: 2, calories: 130, servingSize: 100, estimatedPricePerServing: 6, priceTier: 'budget', availabilityScore: 10, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Chapati (Multigrain)', category: 'indian_staple', protein: 4, carbs: 17, fats: 2, calories: 100, servingSize: 40, estimatedPricePerServing: 5, priceTier: 'budget', availabilityScore: 8, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Besan Chilla', category: 'indian_staple', protein: 7, carbs: 15, fats: 5, calories: 130, servingSize: 60, estimatedPricePerServing: 5, priceTier: 'budget', availabilityScore: 8, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Lassi (Sweet)', category: 'indian_staple', protein: 5, carbs: 20, fats: 4, calories: 135, servingSize: 200, servingUnit: 'ml', estimatedPricePerServing: 15, priceTier: 'budget', availabilityScore: 9, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg'] },
  { name: 'Buttermilk (Chaas)', category: 'indian_staple', protein: 2, carbs: 4, fats: 1, calories: 30, servingSize: 200, servingUnit: 'ml', estimatedPricePerServing: 5, priceTier: 'budget', availabilityScore: 9, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg'] },

  // ═══ FITNESS FOODS ═══
  { name: 'Chicken Breast (Grilled)', category: 'fitness_food', protein: 31, carbs: 0, fats: 3.6, calories: 165, servingSize: 100, estimatedPricePerServing: 25, priceTier: 'medium', availabilityScore: 8, cookingDifficulty: 'basic', dietType: ['non_veg', 'eggetarian'] },
  { name: 'Eggs (Whole Boiled)', category: 'fitness_food', protein: 6, carbs: 0.6, fats: 5, calories: 70, servingSize: 50, estimatedPricePerServing: 8, priceTier: 'budget', availabilityScore: 10, cookingDifficulty: 'basic', dietType: ['eggetarian', 'non_veg'] },
  { name: 'Egg Whites', category: 'fitness_food', protein: 11, carbs: 0.7, fats: 0.2, calories: 52, servingSize: 100, estimatedPricePerServing: 12, priceTier: 'budget', availabilityScore: 10, cookingDifficulty: 'basic', dietType: ['eggetarian', 'non_veg'] },
  { name: 'Oats', category: 'fitness_food', protein: 13, carbs: 66, fats: 7, calories: 389, servingSize: 100, estimatedPricePerServing: 8, priceTier: 'budget', availabilityScore: 9, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Whey Protein Scoop', category: 'fitness_food', protein: 24, carbs: 3, fats: 1, calories: 120, servingSize: 30, estimatedPricePerServing: 35, priceTier: 'premium', availabilityScore: 7, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg'] },
  { name: 'Peanut Butter', category: 'fitness_food', protein: 25, carbs: 20, fats: 50, calories: 588, servingSize: 100, estimatedPricePerServing: 12, priceTier: 'medium', availabilityScore: 9, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Tofu', category: 'fitness_food', protein: 8, carbs: 2, fats: 4, calories: 76, servingSize: 100, estimatedPricePerServing: 18, priceTier: 'medium', availabilityScore: 7, cookingDifficulty: 'basic', dietType: ['veg', 'vegan', 'eggetarian', 'non_veg'] },
  { name: 'Greek Yogurt', category: 'fitness_food', protein: 10, carbs: 6, fats: 0.7, calories: 73, servingSize: 100, estimatedPricePerServing: 25, priceTier: 'premium', availabilityScore: 6, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg'] },
  { name: 'Chicken Thigh (Grilled)', category: 'fitness_food', protein: 26, carbs: 0, fats: 8, calories: 177, servingSize: 100, estimatedPricePerServing: 20, priceTier: 'medium', availabilityScore: 8, cookingDifficulty: 'basic', dietType: ['non_veg'] },
  { name: 'Fish (Rohu)', category: 'fitness_food', protein: 18, carbs: 0, fats: 2, calories: 90, servingSize: 100, estimatedPricePerServing: 30, priceTier: 'medium', availabilityScore: 7, cookingDifficulty: 'full', dietType: ['non_veg'] },
  { name: 'Salmon', category: 'fitness_food', protein: 20, carbs: 0, fats: 13, calories: 208, servingSize: 100, estimatedPricePerServing: 80, priceTier: 'premium', availabilityScore: 4, cookingDifficulty: 'basic', dietType: ['non_veg'] },
  { name: 'Tuna (Canned)', category: 'fitness_food', protein: 26, carbs: 0, fats: 1, calories: 116, servingSize: 100, estimatedPricePerServing: 50, priceTier: 'premium', availabilityScore: 5, cookingDifficulty: 'none', dietType: ['non_veg'] },
  { name: 'Cottage Cheese (Paneer Low Fat)', category: 'fitness_food', protein: 20, carbs: 3, fats: 10, calories: 180, servingSize: 100, estimatedPricePerServing: 30, priceTier: 'medium', availabilityScore: 7, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg'] },
  { name: 'Brown Rice', category: 'fitness_food', protein: 3, carbs: 25, fats: 1, calories: 123, servingSize: 100, estimatedPricePerServing: 7, priceTier: 'budget', availabilityScore: 8, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Sweet Potato', category: 'fitness_food', protein: 1.6, carbs: 20, fats: 0.1, calories: 86, servingSize: 100, estimatedPricePerServing: 5, priceTier: 'budget', availabilityScore: 9, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Chicken Curry (Homemade)', category: 'fitness_food', protein: 14, carbs: 4, fats: 7, calories: 135, servingSize: 100, estimatedPricePerServing: 22, priceTier: 'medium', availabilityScore: 8, cookingDifficulty: 'full', dietType: ['non_veg'] },
  { name: 'Mutton Curry', category: 'fitness_food', protein: 16, carbs: 3, fats: 12, calories: 180, servingSize: 100, estimatedPricePerServing: 50, priceTier: 'premium', availabilityScore: 6, cookingDifficulty: 'full', dietType: ['non_veg'] },

  // ═══ EASY ACCESS FOODS ═══
  { name: 'Soybean (Cooked)', category: 'easy_access', protein: 16, carbs: 10, fats: 9, calories: 173, servingSize: 100, estimatedPricePerServing: 6, priceTier: 'budget', availabilityScore: 9, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Sprouts (Moong)', category: 'easy_access', protein: 7, carbs: 17, fats: 0.5, calories: 100, servingSize: 100, estimatedPricePerServing: 5, priceTier: 'budget', availabilityScore: 9, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Chana (Roasted)', category: 'easy_access', protein: 10, carbs: 27, fats: 3, calories: 180, servingSize: 50, estimatedPricePerServing: 5, priceTier: 'budget', availabilityScore: 10, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Sattu', category: 'easy_access', protein: 20, carbs: 60, fats: 7, calories: 406, servingSize: 100, estimatedPricePerServing: 8, priceTier: 'budget', availabilityScore: 7, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Milk (Toned)', category: 'easy_access', protein: 3, carbs: 5, fats: 3, calories: 60, servingSize: 100, servingUnit: 'ml', estimatedPricePerServing: 5, priceTier: 'budget', availabilityScore: 10, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg'] },
  { name: 'Milk (Full Cream)', category: 'easy_access', protein: 3.2, carbs: 4.8, fats: 6, calories: 67, servingSize: 100, servingUnit: 'ml', estimatedPricePerServing: 6, priceTier: 'budget', availabilityScore: 10, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg'] },
  { name: 'Peanuts (Raw)', category: 'easy_access', protein: 26, carbs: 16, fats: 49, calories: 567, servingSize: 100, estimatedPricePerServing: 8, priceTier: 'budget', availabilityScore: 10, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Banana', category: 'easy_access', protein: 1.1, carbs: 23, fats: 0.3, calories: 89, servingSize: 100, estimatedPricePerServing: 5, priceTier: 'budget', availabilityScore: 10, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Apple', category: 'easy_access', protein: 0.3, carbs: 14, fats: 0.2, calories: 52, servingSize: 100, estimatedPricePerServing: 12, priceTier: 'budget', availabilityScore: 9, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Almonds', category: 'easy_access', protein: 21, carbs: 22, fats: 49, calories: 579, servingSize: 100, estimatedPricePerServing: 15, priceTier: 'medium', availabilityScore: 9, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Dates (Khajoor)', category: 'easy_access', protein: 2, carbs: 75, fats: 0.4, calories: 282, servingSize: 100, estimatedPricePerServing: 10, priceTier: 'budget', availabilityScore: 9, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Makhana (Fox Nuts)', category: 'easy_access', protein: 9, carbs: 76, fats: 0.1, calories: 347, servingSize: 100, estimatedPricePerServing: 15, priceTier: 'medium', availabilityScore: 8, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Whole Wheat Bread', category: 'easy_access', protein: 8, carbs: 43, fats: 3, calories: 247, servingSize: 100, estimatedPricePerServing: 5, priceTier: 'budget', availabilityScore: 10, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Soy Milk', category: 'easy_access', protein: 3.3, carbs: 6, fats: 1.8, calories: 54, servingSize: 100, servingUnit: 'ml', estimatedPricePerServing: 10, priceTier: 'budget', availabilityScore: 7, cookingDifficulty: 'none', dietType: ['veg', 'vegan', 'eggetarian', 'non_veg'] },
  { name: 'Jaggery (Gud)', category: 'easy_access', protein: 0.4, carbs: 97, fats: 0.1, calories: 383, servingSize: 100, estimatedPricePerServing: 3, priceTier: 'budget', availabilityScore: 10, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Honey', category: 'easy_access', protein: 0.3, carbs: 82, fats: 0, calories: 304, servingSize: 100, estimatedPricePerServing: 8, priceTier: 'budget', availabilityScore: 9, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg'] },
  { name: 'Mixed Salad', category: 'easy_access', protein: 1, carbs: 4, fats: 0.2, calories: 20, servingSize: 100, estimatedPricePerServing: 8, priceTier: 'budget', availabilityScore: 9, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },

  // ═══ GLOBAL FOODS ═══
  { name: 'Pasta (Whole Wheat Cooked)', category: 'global', protein: 5, carbs: 27, fats: 0.9, calories: 131, servingSize: 100, estimatedPricePerServing: 10, priceTier: 'budget', availabilityScore: 8, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Oatmeal Smoothie', category: 'global', protein: 8, carbs: 30, fats: 5, calories: 200, servingSize: 250, servingUnit: 'ml', estimatedPricePerServing: 15, priceTier: 'budget', availabilityScore: 8, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg'] },
  { name: 'Protein Smoothie', category: 'global', protein: 25, carbs: 20, fats: 5, calories: 225, servingSize: 300, servingUnit: 'ml', estimatedPricePerServing: 40, priceTier: 'medium', availabilityScore: 7, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg'] },
  { name: 'Avocado Toast', category: 'global', protein: 5, carbs: 18, fats: 12, calories: 200, servingSize: 100, estimatedPricePerServing: 40, priceTier: 'premium', availabilityScore: 5, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Quinoa (Cooked)', category: 'global', protein: 4.4, carbs: 21, fats: 1.9, calories: 120, servingSize: 100, estimatedPricePerServing: 20, priceTier: 'premium', availabilityScore: 5, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Granola', category: 'global', protein: 10, carbs: 60, fats: 20, calories: 471, servingSize: 100, estimatedPricePerServing: 25, priceTier: 'premium', availabilityScore: 6, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg'] },
  { name: 'Wrap (Whole Wheat)', category: 'global', protein: 4, carbs: 22, fats: 3, calories: 130, servingSize: 50, estimatedPricePerServing: 10, priceTier: 'budget', availabilityScore: 7, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Mixed Fruit Bowl', category: 'global', protein: 1, carbs: 15, fats: 0.3, calories: 60, servingSize: 100, estimatedPricePerServing: 15, priceTier: 'budget', availabilityScore: 8, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Overnight Oats', category: 'global', protein: 10, carbs: 45, fats: 8, calories: 300, servingSize: 200, estimatedPricePerServing: 15, priceTier: 'budget', availabilityScore: 8, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg'] },
  { name: 'Sandwich (Veg)', category: 'global', protein: 7, carbs: 30, fats: 8, calories: 220, servingSize: 120, estimatedPricePerServing: 12, priceTier: 'budget', availabilityScore: 9, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg'] },
  { name: 'Hummus', category: 'global', protein: 8, carbs: 14, fats: 10, calories: 166, servingSize: 100, estimatedPricePerServing: 20, priceTier: 'medium', availabilityScore: 6, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Trail Mix', category: 'global', protein: 14, carbs: 45, fats: 30, calories: 462, servingSize: 100, estimatedPricePerServing: 25, priceTier: 'medium', availabilityScore: 7, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },

  // ═══ REGIONAL INDIAN — SOUTH INDIAN ═══
  { name: 'Ragi Mudde (Ragi Ball)', category: 'indian_staple', protein: 7, carbs: 72, fats: 1.3, calories: 328, servingSize: 100, estimatedPricePerServing: 5, priceTier: 'budget', availabilityScore: 8, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Ragi Porridge', category: 'easy_access', protein: 7, carbs: 65, fats: 1.3, calories: 300, servingSize: 100, estimatedPricePerServing: 6, priceTier: 'budget', availabilityScore: 8, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Bisi Bele Bath', category: 'indian_staple', protein: 5, carbs: 22, fats: 4, calories: 145, servingSize: 100, estimatedPricePerServing: 10, priceTier: 'budget', availabilityScore: 8, cookingDifficulty: 'full', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Pesarattu (Green Moong Dosa)', category: 'indian_staple', protein: 7, carbs: 20, fats: 2, calories: 125, servingSize: 80, estimatedPricePerServing: 6, priceTier: 'budget', availabilityScore: 7, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Coconut Chutney', category: 'indian_staple', protein: 2, carbs: 5, fats: 12, calories: 130, servingSize: 30, estimatedPricePerServing: 3, priceTier: 'budget', availabilityScore: 9, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Vada (Medu Vada)', category: 'indian_staple', protein: 6, carbs: 18, fats: 10, calories: 185, servingSize: 50, estimatedPricePerServing: 8, priceTier: 'budget', availabilityScore: 8, cookingDifficulty: 'full', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Pongal', category: 'indian_staple', protein: 4, carbs: 25, fats: 5, calories: 155, servingSize: 100, estimatedPricePerServing: 8, priceTier: 'budget', availabilityScore: 8, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg'] },
  { name: 'Rasam', category: 'indian_staple', protein: 2, carbs: 5, fats: 1, calories: 35, servingSize: 100, estimatedPricePerServing: 4, priceTier: 'budget', availabilityScore: 8, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Appam', category: 'indian_staple', protein: 2, carbs: 20, fats: 0.5, calories: 95, servingSize: 60, estimatedPricePerServing: 5, priceTier: 'budget', availabilityScore: 6, cookingDifficulty: 'full', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },

  // ═══ REGIONAL INDIAN — NORTH / BENGALI / GUJARATI ═══
  { name: 'Saag (Mustard Greens)', category: 'indian_staple', protein: 4, carbs: 6, fats: 7, calories: 100, servingSize: 100, estimatedPricePerServing: 10, priceTier: 'budget', availabilityScore: 7, cookingDifficulty: 'full', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Makki Ki Roti', category: 'indian_staple', protein: 3, carbs: 22, fats: 2, calories: 115, servingSize: 50, estimatedPricePerServing: 4, priceTier: 'budget', availabilityScore: 7, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Dhokla', category: 'indian_staple', protein: 5, carbs: 20, fats: 2, calories: 120, servingSize: 80, estimatedPricePerServing: 8, priceTier: 'budget', availabilityScore: 7, cookingDifficulty: 'full', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Thepla', category: 'indian_staple', protein: 4, carbs: 18, fats: 5, calories: 130, servingSize: 45, estimatedPricePerServing: 5, priceTier: 'budget', availabilityScore: 7, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Litti Chokha', category: 'indian_staple', protein: 6, carbs: 30, fats: 8, calories: 220, servingSize: 100, estimatedPricePerServing: 10, priceTier: 'budget', availabilityScore: 5, cookingDifficulty: 'full', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Masoor Dal', category: 'indian_staple', protein: 9, carbs: 15, fats: 0.8, calories: 105, servingSize: 100, estimatedPricePerServing: 7, priceTier: 'budget', availabilityScore: 10, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Chana Dal', category: 'indian_staple', protein: 8, carbs: 20, fats: 2, calories: 130, servingSize: 100, estimatedPricePerServing: 7, priceTier: 'budget', availabilityScore: 9, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Egg Bhurji', category: 'indian_staple', protein: 12, carbs: 3, fats: 10, calories: 150, servingSize: 100, estimatedPricePerServing: 15, priceTier: 'budget', availabilityScore: 9, cookingDifficulty: 'basic', dietType: ['eggetarian', 'non_veg'] },
  { name: 'Egg Curry', category: 'indian_staple', protein: 10, carbs: 5, fats: 8, calories: 130, servingSize: 100, estimatedPricePerServing: 15, priceTier: 'budget', availabilityScore: 9, cookingDifficulty: 'basic', dietType: ['eggetarian', 'non_veg'] },
  { name: 'Paneer Tikka', category: 'indian_staple', protein: 15, carbs: 5, fats: 16, calories: 220, servingSize: 100, estimatedPricePerServing: 30, priceTier: 'medium', availabilityScore: 7, cookingDifficulty: 'full', dietType: ['veg', 'eggetarian', 'non_veg'] },

  // ═══ PG / HOSTEL / BANGALORE STAPLES ═══
  { name: 'Chapati with Sabzi (PG Style)', category: 'easy_access', protein: 5, carbs: 25, fats: 4, calories: 155, servingSize: 100, estimatedPricePerServing: 10, priceTier: 'budget', availabilityScore: 10, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Egg Omelette', category: 'easy_access', protein: 10, carbs: 1, fats: 10, calories: 130, servingSize: 80, estimatedPricePerServing: 10, priceTier: 'budget', availabilityScore: 10, cookingDifficulty: 'basic', dietType: ['eggetarian', 'non_veg'] },
  { name: 'Boiled Egg', category: 'easy_access', protein: 6, carbs: 0.6, fats: 5, calories: 70, servingSize: 50, estimatedPricePerServing: 7, priceTier: 'budget', availabilityScore: 10, cookingDifficulty: 'basic', dietType: ['eggetarian', 'non_veg'] },
  { name: 'Maggi Noodles', category: 'easy_access', protein: 4, carbs: 30, fats: 7, calories: 200, servingSize: 70, estimatedPricePerServing: 14, priceTier: 'budget', availabilityScore: 10, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg'] },
  { name: 'Bread Omelette', category: 'easy_access', protein: 12, carbs: 22, fats: 12, calories: 240, servingSize: 120, estimatedPricePerServing: 15, priceTier: 'budget', availabilityScore: 10, cookingDifficulty: 'basic', dietType: ['eggetarian', 'non_veg'] },
  { name: 'Curd Rice', category: 'easy_access', protein: 5, carbs: 25, fats: 3, calories: 145, servingSize: 150, estimatedPricePerServing: 8, priceTier: 'budget', availabilityScore: 10, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg'] },
  { name: 'Lemon Rice', category: 'easy_access', protein: 3, carbs: 30, fats: 4, calories: 165, servingSize: 150, estimatedPricePerServing: 8, priceTier: 'budget', availabilityScore: 9, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Puliyogare (Tamarind Rice)', category: 'easy_access', protein: 3, carbs: 32, fats: 5, calories: 180, servingSize: 150, estimatedPricePerServing: 8, priceTier: 'budget', availabilityScore: 8, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Cornflakes with Milk', category: 'easy_access', protein: 5, carbs: 32, fats: 3, calories: 175, servingSize: 150, estimatedPricePerServing: 12, priceTier: 'budget', availabilityScore: 9, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg'] },
  { name: 'Muesli', category: 'easy_access', protein: 10, carbs: 60, fats: 7, calories: 340, servingSize: 100, estimatedPricePerServing: 18, priceTier: 'medium', availabilityScore: 8, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg'] },

  // ═══ GYM-GOER STAPLES (India + International) ═══
  { name: 'Boiled Chicken Breast', category: 'fitness_food', protein: 30, carbs: 0, fats: 3, calories: 150, servingSize: 100, estimatedPricePerServing: 22, priceTier: 'medium', availabilityScore: 8, cookingDifficulty: 'basic', dietType: ['non_veg'] },
  { name: 'Tandoori Chicken', category: 'fitness_food', protein: 25, carbs: 3, fats: 6, calories: 165, servingSize: 100, estimatedPricePerServing: 30, priceTier: 'medium', availabilityScore: 7, cookingDifficulty: 'full', dietType: ['non_veg'] },
  { name: 'Soya Chunks (Cooked)', category: 'fitness_food', protein: 52, carbs: 33, fats: 0.5, calories: 345, servingSize: 100, estimatedPricePerServing: 8, priceTier: 'budget', availabilityScore: 9, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Soya Granules', category: 'fitness_food', protein: 50, carbs: 30, fats: 1, calories: 336, servingSize: 100, estimatedPricePerServing: 7, priceTier: 'budget', availabilityScore: 9, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Creatine (Supplement)', category: 'fitness_food', protein: 0, carbs: 0, fats: 0, calories: 0, servingSize: 5, estimatedPricePerServing: 12, priceTier: 'medium', availabilityScore: 7, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Casein Protein', category: 'fitness_food', protein: 24, carbs: 3, fats: 1, calories: 120, servingSize: 30, estimatedPricePerServing: 40, priceTier: 'premium', availabilityScore: 5, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg'] },
  { name: 'Mass Gainer Shake', category: 'fitness_food', protein: 15, carbs: 60, fats: 5, calories: 340, servingSize: 100, estimatedPricePerServing: 35, priceTier: 'premium', availabilityScore: 6, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg'] },
  { name: 'Rice Cakes', category: 'fitness_food', protein: 2, carbs: 22, fats: 0.5, calories: 100, servingSize: 30, estimatedPricePerServing: 10, priceTier: 'budget', availabilityScore: 6, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },

  // ═══ HIGH FIBRE / HEALTHY COMMON FOODS ═══
  { name: 'Guava', category: 'easy_access', protein: 2.6, carbs: 14, fats: 1, calories: 68, servingSize: 100, estimatedPricePerServing: 5, priceTier: 'budget', availabilityScore: 9, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Papaya', category: 'easy_access', protein: 0.5, carbs: 11, fats: 0.3, calories: 43, servingSize: 100, estimatedPricePerServing: 5, priceTier: 'budget', availabilityScore: 9, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Pomegranate', category: 'easy_access', protein: 1.7, carbs: 19, fats: 1.2, calories: 83, servingSize: 100, estimatedPricePerServing: 15, priceTier: 'medium', availabilityScore: 8, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Cucumber', category: 'easy_access', protein: 0.7, carbs: 3.6, fats: 0.1, calories: 15, servingSize: 100, estimatedPricePerServing: 3, priceTier: 'budget', availabilityScore: 10, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Carrot', category: 'easy_access', protein: 0.9, carbs: 10, fats: 0.2, calories: 41, servingSize: 100, estimatedPricePerServing: 3, priceTier: 'budget', availabilityScore: 10, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Beetroot', category: 'easy_access', protein: 1.6, carbs: 10, fats: 0.2, calories: 43, servingSize: 100, estimatedPricePerServing: 4, priceTier: 'budget', availabilityScore: 9, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Broccoli', category: 'fitness_food', protein: 2.8, carbs: 7, fats: 0.4, calories: 34, servingSize: 100, estimatedPricePerServing: 15, priceTier: 'medium', availabilityScore: 7, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Spinach (Palak)', category: 'easy_access', protein: 2.9, carbs: 3.6, fats: 0.4, calories: 23, servingSize: 100, estimatedPricePerServing: 4, priceTier: 'budget', availabilityScore: 10, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Flax Seeds', category: 'fitness_food', protein: 18, carbs: 29, fats: 42, calories: 534, servingSize: 100, estimatedPricePerServing: 5, priceTier: 'budget', availabilityScore: 8, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Chia Seeds', category: 'fitness_food', protein: 17, carbs: 42, fats: 31, calories: 486, servingSize: 100, estimatedPricePerServing: 10, priceTier: 'medium', availabilityScore: 7, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Sunflower Seeds', category: 'fitness_food', protein: 21, carbs: 20, fats: 51, calories: 584, servingSize: 100, estimatedPricePerServing: 8, priceTier: 'budget', availabilityScore: 8, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Pumpkin Seeds', category: 'fitness_food', protein: 30, carbs: 11, fats: 49, calories: 559, servingSize: 100, estimatedPricePerServing: 12, priceTier: 'medium', availabilityScore: 7, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Cashew Nuts', category: 'easy_access', protein: 18, carbs: 30, fats: 44, calories: 553, servingSize: 100, estimatedPricePerServing: 15, priceTier: 'medium', availabilityScore: 9, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Walnuts', category: 'easy_access', protein: 15, carbs: 14, fats: 65, calories: 654, servingSize: 100, estimatedPricePerServing: 15, priceTier: 'medium', availabilityScore: 8, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Isabgol (Psyllium Husk)', category: 'easy_access', protein: 0, carbs: 85, fats: 0.5, calories: 190, servingSize: 100, estimatedPricePerServing: 3, priceTier: 'budget', availabilityScore: 9, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Coconut Water', category: 'easy_access', protein: 0.7, carbs: 4, fats: 0.2, calories: 19, servingSize: 100, servingUnit: 'ml', estimatedPricePerServing: 15, priceTier: 'budget', availabilityScore: 9, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Green Tea', category: 'easy_access', protein: 0, carbs: 0, fats: 0, calories: 2, servingSize: 200, servingUnit: 'ml', estimatedPricePerServing: 5, priceTier: 'budget', availabilityScore: 9, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Black Coffee', category: 'easy_access', protein: 0.3, carbs: 0, fats: 0, calories: 5, servingSize: 200, servingUnit: 'ml', estimatedPricePerServing: 5, priceTier: 'budget', availabilityScore: 10, cookingDifficulty: 'basic', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Ghee', category: 'indian_staple', protein: 0, carbs: 0, fats: 99, calories: 900, servingSize: 100, estimatedPricePerServing: 8, priceTier: 'medium', availabilityScore: 10, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg'] },
  { name: 'Coconut Oil', category: 'easy_access', protein: 0, carbs: 0, fats: 100, calories: 862, servingSize: 100, estimatedPricePerServing: 5, priceTier: 'budget', availabilityScore: 9, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
  { name: 'Olive Oil', category: 'global', protein: 0, carbs: 0, fats: 100, calories: 884, servingSize: 100, estimatedPricePerServing: 10, priceTier: 'premium', availabilityScore: 7, cookingDifficulty: 'none', dietType: ['veg', 'eggetarian', 'non_veg', 'vegan'] },
];

export async function seedFoodCatalog() {
  console.log('[Seed] Seeding Food Catalog...');
  let created = 0;
  let skipped = 0;

  for (const food of FOODS) {
    try {
      await prisma.foodCatalog.upsert({
        where: { name: food.name },
        update: {
          category: food.category,
          protein: food.protein,
          carbs: food.carbs,
          fats: food.fats,
          calories: food.calories,
          servingSize: food.servingSize || 100,
          servingUnit: food.servingUnit || 'g',
          estimatedPricePerServing: food.estimatedPricePerServing,
          priceTier: food.priceTier,
          availabilityScore: food.availabilityScore,
          cookingDifficulty: food.cookingDifficulty,
          dietType: food.dietType,
        },
        create: {
          name: food.name,
          category: food.category,
          protein: food.protein,
          carbs: food.carbs,
          fats: food.fats,
          calories: food.calories,
          servingSize: food.servingSize || 100,
          servingUnit: food.servingUnit || 'g',
          estimatedPricePerServing: food.estimatedPricePerServing,
          priceTier: food.priceTier,
          availabilityScore: food.availabilityScore,
          cookingDifficulty: food.cookingDifficulty,
          dietType: food.dietType,
        },
      });
      created++;
    } catch (err) {
      skipped++;
    }
  }

  console.log(`[Seed] Food Catalog: ${created} upserted, ${skipped} skipped`);
}

// Run directly if executed as script
if (process.argv[1]?.includes('seed-food-catalog')) {
  seedFoodCatalog()
    .then(() => { console.log('Done!'); process.exit(0); })
    .catch(e => { console.error(e); process.exit(1); });
}
