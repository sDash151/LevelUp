import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield, Cloud, RefreshCw } from 'lucide-react';
import { useLogin } from '../hooks/useAuth';
import { ThemeToggle } from '@/design-system/components/ThemeToggle';
import clsx from 'clsx';

/* ─── Gold Chevron Logo ─── */
function Logo({ size = 'default' }) {
  const isLarge = size === 'large';
  return (
    <div className={clsx('flex items-center', isLarge ? 'gap-3' : 'gap-2.5')}>
      <div className={clsx('flex items-center justify-center', isLarge ? 'w-16 h-16' : 'w-12 h-12')}>
        <img src="/MainLogo.png" alt="LevelUp Logo" className={clsx('shrink-0 object-contain drop-shadow-md', isLarge ? 'w-16 h-16' : 'w-12 h-12')} />
      </div>
      <span className={clsx('font-bold tracking-tight', isLarge ? 'text-xl' : 'text-lg')} style={{ color: 'var(--th-primary)' }}>LevelUp</span>
    </div>
  );
}

/* ─── Auth Input ─── */
function AuthInput({ label, icon: Icon, type = 'text', placeholder, error, value, onChange, showToggle, delay = 0 }) {
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const inputType = showToggle ? (revealed ? 'text' : 'password') : type;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="space-y-2"
    >
      <label className="block text-[13px] font-medium" style={{ color: 'var(--th-text-secondary)' }}>{label}</label>
      <div
        className={clsx(
          'flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200',
          focused
            ? 'border-[var(--th-primary)]/40 shadow-[0_0_0_1px_rgba(var(--th-primary-rgb), ),0_0_16px_rgba(var(--th-primary-rgb), )]'
            : error
              ? 'border-red-500/40'
              : ''
        )}
        style={{
          background: 'var(--th-input)',
          ...(!focused && !error ? { borderColor: 'var(--th-border)' } : {}),
        }}
      >
        <Icon className={clsx('w-[18px] h-[18px] shrink-0 transition-colors', focused ? 'text-[var(--th-primary)]/70' : '')} style={!focused ? { color: 'var(--th-text-dim)' } : {}} />
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-[15px] outline-none caret-[var(--th-primary)]"
          style={{ color: 'var(--th-text)', '--tw-placeholder-opacity': 1 }}
        />
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

/* ─── Mobile Arc SVG ─── */
function MobileArcs() {
  return (
    <div className="absolute top-0 right-0 w-[300px] h-[300px] pointer-events-none lg:hidden overflow-hidden">
      <svg viewBox="0 0 300 300" className="w-full h-full" fill="none">
        <motion.path
          d="M300,0 Q200,80 180,200"
          stroke="url(#arc1)" strokeWidth="1.5" opacity="0.5"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, ease: 'easeOut' }}
        />
        <motion.path
          d="M300,20 Q220,100 200,230"
          stroke="url(#arc2)" strokeWidth="1" opacity="0.3"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2.5, ease: 'easeOut', delay: 0.3 }}
        />
        <motion.path
          d="M300,50 Q240,120 230,260"
          stroke="url(#arc3)" strokeWidth="0.8" opacity="0.2"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 3, ease: 'easeOut', delay: 0.6 }}
        />
        <defs>
          <linearGradient id="arc1" x1="300" y1="0" x2="180" y2="200"><stop stopColor="#F5A623"/><stop offset="1" stopColor="#9333ea" stopOpacity="0.3"/></linearGradient>
          <linearGradient id="arc2" x1="300" y1="20" x2="200" y2="230"><stop stopColor="var(--th-primary)" stopOpacity="0.8"/><stop offset="1" stopColor="#7c3aed" stopOpacity="0.2"/></linearGradient>
          <linearGradient id="arc3" x1="300" y1="50" x2="230" y2="260"><stop stopColor="var(--th-primary-dark)" stopOpacity="0.6"/><stop offset="1" stopColor="transparent"/></linearGradient>
        </defs>
      </svg>
    </div>
  );
}

