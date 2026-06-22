import { useState, useEffect } from 'react';
import { Modal, Select } from '@/design-system/components';
import { useCreateGoal, useUpdateGoal, useDeleteGoal } from '../hooks/useFinance';
import { GOAL_TYPE_CONFIG } from '../utils';
import { Loader2, Trash2, AlertTriangle } from 'lucide-react';
import { useUser } from '@/features/auth/hooks/useAuth';
import { motion, AnimatePresence } from 'motion/react';

export function FinanceGoalFormModal({ isOpen, onClose, goalToEdit = null }) {
  const { data: user } = useUser();
  const currency = user?.baseCurrency || 'INR';

  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [goalType, setGoalType] = useState('CUSTOM');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();

  useEffect(() => {
    if (isOpen) {
      if (goalToEdit) {
        setTitle(goalToEdit.title || '');
        setTargetAmount(goalToEdit.targetAmount?.toString() || '');
        setCurrentAmount(goalToEdit.currentAmount?.toString() || '0');
        setDeadline(goalToEdit.deadline ? new Date(goalToEdit.deadline).toISOString().split('T')[0] : '');
        setGoalType(goalToEdit.goalType || 'CUSTOM');
      } else {
        setTitle('');
        setTargetAmount('');
        setCurrentAmount('0');
        setDeadline('');
        setGoalType('CUSTOM');
      }
      setShowConfirmDelete(false);
    }
  }, [isOpen, goalToEdit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !targetAmount) return;

    const data = {
      title,
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount) || 0,
      goalType,
      deadline: deadline || null,
    };

    if (goalToEdit) {
      updateGoal.mutate({ id: goalToEdit.id, data }, { onSuccess: onClose });
    } else {
      createGoal.mutate(data, { onSuccess: onClose });
    }
  };

  const handleDelete = () => {
    setShowConfirmDelete(true);
  };

  const confirmDelete = () => {
    deleteGoal.mutate(goalToEdit.id, { onSuccess: onClose });
  };

  const isPending = createGoal.isPending || updateGoal.isPending || deleteGoal.isPending;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={goalToEdit ? "Edit Financial Goal" : "Create New Goal"} size="md">
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait">
          {showConfirmDelete ? (
            <motion.div 
              key="delete-confirm"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
              className="py-6 flex flex-col items-center text-center px-4"
            >
              <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete this goal?</h3>
              <p className="text-sm text-gray-500 mb-8 max-w-[280px]">
                Are you sure you want to delete <strong>{goalToEdit?.title}</strong>? All associated history will be permanently removed. This action cannot be undone.
              </p>
              
              <div className="flex w-full gap-3">
                <button 
                  type="button" onClick={() => setShowConfirmDelete(false)} disabled={isPending}
                  className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  type="button" onClick={confirmDelete} disabled={isPending}
                  className="flex-1 py-3.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl transition-colors shadow-lg shadow-red-500/25 flex items-center justify-center disabled:opacity-50"
                >
                  {deleteGoal.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Yes, Delete'}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.form 
              key="form"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}
              onSubmit={handleSubmit} className="space-y-4 pt-2"
            >
        
        {/* Title */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase">Goal Name</label>
          <input 
            type="text" required
            value={title} onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Dream Home Downpayment"
            className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        {/* Goal Type */}
        <div className="space-y-1 relative z-10">
          <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
          <Select 
            value={goalType} 
            onChange={setGoalType}
            options={Object.entries(GOAL_TYPE_CONFIG).map(([key, config]) => ({
              value: key,
              label: `${config.icon} ${config.label}`
            }))}
            size="lg"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Target Amount */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Target ({currency})</label>
            <input 
              type="number" required min="1" step="0.01"
              value={targetAmount} onChange={e => setTargetAmount(e.target.value)}
              placeholder="10000"
              className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          {/* Deadline */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Target Date</label>
            <input 
              type="date" 
              value={deadline} onChange={e => setDeadline(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>

        {/* Current Amount (for manual reconciliation) */}
        <div className="space-y-1 pt-2 border-t border-gray-100">
          <label className="text-xs font-bold text-gray-500 uppercase flex items-center justify-between">
            <span>Current Balance ({currency})</span>
            {goalToEdit && <span className="text-[10px] text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">Reconciliation Only</span>}
          </label>
          <input 
            type="number" min="0" step="0.01"
            value={currentAmount} onChange={e => setCurrentAmount(e.target.value)}
            className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
          />
          <p className="text-[10px] text-gray-400">
            {goalToEdit 
              ? "Modify this manually to reconcile investment market losses/gains." 
              : "Starting amount if you've already saved for this."}
          </p>
        </div>

        {/* Actions */}
        <div className="pt-4 flex items-center gap-3">
          {goalToEdit && (
            <button 
              type="button" 
              onClick={handleDelete}
              disabled={isPending}
              className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50"
              title="Delete Goal"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
          
          <button 
            type="submit" 
            disabled={isPending}
            className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : (goalToEdit ? 'Save Changes' : 'Create Goal')}
          </button>
        </div>
        </motion.form>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
}
