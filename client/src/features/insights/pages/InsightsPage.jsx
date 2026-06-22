import { AnimatedPage } from '@/design-system/components';
import { Lock, Sparkles, Zap, ArrowRight } from 'lucide-react';
import React, { useState } from 'react';

export default function InsightsPage() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <AnimatedPage>
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--th-text)' }}>
           <Sparkles className="w-6 h-6 text-amber-500" /> Insights Hub
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--th-text-secondary)' }}>Smart observations and predictions across your life</p>
      </div>

      <div className="relative mt-12 w-full max-w-2xl mx-auto">

        <div 
          className="relative shadow-xl rounded-3xl p-10 overflow-hidden group transition-all duration-500 hover:shadow-2xl"
          style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="flex flex-col items-center text-center relative z-10">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-inner transition-transform duration-500 ${isHovered ? 'scale-110' : ''}`} style={{ background: 'var(--th-card-solid)' }}>
              <Lock className="w-10 h-10 text-amber-500" />
            </div>

            <h2 className="text-3xl font-extrabold mb-4 tracking-tight" style={{ color: 'var(--th-text)' }}>
              Premium Insights Locked
            </h2>
            
            <p className="max-w-md mx-auto mb-8 leading-relaxed" style={{ color: 'var(--th-text-secondary)' }}>
              Unlock the full power of LevelUp. Get AI-driven life predictions, automated habit restructuring, and deep-dive synergy reports. 
              Coming in the next major update.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
              <button className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2">
                <Zap size={18} />
                Join the Waitlist
              </button>
              <button className="px-8 py-3.5 font-semibold rounded-xl border hover:opacity-80 transition-all duration-300 flex items-center justify-center gap-2 group/btn" style={{ background: 'var(--th-card-solid)', borderColor: 'var(--th-border)', color: 'var(--th-text)' }}>
                Preview Features
                <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" style={{ color: 'var(--th-text-muted)' }} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}
