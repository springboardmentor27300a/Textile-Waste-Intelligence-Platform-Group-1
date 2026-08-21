import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Briefcase, Lock, Eye, EyeOff, Leaf, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';

const ROLES = [
  { value: 'Textile Manufacturer', label: 'Textile Manufacturer' },
  { value: 'Recycling Facility Operator', label: 'Recycling Facility Operator' },
  { value: 'Sustainability Manager', label: 'Sustainability Manager' },
];

const Field = ({ id, label, icon: Icon, error, children }) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="block text-xs font-medium uppercase tracking-wider text-white/50">
      {label}
    </label>
    <div className="relative">
      <Icon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
      {children}
    </div>
    {error && <p className="text-xs text-red-400">{error}</p>}
  </div>
);

const inputClass = (hasError) =>
  `w-full rounded-xl border bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/20 outline-none transition focus:ring-2 focus:ring-emerald-500/40 ${
    hasError ? 'border-red-500/50' : 'border-white/10 focus:border-emerald-500/50'
  }`;

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

  const setField = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Full name is required';
    if (!form.email.trim()) nextErrors.email = 'Email address is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) nextErrors.email = 'Enter a valid email address';
    if (!form.phone.trim()) nextErrors.phone = 'Phone number is required';
    else if (form.phone.trim().length < 10) nextErrors.phone = 'Phone must be at least 10 digits';
    if (!form.organization.trim()) nextErrors.organization = 'Organization name is required';
    if (!form.password) nextErrors.password = 'Password is required';
    else if (form.password.length < 6) nextErrors.password = 'Password must be at least 6 characters';
    if (!form.confirm_password) nextErrors.confirm_password = 'Please confirm your password';
    else if (form.password !== form.confirm_password) nextErrors.confirm_password = 'Passwords do not match';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const registerResponse = await authService.register(form);
      if (registerResponse.success) {
        toast.success('Account created! Please sign in.');
        navigate('/login');
      } else {
        toast.error(registerResponse.message || 'Registration failed.');
      }
    } catch (error) {
      const msg = error.response?.data?.detail || 'Registration failed. Email or phone may already be in use.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080e0a] flex antialiased">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-5/12 flex-col justify-between bg-gradient-to-br from-emerald-950 via-[#080e0a] to-teal-950 p-12 border-r border-white/5">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500">
            <Leaf className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-bold text-white">Textile Waste Intelligence</span>
        </Link>

        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">Join the platform</p>
            <h2 className="text-3xl font-extrabold leading-tight text-white">
              Make recycling<br />
              <span className="text-emerald-400">data-driven.</span>
            </h2>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs">
              Your organization can start tracking, classifying, and optimizing textile waste in minutes.
            </p>
          </div>

          <ul className="space-y-3">
            {[
              'Role-based dashboards for your team',
              'AI material classification on upload',
              'Real-time sustainability KPIs',
              'PDF & Excel report exports',
            ].map((point) => (
              <li key={point} className="flex items-start gap-2.5 text-sm text-white/50">
                <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-white/20">© {new Date().getFullYear()} Textile Waste Intelligence Platform</p>
      </div>

      {/* Right form panel */}
      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-7/12">
        <div className="w-full max-w-md space-y-7">
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2 lg:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500">
              <Leaf className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-white">Textile Waste Intelligence</span>
          </Link>

          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-white">Create your account</h1>
            <p className="text-sm text-white/40">Fill in your details to get started.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Name */}
              <Field id="name" label="Full name" icon={User} error={errors.name}>
                <input
                  id="name" type="text" value={form.name} onChange={setField('name')}
                  placeholder="Hritik"
                  className={inputClass(errors.name)}
                />
              </Field>

              {/* Email */}
              <Field id="email" label="Email address" icon={Mail} error={errors.email}>
                <input
                  id="email" type="email" value={form.email} onChange={setField('email')}
                  placeholder="you@company.com"
                  className={inputClass(errors.email)}
                />
              </Field>

              {/* Phone */}
              <Field id="phone" label="Phone number" icon={Phone} error={errors.phone}>
                <input
                  id="phone" type="text" value={form.phone} onChange={setField('phone')}
                  placeholder="9876543210"
                  className={inputClass(errors.phone)}
                />
              </Field>

              {/* Organization */}
              <Field id="organization" label="Organization" icon={Briefcase} error={errors.organization}>
                <input
                  id="organization" type="text" value={form.organization} onChange={setField('organization')}
                  placeholder="Eco Fabrics Ltd."
                  className={inputClass(errors.organization)}
                />
              </Field>
            </div>

            {/* Role select */}
            <div className="space-y-1.5">
              <label htmlFor="role" className="block text-xs font-medium uppercase tracking-wider text-white/50">
                Account role
              </label>
              <select
                id="role" value={form.role} onChange={setField('role')}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-sm text-white outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/40"
              >
                {ROLES.map(({ value, label }) => (
                  <option key={value} value={value} className="bg-[#111a13] text-white">{label}</option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Password */}
              <Field id="password" label="Password" icon={Lock} error={errors.password}>
                <input
                  id="password" type={showPassword ? 'text' : 'password'} value={form.password}
                  onChange={setField('password')} placeholder="••••••••"
                  className={`${inputClass(errors.password)} pr-10`}
                />
                <button
                  type="button" onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </Field>

              {/* Confirm Password */}
              <Field id="confirm_password" label="Confirm password" icon={Lock} error={errors.confirm_password}>
                <input
                  id="confirm_password" type={showPassword ? 'text' : 'password'} value={form.confirm_password}
                  onChange={setField('confirm_password')} placeholder="••••••••"
                  className={inputClass(errors.confirm_password)}
                />
              </Field>
            </div>

            <button
              type="submit" disabled={isSubmitting}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {isSubmitting ? 'Creating account...' : 'Create account'}
              {!isSubmitting && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
            </button>
          </form>

          <p className="text-center text-sm text-white/40">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-emerald-400 hover:text-emerald-300 transition">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
