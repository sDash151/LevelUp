import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/design-system/components';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getProjectStats,
  getPipeline,
  movePipelineProject,
  getIntelligence,
  getProjectMetrics,
  getProjectLearnings,
  createProjectLearning,
  createProjectTask,
  updateProjectTask,
  getGithubRepos,
  analyzeProject,
  syncJobProjects,
  extractLearnings,
  askAi,
  getBuildSuggestions,
} from '../api.js';

const STAGE_LABELS = {
  IDEA: 'Idea',
  PLANNING: 'Planning',
  BUILDING: 'Building',
  TESTING: 'Testing',
  SHIPPED: 'Shipped',
  ARCHIVED: 'Archived',
};

function applyPipelineMove(cache, projectId, newStatus) {
  if (!cache) return cache;
  const pipeline = cache?.data?.pipeline ?? cache?.pipeline;
  if (!pipeline) return cache;

  let movedProject = null;
  const nextPipeline = {};

  for (const [status, items] of Object.entries(pipeline)) {
    const list = items || [];
    const idx = list.findIndex((p) => p.id === projectId);
    if (idx >= 0) {
      movedProject = { ...list[idx], status: newStatus };
      nextPipeline[status] = [...list.slice(0, idx), ...list.slice(idx + 1)];
    } else {
      nextPipeline[status] = list;
    }
  }

  if (!movedProject) return cache;

  nextPipeline[newStatus] = [...(nextPipeline[newStatus] || []), movedProject];

  if (cache?.data?.pipeline) {
    return { ...cache, data: { ...cache.data, pipeline: nextPipeline } };
  }
  return { ...cache, pipeline: nextPipeline };
}

// ── Query Hooks ────────────────────────────────────────────────

/** List projects with optional filters (status, category, search, etc.) */
export function useProjects(filters = {}) {
  return useQuery({
    queryKey: ['projects', filters],
    queryFn: () => getProjects(filters),
  });
}

/** Single project by ID */
export function useProject(id) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => getProject(id),
    enabled: !!id,
  });
}

/** Aggregate project stats */
export function useProjectStats() {
  return useQuery({
    queryKey: ['projects', 'stats'],
    queryFn: getProjectStats,
  });
}

/** Pipeline / Kanban view */
export function usePipeline() {
  return useQuery({
    queryKey: ['projects', 'pipeline'],
    queryFn: getPipeline,
  });
}

/** AI-powered intelligence insights */
export function useIntelligence() {
  return useQuery({
    queryKey: ['projects', 'intelligence'],
    queryFn: getIntelligence,
  });
}

/** Metrics for a single project */
export function useProjectMetrics(id) {
  return useQuery({
    queryKey: ['projects', id, 'metrics'],
    queryFn: () => getProjectMetrics(id),
    enabled: !!id,
  });
}

/** Learnings attached to a project */
export function useProjectLearnings(id, filters = {}) {
  return useQuery({
    queryKey: ['projects', id, 'learnings', filters],
    queryFn: () => getProjectLearnings(id, filters),
    enabled: !!id,
  });
}

/** GitHub repositories for project linking */
export function useGithubRepos() {
  return useQuery({
    queryKey: ['github', 'repos'],
    queryFn: getGithubRepos,
  });
}

// ── Mutation Hooks ─────────────────────────────────────────────

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createProject,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); },
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateProject(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteProject,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); },
  });
}

export function useMovePipelineProject() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: movePipelineProject,
    onMutate: async ({ projectId, newStatus }) => {
      await qc.cancelQueries({ queryKey: ['projects', 'pipeline'] });
      const previous = qc.getQueryData(['projects', 'pipeline']);
      qc.setQueryData(['projects', 'pipeline'], (old) => applyPipelineMove(old, projectId, newStatus));
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(['projects', 'pipeline'], ctx.previous);
      toast.error('Failed to move project');
    },
    onSuccess: (_data, { newStatus }) => {
      toast.success(`Moved to ${STAGE_LABELS[newStatus] || newStatus}`);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, data }) => createProjectTask(projectId, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); },
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, data }) => updateProjectTask(taskId, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); },
  });
}

export function useCreateLearning() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, data }) => createProjectLearning(projectId, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); },
  });
}

export function useAnalyzeProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: analyzeProject,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); },
  });
}

export function useJobSync() {
  return useMutation({ mutationFn: syncJobProjects });
}

export function useExtractLearnings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: extractLearnings,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); },
  });
}

export function useAskAi() {
  return useMutation({
    mutationFn: askAi,
  });
}

export function useBuildSuggestions(projectId) {
  return useQuery({
    queryKey: ['projects', projectId, 'intelligence', 'builder'],
    queryFn: () => getBuildSuggestions(projectId),
    enabled: !!projectId,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
