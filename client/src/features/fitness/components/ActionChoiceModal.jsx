import { Modal } from '@/design-system/components';
import { motion } from 'motion/react';
import { Dumbbell, Apple, TrendingUp, Sparkles, ChevronRight } from 'lucide-react';

const CHOICES = [
  {
    id: 'workout',
    title: 'Log Workout',
    description: 'Record your sets, reps & volume',
    icon: Dumbbell,
    gradient: 'from-orange-500/20 to-amber-500/20',
    iconColor: '#f59e0b',
  },
  {
    id: 'food',
    title: 'Log Food',
    description: 'Track macros and daily calories',
    icon: Apple,
    gradient: 'from-emerald-500/20 to-green-500/20',
    iconColor: '#10b981',
  },
  {
    id: 'metric',
    title: 'Log Measurement',
    description: 'Update your weight & body stats',
    icon: TrendingUp,
    gradient: 'from-purple-500/20 to-fuchsia-500/20',
    iconColor: '#a855f7',
  },
  {
    id: 'plan',
    title: 'Make a Plan',
    description: 'AI powered workout, diet & recovery',
    icon: Sparkles,
    gradient: 'from-blue-500/10 to-cyan-500/10',
    iconColor: '#3b82f6',
  },
];

export default function ActionChoiceModal({ isOpen, onClose, onSelect }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="What would you like to log?" size="md">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-4 sm:p-6">
        {CHOICES.map((choice) => {
          const Icon = choice.icon;
          return (
            <motion.button
              key={choice.id}
              onClick={() => {
                if (choice.isUpcoming) return;
                onSelect(choice.id);
                onClose();
              }}
              whileHover={choice.isUpcoming ? {} : { scale: 1.02 }}
              whileTap={choice.isUpcoming ? {} : { scale: 0.98 }}
              className={`group relative flex flex-col items-start p-5 rounded-2xl border transition-all text-left overflow-hidden ${
                choice.isUpcoming ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-lg cursor-pointer'
              }`}
              style={{
                background: 'var(--th-bg-secondary)',
                borderColor: 'var(--th-border)',
              }}
            >
              {/* Background Glow */}
              <div className={`absolute inset-0 bg-gradient-to-br ${choice.gradient} opacity-50`} />
              
              {choice.isUpcoming && (
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider text-white" style={{ background: 'var(--th-primary)' }}>
                  Soon
                </div>
              )}

              <div className="relative z-10 w-full">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm mb-3"
                  style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}
                >
                  <Icon className="w-5 h-5" style={{ color: choice.iconColor }} />
                </div>
                <h3 className="text-base font-bold mb-1" style={{ color: 'var(--th-text)' }}>
                  {choice.title}
                </h3>
                <p className="text-xs font-medium pr-6" style={{ color: 'var(--th-text-dim)' }}>
                  {choice.description}
                </p>
              </div>

              {!choice.isUpcoming && (
                <ChevronRight className="absolute bottom-5 right-4 w-4 h-4 opacity-40 transition-opacity group-hover:opacity-100" style={{ color: 'var(--th-text)' }} />
              )}
            </motion.button>
          );
        })}
      </div>
    </Modal>
  );
}
