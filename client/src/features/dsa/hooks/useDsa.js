import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as dsaApi from '../api';

// ── Dashboard ──
export function useDsaDashboard() {
  return useQuery({
    queryKey: ['dsa', 'dashboard'],
    queryFn: async () => { const res = await dsaApi.getDsaDashboard(); return res.data; },
    placeholderData: null,
  });
}

// ── Paths ──
export function useDsaPaths() {
  return useQuery({
    queryKey: ['dsa', 'paths'],
    queryFn: async () => { const res = await dsaApi.getDsaPaths(); return res.data ?? []; },
    placeholderData: [],
  });
}

export function useDsaPath(slug) {
  return useQuery({
    queryKey: ['dsa', 'paths', slug],
    queryFn: async () => { const res = await dsaApi.getDsaPathDetail(slug); return res.data; },
    enabled: !!slug,
  });
}

export function useDsaPathProblems(slug, filters = {}) {
  return useQuery({
    queryKey: ['dsa', 'paths', slug, 'problems', filters],
    queryFn: async () => { const res = await dsaApi.getDsaPathProblems(slug, filters); return res; },
    enabled: !!slug,
    placeholderData: { data: [], pagination: {} },
  });
}

// ── Problem Detail ──
export function useDsaProblem(id) {
  return useQuery({
    queryKey: ['dsa', 'problems', id],
    queryFn: async () => { const res = await dsaApi.getDsaProblem(id); return res.data; },
    enabled: !!id,
  });
}

// ── Mutations ──
export function useSolveProblem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => dsaApi.solveDsaProblem(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dsa'] });
    },
  });
}

export function useUpdateDsaStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => dsaApi.updateDsaStatus(id, { status }),
    onMutate: async ({ id, status }) => {
      // Cancel outgoing refetches
      await qc.cancelQueries({ queryKey: ['dsa'] });

      // Snapshot the previous state (we only need the dashboard/path data where it's displayed, but there are multiple paths)
      // A more robust way is to invalidate locally after mutating the query cache
      // We will loop over the queries that start with ['dsa', 'paths'] and optimistically update the problem inside them
      const queries = qc.getQueriesData({ queryKey: ['dsa', 'paths'] });
      
      queries.forEach(([queryKey, oldData]) => {
        if (oldData && oldData.data && Array.isArray(oldData.data)) {
          qc.setQueryData(queryKey, {
            ...oldData,
            data: oldData.data.map(p => p.id === id ? { ...p, status } : p)
          });
        }
      });

      return { previousQueries: queries };
    },
    onError: (err, newTodo, context) => {
      // Revert on error
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, oldData]) => {
          qc.setQueryData(queryKey, oldData);
        });
      }
    },
    onSettled: () => {
      // Force a full refetch behind the scenes to ensure consistency
      qc.invalidateQueries({ queryKey: ['dsa'] });
    },
  });
}

export function useUpdateDsaNotes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }) => dsaApi.updateDsaNotes(id, { notes }),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['dsa', 'problems', variables.id] });
    },
  });
}

export function useReviseProblem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, performance }) => dsaApi.reviseDsaProblem(id, { performance }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dsa'] });
    },
  });
}

export function useSetActivePath() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (pathSlug) => dsaApi.setActiveDsaPath(pathSlug),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dsa'] });
    },
  });
}

// ── Engines ──
export function useDsaRevision() {
  return useQuery({
    queryKey: ['dsa', 'revision'],
    queryFn: async () => { const res = await dsaApi.getDsaRevision(); return res.data ?? []; },
    placeholderData: [],
  });
}

export function useDsaWeakness() {
  return useQuery({
    queryKey: ['dsa', 'weakness'],
    queryFn: async () => { const res = await dsaApi.getDsaWeakness(); return res.data; },
  });
}

export function useDsaRecommendations() {
  return useQuery({
    queryKey: ['dsa', 'recommendations'],
    queryFn: async () => { const res = await dsaApi.getDsaRecommendations(); return res.data; },
  });
}

export function useDsaCompanyMode() {
  return useQuery({
    queryKey: ['dsa', 'company-mode'],
    queryFn: async () => { const res = await dsaApi.getDsaCompanyMode(); return res.data; },
  });
}

export function useDsaPatterns() {
  return useQuery({
    queryKey: ['dsa', 'patterns'],
    queryFn: async () => { const res = await dsaApi.getDsaPatterns(); return res.data ?? []; },
    placeholderData: [],
  });
}

export function useDsaHeatmap() {
  return useQuery({
    queryKey: ['dsa', 'heatmap'],
    queryFn: async () => { const res = await dsaApi.getDsaHeatmap(); return res.data ?? []; },
    placeholderData: [],
  });
}

export function useDsaSearch(query) {
  return useQuery({
    queryKey: ['dsa', 'search', query],
    queryFn: async () => { const res = await dsaApi.searchDsaProblems(query); return res.data ?? []; },
    enabled: !!query && query.length >= 2,
    placeholderData: [],
  });
}

export function useDsaQuickResume() {
  return useQuery({
    queryKey: ['dsa', 'quick-resume'],
    queryFn: async () => { const res = await dsaApi.getDsaQuickResume(); return res.data; },
  });
}
