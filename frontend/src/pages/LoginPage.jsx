import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, Layers, Globe, Shield, ShoppingBag, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loadingRole, setLoadingRole] = useState(null);
  const [apiError, setApiError] = useState('');

  const tokenExpired = searchParams.get('expired') === 'true';

  const roleProfiles = [
    {
      id: 'operator',
      title: 'Recycling Facility Operator',
      email: 'operator@textilewaste.org',
      pass: 'operator123',
      badge: 'Inventory & Sorting',
      desc: 'Catalog waste batches, perform visual patch classification, and map bin storage zones.',
      icon: Layers,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100/60'
    },
    {
      id: 'manager',
      title: 'Sustainability Manager',
      email: 'manager@textilewaste.org',
      pass: 'manager123',
      badge: 'ESG Telemetry',
      desc: 'Track carbon offsets, water conservation, circularity scores, and export compliance reports.',
      icon: Globe,
      color: 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100/60'
    },
    {
      id: 'admin',
      title: 'Platform Administrator',
      email: 'admin@textilewaste.org',
      pass: 'admin123',
      badge: 'System Control',
      desc: 'Manage system users, oversee platform telemetry, and configure database permissions.',
      icon: Shield,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100/60'
    },
    {
      id: 'manufacturer',
      title: 'Textile Manufacturer',
      email: 'manufacturer@textilewaste.org',
      pass: 'manufacturer123',
      badge: 'Raw Sourcing',
      desc: 'Source certified recycled rPET and organic cotton scraps for circular garment production.',
      icon: ShoppingBag,
      color: 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100/60'
    },
    {
      id: 'demo',
      title: 'Primary Demo Manager',
      email: 'textile@gmail.com',
      pass: 'textile123',
      badge: 'Full Access',
      desc: 'Primary demonstration account loaded with complete sample datasets and analytics.',
      icon: Sparkles,
      color: 'bg-primary-50 text-primary-600 border-primary-200 hover:bg-primary-100/60'
    }
  ];

  const handleQuickLogin = async (role) => {
    setLoadingRole(role.id);
    setApiError('');
    try {
      await login(role.email, role.pass);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setApiError(`Failed to log in as ${role.title}. Verify backend service connection.`);
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12 relative">
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xl shadow-slate-100/50 space-y-6">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-lg shadow-primary-100">
            <Leaf className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Textile Waste Intelligence Platform</h2>
          <p className="text-xs font-semibold text-slate-400">Select a Role for Immediate 1-Click Platform Access</p>
        </div>

        {/* Notices */}
        {tokenExpired && (
          <div className="flex items-center space-x-2 bg-amber-50 border border-amber-200 text-amber-800 p-3.5 rounded-2xl text-xs font-semibold">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>Your session expired. Please select a role to re-enter the platform.</span>
          </div>
        )}

        {apiError && (
          <div className="flex items-center space-x-2 bg-red-50 border border-red-200 text-red-800 p-3.5 rounded-2xl text-xs font-semibold">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        {/* Role Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {roleProfiles.map((role) => {
            const Icon = role.icon;
            const isLoading = loadingRole === role.id;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => handleQuickLogin(role)}
                disabled={loadingRole !== null}
                className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-3 cursor-pointer group shadow-sm hover:shadow-md ${role.color} ${
                  isLoading ? 'opacity-70 animate-pulse' : ''
                } ${role.id === 'demo' ? 'md:col-span-2' : ''}`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-white shadow-sm border border-slate-100">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 group-hover:text-slate-950">{role.title}</h3>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">{role.badge}</span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  {role.desc}
                </p>
              </button>
            );
          })}
        </div>

        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-[11px] font-medium text-slate-400">
            Powered by TWIP Computer Vision & Circular Life Cycle Assessment Engines
          </p>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
