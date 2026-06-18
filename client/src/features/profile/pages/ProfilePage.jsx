import { useState } from 'react';
import { motion } from 'motion/react';
import { AnimatedPage, Card, Input, Button } from '@/design-system/components';
import { useAuthStore } from '@/shared/stores/authStore';
import { User, Mail, LogOut, Moon, Bell, Shield, Palette, Smartphone } from 'lucide-react';
import clsx from 'clsx';

function SettingRow({ icon: Icon, label, description, children }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-white/[0.04]">
          <Icon className="w-4 h-4 text-zinc-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-white">{label}</p>
          {description && <p className="text-[10px] text-zinc-500">{description}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange?.(!checked)}
      className={clsx('w-10 h-5 rounded-full transition-colors relative', checked ? 'bg-accent' : 'bg-zinc-700')}
    >
      <motion.div
        animate={{ x: checked ? 20 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="w-4 h-4 rounded-full bg-white absolute top-0.5"
      />
    </button>
  );
}

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [settings, setSettings] = useState({
    darkMode: true,
    notifications: true,
    compactMode: false,
  });

  return (
    <AnimatedPage>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Profile & Settings</h1>
        <p className="text-sm text-zinc-500 mt-1">Manage your account</p>
      </div>

      {/* Profile Card */}
      <Card className="mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-2xl font-bold">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{user?.name || 'LevelUp User'}</h2>
            <p className="text-sm text-zinc-400 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> {user?.email || 'user@levelup.app'}
            </p>
            <p className="text-[10px] text-zinc-600 mt-1">Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
      </Card>

      {/* Preferences */}
      <Card className="mb-6">
        <h3 className="text-sm font-semibold text-white mb-3">Preferences</h3>
        <SettingRow icon={Moon} label="Dark Mode" description="Always-on dark theme">
          <Toggle checked={settings.darkMode} onChange={(v) => setSettings((s) => ({ ...s, darkMode: v }))} />
        </SettingRow>
        <SettingRow icon={Bell} label="Notifications" description="Push notifications for reminders">
          <Toggle checked={settings.notifications} onChange={(v) => setSettings((s) => ({ ...s, notifications: v }))} />
        </SettingRow>
        <SettingRow icon={Smartphone} label="Compact Mode" description="Denser layout for power users">
          <Toggle checked={settings.compactMode} onChange={(v) => setSettings((s) => ({ ...s, compactMode: v }))} />
        </SettingRow>
      </Card>

      {/* Security */}
      <Card className="mb-6">
        <h3 className="text-sm font-semibold text-white mb-3">Security</h3>
        <SettingRow icon={Shield} label="Change Password" description="Update your account password">
          <Button variant="ghost" className="text-xs">Update</Button>
        </SettingRow>
      </Card>

      {/* App Info */}
      <Card className="mb-6">
        <h3 className="text-sm font-semibold text-white mb-3">About</h3>
        <div className="space-y-2 text-xs text-zinc-400">
          <div className="flex justify-between"><span>App Version</span><span className="text-zinc-300 stat-number">1.0.0</span></div>
          <div className="flex justify-between"><span>Build</span><span className="text-zinc-300 stat-number">Phase 5 — Production</span></div>
          <div className="flex justify-between"><span>Stack</span><span className="text-zinc-300">React + Express + PostgreSQL</span></div>
        </div>
      </Card>

      {/* Logout */}
      <button
        onClick={logout}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-danger/10 text-danger text-sm font-medium hover:bg-danger/20 transition-colors"
      >
        <LogOut className="w-4 h-4" /> Sign Out
      </button>
    </AnimatedPage>
  );
}
