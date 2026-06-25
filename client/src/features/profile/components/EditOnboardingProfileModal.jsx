import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuthStore } from '@/shared/stores/authStore';
import { useUser } from '@/features/auth/hooks/useAuth';
import { useFitnessProfile } from '@/features/fitness/hooks/useFitness';
import { api } from '@/shared/utils/api-client';
import { Select } from '@/design-system/components/Select';
import { X, User, HeartPulse, Briefcase, Dumbbell, Wallet, Sparkles, MapPin, Smile } from 'lucide-react';
import Autocomplete from 'react-google-autocomplete';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function EditOnboardingProfileModal({ isOpen, onClose }) {
  const user = useAuthStore(s => s.user);
  const { refetch } = useUser();
  const { data: fitnessData, refetch: refetchFitness } = useFitnessProfile();
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('career');

  const [form, setForm] = useState({
    email: '',
    primaryFocus: 'career',
    jobTitle: '',
    currentSalary: '',
    dreamRole: '',
    targetIncome: '',
    baseCurrency: 'INR',
    address: '',
    city: '',
    country: '',
    phoneNumber: '',
    mantra: '',
    leetcodeUrl: '',
    linkedinUrl: '',
    twitterUrl: '',
    githubUrl: '',
    height: '',
    weight: '',
    dateOfBirth: '',
    gender: 'male',
    goal: 'general',
    experienceLevel: 'beginner',
  });

  useEffect(() => {
    if (user && isOpen) {
      const fData = fitnessData?.data?.profile || fitnessData?.profile || {};
      const formattedDob = user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '';
      const phoneParts = user.phoneNumber ? user.phoneNumber.split(' ') : [];
      const countryCode = phoneParts.length > 1 && phoneParts[0].startsWith('+') ? phoneParts[0] : '+91';
      const pureNumber = phoneParts.length > 1 ? phoneParts.slice(1).join(' ') : (user.phoneNumber || '');

      const userEmail = user.email || '';
      const initialEmail = userEmail.includes('@github.com') ? '' : userEmail;

      setForm({
        email: initialEmail,
        primaryFocus: user.primaryFocus || 'career',
        jobTitle: user.jobTitle || '',
        currentSalary: user.currentSalary || '',
        dreamRole: user.dreamRole || '',
        targetIncome: user.targetIncome || '',
        baseCurrency: user.baseCurrency || 'INR',
        address: user.address || '',
        city: user.city || '',
        country: user.country || '',
        countryCode: countryCode,
        phoneNumber: pureNumber,
        mantra: user.mantra || '',
        leetcodeUrl: user.leetcodeUrl || '',
        linkedinUrl: user.linkedinUrl || '',
        twitterUrl: user.twitterUrl || '',
        githubUrl: user.githubUrl || '',
        height: fData.height || '',
        weight: fData.weight || '',
        dateOfBirth: formattedDob,
        gender: fData.gender || 'male',
        goal: fData.goal || 'general',
        experienceLevel: fData.experienceLevel || 'beginner',
      });
      setActiveTab('career');
    }
  }, [user, fitnessData, isOpen]);

  const handleSave = async () => {
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
        onboardingStep: 4, // Ensures they are fully onboarded
      });
      await refetch();
      await refetchFitness();
      toast.success('Blueprint updated successfully!');
      onClose();
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error('Failed to save profile details.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose} 
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.95, y: 20 }} 
        className="relative w-full max-w-3xl bg-[var(--th-bg)] border border-[var(--th-border)] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-[var(--th-border)] bg-[var(--th-card)] flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-black" style={{ color: 'var(--th-text)' }}>Edit App Blueprint</h2>
            <p className="text-xs mt-1" style={{ color: 'var(--th-text-secondary)' }}>Update your LevelUP Identity and Baselines.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" style={{ color: 'var(--th-text-secondary)' }} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--th-border)] bg-[var(--th-bg-secondary)] shrink-0 overflow-x-auto hide-scrollbar">
          {[
            { id: 'career', label: 'Career & Finance', icon: Briefcase },
            { id: 'world', label: 'World & Persona', icon: MapPin },
            { id: 'physical', label: 'Physical Baselines', icon: HeartPulse },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap",
                activeTab === tab.id 
                  ? "border-[var(--th-primary)] text-[var(--th-primary)] bg-[var(--th-primary)]/5" 
                  : "border-transparent text-[var(--th-text-secondary)] hover:bg-black/5 dark:hover:bg-white/5"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'career' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold" style={{ color: 'var(--th-text)' }}>Primary Focus</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'career', label: 'Career & Tech', icon: Briefcase, color: '#3b82f6' },
                        { id: 'fitness', label: 'Fitness & Health', icon: Dumbbell, color: '#ef4444' },
                        { id: 'finance', label: 'Wealth & Finance', icon: Wallet, color: '#10b981' },
                        { id: 'all', label: 'Everything', icon: Sparkles, color: '#8b5cf6' }
                      ].map(focus => (
                        <button
                          key={focus.id}
                          onClick={() => setForm(f => ({ ...f, primaryFocus: focus.id }))}
                          className={clsx(
                            "flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 text-left",
                            form.primaryFocus === focus.id 
                              ? "border-[var(--th-primary)] bg-[var(--th-primary)]/10" 
                              : "border-[var(--th-border)] bg-[var(--th-card)] hover:border-[var(--th-primary)]/50"
                          )}
                        >
                          <focus.icon className="w-6 h-6 shrink-0" style={{ color: focus.color }} />
                          <span className="font-bold text-sm" style={{ color: 'var(--th-text)' }}>{focus.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold" style={{ color: 'var(--th-text)' }}>Current Job Title</label>
                      <input 
                        type="text" 
                        value={form.jobTitle} 
                        onChange={e => setForm(f => ({ ...f, jobTitle: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border bg-[var(--th-bg)] outline-none focus:border-[var(--th-primary)] text-sm"
                        style={{ borderColor: 'var(--th-border)', color: 'var(--th-text)' }}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold" style={{ color: 'var(--th-text)' }}>Current Salary /yr</label>
                      <input 
                        type="number" 
                        value={form.currentSalary} 
                        onChange={e => setForm(f => ({ ...f, currentSalary: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border bg-[var(--th-bg)] outline-none focus:border-[var(--th-primary)] text-sm"
                        style={{ borderColor: 'var(--th-border)', color: 'var(--th-text)' }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-12 gap-4 pt-4 border-t border-[var(--th-border)]">
                    <div className="col-span-4 space-y-2">
                      <label className="block text-sm font-bold" style={{ color: 'var(--th-text)' }}>Currency</label>
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
                      <label className="block text-sm font-bold" style={{ color: 'var(--th-text)' }}>Dream Tech Role</label>
                      <input 
                        type="text" 
                        value={form.dreamRole} 
                        onChange={e => setForm(f => ({ ...f, dreamRole: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border bg-[var(--th-bg)] outline-none focus:border-[var(--th-primary)] text-sm"
                        style={{ borderColor: 'var(--th-border)', color: 'var(--th-text)' }}
                      />
                    </div>
                    <div className="col-span-4 space-y-2">
                      <label className="block text-sm font-bold" style={{ color: 'var(--th-text)' }}>Target Income</label>
                      <input 
                        type="number" 
                        value={form.targetIncome} 
                        onChange={e => setForm(f => ({ ...f, targetIncome: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border bg-[var(--th-bg)] outline-none focus:border-[var(--th-primary)] text-sm"
                        style={{ borderColor: 'var(--th-border)', color: 'var(--th-text)' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'world' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold" style={{ color: 'var(--th-text)' }}>Home Address</label>
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
                        className="w-full px-4 py-3 rounded-xl border bg-[var(--th-bg)] outline-none focus:border-[var(--th-primary)] text-sm"
                        style={{ borderColor: 'var(--th-border)', color: 'var(--th-text)' }}
                        placeholder="Search address..."
                        defaultValue={form.address}
                        onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold" style={{ color: 'var(--th-text)' }}>Phone Number</label>
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
                          className="flex-1 px-4 py-3 rounded-xl border bg-[var(--th-bg)] outline-none focus:border-[var(--th-primary)] text-sm min-w-0"
                          style={{ borderColor: 'var(--th-border)', color: 'var(--th-text)' }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-bold" style={{ color: 'var(--th-text)' }}>Email Address</label>
                    <input 
                      type="email" 
                      value={form.email} 
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border bg-[var(--th-bg)] outline-none focus:border-[var(--th-primary)] text-sm"
                      style={{ borderColor: 'var(--th-border)', color: 'var(--th-text)' }}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold" style={{ color: 'var(--th-text)' }}>Personal Mantra / Bio</label>
                    <textarea 
                      value={form.mantra} 
                      onChange={e => setForm(f => ({ ...f, mantra: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border bg-[var(--th-bg)] outline-none focus:border-[var(--th-primary)] text-sm resize-none"
                      style={{ borderColor: 'var(--th-border)', color: 'var(--th-text)', minHeight: '80px' }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--th-border)]">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold" style={{ color: 'var(--th-text)' }}>LinkedIn URL</label>
                      <input 
                        type="text" 
                        value={form.linkedinUrl} 
                        onChange={e => setForm(f => ({ ...f, linkedinUrl: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border bg-[var(--th-bg)] outline-none focus:border-[var(--th-primary)] text-sm"
                        style={{ borderColor: 'var(--th-border)', color: 'var(--th-text)' }}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold" style={{ color: 'var(--th-text)' }}>GitHub URL</label>
                      <input 
                        type="text" 
                        value={form.githubUrl} 
                        onChange={e => setForm(f => ({ ...f, githubUrl: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border bg-[var(--th-bg)] outline-none focus:border-[var(--th-primary)] text-sm"
                        style={{ borderColor: 'var(--th-border)', color: 'var(--th-text)' }}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold" style={{ color: 'var(--th-text)' }}>LeetCode URL</label>
                      <input 
                        type="text" 
                        value={form.leetcodeUrl} 
                        onChange={e => setForm(f => ({ ...f, leetcodeUrl: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border bg-[var(--th-bg)] outline-none focus:border-[var(--th-primary)] text-sm"
                        style={{ borderColor: 'var(--th-border)', color: 'var(--th-text)' }}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold" style={{ color: 'var(--th-text)' }}>Twitter URL</label>
                      <input 
                        type="text" 
                        value={form.twitterUrl} 
                        onChange={e => setForm(f => ({ ...f, twitterUrl: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border bg-[var(--th-bg)] outline-none focus:border-[var(--th-primary)] text-sm"
                        style={{ borderColor: 'var(--th-border)', color: 'var(--th-text)' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'physical' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold" style={{ color: 'var(--th-text)' }}>Height (cm)</label>
                      <input 
                        type="number" 
                        value={form.height} 
                        onChange={e => setForm(f => ({ ...f, height: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border bg-[var(--th-bg)] outline-none focus:border-[var(--th-primary)] text-sm"
                        style={{ borderColor: 'var(--th-border)', color: 'var(--th-text)' }}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold" style={{ color: 'var(--th-text)' }}>Weight (kg)</label>
                      <input 
                        type="number" 
                        value={form.weight} 
                        onChange={e => setForm(f => ({ ...f, weight: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border bg-[var(--th-bg)] outline-none focus:border-[var(--th-primary)] text-sm"
                        style={{ borderColor: 'var(--th-border)', color: 'var(--th-text)' }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold" style={{ color: 'var(--th-text)' }}>Date of Birth</label>
                      <input 
                        type="date" 
                        value={form.dateOfBirth} 
                        onChange={e => setForm(f => ({ ...f, dateOfBirth: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border bg-[var(--th-bg)] outline-none focus:border-[var(--th-primary)] text-sm"
                        style={{ borderColor: 'var(--th-border)', colorScheme: 'dark' }}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold" style={{ color: 'var(--th-text)' }}>Gender</label>
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
                    <label className="block text-sm font-bold" style={{ color: 'var(--th-text)' }}>Primary Fitness Goal</label>
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
                    <label className="block text-sm font-bold" style={{ color: 'var(--th-text)' }}>Experience Level</label>
                    <div className="flex gap-3">
                      {['beginner', 'intermediate', 'advanced'].map(lvl => (
                        <button
                          key={lvl}
                          onClick={() => setForm(f => ({ ...f, experienceLevel: lvl }))}
                          className={clsx(
                            "flex-1 py-3 rounded-xl border text-sm font-bold capitalize transition-all",
                            form.experienceLevel === lvl 
                              ? "border-[var(--th-primary)] bg-[var(--th-primary)]/10 text-[var(--th-primary)]"
                              : "border-[var(--th-border)] bg-[var(--th-card)] text-[var(--th-text-secondary)] hover:border-[var(--th-primary)]/30"
                          )}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="p-6 border-t border-[var(--th-border)] bg-[var(--th-card)] flex justify-end shrink-0">
          <div className="flex gap-3 w-full sm:w-auto">
            <button 
              onClick={onClose} 
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-bold border border-[var(--th-border)] bg-[var(--th-bg)] hover:bg-[var(--th-bg-secondary)] transition-colors"
              style={{ color: 'var(--th-text)' }}
            >
              Cancel
            </button>
            <button 
              onClick={handleSave} 
              disabled={loading}
              className="flex-1 sm:flex-none px-8 py-2.5 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 flex items-center justify-center min-w-[120px]"
              style={{ background: 'var(--th-primary)' }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : 'Save Blueprint'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
