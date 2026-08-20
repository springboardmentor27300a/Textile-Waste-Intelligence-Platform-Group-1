import React, { useState, useEffect } from 'react';
import { AppShell } from './components/layout/AppShell';
import { Toast, ToastMessage } from './components/common/Toast';
import { NavigationPage, UserProfile } from './types/client';
import { api } from './services/api';

import { DashboardPage } from './pages/DashboardPage';
import { TextileAnalysisPage } from './pages/TextileAnalysisPage';
import { WasteInventoryPage } from './pages/WasteInventoryPage';
import { WasteBatchesPage } from './pages/WasteBatchesPage';
import { RecyclingRecommendationsPage } from './pages/RecyclingRecommendationsPage';
import { SustainabilityPage } from './pages/SustainabilityPage';
import { EnvironmentalImpactPage } from './pages/EnvironmentalImpactPage';
import { AnalysisHistoryPage } from './pages/AnalysisHistoryPage';
import { ReportsPage } from './pages/ReportsPage';
import { PresentationPage } from './pages/PresentationPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { AdminPage } from './pages/AdminPage';
import { AuthPage } from './pages/AuthPage';
import { ProfileSettingsPage } from './pages/ProfileSettingsPage';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [currentPage, setCurrentPage] = useState<NavigationPage>('dashboard');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    checkCurrentUser();
  }, []);

  const checkCurrentUser = async () => {
    try {
      setAuthChecking(true);
      const user = await api.getCurrentUser();
      setCurrentUser(user);
    } catch (err) {
      setCurrentUser(null);
    } finally {
      setAuthChecking(false);
    }
  };

  const handleToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleLogout = async () => {
    try {
      await api.logout();
      setCurrentUser(null);
      handleToast('Logged out successfully', 'info');
    } catch (err) {
      setCurrentUser(null);
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-mono text-xs">
        Initializing Textile Waste Intelligence Platform...
      </div>
    );
  }

  if (!currentUser) {
    return (
      <>
        <AuthPage onLoginSuccess={(user) => setCurrentUser(user)} onToast={handleToast} />
        <Toast toasts={toasts} onClose={removeToast} />
      </>
    );
  }

  return (
    <AppShell
      currentUser={currentUser}
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      onLogout={handleLogout}
    >
      {currentPage === 'dashboard' && <DashboardPage currentUser={currentUser} onNavigate={setCurrentPage} onToast={handleToast} />}
      {currentPage === 'analysis' && <TextileAnalysisPage onNavigate={setCurrentPage} onToast={handleToast} />}
      {currentPage === 'inventory' && <WasteInventoryPage onNavigate={setCurrentPage} onToast={handleToast} />}
      {currentPage === 'batches' && <WasteBatchesPage onNavigate={setCurrentPage} onToast={handleToast} />}
      {currentPage === 'recommendations' && <RecyclingRecommendationsPage onNavigate={setCurrentPage} onToast={handleToast} />}
      {currentPage === 'sustainability' && <SustainabilityPage onNavigate={setCurrentPage} onToast={handleToast} />}
      {currentPage === 'environmental' && <EnvironmentalImpactPage onNavigate={setCurrentPage} onToast={handleToast} />}
      {currentPage === 'history' && <AnalysisHistoryPage onNavigate={setCurrentPage} onToast={handleToast} />}
      {currentPage === 'reports' && <ReportsPage onToast={handleToast} />}
      {currentPage === 'presentation' && <PresentationPage onToast={handleToast} />}
      {currentPage === 'notifications' && <NotificationsPage onNavigate={setCurrentPage} onToast={handleToast} />}
      {currentPage === 'admin' && <AdminPage onToast={handleToast} />}
      {currentPage === 'settings' && (
        <ProfileSettingsPage
          currentUser={currentUser}
          onUpdateUser={(u) => setCurrentUser(u)}
          onToast={handleToast}
        />
      )}

      <Toast toasts={toasts} onClose={removeToast} />
    </AppShell>
  );
}
