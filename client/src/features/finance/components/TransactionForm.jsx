import { useState, useEffect } from 'react';
import { Modal } from '@/design-system/components';
import { useCreateTransaction, useAILogTransaction } from '../hooks/useFinance';
import { CATEGORY_ICONS, CATEGORY_COLORS, MOOD_LABELS } from '../utils';
import { Loader2, Calendar, Tag, AlignLeft, Store, Smile, Hash, Plus, ArrowDownLeft, ArrowUpRight, Sparkles } from 'lucide-react';
import clsx from 'clsx';
import { useUser } from '@/features/auth/hooks/useAuth';

const INCOME_CATS = ['Salary', 'Freelance', 'Investments', 'Business', 'Gifts Received', 'Refunds', 'Side Hustle', 'Other Income'];
const EXPENSE_CATS = ['Food & Dining', 'Groceries', 'Rent & Mortgage', 'Transport', 'Fuel', 'Shopping', 'Subscriptions', 'Health & Fitness', 'Education', 'Entertainment', 'Bills & Utilities', 'Travel', 'Personal Care', 'Family & Kids', 'Pets', 'Gifts & Donations', 'Insurance', 'Taxes', 'Debt Payment', 'Other Expense'];

export function TransactionForm({ isOpen, onClose, type: defaultType = 'EXPENSE', initialAiText = '' }) {
  const { data: user } = useUser();
  const currencySymbol = user?.baseCurrency === 'USD' ? '$' : '₹'; // simplistic fallback, ideally mapped

  const [type, setType] = useState(defaultType);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(defaultType === 'INCOME' ? 'Salary' : 'Food & Dining');
  const [merchant, setMerchant] = useState('');
  const [mood, setMood] = useState('NEUTRAL');
  const [tagsText, setTagsText] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [aiText, setAiText] = useState('');

  const createTxn = useCreateTransaction();
  const aiLog = useAILogTransaction();

  // Reset form when opened or type changes
  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setCategory(type === 'INCOME' ? 'Salary' : 'Food & Dining');
      setMerchant('');
      setMood('NEUTRAL');
      setTagsText('');
      setNote('');
      setAiText(initialAiText || '');
      setDate(new Date().toISOString().split('T')[0]);

      if (initialAiText) {
        aiLog.mutate(initialAiText, {
          onSuccess: (res) => {
            const payload = res?.data;
            if (!payload) return;
            if (payload.type) setType(payload.type);
            if (payload.amount) setAmount(payload.amount.toString());
            if (payload.category) setCategory(payload.category);
            if (payload.merchant) setMerchant(payload.merchant);
            if (payload.mood) setMood(payload.mood);
            if (payload.description) setNote(payload.description);
            if (payload.tags && Array.isArray(payload.tags)) setTagsText(payload.tags.join(', '));
            setAiText(''); // Clear on success
          }
        });
      }
    }
  }, [isOpen, type, initialAiText]);

  const handleAIFill = () => {
    if (!aiText) return;
    aiLog.mutate(aiText, {
      onSuccess: (res) => {
        const payload = res?.data;
        if (!payload) return;
        if (payload.type) setType(payload.type);
        if (payload.amount) setAmount(payload.amount.toString());
        if (payload.category) setCategory(payload.category);
        if (payload.merchant) setMerchant(payload.merchant);
        if (payload.mood) setMood(payload.mood);
        if (payload.description) setNote(payload.description);
        if (payload.tags && Array.isArray(payload.tags)) setTagsText(payload.tags.join(', '));
        setAiText(''); // Clear on success
      }
    });
  };

  const isValid = 
    amount && parseFloat(amount) > 0 &&
    merchant && merchant.trim().length > 0 &&
    date &&
    category &&
    (type === 'INCOME' || mood);

  const handleSave = () => {
    if (!isValid) return;
    
    const tagsArray = tagsText
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    createTxn.mutate({
      type,
      amount: parseFloat(amount),
      category,
      merchant: merchant || null,
      mood: type === 'EXPENSE' ? mood : null, // Only expenses get mood tracking
      tags: tagsArray.length > 0 ? tagsArray : undefined,
      note: note || null,
      date: new Date(date).toISOString(),
    }, {
      onSuccess: () => {
        onClose();
        setAmount('');
      }
    });
  };

  const categories = type === 'INCOME' ? INCOME_CATS : EXPENSE_CATS;
  const isExpense = type === 'EXPENSE';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Transaction" size="md">
      <div className="space-y-8 pb-4">
        
        {/* AI Smart Logger */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-2xl border border-amber-100/50 mt-2">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <label className="text-[12px] font-bold text-amber-700">AI Magic Log</label>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={aiText}
              onChange={(e) => setAiText(e.target.value)}
              placeholder="e.g. spent 500 on uber today..."
              onKeyDown={(e) => e.key === 'Enter' && handleAIFill()}
              className="flex-1 bg-white border border-amber-200/50 rounded-xl px-4 py-2.5 text-[14px] font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-amber-900/30"
            />
            <button
              onClick={handleAIFill}
              disabled={!aiText || aiLog.isPending}
              className="px-4 bg-amber-500 text-white rounded-xl font-bold text-sm hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[50px]"
            >
              {aiLog.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Type Toggle */}
          <div className="flex p-1 bg-gray-100 rounded-2xl w-full max-w-[240px] mx-auto">
            <button
              onClick={() => setType('EXPENSE')}
              className={clsx(
                'flex-1 py-2 text-[13px] font-bold rounded-xl transition-all flex items-center justify-center gap-2',
                isExpense ? 'bg-white text-red-500 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <ArrowUpRight className="w-4 h-4" /> Expense
            </button>
            <button
              onClick={() => setType('INCOME')}
              className={clsx(
                'flex-1 py-2 text-[13px] font-bold rounded-xl transition-all flex items-center justify-center gap-2',
                !isExpense ? 'bg-white text-green-500 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <ArrowDownLeft className="w-4 h-4" /> Income
            </button>
          </div>

          {/* Amount Input */}
          <div className="flex flex-col items-center justify-center py-4">
            <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-2">Amount</p>
            <div className="flex items-center justify-center relative w-full">
              <span className={clsx("text-4xl font-light absolute left-[20%] transform -translate-x-full", isExpense ? "text-red-500" : "text-green-500")}>
                {currencySymbol}
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className={clsx(
                  "w-[60%] bg-transparent text-center text-5xl font-bold outline-none placeholder-gray-200",
                  isExpense ? "text-red-500" : "text-green-500"
                )}
                autoFocus
              />
            </div>
          </div>

          {/* Categories */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-gray-400" />
              <label className="text-[13px] font-bold text-gray-700">Category</label>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => {
                const isSelected = category === c;
                const icon = CATEGORY_ICONS[c] || (isExpense ? '💸' : '💰');
                return (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={clsx(
                      'px-3 py-2 rounded-xl text-[13px] font-bold transition-all flex items-center gap-2 border',
                      isSelected 
                        ? 'bg-gray-900 text-white border-gray-900 shadow-md transform scale-105' 
                        : 'bg-white text-gray-600 border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                    )}
                  >
                    <span className="text-sm">{icon}</span> {c}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Merchant & Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Store className="w-4 h-4 text-gray-400" />
                <label className="text-[12px] font-bold text-gray-600">Merchant</label>
              </div>
              <input
                type="text"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                placeholder="e.g. Starbucks"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <label className="text-[12px] font-bold text-gray-600">Date</label>
              </div>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              />
            </div>
          </div>

          {/* Mood Tracker (Only for Expenses) */}
          {isExpense && (
            <div className="pt-2">
              <div className="flex items-center gap-2 mb-3">
                <Smile className="w-4 h-4 text-gray-400" />
                <label className="text-[13px] font-bold text-gray-700">How did this purchase feel?</label>
              </div>
              <div className="flex gap-3">
                {Object.entries(MOOD_LABELS).map(([key, config]) => {
                  const isSelected = mood === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setMood(key)}
                      className={clsx(
                        'flex-1 flex flex-col items-center justify-center p-3 rounded-xl border transition-all',
                        isSelected ? `border-2 bg-gray-50 shadow-sm` : 'border-gray-100 bg-white hover:bg-gray-50 hover:border-gray-200'
                      )}
                      style={{ borderColor: isSelected ? config.color : undefined }}
                    >
                      <span className={clsx("text-2xl mb-1 transition-transform", isSelected && "transform scale-110")}>{config.emoji}</span>
                      <span className={clsx("text-[11px] font-bold", isSelected ? 'opacity-100' : 'opacity-50 text-gray-500')} style={{ color: isSelected ? config.color : undefined }}>
                        {config.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        {/* Tags */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Hash className="w-4 h-4 text-gray-400" />
            <label className="text-[12px] font-bold text-gray-600">Tags (comma separated)</label>
          </div>
          <input
            type="text"
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
            placeholder="e.g. vacation, gift, urgent"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
          />
        </div>

        {/* Notes */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <AlignLeft className="w-4 h-4 text-gray-400" />
            <label className="text-[12px] font-bold text-gray-600">Note (Optional)</label>
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add some details..."
            rows={2}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none"
          />
        </div>

      </div>

      {/* Footer Actions */}
      <div className="pt-6 mt-6 border-t border-gray-100 flex gap-3">
        <button
          onClick={onClose}
          className="px-6 py-3 rounded-xl text-[14px] font-bold text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-700 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!isValid || createTxn.isPending}
          className="flex-1 px-6 py-3 rounded-xl text-[14px] font-bold text-white bg-amber-500 hover:bg-amber-600 focus:ring-4 focus:ring-amber-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
        >
          {createTxn.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
          Save Transaction
        </button>
      </div>
    </Modal>
  );
}
