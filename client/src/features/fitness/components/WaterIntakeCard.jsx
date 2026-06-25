import { Droplets, ChevronDown, Plus, Minus } from 'lucide-react';
import { useLogWater } from '../hooks/useFitness';
import { useState, useRef, useEffect } from 'react';

function MugMeasurement({ consumed, goal, pct }) {
  return (
    <div className="relative w-24 h-28 rounded-2xl overflow-hidden border-4 border-blue-100 flex-shrink-0 drop-shadow-sm" style={{ background: 'var(--th-bg-secondary)' }}>
      <div className="absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-out" style={{ height: `${pct}%`, background: 'rgba(59,130,246,0.15)' }}>
        <div className="absolute inset-0 bg-gradient-to-t from-blue-500/40 to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-400/40 rounded-full blur-[1px]" />
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-extrabold tracking-tight leading-none text-blue-600 drop-shadow-sm">
          {consumed.toFixed(1)}L
        </span>
        <span className="text-[10px] font-bold mt-1 text-blue-400 uppercase tracking-wider">
          / {goal.toFixed(1)}L
        </span>
      </div>
    </div>
  );
}

export default function WaterIntakeCard({ water, selectedDate }) {
  const logWater = useLogWater();
  const baseConsumed = water?.consumed || 0;
  
  const [localAmount, setLocalAmount] = useState(0);
  const pendingAmountRef = useRef(0);
  const debounceTimeoutRef = useRef(null);

  const consumed = Math.max(0, baseConsumed + localAmount);
  const goal = water?.goal || 3.0;
  const pct = Math.min(100, Math.round((consumed / goal) * 100));

  const handleAdd = (amount) => {
    if (amount < 0 && consumed + amount < 0) return;
    setLocalAmount(prev => prev + amount);
    pendingAmountRef.current += amount;

    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    
    debounceTimeoutRef.current = setTimeout(() => {
      const finalAmount = pendingAmountRef.current;
      if (finalAmount !== 0) {
        logWater.mutate({ amount: finalAmount, date: selectedDate });
      }
      pendingAmountRef.current = 0;
      setLocalAmount(0);
    }, 600);
  };

  const mutateRef = useRef(logWater.mutate);
  mutateRef.current = logWater.mutate;

  // Flush any pending water logs if the component unmounts
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current && pendingAmountRef.current !== 0) {
        clearTimeout(debounceTimeoutRef.current);
        const finalAmount = pendingAmountRef.current;
        pendingAmountRef.current = 0; // CRITICAL FIX: prevent infinite loops
        mutateRef.current({ amount: finalAmount, date: selectedDate });
      }
    };
  }, [selectedDate]);

  return (
    <div className="rounded-3xl p-5 h-full flex flex-col justify-between" style={{ background: 'var(--th-card-solid)', border: '1px solid var(--th-border)', boxShadow: 'var(--th-shadow)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 text-blue-500" />
          <h3 className="text-sm font-bold" style={{ color: 'var(--th-text)' }}>Water Intake</h3>
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold px-2 py-1 cursor-pointer transition-opacity hover:opacity-80" style={{ color: 'var(--th-text-secondary)' }}>
          {selectedDate === new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0] ? 'Today' : new Date(selectedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </div>
      </div>

      {/* Body: Mug + Stats */}
      <div className="flex items-center justify-between mb-6 pr-2">
        <MugMeasurement consumed={consumed} goal={goal} pct={pct} />

        <div className="flex flex-col gap-3 text-right">
          <div>
            <p className="text-2xl font-extrabold text-blue-500 leading-none">{pct}%</p>
            <p className="text-[10px] font-medium mt-1" style={{ color: 'var(--th-text-secondary)' }}>of daily goal</p>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--th-text-secondary)' }}>Goal</p>
            <p className="text-sm font-bold" style={{ color: 'var(--th-text)' }}>{goal.toFixed(1)} L</p>
          </div>
        </div>
      </div>

      {/* Footer: Controls */}
      <div className="flex items-center gap-3">
        <button onClick={() => handleAdd(-0.25)} disabled={consumed <= 0}
          className="flex-1 h-10 rounded-xl flex items-center justify-center gap-1 text-xs font-bold transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100"
          style={{ background: 'rgba(59,130,246,0.1)', color: '#3B82F6' }}>
          <Minus className="w-3 h-3" /> 250ml
        </button>
        <button onClick={() => handleAdd(0.25)}
          className="flex-1 h-10 rounded-xl flex items-center justify-center gap-1 text-xs font-bold transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100"
          style={{ background: 'rgba(59,130,246,0.1)', color: '#3B82F6' }}>
          <Plus className="w-3 h-3" /> 250ml
        </button>
        <button onClick={() => handleAdd(0.5)}
          className="flex-1 h-10 rounded-xl flex items-center justify-center gap-1 text-xs font-bold transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100"
          style={{ background: 'rgba(59,130,246,0.1)', color: '#3B82F6' }}>
          <Plus className="w-3 h-3" /> 500ml
        </button>
      </div>
    </div>
  );
}
