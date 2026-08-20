import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Sparkles, Package, Layers, 
  Recycle, LineChart, Leaf, History, FileSpreadsheet, Presentation,
  Bell, ShieldAlert, User, Settings, LogOut, ChevronLeft, 
  ChevronRight, Search, Plus, ExternalLink, Check, X, Shield, ArrowUpRight,
  MapPin, SlidersHorizontal, Menu
} from 'lucide-react';
import { NavigationPage, UserProfile } from '../../types/client';
import { api } from '../../services/api';

interface AppShellProps {
  currentUser?: UserProfile | null;
  user?: UserProfile | null;
  currentPage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  onLogout: () => void;
  onRoleChange?: (newRole: string) => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  currentUser,
  user: legacyUser,
  currentPage,
  onNavigate,
  onLogout,
  onRoleChange,
  children
}) => {
  const activeUser = currentUser || legacyUser;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsList, setNotificationsList] = useState<any[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [facilityLocation, setFacilityLocation] = useState('Central Sorting Facility • Hub 01');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const list = await api.getNotifications();
      setNotificationsList(list);
      setUnreadCount(list.filter((n: any) => !n.read).length);
    } catch (err) {
      console.error('Error loading notifications:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotificationsList((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRoleSwitch = async (role: string) => {
    try {
      await api.switchRole(role);
      if (onRoleChange) {
        onRoleChange(role);
      }
      setShowRoleSelector(false);
      window.location.reload();
    } catch (err) {
      console.error('Failed to switch role', err);
    }
  };

  const roleLabels: Record<string, string> = {
    operator: 'Recycling Facility Operator',
    sustainability: 'Sustainability Manager',
    manufacturer: 'Textile Manufacturer',
    admin: 'Platform Administrator',
    recycler: 'Recycling Facility Operator',
    manager: 'Sustainability Manager',
    analyst: 'Textile Manufacturer'
  };

  const navCategories = [
    { id: 'dashboard' as NavigationPage, label: 'Overview', icon: LayoutDashboard },
    { id: 'analysis' as NavigationPage, label: 'AI Analysis', icon: Sparkles, highlight: true },
    { id: 'inventory' as NavigationPage, label: 'Waste Inventory', icon: Package },
    { id: 'batches' as NavigationPage, label: 'Batch Tracking', icon: Layers },
    { id: 'recommendations' as NavigationPage, label: 'Recycling Engine', icon: Recycle },
    { id: 'sustainability' as NavigationPage, label: 'Sustainability', icon: LineChart },
    { id: 'environmental' as NavigationPage, label: 'Environmental Impact', icon: Leaf },
    { id: 'history' as NavigationPage, label: 'Analysis Archive', icon: History },
    { id: 'reports' as NavigationPage, label: 'Reports & Exports', icon: FileSpreadsheet, badge: 'PDF' },
    { id: 'presentation' as NavigationPage, label: 'Defense Deck', icon: Presentation },
    ...(activeUser?.role === 'admin' ? [{ id: 'admin' as NavigationPage, label: 'Admin Hub', icon: ShieldAlert }] : []),
    { id: 'settings' as NavigationPage, label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-900 flex flex-col antialiased selection:bg-emerald-700/20 selection:text-emerald-900">
      
      {/* 1. TOP BOTANICAL/ECO GREEN BANNER (The Sill Style) */}
      <div className="bg-[#004d3d] text-emerald-50 text-xs font-medium tracking-wide py-2 px-4 flex items-center justify-between border-b border-[#00382c] shadow-sm z-50">
        <div className="flex items-center gap-2 max-w-7xl mx-auto text-center w-full justify-between">
          <div className="hidden md:flex items-center gap-2 text-[11px] text-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
            <span>Live AI Textile Diagnostics & Material Recovery</span>
          </div>

          <div className="text-center font-medium text-xs tracking-wider flex-1">
            <span>Free AI Textile Classification • 100% Zero-Landfill Audits • ISO 14040 Standard Compliant</span>
          </div>

          <div className="hidden md:flex items-center gap-4 text-[11px] text-emerald-200">
            <span className="font-mono">Milestones 1–4 Active</span>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER BAR (The Sill Style) */}
      <header className="bg-white border-b border-stone-200/80 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* BRAND LOGO (Editorial Serif The Sill Style) */}
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onNavigate('dashboard')}>
              <div className="flex flex-col">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-serif-display text-xl sm:text-2xl font-bold text-[#004d3d] tracking-tight group-hover:text-emerald-700 transition-colors">
                    Textile Waste Intelligence
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#004d3d] inline-block mb-0.5 group-hover:scale-125 transition-transform"></span>
                </div>
                <span className="text-[10px] font-sans font-medium text-stone-500 uppercase tracking-wider hidden sm:inline-block">
                  AI Categorization & Recycling Recommendation System
                </span>
              </div>
            </div>

            {/* RIGHT UTILITIES BAR */}
            <div className="flex items-center gap-3 sm:gap-6">
              
              {/* Facility Node Info */}
              <div className="hidden lg:flex items-center gap-2 text-xs text-stone-600 bg-stone-50 border border-stone-200/80 px-3 py-1.5 rounded-full">
                <MapPin className="w-3.5 h-3.5 text-[#004d3d]" />
                <span className="font-medium truncate max-w-[170px]">{facilityLocation}</span>
              </div>

              {/* Quick Search */}
              <button 
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 text-xs text-stone-500 hover:text-stone-900 bg-stone-100/80 hover:bg-stone-100 border border-stone-200 px-3 py-1.5 rounded-full transition-colors"
                title="Search materials, batches and reports"
              >
                <Search className="w-3.5 h-3.5 text-stone-500" />
                <span className="hidden sm:inline">Find Material / Batch</span>
                <kbd className="hidden md:inline-block px-1.5 py-0.2 rounded bg-white text-[10px] text-stone-500 border border-stone-200">⌘K</kbd>
              </button>

              {/* Notification Alerts */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-stone-600 hover:text-[#004d3d] hover:bg-stone-100 rounded-full transition-colors relative"
                  title="System notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-xs">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl border border-stone-200 shadow-xl p-4 z-50 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-3">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-[#004d3d]" />
                        <span className="font-bold text-xs text-stone-900 uppercase tracking-wider">System Alerts</span>
                      </div>
                      <button 
                        onClick={handleMarkAllRead}
                        className="text-[11px] text-[#004d3d] hover:underline font-medium"
                      >
                        Mark all read
                      </button>
                    </div>

                    <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
                      {notificationsList.length === 0 ? (
                        <div className="text-center py-6 text-xs text-stone-400 font-mono">No alerts at this time</div>
                      ) : (
                        notificationsList.slice(0, 6).map((n) => (
                          <div 
                            key={n.id} 
                            onClick={() => {
                              if (n.link) {
                                setShowNotifications(false);
                                onNavigate(n.link as NavigationPage);
                              }
                            }}
                            className={`p-3 rounded-xl border text-xs transition-colors cursor-pointer hover:border-[#004d3d]/50 ${
                              n.read ? 'bg-stone-50 border-stone-200/60 text-stone-600' : 'bg-emerald-50/50 border-emerald-200 text-stone-900 font-medium'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-bold text-stone-900 line-clamp-1">{n.title}</span>
                              <span className="text-[10px] text-stone-500 font-mono shrink-0 ml-2">
                                {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (n.timestamp ? n.timestamp.slice(11, 16) : '')}
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-600 leading-relaxed line-clamp-2">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="border-t border-stone-100 pt-2 mt-3 text-center">
                      <button 
                        onClick={() => { setShowNotifications(false); onNavigate('notifications'); }}
                        className="text-xs text-[#004d3d] font-semibold hover:underline"
                      >
                        View all notification logs →
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* User Account / Role Badge */}
              <div className="relative">
                <button
                  onClick={() => setShowRoleSelector(!showRoleSelector)}
                  className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-full hover:bg-stone-100 border border-transparent hover:border-stone-200 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-[#004d3d] text-emerald-50 font-bold flex items-center justify-center text-xs shadow-xs">
                    {(activeUser?.name || 'Y').charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-semibold text-stone-900">
                      Hello, {activeUser?.name?.split(' ')[0] || 'Yaswanth'}
                    </div>
                    <div className="text-[10px] text-[#004d3d] font-medium flex items-center gap-1">
                      <span>{roleLabels[activeUser?.role || 'admin'] || 'Administrator'}</span>
                    </div>
                  </div>
                </button>

                {showRoleSelector && (
                  <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl border border-stone-200 shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 space-y-3">
                    <div className="px-3 py-2 border-b border-stone-100 space-y-1">
                      <div className="text-xs font-bold text-stone-900">{activeUser?.name || 'Yaswanth'}</div>
                      <div className="text-[10px] text-stone-500 font-mono truncate">{activeUser?.email || 'yashuyaswanth8919@gmail.com'}</div>
                      <div className="pt-1">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-50 text-[#004d3d] border border-emerald-200 inline-block">
                          {roleLabels[activeUser?.role || 'admin'] || 'Administrator'}
                        </span>
                      </div>
                    </div>

                    <div className="px-3 py-1 bg-stone-50 rounded-xl border border-stone-100 text-[11px] text-stone-500 leading-tight">
                      Role locked to authenticated session. To change roles, please sign in with a different role on the login page.
                    </div>

                    <div className="border-t border-stone-100 pt-2 flex items-center justify-between px-2">
                      <button 
                        onClick={() => { setShowRoleSelector(false); onNavigate('settings'); }}
                        className="text-xs text-stone-600 hover:text-stone-900 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        <span>Settings</span>
                      </button>
                      <button 
                        onClick={onLogout}
                        className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1.5 font-medium cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Main CTA Button (The Sill Style Green Pill Button) */}
              <button
                onClick={() => onNavigate('analysis')}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#004d3d] hover:bg-[#00382c] text-white text-xs font-semibold rounded-full shadow-sm hover:shadow transition-all hover:scale-102"
              >
                <Sparkles className="w-3.5 h-3.5 fill-current text-emerald-300" />
                <span>Analyze Textile →</span>
              </button>

              {/* Mobile Hamburger Menu */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-stone-700 hover:text-stone-900 lg:hidden rounded-lg hover:bg-stone-100"
              >
                <Menu className="w-6 h-6" />
              </button>

            </div>

          </div>
        </div>

        {/* 3. SECONDARY HORIZONTAL CATEGORY NAVIGATION (Exact The Sill Menu Style) */}
        <div className="border-t border-stone-200/80 bg-white overflow-x-auto no-scrollbar">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center space-x-1 sm:space-x-6 py-2 min-w-max">
              {navCategories.map((item) => {
                const isActive = currentPage === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`px-3 py-1.5 text-xs sm:text-sm font-medium tracking-normal transition-all rounded-md flex items-center gap-1.5 relative whitespace-nowrap ${
                      isActive
                        ? 'text-[#004d3d] font-bold border-b-2 border-[#004d3d] rounded-b-none'
                        : item.highlight
                          ? 'text-[#004d3d] font-semibold hover:bg-emerald-50'
                          : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/60'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#004d3d]' : 'text-stone-400'}`} />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold rounded">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

      </header>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-stone-200 p-4 space-y-2 animate-in slide-in-from-top duration-200 z-30">
          <div className="grid grid-cols-2 gap-2">
            {navCategories.map((item) => {
              const isActive = currentPage === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`p-3 rounded-xl text-left text-xs font-semibold flex items-center gap-2 border transition-all ${
                    isActive
                      ? 'bg-[#004d3d] text-white border-[#004d3d]'
                      : 'bg-stone-50 border-stone-200 text-stone-800 hover:bg-stone-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. MAIN WORKSPACE CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* 5. EDITORIAL FOOTER (The Sill Style Clean Nature Footer) */}
      <footer className="bg-white border-t border-stone-200 mt-16 text-stone-600 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-baseline gap-1">
                <span className="font-serif-display text-xl font-normal text-stone-900">The</span>
                <span className="font-serif-display text-xl font-bold text-[#004d3d]">TexIntel</span>
              </div>
              <p className="text-stone-500 text-xs max-w-md leading-relaxed">
                Empowering the circular textile revolution. Advanced AI vision material classification, 
                automated waste categorization, 7-tier recycling pathways, and verified LCA environmental accounting.
              </p>
              <div className="pt-2 text-[11px] text-stone-400 font-mono">
                ISO 14040 • Ellen MacArthur Foundation Circular Framework • SDG 12 & 13 Aligned
              </div>
            </div>

            <div>
              <div className="font-bold text-stone-900 text-xs uppercase tracking-wider mb-3">Intelligence Modules</div>
              <ul className="space-y-2 text-stone-500">
                <li className="hover:text-[#004d3d] cursor-pointer" onClick={() => onNavigate('analysis')}>AI Vision Recognition</li>
                <li className="hover:text-[#004d3d] cursor-pointer" onClick={() => onNavigate('inventory')}>Waste Inventory & Batches</li>
                <li className="hover:text-[#004d3d] cursor-pointer" onClick={() => onNavigate('recommendations')}>Circular Recovery Engine</li>
                <li className="hover:text-[#004d3d] cursor-pointer" onClick={() => onNavigate('sustainability')}>5-Part Circularity Formula</li>
              </ul>
            </div>

            <div>
              <div className="font-bold text-stone-900 text-xs uppercase tracking-wider mb-3">Exports & Verification</div>
              <ul className="space-y-2 text-stone-500">
                <li className="hover:text-[#004d3d] cursor-pointer" onClick={() => onNavigate('reports')}>PDF Executive Summaries</li>
                <li className="hover:text-[#004d3d] cursor-pointer" onClick={() => onNavigate('reports')}>Excel LCA Workbooks</li>
                <li className="hover:text-[#004d3d] cursor-pointer" onClick={() => onNavigate('presentation')}>Defense Presentation Deck</li>
                <li className="hover:text-[#004d3d] cursor-pointer" onClick={() => onNavigate('admin')}>RBAC Security Governance</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-stone-200 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-stone-500 text-[11px]">
            <div>© 2026 Textile Waste Intelligence Platform — AI-Based Textile Waste Categorization & Recycling Recommendation System. Built by Yaswanth.</div>
            <div className="flex items-center gap-4 mt-2 sm:mt-0 font-mono">
              <span>Platform Version 2.4.0</span>
              <span>•</span>
              <span className="text-emerald-700 font-semibold">100% Circular Recovery Active</span>
            </div>
          </div>
        </div>
      </footer>

      {/* QUICK SEARCH MODAL */}
      {searchOpen && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs flex items-start justify-center pt-24 z-50 px-4">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-stone-100 flex items-center gap-3">
              <Search className="w-5 h-5 text-stone-400" />
              <input
                type="text"
                autoFocus
                placeholder="Search materials, batches (e.g. BATCH-2026-101), analyses, reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-stone-900 text-sm placeholder:text-stone-400 outline-hidden bg-transparent"
              />
              <button onClick={() => setSearchOpen(false)} className="p-1 text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 max-h-80 overflow-y-auto space-y-2 text-xs">
              <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">Quick Navigation</div>
              {[
                { label: 'AI Material Diagnostic Scanner', page: 'analysis' as NavigationPage, desc: 'Upload image or choose benchmark dataset sample' },
                { label: 'Circularity Scoring Index (0-100)', page: 'sustainability' as NavigationPage, desc: 'Weighted formula calculations and ranking' },
                { label: 'Reports & Analytics Export', page: 'reports' as NavigationPage, desc: 'Generate verified PDF and Excel spreadsheets' },
                { label: 'Environmental LCA Impact Dashboard', page: 'environmental' as NavigationPage, desc: 'Carbon, water, and landfill diversion' }
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    onNavigate(item.page);
                    setSearchOpen(false);
                  }}
                  className="p-2.5 rounded-xl hover:bg-stone-50 cursor-pointer border border-transparent hover:border-stone-200 transition-colors flex items-center justify-between group"
                >
                  <div>
                    <div className="font-semibold text-stone-900 group-hover:text-[#004d3d]">{item.label}</div>
                    <div className="text-[11px] text-stone-500">{item.desc}</div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-stone-400 group-hover:text-[#004d3d]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
