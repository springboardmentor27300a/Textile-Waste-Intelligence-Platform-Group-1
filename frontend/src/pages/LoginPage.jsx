import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, Mail, Lock, User, Briefcase, Phone, AlertCircle, CheckCircle, ArrowRight, UserPlus, LogIn } from 'lucide-react';

const LoginPage = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Active Tab: 'signin' or 'signup'
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';
  const [activeTab, setActiveTab] = useState(initialMode);

  // Form States - Sign In
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Form States - Sign Up
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpRole, setSignUpRole] = useState('Recycling Facility Operator');
  const [signUpPhone, setSignUpPhone] = useState('');

  // UI / Error / Loading States
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const tokenExpired = searchParams.get('expired') === 'true';

  const rolesList = [
    'Recycling Facility Operator',
    'Sustainability Manager',
    'Administrator',
    'Textile Manufacturer'
  ];

  const defaultAccounts = [
    { label: 'Operator', email: 'operator@textilewaste.org', pass: 'operator123' },
    { label: 'Manager', email: 'manager@textilewaste.org', pass: 'manager123' },
    { label: 'Admin', email: 'admin@textilewaste.org', pass: 'admin123' },
    { label: 'Manufacturer', email: 'manufacturer@textilewaste.org', pass: 'manufacturer123' },
    { label: 'Demo Account', email: 'textile@gmail.com', pass: 'textile123' }
  ];

  // Validate Sign In Form
  const validateSignIn = () => {
    const temp = {};
    if (!signInEmail) {
      temp.signInEmail = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(signInEmail)) {
      temp.signInEmail = 'Please enter a valid email address';
    }
    if (!signInPassword) {
      temp.signInPassword = 'Password is required';
    }
    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  // Validate Sign Up Form
  const validateSignUp = () => {
    const temp = {};
    if (!signUpEmail) {
      temp.signUpEmail = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(signUpEmail)) {
      temp.signUpEmail = 'Please enter a valid email address';
    }
    if (!signUpPassword) {
      temp.signUpPassword = 'Password is required';
    } else if (signUpPassword.length < 6) {
      temp.signUpPassword = 'Password must be at least 6 characters';
    }
    if (!signUpRole) {
      temp.signUpRole = 'Role selection is required';
    }
    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  // Handle Sign In Submit
  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccessMessage('');
    if (!validateSignIn()) return;

    setLoading(true);
    try {
      await login(signInEmail, signInPassword);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.detail) {
        setApiError(err.response.data.detail);
      } else {
        setApiError('Unable to log in. Please verify credentials or backend connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Sign Up Submit
  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccessMessage('');
    if (!validateSignUp()) return;

    setLoading(true);
    const fullName = signUpName || 'New User';
    try {
      await register(fullName, signUpEmail, signUpPassword, signUpRole, signUpPhone);
      setSuccessMessage('Registration successful! Automatically logging you into the dashboard...');
      
      // Auto login immediately
      await login(signUpEmail, signUpPassword);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.detail) {
        setApiError(err.response.data.detail);
      } else {
        setApiError('Registration failed. Email may already be registered.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAutofill = (acct) => {
    setSignInEmail(acct.email);
    setSignInPassword(acct.pass);
    setErrors({});
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-10 relative">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xl shadow-slate-100/50 space-y-6">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-lg shadow-primary-100">
            <Leaf className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Textile Waste Intelligence Platform</h2>
          <p className="text-xs text-slate-400 font-semibold">Circular Economy & Material Analytics</p>
        </div>

        {/* Tab Toggle: Sign In / Sign Up */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl">
          <button
            type="button"
            onClick={() => { setActiveTab('signin'); setErrors({}); setApiError(''); }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'signin' 
                ? 'bg-white text-slate-800 shadow-sm border border-slate-200/60' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LogIn className="h-4 w-4" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('signup'); setErrors({}); setApiError(''); }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'signup' 
                ? 'bg-white text-slate-800 shadow-sm border border-slate-200/60' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="h-4 w-4" />
            <span>Sign Up</span>
          </button>
        </div>

        {/* Notices */}
        {tokenExpired && (
          <div className="flex items-center space-x-2 bg-amber-50 border border-amber-200 text-amber-800 p-3.5 rounded-2xl text-xs font-semibold">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>Your session expired. Please sign in again.</span>
          </div>
        )}

        {apiError && (
          <div className="flex items-center space-x-2 bg-red-50 border border-red-200 text-red-800 p-3.5 rounded-2xl text-xs font-semibold">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        {successMessage && (
          <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-2xl text-xs font-semibold">
            <CheckCircle className="h-4 w-4 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* FORM TAB 1: SIGN IN */}
        {activeTab === 'signin' && (
          <form onSubmit={handleSignInSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  placeholder="operator@textilewaste.org"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs font-semibold transition-all focus:outline-none focus:ring-2 ${
                    errors.signInEmail ? 'border-red-300 focus:ring-red-200 bg-red-50/20' : 'border-slate-200 focus:ring-primary-100 bg-slate-50/30'
                  }`}
                />
              </div>
              {errors.signInEmail && <p className="mt-1 text-[11px] text-red-600 font-semibold">{errors.signInEmail}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs font-semibold transition-all focus:outline-none focus:ring-2 ${
                    errors.signInPassword ? 'border-red-300 focus:ring-red-200 bg-red-50/20' : 'border-slate-200 focus:ring-primary-100 bg-slate-50/30'
                  }`}
                />
              </div>
              {errors.signInPassword && <p className="mt-1 text-[11px] text-red-600 font-semibold">{errors.signInPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md shadow-primary-200 active:scale-[0.99] disabled:opacity-50 cursor-pointer text-xs"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In to Platform</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            {/* Quick Role Autofill Options */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center">Quick Role Autofill</span>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {defaultAccounts.map((acct, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAutofill(acct)}
                    className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-primary-50 text-slate-700 hover:text-primary-700 border border-slate-200/60 transition-all cursor-pointer"
                  >
                    {acct.label}
                  </button>
                ))}
              </div>
            </div>
          </form>
        )}

        {/* FORM TAB 2: SIGN UP */}
        {activeTab === 'signup' && (
          <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-100 bg-slate-50/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  placeholder="operator@textilewaste.org"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 ${
                    errors.signUpEmail ? 'border-red-300 focus:ring-red-200 bg-red-50/20' : 'border-slate-200 focus:ring-primary-100 bg-slate-50/30'
                  }`}
                />
              </div>
              {errors.signUpEmail && <p className="mt-1 text-[11px] text-red-600 font-semibold">{errors.signUpEmail}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Platform Role</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Briefcase className="h-4 w-4" />
                </div>
                <select
                  value={signUpRole}
                  onChange={(e) => setSignUpRole(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-100 bg-slate-50/30 text-slate-800"
                >
                  {rolesList.map((r, idx) => (
                    <option key={idx} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={signUpPhone}
                  onChange={(e) => setSignUpPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-100 bg-slate-50/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 ${
                    errors.signUpPassword ? 'border-red-300 focus:ring-red-200 bg-red-50/20' : 'border-slate-200 focus:ring-primary-100 bg-slate-50/30'
                  }`}
                />
              </div>
              {errors.signUpPassword && <p className="mt-1 text-[11px] text-red-600 font-semibold">{errors.signUpPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md shadow-emerald-200 active:scale-[0.99] disabled:opacity-50 cursor-pointer text-xs"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Create Account & Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

export default LoginPage;
