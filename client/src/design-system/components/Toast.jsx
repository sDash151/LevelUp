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
const colors = {
  success: 'border-l-success text-success',
  error: 'border-l-danger text-danger',
  warning: 'border-l-warning text-warning',
  info: 'border-l-info text-info',
};

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-4 right-4 z-[400] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = icons[toast.type];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className={clsx(
                'glass-strong rounded-xl border-l-4 px-4 py-3 flex items-start gap-3 pointer-events-auto',
                colors[toast.type]
              )}
            >
              <Icon className="w-4 h-4 mt-0.5 shrink-0" />
              <p className="text-sm text-white/90 flex-1">{toast.message}</p>
              <button onClick={() => removeToast(toast.id)} className="text-zinc-500 hover:text-white shrink-0">
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
