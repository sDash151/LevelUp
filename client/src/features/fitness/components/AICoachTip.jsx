import { Sparkles, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AICoachTip() {
  return (
    <div 
      onClick={() => toast('AI is analyzing your recent sets for deeper insights... 🤖', { icon: '✨', style: { background: 'var(--th-card)', color: 'var(--th-text)', border: '1px solid var(--th-border)' } })}
      className="rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity" 
      style={{ background: 'rgba(232,162,58,0.08)', border: '1px solid rgba(232,162,58,0.2)' }}
    >
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(232,162,58,0.15)' }}>
        <Sparkles className="w-4 h-4 text-[#E8A23A]" />
      </div>
      <div className="flex-1">
        <p className="text-[10px] font-semibold" style={{ color: '#E8A23A' }}>AI Coach Tip</p>
        <p className="text-[11px]" style={{ color: 'var(--th-text)' }}>Great consistency! Your volume is improving. Focus on progressive overload this week.</p>
      </div>
      <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--th-text-dim)' }} />
    </div>
  );
}
