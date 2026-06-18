import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useSignup } from '../hooks/useAuth';
import { ThemeToggle } from '@/design-system/components/ThemeToggle';
import clsx from 'clsx';

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <img src="/MainLogo.png" alt="LevelUp Logo" className="w-12 h-12 shrink-0 object-contain drop-shadow-md" />
      <span className="font-bold text-lg tracking-tight" style={{ color: 'var(--th-primary)' }}>LevelUp</span>
    </div>
  );
}

function AuthInput({ label, icon: Icon, type = 'text', placeholder, error, value, onChange, showToggle, delay = 0 }) {
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const inputType = showToggle ? (revealed ? 'text' : 'password') : type;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }} className="space-y-2">
      <label className="block text-[13px] font-medium" style={{ color: 'var(--th-text-secondary)' }}>{label}</label>
      <div
        className={clsx(
          'flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200',
          focused ? 'border-[var(--th-primary)]/40 shadow-[0_0_0_1px_rgba(var(--th-primary-rgb), ),0_0_16px_rgba(var(--th-primary-rgb), )]' : error ? 'border-red-500/40' : ''
        )}
        style={{
          background: 'var(--th-input)',
          ...(!focused && !error ? { borderColor: 'var(--th-border)' } : {}),
        }}
      >
        <Icon className={clsx('w-[18px] h-[18px] shrink-0 transition-colors', focused ? 'text-[var(--th-primary)]/70' : '')} style={!focused ? { color: 'var(--th-text-dim)' } : {}} />
        <input type={inputType} value={value} onChange={onChange} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} placeholder={placeholder}
          className="flex-1 bg-transparent text-[15px] outline-none caret-[var(--th-primary)]"
          style={{ color: 'var(--th-text)' }} />
        {showToggle && (
          <button type="button" tabIndex={-1} onClick={() => setRevealed(!revealed)} className="transition-colors" style={{ color: 'var(--th-text-dim)' }}>
            {revealed ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-400 font-medium">{error}</p>}
    </motion.div>
  );
}

function MobileArcs() {
  return (
    <div className="absolute top-0 right-0 w-[300px] h-[300px] pointer-events-none lg:hidden overflow-hidden">
      <svg viewBox="0 0 300 300" className="w-full h-full" fill="none">
        <motion.path d="M300,0 Q200,80 180,200" stroke="url(#sa1)" strokeWidth="1.5" opacity="0.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, ease: 'easeOut' }} />
        <motion.path d="M300,20 Q220,100 200,230" stroke="url(#sa2)" strokeWidth="1" opacity="0.3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2.5, delay: 0.3 }} />
        <defs>
          <linearGradient id="sa1" x1="300" y1="0" x2="180" y2="200"><stop stopColor="#F5A623"/><stop offset="1" stopColor="#9333ea" stopOpacity="0.3"/></linearGradient>
          <linearGradient id="sa2" x1="300" y1="20" x2="200" y2="230"><stop stopColor="var(--th-primary)" stopOpacity="0.8"/><stop offset="1" stopColor="#7c3aed" stopOpacity="0.2"/></linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const signup = useSignup();

  const validate = () => {
    const e = {};
    if (!form.name || form.name.length < 2) e.name = 'Name must be at least 2 characters';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email address';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Must be at least 8 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords don\'t match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) signup.mutate({ name: form.name, email: form.email, password: form.password });
  };

  return (
    <div className="min-h-[100dvh] flex" style={{ backgroundColor: 'var(--th-bg)' }}>

      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      <div className="w-full lg:w-[45%] xl:w-[42%] flex flex-col relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[radial-gradient(ellipse,rgba(139,92,246,0.06)_0%,transparent_70%)] pointer-events-none lg:hidden" />
        <MobileArcs />

        <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 lg:px-14 xl:px-20 py-10 relative z-10">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10 lg:mb-12"><Logo /></motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-8">
            <h1 className="text-[32px] font-bold tracking-tight" style={{ color: 'var(--th-text)' }}>Create account</h1>
            <p className="text-[15px] mt-2" style={{ color: 'var(--th-text-muted)' }}>Start leveling up your life today.</p>
          </motion.div>

          <div className="lg:contents">
            <div className="backdrop-blur-xl rounded-2xl p-6 sm:p-8 space-y-5 auth-card-mobile">
              <form onSubmit={handleSubmit} className="space-y-5">
                <AuthInput label="Full Name" icon={User} placeholder="Enter your name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} error={errors.name} delay={0.3} />
                <AuthInput label="Email address" icon={Mail} type="email" placeholder="Enter your email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} error={errors.email} delay={0.35} />
                <AuthInput label="Password" icon={Lock} type="password" placeholder="Create a password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} error={errors.password} showToggle delay={0.4} />
                <AuthInput label="Confirm Password" icon={Lock} type="password" placeholder="Confirm your password" value={form.confirmPassword} onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))} error={errors.confirmPassword} showToggle delay={0.45} />

                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                  <button type="submit" disabled={signup.isPending} className="group w-full relative overflow-hidden py-3.5 rounded-xl text-[15px] font-semibold transition-all duration-300 active:scale-[0.98] disabled:opacity-60" style={{ background: 'linear-gradient(135deg, var(--th-primary) 0%, var(--th-primary-dark) 100%)' }}>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(135deg, var(--th-primary-light) 0%, var(--th-primary) 100%)', boxShadow: '0 0 30px rgba(var(--th-primary-rgb), )' }} />
                    <span className="relative flex items-center justify-center gap-2 text-[#08080d]">
                      {signup.isPending ? <div className="w-5 h-5 border-2 border-[#08080d]/30 border-t-[#08080d] rounded-full animate-spin" /> : <>Create Account<ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></>}
                    </span>
                  </button>
                </motion.div>
              </form>

              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center"><div className="w-full h-px" style={{ backgroundColor: 'var(--th-border)' }} /></div>
                <div className="relative flex justify-center"><span className="px-4 text-[13px] lg:bg-transparent" style={{ color: 'var(--th-text-dim)', backgroundColor: 'var(--th-divider-bg)' }}>or</span></div>
              </div>

              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="space-y-3">
                <button
                  className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-[14px] font-medium transition-all duration-200 active:scale-[0.98]"
                  style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)', color: 'var(--th-text-secondary)' }}
                >
                  <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  Continue with Google
                </button>
              </motion.div>

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="text-center text-[14px] pt-2" style={{ color: 'var(--th-text-muted)' }}>
                Already have an account?{' '}
                <Link to="/login" className="font-semibold hover:brightness-110 transition-colors" style={{ color: 'var(--th-primary)' }}>Sign in</Link>
              </motion.p>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop hero */}
      <div className="hidden lg:flex lg:w-[55%] xl:w-[58%] relative overflow-hidden" style={{ background: 'var(--th-bg-secondary)', transition: 'background-color 0.3s ease' }}>
        <div className="absolute top-[10%] right-[20%] w-[500px] h-[500px] bg-[radial-gradient(ellipse,rgba(139,92,246,0.08)_0%,transparent_70%)]" />
        <div className="absolute bottom-[10%] left-[10%] w-[500px] h-[500px] bg-[radial-gradient(ellipse,rgba(245,166,35,0.06)_0%,transparent_70%)]" />
        <div className="relative z-10 flex flex-col justify-center items-center w-full px-12 xl:px-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }} className="text-center mb-10">
            <h2 className="text-[36px] xl:text-[42px] font-bold leading-tight">
              <span style={{ color: 'var(--th-text)' }}>Your journey</span><br /><span style={{ color: 'var(--th-primary)' }}>starts here.</span>
            </h2>
            <p className="text-[16px] mt-4 leading-relaxed max-w-md mx-auto" style={{ color: 'var(--th-text-muted)' }}>Join thousands building better habits<br />and achieving their goals.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="relative w-full max-w-[640px]">
            <div className="absolute -inset-4 bg-[radial-gradient(ellipse,rgba(var(--th-primary-rgb), )_0%,transparent_60%)] blur-2xl" />
            <img src="/loginimg.png" alt="LevelUp Dashboard" className="relative w-full h-auto rounded-2xl shadow-[0_20px_80px_rgba(0,0,0,0.6)]" />
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none" style={{ background: 'linear-gradient(to top, var(--th-bg), transparent)' }} />
      </div>
    </div>
  );
}
