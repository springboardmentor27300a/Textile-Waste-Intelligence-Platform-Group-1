import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { ROLE_LABELS, ROLE_COLORS } from "../../context/AuthContext";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [uData, sData] = await Promise.all([
        api.listUsers(),
        api.getInventorySummary(),
      ]);
      setUsers(uData);
      setSummary(sData);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = async (user) => {
    setBusyId(user.id);
    try {
      const updated = await api.toggleUserStatus(user.id, !user.is_active);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (user) => {
    if (!confirm(`Delete user ${user.full_name}?`)) return;
    setBusyId(user.id);
    try {
      await api.deleteUser(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading Admin Dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Administrator Dashboard</h1>
        <p className="text-sm text-slate-400">System health, platform monitoring, and user access control.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 glass-card rounded-2xl border border-slate-800">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Users</p>
          <p className="text-3xl font-bold text-white mt-2">{users.length}</p>
          <p className="text-xs text-purple-400 mt-1">Platform Accounts</p>
        </div>

        <div className="p-5 glass-card rounded-2xl border border-slate-800">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active Waste Batches</p>
          <p className="text-3xl font-bold text-emerald-400 mt-2">{summary?.total_batches || 0}</p>
          <p className="text-xs text-slate-400 mt-1">{summary?.total_quantity_kg?.toLocaleString()} kg waste</p>
        </div>

        <div className="p-5 glass-card rounded-2xl border border-slate-800">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">System Status</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xl font-bold text-white">Operational</span>
          </div>
          <p className="text-xs text-emerald-400 mt-1">FastAPI & OpenCV Vision OK</p>
        </div>

        <div className="p-5 glass-card rounded-2xl border border-slate-800">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">AI Fabric Classifier</p>
          <p className="text-3xl font-bold text-cyan-400 mt-2">v0.3.0</p>
          <p className="text-xs text-cyan-300 mt-1">Twill Denim & 10 Materials</p>
        </div>
      </div>

      {/* User Management */}
      <div className="glass-card rounded-2xl border border-slate-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Platform Users & Role Assignments</h2>
          <span className="text-xs text-slate-400">{users.length} Registered Accounts</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/60 text-slate-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Role</th>
                <th className="p-3">Organization</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.map((u) => {
                const roleColor = ROLE_COLORS[u.role] || "#10B981";
                return (
                  <tr key={u.id} className="hover:bg-slate-800/30">
                    <td className="p-3 font-medium text-white">
                      <div>{u.full_name}</div>
                      <div className="text-xs text-slate-400 font-normal">{u.email}</div>
                    </td>
                    <td className="p-3">
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-semibold text-white"
                        style={{ backgroundColor: roleColor }}
                      >
                        {ROLE_LABELS[u.role] || u.role}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">{u.organization || "—"}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          u.is_active
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-rose-500/20 text-rose-400"
                        }`}
                      >
                        {u.is_active ? "Active" : "Deactivated"}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        disabled={busyId === u.id}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50"
                      >
                        {u.is_active ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => handleDelete(u)}
                        disabled={busyId === u.id}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
