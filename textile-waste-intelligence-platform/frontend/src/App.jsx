import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import DashboardLayout from './layouts/DashboardLayout.jsx';
import LandingPage from './pages/LandingPage.jsx';
import Register from './pages/Register.jsx';
import Login from './pages/Login.jsx';
import AdminLogin from './pages/AdminLogin.jsx';

import Dashboard from './pages/Dashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import Inventory from './pages/Inventory.jsx';
import AddWaste from './pages/AddWaste.jsx';
import Manufacturers from './pages/Manufacturers.jsx';
import RecyclingFacilities from './pages/RecyclingFacilities.jsx';
import Reports from './pages/Reports.jsx';
import SustainabilityAnalytics from './pages/SustainabilityAnalytics.jsx';
import RecyclingDashboard from './pages/RecyclingDashboard.jsx';
import SustainabilityDashboard from './pages/SustainabilityDashboard.jsx';
import ManageUsers from './pages/ManageUsers.jsx';
import Settings from './pages/Settings.jsx';
import Profile from './pages/Profile.jsx';
import ActivityLogs from './pages/ActivityLogs.jsx';
import AiAnalysis from './pages/AiAnalysis.jsx';
import AiDashboard from './pages/AiDashboard.jsx';
import ManufacturerDashboard from './pages/ManufacturerDashboard.jsx';

import ProtectedRoute from './components/ProtectedRoute.jsx';

// Inline router wrapper to simplify routing layout
const Protected = ({ element, allowedRoles }) => (
  <ProtectedRoute allowedRoles={allowedRoles}>{element}</ProtectedRoute>
);

const App = () => (
  <>
    <Toaster
      position="top-right"
      toastOptions={{
        style: { fontSize: '14px', borderRadius: '10px' },
        success: { iconTheme: { primary: '#059669', secondary: '#fff' } },
      }}
    />
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Authenticated Pages under Dashboard Layout */}
      <Route element={<Protected element={<DashboardLayout />} />}>
        {/* Shared Routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/inventory/add" element={<Protected allowedRoles={[ 'Textile Manufacturer' ]} element={<AddWaste />} />} />
        <Route path="/inventory/edit/:id" element={<Protected allowedRoles={[ 'Administrator', 'Textile Manufacturer', 'Recycling Facility Operator' ]} element={<AddWaste />} />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/ai-analysis" element={<AiAnalysis />} />
        <Route path="/ai-dashboard" element={<AiDashboard />} />
        <Route path="/manufacturer-dashboard" element={<Protected allowedRoles={['Textile Manufacturer']} element={<ManufacturerDashboard />} />} />
        <Route path="/recycling-dashboard" element={<Protected allowedRoles={[ 'Recycling Facility Operator', 'Textile Manufacturer' ]} element={<RecyclingDashboard />} />} />
        <Route path="/sustainability-dashboard" element={<Protected allowedRoles={[ 'Sustainability Manager' ]} element={<SustainabilityDashboard />} />} />

        {/* Administrator Protected Routes */}
        <Route path="/admin/dashboard" element={<Protected allowedRoles={['Administrator']} element={<AdminDashboard />} />} />
        <Route path="/users" element={<Protected allowedRoles={['Administrator']} element={<ManageUsers />} />} />
        <Route path="/analytics" element={<Protected allowedRoles={['Administrator']} element={<SustainabilityAnalytics />} />} />
        <Route path="/logs" element={<Protected allowedRoles={['Administrator']} element={<ActivityLogs />} />} />
        <Route path="/manufacturers" element={<Protected allowedRoles={['Administrator']} element={<Manufacturers />} />} />
        <Route path="/facilities" element={<Protected allowedRoles={['Administrator']} element={<RecyclingFacilities />} />} />
      </Route>

      {/* Wildcard redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </>
);

export default App;
