import { useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  Package,
  Recycle,
  Image,
  Factory,
  Layers3,
  BrainCircuit,
  FileText,
  Truck,
  Bell,
  Settings,
  Users,
  LogOut,
  Leaf,
//  BarChart3,
} from "lucide-react";

import SidebarItem from "./SidebarItem";

import {
  getStoredAuth,
  clearAuth,
} from "../../context/useAuth";


/* =========================================================
   ROLE LABELS
========================================================= */

const ROLE_LABELS = {
  administrator: "Administrator",
  manager: "Sustainability Manager",
  manufacturer: "Textile Manufacturer",
  recycler: "Recycling Facility",
  operator: "Textile Manufacturer",
};


/* =========================================================
   NORMALIZE ROLE
========================================================= */

function normalizeRole(role) {
  const value = String(role || "")
    .trim()
    .toLowerCase();

  if (value === "administrator" || value === "admin") {
    return "administrator";
  }

  if (
    value === "manager" ||
    value === "sustainability_manager" ||
    value === "sustainability manager"
  ) {
    return "manager";
  }

  if (
    value === "manufacturer" ||
    value === "manufacturing" ||
    value === "operator"
  ) {
    return "manufacturer";
  }

  if (
    value === "recycler" ||
    value === "recycling_facility" ||
    value === "recycling facility"
  ) {
    return "recycler";
  }

  return null;
}


/* =========================================================
   SECTION
========================================================= */

function Section({ children }) {
  return (
    <p className="mb-3 mt-7 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
      {children}
    </p>
  );
}


/* =========================================================
   SIDEBAR
========================================================= */

