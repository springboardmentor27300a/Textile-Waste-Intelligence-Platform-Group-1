import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Boxes, User, BarChart3, Leaf, Database, Camera, TrendingUp, BookOpen, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../services/api';

const Sidebar = () => {
  const { user } = useAuth();

  const getFilteredLinks = () => {
    const role = user?.role?.name;
    const baseLinks = [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/inventory', label: 'Inventory', icon: Boxes },
    ];

    if (role === 'Administrator' || role === 'Recycling Facility Operator' || role === 'Textile Manufacturer') {
      baseLinks.push({ to: '/classify', label: 'AI Classifier', icon: Camera });
    }

    if (role === 'Administrator' || role === 'Sustainability Manager') {
      baseLinks.push({ to: '/sustainability', label: 'Sustainability', icon: TrendingUp });
    }

    baseLinks.push({ to: '/datasets', label: 'Dataset Catalog', icon: Database });
    baseLinks.push({ to: '/calculator', label: 'Impact Calculator', icon: Leaf });
    
    if (role === 'Administrator') {
      baseLinks.push({ to: `${API_BASE_URL}/docs`, label: 'API Swagger Docs', icon: BookOpen, external: true });
      baseLinks.push({ to: '/admin/users', label: 'User Management', icon: Users });
    }

    baseLinks.push({ to: '/profile', label: 'My Profile', icon: User });

    return baseLinks;
  };

  const activeLinks = getFilteredLinks();

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col h-[calc(100vh-4rem)] sticky top-16">
      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 px-4 py-6">
        {activeLinks.map((link) => {
          const Icon = link.icon;
          if (link.external) {
            return (
              <a
                key={link.to}
                href={link.to}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-4 border-transparent"
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span>{link.label}</span>
              </a>
            );
          }
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 shadow-sm border-l-4 border-primary-600 pl-3'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-4 border-transparent'
                }`
              }
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Sustainability Tip/Stats Footer inside Sidebar */}
      <div className="p-4 m-4 rounded-2xl bg-gradient-to-br from-primary-900 to-emerald-950 text-white shadow-md">
        <div className="flex items-center space-x-2 text-primary-300 mb-2">
          <Leaf className="h-4 w-4 text-primary-400" />
          <span className="text-xs font-bold uppercase tracking-wider">TWIP Hub</span>
        </div>
        <p className="text-xs text-primary-100 font-medium">
          Tracking waste records, locations, and roles helps establish the foundation for circular fabric reuse.
        </p>
        <div className="mt-3 flex items-center justify-between text-[10px] text-primary-300 font-semibold border-t border-primary-800/50 pt-2">
          <span>Active Role:</span>
          <span className="text-white">{user?.role?.name || 'Loading'}</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
