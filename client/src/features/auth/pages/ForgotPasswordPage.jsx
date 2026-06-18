import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useForgotPassword } from '../hooks/useAuth';
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

function AuthInput({ label, icon: Icon, type = 'text', placeholder, value, onChange, delay = 0 }) {
  const [focused, setFocused] = useState(false);
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }} className="space-y-2">
      <label className="block text-[13px] font-medium" style={{ color: 'var(--th-text-secondary)' }}>{label}</label>
      <div
        className={clsx(
          'flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200',
          focused ? 'border-[var(--th-primary)]/40 shadow-[0_0_0_1px_rgba(var(--th-primary-rgb), ),0_0_16px_rgba(var(--th-primary-rgb), )]' : ''
        )}
        style={{
          background: 'var(--th-input)',
          ...(!focused ? { borderColor: 'var(--th-border)' } : {}),
        }}
      >
        <Icon className={clsx('w-[18px] h-[18px] shrink-0 transition-colors', focused ? 'text-[var(--th-primary)]/70' : '')} style={!focused ? { color: 'var(--th-text-dim)' } : {}} />
        <input type={type} value={value} onChange={onChange} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} placeholder={placeholder}
          className="flex-1 bg-transparent text-[15px] outline-none caret-[var(--th-primary)]"
          style={{ color: 'var(--th-text)' }} />
      </div>
    </motion.div>
  );
}

function MobileArcs() {
  return (
    <div className="absolute top-0 right-0 w-[300px] h-[300px] pointer-events-none lg:hidden overflow-hidden">
      <svg viewBox="0 0 300 300" className="w-full h-full" fill="none">
        <motion.path d="M300,0 Q200,80 180,200" stroke="url(#fa1)" strokeWidth="1.5" opacity="0.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2 }} />
        <defs><linearGradient id="fa1" x1="300" y1="0" x2="180" y2="200"><stop stopColor="#F5A623"/><stop offset="1" stopColor="#9333ea" stopOpacity="0.3"/></linearGradient></defs>
      </svg>
    </div>
  );
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const forgot = useForgotPassword();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) forgot.mutate(email, { onSuccess: () => setSent(true) });
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
            <h1 className="text-[32px] font-bold tracking-tight" style={{ color: 'var(--th-text)' }}>{sent ? 'Check your email' : 'Reset password'}</h1>
            <p className="text-[15px] mt-2" style={{ color: 'var(--th-text-muted)' }}>{sent ? 'We\'ve sent reset instructions to your email.' : 'Enter your email to receive a reset link.'}</p>
          </motion.div>

          <div className="lg:contents">
            <div className="backdrop-blur-xl rounded-2xl p-6 sm:p-8 auth-card-mobile">
              {sent ? (
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} className="flex flex-col items-center py-8 gap-5">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'rgba(var(--th-primary-rgb), )', border: '1px solid rgba(var(--th-primary-rgb), )', boxShadow: '0 0 30px rgba(var(--th-primary-rgb), )' }}>
                    <CheckCircle2 className="w-10 h-10" style={{ color: 'var(--th-primary)' }} />
                  </div>
                  <p className="text-[14px] text-center leading-relaxed" style={{ color: 'var(--th-text-secondary)' }}>Didn't receive the email?<br />Check your spam folder or try again.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <AuthInput label="Email address" icon={Mail} type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} delay={0.3} />
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <button type="submit" disabled={forgot.isPending} className="group w-full relative overflow-hidden py-3.5 rounded-xl text-[15px] font-semibold transition-all duration-300 active:scale-[0.98] disabled:opacity-60" style={{ background: 'linear-gradient(135deg, var(--th-primary) 0%, var(--th-primary-dark) 100%)' }}>
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(135deg, var(--th-primary-light) 0%, var(--th-primary) 100%)', boxShadow: '0 0 30px rgba(var(--th-primary-rgb), )' }} />
                      <span className="relative flex items-center justify-center gap-2 text-[#08080d]">
                        {forgot.isPending ? <div className="w-5 h-5 border-2 border-[#08080d]/30 border-t-[#08080d] rounded-full animate-spin" /> : <>Send Reset Link<ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></>}
                      </span>
                    </button>
                  </motion.div>
                </form>
              )}

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-6">
                <Link to="/login" className="flex items-center justify-center gap-2 text-[14px] transition-colors duration-200" style={{ color: 'var(--th-text-muted)' }}>
                  <ArrowLeft className="w-4 h-4" /> Back to sign in
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop hero */}
      <div className="hidden lg:flex lg:w-[55%] xl:w-[58%] relative overflow-hidden" style={{ background: 'var(--th-bg-secondary)', transition: 'background-color 0.3s ease' }}>
        <div className="absolute top-[10%] right-[20%] w-[500px] h-[500px] bg-[radial-gradient(ellipse,rgba(139,92,246,0.08)_0%,transparent_70%)]" />
        <div className="absolute bottom-[10%] left-[10%] w-[500px] h-[500px] bg-[radial-gradient(ellipse,rgba(245,166,35,0.06)_0%,transparent_70%)]" />
        <div className="relative z-10 flex flex-col justify-center items-center w-full px-12 xl:px-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-center mb-10">
            <h2 className="text-[36px] xl:text-[42px] font-bold leading-tight">
              <span style={{ color: 'var(--th-text)' }}>No worries.</span><br /><span style={{ color: 'var(--th-primary)' }}>We've got you.</span>
            </h2>
            <p className="text-[16px] mt-4 leading-relaxed max-w-md mx-auto" style={{ color: 'var(--th-text-muted)' }}>Reset your password in seconds<br />and get back to leveling up.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.5, duration: 0.8 }} className="relative w-full max-w-[640px]">
            <div className="absolute -inset-4 bg-[radial-gradient(ellipse,rgba(var(--th-primary-rgb), )_0%,transparent_60%)] blur-2xl" />
            <img src="/loginimg.png" alt="LevelUp Dashboard" className="relative w-full h-auto rounded-2xl shadow-[0_20px_80px_rgba(0,0,0,0.6)]" />
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none" style={{ background: 'linear-gradient(to top, var(--th-bg), transparent)' }} />
      </div>
    </div>
  );
}
