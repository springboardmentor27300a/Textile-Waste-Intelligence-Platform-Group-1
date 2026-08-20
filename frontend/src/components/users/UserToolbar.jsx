import {
  Search,
//  Filter,
  Plus,
  Shield,
  RefreshCw,
} from "lucide-react";

function UserToolbar({
  search,
  role,
  onSearchChange,
  onRoleChange,
  onAddUser,
  onRefresh,
  loading,
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-card">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-4 lg:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              type="text"
              placeholder="Search by name or email..."
              className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="relative">
            <Shield
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <select
              value={role}
              onChange={(e) => onRoleChange(e.target.value)}
              className="h-12 min-w-[200px] rounded-xl border border-slate-200 bg-white pl-11 pr-8 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option>All Roles</option>
              <option>Administrator</option>
              <option>Manager</option>
              <option>Manufacturer</option>
              <option>Recycler</option>
              <option>Operator</option>
            </select>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-medium transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        <button
          onClick={onAddUser}
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 font-semibold text-white transition hover:opacity-90"
        >
          <Plus size={18} />
          Add User
        </button>
      </div>
    </div>
  );
}

export default UserToolbar;