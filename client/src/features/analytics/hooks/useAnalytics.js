import { useQuery } from '@tanstack/react-query';
import { getFullAnalytics } from '../api.js';

export const useFullAnalytics = () => {
  return useQuery({
    queryKey: ['analytics', 'full'],
    queryFn: getFullAnalytics,
    staleTime: 5 * 60 * 1000, // 5 mins
  });
};
