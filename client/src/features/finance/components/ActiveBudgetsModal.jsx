import { useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Modal } from '@/design-system/components';
import { useSpendData, useDeleteBudget } from '../hooks/useFinance';
import { useUser } from '@/features/auth/hooks/useAuth';
import { formatCurrency, getRiskColor, CATEGORY_ICONS } from '../utils';

export default function ActiveBudgetsModal({ isOpen, onClose, onOpenBudgetForm }) {
  const qc = useQueryClient();
  const { data } = useSpendData();
  const { data: user } = useUser();
  
  const deleteBudget = useDeleteBudget();
  
  const currency = user?.baseCurrency || 'INR';
  const budgetEngine = data?.budgetEngine || [];

  const handleDeleteBudget = async (id) => {
    try {
      qc.setQueryData(['finance', 'spend'], (old) => {
        if (!old) return old;
        const newBudgetEngine = old.budgetEngine ? old.budgetEngine.filter(b => b.id !== id) : [];
        return { ...old, budgetEngine: newBudgetEngine };
      });
      await deleteBudget.mutateAsync(id);
      qc.invalidateQueries({ queryKey: ['finance'] });
    } catch (e) {
      console.error("Failed to delete budget", e);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="All Active Budgets">
      <div className="p-4 max-h-[70vh] overflow-y-auto no-scrollbar">
        <div className="flex justify-end mb-4">
          <button onClick={() => onOpenBudgetForm()} className="text-[13px] font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
            <Plus className="w-4 h-4" /> Set Budget
          </button>
        </div>

        <div className="space-y-4">
          {budgetEngine.map((b) => {
            const progress = Math.min(b.riskPercent, 100);
            const percentage = b.riskPercent;
            const riskColorText = getRiskColor(percentage);
            const riskColorBg = riskColorText.replace('text-', 'bg-');
            return (
              <div key={b.id} className="bg-gray-50 border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                     <span className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-sm">{CATEGORY_ICONS[b.category?.name] || '💡'}</span>
                     <span className="text-[14px] font-bold text-gray-900">{b.category?.name || 'Budget'}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                     <span className="text-[13px] font-medium text-gray-500">
                       {formatCurrency(b.spent, currency, true)} <span className="text-gray-300 mx-0.5">/</span> {formatCurrency(b.monthlyLimit, currency, true)}
                     </span>
                     <div className="flex items-center gap-2">
                       <button 
                          onClick={() => onOpenBudgetForm(b)}
                          className="p-1 hover:bg-gray-100 rounded-md transition-colors text-gray-400 hover:text-amber-600"
                       >
                         <Edit2 className="w-3.5 h-3.5" />
                       </button>
                       <button 
                          onClick={() => handleDeleteBudget(b.id)}
                          className="p-1 hover:bg-red-50 rounded-md transition-colors text-gray-400 hover:text-red-500"
                          disabled={deleteBudget.isPending}
                       >
                         <Trash2 className="w-3.5 h-3.5" />
                       </button>
                       <span className={`text-[12px] font-bold px-2 py-0.5 rounded-md ${riskColorBg} bg-opacity-20 ${riskColorText}`}>
                         {percentage}%
                       </span>
                     </div>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden flex">
                  <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: riskColorText }} />
                </div>
              </div>
            );
          })}
          {budgetEngine.length === 0 && (
            <p className="text-center text-gray-500 py-8">No active budgets found. Create one!</p>
          )}
        </div>
      </div>
    </Modal>
  );
}
