import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDsaProblems, createDsaProblem, updateDsaProblem, deleteDsaProblem, getDsaStats } from '../api';
import { useToast } from '@/design-system/components';

const MOCK_PROBLEMS = [
  { id: '1', title: 'Two Sum', platform: 'LeetCode', difficulty: 'EASY', topic: 'Arrays', status: 'SOLVED', timeSpent: 15, rating: 4, url: 'https://leetcode.com/problems/two-sum', notes: 'Used hash map for O(n)', createdAt: new Date().toISOString() },
  { id: '2', title: 'Valid Parentheses', platform: 'LeetCode', difficulty: 'EASY', topic: 'Stack', status: 'SOLVED', timeSpent: 10, rating: 5, url: '', notes: '', createdAt: new Date().toISOString() },
  { id: '3', title: 'Longest Substring Without Repeating Characters', platform: 'LeetCode', difficulty: 'MEDIUM', topic: 'Strings', status: 'SOLVED', timeSpent: 25, rating: 3, url: '', notes: 'Sliding window technique', createdAt: new Date().toISOString() },
  { id: '4', title: 'Merge Intervals', platform: 'LeetCode', difficulty: 'MEDIUM', topic: 'Arrays', status: 'REVISIT', timeSpent: 30, rating: 2, url: '', notes: 'Need to review sorting approach', createdAt: new Date().toISOString() },
  { id: '5', title: 'Binary Tree Level Order Traversal', platform: 'LeetCode', difficulty: 'MEDIUM', topic: 'Trees', status: 'SOLVED', timeSpent: 20, rating: 4, url: '', notes: 'BFS with queue', createdAt: new Date().toISOString() },
  { id: '6', title: 'Coin Change', platform: 'LeetCode', difficulty: 'MEDIUM', topic: 'Dynamic Programming', status: 'ATTEMPTED', timeSpent: 45, rating: 1, url: '', notes: 'Bottom-up DP. Need more practice.', createdAt: new Date().toISOString() },
  { id: '7', title: 'Word Search', platform: 'LeetCode', difficulty: 'MEDIUM', topic: 'Backtracking', status: 'TODO', timeSpent: 0, rating: null, url: '', notes: '', createdAt: new Date().toISOString() },
  { id: '8', title: 'Trapping Rain Water', platform: 'LeetCode', difficulty: 'HARD', topic: 'Arrays', status: 'TODO', timeSpent: 0, rating: null, url: '', notes: '', createdAt: new Date().toISOString() },
];

const MOCK_STATS = {
  total: 8,
  byDifficulty: [{ difficulty: 'EASY', _count: { id: 2 } }, { difficulty: 'MEDIUM', _count: { id: 5 } }, { difficulty: 'HARD', _count: { id: 1 } }],
  byTopic: [{ topic: 'Arrays', _count: { id: 3 } }, { topic: 'Dynamic Programming', _count: { id: 1 } }, { topic: 'Trees', _count: { id: 1 } }, { topic: 'Stack', _count: { id: 1 } }, { topic: 'Strings', _count: { id: 1 } }, { topic: 'Backtracking', _count: { id: 1 } }],
  byStatus: [{ status: 'SOLVED', _count: { id: 4 } }, { status: 'ATTEMPTED', _count: { id: 1 } }, { status: 'REVISIT', _count: { id: 1 } }, { status: 'TODO', _count: { id: 2 } }],
};

export function useDsaProblems(filters = {}) {
  return useQuery({
    queryKey: ['dsa', filters],
    queryFn: async () => {
      const res = await getDsaProblems(filters);
      return res.data ?? MOCK_PROBLEMS;
    },
    placeholderData: MOCK_PROBLEMS,
  });
}

export function useDsaStats() {
  return useQuery({
    queryKey: ['dsa', 'stats'],
    queryFn: async () => {
      const res = await getDsaStats();
      return res.data?.stats ?? MOCK_STATS;
    },
    placeholderData: MOCK_STATS,
  });
}

export function useCreateDsaProblem() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: createDsaProblem,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['dsa'] }); toast.success('Problem added!'); },
    onError: () => toast.error('Failed to add problem'),
  });
}

export function useUpdateDsaProblem() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, data }) => updateDsaProblem(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['dsa'] }); toast.success('Problem updated'); },
  });
}

export function useDeleteDsaProblem() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: deleteDsaProblem,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['dsa'] }); toast.success('Problem deleted'); },
  });
}
