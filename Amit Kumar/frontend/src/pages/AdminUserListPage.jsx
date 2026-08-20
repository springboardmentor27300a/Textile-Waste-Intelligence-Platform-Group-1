import React, { useState, useEffect } from 'react';
import authService from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Key, Users, UserCheck, RefreshCw } from 'lucide-react';

const AdminUserListPage = () => {
  const { hasRole } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revealedPasswords, setRevealedPasswords] = useState({});

  const isAdmin = hasRole(['Administrator']);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await authService.getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError('Unauthorized access: Only administrators are permitted to view user credentials.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const togglePasswordReveal = (userId) => {
    setRevealedPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto mt-16 p-8 bg-white border border-slate-200 rounded-3xl text-center space-y-4 shadow-sm">
        <div className="h-16 w-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-extrabold text-slate-800">Access Restricted</h3>
        <p className="text-xs text-slate-400 font-semibold leading-relaxed">
          The requested system administration page is restricted. Only verified Administrator accounts have clearance to view this panel.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center space-x-3">
            <Users className="h-8 w-8 text-primary-600" />
            <span>User Account Management</span>
          </h1>
          <p className="text-sm text-slate-400 font-semibold mt-1">
            Access, inspect, and audit security credentials of all registered user profiles.
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="self-start flex items-center space-x-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 text-xs font-bold border border-slate-200 shadow-sm transition-all"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Reload Registry</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs font-semibold">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-24 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-400 text-sm font-semibold">Querying account registry...</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">User ID</th>
                  <th className="px-6 py-4">Full Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Phone Number</th>
                  <th className="px-6 py-4">System Role</th>
                  <th className="px-6 py-4">Password Hash (Security Audit)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/40 transition-all">
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">#UID-{u.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="h-7 w-7 bg-primary-50 rounded-full flex items-center justify-center text-primary-700 text-xs font-bold font-mono">
                          {u.full_name.charAt(0)}
                        </div>
                        <span className="text-slate-800">{u.full_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{u.email}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{u.phone_number || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        u.role === 'Administrator' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                        u.role === 'Sustainability Manager' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        u.role === 'Recycling Facility Operator' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                        'bg-slate-50 text-slate-600 border-slate-100'
                      }`}>
                        {u.role === 'Administrator' && <UserCheck className="h-3 w-3" />}
                        <span>{u.role}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => togglePasswordReveal(u.id)}
                          className="p-1 text-slate-400 hover:text-primary-600 rounded-lg hover:bg-slate-50 transition-all"
                          title="Audit Pass Hash"
                        >
                          <Key className="h-4 w-4" />
                        </button>
                        {revealedPasswords[u.id] ? (
                          <span className="font-mono text-[10px] bg-slate-50 text-slate-600 px-2.5 py-1.5 rounded-lg border border-slate-200 block break-all max-w-[280px]">
                            {u.hashed_password}
                          </span>
                        ) : (
                          <span className="font-mono text-[10px] text-slate-300 tracking-widest">
                            ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminUserListPage;
