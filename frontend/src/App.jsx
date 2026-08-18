import { Routes, Route, Navigate } from "react-router-dom";
import UserManagement from "./pages/admin/UserManagement";


import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Inventory from "./pages/Inventory";
import CompleteProfile from "./pages/CompleteProfile";
import Analyze from "./pages/Analyze";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import AnalysisHistory from "./pages/AnalysisHistory";

import ProtectedRoute from "./components/ProtectedRoute";

import RecyclingFacilityDashboard from "./pages/dashboards/RecyclingFacilityDashboard";
import SustainabilityManagerDashboard from "./pages/dashboards/SustainabilityManagerDashboard";
import ManufacturerDashboard from "./pages/dashboards/ManufacturerDashboard";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import PlatformAnalytics from "./pages/admin/PlatformAnalytics";
import SystemMonitoring from "./pages/admin/SystemMonitoring";
import ReportManagement from "./pages/admin/ReportManagement";
import InventoryAnalysis from "./pages/InventoryAnalysis";

function App() {

    return (

        <Routes>

            {/* =========================
                Public Routes
            ========================= */}

            <Route
                path="/"
                element={<Home />}
            />

            <Route
                path="/login"
                element={<Login />}
            />

            <Route
                path="/register"
                element={<Register />}
            />

            <Route
                path="/forgot-password"
                element={<ForgotPassword />}
            />

            <Route
                path="/reset-password"
                element={<ResetPassword />}
            />


            {/* =========================
                Protected Routes
            ========================= */}

            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/inventory"
                element={
                    <ProtectedRoute>
                        <Inventory />
                    </ProtectedRoute>
                }
            />

            {/* <Route
                path="/complete-profile"
                element={
                    <ProtectedRoute>
                        <CompleteProfile />
                    </ProtectedRoute>
                }
            /> */}

            <Route
                path="/complete-profile"
                element={<CompleteProfile />}
            />

            <Route
                path="/analyze"
                element={
                    <ProtectedRoute>
                        <Analyze />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/inventory-analysis"
                element={
                    <ProtectedRoute>
                        <InventoryAnalysis />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/analysis-history"
                element={
                    <ProtectedRoute>
                        <AnalysisHistory />
                    </ProtectedRoute>
                }
            />


            {/* =========================
                Specialized Dashboards
            ========================= */}

            {/* Recycling Facility Dashboard */}

            <Route
                path="/dashboard/recycling"
                element={
                    <ProtectedRoute
                        allowedRoles={["recycling_operator", "admin"]}
                    >
                        <RecyclingFacilityDashboard />
                    </ProtectedRoute>
                }
            />


            {/* Sustainability Manager Dashboard */}

            <Route
                path="/dashboard/sustainability"
                element={
                    <ProtectedRoute
                        allowedRoles={["sustainability_manager", "admin"]}
                    >
                        <SustainabilityManagerDashboard />
                    </ProtectedRoute>
                }
            />


            {/* Manufacturer Dashboard */}

            <Route
                path="/dashboard/manufacturer"
                element={
                    <ProtectedRoute
                        allowedRoles={["manufacturer", "admin"]}
                    >
                        <ManufacturerDashboard />
                    </ProtectedRoute>
                }
            />


            {/* Admin Dashboard */}

            <Route
                path="/dashboard/admin"
                element={
                    <ProtectedRoute
                        allowedRoles={["admin"]}
                    >
                        <AdminDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                    path="/admin/users"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <UserManagement />
                        </ProtectedRoute>
                    }
                />
            <Route
                path="/admin/analytics"
                element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                        <PlatformAnalytics />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin/system-monitoring"
                element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                        <SystemMonitoring />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin/reports"
                element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                        <ReportManagement />
                    </ProtectedRoute>
                }
            />

            

            {/* =========================
                Default Route
            ========================= */}

            <Route
                path="*"
                element={<Navigate to="/" replace />}
            />

        </Routes>

    );
}

export default App;