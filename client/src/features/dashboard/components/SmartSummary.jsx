import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { Card } from '@/design-system/components';

const insights = [
  "You're on a great streak! Keep up the momentum. 💪",
  "Focus on completing your evening routine today.",
  "You've been consistent with exercise this week. Nice!",
  "Consider adding a new learning habit to level up your skills.",
];

export function SmartSummary() {
  const [text, setText] = useState('');
  const [currentInsight] = useState(() => insights[Math.floor(Math.random() * insights.length)]);

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setText(currentInsight.slice(0, i + 1));
      i++;
      if (i >= currentInsight.length) clearInterval(timer);
    }, 25);
    return () => clearInterval(timer);
  }, [currentInsight]);

  return (
    <Card className="border-l-2 border-l-accent">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-accent-dim shrink-0">
          <Sparkles className="w-4 h-4 text-accent" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white mb-1">Smart Summary</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">{text}<span className="animate-pulse">|</span></p>
        </div>
      </div>
    </Card>
  );
}
