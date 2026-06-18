import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWorkouts, createWorkout, deleteWorkout, getFitnessStats, logDailyFitness, getFitnessHistory } from '../api';
import { useToast } from '@/design-system/components';

const MOCK_WORKOUTS = [
  { id: '1', type: 'STRENGTH', name: 'Upper Body Push', duration: 55, caloriesBurned: 320, notes: 'Bench press PR: 80kg', exercises: [{ name: 'Bench Press', sets: 4, reps: 8, weight: 80 }, { name: 'Overhead Press', sets: 3, reps: 10, weight: 40 }, { name: 'Tricep Dips', sets: 3, reps: 12 }], date: new Date().toISOString() },
  { id: '2', type: 'CARDIO', name: 'Morning Run', duration: 35, caloriesBurned: 380, notes: '5K in 28 mins', exercises: [{ name: 'Running', duration: 35 }], date: new Date(Date.now() - 86400000).toISOString() },
  { id: '3', type: 'YOGA', name: 'Flexibility Flow', duration: 40, caloriesBurned: 150, notes: 'Focus on hip openers', exercises: [], date: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: '4', type: 'HIIT', name: 'Full Body HIIT', duration: 25, caloriesBurned: 290, notes: 'Tabata style', exercises: [{ name: 'Burpees', sets: 4, reps: 15 }, { name: 'Mountain Climbers', sets: 4, reps: 20 }, { name: 'Jump Squats', sets: 4, reps: 12 }], date: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: '5', type: 'STRENGTH', name: 'Leg Day', duration: 60, caloriesBurned: 400, notes: 'Squat day!', exercises: [{ name: 'Squats', sets: 5, reps: 5, weight: 100 }, { name: 'Leg Press', sets: 4, reps: 10, weight: 150 }, { name: 'Calf Raises', sets: 4, reps: 15, weight: 60 }], date: new Date(Date.now() - 4 * 86400000).toISOString() },
];

const MOCK_STATS = { totalWorkouts: 42, thisWeek: 4, totalMinutes: 2100, byType: [{ type: 'STRENGTH', _count: { id: 20 } }, { type: 'CARDIO', _count: { id: 12 } }, { type: 'HIIT', _count: { id: 6 } }, { type: 'YOGA', _count: { id: 4 } }] };

const MOCK_HISTORY = Array.from({ length: 14 }, (_, i) => ({
  date: new Date(Date.now() - (13 - i) * 86400000).toISOString(),
  weight: 72 + Math.random() * 2 - 1,
  steps: Math.floor(5000 + Math.random() * 8000),
  water: 2 + Math.random() * 2,
  sleep: 6 + Math.random() * 2.5,
}));

export function useWorkouts(type) {
  return useQuery({
    queryKey: ['fitness', 'workouts', type],
    queryFn: async () => { const res = await getWorkouts({ type }); return res.data ?? MOCK_WORKOUTS.filter((w) => !type || w.type === type); },
    placeholderData: MOCK_WORKOUTS.filter((w) => !type || w.type === type),
  });
}

export function useFitnessStats() {
  return useQuery({
    queryKey: ['fitness', 'stats'],
    queryFn: async () => { const res = await getFitnessStats(); return res.data?.stats ?? MOCK_STATS; },
    placeholderData: MOCK_STATS,
  });
}

export function useFitnessHistory() {
  return useQuery({
    queryKey: ['fitness', 'history'],
    queryFn: async () => { const res = await getFitnessHistory(30); return res.data?.history ?? MOCK_HISTORY; },
    placeholderData: MOCK_HISTORY,
  });
}

export function useCreateWorkout() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({ mutationFn: createWorkout, onSuccess: () => { qc.invalidateQueries({ queryKey: ['fitness'] }); toast.success('Workout logged!'); }, onError: () => toast.error('Failed to log workout') });
}

export function useDeleteWorkout() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({ mutationFn: deleteWorkout, onSuccess: () => { qc.invalidateQueries({ queryKey: ['fitness'] }); toast.success('Workout deleted'); } });
}

export function useLogDaily() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({ mutationFn: logDailyFitness, onSuccess: () => { qc.invalidateQueries({ queryKey: ['fitness'] }); toast.success('Daily log saved!'); } });
}
