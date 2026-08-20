import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Boxes,
  PackagePlus,
  BarChart3,
  UserCircle,
  Settings as SettingsIcon,
  LogOut,
  Recycle,
  Users,
  Factory,
  Building2,
  Leaf,
  Scroll,
  Sparkles,
  Brain,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ROLES } from '../constants';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/inventory', label: 'Waste Inventory', icon: Boxes },
  {
    to: '/inventory/add',
    label: 'Add Waste',
    icon: PackagePlus,
    roles: [ROLES.ADMIN, ROLES.MANUFACTURER],
  },
  { to: '/manufacturers', label: 'Manufacturers', icon: Factory },
  { to: '/facilities', label: 'Recycling Facilities', icon: Building2 },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/analytics', label: 'Sustainability Analytics', icon: Leaf },
  { to: '/users', label: 'Users', icon: Users, roles: [ROLES.ADMIN] },
  { to: '/logs', label: 'Activity Logs', icon: Scroll, roles: [ROLES.ADMIN] },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
  { to: '/profile', label: 'Profile', icon: UserCircle },
];

const Sidebar = ({ isOpen, onNavigate }) => {
  const { user, logout } = useAuth();

  const is_admin = user?.role === ROLES.ADMIN || user?.role === 'admin' || user?.role === 'Administrator';
  
  const visibleItems = [];
  if (is_admin) {
    visibleItems.push(
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/inventory', label: 'Inventory', icon: Boxes },
      { to: '/users', label: 'Users', icon: Users },
      { to: '/reports', label: 'Reports', icon: BarChart3 },
      { to: '/settings', label: 'Settings', icon: SettingsIcon }
    );
  } else {
    visibleItems.push(
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/inventory', label: 'My Inventory', icon: Boxes },
      ...(user?.role !== ROLES.SUSTAINABILITY_MANAGER ? [
        { to: '/inventory/add', label: 'Add Inventory', icon: PackagePlus }
      ] : []),
      { to: '/ai-analysis', label: 'AI Analysis', icon: Sparkles },
      { to: '/ai-dashboard', label: 'AI Dashboard', icon: Brain },
      ...(user?.role === ROLES.MANUFACTURER ? [{ to: '/manufacturer-dashboard', label: 'Manufacturer Dashboard', icon: Factory }] : []),
      ...((user?.role === ROLES.RECYCLER || user?.role === ROLES.MANUFACTURER) ? [{ to: '/recycling-dashboard', label: 'Recycling Dashboard', icon: Building2 }] : []),
      ...(user?.role === ROLES.SUSTAINABILITY_MANAGER ? [{ to: '/sustainability-dashboard', label: 'Sustainability Dashboard', icon: Leaf }] : []),
      { to: '/reports', label: 'Reports', icon: BarChart3 },
      { to: '/profile', label: 'Profile', icon: UserCircle },
      { to: '/settings', label: 'Settings', icon: SettingsIcon }
    );
  }

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-forest-100 bg-white transition-transform lg:static lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex items-center gap-2.5 border-b border-forest-100 px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-forest-500 text-white">
          <Recycle size={18} />
        </div>
        <div className="leading-tight">
          <p className="font-display text-sm font-bold text-ink">Textile Waste</p>
          <p className="text-xs font-medium text-ink/50">Intelligence Platform</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
        {visibleItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard' || to === '/inventory'}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-forest-50 text-forest-700'
                  : 'text-ink/60 hover:bg-forest-50/60 hover:text-ink'
              }`
            }
          >
            <Icon size={18} />
<span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-forest-100 p-3">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink/60 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
