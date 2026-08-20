import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, ChevronDown, UserCircle, Settings, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { notificationService } from '../services/notificationService';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [search, setSearch] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const initials = user?.name
  ? user.name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('')
  : 'U';
  const unreadCount = notifications.filter((item) => !item.read).length;

  const formatTimeAgo = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hr${diffHours !== 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  };

  const loadNotifications = async () => {
    setIsLoadingNotifications(true);
    try {
      const res = await notificationService.list();
      if (res?.success) {
        setNotifications(res.notifications || []);
      }
    } catch (error) {
      console.warn('Unable to load notifications', error);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  const markNotificationRead = async (notification) => {
    if (notification.read) return;
    try {
      await notificationService.markRead(notification.id);
      setNotifications((prev) => prev.map((item) => (item.id === notification.id ? { ...item, read: true } : item)));
    } catch (error) {
      console.warn('Unable to mark notification read', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    } catch (error) {
      console.warn('Unable to mark all notifications read', error);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/inventory?search=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-forest-100 bg-white/90 px-4 backdrop-blur sm:px-6">
      <div className="flex flex-1 items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-ink/60 hover:bg-forest-50 lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>
        <form onSubmit={handleSearchSubmit} className="hidden max-w-sm flex-1 sm:block">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="text"
              placeholder="Search batch ID, source, color…"
              className="w-full rounded-lg border border-forest-100 bg-forest-50/40 py-2 pl-9 pr-3 text-sm placeholder:text-ink/40 focus:border-forest-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest-100"
            />
          </div>
        </form>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications((v) => !v);
              setShowProfileMenu(false);
            }}
            className="relative rounded-lg p-2 text-ink/60 hover:bg-forest-50"
            aria-label="View notifications"
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-ledger-500 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-forest-100 bg-white p-2 shadow-soft">
              <div className="flex items-center justify-between px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink/40">Notifications</p>
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-2xs text-forest-600 hover:text-forest-800"
                >
                  Mark all read
                </button>
              </div>
              <div className="space-y-1">
                {isLoadingNotifications ? (
                  <div className="px-3 py-4 text-sm text-ink/50">Loading notifications…</div>
                ) : notifications.length === 0 ? (
                  <div className="px-3 py-4 text-sm text-ink/50">No notifications yet.</div>
                ) : (
                  notifications.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => markNotificationRead(notification)}
                      className={`w-full text-left rounded-xl px-3 py-3 hover:bg-forest-50/80 ${notification.read ? 'bg-slate-50' : 'bg-emerald-50/10'}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                            <CheckCircle2 size={14} className="text-forest-600" />
                            {notification.title}
                          </div>
                          <p className="text-sm text-ink/80">{notification.message}</p>
                        </div>
                        <span className="text-2xs text-ink/40">{formatTimeAgo(notification.created_at)}</span>
                      </div>
                      <p className="mt-2 text-2xs uppercase tracking-wide text-forest-500">{notification.type}</p>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu((v) => !v);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 rounded-lg p-1.5 pr-2 hover:bg-forest-50"
          >
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: user?.avatarColor || '#1F7A54' }}
            >
              {initials || 'U'}

            </div>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold leading-tight text-ink">{user?.name}</p>
              <p className="text-xs leading-tight text-ink/50">{user?.role}</p>
            </div>
            <ChevronDown size={15} className="text-ink/40" />
          </button>
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-52 rounded-xl border border-forest-100 bg-white p-1.5 shadow-soft">
              <button
                onClick={() => {
                  navigate('/profile');
                  setShowProfileMenu(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink/70 hover:bg-forest-50"
              >
                <UserCircle size={16} /> View Profile
              </button>
              <button
                onClick={() => {
                  navigate('/settings');
                  setShowProfileMenu(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink/70 hover:bg-forest-50"
              >
                <Settings size={16} /> Settings
              </button>
              <button
                onClick={logout}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
