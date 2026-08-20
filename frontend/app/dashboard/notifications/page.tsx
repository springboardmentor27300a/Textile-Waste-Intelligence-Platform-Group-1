"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, CheckCheck, AlertTriangle, CheckCircle, Info, Trophy, X } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";

const DEMO_NOTIFS = [
  { id: 1, title: "Waste Collection Alert", message: "New batch TW-ABC123 collected from Factory A — 250 kg of Cotton waste ready for processing.", type: "warning", is_read: false, created_at: "2026-07-09T14:30:00Z" },
  { id: 2, title: "Recycling Opportunity", message: "Cotton batch TW-XYZ789 is ready for fiber recycling — 92% AI confidence rating. Estimated recovery rate: 87%.", type: "success", is_read: false, created_at: "2026-07-09T12:00:00Z" },
  { id: 3, title: "Low Inventory Alert", message: "Denim waste stock is below the minimum threshold (50 kg). Consider scheduling a new collection.", type: "error", is_read: false, created_at: "2026-07-09T10:15:00Z" },
  { id: 4, title: "Sustainability Achievement 🎉", message: "Platform has reached 1,000 kg of recycled textile this month! You have prevented 4.2 tonnes of CO₂ emissions.", type: "success", is_read: true, created_at: "2026-07-08T18:45:00Z" },
  { id: 5, title: "Admin Notification", message: "New user registered: Rahul Verma (Textile Manufacturer) — joined EcoTextile India workspace.", type: "info", is_read: true, created_at: "2026-07-08T10:00:00Z" },
  { id: 6, title: "AI Analysis Complete", message: "Image analysis complete for TW-DEF456 — Polyester detected with 94.2% confidence. Suggested: Recyclable.", type: "info", is_read: true, created_at: "2026-07-07T15:30:00Z" },
  { id: 7, title: "Monthly Report Ready", message: "Your July 2026 sustainability report has been generated. CO₂ saved: 8.3 tonnes this month.", type: "info", is_read: true, created_at: "2026-07-07T09:00:00Z" },
];

const typeConfig: Record<string, { icon: any, color: string, bg: string, badge: string }> = {
  warning: { icon: AlertTriangle, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", badge: "badge-yellow" },
  success: { icon: Trophy, color: "text-primary-400", bg: "bg-primary-500/10 border-primary-500/20", badge: "badge-green" },
  error: { icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", badge: "badge-red" },
  info: { icon: Info, color: "text-secondary-400", bg: "bg-secondary-500/10 border-secondary-500/20", badge: "badge-blue" },
  achievement: { icon: Trophy, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20", badge: "badge-purple" },
};

function timeAgo(dateStr: string) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 1) return "Just now";
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState(DEMO_NOTIFS);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    api.get("/notifications/").then(res => {
      if (res.data?.length) setNotifs(res.data);
    }).catch(() => {});
  }, []);

  const markRead = async (id: number) => {
    setNotifs(n => n.map(x => x.id === id ? { ...x, is_read: true } : x));
    try { await api.post(`/notifications/${id}/read`); } catch {}
  };

  const markAllRead = async () => {
    setNotifs(n => n.map(x => ({ ...x, is_read: true })));
    try { await api.post("/notifications/mark-all-read"); } catch {}
    toast.success("All notifications marked as read");
  };

  const filtered = filter === "unread" ? notifs.filter(n => !n.is_read) : notifs;
  const unreadCount = notifs.filter(n => !n.is_read).length;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Notifications</h1>
          <p className="text-gray-400 text-sm mt-1">{unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={markAllRead} className="btn-outline text-sm py-2 flex items-center gap-2">
          <CheckCheck className="w-4 h-4" /> Mark All Read
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(["all","unread"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all
              ${filter === f ? "bg-primary-500 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}>
            {f} {f === "unread" && unreadCount > 0 && <span className="ml-1 bg-white/20 px-1.5 rounded-full">{unreadCount}</span>}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="glass-card p-16 text-center">
            <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No {filter === "unread" ? "unread " : ""}notifications</p>
          </div>
        ) : (
          filtered.map((notif, i) => {
            const cfg = typeConfig[notif.type] || typeConfig.info;
            const Icon = cfg.icon;
            return (
              <motion.div key={notif.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className={`glass-card p-5 border ${cfg.bg} ${!notif.is_read ? "ring-1 ring-primary-500/20" : ""} hover:border-opacity-50 transition-all relative`}>
                {!notif.is_read && <div className="absolute top-5 right-5 w-2.5 h-2.5 bg-primary-500 rounded-full" />}
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl border ${cfg.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <Icon className={`w-5 h-5 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className={`font-semibold ${notif.is_read ? "text-gray-300" : "text-white"}`}>{notif.title}</h3>
                      <span className="text-xs text-gray-500 flex-shrink-0">{timeAgo(notif.created_at)}</span>
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed">{notif.message}</p>
                    {!notif.is_read && (
                      <button onClick={() => markRead(notif.id)}
                        className="mt-2 text-xs text-primary-400 hover:text-primary-300 font-medium">
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
