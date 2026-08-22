import { useAuth, ROLE_LABELS, ROLE_COLORS } from "../context/AuthContext";
import NotificationCenter from "./NotificationCenter";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 px-4 md:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-500/20 text-lg">
          R
        </div>
        <div>
          <span className="font-bold text-white tracking-tight text-lg">Reloom</span>
          <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Textile Waste AI
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <NotificationCenter />

        {user && (
          <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-100 leading-tight">{user.full_name}</p>
              <div className="flex items-center justify-end gap-1.5 mt-0.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: ROLE_COLORS[user.role] || "#10B981" }}
                />
                <span className="text-[11px] font-medium text-slate-400">
                  {ROLE_LABELS[user.role] || user.role}
                </span>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition"
              title="Log out"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
