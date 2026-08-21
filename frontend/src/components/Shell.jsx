import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { api, ROLE_LABEL } from "../lib/api.js";
import {
  Bell, Box, Camera, Cog, FileText, Globe, Grid, Leaf, Logout, Menu, Search,
  Shield, Sparkle, Tag, Trend,
} from "./Icons.jsx";

const NAV = [
  { to: "/", label: "Dashboard", icon: Grid, end: true, blurb: "Facility overview" },
  { to: "/inventory", label: "Inventory", icon: Box, blurb: "Waste batch register" },
  { to: "/image-analysis", label: "Image Analysis", icon: Camera, blurb: "Upload and read a swatch" },
  { to: "/classification", label: "Classification", icon: Tag, blurb: "Material and waste classes" },
  { to: "/recommendations", label: "Recommendations", icon: Sparkle, blurb: "Recovery routes" },
  { to: "/sustainability", label: "Sustainability", icon: Trend, blurb: "Circularity and ESG" },
  { to: "/environmental", label: "Environmental", icon: Globe, blurb: "Impact analytics" },
  { to: "/reports", label: "Reports", icon: FileText, blurb: "Export PDF and Excel" },
  { to: "/settings", label: "Settings", icon: Cog, blurb: "Profile and preferences" },
];

const TITLES = Object.fromEntries(NAV.map((n) => [n.to, n]));

export default function Shell({ user, onSignOut }) {
  const [alerts, setAlerts] = useState([]);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const nav = user.role === "administrator"
    ? [...NAV.slice(0, 8), { to: "/admin", label: "Admin", icon: Shield, blurb: "Platform and models" }, NAV[8]]
    : NAV;

  useEffect(() => {
    api.notifications().then((n) => setAlerts(n.filter((x) => !x.read))).catch(() => {});
  }, []);
  useEffect(() => { setOpen(false); }, [location.pathname]);

  const current = TITLES[location.pathname]
    || (location.pathname.startsWith("/inventory") ? TITLES["/inventory"] : null)
    || { label: "Admin", blurb: "Platform and models" };

  return (
    <div className="h-screen overflow-hidden lg:grid lg:grid-cols-[264px_1fr]">
      {open && (
        <button className="fixed inset-0 z-30 bg-black/60 lg:hidden"
                onClick={() => setOpen(false)} aria-label="Close menu" />
      )}

      <aside className={`fixed inset-y-0 left-0 z-40 w-[264px] border-r border-line bg-surface
                         transition-transform lg:static lg:translate-x-0
                         ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-3 border-b border-line px-5 py-[18px]">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-[#04140E]">
              <Leaf className="h-5 w-5" />
            </span>
            <div className="leading-tight">
              <div className="font-display text-[15px] font-bold tracking-tight">TWIP</div>
              <div className="text-[11px] text-muted">Textile Waste Intelligence</div>
            </div>
          </div>

          <div className="px-4 pt-4">
            <div className="flex items-center gap-3 rounded-xl border border-line bg-panel px-3 py-2.5">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand/15
                               font-display text-sm font-bold text-brand">
                {user.full_name.slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0 leading-tight">
                <div className="truncate text-sm font-semibold">{user.full_name}</div>
                <div className="truncate text-[11px] text-muted">{ROLE_LABEL[user.role]}</div>
              </div>
            </div>
          </div>

          <nav className="mt-5 flex-1 overflow-y-auto px-3 pb-4" aria-label="Main menu">
            <p className="px-2 pb-2 eyebrow">Main menu</p>
            {nav.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end}
                className={({ isActive }) =>
                  `mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                   ${isActive
                     ? "bg-brand/12 text-brand shadow-[inset_0_0_0_1px_rgba(16,185,129,0.28)]"
                     : "text-muted hover:bg-panel-2 hover:text-ink"}`}>
                <Icon className="h-[18px] w-[18px] shrink-0" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-line p-3">
            <button onClick={onSignOut}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm
                         font-medium text-danger hover:bg-danger/10">
              <Logout className="h-[18px] w-[18px]" /> Logout
            </button>
          </div>
        </div>
      </aside>

      <div className="flex h-screen flex-col overflow-y-auto">
        <header className="sticky top-0 z-20 border-b border-line bg-surface/95 backdrop-blur">
          <div className="flex items-center gap-4 px-5 py-3">
            <button className="btn-ghost px-2 lg:hidden" onClick={() => setOpen(true)}
                    aria-label="Open menu"><Menu /></button>
            <div className="min-w-0">
              <h1 className="truncate font-display text-[17px] font-bold leading-tight">
                {current.label}
              </h1>
              <p className="truncate text-xs text-muted">{current.blurb}</p>
            </div>

            <div className="ml-auto flex items-center gap-3">
              <div className="relative hidden md:block">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                  <Search className="h-4 w-4" />
                </span>
                <input className="field field-icon w-56 py-2" placeholder="Search batches…"
                       aria-label="Search batches"
                       onKeyDown={(e) => {
                         if (e.key === "Enter" && e.currentTarget.value.trim()) {
                           window.location.assign(
                             `/inventory?q=${encodeURIComponent(e.currentTarget.value.trim())}`);
                         }
                       }} />
              </div>
              <div className="relative">
                <span className="grid h-9 w-9 place-items-center rounded-lg border border-line
                                 bg-panel text-muted"><Bell className="h-[18px] w-[18px]" /></span>
                {alerts.length > 0 && (
                  <span className="absolute -right-1 -top-1 grid h-5 min-w-[20px] place-items-center
                                   rounded-full bg-danger px-1 text-[10px] font-bold text-white">
                    {alerts.length}
                  </span>
                )}
              </div>
            </div>
          </div>

          {alerts.length > 0 && (
            <div className="flex items-center gap-3 border-t border-line px-5 py-2 text-sm">
              <span className="chip border-warn/40 text-warn">Alert</span>
              <span className="truncate">{alerts[0].title}</span>
              <button className="ml-auto shrink-0 text-xs text-brand hover:underline"
                      onClick={() => api.markRead(alerts[0].id).then(() => setAlerts(alerts.slice(1)))}>
                Dismiss
              </button>
            </div>
          )}
        </header>

        <main className="flex-1 px-5 py-6"><Outlet /></main>

        <footer className="px-5 pb-6 text-xs text-muted">
          Impact figures are modelled from published life-cycle ranges, not measured.
          Replace them with facility data before external reporting.
        </footer>
      </div>
    </div>
  );
}