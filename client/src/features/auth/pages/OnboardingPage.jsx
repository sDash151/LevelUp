import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/shared/stores/authStore';
import { useUser } from '../hooks/useAuth';
import { api } from '@/shared/utils/api-client';
import { Select } from '@/design-system/components/Select';
import clsx from 'clsx';
import { Briefcase, Dumbbell, Wallet, ArrowRight, ArrowLeft, Check, User, HeartPulse, Target, DollarSign, Sparkles } from 'lucide-react';

const steps = [
  { id: 1, title: 'Identity', icon: User },
  { id: 2, title: 'Baselines', icon: HeartPulse },
  { id: 3, title: 'Ambition', icon: Target },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const { refetch } = useUser();

  const [form, setForm] = useState({
    // Step 1: Identity
    primaryFocus: 'career', // career, fitness, finance
    jobTitle: '',
    // Step 2: Physical
    height: '',
    weight: '',
    goal: 'general',
    experienceLevel: 'beginner',
    // Step 3: Ambition
    targetIncome: '',
    baseCurrency: 'INR',
    dreamRole: ''
  });

  const handleNext = () => {
    if (currentStep < steps.length) setCurrentStep(c => c + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(c => c - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.put('/auth/onboard', {
        ...form,
        height: form.height ? parseFloat(form.height) : undefined,
        weight: form.weight ? parseFloat(form.weight) : undefined,
        targetIncome: form.targetIncome ? parseFloat(form.targetIncome) : undefined,
      });
      // Refresh user context so it picks up isOnboarded = true
      await refetch();
      navigate('/dashboard');
    } catch (error) {
      console.error("Failed to onboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Select your primary focus</h2>
        <p style={{ color: 'var(--th-text-secondary)' }}>What is your main goal in LevelUP?</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[
          { id: 'career', label: 'Career & Tech', icon: Briefcase, color: '#3b82f6' },
          { id: 'fitness', label: 'Fitness & Health', icon: Dumbbell, color: '#ef4444' },
          { id: 'finance', label: 'Wealth & Finance', icon: Wallet, color: '#10b981' },
          { id: 'all', label: 'Everything (LevelUP)', icon: Sparkles, color: '#8b5cf6' }
        ].map(focus => (
          <button
            key={focus.id}
            onClick={() => setForm(f => ({ ...f, primaryFocus: focus.id }))}
            className={clsx(
              "flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-200",
              form.primaryFocus === focus.id 
                ? "border-[var(--th-primary)] bg-[var(--th-primary)]/10 shadow-[0_0_15px_rgba(var(--th-primary-rgb),0.3)]" 
                : "border-[var(--th-border)] bg-[var(--th-bg-secondary)] hover:border-[var(--th-primary)]/50"
            )}
          >
            <focus.icon className="w-10 h-10 mb-3" style={{ color: focus.color }} />
            <span className="font-semibold">{focus.label}</span>
          </button>
        ))}
      </div>

      <div className="space-y-2 mt-8">
        <label className="block text-sm font-medium">What is your current Job Title / Role?</label>
        <input 
          type="text" 
          value={form.jobTitle} 
          onChange={e => setForm(f => ({ ...f, jobTitle: e.target.value }))}
          placeholder="e.g. Frontend Developer, Student..."
          className="w-full px-4 py-3 rounded-xl border bg-[var(--th-bg)] outline-none focus:border-[var(--th-primary)] transition-colors"
          style={{ borderColor: 'var(--th-border)' }}
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Physical Baselines</h2>
        <p style={{ color: 'var(--th-text-secondary)' }}>Set up your Level 1 fitness stats.</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Height (cm)</label>
          <input 
            type="number" 
            value={form.height} 
            onChange={e => setForm(f => ({ ...f, height: e.target.value }))}
            placeholder="175"
            className="w-full px-4 py-3 rounded-xl border bg-[var(--th-bg)] outline-none focus:border-[var(--th-primary)]"
            style={{ borderColor: 'var(--th-border)' }}
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Current Weight (kg)</label>
          <input 
            type="number" 
            value={form.weight} 
            onChange={e => setForm(f => ({ ...f, weight: e.target.value }))}
            placeholder="70"
            className="w-full px-4 py-3 rounded-xl border bg-[var(--th-bg)] outline-none focus:border-[var(--th-primary)]"
            style={{ borderColor: 'var(--th-border)' }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Primary Fitness Goal</label>
        <Select 
          size="lg"
          value={form.goal}
          onChange={val => setForm(f => ({ ...f, goal: val }))}
          options={[
            { value: 'general', label: 'General Health' },
            { value: 'hypertrophy', label: 'Build Muscle (Hypertrophy)' },
            { value: 'recomp', label: 'Build Muscle + Lose Fat (Recomp)' },
            { value: 'lean_muscle', label: 'Build Lean Muscle Mass' },
            { value: 'bulking', label: 'Gain Weight (Bulking)' },
            { value: 'cutting', label: 'Lose Fat (Cutting)' },
            { value: 'strength', label: 'Get Stronger' },
            { value: 'endurance', label: 'Endurance / Cardio' }
          ]}
        />
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium">Experience Level</label>
        <div className="flex gap-3">
          {['beginner', 'intermediate', 'advanced'].map(lvl => (
            <button
              key={lvl}
              onClick={() => setForm(f => ({ ...f, experienceLevel: lvl }))}
              className={clsx(
                "flex-1 py-2 rounded-lg border text-sm font-medium capitalize transition-all",
                form.experienceLevel === lvl 
                  ? "border-[var(--th-primary)] bg-[var(--th-primary)]/10 text-[var(--th-primary)]"
                  : "border-[var(--th-border)] bg-[var(--th-bg-secondary)]"
              )}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">The Ambition</h2>
        <p style={{ color: 'var(--th-text-secondary)' }}>What are you working towards?</p>
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium">Dream Tech Role</label>
        <input 
          type="text" 
          value={form.dreamRole} 
          onChange={e => setForm(f => ({ ...f, dreamRole: e.target.value }))}
          placeholder="e.g. Senior Fullstack Engineer at Google"
          className="w-full px-4 py-3 rounded-xl border bg-[var(--th-bg)] outline-none focus:border-[var(--th-primary)]"
          style={{ borderColor: 'var(--th-border)' }}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1 space-y-2">
          <label className="block text-sm font-medium">Currency</label>
          <Select 
            size="lg"
            value={form.baseCurrency}
            onChange={val => setForm(f => ({ ...f, baseCurrency: val }))}
            options={[
              { value: 'USD', label: 'USD ($)' },
              { value: 'EUR', label: 'EUR (€)' },
              { value: 'GBP', label: 'GBP (£)' },
              { value: 'INR', label: 'INR (₹)' }
            ]}
          />
        </div>
        <div className="col-span-2 space-y-2">
          <label className="block text-sm font-medium">Target Monthly Income</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium" style={{ color: 'var(--th-text-dim)' }}>
              {{ USD: '$', EUR: '€', GBP: '£', INR: '₹' }[form.baseCurrency] || '₹'}
            </span>
            <input 
              type="number" 
              value={form.targetIncome} 
              onChange={e => setForm(f => ({ ...f, targetIncome: e.target.value }))}
              placeholder="100000"
              className="w-full pl-10 pr-4 py-3 rounded-xl border bg-[var(--th-bg)] outline-none focus:border-[var(--th-primary)]"
              style={{ borderColor: 'var(--th-border)' }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6" style={{ background: 'var(--th-bg)' }}>
      <div className="max-w-2xl w-full">
        {/* Premium Progress Stepper */}
        <div className="mb-14 relative px-2 sm:px-10">
          {/* Background Line */}
          <div className="absolute left-10 right-10 top-6 -translate-y-1/2 h-1.5 rounded-full bg-[var(--th-border)]/50 overflow-hidden">
            {/* Animated Progress Line */}
            <motion.div 
              className="absolute left-0 top-0 bottom-0 bg-[var(--th-primary)]"
              initial={{ width: '0%' }}
              animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>

          <div className="flex items-center justify-between relative z-10">
            {steps.map((step) => {
              const isActive = step.id === currentStep;
              const isPast = step.id < currentStep;
              
              return (
                <div key={step.id} className="flex flex-col items-center gap-3 relative">
                  <motion.div 
                    animate={{ 
                      scale: isActive ? 1.15 : 1,
                      boxShadow: isActive ? '0 0 20px rgba(var(--th-primary-rgb), 0.4)' : 'none'
                    }}
                    className={clsx(
                      "w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-300 relative z-10",
                      isActive 
                        ? "border-[var(--th-primary)] bg-[var(--th-bg)] text-[var(--th-primary)]" 
                        : isPast 
                          ? "border-[var(--th-primary)] bg-[var(--th-primary)] text-white" 
                          : "border-[var(--th-border)] bg-[var(--th-bg)] text-[var(--th-text-dim)]"
                    )}
                  >
                    {isPast ? <Check className="w-5 h-5 stroke-[3]" /> : <step.icon className={clsx("w-5 h-5", isActive ? "stroke-[2.5]" : "")} />}
                  </motion.div>
                  
                  <span 
                    className={clsx(
                      "text-xs sm:text-sm font-bold absolute -bottom-7 w-24 text-center transition-colors duration-300",
                      isActive ? "text-[var(--th-primary)]" : isPast ? "text-[var(--th-text)]" : "text-[var(--th-text-dim)]"
                    )}
                  >
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Wizard Form Area */}
        <div className="rounded-3xl border shadow-xl p-6 sm:p-10 relative overflow-hidden" style={{ background: 'var(--th-bg-secondary)', borderColor: 'var(--th-border)' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="mt-10 flex items-center justify-between pt-6 border-t" style={{ borderColor: 'var(--th-border)' }}>
            <button 
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-opacity disabled:opacity-30 hover:opacity-80"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            
            {currentStep < steps.length ? (
              <button 
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white transition-transform active:scale-95"
                style={{ background: 'var(--th-primary)' }}
              >
                Next Step <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button 
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-8 py-2.5 rounded-xl font-bold text-white shadow-lg shadow-[var(--th-primary)]/30 transition-transform active:scale-95"
                style={{ background: 'var(--th-primary)' }}
              >
                {loading ? 'Initializing...' : 'Complete Profile'} <Check className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
