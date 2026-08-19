import {
  Bell,
  ChevronDown,
  LogOut,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

export default function Topbar() {
  const { user, logout } = useAuth();

  const initials = user?.full_name
    ?.split(" ")
    .map((name) => name[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="topbar">
      <div>
        <p className="topbar-context">
          Textile Circularity Intelligence
        </p>
      </div>

      <div className="topbar-actions">
        <button
          className="topbar-icon-button"
          aria-label="Notifications"
        >
          <Bell size={19} />
          <span className="notification-indicator" />
        </button>

        <div className="topbar-user">
          <div className="user-avatar">
            {initials || "U"}
          </div>

          <div className="user-information">
            <strong>{user?.full_name}</strong>
            <span>
              {user?.role || "Platform User"}
            </span>
          </div>

          <ChevronDown size={16} />
        </div>

        <button
          className="logout-button"
          onClick={logout}
          title="Sign out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}