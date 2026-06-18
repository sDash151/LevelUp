import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getJobs, getJob, createJob, updateJob, deleteJob, getJobStats, generateAIPrep, startPreparation } from '../api';
import { useToast } from '@/design-system/components';

export function useJobs(filters = {}) {
  return useQuery({
    queryKey: ['jobs', filters],
    queryFn: async () => {
      const res = await getJobs(filters);
      return res.data ?? [];
    },
    placeholderData: [],
  });
}

export function useJob(id) {
  return useQuery({
    queryKey: ['jobs', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await getJob(id);
      return res.data?.job ?? res?.job ?? null;
    },
    enabled: !!id,
  });
}

export function useJobStats() {
  return useQuery({
    queryKey: ['jobs', 'stats'],
    queryFn: async () => {
      const res = await getJobStats();
      return res.data?.stats ?? res?.stats ?? res?.data ?? {};
    },
    placeholderData: {},
  });
}

export function useCreateJob() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: createJob,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['jobs'] }); toast.success('Job added!'); },
    onError: () => toast.error('Failed to add job'),
  });
}

export function useUpdateJob() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, data }) => updateJob(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['jobs'] }); toast.success('Job updated'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update'),
  });
}

export function useDeleteJob() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: deleteJob,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['jobs'] }); toast.success('Job deleted'); },
  });
}

export function useGenerateAIPrep() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (id) => generateAIPrep(id),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['jobs'] });
      if (data?.data?.locked) toast.info(data.data.message || 'Try again later');
      else if (data?.data?.error) toast.error(data.data.message || 'AI generation failed');
      else toast.success('AI Prep generated!');
    },
    onError: () => toast.error('AI service unavailable'),
  });
}

export function useStartPreparation() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (id) => startPreparation(id),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['jobs'] });
      if (data?.data?.xp) toast.success(`Preparation started! +${data.data.xp.xpAwarded} XP`);
      else toast.success('Preparation started!');
    },
    onError: () => toast.error('Failed to start preparation'),
  });
}
