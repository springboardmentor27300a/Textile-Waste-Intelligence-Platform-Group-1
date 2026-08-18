import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import InventoryPage from './pages/InventoryPage';
import ProfilePage from './pages/ProfilePage';
import DatasetCatalogPage from './pages/DatasetCatalogPage';
import MaterialClassificationPage from './pages/MaterialClassificationPage';
import SustainabilityDashboardPage from './pages/SustainabilityDashboardPage';
import AdminUserListPage from './pages/AdminUserListPage';
import SustainabilityCalculatorPage from './pages/SustainabilityCalculatorPage';
import RecyclingCatalogPage from './pages/RecyclingCatalogPage';
import RecyclerMarketplacePage from './pages/RecyclerMarketplacePage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes (Require Authentication) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/classify" element={<MaterialClassificationPage />} />
              <Route path="/sustainability" element={<SustainabilityDashboardPage />} />
              <Route path="/recycling-methods" element={<RecyclingCatalogPage />} />
              <Route path="/recyclers" element={<RecyclerMarketplacePage />} />
              <Route path="/datasets" element={<DatasetCatalogPage />} />
              <Route path="/calculator" element={<SustainabilityCalculatorPage />} />
              <Route path="/admin/users" element={<AdminUserListPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>

          {/* 404 Route */}
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
