import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, User, Mail, Lock, Briefcase, AlertCircle, CheckCircle, Phone } from 'lucide-react';

const RegisterPage = () => {
  const { register, login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // States
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const roles = [
    'Administrator',
    'Recycling Facility Operator',
    'Sustainability Manager',
    'Textile Manufacturer'
  ];

  const validate = () => {
    const tempErrors = {};
    if (!password) {
      tempErrors.password = 'Password is required';
    } else if (password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters';
    }
    if (!role) {
      tempErrors.role = 'Please select a role';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    
    if (!validate()) return;

    setLoading(true);
    const targetFullName = fullName || 'Sri';
    const targetEmail = email || 'sri@textilewaste.org';
    try {
      await register(targetFullName, targetEmail, password, role, phoneNumber);
      setSuccess(true);
      
      // Instantly log in as the newly created user and redirect directly to dashboard
      await login(targetEmail, password);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.detail) {
        setApiError(err.response.data.detail);
      } else {
        setApiError('Registration failed or server connection failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setApiError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setApiError('Google sign-up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xl shadow-slate-100/50">
        
        {/* Header */}
        <div className="flex flex-col items-center space-y-2 mb-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-lg shadow-primary-100">
            <Leaf className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800">Create Account</h2>
          <p className="text-sm text-slate-400 font-medium">Join the Textile Recycling Network</p>
        </div>

        {/* Notices */}
        {apiError && (
          <div className="mb-4 flex items-center space-x-2 bg-red-50 border border-red-200 text-red-800 p-3.5 rounded-xl text-xs font-semibold">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 flex items-center space-x-2 bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs font-semibold">
            <CheckCircle className="h-4 w-4 flex-shrink-0" />
            <span>Registration successful! Redirecting to dashboard...</span>
          </div>
        )}

        {/* Google Sign Up Button */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-3 bg-white hover:bg-slate-50 text-slate-700 font-bold py-3.5 px-4 rounded-xl border border-slate-200/90 shadow-sm transition-all hover:border-slate-300 hover:shadow active:scale-[0.99] mb-5 cursor-pointer"
        >
          <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24">
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
          <span className="text-sm font-extrabold text-slate-800">Sign up with Google</span>
        </button>

        {/* Divider */}
        <div className="relative flex items-center justify-center mb-5">
          <div className="border-t border-slate-200 w-full"></div>
          <span className="bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider absolute">OR REGISTER WITH EMAIL</span>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Sri"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="textile@gmail.com"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Phone Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Phone className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Role Selection *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Briefcase className="h-4 w-4" />
              </div>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={`w-full pl-9 pr-4 py-2.5 rounded-xl border bg-slate-50/50 focus:bg-white text-sm font-semibold focus:outline-none focus:ring-2 ${
                  errors.role ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-primary-100 focus:border-primary-500'
                }`}
              >
                <option value="">Select Account Role...</option>
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            {errors.role && <p className="text-xs text-red-600 mt-1 font-semibold">{errors.role}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Password *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-9 pr-4 py-2.5 rounded-xl border bg-slate-50/50 focus:bg-white text-sm font-semibold focus:outline-none focus:ring-2 ${
                  errors.password ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-primary-100 focus:border-primary-500'
                }`}
              />
            </div>
            {errors.password && <p className="text-xs text-red-600 mt-1 font-semibold">{errors.password}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-primary-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center text-sm mt-2"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-slate-500 font-medium border-t border-slate-100 pt-5">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-primary-600 hover:text-primary-700">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;
