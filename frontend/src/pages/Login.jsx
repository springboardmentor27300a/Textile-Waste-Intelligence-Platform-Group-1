import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Leaf, ArrowRight } from 'lucide-react';
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
      const loginResponse = await authService.login(form);
      if (loginResponse.success) {
        loginUser(loginResponse.user, loginResponse.token);
        toast.success(loginResponse.message || 'Welcome back!');
        if (loginResponse.user.role === 'Administrator') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        toast.error(loginResponse.message || 'Login failed.');
      }
    } catch (error) {
      const msg = error.response?.data?.detail || 'Invalid email or password. Please try again.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080e0a] flex antialiased">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-emerald-950 via-[#080e0a] to-teal-950 p-12 border-r border-white/5">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500">
            <Leaf className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-bold text-white">Textile Waste Intelligence</span>
        </Link>

        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">Trusted by manufacturers</p>
            <h2 className="text-4xl font-extrabold leading-tight text-white">
              Track waste.<br />
              Save resources.<br />
              <span className="text-emerald-400">Close the loop.</span>
            </h2>
            <p className="text-white/40 text-sm leading-relaxed max-w-sm">
              Join textile manufacturers, recycling operators, and sustainability managers who track waste smarter.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 max-w-xs">
            {[
              { value: '94%', label: 'Recyclability' },
              { value: '12K+', label: 'Batches tracked' },
              { value: '3.2T', label: 'CO₂ saved' },
              { value: '99.9%', label: 'Uptime' },
            ].map(({ value, label }) => (
              <div key={label} className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
                <p className="text-xl font-bold text-white">{value}</p>
                <p className="text-xs text-white/40">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-white/20">© {new Date().getFullYear()} Textile Waste Intelligence Platform</p>
      </div>

      {/* Right panel — form */}
      <div className="flex w-full flex-col items-center justify-center px-6 py-16 lg:w-1/2">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2 lg:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500">
              <Leaf className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-white">Textile Waste Intelligence</span>
          </Link>

          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-white">Sign in</h1>
            <p className="text-sm text-white/40">Enter your credentials to access your dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-medium text-white/50 uppercase tracking-wider">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="you@company.com"
                  className={`w-full rounded-xl border bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/20 outline-none transition focus:ring-2 focus:ring-emerald-500/40 ${
                    errors.email ? 'border-red-500/50' : 'border-white/10 focus:border-emerald-500/50'
                  }`}
                />
              </div>
              {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-xs font-medium text-white/50 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="••••••••"
                  className={`w-full rounded-xl border bg-white/5 py-3 pl-10 pr-10 text-sm text-white placeholder:text-white/20 outline-none transition focus:ring-2 focus:ring-emerald-500/40 ${
                    errors.password ? 'border-red-500/50' : 'border-white/10 focus:border-emerald-500/50'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
              {!isSubmitting && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
            </button>
          </form>

          <p className="text-center text-sm text-white/40">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-emerald-400 hover:text-emerald-300 transition">
              Register your organization
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
