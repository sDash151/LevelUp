import { useRef } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Plus, Route, Target, Code2, Zap, Trophy, Award, Heart, Brain, Crown, Shield, Terminal, Flame, Users, TrendingUp } from 'lucide-react';

const ICON_MAP = {
  route: Route, target: Target, 'code-2': Code2, zap: Zap, trophy: Trophy,
  award: Award, heart: Heart, brain: Brain, crown: Crown, shield: Shield,
  terminal: Terminal, flame: Flame, users: Users, 'trending-up': TrendingUp,
};

export function DsaPathCarousel({ paths = [], activePath, onPathClick, onViewAll }) {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 200, behavior: 'smooth' });
    }
  };

  return (
    <div className="rounded-2xl p-4" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--th-text)' }}>Your Paths</h3>
        <div className="flex items-center gap-2">
          <span className="text-[11px] cursor-pointer" style={{ color: 'var(--th-primary)' }} onClick={onViewAll}>View all paths</span>
          <button onClick={() => scroll(-1)} className="w-6 h-6 rounded-lg flex items-center justify-center hover:opacity-80 transition" style={{ background: 'var(--th-border)' }}>
            <ChevronLeft className="w-3.5 h-3.5" style={{ color: 'var(--th-text-muted)' }} />
          </button>
          <button onClick={() => scroll(1)} className="w-6 h-6 rounded-lg flex items-center justify-center hover:opacity-80 transition" style={{ background: 'var(--th-border)' }}>
            <ChevronRight className="w-3.5 h-3.5" style={{ color: 'var(--th-text-muted)' }} />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex gap-3 overflow-x-auto hide-scrollbar snap-x snap-mandatory pb-1">
        {paths.filter(p => p.isVisible).map((path, i) => {
          const isActive = activePath?.id === path.id;
          const IconComp = ICON_MAP[path.icon] || Route;
          const circumference = 2 * Math.PI * 32;
          const strokeDashoffset = circumference * (1 - (path.completionPct || 0) / 100);

          return (
            <motion.div
              key={path.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => onPathClick?.(path)}
              className="min-w-[140px] rounded-2xl p-4 cursor-pointer text-center shrink-0 snap-start transition-all hover:-translate-y-1 relative shadow-sm"
              style={{
                background: 'var(--th-card)',
                border: isActive ? '2px solid #f59e0b' : '1px solid var(--th-border)',
                boxShadow: isActive ? '0 4px 12px rgba(245, 158, 11, 0.15)' : 'none'
              }}
            >
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <IconComp className="w-[14px] h-[14px]" style={{ color: isActive ? '#f59e0b' : '#10b981' }} />
                <p className="text-[12px] font-bold truncate" style={{ color: 'var(--th-text)' }}>{path.name}</p>
              </div>
              
              <div className="h-4 flex items-center justify-center mb-3">
                {isActive && (
                  <span className="text-[9px] font-bold uppercase tracking-wider text-amber-500">
                    Active
                  </span>
                )}
              </div>

              {/* SVG Progress Ring */}
              <div className="relative w-[76px] h-[76px] mx-auto mb-3">
                <svg viewBox="0 0 76 76" className="w-full h-full -rotate-90">
                  <circle cx="38" cy="38" r="34" fill="none" stroke="var(--th-border)" strokeWidth="4.5" />
                  <circle cx="38" cy="38" r="34" fill="none" stroke={isActive ? '#f59e0b' : '#10b981'} strokeWidth="4.5"
                    strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[16px] font-bold" style={{ color: 'var(--th-text)' }}>{path.completionPct || 0}%</span>
                </div>
              </div>

              <p className="text-[12px] font-bold mb-0.5" style={{ color: 'var(--th-text)' }}>
                {path.solvedCount || 0} <span className="text-gray-400 font-medium">/ {path.totalProblems}</span>
              </p>
              <p className="text-[11px] font-bold" style={{ color: '#10b981' }}>+{path.xpEarned || 0} XP</p>
            </motion.div>
          );
        })}

        {/* Add Path card */}
        <div
          className="min-w-[140px] rounded-2xl p-4 cursor-pointer text-center shrink-0 snap-start flex flex-col items-center justify-center gap-2 transition-all hover:-translate-y-1 backdrop-blur-sm"
          style={{ 
            background: 'rgba(var(--th-primary-rgb), 0.08)',
            border: '1px solid rgba(var(--th-primary-rgb), 0.15)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
          }}
        >
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center mb-2 backdrop-blur-md"
            style={{
              background: 'rgba(var(--th-primary-rgb), 0.12)',
              border: '1px solid rgba(var(--th-primary-rgb), 0.2)'
            }}
          >
            <Plus className="w-5 h-5" style={{ color: 'var(--th-primary)' }} />
          </div>
          <span className="text-[12px] font-semibold" style={{ color: 'var(--th-primary)' }}>Add Path</span>
        </div>
      </div>
    </div>
  );
}
