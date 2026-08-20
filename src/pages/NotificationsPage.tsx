import React, { useState, useEffect } from 'react';
import { 
  Bell, Check, Trash2, CheckCircle2, AlertTriangle, Info, 
  Sparkles, RefreshCw, Plus, ArrowRight, ExternalLink, Filter,
  Layers, Recycle, Leaf, Package, Megaphone, X
} from 'lucide-react';
import { api } from '../services/api';
import { NavigationPage } from '../types/client';

interface NotificationsPageProps {
  onNavigate?: (page: NavigationPage) => void;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ onNavigate, onToast }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form state for creating custom notification
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newCategory, setNewCategory] = useState('Waste Collection');
  const [newSeverity, setNewSeverity] = useState('info');
  const [newLink, setNewLink] = useState('batches');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (err) {
      onToast('Error loading notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'All', label: 'All Notifications', icon: Bell },
    { id: 'Waste Collection', label: 'Waste Collection Alerts', icon: Layers },
    { id: 'Recycling Opportunity', label: 'Recycling Opportunity Matches', icon: Recycle },
    { id: 'Sustainability Milestone', label: 'Sustainability Milestones', icon: Leaf },
    { id: 'Inventory Warning', label: 'Inventory Warnings', icon: AlertTriangle },
    { id: 'Platform Announcement', label: 'Platform Announcements', icon: Megaphone }
  ];

  const filteredNotifications = activeCategory === 'All' 
    ? notifications 
    : notifications.filter(n => 
        (n.category && n.category.toLowerCase() === activeCategory.toLowerCase()) ||
        n.title.toLowerCase().includes(activeCategory.toLowerCase())
      );

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      onToast('Notification marked as read', 'info');
    } catch (err) {
      onToast('Failed to update notification', 'error');
    }
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await api.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      onToast('Notification deleted', 'info');
    } catch (err) {
      onToast('Failed to delete notification', 'error');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      onToast('All notifications marked as read', 'success');
    } catch (err) {
      onToast('Failed to update notifications', 'error');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all notifications?')) return;
    try {
      await api.clearAllNotifications();
      setNotifications([]);
      onToast('All notifications cleared', 'info');
    } catch (err) {
      onToast('Failed to clear notifications', 'error');
    }
  };

  const handleSeedSamples = async () => {
    try {
      setLoading(true);
      const res = await api.seedSampleNotifications();
      setNotifications(res.notifications || []);
      onToast('Sample alert stream loaded successfully!', 'success');
    } catch (err) {
      onToast('Failed to seed notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newMessage.trim()) {
      onToast('Please fill in title and message', 'error');
      return;
    }

    setCreating(true);
    try {
      const created = await api.createNotification({
        title: newTitle.trim(),
        message: newMessage.trim(),
        category: newCategory,
        severity: newSeverity,
        link: newLink
      });

      setNotifications(prev => [created, ...prev]);
      setShowCreateModal(false);
      setNewTitle('');
      setNewMessage('');
      onToast('Alert published successfully!', 'success');
    } catch (err: any) {
      onToast(err.message || 'Failed to create alert', 'error');
    } finally {
      setCreating(false);
    }
  };

  const getCategoryBadge = (cat?: string) => {
    switch (cat) {
      case 'Waste Collection':
        return { bg: 'bg-emerald-50 text-[#004d3d] border-emerald-200', icon: Layers };
      case 'Recycling Opportunity':
        return { bg: 'bg-teal-50 text-teal-800 border-teal-200', icon: Recycle };
      case 'Sustainability Milestone':
        return { bg: 'bg-emerald-100 text-emerald-900 border-emerald-300', icon: Leaf };
      case 'Inventory Warning':
        return { bg: 'bg-amber-50 text-amber-900 border-amber-200', icon: AlertTriangle };
      case 'Platform Announcement':
        return { bg: 'bg-indigo-50 text-indigo-900 border-indigo-200', icon: Megaphone };
      default:
        return { bg: 'bg-stone-100 text-stone-700 border-stone-200', icon: Bell };
    }
  };

  const getSeverityDot = (severity?: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-rose-500 ring-rose-300 animate-pulse';
      case 'warning':
        return 'bg-amber-500 ring-amber-300';
      case 'success':
        return 'bg-emerald-500 ring-emerald-300';
      default:
        return 'bg-sky-500 ring-sky-300';
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200 pb-12">
      
      {/* HEADER BAR */}
      <div className="bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-mono font-bold text-[#004d3d]">
            <Bell className="w-3.5 h-3.5 text-[#004d3d]" />
            <span>PDF Module 11 Notification Engine</span>
          </div>
          <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-stone-900">
            Real-Time Platform Alerts & Intelligence Feed
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            Automated alerts for textile waste intake, high-yield circular buyer matches, capacity warnings, and sustainability milestones.
          </p>
        </div>

        {/* TOP ACTION CONTROLS */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-[#004d3d] hover:bg-[#00382c] text-white text-xs font-semibold rounded-full shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Alert</span>
          </button>

          <button
            onClick={handleSeedSamples}
            className="px-3.5 py-2 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold rounded-full border border-stone-300 shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            title="Reload realistic demo alerts for all 5 categories"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#004d3d]" />
            <span>Seed 5 Categories</span>
          </button>

          <button
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className="px-3.5 py-2 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold rounded-full border border-stone-300 shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>Mark All Read</span>
          </button>

          <button
            onClick={handleClearAll}
            disabled={notifications.length === 0}
            className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-full border border-stone-200 transition-all disabled:opacity-30 cursor-pointer"
            title="Clear all alerts"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
        <div className="bg-white border border-stone-200/80 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] text-stone-500 uppercase font-semibold">Total Alerts</span>
          <div className="text-2xl font-bold text-stone-900 mt-1">{notifications.length}</div>
        </div>
        <div className="bg-white border border-stone-200/80 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] text-stone-500 uppercase font-semibold">Unread Alerts</span>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{unreadCount}</div>
        </div>
        <div className="bg-white border border-stone-200/80 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] text-stone-500 uppercase font-semibold">Critical / Warnings</span>
          <div className="text-2xl font-bold text-amber-600 mt-1">
            {notifications.filter(n => n.severity === 'warning' || n.severity === 'critical' || n.category === 'Inventory Warning').length}
          </div>
        </div>
        <div className="bg-white border border-stone-200/80 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] text-stone-500 uppercase font-semibold">Active Categories</span>
          <div className="text-2xl font-bold text-indigo-700 mt-1">5 of 5</div>
        </div>
      </div>

      {/* MODULE 11 ALERT CATEGORIES FILTER TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = activeCategory === cat.id;
          const count = cat.id === 'All' 
            ? notifications.length 
            : notifications.filter(n => n.category === cat.id).length;

          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-[#004d3d] text-white font-semibold shadow-xs'
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-300' : 'text-stone-400'}`} />
              <span>{cat.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                isSelected ? 'bg-emerald-900 text-emerald-200' : 'bg-stone-100 text-stone-600'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* NOTIFICATIONS LIST */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 space-y-3 bg-white border border-stone-200/80 rounded-3xl">
          <div className="w-8 h-8 border-3 border-[#004d3d] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-mono text-stone-500">Retrieving intelligence alerts...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="p-16 text-center bg-white border border-stone-200/80 rounded-3xl space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#004d3d] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-serif-display text-lg font-bold text-stone-800">No Alerts in this Category</h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                All notifications for <strong>{activeCategory}</strong> have been handled. You can generate realistic test alerts using the button below.
              </p>
              <button
                onClick={handleSeedSamples}
                className="px-5 py-2.5 bg-[#004d3d] text-white text-xs font-semibold rounded-full shadow-xs hover:bg-[#00382c] transition-all cursor-pointer inline-flex items-center gap-2 mt-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Seed Sample Stream</span>
              </button>
            </div>
          ) : (
            filteredNotifications.map((n) => {
              const badge = getCategoryBadge(n.category);
              const BadgeIcon = badge.icon;
              const dotClass = getSeverityDot(n.severity);

              return (
                <div
                  key={n.id}
                  className={`bg-white border rounded-2xl p-5 transition-all shadow-xs flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                    n.read 
                      ? 'border-stone-200/80 bg-white/90' 
                      : 'border-emerald-500/50 ring-1 ring-emerald-500/20 bg-emerald-50/10'
                  }`}
                >
                  <div className="flex items-start gap-3.5 flex-1">
                    {/* Severity & Unread Dot */}
                    <div className="pt-1 shrink-0">
                      <span className={`w-2.5 h-2.5 rounded-full inline-block ring-4 ${dotClass}`} />
                    </div>

                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold border ${badge.bg}`}>
                          <BadgeIcon className="w-3 h-3" />
                          <span>{n.category || 'Platform Alert'}</span>
                        </span>

                        {!n.read && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-600 text-white">
                            NEW
                          </span>
                        )}

                        <span className="text-[11px] font-mono text-stone-400">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      <h4 className={`text-sm font-bold ${n.read ? 'text-stone-800' : 'text-stone-950'}`}>
                        {n.title}
                      </h4>

                      <p className="text-xs text-stone-600 leading-relaxed max-w-3xl">
                        {n.message}
                      </p>
                    </div>
                  </div>

                  {/* ACTION CONTROLS */}
                  <div className="flex items-center gap-2 shrink-0 sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                    {n.link && onNavigate && (
                      <button
                        onClick={() => onNavigate(n.link as NavigationPage)}
                        className="px-3.5 py-1.5 bg-[#004d3d] hover:bg-[#00382c] text-white text-xs font-semibold rounded-full flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                      >
                        <span>View Module</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}

                    {!n.read && (
                      <button
                        onClick={(e) => handleMarkAsRead(n.id, e)}
                        className="p-1.5 text-stone-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={(e) => handleDelete(n.id, e)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* CREATE NEW CUSTOM NOTIFICATION MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-stone-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-50 text-[#004d3d] rounded-xl">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif-display text-lg font-bold text-stone-900">Broadcast Alert / Notification</h3>
                  <p className="text-xs text-stone-500 font-mono">Module 11 Notification Dispatcher</p>
                </div>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-stone-700 font-semibold block mb-1">Alert Category *</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-stone-800 focus:outline-none focus:border-[#004d3d]"
                >
                  <option value="Waste Collection">Waste Collection Alert</option>
                  <option value="Recycling Opportunity">Recycling Opportunity Notification</option>
                  <option value="Sustainability Milestone">Sustainability Milestone Alert</option>
                  <option value="Inventory Warning">Inventory Warning</option>
                  <option value="Platform Announcement">Platform Announcement</option>
                </select>
              </div>

              <div>
                <label className="text-stone-700 font-semibold block mb-1">Severity Level</label>
                <select
                  value={newSeverity}
                  onChange={(e) => setNewSeverity(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-stone-800 focus:outline-none focus:border-[#004d3d]"
                >
                  <option value="info">Info (Standard update)</option>
                  <option value="success">Success (Milestone / match)</option>
                  <option value="warning">Warning (Storage / humidity)</option>
                  <option value="critical">Critical (Contamination / urgent)</option>
                </select>
              </div>

              <div>
                <label className="text-stone-700 font-semibold block mb-1">Alert Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Storage Capacity Warning in Bay 4"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-stone-800 focus:outline-none focus:border-[#004d3d]"
                />
              </div>

              <div>
                <label className="text-stone-700 font-semibold block mb-1">Detailed Message *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe the operational alert details..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-stone-800 focus:outline-none focus:border-[#004d3d]"
                />
              </div>

              <div>
                <label className="text-stone-700 font-semibold block mb-1">Target Navigation Link</label>
                <select
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-stone-800 focus:outline-none focus:border-[#004d3d]"
                >
                  <option value="batches">Batch Control Center</option>
                  <option value="inventory">Waste Inventory</option>
                  <option value="recommendations">Recycling Recommendations</option>
                  <option value="sustainability">Circularity & ESG</option>
                  <option value="analysis">AI Image Classifier</option>
                  <option value="reports">Reports & Exports</option>
                </select>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-full font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 bg-[#004d3d] hover:bg-[#00382c] text-white font-semibold rounded-full shadow-xs transition-all disabled:opacity-50"
                >
                  {creating ? 'Publishing...' : 'Publish Alert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
