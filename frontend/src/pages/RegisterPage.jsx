import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, User, Mail, Lock, Briefcase, AlertCircle, CheckCircle, Phone } from 'lucide-react';

const RegisterPage = () => {
  const { register, login } = useAuth();
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
    const targetFullName = 'Sri';
    const targetEmail = 'sri@textilewaste.org';
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
            <span>Registration successful! Redirecting to login...</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="h-5 w-5" />
              </div>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="sri"
                disabled={success}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-slate-50/50 focus:bg-white text-sm font-semibold transition-all focus:outline-none focus:ring-2 ${
                  errors.fullName ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-primary-100 focus:border-primary-500'
                }`}
              />
            </div>
            {errors.fullName && <p className="text-xs text-red-600 mt-1 font-semibold">{errors.fullName}</p>}
          </div>

          {/* Email */}
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
                placeholder="sri@textilewaste.org"
                disabled={success}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-slate-50/50 focus:bg-white text-sm font-semibold transition-all focus:outline-none focus:ring-2 ${
                  errors.email ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-primary-100 focus:border-primary-500'
                }`}
              />
            </div>
            {errors.email && <p className="text-xs text-red-600 mt-1 font-semibold">{errors.email}</p>}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Phone Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Phone className="h-5 w-5" />
              </div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 98765 43210"
                disabled={success}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Role selection dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Account Role</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Briefcase className="h-5 w-5" />
              </div>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={success}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-slate-50/50 focus:bg-white text-sm font-semibold transition-all focus:outline-none focus:ring-2 ${
                  errors.role ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-primary-100'
                } appearance-none cursor-pointer`}
              >
                <option value="">Select a role...</option>
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
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-5 w-5" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                disabled={success}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-slate-50/50 focus:bg-white text-sm font-semibold transition-all focus:outline-none focus:ring-2 ${
                  errors.password ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-primary-100 focus:border-primary-500'
                }`}
              />
            </div>
            {errors.password && <p className="text-xs text-red-600 mt-1 font-semibold">{errors.password}</p>}
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading || success}
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
        <div className="mt-8 text-center text-xs text-slate-500 font-medium border-t border-slate-100 pt-6">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-primary-600 hover:text-primary-700">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;
