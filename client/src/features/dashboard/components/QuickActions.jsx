import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle2, Target, Dumbbell, Wallet } from 'lucide-react';
import { Card } from '@/design-system/components';

const actions = [
  { label: 'Log Habit', icon: CheckCircle2, to: '/habits', color: 'bg-accent-dim text-accent' },
  { label: 'Add Goal', icon: Target, to: '/goals', color: 'bg-success-dim text-success' },
  { label: 'Track Workout', icon: Dumbbell, to: '/fitness', color: 'bg-warning-dim text-warning' },
  { label: 'Log Expense', icon: Wallet, to: '/finance', color: 'bg-info-dim text-info' },
];

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {actions.map((action, i) => (
        <motion.div
          key={action.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 * i, duration: 0.3 }}
        >
          <Card
            hover
            className="flex flex-col items-center gap-3 py-5 cursor-pointer"
            onClick={() => navigate(action.to)}
          >
            <div className={`p-2.5 rounded-xl ${action.color}`}>
              <action.icon className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-zinc-300">{action.label}</span>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
