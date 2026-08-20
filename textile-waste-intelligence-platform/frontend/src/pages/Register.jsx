import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Briefcase, Lock, Eye, EyeOff, Leaf } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    password: '',
    confirm_password: '',
    role: 'Textile Manufacturer',
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Full name is required';
    
    if (!form.email.trim()) {
      nextErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = 'Enter a valid email address';
    }
    
    if (!form.phone.trim()) {
      nextErrors.phone = 'Phone number is required';
    } else if (form.phone.trim().length < 10) {
      nextErrors.phone = 'Phone number must be at least 10 digits';
    }
    
    if (!form.organization.trim()) nextErrors.organization = 'Organization is required';
    
    if (!form.password) {
      nextErrors.password = 'Password is required';
    } else if (form.password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!form.confirm_password) {
      nextErrors.confirm_password = 'Confirm password is required';
    } else if (form.password !== form.confirm_password) {
      nextErrors.confirm_password = 'Passwords do not match';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await authService.register(form);
      if (res.success) {
        toast.success('Registration successful! Redirecting to login.');
        navigate('/login');
      } else {
        toast.error(res.message || 'Registration failed.');
      }
    } catch (error) {
      const msg = error.response?.data?.detail || 'Registration failed. Email or phone number might already be in use.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full bg-white border border-slate-200 shadow-xl rounded-2xl p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2 text-emerald-600 hover:text-emerald-700">
            <Leaf className="h-10 w-10 text-emerald-600" />
            <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-emerald-700 to-sky-700 bg-clip-text text-transparent">
              Textile Waste
            </span>
          </Link>
          <h2 className="mt-4 text-3xl font-extrabold text-slate-900 tracking-tight">Create User Account</h2>
          <p className="mt-2 text-sm text-slate-500 font-light">
            Join the sustainability platform & track textile waste
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Full Name */}
          <div>
            <label htmlFor="name" className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="h-4 w-4" />
              </div>
              <input
                id="name"
                type="text"
                className={`block w-full pl-10 pr-3 py-2 border rounded-lg bg-slate-50 text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm ${
                  errors.name ? 'border-red-300 ring-red-100 ring-4' : 'border-slate-300'
                }`}
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            {errors.name && <p className="mt-0.5 text-2xs text-red-600 font-medium">{errors.name}</p>}
          </div>

          {/* Email Address */}
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                id="email"
                type="email"
                className={`block w-full pl-10 pr-3 py-2 border rounded-lg bg-slate-50 text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm ${
                  errors.email ? 'border-red-300 ring-red-100 ring-4' : 'border-slate-300'
                }`}
                placeholder="john@company.com"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>
            {errors.email && <p className="mt-0.5 text-2xs text-red-600 font-medium">{errors.email}</p>}
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="phone" className="block text-xs font-semibold text-slate-700 mb-1">
              Phone Number
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Phone className="h-4 w-4" />
              </div>
              <input
                id="phone"
                type="text"
                className={`block w-full pl-10 pr-3 py-2 border rounded-lg bg-slate-50 text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm ${
                  errors.phone ? 'border-red-300 ring-red-100 ring-4' : 'border-slate-300'
                }`}
                placeholder="1234567890"
                value={form.phone}
                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            {errors.phone && <p className="mt-0.5 text-2xs text-red-600 font-medium">{errors.phone}</p>}
          </div>

          {/* Organization */}
          <div>
            <label htmlFor="organization" className="block text-xs font-semibold text-slate-700 mb-1">
              Organization
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Briefcase className="h-4 w-4" />
              </div>
              <input
                id="organization"
                type="text"
                className={`block w-full pl-10 pr-3 py-2 border rounded-lg bg-slate-50 text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm ${
                  errors.organization ? 'border-red-300 ring-red-100 ring-4' : 'border-slate-300'
                }`}
                placeholder="Eco Fashion Inc."
                value={form.organization}
                onChange={(e) => setForm((prev) => ({ ...prev, organization: e.target.value }))}
              />
            </div>
            {errors.organization && <p className="mt-0.5 text-2xs text-red-600 font-medium">{errors.organization}</p>}
          </div>

          {/* Platform Role Selection */}
          <div>
            <label htmlFor="role" className="block text-xs font-semibold text-slate-700 mb-1">
              Account Role
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="h-4 w-4" />
              </div>
              <select
                id="role"
                className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                value={form.role}
                onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
              >
                <option value="Textile Manufacturer">Textile Manufacturer</option>
                <option value="Recycling Facility Operator">Recycling Facility Operator</option>
                <option value="Sustainability Manager">Sustainability Manager</option>
                <option value="Administrator">Administrator</option>
              </select>
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className={`block w-full pl-10 pr-10 py-2 border rounded-lg bg-slate-50 text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm ${
                  errors.password ? 'border-red-300 ring-red-100 ring-4' : 'border-slate-300'
                }`}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="mt-0.5 text-2xs text-red-600 font-medium">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirm_password" className="block text-xs font-semibold text-slate-700 mb-1">
              Confirm Password
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                id="confirm_password"
                type={showPassword ? 'text' : 'password'}
                className={`block w-full pl-10 pr-3 py-2 border rounded-lg bg-slate-50 text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm ${
                  errors.confirm_password ? 'border-red-300 ring-red-100 ring-4' : 'border-slate-300'
                }`}
                placeholder="••••••••"
                value={form.confirm_password}
                onChange={(e) => setForm((prev) => ({ ...prev, confirm_password: e.target.value }))}
              />
            </div>
            {errors.confirm_password && <p className="mt-0.5 text-2xs text-red-600 font-medium">{errors.confirm_password}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 mt-2 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition"
          >
            {isSubmitting ? 'Registering...' : 'Register'}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center border-t border-slate-100 pt-4 text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-700">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