function Sidebar() {

  const navigate = useNavigate();

  const {
    user,
    role: storedRole,
  } = getStoredAuth();

  const role = normalizeRole(storedRole);


  /* =======================================================
     ROLE FLAGS
  ======================================================= */

  const isAdmin =
    role === "administrator";

  const isManager =
    role === "manager";

  const isManufacturer =
    role === "manufacturer";

  const isRecycler =
    role === "recycler";


  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = () => {

    clearAuth();

    navigate(
      "/login",
      {
        replace: true,
      }
    );

  };


  /* =======================================================
     DASHBOARD LABEL
  ======================================================= */

  const dashboardLabel =
    isAdmin
      ? "Admin Dashboard"
      : isManager
        ? "Sustainability Dashboard"
        : isRecycler
          ? "Recycling Dashboard"
          : "Manufacturer Dashboard";


  /* =======================================================
     USER DISPLAY
  ======================================================= */

  const displayName =
    user?.full_name ||
    user?.name ||
    user?.username ||
    "User";


  const displayRole =
    ROLE_LABELS[storedRole] ||
    ROLE_LABELS[role] ||
    "User";


  return (

    <aside className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col overflow-hidden bg-slate-900 text-white shadow-xl">


      {/* =====================================================
          BRAND
      ===================================================== */}

      <div className="shrink-0 border-b border-white/10 px-6 py-5">

        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="flex w-full items-center gap-3 text-left"
        >

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white shadow-lg">
            TW
          </div>


          <div className="min-w-0">

            <h1 className="truncate text-lg font-bold tracking-tight">
              TWIP
            </h1>

            <p className="mt-0.5 text-[10px] leading-4 text-slate-400">
              Textile Waste Intelligence Platform
            </p>

          </div>

        </button>

      </div>


      {/* =====================================================
          NAVIGATION
      ===================================================== */}

      <nav className="min-h-0 flex-1 overflow-y-auto px-4 py-5">


        {/* ===================================================
            MAIN
        =================================================== */}

        <Section>
          Main
        </Section>


        <SidebarItem
          to="/dashboard"
          icon={LayoutDashboard}
          label={dashboardLabel}
        />


        {/* ===================================================
            OPERATIONS
        =================================================== */}

        <Section>
          Operations
        </Section>


        {/* Waste Sources
            Backend/router currently permits:
            administrator
            manager
            manufacturer
        */}

        {(isAdmin ||
          isManager ||
          isManufacturer) && (

          <SidebarItem
            to="/waste-sources"
            icon={Factory}
            label="Waste Sources"
          />

        )}


        {/* Collections
            Currently permitted for all authenticated roles.
        */}

        <SidebarItem
          to="/collections"
          icon={Truck}
          label="Collections"
        />


        {/* Inventory
            Currently permitted for all authenticated roles.
        */}

        <SidebarItem
          to="/inventory"
          icon={Package}
          label="Inventory"
        />


        {/* ===================================================
            AI INTELLIGENCE
        =================================================== */}

        <Section>
          AI Intelligence
        </Section>


        {/* Manufacturer-oriented AI */}

        {(isAdmin ||
          isManager ||
          isManufacturer) && (

          <>

            <SidebarItem
              to="/image-analysis"
              icon={Image}
              label="Image Analysis"
            />

            <SidebarItem
              to="/material-classification"
              icon={Layers3}
              label="Material Intelligence"
            />

          </>

        )}


        {/* Recycler-oriented AI */}

        {(isAdmin ||
          isRecycler) && (

          <>

            <SidebarItem
              to="/waste-classification"
              icon={Recycle}
              label="Waste Intelligence"
            />

            <SidebarItem
              to="/recycling-engine"
              icon={BrainCircuit}
              label="AI Recycling Engine"
            />

          </>

        )}


        {/* ===================================================
            SUSTAINABILITY
        =================================================== */}

        <Section>
          Sustainability
        </Section>


        <SidebarItem
          to="/sustainability"
          icon={Leaf}
          label="Sustainability Intelligence"
        />


        {/* ===================================================
            ANALYTICS & REPORTING
        =================================================== */}

        <Section>
          Analytics & Reporting
        </Section>


        <SidebarItem
          to="/reports"
          icon={FileText}
          label="Reports & Exports"
        />


        {/* ===================================================
            ADMINISTRATION
        =================================================== */}

        {isAdmin && (

          <>

            <Section>
              Administration
            </Section>


            <SidebarItem
              to="/users"
              icon={Users}
              label="User Management"
            />

          </>

        )}


        {/* ===================================================
            SYSTEM
        =================================================== */}

        <Section>
          System
        </Section>


        <SidebarItem
          to="/notifications"
          icon={Bell}
          label="Notifications"
        />


        <SidebarItem
          to="/settings"
          icon={Settings}
          label="Settings"
        />


        {/* ===================================================
            ROLE INFORMATION
        =================================================== */}

        <div className="mt-7 rounded-xl border border-white/10 bg-white/5 p-3">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20 text-primary">

              {isAdmin && (
                <Users size={17} />
              )}

              {isManager && (
                <Leaf size={17} />
              )}

              {isManufacturer && (
                <Factory size={17} />
              )}

              {isRecycler && (
                <Recycle size={17} />
              )}

            </div>


            <div className="min-w-0">

              <p className="text-[10px] uppercase tracking-wide text-slate-500">
                Current Role
              </p>

              <p className="truncate text-xs font-semibold text-slate-200">
                {displayRole}
              </p>

            </div>

          </div>

        </div>

      </nav>


      {/* =====================================================
          USER FOOTER
      ===================================================== */}

      <div className="shrink-0 border-t border-white/10 bg-slate-900 px-4 py-4">

        <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/5 px-3 py-3">


          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">

            {displayName
              .charAt(0)
              .toUpperCase()}

          </div>


          <div className="min-w-0">

            <p className="truncate text-sm font-semibold text-white">
              {displayName}
            </p>


            <p className="truncate text-xs text-slate-400">
              {displayRole}
            </p>

          </div>

        </div>


        {/* =================================================
            LOGOUT
        ================================================= */}

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition duration-200 hover:bg-red-500/10 hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-400/30"
        >

          <LogOut size={19} />

          <span>
            Logout
          </span>

        </button>

      </div>

    </aside>

  );

}


export default Sidebar;