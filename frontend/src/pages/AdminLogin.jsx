import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserCheck, Lock, Eye, EyeOff, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '../services/adminService';
import { AuthContext } from '../context/AuthContext';

const AdminLogin = () => {
  const { loginAdmin } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({ admin_id: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const nextErrors = {};
    if (!form.admin_id.trim()) {
      nextErrors.admin_id = 'Admin ID is required';
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
      const res = await adminService.login(form);
      if (res.success) {
        loginAdmin(res.admin, res.token);
        toast.success('Admin login successful. Access granted.');
        navigate('/admin/dashboard');
      } else {
        toast.error(res.message || 'Admin login failed.');
      }
    } catch (error) {
      const msg = error.response?.data?.detail || 'Invalid Admin ID or password.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full bg-white border border-sky-200 shadow-xl rounded-2xl p-8 space-y-6">
        
        {/* Header (Admin specific blue theme) */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2 text-sky-600 hover:text-sky-700">
            <Shield className="h-10 w-10 text-sky-600 animate-pulse" />
            <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-sky-700 to-indigo-700 bg-clip-text text-transparent">
              Textile Waste
            </span>
          </Link>
          <div className="mt-4 inline-flex items-center space-x-1.5 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded text-sky-700 text-xs font-semibold uppercase">
            <span>Admin Control Panel</span>
          </div>
          <h2 className="mt-3 text-3xl font-extrabold text-slate-900 tracking-tight">Admin Login</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Admin ID */}
          <div>
            <label htmlFor="admin_id" className="block text-sm font-semibold text-slate-700 mb-1">
              Admin ID
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <UserCheck className="h-5 w-5" />
              </div>
              <input
                id="admin_id"
                type="text"
                className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg bg-slate-50 text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm ${
                  errors.admin_id ? 'border-red-300 ring-red-100 ring-4' : 'border-slate-300'
                }`}
                placeholder="admin"
                value={form.admin_id}
                onChange={(e) => setForm((prev) => ({ ...prev, admin_id: e.target.value }))}
              />
            </div>
            {errors.admin_id && <p className="mt-1 text-xs text-red-600 font-medium">{errors.admin_id}</p>}
          </div>

          {/* Password */}
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
                className={`block w-full pl-10 pr-10 py-2.5 border rounded-lg bg-slate-50 text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm ${
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

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 transition"
          >
            {isSubmitting ? 'Verifying admin...' : 'Sign in as Admin'}
          </button>
        </form>

        {/* Footer info link */}
        <div className="text-center border-t border-slate-100 pt-5 text-sm text-slate-500">
          Standard User?{' '}
          <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-700">
            Login as User
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
