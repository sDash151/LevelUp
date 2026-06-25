import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Sparkles, Loader2, Dumbbell, Apple, Moon, Zap,
  ChevronRight, ChevronLeft, Check, Target, Clock, Scale,
  Flame, Heart, Shield, Users, Utensils, Wallet
} from 'lucide-react';
import {
  useGenerateWorkoutPlan, useGenerateDietPlan, useGenerateRecoveryPlan,
  useGenerateTransformationPlan, useFitnessProfile
} from '../hooks/useFitness';
import CoachChat from './CoachChat';
import PlanPreview from './PlanPreview';

// ═══ STEP CONFIGS ═══
const GOALS = [
  { id: 'fat_loss', label: 'Fat Loss', icon: Flame, desc: 'Lose fat, reveal your physique' },
  { id: 'muscle_gain', label: 'Muscle Gain', icon: Dumbbell, desc: 'Build lean muscle mass' },
  { id: 'recomp', label: 'Recomposition', icon: Zap, desc: 'Lose fat + build muscle simultaneously' },
  { id: 'strength', label: 'Strength', icon: Shield, desc: 'Get stronger on compound lifts' },
  { id: 'endurance', label: 'Endurance', icon: Heart, desc: 'Improve cardiovascular fitness' },
  { id: 'general', label: 'General Fitness', icon: Target, desc: 'Overall health and fitness' },
];

const EXPERIENCE = [
  { id: 'beginner', label: 'Beginner', desc: '0-6 months training' },
  { id: 'intermediate', label: 'Intermediate', desc: '6 months - 2 years' },
  { id: 'advanced', label: 'Advanced', desc: '2+ years consistent training' },
];

const EQUIPMENT = [
  { id: 'full_gym', label: 'Full Gym' },
  { id: 'dumbbells', label: 'Dumbbells Only' },
  { id: 'bands', label: 'Resistance Bands' },
  { id: 'home', label: 'Home Setup' },
  { id: 'bodyweight', label: 'Bodyweight Only' },
];

