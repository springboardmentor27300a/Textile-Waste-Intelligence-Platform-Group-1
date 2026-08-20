import {
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";


import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";


import Dashboard from "../pages/dashboard/Dashboard";


import Inventory from "../pages/inventory/Inventory";
import AddWaste from "../pages/inventory/AddWaste";
import WasteDetails from "../pages/inventory/WasteDetails";


import WasteClassification from "../pages/waste/WasteClassification";


import ImageAnalysis from "../pages/image-analysis/ImageAnalysis";

import MaterialClassification from "../pages/material/MaterialClassification";

import RecyclingEngine from "../pages/recycling/RecyclingEngine";

import SustainabilityDashboard from "../pages/sustainability/SustainabilityDashboard";


import Reports from "../pages/reports/Reports";

import Users from "../pages/users/Users";


import WasteSources from "../pages/wasteSource/WasteSources";
import AddWasteSource from "../pages/wasteSource/AddWasteSource";
import EditWasteSource from "../pages/wasteSource/EditWasteSource";
import ViewWasteSource from "../pages/wasteSource/ViewWasteSource";


import Collections from "../pages/collection/Collections";
import AddCollection from "../pages/collection/AddCollection";
import EditCollection from "../pages/collection/EditCollection";
import ViewCollection from "../pages/collection/ViewCollection";


import Notifications from "../pages/notifications/Notifications";
import Settings from "../pages/settings/Settings";


import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "./ProtectedRoute";


const ALL_ROLES = [
  "administrator",
  "manager",
  "manufacturer",
  "recycler",
  "operator",
];


const ADMIN_MANUFACTURER = [
  "administrator",
  "manufacturer",
];

const ADMIN_RECYCLER = [
  "administrator",
  "recycler",
];


function ProtectedLayout() {

  return (
    <ProtectedRoute
      roles={ALL_ROLES}
    >
      <MainLayout>
        <Outlet />
      </MainLayout>
    </ProtectedRoute>
  );
}


function RoleRoute({
  roles,
  children,
}) {

  return (
    <ProtectedRoute roles={roles}>
      {children}
    </ProtectedRoute>
  );
}


function NotFound() {

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">

      <div className="text-center">

        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100">

          <span className="text-2xl font-bold text-slate-500">
            404
          </span>

        </div>


        <h1 className="mt-6 text-5xl font-bold text-heading">
          Page Not Found
        </h1>


        <p className="mt-3 text-muted">
          The page you are looking for does not exist.
        </p>


        <a
          href="/dashboard"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Back to Dashboard
        </a>

      </div>

    </div>
  );
}


function AppRouter() {

  return (

    <Routes>

      {/* Public */}

      <Route
        path="/"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
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


      {/* Protected */}

      <Route
        element={<ProtectedLayout />}
      >

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />


        {/* Inventory */}

        <Route
          path="/inventory"
          element={
            <RoleRoute
              roles={ALL_ROLES}
            >
              <Inventory />
            </RoleRoute>
          }
        />

        <Route
          path="/inventory/add"
          element={
            <RoleRoute
              roles={ADMIN_MANUFACTURER}
            >
              <AddWaste />
            </RoleRoute>
          }
        />

        <Route
          path="/inventory/edit/:id"
          element={
            <RoleRoute
              roles={ADMIN_MANUFACTURER}
            >
              <AddWaste />
            </RoleRoute>
          }
        />

        <Route
          path="/inventory/:id"
          element={
            <RoleRoute
              roles={ALL_ROLES}
            >
              <WasteDetails />
            </RoleRoute>
          }
        />


        <Route
          path="/waste-classification"
          element={
            <RoleRoute
              roles={ADMIN_RECYCLER}
            >
              <WasteClassification />
            </RoleRoute>
          }
        />


        {/* AI */}

        <Route
          path="/image-analysis"
          element={
            <RoleRoute
              roles={ADMIN_MANUFACTURER}
            >
              <ImageAnalysis />
            </RoleRoute>
          }
        />


        <Route
          path="/material-classification"
          element={
            <RoleRoute
              roles={ADMIN_MANUFACTURER}
            >
              <MaterialClassification />
            </RoleRoute>
          }
        />


        <Route
          path="/recycling-engine"
          element={
            <RoleRoute
              roles={ADMIN_RECYCLER}
            >
              <RecyclingEngine />
            </RoleRoute>
          }
        />


        {/* Sustainability */}

        <Route
          path="/sustainability"
          element={
            <RoleRoute
              roles={ALL_ROLES}
            >
              <SustainabilityDashboard />
            </RoleRoute>
          }
        />


        {/* Reports */}

        <Route
          path="/reports"
          element={
            <RoleRoute
              roles={ALL_ROLES}
            >
              <Reports />
            </RoleRoute>
          }
        />


        {/* Admin */}

        <Route
          path="/users"
          element={
            <RoleRoute
              roles={[
                "administrator",
              ]}
            >
              <Users />
            </RoleRoute>
          }
        />


        {/* Waste Sources */}

        <Route
          path="/waste-sources"
          element={
            <RoleRoute
              roles={ADMIN_MANUFACTURER}
            >
              <WasteSources />
            </RoleRoute>
          }
        />


        <Route
          path="/waste-sources/add"
          element={
            <RoleRoute
              roles={ADMIN_MANUFACTURER}
            >
              <AddWasteSource />
            </RoleRoute>
          }
        />


        <Route
          path="/waste-sources/edit/:id"
          element={
            <RoleRoute
              roles={ADMIN_MANUFACTURER}
            >
              <EditWasteSource />
            </RoleRoute>
          }
        />


        <Route
          path="/waste-sources/:id"
          element={
            <RoleRoute
              roles={ADMIN_MANUFACTURER}
            >
              <ViewWasteSource />
            </RoleRoute>
          }
        />


        {/* Collections */}

        <Route
          path="/collections"
          element={
            <RoleRoute
              roles={ALL_ROLES}
            >
              <Collections />
            </RoleRoute>
          }
        />


        <Route
          path="/collections/add"
          element={
            <RoleRoute
              roles={ALL_ROLES}
            >
              <AddCollection />
            </RoleRoute>
          }
        />


        <Route
          path="/collections/edit/:id"
          element={
            <RoleRoute
              roles={ALL_ROLES}
            >
              <EditCollection />
            </RoleRoute>
          }
        />


        <Route
          path="/collections/:id"
          element={
            <RoleRoute
              roles={ALL_ROLES}
            >
              <ViewCollection />
            </RoleRoute>
          }
        />


        {/* System */}

        <Route
          path="/notifications"
          element={<Notifications />}
        />

        <Route
          path="/settings"
          element={<Settings />}
        />

      </Route>


      {/* 404 */}

      <Route
        path="*"
        element={<NotFound />}
      />

    </Routes>
  );
}


export default AppRouter;