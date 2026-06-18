import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTransactions, createTransaction, deleteTransaction, getFinanceSummary } from '../api';
import { useToast } from '@/design-system/components';

const MOCK_TXS = [
  { id: '1', type: 'INCOME', amount: 85000, category: 'Salary', description: 'Monthly salary', date: new Date().toISOString(), isRecurring: true },
  { id: '2', type: 'EXPENSE', amount: 15000, category: 'Rent', description: 'Monthly rent', date: new Date().toISOString(), isRecurring: true },
  { id: '3', type: 'EXPENSE', amount: 4500, category: 'Food', description: 'Groceries & dining', date: new Date(Date.now() - 86400000).toISOString(), isRecurring: false },
  { id: '4', type: 'EXPENSE', amount: 2000, category: 'Transport', description: 'Uber rides', date: new Date(Date.now() - 2 * 86400000).toISOString(), isRecurring: false },
  { id: '5', type: 'EXPENSE', amount: 999, category: 'Subscriptions', description: 'Netflix + Spotify', date: new Date(Date.now() - 3 * 86400000).toISOString(), isRecurring: true },
  { id: '6', type: 'INCOME', amount: 12000, category: 'Freelance', description: 'UI design project', date: new Date(Date.now() - 5 * 86400000).toISOString(), isRecurring: false },
  { id: '7', type: 'EXPENSE', amount: 3500, category: 'Shopping', description: 'New headphones', date: new Date(Date.now() - 7 * 86400000).toISOString(), isRecurring: false },
  { id: '8', type: 'EXPENSE', amount: 1500, category: 'Health', description: 'Gym membership', date: new Date(Date.now() - 10 * 86400000).toISOString(), isRecurring: true },
];

const MOCK_SUMMARY = {
  monthlyIncome: 97000, monthlyExpense: 27499, savings: 69501,
  byCategory: [
    { category: 'Rent', amount: 15000 }, { category: 'Food', amount: 4500 },
    { category: 'Shopping', amount: 3500 }, { category: 'Transport', amount: 2000 },
    { category: 'Health', amount: 1500 }, { category: 'Subscriptions', amount: 999 },
  ],
};

export function useTransactions(filters = {}) {
  return useQuery({
    queryKey: ['finance', 'transactions', filters],
    queryFn: async () => { const res = await getTransactions(filters); return res.data ?? MOCK_TXS; },
    placeholderData: MOCK_TXS,
  });
}

export function useFinanceSummary() {
  return useQuery({
    queryKey: ['finance', 'summary'],
    queryFn: async () => { const res = await getFinanceSummary(); return res.data?.summary ?? MOCK_SUMMARY; },
    placeholderData: MOCK_SUMMARY,
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({ mutationFn: createTransaction, onSuccess: () => { qc.invalidateQueries({ queryKey: ['finance'] }); toast.success('Transaction added!'); }, onError: () => toast.error('Failed to add') });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({ mutationFn: deleteTransaction, onSuccess: () => { qc.invalidateQueries({ queryKey: ['finance'] }); toast.success('Transaction deleted'); } });
}
