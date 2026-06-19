import { create } from 'zustand';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import clsx from 'clsx';

const useToastStore = create((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Date.now();
    set((s) => ({ toasts: [...s.toasts, { id, ...toast }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), toast.duration || 4000);
    return id;
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export const useToast = () => {
  const { addToast } = useToastStore();
  return {
    success: (message) => addToast({ type: 'success', message }),
    error: (message) => addToast({ type: 'error', message }),
    warning: (message) => addToast({ type: 'warning', message }),
    info: (message) => addToast({ type: 'info', message }),
  };
};

const icons = { success: CheckCircle2, error: AlertCircle, warning: AlertTriangle, info: Info };
const accentColors = {
  success: 'var(--th-primary)',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
};

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-5 right-5 z-[400] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = icons[toast.type];
          const accent = accentColors[toast.type];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="rounded-2xl px-4 py-3.5 flex items-start gap-3 pointer-events-auto relative overflow-hidden"
              style={{ 
                background: 'var(--th-card-solid)', 
                border: '1px solid var(--th-border)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.06), 0 2px 6px rgba(0,0,0,0.03)'
              }}
            >
              {/* Subtle gradient accent bar */}
              <div 
                className="absolute left-0 top-0 bottom-0 w-[3px]"
                style={{ 
                  background: `linear-gradient(to bottom, ${accent}, transparent)`,
                  opacity: 0.8
                }}
              />
              <Icon className="w-4 h-4 mt-[2px] shrink-0" style={{ color: accent }} />
              <p className="text-[13px] flex-1 font-semibold tracking-wide" style={{ color: 'var(--th-text)', lineHeight: 1.4 }}>{toast.message}</p>
              <button 
                onClick={() => removeToast(toast.id)} 
                className="shrink-0 transition-all hover:scale-110 opacity-40 hover:opacity-100"
                style={{ color: 'var(--th-text)' }}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
