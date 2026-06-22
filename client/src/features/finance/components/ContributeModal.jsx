import { useState, useEffect } from 'react';
import { Modal } from '@/design-system/components/Modal';
import { Select } from '@/design-system/components/Select';
import { useBuildData, useContributeToGoal, useUpdateTransaction, useUpdateGoal } from '../hooks/useFinance';
import { GOAL_TYPE_CONFIG, formatCurrency } from '../utils';
import { Loader2, Rocket } from 'lucide-react';
import { useUser } from '@/features/auth/hooks/useAuth';
import { motion } from 'motion/react';

export function ContributeModal({ isOpen, onClose, defaultGoal = null, editingTransaction = null }) {
  const { data } = useBuildData();
  const goals = data?.goals || [];
  const { data: user } = useUser();
  const currency = user?.baseCurrency || 'INR';
  
  const [selectedGoalId, setSelectedGoalId] = useState('');
  const [amount, setAmount] = useState('');
  const contribute = useContributeToGoal();
  const updateTxn = useUpdateTransaction();
  const updateGoal = useUpdateGoal();

  useEffect(() => {
    if (isOpen) {
      if (editingTransaction) {
        setAmount(editingTransaction.amount?.toString() || '');
        const matchedGoal = goals.find(g => g.title === editingTransaction.merchant);
        if (matchedGoal) {
          setSelectedGoalId(matchedGoal.id);
        } else if (goals.length > 0) {
          setSelectedGoalId(goals[0].id);
        }
      } else if (defaultGoal) {
        setSelectedGoalId(defaultGoal.id);
        setAmount('');
      } else if (goals.length > 0) {
        setSelectedGoalId(goals[0].id);
        setAmount('');
      }
    }
  }, [isOpen, defaultGoal, goals, editingTransaction]);

  const selectedGoal = goals.find(g => g.id === selectedGoalId) || defaultGoal;
  
  const allGoals = [...goals];
  if (defaultGoal && !goals.find(g => g.id === defaultGoal.id)) {
    allGoals.push(defaultGoal);
  }
  const goalOptions = allGoals.map(g => ({
    value: g.id,
    label: `${GOAL_TYPE_CONFIG[g.goalType]?.icon || '🎯'}  ${g.title}`
  }));
  
  const parsedAmount = parseFloat(amount) || 0;
  let currentProgress = 0;
  let newProgress = 0;
  let targetAmount = 0;
  let baseCurrent = 0;

  if (selectedGoal) {
    targetAmount = parseFloat(selectedGoal.targetAmount) || 1;
    const actualCurrent = parseFloat(selectedGoal.currentAmount) || 0;
    
    // If editing, the actualCurrent already includes editingTransaction.amount. Subtract it to get base.
    baseCurrent = editingTransaction ? Math.max(0, actualCurrent - editingTransaction.amount) : actualCurrent;
    
    currentProgress = Math.min((baseCurrent / targetAmount) * 100, 100);
    newProgress = Math.min(((baseCurrent + parsedAmount) / targetAmount) * 100, 100);
  }

  const handleSubmit = async () => {
    if (!selectedGoalId || parsedAmount <= 0) return;
    
    if (editingTransaction) {
      const matchedGoal = goals.find(g => g.id === selectedGoalId);
      const diff = parsedAmount - editingTransaction.amount;
      try {
        await updateTxn.mutateAsync({ id: editingTransaction.id, data: { amount: parsedAmount, merchant: matchedGoal?.title || editingTransaction.merchant } });
        if (matchedGoal) {
          await updateGoal.mutateAsync({ id: selectedGoalId, data: { currentAmount: Math.max(0, parseFloat(matchedGoal.currentAmount) + diff) } });
        }
        onClose();
      } catch (err) {
        console.error(err);
      }
    } else {
      contribute.mutate(
        { id: selectedGoalId, amount: parsedAmount },
        { onSuccess: () => onClose() }
      );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Fuel Your Future 🚀" size="md">
      <div className="space-y-8 pt-4 pb-2 px-2">
        
        {/* Goal Selector */}
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col items-center">
           <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Target Goal</label>
           <div className="w-full max-w-[320px]">
             <Select
               value={selectedGoalId}
               onChange={setSelectedGoalId}
               options={goalOptions}
               disabled={!!defaultGoal}
               size="lg"
             />
           </div>
        </motion.div>

        {/* Amount Input */}
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="flex flex-col items-center">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Investment Amount</label>
          <div className="relative flex items-center justify-center w-full group">
             <span className="text-3xl font-black text-gray-300 mr-2 select-none transition-colors group-focus-within:text-emerald-400">
                {currency === 'USD' ? '$' : '₹'}
             </span>
             <input 
               type="number"
               value={amount}
               onChange={e => setAmount(e.target.value)}
               placeholder="0"
               className="w-[220px] text-center text-6xl font-black text-emerald-500 bg-transparent border-none focus:ring-0 outline-none p-0 placeholder-gray-200 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
               style={{ MozAppearance: 'textfield' }}
             />
          </div>
          
          {/* Quick Add Chips */}
          <div className="flex items-center justify-center gap-2 mt-6">
             {[100, 500, 1000, 5000].map((val, i) => (
               <motion.button 
                 key={val} 
                 initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 + (i * 0.05), type: 'spring' }}
                 whileHover={{ scale: 1.05, backgroundColor: '#d1fae5', color: '#047857' }}
                 whileTap={{ scale: 0.95 }}
                 onClick={() => setAmount((parseFloat(amount || 0) + val).toString())}
                 className="px-4 py-2 rounded-xl text-xs font-bold transition-colors"
                 style={{ background: 'var(--th-card)', color: 'var(--th-text-secondary)', border: '1px solid var(--th-border)' }}
               >
                 +{val}
               </motion.button>
             ))}
          </div>
        </motion.div>

        {/* Dynamic Progress Preview */}
        {selectedGoal && (
          <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="border shadow-sm rounded-3xl p-5 relative overflow-hidden" style={{ background: 'var(--th-card)', borderColor: 'var(--th-border)' }}>
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500 opacity-20" />
             <div className="flex items-center justify-between text-xs mb-3">
                <span className="font-bold uppercase tracking-wider" style={{ color: 'var(--th-text-secondary)' }}>Completion</span>
                <motion.span 
                  key={newProgress}
                  initial={{ scale: 1.5, color: '#10B981' }} 
                  animate={{ scale: 1, color: '#059669' }} 
                  className="font-black text-base"
                >
                  {Math.floor(newProgress)}%
                </motion.span>
             </div>
             
             <div className="w-full h-3 rounded-full relative overflow-hidden shadow-inner" style={{ background: 'var(--th-bg)' }}>
                {/* Current */}
                <motion.div 
                  initial={{ width: 0 }} animate={{ width: `${currentProgress}%` }} transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="absolute left-0 top-0 bottom-0 rounded-full" 
                  style={{ background: 'var(--th-text-muted)' }}
                />
                {/* Projected */}
                <motion.div 
                  initial={{ width: 0 }} animate={{ left: `${currentProgress}%`, width: `${newProgress - currentProgress}%` }} transition={{ duration: 0.3 }}
                  className="absolute top-0 bottom-0 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]" 
                />
             </div>
             
             <div className="flex justify-between items-center mt-3">
               <p className="text-[10px] font-bold" style={{ color: 'var(--th-text-secondary)' }}>Current: {formatCurrency(baseCurrent + parsedAmount, currency, true)}</p>
               <p className="text-[10px] font-bold" style={{ color: 'var(--th-text-secondary)' }}>Target: {formatCurrency(targetAmount, currency, true)}</p>
             </div>
          </motion.div>
        )}

        {/* Submit */}
        <motion.button 
          initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
          whileHover={(!selectedGoalId || parsedAmount <= 0) ? {} : { scale: 1.02 }}
          whileTap={(!selectedGoalId || parsedAmount <= 0) ? {} : { scale: 0.98 }}
          onClick={handleSubmit} 
          disabled={!selectedGoalId || parsedAmount <= 0 || contribute.isPending || updateTxn.isPending}
          className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {editingTransaction ? (
            updateTxn.isPending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : <><Rocket className="w-5 h-5 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" /> Update Contribution</>
          ) : (
            contribute.isPending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : <><Rocket className="w-5 h-5 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" /> Confirm Investment</>
          )}
        </motion.button>

      </div>
    </Modal>
  );
}