/* ─── Trust Badges (mobile only) ─── */
function TrustBadges() {
  const badges = [
    { icon: Shield, text: 'Your data is\nprivate & secure' },
    { icon: Cloud, text: 'Works offline\nanytime' },
    { icon: RefreshCw, text: 'Sync across\nall devices' },
  ];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.2 }}
      className="flex items-start justify-around pt-8 pb-4 lg:hidden"
    >
      {badges.map((b) => (
        <div key={b.text} className="flex flex-col items-center gap-2 text-center">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}
          >
            <b.icon className="w-4 h-4" style={{ color: 'var(--th-text-muted)' }} />
          </div>
          <p className="text-[11px] leading-tight whitespace-pre-line" style={{ color: 'var(--th-text-dim)' }}>{b.text}</p>
        </div>
      ))}
    </motion.div>
  );
}

/* ─── Main Login Page ─── */
export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(false);
  const login = useLogin();

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email address';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Must be at least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) login.mutate(form);
  };

  return (
    <div className="min-h-[100dvh] flex" style={{ backgroundColor: 'var(--th-bg)' }}>

      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      {/* ═══════════════════════════════════════
          LEFT SIDE — Login Form
          ═══════════════════════════════════════ */}
      <div className="w-full lg:w-[45%] xl:w-[42%] flex flex-col relative overflow-hidden">
        {/* Mobile ambient glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[radial-gradient(ellipse,rgba(139,92,246,0.06)_0%,transparent_70%)] pointer-events-none lg:hidden" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[radial-gradient(ellipse,rgba(245,166,35,0.04)_0%,transparent_70%)] pointer-events-none lg:hidden" />

        {/* Mobile animated arcs */}
        <MobileArcs />

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 lg:px-14 xl:px-20 py-10 relative z-10">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10 lg:mb-12"
          >
            <Logo />
          </motion.div>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="mb-8 lg:mb-10"
          >
            <h1 className="text-[32px] sm:text-[36px] font-bold tracking-tight leading-tight" style={{ color: 'var(--th-text)' }}>Welcome back</h1>
            <p className="text-[15px] mt-2 leading-relaxed" style={{ color: 'var(--th-text-muted)' }}>
              Log in to continue your journey<br className="hidden sm:block" /> and achieve your best self.
            </p>
          </motion.div>

          {/* ─── Mobile: Glassmorphic card wrapper | Desktop: no card ─── */}
          <div className="lg:contents">
            <div className="lg:!bg-transparent lg:!border-0 lg:!p-0 lg:!backdrop-blur-none backdrop-blur-xl rounded-2xl p-6 sm:p-8 space-y-5 auth-card-mobile">

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <AuthInput
                  label="Email address"
                  icon={Mail}
                  type="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  error={errors.email}
                  delay={0.3}
                />
                <AuthInput
                  label="Password"
                  icon={Lock}
                  type="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  error={errors.password}
                  showToggle
                  delay={0.4}
                />

                {/* Remember me + Forgot password */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center justify-between"
                >
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <div
                      onClick={() => setRememberMe(!rememberMe)}
                      className={clsx(
                        'w-[18px] h-[18px] rounded-[5px] border flex items-center justify-center transition-all duration-200 cursor-pointer',
                        rememberMe
                          ? 'bg-[var(--th-primary)] border-[var(--th-primary)] shadow-[0_0_8px_rgba(var(--th-primary-rgb), )]'
                          : 'border-zinc-700 bg-transparent hover:border-zinc-500'
                      )}
                    >
                      {rememberMe && (
                        <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                          <path d="M2.5 6L5 8.5L9.5 3.5" stroke="#08080d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </motion.svg>
                      )}
                    </div>
                    <span className="text-[13px] select-none" style={{ color: 'var(--th-text-secondary)' }}>Remember me</span>
                  </label>
                  <Link to="/forgot-password" className="text-[13px] font-medium transition-colors" style={{ color: 'var(--th-primary)' }}>
                    Forgot password?
                  </Link>
                </motion.div>

                {/* Login Button */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 }}
                >
                  <button
                    type="submit"
                    disabled={login.isPending}
                    className="group w-full relative overflow-hidden py-3.5 rounded-xl text-[15px] font-semibold transition-all duration-300 active:scale-[0.98] disabled:opacity-60"
                    style={{ background: 'linear-gradient(135deg, var(--th-primary) 0%, var(--th-primary-dark) 100%)' }}
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(135deg, var(--th-primary-light) 0%, var(--th-primary) 100%)', boxShadow: '0 0 30px rgba(var(--th-primary-rgb), )' }} />
                    <span className="relative flex items-center justify-center gap-2 text-[#08080d]">
                      {login.isPending ? (
                        <div className="w-5 h-5 border-2 border-[#08080d]/30 border-t-[#08080d] rounded-full animate-spin" />
                      ) : (
                        <>
                          Log in
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </>
                      )}
                    </span>
                  </button>
                </motion.div>
              </form>

              {/* Divider */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.65 }}
                className="relative py-1"
              >
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-px" style={{ backgroundColor: 'var(--th-border)' }} />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 text-[13px] lg:bg-transparent" style={{ color: 'var(--th-text-dim)', backgroundColor: 'var(--th-divider-bg)' }}>or continue with</span>
                </div>
              </motion.div>

              {/* OAuth Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="space-y-3"
              >
                {/* Google */}
                <button
                  className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-[14px] font-medium transition-all duration-200 active:scale-[0.98]"
                  style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)', color: 'var(--th-text-secondary)' }}
                >
                  <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>
              </motion.div>

              {/* Signup redirect */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-center text-[14px] pt-2"
                style={{ color: 'var(--th-text-muted)' }}
              >
                Don't have an account?{' '}
                <Link to="/signup" className="font-semibold transition-colors hover:brightness-110" style={{ color: 'var(--th-primary)' }}>
                  Sign up
                </Link>
              </motion.p>
            </div>
          </div>

          {/* Trust badges (mobile) */}
          <TrustBadges />
        </div>
      </div>

      {/* ═══════════════════════════════════════
          RIGHT SIDE — Hero Panel (Desktop only)
          ═══════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-[55%] xl:w-[58%] relative overflow-hidden" style={{ background: 'var(--th-bg-secondary)', transition: 'background-color 0.3s ease' }}>
        {/* Purple + Gold ambient glows */}
        <div className="absolute top-[10%] right-[20%] w-[500px] h-[500px] bg-[radial-gradient(ellipse,rgba(139,92,246,0.08)_0%,transparent_70%)]" />
        <div className="absolute bottom-[10%] left-[10%] w-[500px] h-[500px] bg-[radial-gradient(ellipse,rgba(245,166,35,0.06)_0%,transparent_70%)]" />
        <div className="absolute top-[40%] left-[40%] w-[300px] h-[300px] bg-[radial-gradient(ellipse,rgba(var(--th-primary-rgb), )_0%,transparent_70%)]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full px-12 xl:px-16">
          {/* Hero text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-center mb-10"
          >
            <h2 className="text-[36px] xl:text-[42px] font-bold leading-tight">
              <span style={{ color: 'var(--th-text)' }}>Build discipline.</span>
              <br />
              <span style={{ color: 'var(--th-primary)' }}>Elevate your life.</span>
            </h2>
            <p className="text-[16px] mt-4 leading-relaxed max-w-md mx-auto" style={{ color: 'var(--th-text-muted)' }}>
              Track habits, set goals, analyze progress<br />
              and become the best version of yourself.
            </p>
          </motion.div>

          {/* Hero image */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-[640px]"
          >
            {/* Glow behind image */}
            <div className="absolute -inset-4 bg-[radial-gradient(ellipse,rgba(var(--th-primary-rgb), )_0%,transparent_60%)] blur-2xl" />
            <img
              src="/loginimg.png"
              alt="LevelUp Dashboard Preview"
              className="relative w-full h-auto rounded-2xl"
              style={{ boxShadow: 'var(--th-shadow)' }}
            />
          </motion.div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none" style={{ background: 'linear-gradient(to top, var(--th-bg), transparent)' }} />
      </div>
    </div>
  );
}
