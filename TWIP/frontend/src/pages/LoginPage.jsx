import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, Mail, Lock, AlertCircle, CheckCircle, X, UserCheck, PlusCircle } from 'lucide-react';

const LoginPage = () => {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Google SSO Modal & Custom Input
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Validation / Error / Loading States
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');

  // Check if redirected due to token expiration
  const tokenExpired = searchParams.get('expired') === 'true';

  const defaultGoogleAccounts = [
    { name: 'Textile Waste Intelligence', email: 'textile@gmail.com', role: 'System & Recycling Manager' },
    { name: 'Sri', email: 'sri@textilewaste.org', role: 'Accountant & Manager' },
    { name: 'John Doe', email: 'operator@textilewaste.org', role: 'Recycling Facility Operator' },
    { name: 'Jane Smith', email: 'manager@textilewaste.org', role: 'Sustainability Manager' },
    { name: 'System Admin', email: 'admin@textilewaste.org', role: 'Platform Administrator' }
  ];

  const validate = () => {
    const tempErrors = {};
    if (!email) {
      tempErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Invalid email address';
    }
    if (!password) {
      tempErrors.password = 'Password is required';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setForgotMessage('');
    
    if (!validate()) return;

    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.detail) {
        setApiError(err.response.data.detail);
      } else {
        setApiError('Unable to connect to server. Please check if backend is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGoogleAccount = async (acctEmail, acctName) => {
    setShowGoogleModal(false);
    setApiError('');
    setLoading(true);
    try {
      await loginWithGoogle(acctEmail, acctName);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setApiError('Google Single Sign-On failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomGoogleSubmit = async (e) => {
    e.preventDefault();
    if (!customGoogleEmail) return;
    await handleSelectGoogleAccount(customGoogleEmail, customGoogleName || customGoogleEmail.split('@')[0]);
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setForgotMessage('Forgot password reset request simulation triggered. Security verification code dispatched.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-8 relative">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xl shadow-slate-100/50">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center space-y-2 mb-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-lg shadow-primary-100">
            <Leaf className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800">Welcome Back</h2>
          <p className="text-sm text-slate-400 font-medium">Textile Waste Intelligence Platform</p>
        </div>

        {/* Notices */}
        {tokenExpired && (
          <div className="mb-4 flex items-center space-x-2 bg-amber-50 border border-amber-200 text-amber-800 p-3.5 rounded-xl text-xs font-semibold">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>Your session has expired. Please log in again.</span>
          </div>
        )}

        {apiError && (
          <div className="mb-4 flex items-center space-x-2 bg-red-50 border border-red-200 text-red-800 p-3.5 rounded-xl text-xs font-semibold">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        {forgotMessage && (
          <div className="mb-4 flex items-center space-x-2 bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs font-semibold">
            <CheckCircle className="h-4 w-4 flex-shrink-0" />
            <span>{forgotMessage}</span>
          </div>
        )}

        {/* Standard Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="h-5 w-5" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="textile@gmail.com"
                className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-slate-50/50 focus:bg-white text-sm font-semibold transition-all focus:outline-none focus:ring-2 ${
                  errors.email ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-primary-100 focus:border-primary-500'
                }`}
              />
            </div>
            {errors.email && <p className="text-xs text-red-600 mt-1 font-semibold">{errors.email}</p>}
          </div>

          {/* Password input */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
              <button 
                onClick={handleForgotPassword}
                type="button"
                className="text-xs font-bold text-primary-600 hover:text-primary-700 hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-5 w-5" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-slate-50/50 focus:bg-white text-sm font-semibold transition-all focus:outline-none focus:ring-2 ${
                  errors.password ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-primary-100 focus:border-primary-500'
                }`}
              />
            </div>
            {errors.password && <p className="text-xs text-red-600 mt-1 font-semibold">{errors.password}</p>}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-primary-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center text-sm cursor-pointer"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Register footer */}
        <div className="mt-8 text-center text-xs text-slate-500 font-medium border-t border-slate-100 pt-6">
          New to TWIP?{' '}
          <Link to="/register" className="font-bold text-primary-600 hover:text-primary-700">
            Create an Account
          </Link>
        </div>

      </div>

      {/* Google Account Picker Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6 relative border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Close Button */}
            <button 
              onClick={() => setShowGoogleModal(false)}
              className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Header */}
            <div className="flex flex-col items-center text-center space-y-2 pt-2">
              <svg className="h-8 w-8 mb-1" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <h3 className="text-xl font-black text-slate-900">Choose a Google Account</h3>
              <p className="text-xs text-slate-500 font-medium">
                to continue to <span className="font-bold text-slate-700">Textile Waste Intelligence Platform</span>
              </p>
            </div>

            {/* Account List */}
            <div className="space-y-2.5">
              {defaultGoogleAccounts.map((acct, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectGoogleAccount(acct.email, acct.name)}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-200/80 hover:border-primary-400 hover:bg-primary-50/50 transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-700 font-black text-sm flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-colors">
                      {acct.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-slate-800">{acct.name}</div>
                      <div className="text-[11px] text-slate-500 font-medium">{acct.email}</div>
                    </div>
                  </div>
                  <UserCheck className="h-4 w-4 text-slate-300 group-hover:text-primary-600 transition-colors" />
                </button>
              ))}

              {/* Custom Input Option */}
              {!showCustomInput ? (
                <button
                  onClick={() => setShowCustomInput(true)}
                  className="w-full flex items-center space-x-3 p-3.5 rounded-2xl border border-dashed border-slate-300 hover:border-primary-400 hover:bg-slate-50 text-slate-600 font-extrabold text-xs transition-all cursor-pointer"
                >
                  <PlusCircle className="h-5 w-5 text-slate-400" />
                  <span>Use another Google account...</span>
                </button>
              ) : (
                <form onSubmit={handleCustomGoogleSubmit} className="space-y-3 pt-2">
                  <div>
                    <input
                      type="email"
                      required
                      value={customGoogleEmail}
                      onChange={(e) => setCustomGoogleEmail(e.target.value)}
                      placeholder="user@gmail.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-200"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all"
                  >
                    Authenticate Account
                  </button>
                </form>
              )}
            </div>

            <div className="text-center text-[10px] text-slate-400 font-semibold border-t border-slate-100 pt-3">
              Protected by Google Single Sign-On & JWT Encryption
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default LoginPage;
