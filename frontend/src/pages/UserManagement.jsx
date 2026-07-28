import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Users, Plus, Edit, Trash2, X, AlertCircle, CheckCircle, RefreshCw, Shield, 
  Mail, User as UserIcon, Building, Activity, ShieldAlert, Key
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  
  if (currentUser && currentUser.role.name !== 'Administrator') {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 rounded-3xl text-xs font-semibold">
        Access Denied: User directory administration is restricted to administrators.
      </div>
    );
  }

  // State
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modals & Feedback
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Load Users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users/');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to query user accounts database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Open Modal for Add
  const handleOpenAdd = () => {
    setEditUser(null);
    reset({
      full_name: '',
      email: '',
      password: '',
      role_name: 'Recycling Facility Operator',
      organization_name: ''
    });
    setModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (user) => {
    setEditUser(user);
    reset({
      full_name: user.full_name,
      email: user.email,
      role_name: user.role.name,
      organization_name: user.organization?.name || '',
      is_active: user.is_active,
      password: '' // empty means no password change
    });
    setModalOpen(true);
  };

  // Form Submit handler
  const onSubmit = async (data) => {
    setErrorMsg('');
    try {
      if (editUser) {
        // Prepare PUT payload
        const payload = {
          full_name: data.full_name,
          email: data.email,
          role_name: data.role_name,
          organization_name: data.organization_name,
          is_active: data.is_active
        };
        if (data.password && data.password.trim() !== '') {
          payload.password = data.password;
        }
        await api.put(`/users/${editUser.id}`, payload);
        setSuccessMsg(`User ${data.full_name} updated successfully.`);
      } else {
        // Prepare POST payload
        const payload = {
          full_name: data.full_name,
          email: data.email,
          password: data.password || 'TemporaryPass123!',
          role_name: data.role_name,
          organization_name: data.organization_name || ''
        };
        await api.post('/users/', payload);
        setSuccessMsg(`User ${data.full_name} registered successfully.`);
      }
      setModalOpen(false);
      fetchUsers();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || 'Failed to process user action.');
    }
  };

  // Handle Delete
  const handleDelete = async () => {
    if (!deleteId) return;
    setErrorMsg('');
    try {
      await api.delete(`/users/${deleteId}`);
      setSuccessMsg('User account terminated successfully.');
      setDeleteId(null);
      fetchUsers();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || 'Failed to delete target user account.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">User Management</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">Create platform profiles, assign compliance roles, and sync active settings</p>
        </div>
        
        <button
          onClick={handleOpenAdd}
          id="admin-create-user-btn"
          className="flex items-center space-x-2 px-5 py-2.5 bg-primary-800 dark:bg-emerald-950 text-white dark:text-primary-neon border border-transparent dark:border-borderDark rounded-2xl text-xs font-bold shadow-soft dark:shadow-neon hover-scale"
        >
          <Plus size={14} />
          <span>Add User Account</span>
        </button>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-primary-neon text-xs rounded-2xl flex items-center space-x-2 animate-fade-in">
          <CheckCircle size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 text-xs rounded-2xl flex items-center space-x-2 animate-fade-in">
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Users Grid Table */}
      <div className="bg-white dark:bg-cardDark border border-borderLight dark:border-borderDark rounded-3xl shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-bgDark/40 border-b border-borderLight dark:border-borderDark text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-wider">
                <th className="px-6 py-4.5">Full Name</th>
                <th className="px-6 py-4.5">Email Address</th>
                <th className="px-6 py-4.5">Platform Role</th>
                <th className="px-6 py-4.5">Organization</th>
                <th className="px-6 py-4.5">Status</th>
                <th className="px-6 py-4.5">Registered</th>
                <th className="px-6 py-4.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderLight dark:divide-borderDark text-xs font-medium">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                    <div className="flex items-center justify-center space-x-2">
                      <RefreshCw size={16} className="animate-spin text-primary-neon shadow-neon" />
                      <span>Syncing platform directories...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                    No active user credentials registered.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-bgDark/20 transition-colors">
                    <td className="px-6 py-4.5 font-bold text-slate-900 dark:text-white flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-bgDark text-slate-600 dark:text-slate-300 font-bold text-xs uppercase flex items-center justify-center border border-borderLight dark:border-borderDark">
                        {u.full_name?.charAt(0) || 'U'}
                      </div>
                      <span>{u.full_name}</span>
                    </td>
                    <td className="px-6 py-4.5 text-slate-600 dark:text-slate-400">{u.email}</td>
                    <td className="px-6 py-4.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 dark:bg-bgDark/50 text-slate-800 dark:text-white border border-borderLight dark:border-borderDark">
                        {u.role.name}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 text-slate-500 font-semibold">{u.organization?.name || 'N/A'}</td>
                    <td className="px-6 py-4.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                        u.is_active 
                          ? 'bg-green-500/10 text-primary-neon border-green-500/20 shadow-neon' 
                          : 'bg-red-500/10 text-red-500 border-red-500/20'
                      }`}>
                        {u.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 text-slate-400 font-medium">
                      {new Date(u.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4.5 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => handleOpenEdit(u)}
                          title="Modify Account"
                          className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
                        >
                          <Edit size={14} />
                        </button>
                        
                        {currentUser?.id !== u.id ? (
                          <button 
                            onClick={() => setDeleteId(u.id)}
                            title="Terminate Account"
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl"
                          >
                            <Trash2 size={14} />
                          </button>
                        ) : (
                          <span className="p-1.5 text-[9px] font-bold text-slate-400 uppercase">Self</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete User Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm px-6">
          <div className="w-full max-w-sm p-6 bg-white dark:bg-cardDark border border-borderLight dark:border-borderDark rounded-3xl shadow-xl animate-fade-in text-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Delete User Account</h3>
            <p className="text-slate-500 dark:text-slate-400 leading-normal mb-4 font-medium">
              Are you sure you want to permanently delete this user account? The action will terminate credentials immediately.
            </p>
            <div className="flex space-x-3 justify-end font-bold">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 border border-borderLight dark:border-borderDark rounded-xl hover:bg-slate-50 dark:hover:bg-bgDark"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-xl shadow-soft"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal Add/Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm px-6">
          <div className="w-full max-w-md p-6 bg-white dark:bg-cardDark border border-borderLight dark:border-borderDark rounded-3xl shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center pb-3 border-b border-borderLight dark:border-borderDark mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {editUser ? `Modify Account: ${editUser.full_name}` : 'Register New User Profile'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 text-slate-400" size={14} />
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-bgDark border border-borderLight dark:border-borderDark rounded-xl"
                    {...register('full_name', { required: true })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-slate-400" size={14} />
                  <input
                    type="email"
                    required
                    placeholder="e.g. user@company.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-bgDark border border-borderLight dark:border-borderDark rounded-xl"
                    {...register('email', { required: true })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  {editUser ? 'Change Password (leave blank to retain current)' : 'Password'}
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 text-slate-400" size={14} />
                  <input
                    type="password"
                    placeholder={editUser ? 'New password...' : 'Account password...'}
                    required={!editUser}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-bgDark border border-borderLight dark:border-borderDark rounded-xl"
                    {...register('password', { required: !editUser })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">System Role</label>
                  <select
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-bgDark border border-borderLight dark:border-borderDark rounded-xl"
                    {...register('role_name')}
                  >
                    <option value="Recycling Facility Operator">Recycling Facility Operator</option>
                    <option value="Sustainability Manager">Sustainability Manager</option>
                    <option value="Textile Manufacturer">Textile Manufacturer</option>
                    <option value="Administrator">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Organization Unit</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 text-slate-400" size={14} />
                    <input
                      type="text"
                      placeholder="Company/Facility name"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-bgDark border border-borderLight dark:border-borderDark rounded-xl"
                      {...register('organization_name')}
                    />
                  </div>
                </div>
              </div>

              {editUser && (
                <div className="flex items-center space-x-2 py-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    className="w-4 h-4 rounded text-primary-800 focus:ring-primary-800"
                    {...register('is_active')}
                  />
                  <label htmlFor="is_active" className="text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                    Account is Active
                  </label>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-3 font-bold">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-borderLight dark:border-borderDark rounded-xl hover:bg-slate-50 dark:hover:bg-bgDark"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary-800 hover:bg-primary-900 text-white rounded-xl shadow-soft"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
