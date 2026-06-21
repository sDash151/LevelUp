import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as fitnessApi from '../api';

// ═══ Overview ═══
export function useFitnessOverview() {
  return useQuery({ queryKey: ['fitness', 'overview'], queryFn: fitnessApi.getOverview, staleTime: 2 * 60 * 1000 });
}

export function useAIOverviewInsight() {
  return useQuery({ queryKey: ['fitness', 'overview', 'ai-insight'], queryFn: fitnessApi.getAIOverviewInsight, staleTime: 60 * 60 * 1000 });
}

// ═══ Plan ═══
export function useFitnessPlan() {
  return useQuery({ queryKey: ['fitness', 'plan'], queryFn: fitnessApi.getPlan, staleTime: 5 * 60 * 1000 });
}

export function useWorkoutMemory() {
  return useQuery({ queryKey: ['fitness', 'plan', 'memory'], queryFn: fitnessApi.getWorkoutMemory, staleTime: 5 * 60 * 1000 });
}

export function useTopLifts() {
  return useQuery({ queryKey: ['fitness', 'plan', 'top-lifts'], queryFn: fitnessApi.getTopLiftsProgress, staleTime: 5 * 60 * 1000 });
}

export function usePlanInsights() {
  return useQuery({ queryKey: ['fitness', 'plan', 'insights'], queryFn: fitnessApi.getPlanInsights, staleTime: 5 * 60 * 1000 });
}

export function useOptimizePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fitnessApi.optimizePlan,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fitness', 'plan'] }),
  });
}

// ═══ Workouts ═══
export function useWorkoutStats() {
  return useQuery({ queryKey: ['fitness', 'workouts', 'stats'], queryFn: fitnessApi.getWorkoutStats, staleTime: 2 * 60 * 1000 });
}

export function useWorkoutHistory(filters = {}) {
  const queryParams = { ...filters };
  
  if (queryParams.timeframe) {
    const now = new Date();
    if (queryParams.timeframe === 'this_week') {
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      queryParams.startDate = start.toISOString();
    } else if (queryParams.timeframe === 'this_month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      queryParams.startDate = start.toISOString();
    } else if (queryParams.timeframe === 'this_year') {
      const start = new Date(now.getFullYear(), 0, 1);
      queryParams.startDate = start.toISOString();
    }
    delete queryParams.timeframe;
  }

  return useQuery({
    queryKey: ['fitness', 'workouts', filters],
    queryFn: () => fitnessApi.getWorkoutHistory(queryParams),
    staleTime: 2 * 60 * 1000,
  });
}

export function useLogWorkout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fitnessApi.logWorkout,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fitness'] }),
  });
}

export function useSmartParseWorkout() {
  return useMutation({ mutationFn: fitnessApi.smartParseWorkout });
}

export function useConfirmSmartLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fitnessApi.confirmSmartLog,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fitness'] }),
  });
}

// ═══ Nutrition ═══
export function useNutrition(date) {
  return useQuery({
    queryKey: ['fitness', 'nutrition', date],
    queryFn: () => fitnessApi.getNutrition(date),
    staleTime: 2 * 60 * 1000,
  });
}

export function useAINutritionInsight(date) {
  return useQuery({
    queryKey: ['fitness', 'nutrition', 'ai-insight', date],
    queryFn: () => fitnessApi.getAINutritionInsight(date),
    staleTime: 60 * 60 * 1000, // 1 hour cache
    enabled: false, // Only fetch when manually triggered
  });
}

export function useLogFood() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fitnessApi.logFood,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fitness'] }),
  });
}

export function useDeleteFood() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fitnessApi.deleteMealLog,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fitness'] }),
  });
}

export function useSmartParseFood() {
  return useMutation({ mutationFn: fitnessApi.smartParseFood });
}

export function useLogWater() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fitnessApi.logWater,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fitness'] }),
    onError: (err) => {
      console.error('Failed to log water:', err);
    }
  });
}

// ═══ Progress ═══
export function useProgress(range) {
  return useQuery({
    queryKey: ['fitness', 'progress', range],
    queryFn: () => fitnessApi.getProgress(range),
    staleTime: 2 * 60 * 1000,
  });
}

export function useLogBodyMetric() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fitnessApi.logBodyMetric,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fitness'] }),
  });
}

export function useLogMeasurement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fitnessApi.logMeasurement,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fitness'] }),
  });
}

export function useUploadPhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fitnessApi.uploadPhoto,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fitness', 'progress'] }),
  });
}

export function useAIProgressInsight() {
  return useQuery({ queryKey: ['fitness', 'progress', 'ai-insight'], queryFn: fitnessApi.getAIProgressInsight, staleTime: 60 * 60 * 1000 });
}

// ═══ Profile ═══
export function useFitnessProfile() {
  return useQuery({ queryKey: ['fitness', 'profile'], queryFn: fitnessApi.getProfile, staleTime: 10 * 60 * 1000 });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fitnessApi.updateProfile,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fitness'] }),
  });
}

// ═══ Milestones ═══
export function useMilestones() {
  return useQuery({ queryKey: ['fitness', 'milestones'], queryFn: fitnessApi.getMilestones, staleTime: 5 * 60 * 1000 });
}

export function useCreateMilestone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fitnessApi.createMilestone,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fitness'] }),
  });
}
