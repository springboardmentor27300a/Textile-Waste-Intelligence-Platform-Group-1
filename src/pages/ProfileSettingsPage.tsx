import React, { useState } from 'react';
import { User, Lock, Mail, Shield, Save, Check, Camera, Image } from 'lucide-react';
import { UserProfile } from '../types/client';
import { api } from '../services/api';

interface ProfileSettingsPageProps {
  currentUser: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
];

export const ProfileSettingsPage: React.FC<ProfileSettingsPageProps> = ({ currentUser, onUpdateUser, onToast }) => {
  const [name, setName] = useState(currentUser.name);
  const [department, setDepartment] = useState(currentUser.department || 'Sustainability');
  const [avatar, setAvatar] = useState(currentUser.avatar || AVATAR_PRESETS[0]);
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.updateProfile({
        name,
        department,
        avatar,
        password: password ? password : undefined
      });
      onUpdateUser(res.user);
      setPassword('');
      onToast('Profile updated and saved successfully!', 'success');
    } catch (err: any) {
      onToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-200">
      
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
          <User className="w-6 h-6 text-emerald-400" />
          <span>Profile & Account Settings</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage user credentials, profile picture, department details, and account security
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
        <form onSubmit={handleSave} className="space-y-5 text-xs">
          
          {/* USER CARD HEADER */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-5 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="relative group">
              <img src={avatar} alt={name} className="w-20 h-20 rounded-full object-cover ring-2 ring-emerald-500/40 shadow-lg" />
            </div>

            <div className="text-center sm:text-left space-y-1">
              <h3 className="text-lg font-bold text-slate-100">{name}</h3>
              <p className="text-xs text-slate-400 font-mono flex items-center justify-center sm:justify-start gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>{currentUser.email}</span>
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Role: {currentUser.role === 'operator' ? 'Recycling Facility Operator' :
                         currentUser.role === 'sustainability' ? 'Sustainability Manager' :
                         currentUser.role === 'manufacturer' ? 'Textile Manufacturer' : 'Platform Administrator'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-slate-800 text-slate-300 border border-slate-700">
                  ID: {currentUser.id}
                </span>
              </div>
            </div>
          </div>

          {/* AVATAR PRESET SELECTOR */}
          <div>
            <label className="text-slate-300 block mb-2 font-medium flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-400" />
              <span>Choose Profile Avatar</span>
            </label>
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {AVATAR_PRESETS.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAvatar(url)}
                  className={`relative p-1 rounded-full border-2 transition-all ${
                    avatar === url ? 'border-emerald-500 scale-105 ring-2 ring-emerald-500/30' : 'border-slate-800 hover:border-slate-600'
                  }`}
                >
                  <img src={url} alt={`Preset ${idx + 1}`} className="w-10 h-10 rounded-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-slate-300 block mb-1 font-medium">Display Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-slate-300 block mb-1 font-medium">Department / Organization Unit</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* PASSWORD RESET SECTION */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <label className="text-slate-300 block font-medium flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Change Password (Optional)</span>
            </label>
            <p className="text-[11px] text-slate-400">Leave empty if you do not wish to update your login password.</p>
            <input
              type="password"
              placeholder="Enter new password (min. 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};

