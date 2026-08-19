import React, { useState } from 'react';
import { 
  Recycle, Lock, Mail, User, CheckCircle2, ArrowRight, 
  Factory, Leaf, Scissors, ShieldCheck, Sparkles 
} from 'lucide-react';
import { api } from '../services/api';
import { UserProfile, UserRole } from '../types/client';

interface AuthPageProps {
  onLoginSuccess: (user: UserProfile) => void;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const ROLES: { id: UserRole; label: string; desc: string; icon: any; color: string }[] = [
  {
    id: 'operator',
    label: 'Recycling Facility Operator',
    desc: 'Warehouse stock tracking, sorting queues, mechanical garnetting yields & 6-stage batch management.',
    icon: Factory,
    color: 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
  },
  {
    id: 'sustainability',
    label: 'Sustainability Manager',
    desc: 'Scope 3 carbon abatement, ISO 14040 LCA accounting, circularity index scoring & ESG audit reports.',
    icon: Leaf,
    color: 'border-teal-500 bg-teal-950/40 text-teal-300'
  },
  {
    id: 'manufacturer',
    label: 'Textile Manufacturer',
    desc: 'Post-industrial cutting scrap intake, yarn remanufacturing feasibility & secondary raw material savings.',
    icon: Scissors,
    color: 'border-indigo-500 bg-indigo-950/40 text-indigo-300'
  },
  {
    id: 'admin',
    label: 'Platform Administrator',
    desc: 'Full enterprise control, multi-facility RBAC, API telemetry, audit logs & system health.',
    icon: ShieldCheck,
    color: 'border-amber-500 bg-amber-950/40 text-amber-300'
  }
];

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess, onToast }) => {
  const [email, setEmail] = useState('yashuyaswanth8919@gmail.com');
  const [password, setPassword] = useState('admin123');
  const [name, setName] = useState('Yaswanth');
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      onToast('Please enter a valid email address', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.login({
        email,
        password: password || 'password123',
        role: selectedRole,
        name: name.trim() || undefined
      });

      onToast(`Logged in successfully as ${res.user.name} (${ROLES.find(r => r.id === res.user.role)?.label || res.user.role})`, 'success');
      onLoginSuccess(res.user);
    } catch (err: any) {
      onToast(err.message || 'Authentication failed. Please check credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickPreset = (roleId: UserRole, userEmail: string, userName: string) => {
    setSelectedRole(roleId);
    setEmail(userEmail);
    setName(userName);
    setPassword('admin123');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 antialiased selection:bg-emerald-500/30">
      <div className="w-full max-w-xl space-y-6">
        
        {/* LOGO & HEADING */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-slate-950 mx-auto shadow-xl shadow-emerald-900/30">
            <Recycle className="w-8 h-8 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 mt-2 font-serif-display">
            Textile Waste Intelligence Platform
          </h1>
          <p className="text-xs text-slate-400">
            Select your industry role below. The system will tailor the entire platform and dashboards to your specific role.
          </p>
        </div>

        {/* QUICK PRESETS BAR */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-mono text-[10px] uppercase font-bold">Quick Role Fill Presets:</span>
            <span className="text-[10px] text-emerald-400 font-mono">1-Click Auto-Fill</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
            <button
              type="button"
              onClick={() => fillQuickPreset('admin', 'yashuyaswanth8919@gmail.com', 'Yaswanth')}
              className={`py-1.5 px-2 rounded-lg text-center truncate text-[11px] font-bold border transition-all ${
                selectedRole === 'admin' ? 'bg-amber-950/60 text-amber-300 border-amber-500' : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              👑 Admin (Yaswanth)
            </button>
            <button
              type="button"
              onClick={() => fillQuickPreset('operator', 'operator@textilewaste.io', 'Carlos Rivera')}
              className={`py-1.5 px-2 rounded-lg text-center truncate text-[11px] font-bold border transition-all ${
                selectedRole === 'operator' ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500' : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              🏭 Facility Operator
            </button>
            <button
              type="button"
              onClick={() => fillQuickPreset('sustainability', 'sustainability@textilewaste.io', 'Dr. Sophia Chen')}
              className={`py-1.5 px-2 rounded-lg text-center truncate text-[11px] font-bold border transition-all ${
                selectedRole === 'sustainability' ? 'bg-teal-950/60 text-teal-300 border-teal-500' : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              🌿 Sustainability Mgr
            </button>
            <button
              type="button"
              onClick={() => fillQuickPreset('manufacturer', 'manufacturer@textilewaste.io', 'Elena Rossi')}
              className={`py-1.5 px-2 rounded-lg text-center truncate text-[11px] font-bold border transition-all ${
                selectedRole === 'manufacturer' ? 'bg-indigo-950/60 text-indigo-300 border-indigo-500' : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              🧵 Manufacturer
            </button>
          </div>
        </div>

        {/* MAIN LOGIN & ROLE SELECTION FORM */}
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
          
          {/* 1. SELECT ROLE IN LOGIN (PDF MODULE 1 & 10) */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block">
              1. Select Your Role * <span className="text-[10px] text-slate-400 font-normal lowercase">(Locked once logged in)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ROLES.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.id;
                return (
                  <div
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                      isSelected
                        ? `${role.color} shadow-lg ring-1 ring-white/20`
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                        <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                          {role.label}
                        </span>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      {role.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. CREDENTIALS */}
          <div className="space-y-3 text-xs pt-2 border-t border-slate-800/80">
            <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block">
              2. User Credentials *
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1 text-[11px]">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Yaswanth"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 text-[11px]">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yashuyaswanth8919@gmail.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 text-[11px]">Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating & Initializing Role Workspace...' : `Sign In as ${ROLES.find(r => r.id === selectedRole)?.label}`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-[11px] text-center text-slate-400">
            First time logging in? Your profile will be automatically registered and saved to the secure database with your chosen role.
          </p>
        </form>

      </div>
    </div>
  );
};
