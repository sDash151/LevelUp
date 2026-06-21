import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as financeApi from '../api';

const STALE_2MIN = 2 * 60 * 1000;
const STALE_5MIN = 5 * 60 * 1000;

// ═══ Tab Data Hooks ═══

export function useFinanceOverview() {
  return useQuery({
    queryKey: ['finance', 'overview'],
    queryFn: financeApi.getOverview,
    staleTime: STALE_2MIN,
    select: (res) => res.data,
  });
}

export function useSpendData() {
  return useQuery({
    queryKey: ['finance', 'spend'],
    queryFn: financeApi.getSpendData,
    staleTime: STALE_2MIN,
    select: (res) => res.data,
  });
}

export function useMoodAnalytics() {
  return useQuery({
    queryKey: ['finance', 'moodAnalytics'],
    queryFn: financeApi.getMoodAnalytics,
    staleTime: STALE_5MIN,
    select: (res) => res.data,
  });
}

export function useBuildData() {
  return useQuery({
    queryKey: ['finance', 'build'],
    queryFn: financeApi.getBuildData,
    staleTime: STALE_2MIN,
    select: (res) => res.data,
  });
}

export function useProtectData() {
  return useQuery({
    queryKey: ['finance', 'protect'],
    queryFn: financeApi.getProtectData,
    staleTime: STALE_2MIN,
    select: (res) => res.data,
  });
}

export function useIntelligenceData() {
  return useQuery({
    queryKey: ['finance', 'intelligence'],
    queryFn: financeApi.getIntelligenceData,
    staleTime: STALE_2MIN,
    select: (res) => res.data,
  });
}

// ═══ Transaction Hooks ═══

export function useTransactions(filters = {}) {
  return useQuery({
    queryKey: ['finance', 'transactions', filters],
    queryFn: () => financeApi.getTransactions(filters),
    staleTime: STALE_2MIN,
    select: (res) => res.data,
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: financeApi.createTransaction,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['finance'] }),
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => financeApi.updateTransaction(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['finance'] }),
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: financeApi.deleteTransaction,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['finance'] }),
  });
}

export function useAILogTransaction() {
  return useMutation({
    mutationFn: financeApi.aiLogTransaction,
  });
}

// ═══ Account Hooks ═══

export function useAccounts() {
  return useQuery({
    queryKey: ['finance', 'accounts'],
    queryFn: financeApi.getAccounts,
    staleTime: STALE_5MIN,
    select: (res) => res.data,
  });
}

export function useCreateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: financeApi.createAccount,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['finance'] }),
  });
}

// ═══ Budget Hooks ═══

export function useBudgets(month) {
  return useQuery({
    queryKey: ['finance', 'budgets', month],
    queryFn: () => financeApi.getBudgets(month),
    staleTime: STALE_2MIN,
    select: (res) => res.data,
  });
}

export function useCreateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: financeApi.createBudget,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['finance'] }),
  });
}

export function useUpdateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => financeApi.updateBudget(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['finance'] }),
  });
}

export function useDeleteBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: financeApi.deleteBudget,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['finance'] }),
  });
}

// ═══ Goal Hooks ═══

export function useGoals() {
  return useQuery({
    queryKey: ['finance', 'goals'],
    queryFn: financeApi.getGoals,
    staleTime: STALE_2MIN,
    select: (res) => res.data,
  });
}

export function useCreateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: financeApi.createGoal,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['finance'] }),
  });
}

export function useUpdateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => financeApi.updateGoal(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['finance'] }),
  });
}

export function useContributeToGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, amount }) => financeApi.contributeToGoal(id, amount),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['finance'] }),
  });
}

// ═══ Subscription Hooks ═══

export function useSubscriptions() {
  return useQuery({
    queryKey: ['finance', 'subscriptions'],
    queryFn: financeApi.getSubscriptions,
    staleTime: STALE_5MIN,
    select: (res) => res.data,
  });
}

export function useCreateSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: financeApi.createSubscription,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['finance'] }),
  });
}

export function useDeleteSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: financeApi.deleteSubscription,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['finance'] }),
  });
}

// ═══ Debt Hooks ═══

export function useDebts() {
  return useQuery({
    queryKey: ['finance', 'debts'],
    queryFn: financeApi.getDebts,
    staleTime: STALE_5MIN,
    select: (res) => res.data,
  });
}

export function useCreateDebt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: financeApi.createDebt,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['finance'] }),
  });
}

// ═══ Bill Hooks ═══

export function useBills() {
  return useQuery({
    queryKey: ['finance', 'bills'],
    queryFn: financeApi.getBills,
    staleTime: STALE_5MIN,
    select: (res) => res.data,
  });
}

export function useCreateBill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: financeApi.createBill,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['finance'] }),
  });
}

export function usePayBill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: financeApi.payBill,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['finance'] }),
  });
}

// ═══ Insurance Hooks ═══

export function useInsurance() {
  return useQuery({
    queryKey: ['finance', 'insurance'],
    queryFn: financeApi.getInsurance,
    staleTime: STALE_5MIN,
    select: (res) => res.data,
  });
}

export function useCreateInsurance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: financeApi.createInsurance,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['finance'] }),
  });
}

// ═══ Streaks ═══

export function useStreaks() {
  return useQuery({
    queryKey: ['finance', 'streaks'],
    queryFn: financeApi.getStreaks,
    staleTime: STALE_2MIN,
    select: (res) => res.data,
  });
}

// ═══ Categories ═══

export function useCategories() {
  return useQuery({
    queryKey: ['finance', 'categories'],
    queryFn: financeApi.getCategories,
    staleTime: STALE_5MIN,
    select: (res) => res.data,
  });
}

// ═══ Reflections ═══

export function useCreateReflection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: financeApi.createReflection,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['finance'] }),
  });
}

// ═══ AI Intelligence Hooks ═══

export function useCFOInsight() {
  return useQuery({
    queryKey: ['finance', 'ai', 'cfo'],
    queryFn: financeApi.getCFOInsight,
    staleTime: STALE_5MIN,
    select: (res) => res.data,
  });
}

export function useSpendPersonality() {
  return useQuery({
    queryKey: ['finance', 'ai', 'personality'],
    queryFn: financeApi.getSpendPersonality,
    staleTime: STALE_5MIN,
    select: (res) => res.data,
  });
}

export function useLeakAnalysis() {
  return useQuery({
    queryKey: ['finance', 'ai', 'leaks'],
    queryFn: financeApi.getLeakAnalysis,
    staleTime: STALE_5MIN,
    select: (res) => res.data,
  });
}

export function useSavingsOpportunities() {
  return useQuery({
    queryKey: ['finance', 'ai', 'savings'],
    queryFn: financeApi.getSavingsOpportunities,
    staleTime: STALE_5MIN,
    select: (res) => res.data,
  });
}

export function useWeeklyChallenges() {
  return useQuery({
    queryKey: ['finance', 'ai', 'challenges'],
    queryFn: financeApi.getWeeklyChallenges,
    staleTime: STALE_5MIN,
    select: (res) => res.data,
  });
}

export function useWealthPlan() {
  return useQuery({
    queryKey: ['finance', 'ai', 'wealthPlan'],
    queryFn: financeApi.getWealthPlan,
    staleTime: STALE_5MIN,
    select: (res) => res.data,
  });
}

export function useRiskAlerts() {
  return useQuery({
    queryKey: ['finance', 'ai', 'riskAlerts'],
    queryFn: financeApi.getRiskAlerts,
    staleTime: STALE_5MIN,
    select: (res) => res.data,
  });
}
