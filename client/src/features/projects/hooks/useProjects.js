import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProjects, createProject, updateProject, deleteProject } from '../api';
import { useToast } from '@/design-system/components';

const MOCK = [
  { id: '1', name: 'LevelUp PWA', description: 'Full-stack life OS with React + Express + PostgreSQL', status: 'IN_PROGRESS', priority: 'HIGH', techStack: ['React', 'Tailwind', 'Express', 'PostgreSQL', 'Prisma'], githubUrl: 'https://github.com/user/levelup', liveUrl: '', startDate: new Date(Date.now() - 20 * 86400000).toISOString(), endDate: null, updatedAt: new Date().toISOString() },
  { id: '2', name: 'Portfolio Website', description: 'Personal dev portfolio with blog and project showcase', status: 'COMPLETED', priority: 'MEDIUM', techStack: ['Next.js', 'Tailwind', 'MDX'], githubUrl: '', liveUrl: 'https://myportfolio.dev', startDate: new Date(Date.now() - 45 * 86400000).toISOString(), endDate: new Date(Date.now() - 5 * 86400000).toISOString(), updatedAt: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: '3', name: 'CLI Task Manager', description: 'Terminal-based todo app built with Node.js and Ink', status: 'PLANNING', priority: 'LOW', techStack: ['Node.js', 'Ink', 'SQLite'], githubUrl: '', liveUrl: '', startDate: null, endDate: null, updatedAt: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: '4', name: 'AI Code Reviewer', description: 'GitHub bot that reviews PRs using OpenAI API', status: 'ON_HOLD', priority: 'MEDIUM', techStack: ['Python', 'FastAPI', 'OpenAI'], githubUrl: 'https://github.com/user/ai-reviewer', liveUrl: '', startDate: new Date(Date.now() - 30 * 86400000).toISOString(), endDate: null, updatedAt: new Date(Date.now() - 10 * 86400000).toISOString() },
];

export function useProjects(status) {
  return useQuery({
    queryKey: ['projects', status],
    queryFn: async () => {
      const res = await getProjects({ status });
      return res.data ?? MOCK.filter((p) => !status || p.status === status);
    },
    placeholderData: MOCK.filter((p) => !status || p.status === status),
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({ mutationFn: createProject, onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); toast.success('Project created!'); }, onError: () => toast.error('Failed to create project') });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({ mutationFn: ({ id, data }) => updateProject(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); toast.success('Project updated'); } });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({ mutationFn: deleteProject, onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); toast.success('Project deleted'); } });
}
