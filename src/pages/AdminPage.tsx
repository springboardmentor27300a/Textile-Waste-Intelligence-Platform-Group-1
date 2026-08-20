import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Users, Server, Database, Download, 
  Activity, CheckCircle2, UserCheck, UserX 
} from 'lucide-react';
import { api } from '../services/api';

interface AdminPageProps {
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onToast }) => {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [sData, uData] = await Promise.all([
        api.getAdminStats(),
        api.getUsers()
      ]);
      setStats(sData);
      setUsers(uData);
    } catch (err) {
      onToast('Error loading admin management panel', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDatabase = async () => {
    try {
      onToast('Exporting live database (db.json)...', 'info');
      await api.downloadDatabaseBackup();
      onToast('Database JSON backup downloaded successfully!', 'success');
    } catch (err) {
      onToast('Failed to export database', 'error');
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await api.updateUserRole(userId, newRole);
      onToast('User role updated successfully', 'success');
      loadAdminData();
    } catch (err) {
      onToast('Failed to update user role', 'error');
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await api.updateUserStatus(userId, nextStatus);
      onToast(`User status set to ${nextStatus}`, 'success');
      loadAdminData();
    } catch (err) {
      onToast('Failed to update status', 'error');
    }
  };

  if (loading) return <div className="p-12 text-center text-xs font-mono text-slate-400">Loading admin panel...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* HEADER */}
      <div className="border-b border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-amber-400" />
            <span>Platform Administration</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            User access control, role assignments, system status, and live database management
          </p>
        </div>
        <button
          onClick={handleDownloadDatabase}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Database className="w-4 h-4" />
          <Download className="w-3.5 h-3.5" />
          <span>Download Raw Database (db.json)</span>
        </button>
      </div>

      {/* SYSTEM STATS */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
            <span className="text-xs font-mono text-slate-400 uppercase">Total Users</span>
            <div className="text-2xl font-bold text-slate-100 font-mono mt-1">{stats.totalUsers}</div>
          </div>
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
            <span className="text-xs font-mono text-slate-400 uppercase">Total Analyses</span>
            <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">{stats.totalAnalyses}</div>
          </div>
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
            <span className="text-xs font-mono text-slate-400 uppercase">Total Batches</span>
            <div className="text-2xl font-bold text-teal-400 font-mono mt-1">{stats.totalBatches}</div>
          </div>
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
            <span className="text-xs font-mono text-slate-400 uppercase">System Status</span>
            <div className="text-xs font-bold text-emerald-400 font-mono mt-2">{stats.systemStatus}</div>
          </div>
        </div>
      )}

      {/* USER MANAGEMENT TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <h2 className="font-bold text-slate-100 text-sm">Platform User Management</h2>
          <span className="text-xs text-slate-400 font-mono">{users.length} Users Registered</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[11px] font-mono uppercase bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-100 flex items-center gap-2">
                    <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-700" />
                    <span>{u.name}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">{u.email}</td>
                  <td className="py-3.5 px-4 text-slate-400">{u.department}</td>
                  <td className="py-3.5 px-4">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2 py-1 font-mono"
                    >
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="analyst">Analyst</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                      u.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">{u.joinedDate}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleStatusToggle(u.id, u.status)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${
                        u.status === 'active'
                          ? 'border-rose-500/30 text-rose-400 hover:bg-rose-500/10'
                          : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                      }`}
                    >
                      {u.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
