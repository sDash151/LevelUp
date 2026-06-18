import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDashboardSummary } from '../api';
import { api } from '@/shared/utils/api-client';

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: async () => {
      const res = await getDashboardSummary();
      return res.data;
    },
    staleTime: 60 * 1000, // 1 min
    refetchOnWindowFocus: true,
  });
}

// ─── Focus session hooks ───
const focusApi = {
  start: (data) => api.post('/focus/start', data),
  complete: (id, actualMins) => api.put(`/focus/${id}/complete`, { actualMins }),
  today: () => api.get('/focus/today'),
};

export function useStartFocus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => focusApi.start(data).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dashboard', 'summary'] }),
  });
}

export function useCompleteFocus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, actualMins }) => focusApi.complete(id, actualMins).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dashboard', 'summary'] }),
  });
}

export function useTodayFocus() {
  return useQuery({
    queryKey: ['focus', 'today'],
    queryFn: () => focusApi.today().then((r) => r.data.data),
    staleTime: 30 * 1000,
  });
}
