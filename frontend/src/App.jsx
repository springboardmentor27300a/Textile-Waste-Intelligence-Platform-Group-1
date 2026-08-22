import { Routes, Route, Navigate, useLocation, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import SustainabilityDashboard from "./pages/dashboards/SustainabilityDashboard";
import RecyclerDashboard from "./pages/dashboards/RecyclerDashboard";
import ManufacturerDashboard from "./pages/dashboards/ManufacturerDashboard";
import Inventory from "./pages/Inventory";
import BatchDetail from "./pages/BatchDetail";
import ImageAnalysis from "./pages/ImageAnalysis";
import SustainabilityAnalytics from "./pages/SustainabilityAnalytics";
import Datasets from "./pages/Datasets";
import Reports from "./pages/Reports";
import Team from "./pages/Team";

function RoleBasedDashboard() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case "administrator":
      return <AdminDashboard />;
    case "sustainability_manager":
      return <SustainabilityDashboard />;
    case "recycling_facility_operator":
      return <RecyclerDashboard />;
    case "textile_manufacturer":
      return <ManufacturerDashboard />;
    default:
      return <RecyclerDashboard />;
  }
}

function ProtectedLayout() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-slate-400">
        Initializing Reloom AI Engine...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col font-sans">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<RoleBasedDashboard />} />
          <Route path="/scanner" element={<ImageAnalysis />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/inventory/:batchId" element={<BatchDetail />} />
          <Route path="/sustainability" element={<SustainabilityAnalytics />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/team" element={<Team />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
