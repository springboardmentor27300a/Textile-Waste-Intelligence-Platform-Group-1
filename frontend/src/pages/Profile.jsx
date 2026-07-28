import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { User as UserIcon, Building, Phone, Mail, Shield, CheckCircle, AlertCircle, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      fullName: '',
      contactDetails: '',
      organizationName: '',
      password: ''
    }
  });

  // Reset form when user details change/load
  useEffect(() => {
    if (user) {
      reset({
        fullName: user.full_name || '',
        contactDetails: user.contact_details || '',
        organizationName: user.organization?.name || '',
        password: ''
      });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    setError('');
    setSuccess(false);
    setLoading(true);
    try {
      await updateProfile({
        full_name: data.fullName,
        contact_details: data.contactDetails,
        organization_name: data.organizationName,
        password: data.password || undefined
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to update profile information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Profile Settings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage your profile details and security settings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Avatar Panel */}
        <div className="lg:col-span-1 p-6 bg-white dark:bg-cardDark border border-slate-100 dark:border-emerald-950/20 rounded-2xl shadow-soft flex flex-col items-center">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-emerald-800 text-white font-bold text-3xl uppercase flex items-center justify-center border-4 border-slate-50 dark:border-slate-800 shadow-md">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white">
              <Camera size={18} />
            </div>
          </div>

          <h2 className="mt-4 text-md font-bold text-slate-900 dark:text-white">{user?.full_name}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
          
          <div className="mt-6 w-full space-y-3 pt-6 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span className="flex items-center space-x-2">
                <Shield size={14} className="text-slate-400" />
                <span>Security Role</span>
              </span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{user?.role?.name}</span>
            </div>

            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span className="flex items-center space-x-2">
                <Building size={14} className="text-slate-400" />
                <span>Organization</span>
              </span>
              <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[120px]">
                {user?.organization?.name || 'Unassigned'}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span className="flex items-center space-x-2">
                <Mail size={14} className="text-slate-400" />
                <span>Login Username</span>
              </span>
              <span className="text-slate-900 dark:text-white truncate max-w-[120px]" title={user?.email}>
                {user?.email}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Edit Form */}
        <div className="lg:col-span-2 p-8 bg-white dark:bg-cardDark border border-slate-100 dark:border-emerald-950/20 rounded-2xl shadow-soft">
          <h3 className="text-md font-bold text-slate-900 dark:text-white mb-6">Edit Personal Information</h3>

          {success && (
            <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs rounded-xl flex items-center space-x-3">
              <CheckCircle size={18} className="shrink-0" />
              <span>Profile updated successfully! Security logs updated.</span>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 text-xs rounded-xl flex items-center space-x-3">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                  <input
                    type="text"
                    id="profile-fullname"
                    placeholder="Jane Doe"
                    className={`w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-bgDark/50 border rounded-xl outline-none text-xs ${
                      errors.fullName ? 'border-red-300' : 'border-slate-200 dark:border-slate-800 focus:border-primary-800'
                    }`}
                    {...register('fullName', { required: 'Name is required' })}
                  />
                </div>
                {errors.fullName && <p className="mt-1 text-[10px] text-red-600">{errors.fullName.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Contact Details (Phone)</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                  <input
                    type="text"
                    id="profile-contact"
                    placeholder="+1 (555) 123-4567"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-bgDark/50 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-xs focus:border-primary-800"
                    {...register('contactDetails')}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Company / Organization Name</label>
              <div className="relative">
                <Building className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                <input
                  type="text"
                  id="profile-org"
                  placeholder="Organization name"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-bgDark/50 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-xs focus:border-primary-800"
                  {...register('organizationName')}
                />
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-850 pt-4">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">Security & Password Update</h4>
              <p className="text-[10px] text-slate-500 mb-3">Leave this field blank if you do not wish to reset your account password.</p>
              
              <div className="relative">
                <Shield className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                <input
                  type="password"
                  id="profile-password"
                  placeholder="New password (min 8 chars)"
                  className={`w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-bgDark/50 border rounded-xl outline-none text-xs ${
                    errors.password ? 'border-red-300' : 'border-slate-200 dark:border-slate-800 focus:border-primary-800'
                  }`}
                  {...register('password', {
                    minLength: { value: 8, message: 'Password must be at least 8 characters long' }
                  })}
                />
              </div>
              {errors.password && <p className="mt-1 text-[10px] text-red-600">{errors.password.message}</p>}
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                id="profile-save-btn"
                disabled={loading}
                className="px-6 py-3 bg-primary-800 hover:bg-primary-900 disabled:bg-primary-300 text-white font-semibold rounded-xl text-xs shadow-soft hover-scale"
              >
                {loading ? 'Saving Changes...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
