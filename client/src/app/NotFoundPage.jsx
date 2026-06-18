import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-6 page-bg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-10 max-w-md w-full text-center"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          className="text-7xl mb-4"
        >
          🚀
        </motion.div>
        <h1 className="text-6xl font-bold gradient-text mb-2">404</h1>
        <h2 className="text-lg font-semibold text-white mb-2">Page Not Found</h2>
        <p className="text-sm text-zinc-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Back to Dashboard
        </Link>
      </motion.div>
    </div>
  );
}
