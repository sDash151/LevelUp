import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getHabits, getHabitRichStats, createHabit, updateHabit, toggleHabitComplete, deleteHabit, getHabitCalendarStats, getAiInsight, planAIHabits, bulkCreateHabits } from '../api';
import { useToast } from '@/design-system/components';

export function useHabitCalendarStats(year, month, selectedDate) {
  return useQuery({
    queryKey: ['habits', 'calendar-stats', year, month, selectedDate],
    queryFn: async () => {
      const res = await getHabitCalendarStats(year, month, selectedDate);
      return res.data ?? null;
    },
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
    enabled: !!year && !!month,
  });
}


export function useHabits() {
  return useQuery({
    queryKey: ['habits'],
    queryFn: async () => {
      const res = await getHabits();
      return res.data?.habits ?? [];
    },
    staleTime: 30 * 1000,
  });
}

export function useHabitRichStats() {
  return useQuery({
    queryKey: ['habits', 'rich-stats'],
    queryFn: async () => {
      const res = await getHabitRichStats();
      return res.data ?? null;
    },
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });
}

export function useCreateHabit() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: createHabit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'summary'] });
      toast.success('Habit created!');
    },
    onError: () => toast.error('Failed to create habit'),
  });
}

export function useUpdateHabit() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, data }) => updateHabit(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      toast.success('Habit updated!');
    },
    onError: () => toast.error('Failed to update habit'),
  });
}

export function useToggleHabit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, date }) => toggleHabitComplete(id, date),
    onMutate: async ({ id, date }) => {
      await queryClient.cancelQueries({ queryKey: ['habits'] });
      const prev = queryClient.getQueryData(['habits']);
      const prevRich = queryClient.getQueryData(['habits', 'rich-stats']);
      const calendarKeys = queryClient.getQueriesData({ queryKey: ['habits', 'calendar-stats'] });

      queryClient.setQueryData(['habits'], (old) =>
        old?.map((h) => (h.id === id ? { ...h, completedToday: !h.completedToday } : h))
      );

      queryClient.setQueryData(['habits', 'rich-stats'], (old) => {
        if (!old) return old;
        return {
          ...old,
          habits: old.habits.map((h) => (h.id === id ? { ...h, completedToday: !h.completedToday } : h))
        };
      });

      calendarKeys.forEach(([key, oldData]) => {
        if (oldData && oldData.selectedDay) {
          queryClient.setQueryData(key, {
            ...oldData,
            selectedDay: {
              ...oldData.selectedDay,
              habits: oldData.selectedDay.habits.map(h => 
                h.id === id ? { ...h, completedToday: !h.completedToday } : h
              )
            }
          });
        }
      });

      return { prev, prevRich, calendarKeys };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['habits'], ctx.prev);
      if (ctx?.prevRich) queryClient.setQueryData(['habits', 'rich-stats'], ctx.prevRich);
      if (ctx?.calendarKeys) {
        ctx.calendarKeys.forEach(([key, oldData]) => {
          queryClient.setQueryData(key, oldData);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['habits', 'rich-stats'] });
      queryClient.invalidateQueries({ queryKey: ['habits', 'calendar-stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'summary'] });
    },
  });
}

export function useDeleteHabit() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: deleteHabit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['habits', 'rich-stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'summary'] });
      toast.success('Habit deleted');
    },
  });
}
export function useHabitAiInsight() {
  return useQuery({
    queryKey: ['habits', 'ai-insight'],
    queryFn: async () => {
      const res = await getAiInsight();
      return res.data?.insight ?? res?.insight ?? null;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function usePlanAIHabits() {
  const toast = useToast();
  return useMutation({
    mutationFn: planAIHabits,
    onError: () => toast.error('Failed to generate habit plan. Please try again.'),
  });
}

export function useBulkCreateHabits() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: bulkCreateHabits,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'summary'] });
      toast.success(`${data.data?.habits?.length || 'Habits'} created successfully!`);
    },
    onError: () => toast.error('Failed to add habits'),
  });
}

export function useRegenerateHabitAiInsight() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: () => getAiInsight(true),
    onSuccess: (data) => {
      const newInsight = data.data?.insight ?? data?.insight;
      if (newInsight) {
        queryClient.setQueryData(['habits', 'ai-insight'], newInsight);
      }
      toast.success('AI Insight regenerated successfully!');
    },
    onError: () => toast.error('Failed to regenerate AI insight'),
  });
}
