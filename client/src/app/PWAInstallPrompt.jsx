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
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-20 lg:bottom-4 left-4 right-4 z-[60] max-w-sm mx-auto"
        >
          <div className="glass-strong rounded-2xl p-4 flex items-center gap-3 shadow-2xl">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shrink-0">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">Install LevelUp</p>
              <p className="text-[10px] text-zinc-400">Add to home screen for the best experience</p>
            </div>
            <button onClick={handleInstall} className="px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-medium hover:bg-accent-hover transition-colors shrink-0">
              Install
            </button>
            <button onClick={handleDismiss} className="p-1 text-zinc-500 hover:text-white transition-colors shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
