import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WifiOff, RefreshCw } from 'lucide-react';

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const onOffline = () => setIsOffline(true);
    const onOnline = () => setIsOffline(false);
    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);
    return () => { window.removeEventListener('offline', onOffline); window.removeEventListener('online', onOnline); };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[100] bg-warning/90 backdrop-blur-sm"
        >
          <div className="flex items-center justify-center gap-2 px-4 py-2">
            <WifiOff className="w-4 h-4 text-zinc-900" />
            <span className="text-xs font-medium text-zinc-900">You're offline — some features may be limited</span>
            <button onClick={() => window.location.reload()} className="ml-2 p-1 rounded-md bg-black/10 hover:bg-black/20 transition-colors">
              <RefreshCw className="w-3 h-3 text-zinc-900" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
