const fs = require('fs');

const catalog = JSON.parse(fs.readFileSync('../exercises_preview.json'));

const findClosestExercise = (generatedName, generatedMuscleGroup = '') => {
  if (!generatedName || !catalog || catalog.length === 0) return null;
  const cleanName = generatedName.toLowerCase().replace(/\([^)]*\)/g, '').trim();
  const searchWords = cleanName.match(/\b\w+\b/g) || [];

  let bestMatch = null;
  let maxScore = 0;

  for (const ex of catalog) {
    const exName = ex.name.toLowerCase().replace(/\([^)]*\)/g, '').trim();
    
    // Exact or substring match
    if (exName === cleanName || exName.includes(cleanName) || cleanName.includes(exName)) return ex;

    // Word intersection match
    const exWords = exName.match(/\b\w+\b/g) || [];
    let score = 0;
    for (const w of searchWords) {
      if (exWords.includes(w)) score++;
    }
    
    // Boost score if the catalog exercise's muscles align with the AI's intended muscle group
    if (generatedMuscleGroup) {
      const mg = generatedMuscleGroup.toLowerCase();
      const allMuscles = [...(ex.primaryMuscles || []), ...(ex.secondaryMuscles || [])].join(' ');
      if (allMuscles.includes(mg) || mg.includes('back') && allMuscles.includes('lats') || mg.includes('legs') && allMuscles.includes('quad')) {
        score += 2;
      }
    }

    // Penalize heavily if the equipment doesn't match
    const equipments = ['dumbbell', 'barbell', 'cable', 'machine', 'smith', 'band'];
    let equipmentMismatch = false;
    for (const eq of equipments) {
      if (searchWords.includes(eq) && !exWords.includes(eq)) equipmentMismatch = true;
      if (!searchWords.includes(eq) && exWords.includes(eq)) equipmentMismatch = true;
    }
    if (equipmentMismatch) score -= 3; // harsher penalty

    if (score > maxScore) {
      maxScore = score;
      bestMatch = ex;
    }
  }
  
  // Only return if reasonable match
  if (maxScore > 0) {
    return bestMatch;
  }
  
  // Fallback: If no match found, try to find an exercise that matches the inferred muscle group
  let fallbackMuscle = generatedMuscleGroup?.toLowerCase() || '';
  if (!fallbackMuscle) {
    if (cleanName.includes('tricep') || cleanName.includes('extension')) fallbackMuscle = 'triceps';
    else if (cleanName.includes('bicep') || cleanName.includes('curl')) fallbackMuscle = 'biceps';
    else if (cleanName.includes('chest') || cleanName.includes('press') || cleanName.includes('fly')) fallbackMuscle = 'chest';
    else if (cleanName.includes('back') || cleanName.includes('row') || cleanName.includes('pull')) fallbackMuscle = 'back';
    else if (cleanName.includes('leg') || cleanName.includes('squat')) fallbackMuscle = 'legs';
    else if (cleanName.includes('shoulder') || cleanName.includes('raise')) fallbackMuscle = 'shoulders';
    else if (cleanName.includes('core') || cleanName.includes('abs')) fallbackMuscle = 'core';
  }

  if (fallbackMuscle) {
    for (const ex of catalog) {
      const allMuscles = [...(ex.primaryMuscles || []), ...(ex.secondaryMuscles || [])].join(' ');
      if (allMuscles.includes(fallbackMuscle) || (fallbackMuscle.includes('back') && allMuscles.includes('lats')) || (fallbackMuscle.includes('legs') && allMuscles.includes('quad'))) {
        // Just return the first one that matches the equipment if possible
        const equipments = ['dumbbell', 'barbell', 'cable', 'machine', 'smith', 'band'];
        let hasEquipment = false;
        for (const eq of equipments) {
          if (searchWords.includes(eq) && ex.name.toLowerCase().includes(eq)) hasEquipment = true;
        }
        if (hasEquipment) return ex;
      }
    }
    // If we couldn't match equipment, just return any exercise for that muscle
    for (const ex of catalog) {
      const allMuscles = [...(ex.primaryMuscles || []), ...(ex.secondaryMuscles || [])].join(' ');
      if (allMuscles.includes(fallbackMuscle) || (fallbackMuscle.includes('back') && allMuscles.includes('lats')) || (fallbackMuscle.includes('legs') && allMuscles.includes('quad'))) {
        return ex;
      }
    }
  }

  return null;
};

const simulateSwapParams = (generatedName) => {
  const catalogItem = findClosestExercise(generatedName, undefined);
  
  let exactMuscles = undefined;
  if (catalogItem && catalogItem.primaryMuscles?.length > 0) {
    exactMuscles = catalogItem.primaryMuscles.join(',');
  } else {
    // Robust Fallback: Guess muscle from exercise name if fuzzy search fails
    const name = generatedName.toLowerCase();
    if (name.includes('tricep') || name.includes('extension') || name.includes('skull crusher')) exactMuscles = 'triceps';
    else if (name.includes('bicep') || name.includes('curl')) exactMuscles = 'biceps';
    else if (name.includes('chest') || name.includes('press') || name.includes('fly') || name.includes('push-up')) exactMuscles = 'chest';
    else if (name.includes('back') || name.includes('row') || name.includes('pull') || name.includes('lat')) exactMuscles = 'back';
    else if (name.includes('leg') || name.includes('squat') || name.includes('lunge') || name.includes('calf')) exactMuscles = 'legs';
    else if (name.includes('shoulder') || name.includes('raise')) exactMuscles = 'shoulders';
    else if (name.includes('core') || name.includes('abs') || name.includes('crunch') || name.includes('plank')) exactMuscles = 'core';
  }
    
  return { generatedName, mappedName: catalogItem ? catalogItem.name : 'NULL', exactMuscles: exactMuscles || 'full_body' };
};

const testCases = [
  "Overhead Dumbbell Extension",
  "Triceps Pushdown (Cable)",
  "Cable Triceps Pushdown",
  "Lat Pulldown",
  "Wide Grip Pulldown",
  "Barbell Squat",
  "Back Squat",
  "Romanian Deadlift (RDL)",
  "RDL",
  "Leg Press",
  "Seated Leg Curl",
  "Calf Raises",
  "Standing Calf Raise",
  "Chest Press Machine",
  "Incline Dumbbell Bench Press",
  "DB Incline Press",
  "Push-up",
  "Pushups",
  "Pull-up",
  "Dumbbell Lateral Raise",
  "Side Lateral Raises",
  "Arnold Press",
  "Crunch",
  "Plank",
  "Bicep Curls",
  "Barbell Curl",
  "Hammer Curls",
  "Pec Deck Fly",
  "Machine Chest Fly",
  "Crazy Upside Down Row", // Should fallback
  "Unknown Exercise", // Should fallback
  "Seated Row",
  "Skull Crusher"
];

const results = testCases.map(simulateSwapParams);
console.table(results);

// Check if any resulted in "full_body" (meaning all fallbacks failed)
const failed = results.filter(r => r.exactMuscles === 'full_body');
if (failed.length > 0) {
  console.log('\\nWARNING: The following exercises could not be mapped to any muscle group:');
  console.table(failed);
} else {
  console.log('\\nSUCCESS: All test cases were successfully mapped to a muscle group!');
}
