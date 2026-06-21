import { useState } from 'react';
import { Info, ChevronDown, Apple, Beef, Wheat, Cookie, Coffee, Droplet, Utensils } from 'lucide-react';
import { useToast, Modal } from '@/design-system/components';

const getFoodIcon = (name) => {
  if (!name) return Utensils;
  const n = name.toLowerCase();
  if (n.includes('chicken') || n.includes('meat') || n.includes('beef') || n.includes('protein')) return Beef;
  if (n.includes('rice') || n.includes('oats') || n.includes('bread') || n.includes('pasta')) return Wheat;
  if (n.includes('apple') || n.includes('banana') || n.includes('fruit')) return Apple;
  if (n.includes('cookie') || n.includes('snack') || n.includes('bar')) return Cookie;
  if (n.includes('coffee') || n.includes('tea') || n.includes('drink')) return Coffee;
  if (n.includes('oil') || n.includes('butter') || n.includes('fat') || n.includes('almond') || n.includes('nut')) return Droplet;
  return Utensils;
};

export default function RecentFoods({ foods = [] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toast = useToast();
  const COLORS = ['#E8A23A', '#10B981', '#3B82F6', '#8B5CF6', '#EF4444'];
  
  return (
    <>
      <div className="rounded-3xl p-5 h-full" style={{ background: 'var(--th-card-solid)', border: '1px solid var(--th-border)', boxShadow: 'var(--th-shadow)' }}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-1.5 group relative">
            <h3 className="text-sm font-bold" style={{ color: 'var(--th-text)' }}>Recent Foods</h3>
            <Info className="w-3.5 h-3.5 cursor-help" style={{ color: 'var(--th-text-muted)' }} />
            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 p-2.5 rounded-xl text-[10px] font-medium shadow-xl z-10 pointer-events-none" style={{ background: 'var(--th-card)', color: 'var(--th-text)', border: '1px solid var(--th-border)' }}>
              A chronological timeline of the most recent food items you've logged today.
            </div>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-1 text-xs font-semibold px-2 py-1 cursor-pointer transition-opacity hover:opacity-80" style={{ color: 'var(--th-text-secondary)' }}>
            View All <ChevronDown className="w-3 h-3" />
          </button>
        </div>

        {foods.length === 0 ? (
          <p className="text-xs text-center py-5" style={{ color: 'var(--th-text-secondary)' }}>No recent foods logged</p>
        ) : (
          <div className="space-y-4">
            {foods.slice(0, 6).map((f, i) => {
              const Icon = getFoodIcon(f.name);
              const color = COLORS[i % COLORS.length];
              return (
                <div key={i} className="flex items-center gap-3">
                  {/* Icon */}
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${color}15`, color }}>
                    <Icon className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <span className="text-xs font-bold block truncate pr-2" style={{ color: 'var(--th-text)' }}>{f.name}</span>
                    <span className="text-[10px] font-semibold block truncate" style={{ color: 'var(--th-text-dim)' }}>
                      {f.time || f.quantity || '1x'}
                    </span>
                  </div>
                  
                  <span className="text-[11px] font-bold text-right flex-shrink-0" style={{ color: 'var(--th-text-secondary)' }}>
                    {f.calories?.toLocaleString()} kcal
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="All Recent Foods" size="md">
        <div className="space-y-3 pb-2">
          {foods.length === 0 ? (
            <p className="text-center text-sm py-10" style={{ color: 'var(--th-text-muted)' }}>No foods logged recently.</p>
          ) : (
            foods.map((f, i) => {
              const Icon = getFoodIcon(f.name);
              const color = COLORS[i % COLORS.length];
              return (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl" style={{ background: 'var(--th-bg)', border: '1px solid var(--th-border)' }}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${color}15`, color }}>
                    <Icon className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <span className="text-sm font-bold block truncate" style={{ color: 'var(--th-text)' }}>{f.name}</span>
                    <span className="text-xs font-semibold block truncate mt-0.5" style={{ color: 'var(--th-text-dim)' }}>
                      {f.time || 'Logged'} • {f.quantity || '1 serving'}
                    </span>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-sm font-black" style={{ color: 'var(--th-text)' }}>
                      {f.calories?.toLocaleString()} <span className="text-xs font-bold" style={{ color: 'var(--th-text-dim)' }}>kcal</span>
                    </span>
                    <div className="flex items-center gap-2 text-[10px] font-bold" style={{ color: 'var(--th-text-muted)' }}>
                       <span>P: <span style={{ color: 'var(--th-text)' }}>{f.protein || 0}g</span></span>
                       <span>C: <span style={{ color: 'var(--th-text)' }}>{f.carbs || 0}g</span></span>
                       <span>F: <span style={{ color: 'var(--th-text)' }}>{f.fats || 0}g</span></span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Modal>
    </>
  );
}
