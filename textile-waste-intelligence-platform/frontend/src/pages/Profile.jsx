import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Shield, Lock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';

const Profile = () => {
  const { user, updateUserInContext } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [isSaving, setIsSaving] = useState(false);

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const initials = user?.name?.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await authService.updateProfile(form);
      updateUserInContext(res.data.user);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setIsChangingPassword(true);
    try {
      await authService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password updated successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not update password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Your Profile</h1>
        <p className="text-sm text-ink/60">Manage your personal details and account security.</p>
      </div>

      <div className="card flex items-center gap-4">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold text-white"
          style={{ backgroundColor: user?.avatarColor || '#1F7A54' }}
        >
          {initials}
        </div>
        <div>
          <p className="font-display text-lg font-bold text-ink">{user?.name}</p>
          <p className="flex items-center gap-1.5 text-sm text-ink/60"><Shield size={13} /> {user?.role}</p>
        </div>
      </div>

      <form onSubmit={handleProfileSubmit} className="card space-y-4">
        <h3 className="font-display text-base font-bold text-ink">Personal Details</h3>
        <div>
          <label htmlFor="name" className="field-label">Full name</label>
          <div className="relative">
            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
            <input id="name" className="input-field pl-10" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
        </div>
        <div>
          <label htmlFor="email" className="field-label">Email address</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
            <input id="email" className="input-field pl-10 bg-ink/5 text-ink/50" value={user?.email} disabled />
          </div>
          <p className="mt-1 text-xs text-ink/40">Email address cannot be changed.</p>
        </div>
        <div>
          <label htmlFor="phone" className="field-label">Phone number</label>
          <div className="relative">
            <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
            <input id="phone" className="input-field pl-10" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          </div>
        </div>
        <div className="flex justify-end border-t border-forest-100 pt-4">
          <button type="submit" disabled={isSaving} className="btn-primary">
            {isSaving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>

      <form onSubmit={handlePasswordSubmit} className="card space-y-4">
        <h3 className="font-display text-base font-bold text-ink">Change Password</h3>
        <div>
          <label htmlFor="currentPassword" className="field-label">Current password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
            <input
              id="currentPassword"
              type="password"
              className="input-field pl-10"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="newPassword" className="field-label">New password</label>
            <input
              id="newPassword"
              type="password"
              className="input-field"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))}
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="field-label">Confirm new password</label>
            <input
              id="confirmPassword"
              type="password"
              className="input-field"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))}
            />
          </div>
        </div>
        <div className="flex justify-end border-t border-forest-100 pt-4">
          <button type="submit" disabled={isChangingPassword} className="btn-primary">
            {isChangingPassword ? 'Updating…' : 'Update password'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
