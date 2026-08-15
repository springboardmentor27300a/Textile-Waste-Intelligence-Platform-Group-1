import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Dataset from "./pages/Dataset";
import UploadDataset from "./pages/UploadDataset";
import Prediction from "./pages/Prediction";
import ImageAnalysis from "./pages/ImageAnalysis";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";

function ProtectedLayout({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="auth-wrap"><p>Loading…</p></div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-area">{children}</main>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
      <Route path="/inventory" element={<ProtectedLayout><Inventory /></ProtectedLayout>} />
      <Route path="/datasets" element={<ProtectedLayout><Dataset /></ProtectedLayout>} />
      <Route path="/datasets/upload" element={<ProtectedLayout><UploadDataset /></ProtectedLayout>} />
      <Route path="/prediction" element={<ProtectedLayout><Prediction /></ProtectedLayout>} />
      <Route path="/image-analysis" element={<ProtectedLayout><ImageAnalysis /></ProtectedLayout>} />
      <Route path="/analytics" element={<ProtectedLayout><Analytics /></ProtectedLayout>} />
      <Route path="/reports" element={<ProtectedLayout><Reports /></ProtectedLayout>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
