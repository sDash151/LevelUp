import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getReflections, createReflection, updateReflection, deleteReflection, getMoodHistory, getReflectionStats } from '../api';
import { useToast } from '@/design-system/components';

export function useReflections(type, page = 1, limit = 20) {
  return useQuery({
    queryKey: ['reflections', type, page, limit],
    queryFn: async () => {
      const res = await getReflections({ type, page, limit });
      return res.data ?? [];
    },
    placeholderData: [],
  });
}

export function useReflectionStats() {
  return useQuery({
    queryKey: ['reflections', 'stats'],
    queryFn: async () => {
      const res = await getReflectionStats();
      return res.data ?? res ?? {};
    },
  });
}

export function useCreateReflection() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: createReflection,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reflections'] });
      toast.success('Reflection saved!');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to save'),
  });
}

export function useUpdateReflection() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, data }) => updateReflection(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reflections'] });
      toast.success('Reflection updated!');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update'),
  });
}

export function useDeleteReflection() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: deleteReflection,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reflections'] });
      toast.success('Reflection deleted');
    },
  });
}

export function useMoodHistory() {
  return useQuery({
    queryKey: ['reflections', 'mood-history'],
    queryFn: async () => {
      const res = await getMoodHistory(30);
      return res.data?.history ?? res?.history ?? [];
    },
    placeholderData: [],
  });
}
