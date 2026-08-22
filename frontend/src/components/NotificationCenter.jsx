import { useState, useEffect } from "react";
import { api } from "../api/client";

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const data = await api.listNotifications();
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.is_read).length);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case "collection_alert":
        return { label: "Collection Alert", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" };
      case "recycling_opportunity":
        return { label: "Recycling Opportunity", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" };
      case "sustainability_milestone":
        return { label: "Milestone", color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" };
      case "inventory_warning":
        return { label: "Warning", color: "bg-rose-500/20 text-rose-300 border-rose-500/30" };
      default:
        return { label: "Announcement", color: "bg-purple-500/20 text-purple-300 border-purple-500/30" };
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition"
        title="Notifications & Alerts"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white ring-2 ring-slate-900">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-96 max-w-[90vw] glass-card rounded-2xl shadow-2xl p-4 z-50 border border-slate-700/60 bg-slate-900/95">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <h3 className="font-semibold text-white flex items-center gap-2">
              Notifications & Alerts
              {unreadCount > 0 && (
                <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-normal">
                  {unreadCount} unread
                </span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-emerald-400 hover:underline font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1">
            {notifications.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">No notifications</p>
            ) : (
              notifications.map((n) => {
                const badge = getTypeBadge(n.type);
                return (
                  <div
                    key={n.id}
                    onClick={() => !n.is_read && handleMarkRead(n.id)}
                    className={`p-3 rounded-xl border text-sm transition cursor-pointer ${
                      n.is_read
                        ? "bg-slate-800/40 border-slate-800 opacity-75"
                        : "bg-slate-800/90 border-slate-700 hover:border-emerald-500/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${badge.color}`}>
                        {badge.label}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(n.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="font-semibold text-slate-100 text-xs mt-1">{n.title}</p>
                    <p className="text-slate-300 text-xs mt-0.5 leading-snug">{n.message}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
