import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Leaf, Home, ClipboardList, Database, User as UserIcon, Settings, LogOut, 
  Menu, X, Bell, Moon, Sun, ChevronDown, Search, ArrowRight, UserCircle, Users,
  Brain, History, FileText, Compass, Wrench, Activity, BarChart2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout({ children }) {
  const { user, logout, darkMode, toggleDarkMode } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Sample Notifications
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New batch registered', text: 'Batch WB-2026-0004 submitted by Apex Textiles.', time: '5m ago', read: false },
    { id: 2, title: 'Sorting completed', text: 'Batch WB-2026-0001 status changed to Sorted.', time: '1h ago', read: false },
    { id: 3, title: 'System database backed up', text: 'PostgreSQL transaction tables backed up successfully.', time: '12h ago', read: true }
  ]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleGlobalSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/inventory?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const activeLink = (path) => {
    const isActive = location.pathname === path;
    if (isActive) {
      return 'bg-primary-950/50 dark:bg-emerald-950/20 text-slate-900 dark:text-primary-neon border-l-4 border-primary-800 dark:border-primary-neon font-semibold shadow-neon';
    }
    return 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-cardDark/50 hover:text-slate-900 dark:hover:text-white border-l-4 border-transparent';
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-bgLight dark:bg-bgDark text-slate-800 dark:text-slate-200 flex transition-colors duration-200">
      
      {/* Sidebar Navigation */}
      <aside 
        id="dashboard-sidebar"
        className={`fixed inset-y-0 left-0 z-45 w-64 bg-white dark:bg-cardDark border-r border-borderLight dark:border-borderDark transform transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-borderLight dark:border-borderDark">
          <Link to="/" className="flex items-center space-x-3">
            <div className="p-2 bg-primary-800 dark:bg-emerald-950 text-primary-neon rounded-2xl shadow-neon">
              <Leaf size={18} />
            </div>
            <span className="text-lg font-bold tracking-tight text-primary-800 dark:text-white">
              Weave<span className="text-primary-500 dark:text-primary-neon">Cycle</span>
            </span>
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          <Link to="/dashboard" id="sidebar-dashboard-link" className={`flex items-center space-x-3 px-4 py-3 rounded-r-2xl text-xs transition-all ${activeLink('/dashboard')}`}>
            <Home size={16} />
            <span>Dashboard</span>
          </Link>
          
          {/* Textile Inventory visible to Admin, Operator, and Manufacturer */}
          {user && ['Administrator', 'Recycling Facility Operator', 'Textile Manufacturer'].includes(user.role.name) && (
            <Link to="/inventory" id="sidebar-inventory-link" className={`flex items-center space-x-3 px-4 py-3 rounded-r-2xl text-xs transition-all ${activeLink('/inventory')}`}>
              <ClipboardList size={16} />
              <span>Textile Inventory</span>
            </Link>
          )}
          
          {/* AI Datasets visible only to Administrator */}
          {user?.role?.name === 'Administrator' && (
            <Link to="/datasets" id="sidebar-datasets-link" className={`flex items-center space-x-3 px-4 py-3 rounded-r-2xl text-xs transition-all ${activeLink('/datasets')}`}>
              <Database size={16} />
              <span>AI Datasets</span>
            </Link>
          )}

          {/* ── Milestone 2: AI Intelligence ── */}
          <div className="px-4 pt-4 pb-1">
            <p className="text-[8px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest">AI Intelligence</p>
          </div>

          <Link to="/ai-dashboard" id="sidebar-ai-dashboard-link" className={`flex items-center space-x-3 px-4 py-3 rounded-r-2xl text-xs transition-all ${activeLink('/ai-dashboard')}`}>
            <BarChart2 size={16} />
            <span>AI Dashboard</span>
          </Link>

          <Link to="/analysis" id="sidebar-analysis-link" className={`flex items-center space-x-3 px-4 py-3 rounded-r-2xl text-xs transition-all ${activeLink('/analysis')}`}>
            <Brain size={16} />
            <span>AI Analysis</span>
          </Link>

          <Link to="/predictions" id="sidebar-predictions-link" className={`flex items-center space-x-3 px-4 py-3 rounded-r-2xl text-xs transition-all ${activeLink('/predictions')}`}>
            <History size={16} />
            <span>Predictions</span>
          </Link>

          <Link to="/reports" id="sidebar-reports-link" className={`flex items-center space-x-3 px-4 py-3 rounded-r-2xl text-xs transition-all ${activeLink('/reports')}`}>
            <FileText size={16} />
            <span>Reports</span>
          </Link>

          {/* ── Milestone 3: Sustainability Intelligence ── */}
          <div className="px-4 pt-4 pb-1">
            <p className="text-[8px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest">Sustainability</p>
          </div>

          <Link to="/sustainability" id="sidebar-sustainability-link" className={`flex items-center space-x-3 px-4 py-3 rounded-r-2xl text-xs transition-all ${activeLink('/sustainability')}`}>
            <Leaf size={16} />
            <span>Sustainability Portal</span>
          </Link>

          <Link to="/recommendations" id="sidebar-recommendations-link" className={`flex items-center space-x-3 px-4 py-3 rounded-r-2xl text-xs transition-all ${activeLink('/recommendations')}`}>
            <Wrench size={16} />
            <span>Recommendations</span>
          </Link>

          <Link to="/environment" id="sidebar-environment-link" className={`flex items-center space-x-3 px-4 py-3 rounded-r-2xl text-xs transition-all ${activeLink('/environment')}`}>
            <Activity size={16} />
            <span>Ecological Impact</span>
          </Link>

          <Link to="/circularity" id="sidebar-circularity-link" className={`flex items-center space-x-3 px-4 py-3 rounded-r-2xl text-xs transition-all ${activeLink('/circularity')}`}>
            <Compass size={16} />
            <span>Circular Economy</span>
          </Link>

          <Link to="/sustainability/history" id="sidebar-sustain-history-link" className={`flex items-center space-x-3 px-4 py-3 rounded-r-2xl text-xs transition-all ${activeLink('/sustainability/history')}`}>
            <History size={16} />
            <span>Sustainability History</span>
          </Link>

          <div className="px-4 pt-4 pb-1">
            <p className="text-[8px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest">Account</p>
          </div>
          
          {/* User Management visible only to Administrator */}
          {user?.role?.name === 'Administrator' && (
            <Link to="/users" id="sidebar-users-link" className={`flex items-center space-x-3 px-4 py-3 rounded-r-2xl text-xs transition-all ${activeLink('/users')}`}>
              <Users size={16} />
              <span>User Management</span>
            </Link>
          )}
          
          <Link to="/profile" id="sidebar-profile-link" className={`flex items-center space-x-3 px-4 py-3 rounded-r-2xl text-xs transition-all ${activeLink('/profile')}`}>
            <UserIcon size={16} />
            <span>User Profile</span>
          </Link>
          
          <Link to="/settings" id="sidebar-settings-link" className={`flex items-center space-x-3 px-4 py-3 rounded-r-2xl text-xs transition-all ${activeLink('/settings')}`}>
            <Settings size={16} />
            <span>Settings</span>
          </Link>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-borderLight dark:border-borderDark bg-slate-50/50 dark:bg-bgDark/20 flex-shrink-0">
          <div className="flex items-center space-x-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-primary-800 dark:bg-emerald-950 text-primary-neon font-bold text-xs uppercase flex items-center justify-center border border-borderLight dark:border-borderDark shadow-neon">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold truncate text-slate-800 dark:text-white leading-tight">{user?.full_name}</p>
              <p className="text-[9px] text-slate-400 truncate mt-0.5">{user?.role?.name}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            id="sidebar-logout-btn"
            className="w-full flex items-center space-x-3 px-4 py-2.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors font-medium"
          >
            <LogOut size={14} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-300">
        
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-20 bg-white/80 dark:bg-bgDark/80 backdrop-blur-md border-b border-borderLight dark:border-borderDark flex items-center justify-between px-8 shadow-soft">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-cardDark rounded-xl"
            >
              <Menu size={20} />
            </button>
            
            {/* Header Search Box - Pill Shaped */}
            <form onSubmit={handleGlobalSearch} className="hidden md:flex items-center relative">
              <Search className="absolute left-4 text-slate-400 dark:text-slate-500" size={14} />
              <input
                type="text"
                placeholder="Search database batches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-72 pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-cardDark border border-borderLight dark:border-borderDark rounded-full outline-none text-xs focus:bg-white dark:focus:bg-bgDark focus:ring-2 focus:ring-primary-100 dark:focus:ring-emerald-950/30"
              />
            </form>
          </div>

          <div className="flex items-center space-x-4">
            {/* Dark Mode Switcher */}
            <button
              onClick={toggleDarkMode}
              id="header-theme-toggle"
              className="p-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-cardDark border border-borderLight dark:border-borderDark rounded-full transition-all hover-scale"
              title="Toggle Light/Dark Theme"
            >
              {darkMode ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Notifications Popover */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                id="header-notifications-btn"
                className="p-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-cardDark border border-borderLight dark:border-borderDark rounded-full transition-all hover-scale relative"
              >
                <Bell size={15} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-primary-neon rounded-full shadow-neon"></span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-cardDark border border-borderLight dark:border-borderDark rounded-3xl shadow-xl py-4 z-50 animate-fade-in">
                  <div className="px-4 pb-2.5 border-b border-borderLight dark:border-borderDark flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Recent Alerts</span>
                    {unreadCount > 0 && (
                      <span className="text-[9px] bg-primary-100 dark:bg-emerald-950 text-primary-800 dark:text-primary-neon px-2 py-0.5 rounded-full font-bold shadow-neon">
                        {unreadCount} Active
                      </span>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto mt-2">
                    {notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={`px-4 py-3 hover:bg-slate-50 dark:hover:bg-bgDark/20 cursor-pointer flex flex-col ${
                          !n.read ? 'bg-primary-50/20 dark:bg-emerald-950/10' : ''
                        }`}
                      >
                        <span className="text-xs font-semibold text-slate-800 dark:text-white">{n.title}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-400 mt-1 leading-normal">{n.text}</span>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-2 font-mono">{n.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                id="header-profile-dropdown"
                className="flex items-center space-x-2.5 p-1.5 hover:bg-slate-50 dark:hover:bg-cardDark border border-borderLight dark:border-borderDark rounded-full transition-all hover-scale text-left"
              >
                <div className="w-8 h-8 rounded-full bg-primary-800 dark:bg-emerald-950 text-primary-neon font-bold text-xs uppercase flex items-center justify-center shadow-neon">
                  {user?.full_name?.charAt(0) || 'U'}
                </div>
                <span className="hidden sm:inline text-xs font-bold text-slate-800 dark:text-white">
                  {user?.full_name?.split(' ')[0]}
                </span>
                <ChevronDown size={12} className="text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-cardDark border border-borderLight dark:border-borderDark rounded-3xl shadow-xl py-3 z-50 animate-fade-in">
                  <div className="px-4 py-3 border-b border-borderLight dark:border-borderDark">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{user?.full_name}</p>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">{user?.email}</p>
                    {user?.organization && (
                      <p className="text-[9px] text-primary-600 dark:text-primary-neon font-bold truncate mt-1">
                        {user?.organization.name}
                      </p>
                    )}
                  </div>
                  
                  <Link 
                    to="/profile" 
                    className="flex items-center space-x-2.5 px-4 py-3 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-bgDark/20"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <UserIcon size={14} className="text-slate-400" />
                    <span>My Profile</span>
                  </Link>

                  <Link 
                    to="/settings" 
                    className="flex items-center space-x-2.5 px-4 py-3 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-bgDark/20"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <Settings size={14} className="text-slate-400" />
                    <span>Settings</span>
                  </Link>
                  
                  <div className="border-t border-borderLight dark:border-borderDark my-1.5"></div>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2.5 px-4 py-3 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 text-left font-medium"
                  >
                    <LogOut size={14} />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic page content wrapper */}
        <main className="flex-1 p-8 max-w-7xl mx-auto w-full animate-fade-in space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
