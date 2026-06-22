import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X } from 'lucide-react';

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed) setShowBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setShowBanner(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-4 left-4 right-4 z-[300] max-w-sm mx-auto"
        >
          <div 
            className="rounded-2xl p-4 flex items-center gap-3 shadow-2xl"
            style={{ background: 'var(--th-card-solid)', border: '1px solid var(--th-border)' }}
          >
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'var(--th-primary)' }}
            >
              <Download className="w-5 h-5" style={{ color: '#08080d' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold" style={{ color: 'var(--th-text)' }}>Install LevelUp</p>
              <p className="text-[10px]" style={{ color: 'var(--th-text-secondary)' }}>Add to home screen for the best experience</p>
            </div>
            <button 
              onClick={handleInstall} 
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-80 shrink-0"
              style={{ background: 'var(--th-text)', color: 'var(--th-bg)' }}
            >
              Install
            </button>
            <button 
              onClick={handleDismiss} 
              className="p-1 transition-colors shrink-0 hover:opacity-80"
              style={{ color: 'var(--th-text-dim)' }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
