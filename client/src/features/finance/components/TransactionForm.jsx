import { useState } from 'react';
import { Modal, Input, Button } from '@/design-system/components';
import clsx from 'clsx';

const INCOME_CATS = ['Salary', 'Freelance', 'Investment', 'Business', 'Refund', 'Other'];
const EXPENSE_CATS = ['Food', 'Rent', 'Transport', 'Shopping', 'Subscriptions', 'Health', 'Education', 'Entertainment', 'Bills', 'Other'];

export function TransactionForm({ isOpen, onClose, onSubmit }) {
  const [form, setForm] = useState({ type: 'EXPENSE', amount: '', category: 'Food', description: '', date: new Date().toISOString().split('T')[0], isRecurring: false });
  const categories = form.type === 'INCOME' ? INCOME_CATS : EXPENSE_CATS;

  const handleSave = () => {
    if (!form.amount || parseFloat(form.amount) <= 0) return;
    onSubmit?.({ ...form, amount: parseFloat(form.amount) });
    onClose();
    setForm({ type: 'EXPENSE', amount: '', category: 'Food', description: '', date: new Date().toISOString().split('T')[0], isRecurring: false });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Transaction" size="md">
      <div className="space-y-4">
        <div className="flex gap-2">
          {['INCOME', 'EXPENSE'].map((t) => (
            <button key={t} onClick={() => setForm((f) => ({ ...f, type: t, category: t === 'INCOME' ? 'Salary' : 'Food' }))} className={clsx('flex-1 py-2.5 rounded-xl text-sm font-medium transition-all', form.type === t ? t === 'INCOME' ? 'bg-success/20 text-success ring-1 ring-success/30' : 'bg-danger/20 text-danger ring-1 ring-danger/30' : 'bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08]')}>{t === 'INCOME' ? '💰 Income' : '💸 Expense'}</button>
          ))}
        </div>

        <Input label="Amount (₹)" type="number" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />

        <div>
          <label className="text-xs font-medium text-zinc-400 mb-2 block">Category</label>
          <div className="flex gap-1.5 flex-wrap">
            {categories.map((c) => (
              <button key={c} onClick={() => setForm((f) => ({ ...f, category: c }))} className={clsx('px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all', form.category === c ? 'bg-accent text-white' : 'bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08]')}>{c}</button>
            ))}
          </div>
        </div>

        <Input label="Description (optional)" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Date</label>
            <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className="w-full bg-zinc-900/60 border border-white/[0.06] rounded-xl px-3 py-2.5 text-sm text-white/90 outline-none focus:border-accent" />
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isRecurring} onChange={(e) => setForm((f) => ({ ...f, isRecurring: e.target.checked }))} className="accent-accent w-4 h-4" />
              <span className="text-xs text-zinc-400">Recurring</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={handleSave}>Add Transaction</Button>
        </div>
      </div>
    </Modal>
  );
}
