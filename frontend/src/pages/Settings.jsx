import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Bell, Moon, Mail, Smartphone } from 'lucide-react';

const Toggle = ({ checked, onChange, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={onChange}
    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-forest-500' : 'bg-ink/15'}`}
  >
    <span
      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
        checked ? 'translate-x-5' : 'translate-x-0.5'
      }`}
    />
  </button>
);

const SETTINGS_CONFIG = [
  { key: 'emailNotifications', icon: Mail, label: 'Email notifications', description: 'Get emailed when a batch you added changes status.' },
  { key: 'pushNotifications', icon: Smartphone, label: 'Push notifications', description: 'Receive alerts on this device for inventory updates.' },
  { key: 'weeklyDigest', icon: Bell, label: 'Weekly digest', description: 'A weekly summary of waste collected and processed.' },
  { key: 'darkMode', icon: Moon, label: 'Dark mode', description: 'Switch to a low-light color scheme (coming soon).' },
];

const Settings = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    weeklyDigest: true,
    darkMode: false,
  });

  const toggle = (key) => {
    if (key === 'darkMode') {
      toast('Dark mode is coming in a future release');
      return;
    }
    setSettings((s) => ({ ...s, [key]: !s[key] }));
    toast.success('Preference saved');
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Settings</h1>
        <p className="text-sm text-ink/60">Control how the platform notifies and displays information to you.</p>
      </div>

      <div className="card divide-y divide-forest-50">
        {SETTINGS_CONFIG.map(({ key, icon: Icon, label, description }) => (
          <div key={key} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-forest-50 text-forest-600">
                <Icon size={16} />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">{label}</p>
                <p className="text-xs text-ink/50">{description}</p>
              </div>
            </div>
            <Toggle checked={settings[key]} onChange={() => toggle(key)} label={label} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Settings;
