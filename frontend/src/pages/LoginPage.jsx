import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Validation / Error / Loading States
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');

  // Check if redirected due to token expiration
  const tokenExpired = searchParams.get('expired') === 'true';

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
      // Success - Route to Dashboard
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

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setForgotMessage('Forgot password reset request simulation triggered. Security verification code dispatched.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
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

        {/* Login Form */}
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
                placeholder="operator@textilewaste.org"
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
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-primary-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center text-sm"
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
    </div>
  );
};

export default LoginPage;
