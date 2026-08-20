import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Leaf } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const { loginUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const nextErrors = {};
    if (!form.email.trim()) {
      nextErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = 'Enter a valid email address';
    }
    
    if (!form.password) {
      nextErrors.password = 'Password is required';
    }
    
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await authService.login(form);
      if (res.success) {
        loginUser(res.user, res.token);
        toast.success(res.message || 'Login successful!');
        if (res.user.role === 'Administrator') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        toast.error(res.message || 'Login failed.');
      }
    } catch (error) {
      const msg = error.response?.data?.detail || 'Invalid email or password. Please try again.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full bg-white border border-slate-200 shadow-xl rounded-2xl p-8 space-y-6">
        
        {/* Brand Logo Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2 text-emerald-600 hover:text-emerald-700">
            <Leaf className="h-10 w-10 text-emerald-600" />
            <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-emerald-700 to-sky-700 bg-clip-text text-transparent">
              Textile Waste
            </span>
          </Link>
          <h2 className="mt-4 text-3xl font-extrabold text-slate-900 tracking-tight">User Login</h2>
          <p className="mt-2 text-sm text-slate-500">
            Access your organization's textile waste dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Email field */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1">
              Email address
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="h-5 w-5" />
              </div>
              <input
                id="email"
                type="email"
                className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg bg-slate-50 text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm ${
                  errors.email ? 'border-red-300 ring-red-100 ring-4' : 'border-slate-300'
                }`}
                placeholder="you@company.com"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-600 font-medium">{errors.email}</p>}
          </div>

          {/* Password field */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-5 w-5" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className={`block w-full pl-10 pr-10 py-2.5 border rounded-lg bg-slate-50 text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm ${
                  errors.password ? 'border-red-300 ring-red-100 ring-4' : 'border-slate-300'
                }`}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-600 font-medium">{errors.password}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition"
          >
            {isSubmitting ? 'Logging in...' : 'Sign in'}
          </button>
        </form>

        {/* Footer info link */}
        <div className="text-center border-t border-slate-100 pt-5 text-sm text-slate-600">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-emerald-600 hover:text-emerald-700">
            Register your organization
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
