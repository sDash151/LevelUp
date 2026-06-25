import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import * as fitnessApi from '../api';

// ═══ Overview ═══
export function useFitnessOverview() {
  return useQuery({ queryKey: ['fitness', 'overview'], queryFn: fitnessApi.getOverview, staleTime: 2 * 60 * 1000 });
}

export function useAIOverviewInsight() {
  return useQuery({ queryKey: ['ai-insight', 'overview'], queryFn: fitnessApi.getAIOverviewInsight, staleTime: 24 * 60 * 60 * 1000 });
}

// ═══ Plan ═══
export function useFitnessPlan() {
  return useQuery({ queryKey: ['fitness', 'plan'], queryFn: fitnessApi.getPlan, staleTime: 5 * 60 * 1000 });
}

export function useWorkoutMemory() {
  return useQuery({ queryKey: ['fitness', 'plan', 'memory'], queryFn: fitnessApi.getWorkoutMemory, staleTime: 5 * 60 * 1000 });
}

export function useExerciseCatalog() {
  return useQuery({ queryKey: ['fitness', 'catalog', 'exercises'], queryFn: () => fitnessApi.getExerciseCatalog(), staleTime: 60 * 60 * 1000 });
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

export function useUpdateWorkout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fitnessApi.updateWorkout,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fitness'] }),
  });
}

export function useDeleteWorkout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fitnessApi.deleteWorkout,
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
    queryKey: ['ai-insight', 'nutrition', date],
    queryFn: () => fitnessApi.getAINutritionInsight(date),
    staleTime: 24 * 60 * 60 * 1000, // 24 hour cache
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

export function useUpdateFood() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fitnessApi.updateMealLog,
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
    onMutate: async ({ amount, date }) => {
      await qc.cancelQueries({ queryKey: ['fitness', 'nutrition', date] });
      const previousNutrition = qc.getQueryData(['fitness', 'nutrition', date]);
      
      if (previousNutrition) {
        qc.setQueryData(['fitness', 'nutrition', date], old => {
          if (!old) return old;
          
          const isNested = !!old.data;
          const oldNutrition = isNested ? old.data : old;
          
          const newNutrition = {
            ...oldNutrition,
            water: {
              ...(oldNutrition.water || {}),
              consumed: Math.max(0, (oldNutrition.water?.consumed || 0) + amount)
            }
          };

          return isNested ? { ...old, data: newNutrition } : newNutrition;
        });
      }
      return { previousNutrition, date };
    },
    onError: (err, variables, context) => {
      console.error('Failed to log water:', err);
      if (context?.previousNutrition) {
        qc.setQueryData(['fitness', 'nutrition', context.date], context.previousNutrition);
      }
    }
  });
}

// ═══ Progress ═══
export function useProgress(range) {
  return useQuery({
    queryKey: ['fitness', 'progress', range],
    queryFn: () => fitnessApi.getProgress(range),
    staleTime: 2 * 60 * 1000,
    placeholderData: keepPreviousData,
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
  return useQuery({ queryKey: ['ai-insight', 'progress'], queryFn: fitnessApi.getAIProgressInsight, staleTime: 24 * 60 * 60 * 1000 });
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

export function useToggleMilestone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isAchieved }) => fitnessApi.toggleMilestone(id, isAchieved),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fitness'] }),
  });
}

export function useDeleteMilestone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => fitnessApi.deleteMilestone(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fitness'] }),
  });
}

// ═══ AI Master Planner ═══
export function useActivePlans() {
  return useQuery({ queryKey: ['fitness', 'planner', 'active'], queryFn: fitnessApi.getActivePlans, staleTime: 5 * 60 * 1000 });
}

export function usePlanHistory() {
  return useQuery({
    queryKey: ['fitness', 'planner', 'history'],
    queryFn: () => api.get('/fitness/planner/history').then(res => res.data.data),
    staleTime: 5 * 60 * 1000,
  });
}




export function useExerciseSwaps(params) {
  return useQuery({ queryKey: ['fitness', 'swaps', params], queryFn: () => fitnessApi.getExerciseSwaps(params), staleTime: 5 * 60 * 1000 });
}

export function useNutritionDashboard() {
  return useQuery({ queryKey: ['fitness', 'nutrition', 'dashboard'], queryFn: fitnessApi.getNutritionDashboard, staleTime: 5 * 60 * 1000 });
}

export function useAdherenceScore() {
  return useQuery({ queryKey: ['fitness', 'planner', 'adherence'], queryFn: fitnessApi.getAdherenceScore, staleTime: 10 * 60 * 1000 });
}

export function useAdaptiveReview() {
  return useQuery({ queryKey: ['fitness', 'planner', 'review'], queryFn: fitnessApi.getAdaptiveReview, staleTime: 15 * 60 * 1000 });
}

export function useGenerateWorkoutPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fitnessApi.generateWorkoutPlan,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fitness'] }),
  });
}

export function useGenerateDietPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fitnessApi.generateDietPlan,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fitness'] }),
  });
}

export function useGenerateRecoveryPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fitnessApi.generateRecoveryPlan,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fitness'] }),
  });
}

export function useGenerateTransformationPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fitnessApi.generateTransformationPlan,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fitness'] }),
  });
}

export function useParseCoachMessage() {
  return useMutation({ mutationFn: fitnessApi.parseCoachMessage });
}

export function useGenerateFromChat() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fitnessApi.generateFromChat,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fitness'] }),
  });
}

export function useSwapMeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fitnessApi.swapMeal,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fitness', 'planner'] }),
  });
}

export function useSwapExercise() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fitnessApi.swapExercise,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fitness', 'planner'] }),
  });
}
