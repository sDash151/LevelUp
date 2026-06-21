import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Modal, Select } from '@/design-system/components';
import { useCategories, useCreateBudget, useUpdateBudget } from '../hooks/useFinance';

export default function BudgetModal({ isOpen, onClose, editingBudget = null }) {
  const qc = useQueryClient();
  const { data: categories } = useCategories();
  const createBudget = useCreateBudget();
  const updateBudget = useUpdateBudget();

  const [budgetForm, setBudgetForm] = useState({ categoryId: '', monthlyLimit: '' });

  useEffect(() => {
    if (isOpen) {
      if (editingBudget) {
        setBudgetForm({ categoryId: editingBudget.category?.id || '', monthlyLimit: editingBudget.monthlyLimit });
      } else {
        setBudgetForm({ categoryId: '', monthlyLimit: '' });
      }
    }
  }, [isOpen, editingBudget]);

  const handleSaveBudget = async () => {
    if (!budgetForm.categoryId || !budgetForm.monthlyLimit) return;
    try {
      const cat = categories?.find(c => c.id === budgetForm.categoryId);
      if (cat) {
        qc.setQueryData(['finance', 'spend'], (old) => {
          if (!old) return old;
          const newBudgetEngine = old.budgetEngine ? [...old.budgetEngine] : [];
          
          if (editingBudget) {
            const idx = newBudgetEngine.findIndex(b => b.id === editingBudget.id);
            if (idx >= 0) {
              newBudgetEngine[idx] = {
                ...newBudgetEngine[idx],
                category: { id: cat.id, name: cat.name },
                monthlyLimit: Number(budgetForm.monthlyLimit)
              };
            }
          } else {
            const existingIdx = newBudgetEngine.findIndex(b => b.category.id === cat.id);
            const newBudget = {
              category: { id: cat.id, name: cat.name },
              monthlyLimit: Number(budgetForm.monthlyLimit),
              spent: 0,
              riskPercent: 0,
              riskLevel: 'LOW'
            };
            if (existingIdx >= 0) newBudgetEngine[existingIdx] = newBudget;
            else newBudgetEngine.push(newBudget);
          }
          
          return { ...old, budgetEngine: newBudgetEngine };
        });
      }

      const payload = {
        categoryId: budgetForm.categoryId, 
        monthlyLimit: Number(budgetForm.monthlyLimit),
        month: new Date().toISOString().slice(0, 7)
      };

      onClose();

      if (editingBudget) {
        await updateBudget.mutateAsync({ id: editingBudget.id, data: payload });
      } else {
        await createBudget.mutateAsync(payload);
      }
      qc.invalidateQueries({ queryKey: ['finance'] });
    } catch (e) {
      console.error("Failed to save budget", e);
    }
  };

  const categoryOptions = [];
  const seenCats = new Set();
  (categories || []).forEach(c => {
    if (!seenCats.has(c.name)) {
      seenCats.add(c.name);
      categoryOptions.push({ value: c.id, label: c.name });
    }
  });

  const isPending = editingBudget ? updateBudget.isPending : createBudget.isPending;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingBudget ? 'Edit Budget' : 'Set Budget'} size="md">
      <div className="p-4 space-y-4">
        <div className="relative z-50">
          <label className="text-[11px] font-medium text-gray-500 block mb-1">Category</label>
          <Select 
            options={categoryOptions}
            value={budgetForm.categoryId}
            onChange={v => setBudgetForm({...budgetForm, categoryId: v})}
            placeholder="Select a category"
            searchable
          />
        </div>
        <div>
          <label className="text-[11px] font-medium text-gray-500 block mb-1">Monthly Limit</label>
          <input type="number" value={budgetForm.monthlyLimit} onChange={e => setBudgetForm({...budgetForm, monthlyLimit: e.target.value})} placeholder="e.g. 5000" className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5 text-[13px] font-medium outline-none focus:border-amber-500 text-gray-900" />
        </div>
        <div className="flex items-center gap-2 pt-2">
          <button onClick={onClose} className="flex-1 py-2 text-[12px] font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
          <button onClick={handleSaveBudget} disabled={isPending || !budgetForm.categoryId || !budgetForm.monthlyLimit} className="flex-1 py-2 text-[12px] font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors disabled:opacity-50">
            {isPending ? 'Saving...' : 'Save Budget'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
