"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, BarChart3, Shield, Activity, ToggleLeft, ToggleRight } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const DEMO_USERS = [
  { id: 1, full_name: "Admin User", email: "admin@textile.com", role: "admin", is_active: true, company: "Textile Waste Solutions", created_at: "2026-07-09T10:00:00Z" },
  { id: 2, full_name: "Priya Sharma", email: "priya@textile.com", role: "sustainability_manager", is_active: true, company: "EcoTextile India", created_at: "2026-07-09T10:00:00Z" },
  { id: 3, full_name: "Rahul Verma", email: "rahul@textile.com", role: "textile_manufacturer", is_active: true, company: "EcoTextile India", created_at: "2026-07-09T10:00:00Z" },
  { id: 4, full_name: "Anita Singh", email: "anita@textile.com", role: "recycling_facility_operator", is_active: true, company: "EcoTextile India", created_at: "2026-07-09T10:00:00Z" },
];

const roleBadge: Record<string, string> = {
  admin: "badge-red", sustainability_manager: "badge-green",
  textile_manufacturer: "badge-blue", recycling_facility_operator: "badge-purple"
};

export default function AdminPage() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState(DEMO_USERS);
  const [analytics, setAnalytics] = useState({ total_users: 4, total_inventory: 25, total_ai_requests: 23, system_uptime_pct: 99.7, storage_used_gb: 3.4, api_requests_today: 847 });
  const [activeTab, setActiveTab] = useState<"users" | "analytics">("users");

  useEffect(() => {
    if (!isAdmin) { router.push("/dashboard"); return; }
    api.get("/admin/users").then(r => { if (r.data?.length) setUsers(r.data); }).catch(() => {});
    api.get("/admin/analytics").then(r => { if (r.data) setAnalytics(r.data); }).catch(() => {});
  }, [isAdmin, router]);

  const toggleUser = async (id: number) => {
    setUsers(us => us.map(u => u.id === id ? { ...u, is_active: !u.is_active } : u));
    try { await api.put(`/admin/users/${id}/toggle`); toast.success("User status updated"); }
    catch { toast.error("Error updating user"); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Admin Panel</h1>
        <p className="text-gray-400 text-sm mt-1">Manage users, roles, and system analytics</p>
      </div>

      {/* System Analytics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "Total Users", value: analytics.total_users, icon: Users, color: "from-primary-500 to-primary-700" },
          { label: "Inventory Batches", value: analytics.total_inventory, icon: BarChart3, color: "from-secondary-500 to-secondary-700" },
          { label: "AI Requests", value: analytics.total_ai_requests, icon: Activity, color: "from-purple-500 to-purple-700" },
          { label: "System Uptime%", value: `${analytics.system_uptime_pct}%`, icon: Activity, color: "from-teal-500 to-teal-700" },
          { label: "Storage Used", value: `${analytics.storage_used_gb} GB`, icon: Shield, color: "from-orange-500 to-orange-700" },
          { label: "API Calls Today", value: analytics.api_requests_today, icon: Activity, color: "from-pink-500 to-pink-700" },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }} className="stat-card">
            <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-black text-white">{stat.value}</p>
            <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Users Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h3 className="font-bold text-white">User Management</h3>
          <p className="text-sm text-gray-400">{users.length} registered users</p>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr><th>User</th><th>Email</th><th>Role</th><th>Company</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.07 }}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {user.full_name.charAt(0)}
                      </div>
                      <span className="font-medium text-white">{user.full_name}</span>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td><span className={`${roleBadge[user.role] || "badge"} capitalize text-xs`}>{user.role.replace(/_/g," ")}</span></td>
                  <td>{user.company || "—"}</td>
                  <td><span className={user.is_active ? "badge-green" : "badge-red"}>{user.is_active ? "Active" : "Inactive"}</span></td>
                  <td className="text-xs">{user.created_at?.split("T")[0]}</td>
                  <td>
                    <button onClick={() => toggleUser(user.id)}
                      className={`flex items-center gap-1 text-xs font-medium transition-colors
                        ${user.is_active ? "text-red-400 hover:text-red-300" : "text-primary-400 hover:text-primary-300"}`}>
                      {user.is_active ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
                      {user.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
