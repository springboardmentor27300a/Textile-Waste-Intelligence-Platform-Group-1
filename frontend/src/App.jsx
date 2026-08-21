import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Shell from "./components/Shell.jsx";
import SignIn from "./pages/SignIn.jsx";
import Register from "./pages/Register.jsx";
import Overview from "./pages/Overview.jsx";
import Inventory from "./pages/Inventory.jsx";
import BatchDetail from "./pages/BatchDetail.jsx";
import ImageAnalysis from "./pages/ImageAnalysis.jsx";
import Classification from "./pages/Classification.jsx";
import Recommendations from "./pages/Recommendations.jsx";
import Sustainability from "./pages/Sustainability.jsx";
import Environmental from "./pages/Environmental.jsx";
import Reports from "./pages/Reports.jsx";
import Settings from "./pages/Settings.jsx";
import Admin from "./pages/Admin.jsx";
import { api, clearToken, getToken } from "./lib/api.js";

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!getToken()) { setChecking(false); return; }
    api.me().then(setUser).catch(() => clearToken()).finally(() => setChecking(false));
  }, []);

  const signOut = () => { clearToken(); setUser(null); };

  if (checking) {
    return (
      <div className="grid min-h-screen place-items-center">
        <p className="eyebrow animate-pulse">Loading facility…</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          user ? <Navigate to="/" replace /> : <SignIn onSignedIn={setUser} />} />
        <Route path="/register" element={
          user ? <Navigate to="/" replace /> : <Register onSignedIn={setUser} />} />

        <Route element={user
          ? <Shell user={user} onSignOut={signOut} />
          : <Navigate to="/login" replace />}>
          <Route path="/" element={<Overview user={user} />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/inventory/:batchId" element={<BatchDetail />} />
          <Route path="/image-analysis" element={<ImageAnalysis />} />
          <Route path="/classification" element={<Classification />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/sustainability" element={<Sustainability />} />
          <Route path="/environmental" element={<Environmental />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={
            <Settings user={user} onUpdated={setUser} onSignOut={signOut} />} />
          <Route path="/admin" element={
            user?.role === "administrator" ? <Admin /> : <Navigate to="/" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
