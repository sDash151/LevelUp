import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import clsx from 'clsx';

export function AuthCard({ title, subtitle, children, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={clsx(
        'w-full max-w-[420px] mx-auto relative',
        className
      )}
    >
      {/* Outer glow ring */}
      <div className="absolute -inset-[1px] rounded-[28px] bg-gradient-to-b from-white/[0.08] to-white/[0.02] pointer-events-none" />

      {/* Card body */}
      <div className="relative rounded-[28px] bg-[#111113]/80 backdrop-blur-2xl border border-white/[0.06] p-8 sm:p-10 shadow-[0_8px_64px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.03)]">
        {/* Top highlight line */}
        <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.3)]">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-white via-white to-zinc-400 bg-clip-text text-transparent">LevelUp</span>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h1 className="text-[28px] font-bold text-white tracking-tight mb-1">{title}</h1>
          {subtitle && <p className="text-zinc-500 text-[15px] mb-8">{subtitle}</p>}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {children}
        </motion.div>
      </div>
    </motion.div>
  );
}
