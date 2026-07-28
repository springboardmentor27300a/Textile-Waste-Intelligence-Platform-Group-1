import React, { useState } from 'react';
import { Settings as SettingsIcon, Bell, Shield, Database, Save, CheckCircle } from 'lucide-react';

export default function Settings() {
  const [success, setSuccess] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('60');

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Platform Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Configure notifications, security tokens, and data syncing</p>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs rounded-xl flex items-center space-x-2 animate-fade-in">
          <CheckCircle size={16} />
          <span>Configuration parameters updated successfully.</span>
        </div>
      )}

      <div className="max-w-3xl space-y-6">
        {/* Alerts Configuration */}
        <div className="p-6 bg-white dark:bg-cardDark border border-slate-100 dark:border-emerald-950/20 rounded-2xl shadow-soft">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center space-x-2">
            <Bell size={16} className="text-primary-800" />
            <span>Notification Controls</span>
          </h3>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">Email Notifications</p>
                <p className="text-[10px] text-slate-400">Send summary notifications when a new waste batch matches organization criteria</p>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={() => setEmailAlerts(!emailAlerts)}
                className="w-4 h-4 rounded text-primary-800 focus:ring-primary-800"
              />
            </div>
          </div>
        </div>

        {/* Security Parameters */}
        <div className="p-6 bg-white dark:bg-cardDark border border-slate-100 dark:border-emerald-950/20 rounded-2xl shadow-soft">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center space-x-2">
            <Shield size={16} className="text-primary-800" />
            <span>Security & Access Tokens</span>
          </h3>

          <div className="space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center py-2 gap-2">
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">Session Expiration Timeout</p>
                <p className="text-[10px] text-slate-400">Time of inactivity before tokens expire (in minutes)</p>
              </div>
              <select
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-bgDark/50 border border-slate-200 dark:border-slate-800 rounded-lg outline-none"
              >
                <option value="15">15 Minutes</option>
                <option value="30">30 Minutes</option>
                <option value="60">1 Hour</option>
                <option value="1440">24 Hours</option>
              </select>
            </div>
            
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">Personal API Key</p>
                <p className="text-[10px] text-slate-400">Access key for script automation logs queries</p>
              </div>
              <button
                onClick={() => alert('API Key: wc_live_abc123xyz987')}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 hover-scale text-[10px] font-bold"
              >
                Reveal Token
              </button>
            </div>
          </div>
        </div>

        {/* Database Control */}
        <div className="p-6 bg-white dark:bg-cardDark border border-slate-100 dark:border-emerald-950/20 rounded-2xl shadow-soft">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center space-x-2">
            <Database size={16} className="text-primary-800" />
            <span>Database Backup</span>
          </h3>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">Manual Archive Export</p>
                <p className="text-[10px] text-slate-400">Download a full SQL dump files schema mapping</p>
              </div>
              <button
                onClick={() => setSuccess(true)}
                className="px-4 py-2 bg-primary-800 hover:bg-primary-900 text-white rounded-lg hover-scale font-bold"
              >
                Backup Now
              </button>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end max-w-3xl">
          <button
            onClick={handleSaveSettings}
            className="flex items-center space-x-2 px-6 py-3 bg-primary-800 hover:bg-primary-900 text-white rounded-xl text-xs font-bold shadow-soft hover-scale"
          >
            <Save size={14} />
            <span>Save Configurations</span>
          </button>
        </div>
      </div>
    </div>
  );
}
