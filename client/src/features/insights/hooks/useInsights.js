import { useQuery } from '@tanstack/react-query';
import { getInsights } from '../api';

const MOCK_INSIGHTS = [
  { type: 'success', category: 'habits', title: 'Crushing your habits!', description: '85% completion rate this week. You\'re building strong routines.', metric: '85%' },
  { type: 'warning', category: 'goals', title: '1 goal due soon', description: '"Build Portfolio Website" needs attention — deadline within 7 days.', metric: '1' },
  { type: 'success', category: 'dsa', title: 'Strong DSA week!', description: '7 problems tackled, 5 solved. Consistency is key.', metric: '7' },
  { type: 'info', category: 'jobs', title: '3 active applications', description: 'Good pipeline. Focus on preparation for upcoming interviews.', metric: '3' },
  { type: 'success', category: 'fitness', title: 'Great fitness week!', description: '4 workouts completed. Your consistency is paying off.', metric: '4' },
  { type: 'success', category: 'finance', title: 'Excellent savings!', description: '72% savings rate this month. You\'re building wealth.', metric: '72%' },
  { type: 'tip', category: 'reflections', title: 'Take time to reflect', description: 'Journaling boosts self-awareness. Write a quick reflection today.', metric: '0' },
  { type: 'success', category: 'jobs', title: '1 offer pending!', description: 'Congratulations! Review your offers carefully.', metric: '1' },
];

export function useInsights() {
  return useQuery({
    queryKey: ['insights'],
    queryFn: async () => {
      const res = await getInsights();
      return res.data?.insights ?? MOCK_INSIGHTS;
    },
    placeholderData: MOCK_INSIGHTS,
    staleTime: 5 * 60 * 1000,
  });
}
