import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth, ROLE_LABELS, ROLE_COLORS } from "../context/AuthContext";

export default function Team() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  function load() {
    setLoading(true);
    api.listUsers()
      .then(setUsers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleToggleStatus(u) {
    setBusyId(u.id);
    setError("");
    try {
      const updated = await api.toggleUserStatus(u.id, !u.is_active);
      setUsers((prev) => prev.map((x) => (x.id === u.id ? updated : x)));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(u) {
    if (!confirm(`Delete ${u.full_name}'s account? This can't be undone.`)) return;
    setBusyId(u.id);
    setError("");
    try {
      await api.deleteUser(u.id);
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Team Access & User Management</h1>
        <p className="text-sm text-slate-400">View and manage registered user accounts and role assignments.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-slate-400 text-sm">Loading team users...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {users.map((u) => {
            const isSelf = u.id === currentUser?.id;
            const roleColor = ROLE_COLORS[u.role] || "#10B981";
            return (
              <div
                key={u.id}
                className="glass-card rounded-2xl border border-slate-800 p-5 flex flex-col justify-between"
                style={{ borderTopColor: roleColor, borderTopWidth: "3px" }}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-white text-base truncate">
                        {u.full_name} {isSelf && <span className="text-xs text-slate-400 font-normal">(you)</span>}
                      </p>
                      <p className="text-xs text-slate-400 truncate">{u.email}</p>
                    </div>
                    <span
                      className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        u.is_active ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-800 text-slate-500"
                      }`}
                    >
                      {u.is_active ? "Active" : "Deactivated"}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-3">{u.organization || "No organization set"}</p>

                  <div className="mt-2">
                    <span
                      className="inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: roleColor }}
                    >
                      {ROLE_LABELS[u.role] || u.role}
                    </span>
                  </div>
                </div>

                {!isSelf && (
                  <div className="border-t border-slate-800 pt-3 mt-4 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleToggleStatus(u)}
                      disabled={busyId === u.id}
                      className="text-xs font-medium text-slate-300 hover:text-white disabled:opacity-50"
                    >
                      {u.is_active ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => handleDelete(u)}
                      disabled={busyId === u.id}
                      className="text-xs font-medium text-rose-400 hover:text-rose-300 disabled:opacity-50"
                    >
                      Delete Account
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
