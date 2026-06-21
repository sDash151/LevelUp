import { Info, Apple, Beef, Wheat, Cookie, Coffee, Droplet, Utensils } from 'lucide-react';

const getFoodIcon = (name) => {
  const n = name.toLowerCase();
  if (n.includes('chicken') || n.includes('meat') || n.includes('beef') || n.includes('protein')) return Beef;
  if (n.includes('rice') || n.includes('oats') || n.includes('bread') || n.includes('pasta')) return Wheat;
  if (n.includes('apple') || n.includes('banana') || n.includes('fruit')) return Apple;
  if (n.includes('cookie') || n.includes('snack') || n.includes('bar')) return Cookie;
  if (n.includes('coffee') || n.includes('tea') || n.includes('drink')) return Coffee;
  if (n.includes('oil') || n.includes('butter') || n.includes('fat') || n.includes('almond') || n.includes('nut')) return Droplet;
  return Utensils;
};

export default function TopFoodSources({ foods = [] }) {
  const COLORS = ['#E8A23A', '#10B981', '#3B82F6', '#8B5CF6', '#EF4444'];
  return (
    <div className="rounded-3xl p-5 h-full" style={{ background: 'var(--th-card-solid)', border: '1px solid var(--th-border)', boxShadow: 'var(--th-shadow)' }}>
      <div className="flex items-center gap-1.5 mb-5 group relative">
        <h3 className="text-sm font-bold" style={{ color: 'var(--th-text)' }}>Top Food Sources</h3>
        <Info className="w-3.5 h-3.5 cursor-help" style={{ color: 'var(--th-text-muted)' }} />
        <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 p-2.5 rounded-xl text-[10px] font-medium shadow-xl z-10 pointer-events-none" style={{ background: 'var(--th-card)', color: 'var(--th-text)', border: '1px solid var(--th-border)' }}>
          Your most consumed foods over the last 30 days, helping you identify your staple calorie sources.
        </div>
      </div>

      {foods.length === 0 ? (
        <p className="text-xs text-center py-5" style={{ color: 'var(--th-text-secondary)' }}>Log meals to see your top food sources</p>
      ) : (
        <div className="space-y-4">
          {foods.map((f, i) => {
            const Icon = getFoodIcon(f.name);
            const color = COLORS[i % COLORS.length];
            return (
              <div key={i} className="flex items-center gap-3">
                {/* Icon */}
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${color}15`, color }}>
                  <Icon className="w-4 h-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold truncate pr-2" style={{ color: 'var(--th-text)' }}>{f.name}</span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] font-semibold text-right" style={{ color: 'var(--th-text-secondary)' }}>
                        {f.totalCalories.toLocaleString()} kcal
                      </span>
                      <span className="text-[10px] font-bold text-right w-6" style={{ color: 'var(--th-text)' }}>
                        {f.percentage || 0}%
                      </span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
                    <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${f.percentage || 0}%`, background: color }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