const DIET_TYPES = [
  { id: 'non_veg', label: 'Non-Vegetarian' },
  { id: 'eggetarian', label: 'Eggetarian' },
  { id: 'veg', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
];

const FOOD_STYLES = [
  { id: 'familiar', label: 'Mostly Indian', desc: '80% Indian staples' },
  { id: 'hybrid', label: 'Hybrid', desc: '50% Indian + fitness foods' },
  { id: 'mixed', label: 'Mixed', desc: 'Equal mix of everything' },
  { id: 'bodybuilding', label: 'Bodybuilding', desc: '70% fitness-oriented' },
];

const COOKING = [
  { id: 'cannot_cook', label: "Can't Cook", desc: 'Ready-to-eat / PG food only' },
  { id: 'basic', label: 'Basic', desc: 'Simple cooking (oats, eggs, rice)' },
  { id: 'full', label: 'Full Kitchen', desc: 'Can cook anything' },
];

const SPLITS = [
  { id: 'push_pull_legs', label: 'Push Pull Legs' },
  { id: 'upper_lower', label: 'Upper / Lower' },
  { id: 'full_body', label: 'Full Body' },
  { id: 'bro_split', label: 'Bro Split' },
];

const PLAN_TYPES = [
  { id: 'transformation', label: 'Full Transformation', icon: Zap, desc: 'Workout + Diet + Recovery', gradient: 'linear-gradient(135deg, #E8A23A, #D4891A)' },
  { id: 'workout', label: 'Workout Plan', icon: Dumbbell, desc: 'AI-powered training plan', gradient: 'linear-gradient(135deg, #6366F1, #4F46E5)' },
  { id: 'diet', label: 'Diet Plan', icon: Apple, desc: 'Personalized nutrition plan', gradient: 'linear-gradient(135deg, #10B981, #059669)' },
  { id: 'recovery', label: 'Recovery Plan', icon: Moon, desc: 'Sleep, hydration & mobility', gradient: 'linear-gradient(135deg, #8B5CF6, #7C3AED)' },
];

const STEPS = [
  { key: 'planType', title: 'Choose Your Plan' },
  { key: 'body', title: 'Body Stats' },
  { key: 'goal', title: 'Your Goal' },
  { key: 'training', title: 'Training Preferences' },
  { key: 'diet', title: 'Diet Preferences' },
  { key: 'lifestyle', title: 'Lifestyle' },
  { key: 'review', title: 'Review & Generate' },
];

function getVisibleSteps(planType) {
  if (planType === 'workout') return STEPS.filter(s => !['diet'].includes(s.key));
  if (planType === 'diet') return STEPS.filter(s => !['training'].includes(s.key));
  if (planType === 'recovery') return STEPS.filter(s => !['training', 'diet'].includes(s.key));
  return STEPS;
}

export default function PlanWizard({ onClose, onSuccess }) {
  const { data: profileData } = useFitnessProfile();
  const profile = profileData?.data?.profile || profileData?.profile || {};

  const genWorkout = useGenerateWorkoutPlan();
  const genDiet = useGenerateDietPlan();
  const genRecovery = useGenerateRecoveryPlan();
  const genTransform = useGenerateTransformationPlan();

  const [mode, setMode] = useState('wizard'); // 'wizard' | 'chat' | 'preview'
  const [generatedPlans, setGeneratedPlans] = useState(null);

  const [stepIdx, setStepIdx] = useState(0);
  const [form, setForm] = useState({
    planType: 'transformation',
    weight: profile.weight || '',
    height: profile.height || '',
    age: profile.age || '',
    gender: profile.gender || 'male',
    goal: profile.goal || '',
    experienceLevel: profile.experienceLevel || 'intermediate',
    trainingDays: profile.trainingDays || 5,
    splitType: profile.splitType || 'push_pull_legs',
    equipmentAvailable: profile.equipmentAvailable || ['full_gym'],
    injuryFlags: [],
    injuryInput: '',
    dietType: profile.dietType || 'non_veg',
    foodStyle: 'hybrid',
    cookingAbility: 'basic',
    budget: 8000,
    foodDislikes: [],
    dislikeInput: '',
    accessibilityMode: false,
    lifestyle: 'desk_job',
    sleepHours: 7,
    supplements: [],
    timeline: '8',
  });

  // Sync form state when profile data loads asynchronously
  const profileString = JSON.stringify(profile);
  useEffect(() => {
    if (profile && Object.keys(profile).length > 0) {
      setForm(prev => ({
        ...prev,
        weight: profile.weight || prev.weight,
        height: profile.height || prev.height,
        age: profile.age || prev.age,
        gender: profile.gender || prev.gender,
        goal: profile.goal || prev.goal,
        experienceLevel: profile.experienceLevel || prev.experienceLevel,
        trainingDays: profile.trainingDays || prev.trainingDays,
        splitType: profile.splitType || prev.splitType,
        equipmentAvailable: profile.equipmentAvailable?.length ? profile.equipmentAvailable : prev.equipmentAvailable,
        injuryFlags: profile.injuryFlags?.length ? profile.injuryFlags : prev.injuryFlags,
        dietType: profile.dietType || prev.dietType,
      }));
    }
  }, [profileString]);

  const visibleSteps = getVisibleSteps(form.planType);
  const currentStep = visibleSteps[stepIdx];
  const isLast = stepIdx === visibleSteps.length - 1;
  const isFirst = stepIdx === 0;

  const isGenerating = genWorkout.isPending || genDiet.isPending || genRecovery.isPending || genTransform.isPending;

  const getLoadingMessages = (planType) => {
    if (planType === 'workout') {
      return ["Analyzing Profile...", "Building Custom Workout...", "Validating AI Math...", "Refining Details...", "Finalizing Protocol..."];
    }
    if (planType === 'diet') {
      return ["Analyzing Profile...", "Calculating Macros...", "Structuring Diet Plan...", "Double-checking Budget...", "Finalizing Protocol..."];
    }
    if (planType === 'recovery') {
      return ["Analyzing Profile...", "Optimizing Recovery...", "Structuring Mobility Plan...", "Finalizing Protocol..."];
    }
    return [
      "Analyzing Profile...",
      "Calculating Macros...",
      "Building Custom Workout...",
      "Structuring Diet Plan...",
      "Optimizing Recovery...",
      "Validating AI Math...",
      "Double-checking Budget...",
      "Finalizing Protocol..."
    ];
  };

  const loadingMessages = getLoadingMessages(form.planType);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  useEffect(() => {
    let interval;
    if (isGenerating) {
      interval = setInterval(() => {
        setLoadingMsgIdx(prev => (prev + 1) % loadingMessages.length);
      }, 4500); // cycle every 4.5 seconds
    } else {
      setLoadingMsgIdx(0);
    }
    return () => clearInterval(interval);
  }, [isGenerating, loadingMessages.length]);

  const update = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateMultiple = useCallback((newData) => {
    setForm(prev => ({ ...prev, ...newData }));
  }, []);

  const toggleArray = useCallback((field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(value) ? prev[field].filter(v => v !== value) : [...prev[field], value],
    }));
  }, []);

  const addToArray = useCallback((field, inputField) => {
    setForm(prev => {
      const val = prev[inputField]?.trim();
      if (!val || prev[field].includes(val)) return prev;
      return { ...prev, [field]: [...prev[field], val], [inputField]: '' };
    });
  }, []);

  const removeFromArray = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: prev[field].filter(v => v !== value) }));
  }, []);

  const next = () => { if (!isLast) setStepIdx(i => i + 1); };
  const back = () => { if (!isFirst) setStepIdx(i => i - 1); };

  const handleGenerate = async () => {
    const payload = { ...form };
    delete payload.injuryInput;
    delete payload.dislikeInput;
    delete payload.planType;
    payload.weight = Number(payload.weight) || undefined;
    payload.height = Number(payload.height) || undefined;
    payload.age = Number(payload.age) || undefined;
    payload.trainingDays = Number(payload.trainingDays);
    payload.budget = Number(payload.budget);
    payload.sleepHours = Number(payload.sleepHours);

    try {
      let res;
      switch (form.planType) {
        case 'workout': res = await genWorkout.mutateAsync(payload); break;
        case 'diet': res = await genDiet.mutateAsync(payload); break;
        case 'recovery': res = await genRecovery.mutateAsync(payload); break;
        default: res = await genTransform.mutateAsync(payload);
      }
      // Backend automatically sets isActive: true
      // We capture the output and show the Preview so they can review what just got built
      setGeneratedPlans(res.data || res);
      setMode('preview');
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcceptPreview = () => {
    onSuccess?.();
    onClose?.();
  };

  const handleTweakPreview = () => {
    setMode('wizard');
  };

  // ═══ RENDER STEPS ═══
  const renderStep = () => {
    switch (currentStep.key) {
      case 'planType': return <StepPlanType form={form} update={update} />;
      case 'body': return <StepBody form={form} update={update} />;
      case 'goal': return <StepGoal form={form} update={update} />;
      case 'training': return <StepTraining form={form} update={update} toggleArray={toggleArray} addToArray={addToArray} removeFromArray={removeFromArray} />;
      case 'diet': return <StepDiet form={form} update={update} addToArray={addToArray} removeFromArray={removeFromArray} />;
      case 'lifestyle': return <StepLifestyle form={form} update={update} toggleArray={toggleArray} />;
      case 'review': return <StepReview form={form} />;
      default: return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-end md:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full md:max-w-lg md:rounded-2xl rounded-t-3xl overflow-hidden flex flex-col"
        style={{
          background: 'var(--th-card)',
          border: '1px solid var(--th-border)',
          maxHeight: '92vh',
        }}
      >
        {/* Header (Hidden in Preview) */}
        {mode !== 'preview' && (
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--th-border)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #E8A23A, #D4891A)' }}>
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold" style={{ color: 'var(--th-text)' }}>Make Your Plan</h2>
                {mode === 'wizard' && <p className="text-xs" style={{ color: 'var(--th-text-secondary)' }}>{currentStep.title}</p>}
                {mode === 'chat' && <p className="text-xs" style={{ color: 'var(--th-text-secondary)' }}>Talk to AI Coach</p>}
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl transition-colors hover:bg-black/5 dark:hover:bg-white/5">
              <X className="w-5 h-5" style={{ color: 'var(--th-text-secondary)' }} />
            </button>
          </div>
        )}

        {/* Segmented Switch */}
        {mode !== 'preview' && (
          <div className="px-5 pt-4 pb-2">
            <div className="flex p-1 rounded-xl bg-[var(--th-bg)] border" style={{ borderColor: 'var(--th-border)' }}>
              <button
                onClick={() => setMode('wizard')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${mode === 'wizard' ? 'bg-[var(--th-card)] shadow-sm text-[var(--th-primary)]' : 'text-[var(--th-text-secondary)] hover:text-[var(--th-text)]'}`}
              >
                Quick Setup
              </button>
              <button
                onClick={() => setMode('chat')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${mode === 'chat' ? 'bg-[var(--th-card)] shadow-sm text-[var(--th-primary)]' : 'text-[var(--th-text-secondary)] hover:text-[var(--th-text)]'}`}
              >
                Talk to Coach
              </button>
            </div>
          </div>
        )}

        {/* Progress Bar for Wizard only */}
        {mode === 'wizard' && (
          <div className="px-5 pt-2">
            <div className="flex items-center gap-1.5">
              {visibleSteps.map((_, i) => (
                <div
                  key={i}
                  className="h-1 rounded-full flex-1 transition-all duration-300"
                  style={{ background: i <= stepIdx ? 'var(--th-primary)' : 'var(--th-border)' }}
                />
              ))}
            </div>
            <p className="text-xs mt-1.5" style={{ color: 'var(--th-text-secondary)' }}>
              Step {stepIdx + 1} of {visibleSteps.length}
            </p>
          </div>
        )}

        {/* Dynamic Content Body */}
        {mode === 'preview' && generatedPlans ? (
          <PlanPreview 
            generatedPlans={generatedPlans} 
            onAccept={handleAcceptPreview} 
            onRegenerate={handleGenerate} 
            onTweak={handleTweakPreview}
            isGenerating={isGenerating} 
          />
        ) : mode === 'chat' ? (
          <div className="p-5 overflow-y-auto">
            <CoachChat currentState={form} onUpdateState={updateMultiple} />
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="py-3 px-6 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: 'var(--th-primary)' }}
              >
                {isGenerating ? <><Loader2 className="w-5 h-5 animate-spin" /> <span className="animate-pulse">{loadingMessages[loadingMsgIdx]}</span></> : <><Sparkles className="w-5 h-5" /> Generate Plan</>}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4" style={{ minHeight: '300px' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={stepIdx}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {/* Footer actions for Wizard only */}
        {mode === 'wizard' && (
          <div className="flex items-center justify-between px-5 py-4 border-t" style={{ borderColor: 'var(--th-border)', background: 'var(--th-bg)' }}>
            <button
              onClick={back}
              disabled={isFirst}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-30"
              style={{ color: 'var(--th-text-secondary)' }}
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>

            {isLast ? (
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #E8A23A, #D4891A)' }}
              >
                {isGenerating ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> <span className="animate-pulse">{loadingMessages[loadingMsgIdx]}</span></>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Generate Plan</>
                )}
              </button>
            ) : (
              <button
                onClick={next}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: 'var(--th-primary)' }}
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ═══ INDIVIDUAL STEP COMPONENTS ═══

function OptionCard({ selected, onClick, children, style = {} }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-3.5 rounded-xl border-2 transition-all hover:scale-[1.01]"
      style={{
        borderColor: selected ? 'var(--th-primary)' : 'var(--th-border)',
        background: selected ? 'color-mix(in srgb, var(--th-primary) 8%, var(--th-card))' : 'var(--th-card)',
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function StepPlanType({ form, update }) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium" style={{ color: 'var(--th-text-secondary)' }}>What would you like to generate?</p>
      {PLAN_TYPES.map(pt => {
        const Icon = pt.icon;
        return (
          <OptionCard key={pt.id} selected={form.planType === pt.id} onClick={() => update('planType', pt.id)}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: pt.gradient }}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--th-text)' }}>{pt.label}</p>
                <p className="text-xs" style={{ color: 'var(--th-text-secondary)' }}>{pt.desc}</p>
              </div>
              {form.planType === pt.id && <Check className="w-5 h-5 ml-auto flex-shrink-0" style={{ color: 'var(--th-primary)' }} />}
            </div>
          </OptionCard>
        );
      })}
    </div>
  );
}

function InputField({ label, value, onChange, type = 'number', placeholder, suffix }) {
  return (
    <div>
      <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--th-text-secondary)' }}>{label}</label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all border"
          style={{
            background: 'var(--th-bg)',
            color: 'var(--th-text)',
            borderColor: 'var(--th-border)',
          }}
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--th-text-secondary)' }}>{suffix}</span>}
      </div>
    </div>
  );
}

function StepBody({ form, update }) {
  return (
    <div className="space-y-4">
      <p className="text-sm font-medium" style={{ color: 'var(--th-text-secondary)' }}>Enter your current body stats</p>
      <div className="grid grid-cols-2 gap-3">
        <InputField label="Weight" value={form.weight} onChange={v => update('weight', v)} placeholder="75" suffix="kg" />
        <InputField label="Height" value={form.height} onChange={v => update('height', v)} placeholder="175" suffix="cm" />
        <InputField label="Age" value={form.age} onChange={v => update('age', v)} placeholder="25" suffix="yrs" />
        <div>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--th-text-secondary)' }}>Gender</label>
          <div className="flex gap-2">
            {['male', 'female'].map(g => (
              <button
                key={g}
                onClick={() => update('gender', g)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all capitalize"
                style={{
                  borderColor: form.gender === g ? 'var(--th-primary)' : 'var(--th-border)',
                  background: form.gender === g ? 'color-mix(in srgb, var(--th-primary) 10%, var(--th-card))' : 'var(--th-bg)',
                  color: form.gender === g ? 'var(--th-primary)' : 'var(--th-text-secondary)',
                }}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepGoal({ form, update }) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium" style={{ color: 'var(--th-text-secondary)' }}>What's your primary goal?</p>
      {GOALS.map(g => {
        const Icon = g.icon;
        return (
          <OptionCard key={g.id} selected={form.goal === g.id} onClick={() => update('goal', g.id)}>
            <div className="flex items-center gap-3">
              <Icon className="w-5 h-5 flex-shrink-0" style={{ color: form.goal === g.id ? 'var(--th-primary)' : 'var(--th-text-secondary)' }} />
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--th-text)' }}>{g.label}</p>
                <p className="text-xs" style={{ color: 'var(--th-text-secondary)' }}>{g.desc}</p>
              </div>
              {form.goal === g.id && <Check className="w-4 h-4 ml-auto" style={{ color: 'var(--th-primary)' }} />}
            </div>
          </OptionCard>
        );
      })}
    </div>
  );
}

function StepTraining({ form, update, toggleArray, addToArray, removeFromArray }) {
  return (
    <div className="space-y-5">
      {/* Experience */}
      <div>
        <p className="text-xs font-medium mb-2" style={{ color: 'var(--th-text-secondary)' }}>Experience Level</p>
        <div className="grid grid-cols-3 gap-2">
          {EXPERIENCE.map(e => (
            <button
              key={e.id}
              onClick={() => update('experienceLevel', e.id)}
              className="p-2.5 rounded-xl text-center border transition-all"
              style={{
                borderColor: form.experienceLevel === e.id ? 'var(--th-primary)' : 'var(--th-border)',
                background: form.experienceLevel === e.id ? 'color-mix(in srgb, var(--th-primary) 10%, var(--th-card))' : 'var(--th-bg)',
              }}
            >
              <p className="text-xs font-semibold" style={{ color: form.experienceLevel === e.id ? 'var(--th-primary)' : 'var(--th-text)' }}>{e.label}</p>
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--th-text-secondary)' }}>{e.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Training Days */}
      <div>
        <p className="text-xs font-medium mb-2" style={{ color: 'var(--th-text-secondary)' }}>Training Days / Week</p>
        <div className="flex gap-2">
          {[3, 4, 5, 6].map(d => (
            <button
              key={d}
              onClick={() => update('trainingDays', d)}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all"
              style={{
                borderColor: form.trainingDays === d ? 'var(--th-primary)' : 'var(--th-border)',
                background: form.trainingDays === d ? 'color-mix(in srgb, var(--th-primary) 10%, var(--th-card))' : 'var(--th-bg)',
                color: form.trainingDays === d ? 'var(--th-primary)' : 'var(--th-text-secondary)',
              }}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Split */}
      <div>
        <p className="text-xs font-medium mb-2" style={{ color: 'var(--th-text-secondary)' }}>Training Split</p>
        <div className="grid grid-cols-2 gap-2">
          {SPLITS.map(s => (
            <button
              key={s.id}
              onClick={() => update('splitType', s.id)}
              className="py-2.5 px-3 rounded-xl text-xs font-medium border transition-all text-left"
              style={{
                borderColor: form.splitType === s.id ? 'var(--th-primary)' : 'var(--th-border)',
                background: form.splitType === s.id ? 'color-mix(in srgb, var(--th-primary) 10%, var(--th-card))' : 'var(--th-bg)',
                color: form.splitType === s.id ? 'var(--th-primary)' : 'var(--th-text)',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Equipment */}
      <div>
        <p className="text-xs font-medium mb-2" style={{ color: 'var(--th-text-secondary)' }}>Available Equipment</p>
        <div className="flex flex-wrap gap-2">
          {EQUIPMENT.map(e => (
            <button
              key={e.id}
              onClick={() => toggleArray('equipmentAvailable', e.id)}
              className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
              style={{
                borderColor: form.equipmentAvailable.includes(e.id) ? 'var(--th-primary)' : 'var(--th-border)',
                background: form.equipmentAvailable.includes(e.id) ? 'color-mix(in srgb, var(--th-primary) 10%, var(--th-card))' : 'transparent',
                color: form.equipmentAvailable.includes(e.id) ? 'var(--th-primary)' : 'var(--th-text-secondary)',
              }}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      {/* Injuries */}
      <div>
        <p className="text-xs font-medium mb-2" style={{ color: 'var(--th-text-secondary)' }}>Any Injuries? <span className="opacity-50">(optional)</span></p>
        <div className="flex gap-2">
          <input
            type="text"
            value={form.injuryInput}
            onChange={e => update('injuryInput', e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addToArray('injuryFlags', 'injuryInput')}
            placeholder="e.g. lower back, shoulder"
            className="flex-1 px-3 py-2 rounded-xl text-sm border outline-none"
            style={{ background: 'var(--th-bg)', color: 'var(--th-text)', borderColor: 'var(--th-border)' }}
          />
          <button
            onClick={() => addToArray('injuryFlags', 'injuryInput')}
            className="px-3 py-2 rounded-xl text-sm font-medium text-white"
            style={{ background: 'var(--th-primary)' }}
          >Add</button>
        </div>
        {form.injuryFlags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {form.injuryFlags.map(f => (
              <span key={f} className="px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1" style={{ background: 'color-mix(in srgb, var(--th-primary) 15%, var(--th-card))', color: 'var(--th-primary)' }}>
                {f}
                <button onClick={() => removeFromArray('injuryFlags', f)} className="ml-0.5"><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StepDiet({ form, update, addToArray, removeFromArray }) {
  return (
    <div className="space-y-5">
      {/* Diet Type */}
      <div>
        <p className="text-xs font-medium mb-2" style={{ color: 'var(--th-text-secondary)' }}>Diet Type</p>
        <div className="grid grid-cols-2 gap-2">
          {DIET_TYPES.map(d => (
            <button
              key={d.id}
              onClick={() => update('dietType', d.id)}
              className="py-2.5 px-3 rounded-xl text-xs font-medium border transition-all"
              style={{
                borderColor: form.dietType === d.id ? 'var(--th-primary)' : 'var(--th-border)',
                background: form.dietType === d.id ? 'color-mix(in srgb, var(--th-primary) 10%, var(--th-card))' : 'var(--th-bg)',
                color: form.dietType === d.id ? 'var(--th-primary)' : 'var(--th-text)',
              }}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Food Style */}
      <div>
        <p className="text-xs font-medium mb-2" style={{ color: 'var(--th-text-secondary)' }}>Food Style Preference</p>
        <div className="space-y-2">
          {FOOD_STYLES.map(f => (
            <OptionCard key={f.id} selected={form.foodStyle === f.id} onClick={() => update('foodStyle', f.id)}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold" style={{ color: 'var(--th-text)' }}>{f.label}</p>
                  <p className="text-[10px]" style={{ color: 'var(--th-text-secondary)' }}>{f.desc}</p>
                </div>
                {form.foodStyle === f.id && <Check className="w-4 h-4" style={{ color: 'var(--th-primary)' }} />}
              </div>
            </OptionCard>
          ))}
        </div>
      </div>

      {/* Cooking */}
      <div>
        <p className="text-xs font-medium mb-2" style={{ color: 'var(--th-text-secondary)' }}>Cooking Ability</p>
        <div className="grid grid-cols-3 gap-2">
          {COOKING.map(c => (
            <button
              key={c.id}
              onClick={() => update('cookingAbility', c.id)}
              className="p-2.5 rounded-xl text-center border transition-all"
              style={{
                borderColor: form.cookingAbility === c.id ? 'var(--th-primary)' : 'var(--th-border)',
                background: form.cookingAbility === c.id ? 'color-mix(in srgb, var(--th-primary) 10%, var(--th-card))' : 'var(--th-bg)',
              }}
            >
              <p className="text-xs font-semibold" style={{ color: form.cookingAbility === c.id ? 'var(--th-primary)' : 'var(--th-text)' }}>{c.label}</p>
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--th-text-secondary)' }}>{c.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Budget */}
      <InputField label="Monthly Food Budget" value={form.budget} onChange={v => update('budget', v)} placeholder="8000" suffix="₹/month" />

      {/* Dislikes */}
      <div>
        <p className="text-xs font-medium mb-2" style={{ color: 'var(--th-text-secondary)' }}>Food Dislikes <span className="opacity-50">(optional)</span></p>
        <div className="flex gap-2">
          <input
            type="text"
            value={form.dislikeInput}
            onChange={e => update('dislikeInput', e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addToArray('foodDislikes', 'dislikeInput')}
            placeholder="e.g. mushroom, fish"
            className="flex-1 px-3 py-2 rounded-xl text-sm border outline-none"
            style={{ background: 'var(--th-bg)', color: 'var(--th-text)', borderColor: 'var(--th-border)' }}
          />
          <button
            onClick={() => addToArray('foodDislikes', 'dislikeInput')}
            className="px-3 py-2 rounded-xl text-sm font-medium text-white"
            style={{ background: 'var(--th-primary)' }}
          >Add</button>
        </div>
        {form.foodDislikes.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {form.foodDislikes.map(f => (
              <span key={f} className="px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1" style={{ background: 'color-mix(in srgb, var(--th-primary) 15%, var(--th-card))', color: 'var(--th-primary)' }}>
                {f}
                <button onClick={() => removeFromArray('foodDislikes', f)}><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Accessibility Mode */}
      <div className="flex items-center justify-between p-3 rounded-xl border" style={{ borderColor: 'var(--th-border)', background: 'var(--th-bg)' }}>
        <div>
          <p className="text-xs font-semibold" style={{ color: 'var(--th-text)' }}>Accessibility Mode</p>
          <p className="text-[10px]" style={{ color: 'var(--th-text-secondary)' }}>Prioritize easily available, affordable foods</p>
        </div>
        <button
          onClick={() => update('accessibilityMode', !form.accessibilityMode)}
          className="w-10 h-6 rounded-full transition-all relative flex-shrink-0"
          style={{ background: form.accessibilityMode ? 'var(--th-primary)' : 'var(--th-border)' }}
        >
          <div className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all" style={{ left: form.accessibilityMode ? '22px' : '2px' }} />
        </button>
      </div>
    </div>
  );
}

function StepLifestyle({ form, update, toggleArray }) {
  const lifestyles = [
    { id: 'student', label: 'Student' },
    { id: 'desk_job', label: 'Desk Job' },
    { id: 'active_job', label: 'Active Job' },
    { id: 'shift_worker', label: 'Shift Worker' },
  ];
  const supplementsList = [
    { id: 'none', label: 'None' },
    { id: 'whey', label: 'Whey Protein' },
    { id: 'creatine', label: 'Creatine' },
  ];

  return (
    <div className="space-y-5">
      {/* Lifestyle */}
      <div>
        <p className="text-xs font-medium mb-2" style={{ color: 'var(--th-text-secondary)' }}>Lifestyle</p>
        <div className="grid grid-cols-2 gap-2">
          {lifestyles.map(l => (
            <button
              key={l.id}
              onClick={() => update('lifestyle', l.id)}
              className="py-2.5 rounded-xl text-xs font-medium border transition-all"
              style={{
                borderColor: form.lifestyle === l.id ? 'var(--th-primary)' : 'var(--th-border)',
                background: form.lifestyle === l.id ? 'color-mix(in srgb, var(--th-primary) 10%, var(--th-card))' : 'var(--th-bg)',
                color: form.lifestyle === l.id ? 'var(--th-primary)' : 'var(--th-text)',
              }}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sleep */}
      <div>
        <p className="text-xs font-medium mb-2" style={{ color: 'var(--th-text-secondary)' }}>Average Sleep (hours)</p>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={4}
            max={10}
            step={0.5}
            value={form.sleepHours}
            onChange={e => update('sleepHours', parseFloat(e.target.value))}
            className="flex-1 accent-amber-500"
          />
          <span className="text-sm font-bold w-12 text-center" style={{ color: 'var(--th-text)' }}>{form.sleepHours}h</span>
        </div>
      </div>

      {/* Supplements */}
      <div>
        <p className="text-xs font-medium mb-2" style={{ color: 'var(--th-text-secondary)' }}>Supplements</p>
        <div className="flex flex-wrap gap-2">
          {supplementsList.map(s => (
            <button
              key={s.id}
              onClick={() => toggleArray('supplements', s.id)}
              className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
              style={{
                borderColor: form.supplements.includes(s.id) ? 'var(--th-primary)' : 'var(--th-border)',
                background: form.supplements.includes(s.id) ? 'color-mix(in srgb, var(--th-primary) 10%, var(--th-card))' : 'transparent',
                color: form.supplements.includes(s.id) ? 'var(--th-primary)' : 'var(--th-text-secondary)',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div>
        <p className="text-xs font-medium mb-2" style={{ color: 'var(--th-text-secondary)' }}>Plan Duration</p>
        <div className="flex gap-2">
          {['4', '8', '12', 'flexible'].map(t => (
            <button
              key={t}
              onClick={() => update('timeline', t)}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all"
              style={{
                borderColor: form.timeline === t ? 'var(--th-primary)' : 'var(--th-border)',
                background: form.timeline === t ? 'color-mix(in srgb, var(--th-primary) 10%, var(--th-card))' : 'var(--th-bg)',
                color: form.timeline === t ? 'var(--th-primary)' : 'var(--th-text-secondary)',
              }}
            >
              {t === 'flexible' ? 'Flex' : `${t}w`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepReview({ form }) {
  const planLabel = PLAN_TYPES.find(p => p.id === form.planType)?.label || 'Plan';
  const goalLabel = GOALS.find(g => g.id === form.goal)?.label || form.goal;

  const rows = [
    { label: 'Plan Type', value: planLabel },
    { label: 'Body', value: `${form.weight}kg, ${form.height}cm, ${form.age}y, ${form.gender}` },
    { label: 'Goal', value: goalLabel },
    { label: 'Experience', value: form.experienceLevel },
    { label: 'Training', value: `${form.trainingDays} days/week · ${form.splitType?.replace(/_/g, ' ')}` },
    { label: 'Equipment', value: form.equipmentAvailable?.join(', ') },
    { label: 'Diet', value: `${form.dietType?.replace(/_/g, ' ')} · ${form.foodStyle}` },
    { label: 'Cooking', value: form.cookingAbility?.replace(/_/g, ' ') },
    { label: 'Budget', value: `₹${form.budget}/month` },
    { label: 'Sleep', value: `${form.sleepHours}h/night` },
    { label: 'Duration', value: form.timeline === 'flexible' ? 'Flexible' : `${form.timeline} weeks` },
  ];

  if (form.injuryFlags?.length) rows.push({ label: 'Injuries', value: form.injuryFlags.join(', ') });
  if (form.foodDislikes?.length) rows.push({ label: 'Dislikes', value: form.foodDislikes.join(', ') });

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl border" style={{ background: 'color-mix(in srgb, var(--th-primary) 5%, var(--th-bg))', borderColor: 'var(--th-border)' }}>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4" style={{ color: 'var(--th-primary)' }} />
          <p className="text-sm font-bold" style={{ color: 'var(--th-text)' }}>Plan Summary</p>
        </div>
        <div className="space-y-2">
          {rows.map(r => (
            <div key={r.label} className="flex items-start justify-between gap-2">
              <span className="text-xs" style={{ color: 'var(--th-text-secondary)' }}>{r.label}</span>
              <span className="text-xs font-medium text-right capitalize" style={{ color: 'var(--th-text)' }}>{r.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-3 rounded-xl" style={{ background: 'color-mix(in srgb, #E8A23A 10%, var(--th-bg))' }}>
        <p className="text-xs font-medium text-center" style={{ color: '#E8A23A' }}>
          ⚡ AI will calculate your exact TDEE, macros, and targets — then generate a fully personalized plan
        </p>
      </div>
    </div>
  );
}
