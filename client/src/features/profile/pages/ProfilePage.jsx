import { useState } from 'react';
import { motion } from 'motion/react';
import { AnimatedPage, Card, Avatar } from '@/design-system/components';
import { useAuthStore } from '@/shared/stores/authStore';
import { useThemeStore } from '@/shared/stores/themeStore';
import { Mail, LogOut, Moon, Bell, Shield, Smartphone, ChevronRight, Check } from 'lucide-react';
import clsx from 'clsx';

function SettingRow({ icon: Icon, label, description, children, onClick }) {
  return (
    <div 
      onClick={onClick}
      className={clsx(
        "flex items-center justify-between py-4 px-1 border-b last:border-0 group transition-colors",
        onClick && "cursor-pointer"
      )}
      style={{ borderBottomColor: 'var(--th-border)' }}
    >
      <div className="flex items-center gap-4">
        <div className="p-2.5 rounded-xl transition-colors" style={{ background: 'var(--th-highlight)', color: 'var(--th-text-muted)' }}>
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <p className="text-sm font-semibold transition-colors" style={{ color: 'var(--th-text)' }}>{label}</p>
          {description && <p className="text-xs mt-0.5 transition-colors" style={{ color: 'var(--th-text-dim)' }}>{description}</p>}
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange?.(!checked)}
      className="w-11 h-6 rounded-full transition-colors relative flex items-center shadow-inner"
      style={{ 
        background: checked ? 'var(--th-primary)' : 'var(--th-border)',
      }}
    >
      <motion.div
        animate={{ x: checked ? 22 : 4 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="w-4 h-4 rounded-full bg-white shadow-sm flex items-center justify-center"
      >
        {checked && <Check className="w-2.5 h-2.5 text-black/40" strokeWidth={3} />}
      </motion.div>
    </button>
  );
}

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { theme, toggleTheme } = useThemeStore();
  const [settings, setSettings] = useState({
    notifications: true,
    compactMode: false,
  });

  return (
    <AnimatedPage>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--th-text)' }}>Profile & Settings</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--th-text-muted)' }}>Manage your personal information and app preferences.</p>
      </div>

      {/* Profile Card Banner */}
      <div 
        className="mb-8 relative rounded-3xl overflow-hidden p-8 flex flex-col md:flex-row items-center md:items-start gap-6 border shadow-xl"
        style={{ 
          background: 'linear-gradient(135deg, rgba(var(--th-primary-rgb), 0.1), transparent)',
          borderColor: 'var(--th-border)',
        }}
      >
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--th-primary)] rounded-full blur-[100px] opacity-10 pointer-events-none" />

        <Avatar 
          src={user?.avatar} 
          name={user?.name} 
          size="xl" 
          glow={true} 
          bordered={true} 
          status="online"
          className="shadow-2xl"
        />
        <div className="text-center md:text-left pt-2 z-10">
          <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--th-text)' }}>{user?.name || 'LevelUp User'}</h2>
          <div className="flex items-center justify-center md:justify-start gap-2 mt-2" style={{ color: 'var(--th-text-muted)' }}>
            <Mail className="w-4 h-4" /> 
            <span className="text-sm font-medium">{user?.email || 'user@levelup.app'}</span>
          </div>
          <div className="inline-block mt-4 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider" style={{ background: 'rgba(var(--th-primary-rgb), 0.15)', color: 'var(--th-primary)' }}>
            Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-8">
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-4 ml-1" style={{ color: 'var(--th-text-dim)' }}>App Preferences</h3>
            <Card className="p-2 sm:p-4">
              <SettingRow icon={Moon} label="Dark Mode" description="Switch between light and dark theme">
                <Toggle checked={theme === 'dark'} onChange={toggleTheme} />
              </SettingRow>
              <SettingRow icon={Bell} label="Notifications" description="Push notifications for reminders">
                <Toggle checked={settings.notifications} onChange={(v) => setSettings((s) => ({ ...s, notifications: v }))} />
              </SettingRow>
              <SettingRow icon={Smartphone} label="Compact Mode" description="Denser layout for power users">
                <Toggle checked={settings.compactMode} onChange={(v) => setSettings((s) => ({ ...s, compactMode: v }))} />
              </SettingRow>
            </Card>
          </section>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-4 ml-1" style={{ color: 'var(--th-text-dim)' }}>Account Security</h3>
            <Card className="p-2 sm:p-4">
              <SettingRow icon={Shield} label="Change Password" description="Update your account password" onClick={() => {}}>
                <div className="flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--th-text)' }}>
                  <span className="text-xs font-semibold">Update</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </SettingRow>
            </Card>
          </section>

          <section>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-4 ml-1" style={{ color: 'var(--th-text-dim)' }}>About LevelUP</h3>
            <Card className="p-5 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium" style={{ color: 'var(--th-text-muted)' }}>App Version</span>
                <span className="font-bold stat-number" style={{ color: 'var(--th-text)' }}>1.0.0</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium" style={{ color: 'var(--th-text-muted)' }}>Build Channel</span>
                <span className="font-bold stat-number" style={{ color: 'var(--th-primary)' }}>Phase 5 — Production</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium" style={{ color: 'var(--th-text-muted)' }}>Technology Stack</span>
                <span className="font-medium" style={{ color: 'var(--th-text)' }}>React + Node.js + PostgreSQL</span>
              </div>
            </Card>
          </section>

          {/* Logout Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold shadow-sm transition-colors border"
            style={{ 
              background: 'rgba(239, 68, 68, 0.1)', 
              color: '#ef4444',
              borderColor: 'rgba(239, 68, 68, 0.2)'
            }}
          >
            <LogOut className="w-5 h-5" /> Sign Out
          </motion.button>
        </div>
      </div>
    </AnimatedPage>
  );
}
