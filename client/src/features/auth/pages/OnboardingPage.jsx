import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/shared/stores/authStore';
import { useUser } from '../hooks/useAuth';
import { api } from '@/shared/utils/api-client';
import { Select } from '@/design-system/components/Select';
import clsx from 'clsx';
import { Briefcase, Dumbbell, Wallet, ArrowRight, ArrowLeft, Check, User, HeartPulse, Target, Sparkles, MapPin, Smile } from 'lucide-react';
import Autocomplete from 'react-google-autocomplete';

const steps = [
  { id: 1, title: 'Career', icon: Briefcase },
  { id: 2, title: 'World', icon: MapPin },
  { id: 3, title: 'Physical', icon: HeartPulse },
  { id: 4, title: 'Persona', icon: Smile },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { refetch } = useUser();

  const [form, setForm] = useState(() => {
    const userEmail = useAuthStore.getState().user?.email || '';
    const initialEmail = userEmail.includes('@github.com') ? '' : userEmail;
    
    return {
      email: initialEmail,
      // Step 1: Career
      primaryFocus: 'career', // career, fitness, finance
      jobTitle: '',
      currentSalary: '',
      dreamRole: '',
      targetIncome: '',
      baseCurrency: 'INR',

      // Step 2: Location
      address: '',
      city: '',
      country: '',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      countryCode: '+91',
      phoneNumber: '',

      // Step 3: Physical
      height: '',
      weight: '',
      dateOfBirth: '',
      gender: 'male',
      goal: 'general',
      experienceLevel: 'beginner',

      // Step 4: Persona
      mantra: '',
      leetcodeUrl: '',
      linkedinUrl: '',
      twitterUrl: '',
      githubUrl: '',
      portfolioUrl: '',

      onboardingStep: 4,
    };
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
        currentSalary: form.currentSalary ? parseFloat(form.currentSalary) : undefined,
        targetIncome: form.targetIncome ? parseFloat(form.targetIncome) : undefined,
        dateOfBirth: form.dateOfBirth || undefined,
        phoneNumber: form.phoneNumber ? `${form.countryCode} ${form.phoneNumber}` : undefined,
      });
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

      <div className="grid grid-cols-2 gap-4 pt-4 border-t" style={{ borderColor: 'var(--th-border)' }}>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Current Job Title</label>
          <input 
            type="text" 
            value={form.jobTitle} 
            onChange={e => setForm(f => ({ ...f, jobTitle: e.target.value }))}
            placeholder="e.g. SDE 1"
            className="w-full px-4 py-3 rounded-xl border bg-[var(--th-bg)] outline-none focus:border-[var(--th-primary)] transition-colors"
            style={{ borderColor: 'var(--th-border)' }}
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Dream Role</label>
          <input 
            type="text" 
            value={form.dreamRole} 
            onChange={e => setForm(f => ({ ...f, dreamRole: e.target.value }))}
            placeholder="e.g. Sr. Architect"
            className="w-full px-4 py-3 rounded-xl border bg-[var(--th-bg)] outline-none focus:border-[var(--th-primary)] transition-colors"
            style={{ borderColor: 'var(--th-border)' }}
          />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-4 space-y-2">
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
        <div className="col-span-4 space-y-2">
          <label className="block text-sm font-medium">Current Salary /yr</label>
          <input 
            type="number" 
            value={form.currentSalary} 
            onChange={e => setForm(f => ({ ...f, currentSalary: e.target.value }))}
            placeholder="50000"
            className="w-full px-4 py-3 rounded-xl border bg-[var(--th-bg)] outline-none focus:border-[var(--th-primary)]"
            style={{ borderColor: 'var(--th-border)' }}
          />
        </div>
        <div className="col-span-4 space-y-2">
          <label className="block text-sm font-medium">Target Income /yr</label>
          <input 
            type="number" 
            value={form.targetIncome} 
            onChange={e => setForm(f => ({ ...f, targetIncome: e.target.value }))}
            placeholder="150000"
            className="w-full px-4 py-3 rounded-xl border bg-[var(--th-bg)] outline-none focus:border-[var(--th-primary)]"
            style={{ borderColor: 'var(--th-border)' }}
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Location & Contact</h2>
        <p style={{ color: 'var(--th-text-secondary)' }}>Used for accurate local AI recommendations.</p>
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium">Home Location (Address)</label>
        <Autocomplete
          apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
          onPlaceSelected={(place) => {
            const city = place.address_components?.find(c => c.types.includes('locality'))?.long_name || '';
            const country = place.address_components?.find(c => c.types.includes('country'))?.long_name || '';
            setForm(f => ({ 
              ...f, 
              address: place.formatted_address || f.address,
              city,
              country
            }));
          }}
          options={{ types: [] }}
          className="w-full px-4 py-3 rounded-xl border bg-[var(--th-bg)] outline-none focus:border-[var(--th-primary)]"
          style={{ borderColor: 'var(--th-border)' }}
          placeholder="Start typing your address or city..."
          defaultValue={form.address}
          onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">City</label>
          <input 
            type="text" 
            value={form.city} 
            onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border bg-[var(--th-bg)] outline-none focus:border-[var(--th-primary)]"
            style={{ borderColor: 'var(--th-border)' }}
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Country</label>
          <input 
            type="text" 
            value={form.country} 
            onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border bg-[var(--th-bg)] outline-none focus:border-[var(--th-primary)]"
            style={{ borderColor: 'var(--th-border)' }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t" style={{ borderColor: 'var(--th-border)' }}>
        <div className="space-y-2">
          <label className="block text-sm font-medium flex items-center gap-2">
            Timezone <span className="text-xs bg-[var(--th-primary)]/10 text-[var(--th-primary)] px-2 py-0.5 rounded-full">Auto</span>
          </label>
          <input 
            type="text" 
            value={form.timezone} 
            disabled
            className="w-full px-4 py-3 rounded-xl border bg-[var(--th-bg)]/50 text-[var(--th-text-secondary)] outline-none"
            style={{ borderColor: 'var(--th-border)' }}
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Phone Number</label>
          <div className="flex gap-2">
            <div className="w-[110px] shrink-0">
              <Select 
                value={form.countryCode}
                onChange={val => setForm(f => ({ ...f, countryCode: val }))}
                options={[
                  { value: '+1', label: '🇺🇸 +1' },
                  { value: '+44', label: '🇬🇧 +44' },
                  { value: '+91', label: '🇮🇳 +91' },
                  { value: '+61', label: '🇦🇺 +61' },
                  { value: '+81', label: '🇯🇵 +81' },
                  { value: '+49', label: '🇩🇪 +49' },
                  { value: '+33', label: '🇫🇷 +33' },
                  { value: '+971', label: '🇦🇪 +971' },
                  { value: '+65', label: '🇸🇬 +65' },
                ]}
                size="lg"
                menuPlacement="top"
              />
            </div>
            <input 
              type="tel" 
              value={form.phoneNumber} 
              onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value.replace(/[^0-9]/g, '') }))}
              placeholder="1234567890"
              className="flex-1 px-4 py-3 rounded-xl border bg-[var(--th-bg)] outline-none focus:border-[var(--th-primary)] min-w-0"
              style={{ borderColor: 'var(--th-border)', color: 'var(--th-text)' }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Date of Birth</label>
          <input 
            type="date" 
            value={form.dateOfBirth} 
            onChange={e => setForm(f => ({ ...f, dateOfBirth: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border bg-[var(--th-bg)] outline-none focus:border-[var(--th-primary)]"
            style={{ borderColor: 'var(--th-border)', colorScheme: 'dark' }}
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Gender</label>
          <Select 
            size="lg"
            value={form.gender}
            onChange={val => setForm(f => ({ ...f, gender: val }))}
            options={[
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
              { value: 'other', label: 'Other' }
            ]}
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

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">The Persona</h2>
        <p style={{ color: 'var(--th-text-secondary)' }}>Establish your digital identity.</p>
      </div>

      <div className="space-y-2">
        <label className="flex items-center justify-between text-sm font-medium mb-2">
          <span>Email Address</span>
          <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-[var(--th-bg-secondary)] text-[var(--th-text-dim)] border border-[var(--th-border)]">Optional</span>
        </label>
        <input 
          type="email" 
          value={form.email} 
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          placeholder="your@email.com"
          className="w-full px-4 py-3 rounded-xl border bg-[var(--th-bg)] outline-none focus:border-[var(--th-primary)] text-sm transition-colors"
          style={{ borderColor: 'var(--th-border)' }}
        />
      </div>

      <div className="space-y-2">
        <label className="flex items-center justify-between text-sm font-medium mb-2">
          <span>Personal Mantra / Bio</span>
          <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-[var(--th-bg-secondary)] text-[var(--th-text-dim)] border border-[var(--th-border)]">Optional</span>
        </label>
        <textarea 
          value={form.mantra} 
          onChange={e => setForm(f => ({ ...f, mantra: e.target.value }))}
          placeholder="e.g. Getting 1% better every day."
          className="w-full px-4 py-3 rounded-xl border bg-[var(--th-bg)] outline-none focus:border-[var(--th-primary)] transition-colors resize-none"
          style={{ borderColor: 'var(--th-border)', minHeight: '80px' }}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="flex items-center justify-between text-sm font-medium mb-2">
            <span>LinkedIn URL</span>
            <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-[var(--th-bg-secondary)] text-[var(--th-text-dim)] border border-[var(--th-border)]">Optional</span>
          </label>
          <input 
            type="text" 
            value={form.linkedinUrl} 
            onChange={e => setForm(f => ({ ...f, linkedinUrl: e.target.value }))}
            placeholder="linkedin.com/in/..."
            className="w-full px-4 py-3 rounded-xl border bg-[var(--th-bg)] outline-none focus:border-[var(--th-primary)] text-sm"
            style={{ borderColor: 'var(--th-border)' }}
          />
        </div>
        <div className="space-y-2">
          <label className="flex items-center justify-between text-sm font-medium mb-2">
            <span>Twitter URL</span>
            <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-[var(--th-bg-secondary)] text-[var(--th-text-dim)] border border-[var(--th-border)]">Optional</span>
          </label>
          <input 
            type="text" 
            value={form.twitterUrl} 
            onChange={e => setForm(f => ({ ...f, twitterUrl: e.target.value }))}
            placeholder="twitter.com/..."
            className="w-full px-4 py-3 rounded-xl border bg-[var(--th-bg)] outline-none focus:border-[var(--th-primary)] text-sm"
            style={{ borderColor: 'var(--th-border)' }}
          />
        </div>
        <div className="space-y-2">
          <label className="flex items-center justify-between text-sm font-medium mb-2">
            <span>GitHub URL</span>
            <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-[var(--th-bg-secondary)] text-[var(--th-text-dim)] border border-[var(--th-border)]">Optional</span>
          </label>
          <input 
            type="text" 
            value={form.githubUrl} 
            onChange={e => setForm(f => ({ ...f, githubUrl: e.target.value }))}
            placeholder="github.com/..."
            className="w-full px-4 py-3 rounded-xl border bg-[var(--th-bg)] outline-none focus:border-[var(--th-primary)] text-sm"
            style={{ borderColor: 'var(--th-border)' }}
          />
        </div>
        <div className="space-y-2">
          <label className="flex items-center justify-between text-sm font-medium mb-2">
            <span>LeetCode URL</span>
            <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-[var(--th-bg-secondary)] text-[var(--th-text-dim)] border border-[var(--th-border)]">Optional</span>
          </label>
          <input 
            type="text" 
            value={form.leetcodeUrl} 
            onChange={e => setForm(f => ({ ...f, leetcodeUrl: e.target.value }))}
            placeholder="leetcode.com/u/..."
            className="w-full px-4 py-3 rounded-xl border bg-[var(--th-bg)] outline-none focus:border-[var(--th-primary)] text-sm"
            style={{ borderColor: 'var(--th-border)' }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6" style={{ background: 'var(--th-bg)' }}>
      <div className="max-w-2xl w-full">
        {/* Premium Progress Stepper */}
        <div className="mb-14 relative px-2 sm:px-10">
          <div className="absolute left-10 right-10 top-6 -translate-y-1/2 h-1.5 rounded-full bg-[var(--th-border)]/50 overflow-hidden">
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
              {currentStep === 4 && renderStep4()}
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
