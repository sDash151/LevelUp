import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, RotateCcw, Play, Pause, Quote } from 'lucide-react';
import { DCard } from './DashboardShared';
import { useStartFocus, useCompleteFocus } from '../hooks/useDashboard';
import { Modal } from '@/design-system/components';
import clsx from 'clsx';

/* ─── Motivation quotes ─── */
const QUOTES = [
  { text: "Discipline today, freedom tomorrow. Keep showing up.", highlight: "showing up" },
  { text: "Small steps every day compound into extraordinary results.", highlight: "compound" },
  { text: "Your future self is watching you right now through your memories.", highlight: "memories" },
  { text: "The secret of your success is hidden in your daily routine.", highlight: "daily routine" },
  { text: "Progress is progress, no matter how small. Keep going.", highlight: "Keep going" },
  { text: "Winners aren't born. They're built one habit at a time.", highlight: "one habit at a time" },
  { text: "Don't count the days. Make the days count.", highlight: "Make the days count" },
];

/* ─── Focus Timer (persists sessions to DB) ─── */
function FocusTimer() {
  const DURATIONS = [5, 15, 25, 45, 60, 90, 120];
  const [selectedDuration, setSelectedDuration] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [label, setLabel] = useState('Deep Work Session');
  const [completed, setCompleted] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const intervalRef = useRef(null);
  const endTimeRef = useRef(null);

  const startFocus = useStartFocus();
  const completeFocus = useCompleteFocus();

  const totalSecs = selectedDuration * 60;
  const progress = (timeLeft / totalSecs) * 100;
  const r = 60, circumference = 2 * Math.PI * r;
  const offset = circumference - (progress / 100) * circumference;

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleStart = async () => {
    const session = await startFocus.mutateAsync({ duration: selectedDuration, label });
    setSessionId(session.id);
    setIsRunning(true);
  };

  const handleComplete = useCallback(async () => {
    setIsRunning(false);
    setCompleted(true);
    setTimeLeft(prev => {
      if (sessionId) {
        const actualSecs = (selectedDuration * 60) - prev;
        const actualMins = Math.ceil(actualSecs / 60);
        completeFocus.mutateAsync({ id: sessionId, actualMins });
      }
      return prev;
    });
    setSessionId(null);
  }, [sessionId, completeFocus, selectedDuration]);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setCompleted(false);
    setTimeLeft(selectedDuration * 60);
    setSessionId(null);
    clearInterval(intervalRef.current);
  }, [selectedDuration]);

  // Auto-reset completed state after 4 seconds
  useEffect(() => {
    if (completed) {
      const timer = setTimeout(() => {
        handleReset();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [completed, handleReset]);

  useEffect(() => {
    if (isRunning) {
      endTimeRef.current = Date.now() + timeLeft * 1000;
      intervalRef.current = setInterval(() => {
        const remaining = Math.round((endTimeRef.current - Date.now()) / 1000);
        if (remaining <= 0) {
          setTimeLeft(0);
          handleComplete();
        } else {
          setTimeLeft(remaining);
        }
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, handleComplete]);

  useEffect(() => {
    if (!isRunning && !sessionId && !completed) {
      setTimeLeft(selectedDuration * 60);
    }
  }, [selectedDuration, isRunning, sessionId, completed]);

  return (
    <div className="flex flex-col md:flex-row gap-8 items-center justify-center p-6">
      {/* Timer Circle */}
      <div className="relative shrink-0">
        <svg width={160} height={160} className="-rotate-90">
          <circle cx={80} cy={80} r={r} fill="none" stroke="rgba(168,85,247,0.15)" strokeWidth={8} />
          <motion.circle cx={80} cy={80} r={r} fill="none" stroke={completed ? '#10b981' : '#a855f7'}
            strokeWidth={8} strokeLinecap="round"
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.5 }}
            style={{ strokeDasharray: circumference }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {completed
            ? <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            : <span className="text-4xl font-bold font-mono" style={{ color: 'var(--th-text)' }}>{formatTime(timeLeft)}</span>
          }
        </div>
      </div>

      {/* Controls */}
      <div className="flex-1 min-w-0 flex flex-col items-center md:items-start text-center md:text-left">
        {!isRunning && !completed && (
          <div className="flex gap-2 mb-6 flex-wrap justify-center md:justify-start">
            {DURATIONS.map((d) => (
              <button key={d} onClick={() => setSelectedDuration(d)}
                className="px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all"
                style={{
                  background: selectedDuration === d ? 'var(--th-primary)' : 'var(--th-highlight)',
                  color: selectedDuration === d ? '#08080d' : 'var(--th-text-muted)',
                }}>
                {d} min
              </button>
            ))}
          </div>
        )}

        {completed ? (
          <div>
            <h2 className="text-2xl font-bold text-emerald-500 mb-1">Session Complete! 🎉</h2>
            <p className="text-[14px] mb-6" style={{ color: 'var(--th-text-muted)' }}>Great focus. You earned XP for this session. Getting ready for next...</p>
            <button onClick={handleReset} className="flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-semibold transition-all hover:scale-105"
              style={{ background: 'var(--th-highlight)', color: 'var(--th-text)' }}>
              <RotateCcw className="w-4 h-4" /> Start New Session
            </button>
          </div>
        ) : (
          <div>
            <input 
              type="text" 
              value={label} 
              onChange={(e) => setLabel(e.target.value)}
              disabled={isRunning}
              className="text-xl font-bold bg-transparent border-b border-transparent hover:border-[var(--th-border)] focus:border-[var(--th-primary)] outline-none transition-colors mb-2 text-center md:text-left w-full md:w-auto"
              style={{ color: 'var(--th-text)' }}
            />
            <p className="text-[14px] mb-6" style={{ color: 'var(--th-text-muted)' }}>
              {isRunning ? 'Stay focused! You got this.' : sessionId ? 'Paused. Ready to dive back in?' : 'Eliminate distractions before starting.'}
            </p>
            <div className="flex gap-4 justify-center md:justify-start">
              {isRunning ? (
                <button onClick={() => setIsRunning(false)}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl text-[15px] font-bold text-white transition-all hover:scale-105 shadow-lg shadow-orange-500/20"
                  style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
                  <Pause className="w-5 h-5 fill-current" /> Pause
                </button>
              ) : sessionId ? (
                <button onClick={() => setIsRunning(true)}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl text-[15px] font-bold text-white transition-all hover:scale-105 shadow-lg shadow-emerald-500/20"
                  style={{ background: 'linear-gradient(135deg, #10b981, #34d399)' }}>
                  <Play className="w-5 h-5 fill-current" /> Resume
                </button>
              ) : (
                <button onClick={handleStart} disabled={startFocus.isPending}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl text-[15px] font-bold text-white transition-all hover:scale-105 shadow-lg shadow-purple-500/20 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)' }}>
                  <Play className="w-5 h-5 fill-current" /> Start Deep Work
                </button>
              )}
              {sessionId && (
                <button onClick={() => setShowConfirmModal(true)}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-semibold transition-all hover:brightness-110"
                  style={{ background: 'var(--th-highlight)', color: 'var(--th-text)' }}>
                  End Early
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <Modal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} title="End Session Early?">
        <div className="flex flex-col gap-4">
          <p style={{ color: 'var(--th-text-secondary)' }}>
            Are you sure you want to end this deep work session early? You will still receive XP for the time spent focusing.
          </p>
          <div className="flex justify-end gap-3 mt-4">
            <button 
              onClick={() => setShowConfirmModal(false)}
              className="px-4 py-2 rounded-lg font-medium transition-colors hover:bg-slate-500/10"
              style={{ color: 'var(--th-text)' }}
            >
              Cancel
            </button>
            <button 
              onClick={() => {
                setShowConfirmModal(false);
                handleComplete();
              }}
              className="px-4 py-2 rounded-lg font-medium text-white transition-all hover:brightness-110"
              style={{ background: '#ef4444' }}
            >
              Yes, End Session
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function FocusTab() {
  const dailyQuote = QUOTES[new Date().getDate() % QUOTES.length];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <DCard className="overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
          <FocusTimer />
        </DCard>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <DCard>
          <div className="flex flex-col items-center text-center p-6">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ background: 'rgba(var(--th-primary-rgb), 0.1)' }}>
              <Quote className="w-5 h-5" style={{ color: 'var(--th-primary)' }} />
            </div>
            <blockquote className="text-xl md:text-2xl font-light leading-relaxed italic max-w-2xl" style={{ color: 'var(--th-text)' }}>
              "{dailyQuote.text.split(dailyQuote.highlight).map((part, i, arr) =>
                i < arr.length - 1
                  ? <span key={i}>{part}<span className="underline decoration-[var(--th-primary)]/40 underline-offset-4 not-italic font-medium" style={{ color: 'var(--th-primary)' }}>{dailyQuote.highlight}</span></span>
                  : <span key={i}>{part}</span>
              )}"
            </blockquote>
          </div>
        </DCard>
      </motion.div>
    </div>
  );
}
