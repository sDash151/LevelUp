import { useState } from 'react';
import { X, Plus, Trash2, Sparkles, Loader2, Apple } from 'lucide-react';
import { motion } from 'motion/react';
import { useLogFood, useSmartParseFood } from '../hooks/useFitness';

const MEAL_TYPES = ['breakfast', 'lunch', 'pre_workout', 'dinner', 'snacks'];

export default function FoodLogForm({ onClose, initialMealType = 'lunch', selectedDate = new Date().toISOString().split('T')[0] }) {
  const [mode, setMode] = useState('quick');
  const [smartText, setSmartText] = useState('');
  const [preview, setPreview] = useState(null);
  const [form, setForm] = useState({
    mealType: initialMealType,
    date: selectedDate,
    foodItems: [{ name: '', calories: 0, protein: 0, carbs: 0, fats: 0, quantity: '1 serving' }],
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
  });

  const logMut = useLogFood();
  const parseMut = useSmartParseFood();

  const addItem = () => setForm(f => ({ ...f, foodItems: [...f.foodItems, { name: '', calories: 0, protein: 0, carbs: 0, fats: 0, quantity: '1 serving' }] }));
  const removeItem = (i) => setForm(f => ({ ...f, foodItems: f.foodItems.filter((_, j) => j !== i) }));
  const updateItem = (i, field, val) => setForm(f => ({ ...f, foodItems: f.foodItems.map((item, j) => j === i ? { ...item, [field]: val } : item) }));

  const handleQuickSubmit = () => {
    if (form.foodItems.some(i => !i.name)) return;
    logMut.mutate(form, { onSuccess: () => onClose() });
  };

  const handleSmartParse = () => {
    if (!smartText.trim()) return;
    parseMut.mutate(smartText, { onSuccess: (d) => setPreview(d?.data?.parsed || d?.parsed || null) });
  };

  const handleSmartConfirm = () => {
    if (!preview) return;
    logMut.mutate({ mealType: form.mealType, foodItems: preview.items || [], time: form.time, date: form.date }, { onSuccess: () => onClose() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-2xl p-6" style={{ background: 'var(--th-card-solid)', border: '1px solid var(--th-border)' }}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.1)' }}><Apple className="w-5 h-5 text-emerald-500" /></div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--th-text)' }}>Log Food</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-black/5 transition"><X className="w-5 h-5" style={{ color: 'var(--th-text-secondary)' }} /></button>
        </div>

        {/* Mode toggle */}
        <div className="flex items-center gap-2 mb-4 p-1 rounded-xl" style={{ background: 'var(--th-bg-secondary)' }}>
          {[{ key: 'quick', label: 'Quick Log', icon: Apple }, { key: 'smart', label: 'Smart Log', icon: Sparkles }].map(m => (
            <button key={m.key} onClick={() => { setMode(m.key); setPreview(null); }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition"
              style={{ background: mode === m.key ? 'var(--th-card)' : 'transparent', color: mode === m.key ? 'var(--th-text)' : 'var(--th-text-secondary)' }}>
              <m.icon className="w-3.5 h-3.5" /> {m.label}
            </button>
          ))}
        </div>

        {/* Date and Time selectors */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1">
            <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--th-text-dim)' }}>Date</label>
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none cursor-pointer"
              style={{ background: 'var(--th-bg-secondary)', border: '1px solid var(--th-border)', color: 'var(--th-text)' }} />
          </div>
          <div className="flex-1">
            <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--th-text-dim)' }}>Time</label>
            <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none cursor-pointer"
              style={{ background: 'var(--th-bg-secondary)', border: '1px solid var(--th-border)', color: 'var(--th-text)' }} />
          </div>
        </div>

        {/* Meal type selector */}
        <div className="flex flex-wrap gap-2 mb-4">
          {MEAL_TYPES.map(t => (
            <button key={t} onClick={() => setForm(f => ({ ...f, mealType: t }))}
              className="px-3 py-1.5 rounded-lg text-[11px] font-medium transition"
              style={{ background: form.mealType === t ? 'var(--th-primary)' : 'var(--th-bg-secondary)', color: form.mealType === t ? '#fff' : 'var(--th-text-secondary)' }}>
              {t.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </button>
          ))}
        </div>

        {mode === 'smart' ? (
          <div className="space-y-4">
            <textarea value={smartText} onChange={e => setSmartText(e.target.value)}
              placeholder="e.g., 2 eggs, 2 roti, 1 cup dal, glass of milk, banana"
              className="w-full h-28 px-4 py-3 rounded-xl text-sm resize-none outline-none"
              style={{ background: 'var(--th-bg-secondary)', border: '1px solid var(--th-border)', color: 'var(--th-text)' }} />
            <button onClick={handleSmartParse} disabled={parseMut.isPending || !smartText.trim()}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
              {parseMut.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Parsing...</> : <><Sparkles className="w-4 h-4" /> Parse with AI</>}
            </button>
            {preview && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2 p-4 rounded-xl" style={{ background: 'var(--th-bg-secondary)' }}>
                <h4 className="text-sm font-semibold" style={{ color: 'var(--th-text)' }}>Preview</h4>
                {(preview.items || []).map((item, i) => (
                  <div key={i} className="flex justify-between p-2.5 rounded-lg" style={{ background: 'var(--th-card)' }}>
                    <div>
                      <p className="text-xs font-medium" style={{ color: 'var(--th-text)' }}>{item.name}</p>
                      <p className="text-[9px]" style={{ color: 'var(--th-text-dim)' }}>{item.quantity}</p>
                    </div>
                    <div className="text-right text-[10px]" style={{ color: 'var(--th-text-secondary)' }}>
                      <p className="font-bold">{item.calories} kcal</p>
                      <p>P:{item.protein}g C:{item.carbs}g F:{item.fats}g</p>
                    </div>
                  </div>
                ))}
                <button onClick={handleSmartConfirm} disabled={logMut.isPending}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50" style={{ background: '#10B981' }}>
                  {logMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Confirm & Log
                </button>
              </motion.div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {form.foodItems.map((item, i) => (
              <div key={i} className="p-3 rounded-xl" style={{ background: 'var(--th-bg-secondary)', border: '1px solid var(--th-border)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <input type="text" value={item.name} onChange={e => updateItem(i, 'name', e.target.value)} placeholder="Food name" className="flex-1 px-2 py-1.5 rounded-lg text-xs outline-none" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)', color: 'var(--th-text)' }} />
                  {form.foodItems.length > 1 && <button onClick={() => removeItem(i)}><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {['calories', 'protein', 'carbs', 'fats'].map(f => (
                    <div key={f}>
                      <label className="text-[9px] block mb-0.5" style={{ color: 'var(--th-text-dim)' }}>{f.charAt(0).toUpperCase() + f.slice(1)}</label>
                      <input type="number" value={item[f]} onChange={e => updateItem(i, f, parseFloat(e.target.value) || 0)} className="w-full px-2 py-1 rounded text-[11px] outline-none" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)', color: 'var(--th-text)' }} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <button onClick={addItem} className="flex items-center gap-1 text-[11px] font-medium" style={{ color: 'var(--th-primary)' }}><Plus className="w-3 h-3" /> Add Item</button>
            <button onClick={handleQuickSubmit} disabled={logMut.isPending}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
              {logMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Apple className="w-4 h-4" />} Log Food
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
