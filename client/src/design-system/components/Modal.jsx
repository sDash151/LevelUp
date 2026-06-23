import { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import clsx from 'clsx';

const sizeMap = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const handleEscape = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className={clsx(
              'relative w-full rounded-2xl overflow-hidden flex flex-col max-h-[90vh]',
              sizeMap[size]
            )}
            style={{ 
              background: 'var(--th-card-solid)', 
              border: '1px solid var(--th-border-hover)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px var(--th-highlight) inset'
            }}
          >
            {/* Header */}
            {title && (
              <div className="flex-shrink-0 flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--th-border)' }}>
                <h2 className="text-lg font-semibold" style={{ color: 'var(--th-text)' }}>{title}</h2>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg transition-colors hover:bg-slate-500/10"
                  style={{ color: 'var(--th-text-dim)' }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Body */}
            <div className="px-6 py-5 overflow-y-auto">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
