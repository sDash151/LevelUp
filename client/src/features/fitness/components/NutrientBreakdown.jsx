import { useState } from 'react';
import { Beef, Wheat, Droplet, Activity, Hexagon, Circle, Info } from 'lucide-react';
import clsx from 'clsx';
import { useToast, Modal } from '@/design-system/components';

const NUTRIENT_CONFIG = {
  protein: { color: '#10B981', icon: Beef },
  carbs: { color: '#F59E0B', icon: Wheat },
  fats: { color: '#EF4444', icon: Droplet },
  fiber: { color: '#8B5CF6', icon: Activity },
  sugar: { color: '#6366F1', icon: Hexagon },
  sodium: { color: '#E8A23A', icon: Circle },
};

export default function NutrientBreakdown({ nutrients }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toast = useToast();
  if (!nutrients) return null;
  const items = Object.entries(nutrients).map(([key, val]) => ({
    key,
    label: key.charAt(0).toUpperCase() + key.slice(1),
    consumed: val?.consumed || 0,
    goal: val?.goal || 100,
    color: NUTRIENT_CONFIG[key]?.color || '#9CA3AF',
    icon: NUTRIENT_CONFIG[key]?.icon || Activity,
    unit: key === 'sodium' ? 'mg' : 'g',
  }));

  return (
    <>
      <div className="rounded-3xl p-5 h-full" style={{ background: 'var(--th-card-solid)', border: '1px solid var(--th-border)', boxShadow: 'var(--th-shadow)' }}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-1.5 group relative">
            <h3 className="text-sm font-bold" style={{ color: 'var(--th-text)' }}>Nutrient Breakdown</h3>
            <Info className="w-3.5 h-3.5 cursor-help" style={{ color: 'var(--th-text-muted)' }} />
            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 p-2.5 rounded-xl text-[10px] font-medium shadow-xl z-10 pointer-events-none" style={{ background: 'var(--th-card)', color: 'var(--th-text)', border: '1px solid var(--th-border)' }}>
              Track your daily progress across essential macronutrients and micronutrients compared to your daily goals.
            </div>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="text-xs font-semibold px-2 py-1 rounded-md transition-colors hover:opacity-80" style={{ color: 'var(--th-text-dim)', background: 'var(--th-highlight)' }}>
            View Details
          </button>
        </div>

        <div className="space-y-4">
          {items.map(item => {
            const pct = Math.min(100, Math.round((item.consumed / item.goal) * 100));
            return (
              <div key={item.key} className="flex items-center gap-3">
                {/* Icon */}
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${item.color}15` }}>
                  <item.icon className="w-4 h-4" style={{ color: item.color }} />
                </div>
                
                {/* Label & Values */}
                <div className="flex-1 min-w-0 flex items-center justify-between">
                  <span className="text-xs font-bold w-16" style={{ color: 'var(--th-text)' }}>{item.label}</span>
                  <span className="text-[10px] font-semibold text-right w-20" style={{ color: 'var(--th-text)' }}>
                    {item.consumed.toLocaleString()}{item.unit} <span style={{ color: 'var(--th-text-muted)' }}>/ {item.goal.toLocaleString()}{item.unit}</span>
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-16 h-1.5 rounded-full overflow-hidden flex-shrink-0" style={{ background: 'rgba(0,0,0,0.06)' }}>
                  <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${pct}%`, background: item.color }} />
                </div>

                {/* Percentage */}
                <span className="text-[10px] font-bold text-right w-8 flex-shrink-0" style={{ color: 'var(--th-text-secondary)' }}>
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Detailed Nutrient Breakdown" size="md">
        <div className="space-y-4 pb-2">
           <div className="grid gap-3">
             {items.map(item => {
               const pct = Math.round((item.consumed / item.goal) * 100);
               const overLimit = pct > 100;
               return (
                 <div key={item.key} className="p-4 rounded-2xl" style={{ background: 'var(--th-bg)', border: '1px solid var(--th-border)' }}>
                   <div className="flex items-center justify-between mb-3">
                     <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm" style={{ background: item.color, color: 'white' }}>
                         <item.icon className="w-5 h-5" />
                       </div>
                       <div>
                         <h4 className="text-sm font-bold" style={{ color: 'var(--th-text)' }}>{item.label}</h4>
                         <p className="text-xs font-semibold" style={{ color: 'var(--th-text-muted)' }}>{pct}% of daily goal</p>
                       </div>
                     </div>
                     <div className="text-right">
                       <span className={clsx("text-lg font-black", overLimit ? "text-red-500" : "")} style={{ color: overLimit ? undefined : 'var(--th-text)' }}>
                         {item.consumed.toLocaleString()}
                       </span>
                       <span className="text-sm font-bold ml-1" style={{ color: 'var(--th-text-dim)' }}>
                         {item.unit} <span className="mx-0.5">/</span> {item.goal.toLocaleString()}{item.unit}
                       </span>
                     </div>
                   </div>
                   {/* Full width progress bar */}
                   <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
                     <div className={clsx("h-full rounded-full transition-all duration-1000 ease-out", overLimit && "bg-red-500")} style={{ width: `${Math.min(pct, 100)}%`, background: overLimit ? undefined : item.color }} />
                   </div>
                   {overLimit && (
                     <p className="text-[10px] font-bold text-red-500 mt-2 text-right">You have exceeded your daily goal.</p>
                   )}
                 </div>
               );
             })}
           </div>
        </div>
      </Modal>
    </>
  );
}
