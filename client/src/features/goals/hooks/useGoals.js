import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getGoals, getGoalStats, createGoal, updateGoal, deleteGoal, toggleMilestone } from '../api';
import { useToast } from '@/design-system/components';

/* ─── Fetch all goals ─── */
export function useGoals(type) {
  return useQuery({
    queryKey: ['goals', type],
    queryFn: async () => {
      const res = await getGoals(type);
      return res.data?.goals ?? res.goals ?? res ?? [];
    },
  });
}

/* ─── Fetch goal stats ─── */
export function useGoalStats(type) {
  return useQuery({
    queryKey: ['goals', 'stats', type],
    queryFn: async () => {
      const res = await getGoalStats(type);
      return res.data?.stats ?? res.stats ?? res.data ?? res ?? {};
    },
  });
}

/* ─── Create goal ─── */
export function useCreateGoal() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: createGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Goal created!');
    },
    onError: () => toast.error('Failed to create goal'),
  });
}

/* ─── Update goal ─── */
export function useUpdateGoal() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ id, data }) => updateGoal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Goal updated!');
    },
    onError: () => toast.error('Failed to update goal'),
  });
}

/* ─── Delete goal ─── */
export function useDeleteGoal() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: deleteGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Goal deleted');
    },
    onError: () => toast.error('Failed to delete goal'),
  });
}

/* ─── Toggle milestone ─── */
export function useToggleMilestone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ goalId, milestoneId }) => toggleMilestone(goalId, milestoneId),
    onMutate: async ({ goalId, milestoneId }) => {
      await queryClient.cancelQueries({ queryKey: ['goals'] });
      const allKeys = [['goals', 'WEEKLY'], ['goals', 'MONTHLY'], ['goals', undefined]];
      const snapshots = {};

      allKeys.forEach((key) => {
        const prev = queryClient.getQueryData(key);
        if (prev) {
          snapshots[JSON.stringify(key)] = prev;
          queryClient.setQueryData(key, (old) =>
            old?.map((g) =>
              g.id === goalId
                ? {
                    ...g,
                    milestones: g.milestones.map((m) =>
                      m.id === milestoneId ? { ...m, isCompleted: !m.isCompleted } : m
                    ),
                    progress: Math.round(
                      (g.milestones.filter((m) => (m.id === milestoneId ? !m.isCompleted : m.isCompleted)).length / g.milestones.length) * 100
                    ),
                  }
                : g
            )
          );
        }
      });

      return { snapshots };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.snapshots) {
        Object.entries(ctx.snapshots).forEach(([key, data]) => {
          queryClient.setQueryData(JSON.parse(key), data);
        });
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['goals'] }),
  });
}
