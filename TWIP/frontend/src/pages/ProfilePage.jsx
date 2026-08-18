import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Shield, CheckCircle, AlertCircle, Phone } from 'lucide-react';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '');

  // States
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const tempErrors = {};
    if (!fullName.trim()) {
      tempErrors.fullName = 'Full name is required';
    } else if (fullName.length < 2) {
      tempErrors.fullName = 'Full name must be at least 2 characters';
    }
    if (!email) {
      tempErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Invalid email address';
    }
    if (password) {
      if (password.length < 6) {
        tempErrors.password = 'Password must be at least 6 characters';
      }
      if (password !== confirmPassword) {
        tempErrors.confirmPassword = 'Passwords do not match';
      }
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccess(false);

    if (!validate()) return;

    setLoading(true);
    const payload = {
      full_name: fullName,
      email: email,
      phone_number: phoneNumber,
    };
    if (password) {
      payload.password = password;
    }

    try {
      await updateProfile(payload);
      setSuccess(true);
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.detail) {
        setApiError(err.response.data.detail);
      } else {
        setApiError('Failed to update profile. Email might already be taken.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (roleName) => {
    switch (roleName) {
      case 'Administrator':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Recycling Facility Operator':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Sustainability Manager':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Textile Manufacturer':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Account Profile</h1>
        <p className="text-sm text-slate-400 font-semibold mt-1">
          Review your account role and update your personal credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Profile Summary Card */}
        <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col items-center text-center space-y-4">
          <div className="h-20 w-20 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center border-2 border-primary-100 shadow-inner">
            <User className="h-10 w-10" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">{user?.full_name}</h3>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">{user?.email}</p>
          </div>
          
          <div className="w-full border-t border-slate-100 pt-4 flex flex-col items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Assigned Credentials</span>
            <span className={`inline-block rounded-full border px-3 py-1 text-xs font-bold ${getRoleColor(user?.role?.name)}`}>
              {user?.role?.name || 'Guest'}
            </span>
          </div>

          <div className="text-xs text-slate-400 font-medium leading-relaxed bg-slate-50 p-4 rounded-2xl w-full text-left">
            <div className="flex items-start space-x-2 text-slate-600 font-bold mb-1">
              <Shield className="h-4 w-4 text-primary-600 flex-shrink-0 mt-0.5" />
              <span>Role Permissions</span>
            </div>
            {user?.role?.name === 'Administrator' && 'As an Administrator, you have full access to database schema controls, logs oversight, and operator assignments.'}
            {user?.role?.name === 'Recycling Facility Operator' && 'As a Recycling Operator, you are authorized to log new textile batches, change processing stages, and catalog fiber components.'}
            {user?.role?.name === 'Sustainability Manager' && 'As a Sustainability Manager, you have read-only access to verify weights, calculate circular ratios, and audit logs.'}
            {user?.role?.name === 'Textile Manufacturer' && 'As a Textile Manufacturer, you have read-only access to search available post-recycled fabrics for textile product runs.'}
          </div>
        </div>

        {/* Right Side: Edit Form */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 mb-6">Modify Settings</h3>

          {success && (
            <div className="mb-6 flex items-center space-x-2 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-semibold">
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
              <span>Your profile details have been updated successfully!</span>
            </div>
          )}

          {apiError && (
            <div className="mb-6 flex items-center space-x-2 bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-xs font-semibold">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-slate-50/50 focus:bg-white text-sm font-semibold transition-all focus:outline-none focus:ring-2 ${
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
                    <Mail className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@textilewaste.org"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-slate-50/50 focus:bg-white text-sm font-semibold transition-all focus:outline-none focus:ring-2 ${
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
                    <Phone className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">New Password (Optional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-slate-50/50 focus:bg-white text-sm font-semibold transition-all focus:outline-none focus:ring-2 ${
                      errors.password ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-primary-100 focus:border-primary-500'
                    }`}
                  />
                </div>
                {errors.password && <p className="text-xs text-red-600 mt-1 font-semibold">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Confirm New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={!password}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-slate-50/50 focus:bg-white text-sm font-semibold transition-all focus:outline-none focus:ring-2 ${
                      errors.confirmPassword ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-primary-100 focus:border-primary-500'
                    }`}
                  />
                </div>
                {errors.confirmPassword && <p className="text-xs text-red-600 mt-1 font-semibold">{errors.confirmPassword}</p>}
              </div>

            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md shadow-primary-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none text-sm"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  'Save Settings'
                )}
              </button>
            </div>
          </form>

        </div>

      </div>

    </div>
  );
};

export default ProfilePage;
