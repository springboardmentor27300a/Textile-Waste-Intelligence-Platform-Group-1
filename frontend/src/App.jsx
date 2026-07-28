import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardHub from './pages/DashboardHub';
import InventoryList from './pages/InventoryList';
import BatchDetails from './pages/BatchDetails';
import DatasetModule from './pages/DatasetModule';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import UserManagement from './pages/UserManagement';

// Milestone 2 — AI Pages
import ImageAnalysis from './pages/ImageAnalysis/ImageAnalysis';
import PredictionHistory from './pages/Predictions/PredictionHistory';
import PredictionResult from './pages/Predictions/PredictionResult';
import Reports from './pages/Predictions/Reports';

import { Activity } from 'lucide-react';

// Protected Route Wrapper Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-bgLight dark:bg-bgDark flex flex-col items-center justify-center text-slate-500">
        <Activity size={28} className="animate-spin text-primary-800 mb-2" />
        <span className="text-xs font-semibold">Authenticating portal access...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Pages */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardHub />
        </ProtectedRoute>
      } />
      
      <Route path="/inventory" element={
        <ProtectedRoute>
          <InventoryList />
        </ProtectedRoute>
      } />
      
      <Route path="/inventory/batches/:id" element={
        <ProtectedRoute>
          <BatchDetails />
        </ProtectedRoute>
      } />
      
      <Route path="/datasets" element={
        <ProtectedRoute>
          <DatasetModule />
        </ProtectedRoute>
      } />
      
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      
      <Route path="/settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />
      
      <Route path="/users" element={
        <ProtectedRoute>
          <UserManagement />
        </ProtectedRoute>
      } />

      {/* Fallback Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />

      {/* Milestone 2 — AI Routes */}
      <Route path="/analysis" element={
        <ProtectedRoute>
          <ImageAnalysis />
        </ProtectedRoute>
      } />

      <Route path="/predictions" element={
        <ProtectedRoute>
          <PredictionHistory />
        </ProtectedRoute>
      } />

      <Route path="/predictions/:id" element={
        <ProtectedRoute>
          <PredictionResult />
        </ProtectedRoute>
      } />

      <Route path="/reports" element={
        <ProtectedRoute>
          <Reports />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
